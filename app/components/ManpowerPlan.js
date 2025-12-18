'use client';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight,ListCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ListDivision from './subComponent/ListDivision';

const MySwal = withReactContent(Swal);

export default function ManpowerPlansPage() {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [plans, setPlans] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [form, setForm] = useState({
        name: '',
        divisionId: '',
        startDate: '',
        dueDate: '',
        remark: '',
    });
    const [editId, setEditId] = useState(null);
    const limit = 10; // แสดงต่อหน้า

    // ===============================
    // Fetch Plans with Filter + Pagination
    // ===============================
    const fetchPlans = async () => {
        const res = await fetch(`${API}/manpowerplans?filter=${filter}&page=${page}&limit=${limit}`);
        const data = await res.json();

        setPlans(data.data || data);
        setPages(data.pages || 1);
    };

    useEffect(() => {
        fetchPlans();
    }, [filter, page]);

    // ===============================
    // Open Modal
    // ===============================
    const openModal = (plan = null) => {
        if (plan) {
            setForm({
                name: plan.name,
                divisionId: plan.divisionId,
                startDate: plan.startDate,
                dueDate: plan.dueDate,
                remark: plan.remark,
            });
            setEditId(plan.id);
        } else {
            setForm({ name: '', divisionId: '', startDate: '', dueDate: '', remark: '' });
            setEditId(null);
        }
        setModalOpen(true);
    };

    // ===============================
    // Submit Form
    // ===============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `${API}/manpowerplans/${editId}` : `${API}/manpowerplans`;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            await MySwal.fire({
                icon: "success",
                title: editId ? "อัปเดตสำเร็จ!" : "เพิ่มรายการสำเร็จ!",
                timer: 1500,
                showConfirmButton: false,
            });
            setModalOpen(false);
            fetchPlans();
        } else {
            MySwal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
        }
    };

    // ===============================
    // Delete
    // ===============================
    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: "ยืนยันการลบ?",
            text: "ข้อมูลนี้จะถูกลบถาวร",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        });

        if (!result.isConfirmed) return;

        const res = await fetch(`${API}/manpowerplans/${id}`, { method: 'DELETE' });

        if (res.ok) {
            MySwal.fire({
                icon: "success",
                title: "ลบสำเร็จ!",
                timer: 1500,
                showConfirmButton: false,
            });
            fetchPlans();
        } else {
            MySwal.fire({ icon: "error", title: "ลบไม่สำเร็จ!" });
        }
    };

    // ===============================
    // Pagination Controls
    // ===============================
    const goToPage = (p) => {
        if (p < 1 || p > pages) return;
        setPage(p);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">แผนกำลังพล</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} /> เพิ่มแผนใหม่
                </button>
            </div>

            {/* Filter */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => { setFilter("all"); setPage(1); }}
                    className={`px-4 py-2 rounded ${filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
                >
                    ทั้งหมด
                </button>
                <button
                    onClick={() => { setFilter("active"); setPage(1); }}
                    className={`px-4 py-2 rounded ${filter === "active" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
                >
                    กำลังใช้งาน
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold">ชื่อแผน</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">สังกัด</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">เริ่ม</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">สิ้นสุด</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">หมายเหตุ</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {plans?.map(plan => (
                            <tr key={plan.id}>
                                <td className="px-6 py-3">{plan.name}</td>
                                <td className="px-6 py-3">{plan.division?.name || '-'}</td>
                                <td className="px-6 py-3">{plan.startDate}</td>
                                <td className="px-6 py-3">{plan.dueDate}</td>
                                <td className="px-6 py-3">{plan.remark}</td>
                                <td className="px-6 py-3 ">
                                    <div className='flex justify-center gap-2'>
                                    <button onClick={() => window.open(`/manpowerplan/${plan.id}`, '_blank')} className="text-blue-500"><ListCheck size={18} /></button>
                                    <button onClick={() => openModal(plan)} className="text-yellow-500"><Pencil size={18} /></button>
                                    <button onClick={() => handleDelete(plan.id)} className="text-red-500"><Trash2 size={18} /></button>
                               </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 gap-2">
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    <ChevronLeft size={16} />
                </button>
                <span>หน้า {page} / {pages}</span>
                <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'แก้ไขแผน' : 'สร้างแผนใหม่'}</h2>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <input
                                className="border p-2 rounded"
                                placeholder="ชื่อแผน"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            <ListDivision
                                value={form.divisionId}
                                onChange={(val) => setForm({ ...form, divisionId: val })}
                            />
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                required
                            />
                            <input
                                className="border p-2 rounded"
                                placeholder="หมายเหตุ"
                                value={form.remark}
                                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="border px-4 py-2 rounded">ยกเลิก</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">{editId ? "อัปเดต" : "สร้าง"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
