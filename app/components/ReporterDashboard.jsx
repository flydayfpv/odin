"use client";

import React, { useState } from "react";

export default function ReporterDashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  return (
    <div className="p-4 bg-white shadow-sm rounded-lg inline-block w-min-full">
      <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg border ">
        {/* ส่วนเลือกเดือน */}
        <div className="flex items-center gap-2">
          <label className="font-bold text-gray-700 whitespace-nowrap">
            เดือน:
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("th-TH", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        {/* ส่วนกรอกปี */}
        <div className="flex items-center gap-2">
          <label className="font-bold text-gray-700">ปี (ค.ศ.):</label>
          <input
            type="number"
            className="border border-gray-300 rounded px-2 py-1 w-24 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {/* แสดงผลค่าที่เลือก (สำหรับตรวจสอบ) */}
      <div className="mt-2 text-xs text-slate-400">
        ค่าที่เลือกปัจจุบัน: {month} / {year}
      </div>
    </div>
  );
}