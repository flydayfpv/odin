'use client';
import React from 'react';

export default function Navbar() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">⚡ ODIN</div>
        <div className="text-sm opacity-90">Operation Data & Information</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Notifications</button>
        <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Profile</button>
      </div>
    </header>
  );
}
