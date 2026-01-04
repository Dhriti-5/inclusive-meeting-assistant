/**
 * Custom React Hook for WebSocket connections
 * Manages real-time communication with backend meeting updates
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (meetingId, token, options = {}) => {
  const {
    onTranscript = () => {},
    onStatus = () => {},
    onSummary = () => {},
    onSignDetected = () => {},
    onError = () => {},
    onConnected = () => {},
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Store callbacks in refs to avoid recreating connect function
  const callbacksRef = useRef({
    onTranscript,
    onStatus,
    onSummary,
    onSignDetected,
    onError,
    onConnected,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onTranscript,
      onStatus,
      onSummary,
      onSignDetected,
      onError,
      onConnected,
    };
  }, [onTranscript, onStatus, onSummary, onSignDetected, onError, onConnected]);

  const connect = useCallback(() => {
    if (!meetingId) {
      console.warn('Cannot connect WebSocket: missing meetingId');
      return;
    }

    // Get real JWT token from localStorage
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      console.warn('Cannot connect WebSocket: no authentication token');
      return;
    }

    // Don't create a new connection if one already exists and is connecting/open
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      console.log('⚠️ WebSocket already connected or connecting, skipping...');
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');

    // Create WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = '8000'; // Backend port
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/meeting/${meetingId}?token=${authToken}`;

    console.log(`📡 Connecting to WebSocket: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      callbacksRef.current.onConnected();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data);

        switch (data.type) {
          case 'connected':
            console.log('🎉 Connection confirmed:', data.message);
            break;

          case 'transcript':
            // New transcript segment received
            callbacksRef.current.onTranscript(data.segment);
            break;

          case 'status':
            // Status update (processing, completed, etc.)
            callbacksRef.current.onStatus(data.status, data.details);
            break;

          case 'summary':
            // Meeting summary and action items
            callbacksRef.current.onSummary(data.summary, data.action_items);
            break;

          case 'error':
            // Error notification
            console.error('❌ WebSocket error:', data.error);
            callbacksRef.current.onError(data.error);
            break;

          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
      callbacksRef.current.onError('WebSocket connection error');
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');

      // Attempt reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('❌ Max reconnection attempts reached');
        setConnectionStatus('failed');
      }
    };
  }, [meetingId, token]); // Removed callbacks from dependencies

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, []);

  // Keepalive ping
  useEffect(() => {
    if (!isConnected || !wsRef.current) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
        console.log('🏓 Keepalive ping sent');
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && meetingId) {
      connect();
    }

    // Cleanup only on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [meetingId]); // Only re-connect if meetingId changes

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
  };
};

export default useWebSocket;
