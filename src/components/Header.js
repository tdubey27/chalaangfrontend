import React from "react";
import logo from "../assets/logo.png";

export default function Header() {
  const role = localStorage.getItem("role");
  const meetingId = localStorage.getItem("meetingId");

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <div className="flex items-center gap-3">
        <img src={logo} alt="App Logo" className="h-10" />
        <h1 className="text-xl font-bold text-purple-700">Acko - ClearTalk</h1>
      </div>
      <div className="text-right">
        <p className="font-semibold text-purple-600">{role}</p>
        <p className="text-sm text-gray-500">Meeting ID: {meetingId}</p>
      </div>
    </header>
  );
}
