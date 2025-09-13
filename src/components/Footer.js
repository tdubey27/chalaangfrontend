import React from "react";
import { useNavigate } from "react-router-dom";

export default function Footer({ onStart, onStop, onSummary }) {
  const navigate = useNavigate();

  const endSession = () => {
    localStorage.clear();
    navigate("/"); // back to Dashboard
  };

  return (
    <footer className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <div className="text-sm text-gray-500">© 2025 Insurance Meeting</div>

      <div className="flex gap-3">
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-xl bg-[#9D7BFF] text-white font-semibold shadow-md hover:bg-[#875CFF] transition"
        >
          Start
        </button>
        <button
          onClick={onStop}
          className="px-5 py-2 rounded-xl bg-[#B89CFF] text-white font-semibold shadow-md hover:bg-[#9D7BFF] transition"
        >
          Stop
        </button>
        <button
          onClick={onSummary}
          className="px-5 py-2 rounded-xl bg-[#A785FF] text-white font-semibold shadow-md hover:bg-[#8F67FF] transition"
        >
          Summary
        </button>
        <button
          onClick={endSession}
          className="px-5 py-2 rounded-xl bg-[#CBB5FF] text-white font-semibold shadow-md hover:bg-[#A785FF] transition"
        >
          End Session
        </button>
      </div>
    </footer>
  );
}
