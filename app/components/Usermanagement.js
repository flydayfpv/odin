'use client'

import { useState } from "react";
import Swal from "sweetalert2";
import ListDivision from "./subComponent/ListDivision";
import ListRole from "./subComponent/ListRole";

export default function UserPage() {
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        emid: "",
        email: "",
        name: "",
        departmentId: "",
        roleId: "",
    });
    const [found, setFound] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // ================= Search User =================
    const handleSearch = async () => {
        if (!search.trim()) {
            Swal.fire("กรุณากรอกคำค้นหา", "", "warning");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/search?query=${search}`);
            const data = await res.json();

            if (!data.user) {
                Swal.fire("ไม่พบผู้ใช้", "", "info");
                setFound(false);
                setForm({
                    emid: "",
                    email: "",
                    name: "",
                    departmentId: "",
                    roleId: "",
                });
                return;
            }

            setForm(data.user);
            setFound(true);
        } catch {
            Swal.fire("เกิดข้อผิดพลาดในการค้นหา", "", "error");
        }
    };

    // ================= Create / Update =================
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        let url = "";
        let method = "";

        if (found) {
            // Update existing user
            url = `${API_URL}/users/${form.id}`;
            method = "PUT";
        } else {
            // Register new user
            url = `${API_URL}/users/register`;
            method = "POST";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            Swal.fire(
                found ? "อัปเดตสำเร็จ" : "สร้างผู้ใช้สำเร็จ",
                "",
                "success"
            );
            setFound(false);
            setForm({
                emid: "",
                email: "",
                name: "",
                departmentId: "",
                roleId: "",
            });
        } else {
            const err = await res.json();
            Swal.fire(err.message || "เกิดข้อผิดพลาด", "", "error");
        }
    } catch {
        Swal.fire("เกิดข้อผิดพลาด", "", "error");
    }
};


    // ================= Delete =================
    const handleDelete = async () => {
        if (!found) return;

        const result = await Swal.fire({
            title: "คุณแน่ใจไหม?",
            text: "การลบผู้ใช้นี้ไม่สามารถย้อนกลับได้",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่ ลบเลย",
            cancelButtonText: "ยกเลิก",
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/users/${form.id}`, { method: "DELETE" });
                if (res.ok) {
                    Swal.fire("ลบผู้ใช้เรียบร้อย", "", "success");
                    setFound(false);
                    setForm({
                        emid: "",
                        email: "",
                        name: "",
                        departmentId: "",
                        roleId: "",
                    });
                } else Swal.fire("ไม่สามารถลบได้", "", "error");
            } catch {
                Swal.fire("เกิดข้อผิดพลาด", "", "error");
            }
        }
    };

    // ================= Reset Password =================
    const handleResetPassword = async () => {
        if (!found) return;

        const result = await Swal.fire({
            title: "ต้องการรีเซ็ตรหัสผ่าน?",
            text: "รหัสผ่านจะถูกตั้งเป็น 1111",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่ รีเซ็ตเลย",
            cancelButtonText: "ยกเลิก",
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/users/${form.id}/reset-password`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: "1111" }),
                });
                if (res.ok) Swal.fire("รีเซ็ตรหัสผ่านเรียบร้อย", "", "success");
                else Swal.fire("เกิดข้อผิดพลาด", "", "error");
            } catch {
                Swal.fire("เกิดข้อผิดพลาด", "", "error");
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-semibold mb-6 text-center">🔍 User Management</h1>

            {/* Search */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="ค้นหาด้วย emid / email / name"
                    className="border p-2 rounded w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
                >
                    ค้นหา
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow border"
            >
                <input
                    type="text"
                    placeholder="EMID"
                    className="border p-2 rounded w-full"
                    value={form.emid}
                    required
                    onChange={(e) => setForm({ ...form, emid: e.target.value })}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="ชื่อจริง"
                    className="border p-2 rounded w-full"
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                {/* Division Dropdown */}
                <ListDivision
                    value={form.departmentId}
                    onChange={(val) => setForm({ ...form, departmentId: val })}
                />

                {/* Role Dropdown */}
                <ListRole
                    value={form.roleId}
                    onChange={(val) => setForm({ ...form, roleId: val })}
                />

                {/* Buttons */}
                <div className="md:col-span-2 flex gap-3 mt-4">
                    <button
                        type="submit"
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                        {found ? "อัปเดตข้อมูล" : "สร้างผู้ใช้ใหม่"}
                    </button>

                    {found && (
                        <>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                            >
                                ลบ
                            </button>

                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                            >
                                รีเซ็ตรหัสผ่าน
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
