'use client';

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import ListJob from "./subComponent/ListJob";
import ListShift from "./subComponent/ListShift";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManpowerPlanDetail() {
    const [manpowerPlan, setManpowerPlan] = useState(null);
    const [planDetails, setPlanDetails] = useState([]);
    const [maximums, setMaximums] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ jobId: '', shiftId: '', manpower: '', shiftReserve: '' });
    const [editingId, setEditingId] = useState(null);

    const searchParams = useSearchParams();
    const planId = searchParams.get("id");

    // -------- Data Fetching Functions ----------
    const fetchData = useCallback(async () => {
        if (!planId) return;
        setLoading(true);
        try {
            const [planRes, detailsRes, summaryRes, maxRes] = await Promise.all([
                fetch(`${API_URL}/manpowerplans/${planId}`),
                fetch(`${API_URL}/planDetails/plan/${planId}`),
                fetch(`${API_URL}/planDetails/plan/${planId}/summary`),
                fetch(`${API_URL}/maximum/plan/${planId}`)
            ]);

            if (planRes.ok) setManpowerPlan(await planRes.json());
            if (detailsRes.ok) {
                const detailsData = await detailsRes.json();
                setPlanDetails(detailsData.sort((a, b) => a.jobId - b.jobId || a.shiftId - b.shiftId));
            }
            if (summaryRes.ok) setSummary(await summaryRes.json());
            if (maxRes.ok) setMaximums(await maxRes.json());

        } catch (err) {
            console.error("Fetch error:", err);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    }, [planId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // -------- Maximum Actions ----------
    const handleDeleteMaximum = async (id) => {
        const confirm = await Swal.fire({
            title: 'Confirm Delete?',
            text: "This will remove the maximum limit for this job.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33'
        });

        if (confirm.isConfirmed) {
            try {
                await fetch(`${API_URL}/maximum/${id}`, { method: 'DELETE' });
                Swal.fire('Deleted!', 'Maximum deleted successfully', 'success');
                fetchData(); // Refresh all
            } catch (err) {
                Swal.fire('Error', 'Failed to delete', 'error');
            }
        }
    };

    // -------- Form Handling ----------
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_URL}/planDetails/${editingId}` : `${API_URL}/planDetails`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, planId: Number(planId) })
            });

            if (res.ok) {
                Swal.fire('Success', `Detail ${editingId ? 'updated' : 'added'}`, 'success');
                setForm({ jobId: '', shiftId: '', manpower: '', shiftReserve: '' });
                setEditingId(null);
                fetchData();
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to save detail', 'error');
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!manpowerPlan) return <div className="p-6 text-center text-red-500">Plan not found</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Manpower Plan Detail</h1>

            {/* Plan Info Card */}
            <div className="bg-white shadow rounded-xl p-6 border flex flex-wrap items-center justify-between gap-6">
                <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="font-semibold">{manpowerPlan.name}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase">Division</p>
                    <p className="font-semibold">{manpowerPlan.division?.name || '-'}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase">Period</p>
                    <p className="font-semibold">{manpowerPlan.startDate} to {manpowerPlan.dueDate}</p>
                </div>
            </div>

            {/* Maximum Table (Displaying your JSON data) */}
            <div className="bg-white p-4 rounded shadow border border-blue-100">
                <h2 className="text-lg font-bold mb-4 text-blue-800">กรอบกำลังพลสูงสุด (Maximum)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">ชื่องาน (Job Name)</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Maximum</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {maximums.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{m.job?.name}</td>
                                    <td className="px-4 py-2 font-mono text-blue-600 font-bold">{m.maximum.toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleDeleteMaximum(m.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <hr className="my-8" />

            {/* Entry Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded border space-y-4">
                <h2 className="font-bold text-lg">{editingId ? "แก้ไขรายละเอียด" : "เพิ่มรายละเอียดแผน"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <ListJob value={form.jobId} onChange={(val) => setForm({ ...form, jobId: val })} />
                    <ListShift value={form.shiftId} onChange={(val) => setForm({ ...form, shiftId: val })} />
                    <input type="number" name="manpower" placeholder="กำลังพล" value={form.manpower} onChange={handleChange} required className="border rounded p-2" />
                    <input type="number" name="shiftReserve" placeholder="สำรอง" value={form.shiftReserve} onChange={handleChange} required className="border rounded p-2" />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        {editingId ? "Update" : "Add to Plan"}
                    </button>
                    {editingId && <button onClick={() => { setEditingId(null); setForm({ jobId: '', shiftId: '', manpower: '', shiftReserve: '' }) }} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
                </div>
            </form>

            {/* Main Plan Details Table */}
            <div className="overflow-x-auto bg-white rounded shadow border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Job</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Shift</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Manpower</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reserve</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {planDetails.map((d) => (
                            <tr key={d.id}>
                                <td className="px-4 py-2 font-medium">{d.job?.name}</td>
                                <td className="px-4 py-2">{d.shift?.name}</td>
                                <td className="px-4 py-2">{d.manpower}</td>
                                <td className="px-4 py-2">{d.shiftReserve}</td>
                                <td className="px-4 py-2 space-x-3">
                                    <button onClick={() => { setEditingId(d.id); setForm({ jobId: d.jobId, shiftId: d.shiftId, manpower: d.manpower, shiftReserve: d.shiftReserve }) }} className="text-blue-600 hover:underline text-sm">Edit</button>
                                    <button onClick={() => handleDeleteMaximum(d.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}