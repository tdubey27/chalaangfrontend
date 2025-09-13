import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DoctorMeeting from "./pages/DoctorMeeting";
import PatientMeeting from "./pages/PatientMeeting";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/doctor" element={<DoctorMeeting />} />
        <Route path="/patient" element={<PatientMeeting />} />
      </Routes>
    </Router>
  );
}
