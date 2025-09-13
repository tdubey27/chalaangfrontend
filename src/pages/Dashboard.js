import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [meetingId, setMeetingId] = useState(""); // Input for meeting ID
  const [error, setError] = useState(""); // Error messages
  const navigate = useNavigate();

  // Function to join the meeting as a Doctor or Patient
  const joinMeeting = (role) => {
    if (!meetingId.trim() || meetingId.trim().length < 6) {
      setError("Meeting ID must be at least 6 characters and valid!");
      return;
    }

    try {
      setError(""); // Clear previous errors
      localStorage.setItem("meetingId", meetingId.trim()); // Store trimmed Meeting ID
      localStorage.setItem("role", role); // Store the role (Doctor/Patient)

      // Navigate to the selected role page
      if (role === "Doctor") {
        navigate("/doctor");
      } else {
        navigate("/patient");
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      setError("Unable to store meeting details. Please try again!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h1 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Join Meeting
        </h1>

        {/* Meeting ID Input */}
        <input
          type="text"
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          placeholder="Enter Meeting ID"
          className={`w-full p-3 border rounded-lg mb-2 focus:ring-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Role Selection Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => joinMeeting("Doctor")}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
          >
            Join as Doctor
          </button>
          <button
            onClick={() => joinMeeting("Patient")}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600"
          >
            Join as Patient
          </button>
        </div>
      </div>
    </div>
  );
}