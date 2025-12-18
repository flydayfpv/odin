'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import ListJob from "./subComponent/ListJob";
import ListShift from "./subComponent/ListShift";
import MaximumForm from "./subComponent/MaximumForm";
import MaximumTable from "./subComponent/MaximumTable"; 

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManpowerPlanDetail() {
    const [manpowerPlan, setManpowerPlan] = useState(null);
    const [planDetails, setPlanDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ jobId: '', shiftId: '', manpower: '', shiftReserve: '' });
    const [editingId, setEditingId] = useState(null);
    const [summary, setSummary] = useState([]);

    const searchParams = useSearchParams();
    const planId = searchParams.get("id");


    const handleEditMaximum = (m) => {
    setEditingMaximum(m);
};

const handleDeleteMaximum = async (id) => {
    try {
        await fetch(`${API_URL}/maximum/${id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'Maximum deleted successfully', 'success');
        fetchMaximums();
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete maximum', 'error');
    }
};



    // -------- Fetch Plan ----------
    const getMpPlan = async (id) => {
        try {
            const res = await fetch(`${API_URL}/manpowerplans/${id}`);
            if (!res.ok) throw new Error("Failed to fetch manpower plan");
            const data = await res.json();
            setManpowerPlan(data);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to fetch plan', 'error');
        }
    };

    // -------- Fetch Plan Details ----------
    const fetchPlanDetails = async () => {
        if (!planId) return;
        try {
            const res = await fetch(`${API_URL}/planDetails/plan/${planId}`);
            if (!res.ok) throw new Error('Failed to fetch plan details');
            const data = await res.json();
            // sort by jobId, shiftId
            const sorted = data.sort((a, b) => a.jobId - b.jobId || a.shiftId - b.shiftId);
            setPlanDetails(sorted);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to fetch plan details', 'error');
        }
    };


    const [maximums, setMaximums] = useState([]);
    const [editingMaximum, setEditingMaximum] = useState(null);

    const fetchMaximums = async () => {
        if (!planId) return;
        try {
            const res = await fetch(`${API_URL}/maximums/plan/${planId}`);
            if (!res.ok) throw new Error('Failed to fetch maximums');
            const data = await res.json();
            setMaximums(data);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to fetch maximums', 'error');
        }
    };
    const fetchSummary = async () => {
        if (!planId) return;
        try {
            const res = await fetch(`${API_URL}/planDetails/plan/${planId}/summary`);
            if (!res.ok) throw new Error('Failed to fetch summary');
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to fetch summary', 'error');
        }
    };


    useEffect(() => {
        if (planId) {
            setLoading(true);
            Promise.all([getMpPlan(planId), fetchPlanDetails()]).finally(() => setLoading(false));
        }

        if (planId) {
            setLoading(true);
            Promise.all([getMpPlan(planId), fetchPlanDetails(), fetchSummary()])
                .finally(() => setLoading(false));
        }

        if (planId) {
            setLoading(true);
            Promise.all([getMpPlan(planId), fetchPlanDetails(), fetchSummary(), fetchMaximums()])
                .finally(() => setLoading(false));
        }
    }, [planId]);

    // -------- Form Handling ----------
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await fetch(`${API_URL}/planDetails/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, planId: Number(planId) })
                });
                Swal.fire('Updated!', 'Detail updated successfully', 'success');
            } else {
                await fetch(`${API_URL}/planDetails`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, planId: Number(planId) })
                });
                Swal.fire('Added!', 'Detail added successfully', 'success');
            }
            setForm({ jobId: '', shiftId: '', manpower: '', shiftReserve: '' });
            setEditingId(null);
            fetchPlanDetails();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to save detail', 'error');
        }
    };

    const handleEdit = (detail) => {
        setForm({
            jobId: detail.jobId,
            shiftId: detail.shiftId,
            manpower: detail.manpower,
            shiftReserve: detail.shiftReserve
        });
        setEditingId(detail.id);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/planDetails/${id}`, { method: 'DELETE' });
                Swal.fire('Deleted!', 'Detail has been deleted.', 'success');
                fetchPlanDetails();
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to delete detail', 'error');
            }
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!manpowerPlan) return <div className="p-6 text-center text-red-500">Plan not found</div>;








    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">


            {/* Plan Info */}
            <h1 className="text-2xl font-bold">Manpower Plan Detail</h1>
            <div className="bg-white shadow rounded-xl p-6 border flex items-center justify-between gap-6 overflow-x-auto">
                <div className="min-w-[120px]">
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="font-semibold">{manpowerPlan.name}</p>
                </div>
                <div className="min-w-[250px] flex-1">
                    <p className="text-xs text-gray-500 uppercase">Division</p>
                    <p className="font-semibold truncate">{manpowerPlan.division?.name}</p>
                </div>
                <div className="min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase">Start</p>
                    <p className="font-semibold">{manpowerPlan.startDate}</p>
                </div>
                <div className="min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase">Due</p>
                    <p className="font-semibold">{manpowerPlan.dueDate}</p>
                </div>
                <div className="min-w-[100px]">
                    <p className="text-xs text-gray-500 uppercase">Remark</p>
                    <p className="font-semibold">{manpowerPlan.remark || "-"}</p>
                </div>
            </div>

            {/* -------- Summary Table -------- */}
            {summary.length > 0 && (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full divide-y divide-gray-200 mb-4">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">งาน</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">กำลังพล</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">สำรอง</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {summary.map(s => (
                                <tr key={s.jobId}>
                                    <td className="px-4 py-2">{s.job?.name || '-'}</td>
                                    <td className="px-4 py-2">{s.totalManpower}</td>
                                    <td className="px-4 py-2">{s.totalShiftReserve || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* -------- Maximum CRUD Section -------- */}
            <h1 className="text-2xl font-bold mt-6">กรอบกำลังพล (Maximum)</h1>

            {/* Maximum Form */}
            <MaximumForm
                planId={planId}
                onSaved={() => fetchMaximums()} // refresh after save
            />


            <hr />

            <h1 className="text-2xl font-bold">แผนกำลังพล</h1>


            {/* PlanDetail Form */}
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-2">
                <h2 className="font-semibold text-lg">{editingId ? "Edit Detail" : "Add Detail"}</h2>
                <div className="grid grid-cols-5 gap-4">
                    <ListJob
                        value={form.jobId}
                        onChange={(val) => setForm({ ...form, jobId: val })}
                    />
                    <ListShift
                        value={form.shiftId}
                        onChange={(val) => setForm({ ...form, shiftId: val })}
                    />
                    <input
                        type="number"
                        name="manpower"
                        placeholder="Manpower"
                        value={form.manpower}
                        onChange={handleChange}
                        required
                        className="border rounded p-2"
                    />
                    <input
                        type="number"
                        name="shiftReserve"
                        placeholder="Shift Reserve"
                        value={form.shiftReserve}
                        onChange={handleChange}
                        required
                        className="border rounded p-2"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {editingId ? "Update" : "Add"}
                </button>
            </form>

            {/* PlanDetail Table */}
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Job</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Shift</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Manpower</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Shift Reserve</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {(() => {
                            let counter = 1;

                            // สร้าง map สำหรับนับจำนวน shift ต่อ job เพื่อใช้ rowSpan
                            const jobCounts = {};
                            planDetails.forEach(d => {
                                jobCounts[d.job?.name] = (jobCounts[d.job?.name] || 0) + 1;
                            });

                            const renderedJobs = new Set();

                            return planDetails.map(d => {
                                const showJobCell = !renderedJobs.has(d.job?.name);
                                if (showJobCell) renderedJobs.add(d.job?.name);

                                return (
                                    <tr key={d.id}>
                                        <td className="px-4 py-2">{counter++}</td>
                                        {showJobCell ? (
                                            <td className="px-4 py-2" rowSpan={jobCounts[d.job?.name]}>
                                                {d.job?.name || '-'}
                                            </td>
                                        ) : null}
                                        <td className="px-4 py-2">{d.shift?.name || '-'}</td>
                                        <td className="px-4 py-2">{d.manpower}</td>
                                        <td className="px-4 py-2">{d.shiftReserve}</td>
                                        <td className="px-4 py-2 space-x-2">
                                            <button
                                                onClick={() => handleEdit(d)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(d.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            });
                        })()}
                        {planDetails.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-gray-500">
                                    No details found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>


            </div>

        </div>
    );
}
