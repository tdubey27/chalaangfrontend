import React, { useState, useEffect } from "react";

// Mic Button Component
const Mic = ({ active }) => (
  <div className="flex justify-center items-center">
    <div
      className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all ${
        active
          ? "bg-red-500 animate-pulse text-white shadow-red-400/70"
          : "bg-gray-300 text-gray-800 hover:bg-gray-400"
      }`}
    >
      🎙️
    </div>
  </div>
);

export default function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [summary, setSummary] = useState("");
  const [suggestions, setSuggestions] = useState([
    "What is my current claim status?",
    "How long will processing take?",
    "Can I upload documents online?",
    "Do I need to provide additional information?",
  ]);

  useEffect(() => {
    let ws;
    if (sessionActive) {
      ws = new WebSocket("ws://localhost:8080"); // replace with your backend WS URL

      ws.onmessage = (event) => {
        const data = event.data;
        if (data.startsWith("SUMMARY:")) {
          setSummary(data.replace("SUMMARY:", ""));
        } else {
          setTranscripts((prev) => [...prev, data]);
        }
      };

      ws.onclose = () => console.log("WebSocket closed");
    }

    return () => {
      if (ws) ws.close();
    };
  }, [sessionActive]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-100 to-white p-6 gap-6">
      {/* Suggestions Panel */}
      <div className="w-full md:w-1/4 bg-white shadow-2xl rounded-3xl p-6 sticky top-6 h-fit">
        <h2 className="text-2xl font-bold mb-5 text-blue-700 flex items-center gap-2">
          💡 Suggested Questions
        </h2>
        <div className="flex flex-col gap-4">
          {suggestions.map((q, idx) => (
            <div
              key={idx}
              className="bg-blue-50 p-4 rounded-xl shadow-md hover:bg-blue-100 cursor-pointer transition"
              onClick={() =>
                setTranscripts((prev) => [...prev, `User asked: ${q}`])
              }
            >
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* Mic Panel */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/4">
        <Mic active={sessionActive} />
        <button
          onClick={() => {
            setSessionActive(!sessionActive);
            if (!sessionActive) {
              setTranscripts([]);
              setSummary("");
            }
          }}
          className={`mt-6 px-10 py-4 rounded-full font-bold shadow-lg text-lg transition-all ${
            sessionActive
              ? "bg-red-500 text-white hover:bg-red-600 shadow-red-400/70"
              : "bg-green-500 text-white hover:bg-green-600 shadow-green-400/70"
          }`}
        >
          {sessionActive ? "Stop Session" : "Start Session"}
        </button>
      </div>

      {/* Transcript Panel */}
      <div className="flex-1 flex flex-col w-full md:w-1/2">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4 text-center md:text-left">
          Live Transcript
        </h1>

        <div className="w-full bg-white shadow-2xl rounded-3xl p-6 h-[500px] overflow-y-auto">
          {transcripts.length === 0 && (
            <p className="text-gray-400 italic">No transcript yet...</p>
          )}
          <div className="space-y-3">
            {transcripts.map((line, idx) => (
              <div
                key={idx}
                className="bg-blue-50 p-3 rounded-xl shadow-sm animate-slideFade"
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="mt-6 w-full bg-blue-50 border-l-4 border-blue-400 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-3 text-blue-800 flex items-center gap-3">
              🤖 AI Summary
            </h2>
            <p className="text-gray-800">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}