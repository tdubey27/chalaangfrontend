import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Mic from "../components/Mic";
import SuggestionsPanel from "../components/SuggestionsPanel";

export default function DoctorMeeting() {
  const [sessionActive, setSessionActive] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);


  const suggestions = [
    "What is my current claim status?",
    "How long will processing take?",
    "Can I upload documents online?",
    "Do I need to provide additional info?",
  ];

  const addNote = (note) => setMeetingNotes((prev) => [...prev, note]);
  const addTranscript = (line) => setTranscripts((prev) => [...prev, line]);

  useEffect(() => {
    let ws;
    if (sessionActive) {
      ws = new WebSocket("ws://localhost:8080");
      ws.onmessage = (event) => addTranscript(event.data);
    }
    return () => {
      if (ws) ws.close();
    };
  }, [sessionActive]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="flex flex-1 w-full p-6 gap-6">
        {/* Left - Suggestions */}
        <SuggestionsPanel suggestions={suggestions} addNote={addNote} />

        {/* Center - Mic */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Mic active={sessionActive} />
        </div>

        {/* Right - Transcript + Meeting Notes button */}
        <div className="w-1/4 flex flex-col items-stretch gap-3">
          <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-60">
            <h2 className="text-lg font-bold text-[#582CDB] mb-2">
              Live Transcript
            </h2>
            {transcripts.length === 0 ? (
              <p className="text-gray-400 italic">No transcript yet...</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {transcripts.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => setNotesOpen(true)}
            className="px-4 py-2 bg-purple-500 text-white font-bold rounded-lg shadow-lg hover:bg-purple-600 transition"
          >
            View Meeting Notes
          </button>
        </div>
      </div>

      <Footer
        onStart={() => setSessionActive(true)}
        onStop={() => setSessionActive(false)}
        onSummary={() => alert("Summary feature coming soon!")}
      />

      {/* Meeting Notes Modal */}
      {notesOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-[#582CDB] flex items-center gap-2">
              📝 Meeting Notes
            </h2>
            {meetingNotes.length === 0 ? (
              <p className="text-gray-400 italic">No notes yet...</p>
            ) : (
              <ul className="space-y-2 list-disc list-inside">
                {meetingNotes.map((note, idx) => (
                  <li key={idx} className="text-gray-800">
                    {note}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setNotesOpen(false)}
              className="mt-4 px-4 py-2 bg-purple-400 hover:bg-purple-500 text-white font-bold rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
