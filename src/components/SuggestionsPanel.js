import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaRandom, FaEdit } from "react-icons/fa";

export default function SuggestionsPanel({ suggestions, addNote }) {
  // Debug incoming prop
  useEffect(() => {
    console.debug("Suggestions prop changed:", suggestions);
  }, [suggestions]);

  // Normalizer: accept many shapes
  const normalizeSuggestions = (input) => {
    if (!input) return [];
    // if a single object with clarifying_questions, normalize to array
    if (!Array.isArray(input) && typeof input === "object") {
      input = [input];
    }
    if (!Array.isArray(input)) return [];

    return input.flatMap((item) => {
      // already a string
      if (typeof item === "string") return [item];

      // item is an object: common shapes:
      // 1) { prompt_question: true, clarifying_questions: [...] }
      // 2) { clarifying_questions: [...] } (no prompt_question flag)
      // 3) { question: "..." } or { text: "..." }
      if (item && typeof item === "object") {
        if (Array.isArray(item.clarifying_questions) && item.clarifying_questions.length) {
          return item.clarifying_questions.filter(Boolean);
        }
        if (item.prompt_question && Array.isArray(item.clarifying_questions)) {
          return item.clarifying_questions.filter(Boolean);
        }
        if (typeof item.question === "string" && item.question.trim()) return [item.question];
        if (typeof item.text === "string" && item.text.trim()) return [item.text];
      }
      return [];
    });
  };

  const [localSuggestions, setLocalSuggestions] = useState(() =>
    normalizeSuggestions(suggestions).map((q) => ({ text: q, isEditing: false }))
  );

  useEffect(() => {
    setLocalSuggestions(
      normalizeSuggestions(suggestions).map((q) => ({ text: q, isEditing: false }))
    );
  }, [suggestions]);

  // actions
  const acceptQuestion = (index) => {
    const txt = localSuggestions[index]?.text;
    if (txt) addNote(txt);
  };

  const swapQuestion = (index) => {
    const newQuestion = "What is my policy limit?"; // TODO: dynamic
    setLocalSuggestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text: newQuestion, isEditing: false } : q))
    );
  };

  const toggleEdit = (index) =>
    setLocalSuggestions((prev) => prev.map((q, i) => (i === index ? { ...q, isEditing: !q.isEditing } : q)));

  const editQuestion = (index, newValue) =>
    setLocalSuggestions((prev) => prev.map((q, i) => (i === index ? { ...q, text: newValue } : q)));

  // quick debug to inspect localSuggestions in console during dev
  useEffect(() => {
    console.debug("localSuggestions:", localSuggestions);
  }, [localSuggestions]);

  return (
    <div className="hidden md:flex flex-col w-1/4 h-full gap-4">
      <h2 className="text-xl font-bold mb-3 text-[#582CDB] flex items-center gap-2">
        💡 Suggested Questions
      </h2>

      {suggestions.length > 0 ? (
        suggestions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(149,115,247,0.2)] 
                       hover:shadow-[0_4px_12px_rgba(149,115,247,0.4)] transition flex flex-col gap-2 p-4"
          >
            {q.isEditing ? (
              <input
                type="text"
                value={q.clarifying_questions[0]}
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
