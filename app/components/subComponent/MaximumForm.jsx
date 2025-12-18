"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ListJob from "./ListJob";

export default function MaximumForm({ planId }) {
  const [form, setForm] = useState({ jobId: "", maximum: "" });
  const [maximums, setMaximums] = useState([]);
  const [editingData, setEditingData] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // โหลดรายการ maximums
  const loadMaximums = async () => {
    try {
      const res = await fetch(`${API_URL}/maximums/plan/${planId}`);
      const data = await res.json();
      setMaximums(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (planId) loadMaximums();
  }, [planId]);

  // เวลาเลือกข้อมูลมาแก้ไข
  useEffect(() => {
    if (editingData) {
      setForm({
        jobId: String(editingData.jobId),
        maximum: String(editingData.maximum),
      });
    }
  }, [editingData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingData) {
        // UPDATE
        await fetch(`${API_URL}/maximums/${editingData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: Number(planId),
            jobId: Number(form.jobId),
            maximum: Number(form.maximum),
          }),
        });
        Swal.fire("Updated!", "Maximum updated successfully", "success");
      } else {
        // CREATE
        await fetch(`${API_URL}/maximums`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: Number(planId),
            jobId: Number(form.jobId),
            maximum: Number(form.maximum),
          }),
        });
        Swal.fire("Added!", "Maximum added successfully", "success");
      }

      setForm({ jobId: "", maximum: "" });
      setEditingData(null);
      loadMaximums();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save maximum", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Delete?",
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirmed.isConfirmed) return;

    try {
      await fetch(`${API_URL}/maximums/${id}`, { method: "DELETE" });
      Swal.fire("Deleted!", "", "success");
      loadMaximums();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  return (
    <div className="space-y-6">

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-lg">
          {editingData ? "Edit Maximum" : "Add Maximum"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Job selector */}
          <ListJob
            value={form.jobId}
            onChange={(val) => setForm({ ...form, jobId: val })}
          />

          {/* Maximum input */}
          <input
            type="number"
            name="maximum"
            placeholder="Maximum"
            value={form.maximum}
            onChange={handleChange}
            required
            className="border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingData ? "Update" : "Add"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full border mt-4 text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-3 py-2">Job</th>
            <th className="border px-3 py-2 text-center">Maximum</th>
            <th className="border px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {maximums.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                No maximum data found.
              </td>
            </tr>
          ) : (
            maximums.map((item) => (
              <tr key={item.id}>
                <td className="border px-3 py-2">
                  {item.job?.name || "—"}
                </td>

                <td className="border px-3 py-2 text-center">
                  {item.maximum}
                </td>

                <td className="border px-3 py-2 text-center space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => setEditingData(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
