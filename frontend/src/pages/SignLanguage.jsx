import { useState } from 'react';
import { Hand, Download, Copy, CheckCircle, Info } from 'lucide-react';
import SignLanguageDetector from '../components/live-session/SignLanguageDetector';

const SignLanguage = () => {
  const [detectedHistory, setDetectedHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleGestureDetected = (gesture, fullText) => {
    const timestamp = new Date().toLocaleTimeString();
    setDetectedHistory(prev => [
      { gesture, timestamp, fullText },
      ...prev.slice(0, 49) // Keep last 50 entries
    ]);
  };

  const handleCopyText = async () => {
    if (detectedHistory.length > 0) {
      const latestText = detectedHistory[0].fullText;
      try {
        await navigator.clipboard.writeText(latestText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownloadHistory = () => {
    const content = detectedHistory
      .map(entry => `[${entry.timestamp}] ${entry.gesture}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-language-history-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setDetectedHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Hand className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sign Language Detection
              </h1>
              <p className="text-gray-600">
                Real-time ASL recognition powered by MediaPipe
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Phase 5 Feature - Client-Side Processing</p>
              <p>
                All video processing happens in your browser using Google MediaPipe. 
                No video is sent to the server, ensuring privacy and reducing server load.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Detection Area */}
          <div className="lg:col-span-2">
            <SignLanguageDetector
              onGestureDetected={handleGestureDetected}
              isActive={true}
            />
          </div>

          {/* Sidebar - History & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCopyText}
                  disabled={detectedHistory.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Text
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadHistory}
                  disabled={detectedHistory.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download History
                </button>

                <button
                  onClick={clearHistory}
                  disabled={detectedHistory.length === 0}
                  className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* Detection History */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Detection History</h3>
                <span className="text-sm text-gray-500">
                  {detectedHistory.length} gesture{detectedHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {detectedHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No gestures detected yet
                  </p>
                ) : (
                  detectedHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {entry.gesture}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            Gesture: {entry.gesture}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            {detectedHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Session Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Gestures</span>
                    <span className="text-lg font-bold text-blue-600">
                      {detectedHistory.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Text Length</span>
                    <span className="text-lg font-bold text-green-600">
                      {detectedHistory[0]?.fullText.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Detection</span>
                    <span className="text-sm font-medium text-gray-800">
                      {detectedHistory[0]?.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Supported Gestures */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Supported Gestures</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Letters</div>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D', 'F', 'I', 'L', 'O', 'V', 'Y'].map(letter => (
                      <span
                        key={letter}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Numbers</div>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '5'].map(num => (
                      <span
                        key={num}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguage;
