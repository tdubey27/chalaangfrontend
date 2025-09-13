import React from "react";

export default function TranscriptPanel({ transcripts }) {
  return (
    <div className="flex flex-col w-1/4 h-full gap-4 ml-auto">
      <h2 className="text-xl font-bold mb-3 text-[#582CDB] flex items-center gap-2">
        📝 Live Transcript
      </h2>
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto">
        {transcripts.length === 0 ? (
          <p className="text-gray-400 italic">No transcript yet...</p>
        ) : (
          <div className="space-y-3">
            {transcripts.map((line, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-3 rounded-xl shadow-sm animate-slideFade"
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
