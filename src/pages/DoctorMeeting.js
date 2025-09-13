import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Mic from "../components/Mic";
import SuggestionsPanel from "../components/SuggestionsPanel";

export default function DoctorMeeting() {
  const [sessionActive, setSessionActive] = useState(false); // Toggle session state
  const [meetingNotes, setMeetingNotes] = useState([]); // Notes from the meeting
  const [transcripts, setTranscripts] = useState([]); // Live transcripts received
  const [notesOpen, setNotesOpen] = useState(false); // Meeting notes modal visibility
  const [uploadTimer, setUploadTimer] = useState(null); // Timer for periodic uploads
  const [startTime, setStartTime] = useState(null); // Timestamp for session start
  const [recorder, setRecorder] = useState(null); // MediaRecorder instance
  let audioBuffer = []; // Local buffer for audio chunks

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
      ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket backend URL
      ws.onmessage = (event) => addTranscript(event.data);
    }
    return () => {
      if (ws) ws.close();
    };
  }, [sessionActive]);

  // Start recording function
  const startRecording = async () => {
    try {
      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone stream obtained:", stream);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      setRecorder(mediaRecorder);

      const initialTimestamp = Date.now();
      setStartTime(initialTimestamp); // Save session start timestamp

      console.log("Recording started...");
      audioBuffer = []; // Clear buffer

      // Collect audio chunks into the local buffer
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioBuffer.push(event.data); // Push audio chunk into buffer
          console.log("Audio chunk collected:", event.data); // Debug log
        }
      };

      mediaRecorder.start(500); // Start recording, collecting data every 500ms

      // Set periodic uploads every 1 second
      const interval = setInterval(() => {
        if (audioBuffer.length > 0) {
          const chunk = audioBuffer.shift(); // Extract the first chunk
          const timestamp = Date.now() - initialTimestamp; // Calculate elapsed time
          sendAudioToBackend(chunk, timestamp); // Send chunk to backend
        } else {
          console.log("Audio buffer empty, waiting for chunks...");
        }
      }, 1000); // Upload every 1 second

      setUploadTimer(interval); // Save interval reference for stopping later
    } catch (error) {
      console.error("Error starting microphone recording:", error);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // Stop the MediaRecorder

      recorder.onstop = async () => {
        console.log("Recorder stopped. Uploading remaining audio chunks...");
        for (const chunk of audioBuffer) {
          const timestamp = Date.now() - startTime; // Calculate timestamp for remaining chunks
          await sendAudioToBackend(chunk, timestamp); // Send remaining chunks
        }
        audioBuffer = []; // Clear the buffer
      };
    }

    if (uploadTimer) {
      clearInterval(uploadTimer); // Clear periodic timer
      setUploadTimer(null);
    }

    console.log("Recording stopped.");
  };

  // Function to send audio blob and timestamp to the backend
  const sendAudioToBackend = async (chunk, timestamp) => {
    try {
      // Retrieve meetingId and role from localStorage
      const meetingId = localStorage.getItem("meetingId");
      const role = localStorage.getItem("role");

      if (!meetingId || !role) {
        console.error("Meeting ID or Role is missing from localStorage!");
        return;
      }

      // Convert audio chunk into WAV format
      const audioBlob = new Blob([chunk], { type: "audio/wav" });

      const formData = new FormData();
      formData.append("audioBlob", audioBlob); // Attach audio Blob
      formData.append("timestamp", timestamp.toString()); // Attach timestamp
      formData.append("meetingId", meetingId); // Attach meeting ID
      formData.append("role", role); // Attach role

      const response = await fetch("http://localhost:8080/upload-audio-chunk", {
        method: "POST",
        body: formData, // Sends audio blob, timestamp, meeting ID, and role
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Response from backend:", data);

        // Add transcripts and summary dynamically if present in response
        if (data.transcript) {
          setTranscripts((prev) => [...prev, data.transcript]);
        }
        if (data.summary) {
          console.log("Summary received:", data.summary);
        }
      } else {
        throw new Error(`Audio upload failed with status: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error uploading audio chunk:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="flex flex-1 w-full p-6 gap-6">
        {/* Suggestions Panel */}
        <SuggestionsPanel suggestions={suggestions} addNote={addNote} />

        {/* Center Panel - Mic */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Mic active={sessionActive} />
        </div>

        {/* Transcript + Meeting Notes Buttons */}
        <div className="w-1/4 flex flex-col items-stretch gap-3">
          <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-60">
            <h2 className="text-lg font-bold text-[#582CDB] mb-2">Live Transcript</h2>
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
        onStart={() => {
          setSessionActive(true); // Activate session
          startRecording(); // Start the recording
        }}
        onStop={() => {
          setSessionActive(false); // Deactivate session
          stopRecording(); // Stop the recording
        }}
        onSummary={() => alert("Summary feature is coming soon!")}
      />

      {/* Modal for Meeting Notes */}
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