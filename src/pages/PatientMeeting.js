import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Mic from "../components/Mic";

// Import shared recording utilities
import { startMicrophoneRecording, stopMicrophoneRecording, sendAudioToBackend } from "../utils/recordUtils";

export default function PatientMeeting() {
  const [sessionActive, setSessionActive] = useState(false); // Toggle session state
  const [transcripts, setTranscripts] = useState([]); // Store live transcripts
  const [recorder, setRecorder] = useState(null); // MediaRecorder instance
  const [uploadTimer, setUploadTimer] = useState(null); // Timer for periodic uploads
  const [startTime, setStartTime] = useState(null); // Timestamp for session start
  const audioBuffer = []; // Buffer to hold audio chunks temporarily

  // Fetch example user and meeting data dynamically
  const meetingId = localStorage.getItem("meetingId") || "12345"; // Replace with actual dynamic logic
  const role = "Patient"; // Define user role dynamically if needed

  const addTranscript = (line) => setTranscripts((prev) => [...prev, line]); // Append transcript lines to list

  // Handle WebSocket for Live Transcripts
  useEffect(() => {
    let ws;
    if (sessionActive) {
      ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server URL
      ws.onmessage = (event) => addTranscript(event.data); // Push incoming message to transcript
    }

    return () => {
      if (ws) ws.close(); // Cleanup WebSocket connection
    };
  }, [sessionActive]);

  // **Start Recording Logic using Utils**
  const startRecording = () => {
    startMicrophoneRecording({
      setRecorder,
      setStartTime,
      setUploadTimer,
      audioBuffer,
      sendAudioToBackend: (chunk, timestamp) =>
        sendAudioToBackend(chunk, timestamp, meetingId, role), // Pass meetingId and role dynamically
    });
    console.log("Started audio recording for Patient.");
  };

  // **Stop Recording Logic using updated Utils**
  const stopRecording = async () => {
    stopMicrophoneRecording({
      recorder,
      audioBuffer,
      setUploadTimer,
      sendAudioToBackend: (chunk, timestamp) =>
        sendAudioToBackend(chunk, timestamp, meetingId, role), // Pass meetingId and role dynamically
      startTime,
    });
    console.log("Stopped audio recording for Patient.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="flex flex-1 w-full p-6 gap-6">
        {/* Center - Mic */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Mic active={sessionActive} />
        </div>

        {/* Right - Transcript */}
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
        </div>
      </div>

      <Footer
        onStart={() => {
          setSessionActive(true); // Activate session
          startRecording(); // Start recording
        }}
        onStop={() => {
          setSessionActive(false); // Deactivate session
          stopRecording(); // Stop recording and cleanup
        }}
        onSummary={() => alert("Summary is available only for doctors.")}
      />
    </div>
  );
}