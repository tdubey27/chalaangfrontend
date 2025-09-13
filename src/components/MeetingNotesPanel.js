import React from "react";

export default function MeetingNotesPanel({ notes = [] }) {
  return (
    <div className="flex flex-col w-1/4 h-full gap-4">
      <h2 className="text-xl font-bold mb-3 text-[#582CDB] flex items-center gap-2">
        📝 Meeting Notes
      </h2>
      <div className="flex-1 bg-white rounded-2xl shadow-[0_2px_6px_rgba(149,115,247,0.2)] p-4 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-gray-400 italic">No notes yet...</p>
        ) : (
          <ul className="space-y-2 list-disc list-inside">
            {notes.map((note, idx) => (
              <li key={idx} className="text-gray-800">
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
