"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function NewDailyReport() {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    reportDate: today,
    divisionId: "",
    jobId: "",
    shiftId: "",
    inRoster: 0,
    ojt: 0,
    mSick: 0,
    mLeave: 0,
    mVac: 0,
    otherLeave: 0,
    dSick: 0,
    dLeave: 0,
    dVac: 0,
    dOtherLeave: 0,
    otOff: 0,
    ot8: 0,
    otContinue: 0,
    reserve_unCount: 0,
    pregUnCount: 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dailyReports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      Swal.fire("สำเร็จ", "บันทึกรายงานเรียบร้อยแล้ว", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="p-6 space-y-4 bg-white shadow rounded-lg max-w-2xl">

      <h2 className="text-xl font-bold">เพิ่ม Daily Report</h2>

      <div className="grid grid-cols-2 gap-4">
        
        <div>
          <label>วันที่</label>
          <input
            type="date"
            name="reportDate"
            value={form.reportDate}
            onChange={handleChange}
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        <div>
          <label>Division</label>
          <input
            type="number"
            name="divisionId"
            value={form.divisionId}
            onChange={handleChange}
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        <div>
          <label>Job</label>
          <input
            type="number"
            name="jobId"
            value={form.jobId}
            onChange={handleChange}
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        <div>
          <label>Shift</label>
          <input
            type="number"
            name="shiftId"
            value={form.shiftId}
            onChange={handleChange}
            className="border px-3 py-2 w-full rounded"
          />
        </div>

        {/* ตัวเลขทั้งหมด */}
        {Object.keys(form)
          .filter((k) => !["reportDate", "divisionId", "jobId", "shiftId"].includes(k))
          .map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                type="number"
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="border px-3 py-2 w-full rounded"
              />
            </div>
          ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        บันทึก
      </button>

    </div>
  );
}
