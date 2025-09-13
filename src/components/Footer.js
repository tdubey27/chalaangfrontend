import React from "react";

export default function Footer({ onStart, onStop, onSummary }) {
  return (
    <footer className="w-full bg-white shadow-inner sticky bottom-0 z-50 p-4 flex justify-end items-center gap-4 border-t border-gray-200">
      
      {/* Summary Button */}
      <button
        onClick={onSummary}
        className="px-6 py-3 rounded-full bg-purple-400 text-white font-bold shadow-lg hover:bg-purple-500 transition"
      >
        Summary
      </button>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="px-6 py-3 rounded-full bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 transition"
      >
        Start
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="px-6 py-3 rounded-full bg-purple-400 text-white font-bold shadow-lg hover:bg-purple-500 transition"
      >
        Stop
      </button>

    </footer>
  );
}
