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

  console.log(suggestions,"sss")

  return (
    <div className="hidden md:flex flex-col w-1/4 max-h-[80vh] overflow-y-auto gap-4">
      <h2 className="text-xl font-bold mb-3 text-[#582CDB] flex items-center gap-2">
        💡 Suggested Questions
      </h2>

      {Array.isArray(suggestions) && suggestions.length > 0 ? (
  suggestions
    .filter((s) => s.prompt_question)
    .map((s, idx) => (
      <div
        key={idx}
        className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(149,115,247,0.2)] 
                   hover:shadow-[0_4px_12px_rgba(149,115,247,0.4)] transition flex flex-col gap-3 p-4"
      >
        {/* Optional: show problem_area as context */}
        <p className="text-sm text-gray-500 italic mb-2">{s.problem_area}</p>

        {s.clarifying_questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="flex justify-between items-center bg-gray-50 rounded-md p-2"
          >
            <p className="text-gray-800">{q}</p>
            <div className="flex gap-3 text-xl">
              <FaEdit
                onClick={() => toggleEdit(`${idx}-${qIdx}`)}
                className="text-indigo-500 hover:text-indigo-600 cursor-pointer transition"
                title="Edit"
              />
              <FaCheckCircle
                onClick={() => addNote(q)}
                className="text-green-500 hover:text-green-600 cursor-pointer transition"
                title="Accept"
              />
              <FaRandom
                onClick={() => swapQuestion(`${idx}-${qIdx}`)}
                className="text-purple-500 hover:text-purple-600 cursor-pointer transition"
                title="Swap"
              />
            </div>
          </div>
        ))}
      </div>
    ))
) : (
  <p className="text-gray-400 italic">No suggestions available.</p>
)}

    </div>
  );
}
