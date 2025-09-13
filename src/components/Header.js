import React from "react";
import logo from "../assets/logo.png"; // Import your logo image

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex items-center gap-3 sticky top-0 z-50">
      {/* Logo */}
      <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />

      <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "#582CDB" }}>
        Acko - ClearTalk
      </h1>
    </header>
  );
}
