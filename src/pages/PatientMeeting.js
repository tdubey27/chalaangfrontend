import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Mic from "../components/Mic";

export default function PatientMeeting() {
  const [sessionActive, setSessionActive] = useState(false);
  const [transcripts, setTranscripts] = useState([]); // Store live transcripts
  const [recorder, setRecorder] = useState(null); // MediaRecorder instance
  const [uploadTimer, setUploadTimer] = useState(null); // Timer for periodic uploads
  const [startTime, setStartTime] = useState(null); // Timestamp for session start
  const audioBuffer = []; // Buffer to hold audio chunks temporarily

  // Example user and meeting data (dynamic in real-world use cases):
  const meetingId = localStorage.getItem("meetingId") || "12345"; // Replace with `localStorage` logic
  const role = "Patient"; // Set `role` dynamically if needed

  const addTranscript = (line) => setTranscripts((prev) => [...prev, line]); // Append transcript lines to list

  // Handle WebSocket for Transcripts
  useEffect(() => {
    let ws;
    if (sessionActive) {
      ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket URL
      ws.onmessage = (event) => addTranscript(event.data);
    }

    return () => {
      if (ws) ws.close(); // Cleanup WebSocket connection
    };
  }, [sessionActive]);

  // **Start Recording** Functionality
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone stream obtained:", stream);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      setRecorder(mediaRecorder); // Save MediaRecorder instance for later use

      const sessionStartTime = Date.now(); // Start time to calculate elapsed timestamps
      setStartTime(sessionStartTime);

      console.log("Recording started...");
      audioBuffer.length = 0; // Clear audio buffer

      // Collect audio chunks into the buffer
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioBuffer.push(event.data); // Add chunk to buffer
          console.log("Audio chunk collected:", event.data);
        }
      };

      mediaRecorder.start(500); // Start recording with data collection every 500ms

      // Set periodic upload every 1 second
      const interval = setInterval(() => {
        if (audioBuffer.length > 0) {
          const chunk = audioBuffer.shift(); // Remove the first chunk
          const timestamp = Date.now() - sessionStartTime; // Calculate elapsed time
          sendAudioToBackend(chunk, timestamp); // Upload audio chunk
        } else {
          console.log("Audio buffer empty...");
        }
      }, 1000); // Upload every 1 second

      setUploadTimer(interval); // Save the interval for stopping later
    } catch (err) {
      console.error("Error starting microphone recording:", err);
    }
  };

  // **Stop Recording** Functionality
const stopRecording = () => {
  try {
    if (recorder) {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
      recorder.ondataavailable = null; // 🚫 disable callback
      setRecorder(null);
    }

    if (uploadTimer) {
      clearInterval(uploadTimer); // 🚫 stop periodic uploads
      setUploadTimer(null);
    }

    audioBuffer.current = []; // 🚫 clear buffer so nothing is sent
    console.log("✅ Recording stopped and uploads halted.");
  } catch (err) {
    console.error("Error stopping recording:", err);
  }
};


  // **Send Audio to Backend** Functionality
  const sendAudioToBackend = async (chunk, timestamp) => {
    try {
      // Convert audio chunk to WAV format
      const audioBlob = new Blob([chunk], { type: "audio/wav" });

      const formData = new FormData();
      formData.append("audioBlob", audioBlob); // Attach WAV audio Blob
      formData.append("timestamp", timestamp.toString()); // Attach timestamp
      formData.append("meetingId", meetingId); // Attach meeting ID
      formData.append("role", role); // Attach role

      const response = await fetch("http://localhost:8001/api/v1/transcribe", {
        method: "POST",
        body: formData, // Send FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.statusText}`);
      }

      console.log("Audio chunk uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload audio chunk:", error);
    }
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
        </div>
      </div>

      <Footer
        onStart={() => {
          setSessionActive(true); // Activate session
          startRecording(); // Start recording
        }}
        onStop={() => {
          setSessionActive(false); // Deactivate session
          stopRecording(); // Stop recording
        }}
        onSummary={() => alert("Summary is available only for doctors.")}
      />
    </div>
  );
} 
