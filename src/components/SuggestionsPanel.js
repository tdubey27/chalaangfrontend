import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaRandom, FaEdit } from "react-icons/fa";

export default function SuggestionsPanel({ suggestions, addNote }) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const [localSuggestions, setLocalSuggestions] = useState(
    safeSuggestions.map((q) => ({ text: q, isEditing: false }))
  );

  useEffect(() => {
    setLocalSuggestions(
      Array.isArray(suggestions)
        ? suggestions.map((q) => ({ text: q, isEditing: false }))
        : []
    );
  }, [suggestions]);

  const acceptQuestion = (index) => {
    addNote(localSuggestions[index].text);
  };

  const swapQuestion = (index) => {
    const newQuestion = "What is my policy limit?"; // Replace with dynamic logic
    setLocalSuggestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, text: newQuestion, isEditing: false } : q
      )
    );
  };

  const toggleEdit = (index) => {
    setLocalSuggestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, isEditing: !q.isEditing } : q
      )
    );
  };

  const editQuestion = (index, newValue) => {
    setLocalSuggestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text: newValue } : q))
    );
  };

  return (
    <div className="hidden md:flex flex-col w-1/4 h-full gap-4">
      <h2 className="text-xl font-bold mb-3 text-[#582CDB] flex items-center gap-2">
        💡 Suggested Questions
      </h2>

      {localSuggestions.length > 0 ? (
        localSuggestions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(149,115,247,0.2)] 
                       hover:shadow-[0_4px_12px_rgba(149,115,247,0.4)] transition flex flex-col gap-2 p-4"
          >
            {q.isEditing ? (
              <input
                type="text"
                value={q.text}
                onChange={(e) => editQuestion(idx, e.target.value)}
                className="w-full border border-gray-200 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            ) : (
              <p className="text-gray-800">{q.text}</p>
            )}

            <div className="flex gap-3 justify-end text-xl">
              <FaEdit
                onClick={() => toggleEdit(idx)}
                className="text-indigo-500 hover:text-indigo-600 cursor-pointer transition"
                title={q.isEditing ? "Finish Editing" : "Edit"}
              />
              <FaCheckCircle
                onClick={() => acceptQuestion(idx)}
                className="text-green-500 hover:text-green-600 cursor-pointer transition"
                title="Accept"
              />
              <FaRandom
                onClick={() => swapQuestion(idx)}
                className="text-purple-500 hover:text-purple-600 cursor-pointer transition"
                title="Swap"
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 italic">No suggestions available.</p>
      )}
    </div>
  );
}