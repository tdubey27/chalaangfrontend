import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Mic from "../components/Mic";
import SuggestionsPanel from "../components/SuggestionsPanel";

export default function DoctorMeeting() {
  const [sessionActive, setSessionActive] = useState(false); // Toggle session state
  const [meetingNotes, setMeetingNotes] = useState([]); // Notes from the meeting
  const [transcripts, setTranscripts] = useState([]); // Live transcripts received
  const [suggestions, setSuggestions] = useState([]); // Suggestions fetched dynamically
  const [notesOpen, setNotesOpen] = useState(false); // Meeting notes modal visibility
  const [uploadTimer, setUploadTimer] = useState(null); // Timer for periodic uploads
  const [startTime, setStartTime] = useState(null); // Timestamp for session start
  const [recorder, setRecorder] = useState(null); // MediaRecorder instance
  let audioBuffer = []; // Local buffer for audio chunks

  // Fetch meetingId from localStorage
  const meetingId = localStorage.getItem("meetingId");

  const addNote = (note) => setMeetingNotes((prev) => [...prev, note]);
  const addTranscript = (line) => setTranscripts((prev) => [...prev, line]);

  /**
   * Fetch Suggestions and Transcripts API
   */
const fetchSuggestionsAndTranscripts = async () => {
  if (!meetingId) {
    console.error("Meeting ID is missing from localStorage!");
    return;
  }

  try {
    // Pass meetingId as a query parameter in the URL
    const response = await fetch(
      `https://f11f8e9d04d6.ngrok-free.app/api/v1/${meetingId}/transcript`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // Expect to receive JSON from the server
        },
      }
    );

    if (response.ok) {
      const data = await response.json(); // Parse the response as JSON
      console.log("API Response:", data);

      // Update state for suggestions and transcripts with the received data
      if (data.suggestions) setSuggestions(data.suggestions);
      if (data.transcripts) setTranscripts(data.transcripts);
    } else {
      console.error("API call failed with status:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching suggestions and transcripts:", error);
  }
};


  // Fetch suggestions and transcripts on component mount
  useEffect(() => {
    fetchSuggestionsAndTranscripts();
  }, []);

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone stream obtained:", stream);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      setRecorder(mediaRecorder);

      const initialTimestamp = Date.now();
      setStartTime(initialTimestamp); // Save session start timestamp

      console.log("Recording started...");
      audioBuffer = []; // Clear buffer

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioBuffer.push(event.data);
          console.log("Audio chunk collected:", event.data);
        }
      };

      mediaRecorder.start(500);

      const interval = setInterval(() => {
        if (audioBuffer.length > 0) {
          const chunk = audioBuffer.shift();
          const timestamp = Date.now() - initialTimestamp;
          sendAudioToBackend(chunk, timestamp);
        } else {
          console.log("Audio buffer empty, waiting for chunks...");
        }
      }, 4000);

      setUploadTimer(interval);
    } catch (error) {
      console.error("Error starting microphone recording:", error);
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();

      recorder.onstop = async () => {
        console.log("Recorder stopped. Uploading remaining audio chunks...");
        for (const chunk of audioBuffer) {
          const timestamp = Date.now() - startTime;
          await sendAudioToBackend(chunk, timestamp);
        }
        audioBuffer = [];
      };
    }

    if (uploadTimer) {
      clearInterval(uploadTimer);
      setUploadTimer(null);
    }

    console.log("Recording stopped.");
  };

  const sendAudioToBackend = async (chunk, timestamp) => {
    try {
      if (!meetingId) {
        console.error("Meeting ID is missing from localStorage!");
        return;
      }

      const audioBlob = new Blob([chunk], { type: "audio/wav" });

      const formData = new FormData();
      formData.append("audioBlob", audioBlob, `audio_${timestamp}.wav`);
      formData.append("timestamp", timestamp.toString());
      formData.append("meetingId", meetingId);
      formData.append("user", localStorage.getItem("role"));

      const response = await fetch(
        "https://9d1d15c9f81f.ngrok-free.app/api/v1/transcribe",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Response from backend:", data);

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
          setSessionActive(true);
          startRecording();
        }}
        onStop={() => {
          setSessionActive(false);
          stopRecording();
        }}
        onSummary={() => alert("Summary feature is coming soon!")}
      />

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