import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, Video, MessageSquare, Hand, Wifi, WifiOff } from 'lucide-react';

const MeetingSession = () => {
    // 1. Get Session ID from URL (e.g., /meeting/session_1)
    const { sessionId } = useParams();
    
    // 2. State Management
    const [status, setStatus] = useState("disconnected"); // connected, disconnected
    const [transcripts, setTranscripts] = useState([]);
    const [users, setUsers] = useState(["You", "Bot"]); // Mock user list
    
    // Auto-scroll ref
    const scrollRef = useRef(null);

    // 3. WebSocket Connection Logic
    useEffect(() => {
        // For demo/testing: Use a demo token. In production, get from localStorage or AuthContext
        const token = localStorage.getItem('token') || 'demo_token_for_testing';
        
        // Connect to the backend WebSocket endpoint with JWT authentication
        const ws = new WebSocket(`ws://localhost:8000/ws/meeting/${sessionId || 'default_session'}?token=${token}`);

        ws.onopen = () => {
            setStatus("connected");
            console.log("✅ Connected to Meeting Server");
            
            // Send a ping to keep connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping" }));
                }
            }, 30000); // Every 30 seconds
            
            // Store interval to clear on cleanup
            ws.pingInterval = pingInterval;
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            console.log("📩 Received:", data); // Debug log

            // Handle initial connection confirmation
            if (data.type === "connected") {
                console.log("✅ Connection confirmed:", data.message);
                return;
            }
            
            // Handle pong response
            if (data.type === "pong") {
                return;
            }

            // HANDLE: Live Audio Transcript
            if (data.type === "transcript_update") {
                setTranscripts(prev => [...prev, {
                    id: Date.now(),
                    speaker: data.speaker || "Unknown",
                    text: data.text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
            
            // HANDLE: Bot Status Updates
            if (data.type === "bot_status") {
                console.log("🤖 Bot Status:", data.action);
            }
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        ws.onclose = () => {
            setStatus("disconnected");
            console.log("🔌 Disconnected from Meeting Server");
            
            // Clear ping interval
            if (ws.pingInterval) {
                clearInterval(ws.pingInterval);
            }
        };

        return () => {
            if (ws.pingInterval) {
                clearInterval(ws.pingInterval);
            }
            ws.close();
        };
    }, [sessionId]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcripts]);

    return (
        <div className="h-screen bg-slate-900 text-white flex flex-col font-sans">
            {/* --- TOP BAR --- */}
            <header className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <h1 className="text-xl font-bold tracking-wide">InclusiveMeet <span className="text-yellow-400">Pro</span></h1>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">ID: {sessionId}</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status === 'connected' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                        {status === 'connected' ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {status.toUpperCase()}
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT PANEL: Live Transcripts (The "Ear") */}
                <div className="flex-1 flex flex-col border-r border-slate-700 bg-slate-900/50">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-slate-400 text-sm font-semibold uppercase flex items-center gap-2">
                            <MessageSquare size={16} /> Live Transcripts
                        </h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {transcripts.length === 0 && (
                            <div className="text-center mt-20 text-slate-600">
                                <p>Waiting for conversation or signs...</p>
                            </div>
                        )}

                        {transcripts.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : 'items-start'}`}>
                                {msg.isSystem ? (
                                    <span className="bg-yellow-900/30 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-700/50 my-2">
                                        {msg.text}
                                    </span>
                                ) : (
                                    <div className="max-w-[80%]">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className={`font-bold text-sm ${msg.speaker === 'You' ? 'text-blue-400' : 'text-purple-400'}`}>
                                                {msg.speaker}
                                            </span>
                                            <span className="text-xs text-slate-600">{msg.time}</span>
                                        </div>
                                        <div className="bg-slate-800 p-3 rounded-r-lg rounded-bl-lg text-slate-200 leading-relaxed shadow-sm">
                                            {msg.text}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* RIGHT PANEL: Sign Status & Controls (The "Eye") */}
                <div className="w-96 bg-slate-800 flex flex-col">
                    
                    {/* Camera Placeholder / Sign Visualization */}
                    <div className="h-64 bg-black relative flex items-center justify-center border-b border-slate-700">
                        {/* In production, your Webcam Stream goes here */}
                        <div className="text-slate-600 flex flex-col items-center">
                            <Video size={48} className="mb-2 opacity-50" />
                            <span className="text-xs">Camera Feed Active</span>
                        </div>

                        {/* OVERLAY: The Sign Detection Badge */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-slate-900/90 backdrop-blur border border-slate-600 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${currentSign.word !== 'IDLE' ? 'bg-green-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                        <Hand size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Current Sign</p>
                                        <p className="text-lg font-bold tracking-wider text-white">
                                            {currentSign.word}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Conf.</p>
                                    <p className="text-sm font-mono text-green-400">{currentSign.confidence}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="p-6 flex-1">
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                                <Mic size={16} /> Unmute Mic
                            </button>
                            <button className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg text-sm font-medium transition">
                                Stop Bot
                            </button>
                        </div>

                        <div className="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                            <h4 className="text-yellow-400 text-xs font-bold mb-2">DEBUG INFO</h4>
                            <p className="text-xs text-slate-400 font-mono">
                                Session: {sessionId}<br/>
                                Bot Status: Active<br/>
                                Model: LSTM-v1 (Loaded)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingSession;
