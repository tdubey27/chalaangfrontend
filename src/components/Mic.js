import React from "react";
import { FaMicrophone } from "react-icons/fa";

export default function Mic({ active }) {
  return (
    <div className="flex justify-center items-center">
      <div
  className={`w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center text-5xl transition-all ${
    active
      ? "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 animate-pulse text-white shadow-[0_0_20px_rgba(149,115,247,0.6)]"
      : "bg-gradient-to-r from-purple-200 via-purple-300 to-purple-400 text-gray-800 hover:bg-gradient-to-r hover:from-purple-300 hover:via-purple-400 hover:to-purple-500 shadow-[0_4px_6px_rgba(149,115,247,0.3)]"
  }`}
>
  <FaMicrophone />
</div>

    </div>
  );
}
