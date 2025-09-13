import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Mic from "../components/Mic";
import { startMicrophoneRecording, stopMicrophoneRecording, sendAudioToBackend } from "../utils/recordUtils";

export default function PatientMeeting() {
  const [sessionActive, setSessionActive] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const recorderRef = useRef(null); // <-- useRef for recorder
  const uploadTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioBufferRef = useRef([]); // <-- useRef for buffer

  const meetingId = localStorage.getItem("meetingId") || "12345";
  const role = "Patient";

  const addTranscript = (line) => setTranscripts((prev) => [...prev, line]);

  // WebSocket for live transcript
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

  // Start recording
  const startRecording = () => {
    startMicrophoneRecording({
      setRecorder: (rec) => (recorderRef.current = rec),
      setStartTime: (time) => (startTimeRef.current = time),
      setUploadTimer: (timer) => (uploadTimerRef.current = timer),
      audioBuffer: audioBufferRef.current,
      sendAudioToBackend: (chunk, timestamp) =>
        sendAudioToBackend(chunk, timestamp, meetingId, role),
    });
    console.log("Started audio recording for Patient.");
  };

  // Stop recording
  const stopRecording = async () => {
    stopMicrophoneRecording({
      recorder: recorderRef.current,
      audioBuffer: audioBufferRef.current,
      setUploadTimer: (timer) => clearInterval(timer || uploadTimerRef.current),
      sendAudioToBackend: (chunk, timestamp) =>
        sendAudioToBackend(chunk, timestamp, meetingId, role),
      startTime: startTimeRef.current,
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
          setSessionActive(true);
          startRecording();
        }}
        onStop={() => {
          setSessionActive(false);
          stopRecording();
        }}
        onSummary={() => alert("Summary is available only for doctors.")}
      />
    </div>
  );
}
