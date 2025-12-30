"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import domtoimage from "dom-to-image-more";
import { Pencil, Check, X, Image, Download } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Helper Functions ---
const formatDate = (dateString) => {
	if (!dateString) return "";
	const d = new Date(dateString);
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0
	const year = d.getFullYear();
	return `${day}-${month}-${year}`;
};

const sumField = (arr, field) => {
	if (!Array.isArray(arr)) return 0;
	return arr.reduce((sum, v) => sum + (Number(v?.[field]) || 0), 0);
};
//-----------------------------------------------------------

// ส่วนต่างกำลังพล ต่อ 1 แถว
const manDiff = (d) => {
	// ❌ ไม่รวมผลัด หยุด(6) และ OJT(7)
	if (d.shiftId === 6 || d.shiftId === 7) return 0;

	return (d.inRoster || 0) - ((d.manpower || 0) + (d.shiftReserve || 0));
};
const diffPlan = (d) =>
	(d.inRoster || 0) -
	((d.mSick || 0) +
		(d.mLeave || 0) +
		(d.mVac || 0) +
		(d.otherLeave || 0) +
		(d.dSick || 0) +
		(d.dleave || 0) +
		(d.dVac || 0) +
		(d.dOtherLeave || 0)) +
	(d.otOff || 0) +
	(d.ot8 || 0) +
	(d.otContinue || 0) -
	((d.manpowerOperate || 0) + (d.reserve_unCount || 0) + (d.pregUnCount || 0));

const operateDiff = (d) => (d.manpowerOperate || 0) - (d.manpower || 0);
//  {formatNumber(
//                     sumField(items, "manpowerOperate") -
//                       sumField(items, "manpower")
//                   )}

// รวมเฉพาะค่าบวก
const sumPositive = (arr, calcFn) =>
	arr.reduce((sum, item) => {
		const v = calcFn(item);
		return v > 0 ? sum + v : sum;
	}, 0);

// รวมเฉพาะค่าติดลบ
const sumNegative = (arr, calcFn) =>
	arr.reduce((sum, item) => {
		const v = calcFn(item);
		return v < 0 ? sum + v : sum;
	}, 0);

const sumFieldAllPlans = (plansArr, field) => {
	if (!Array.isArray(plansArr)) return 0;
	return plansArr.reduce((acc, p) => {
		const details = p.planDetails || [];
		return acc + details.reduce((a, d) => a + (Number(d?.[field]) || 0), 0);
	}, 0);
};

// **ฟังก์ชันใหม่สำหรับจัดรูปแบบตัวเลข**
const formatNumber = (num) => {
	// ใช้ toLocaleString() เพื่อเพิ่มเครื่องหมาย , คั่นหลักพัน
	if (typeof num === "number" && !isNaN(num)) {
		return num.toLocaleString();
	}
	return num ?? 0;
};

const processManpowerData = (raw) => {
	if (!Array.isArray(raw)) return [];

	let mapped = raw.map((p) => ({
		jobId: p.jobId,
		shiftId: p.shiftId,
		manpower: p.manpower ?? 0,
		shiftReserve: p.shiftReserve ?? 0,
		job: p.job,
		shift: p.shift,
	}));

	const EXTRA_SHIFTS = [6, 7];
	const shiftInfo = {
		6: { id: 6, name: "หยุด" },
		7: { id: 7, name: "OJT" },
	};

	const jobIds = [...new Set(mapped.map((m) => m.jobId))];

	jobIds.forEach((jobId) => {
		EXTRA_SHIFTS.forEach((shiftId) => {
			const exists = mapped.some(
				(m) => m.jobId === jobId && m.shiftId === shiftId
			);

			if (!exists) {
				const sample = mapped.find((m) => m.jobId === jobId);
				mapped.push({
					jobId,
					shiftId,
					manpower: 0,
					shiftReserve: 0,
					job: sample?.job,
					shift: shiftInfo[shiftId],
				});
			}
		});
	});

	mapped.sort((a, b) => a.shiftId - b.shiftId);
	return mapped;
};

// --- Main Component ---

export default function DailyDashboard() {
	const exportToImage = async () => {
		const node = document.getElementById("export-area");

		const dataUrl = await domtoimage.toPng(node, {
			bgcolor: "#ffffff",
			scale: 2,
		});

		const link = document.createElement("a");

		// ใช้ division name และ report date
		const divisionName = plan?.division?.shortText || "N/A";
		link.download = `${divisionName}_${formatDate(reportDate)}.png`;

		link.href = dataUrl;
		link.click();
	};


	const [plans, setPlans] = useState([]);
	const [reportDate, setReportDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [divisionId, setDivisionId] = useState(null);
	const [maxByJob, setMaxByJob] = useState({});

	// State สำหรับ Loading และ เช็คว่าข้อมูลว่างหรือไม่
	const [isLoading, setIsLoading] = useState(false);
	const [isDailyReportEmpty, setIsDailyReportEmpty] = useState(false);

	const [editingKey, setEditingKey] = useState(null);
	const [editForm, setEditForm] = useState({});

	useEffect(() => {
		const stored = localStorage.getItem("divisionId");
		if (stored) setDivisionId(stored);
	}, []);

	const loadData = useCallback(async () => {
		if (!reportDate || !divisionId) return;

		setIsLoading(true);
		setIsDailyReportEmpty(false);

		try {
			const [manpowerRes, dailyRes] = await Promise.all([
				fetch(`${API_URL}/manpowerplans/division/${divisionId}/${reportDate}`),
				fetch(
					`${API_URL}/dailyreports/filter?divisionId=${divisionId}&reportDate=${reportDate}`
				),
			]);

			const manpowerData = await manpowerRes.json();
			const dailyData = await dailyRes.json();

			// --- เช็ค Daily Report ---
			setIsDailyReportEmpty(
				!Array.isArray(dailyData) || dailyData.length === 0
			);

			// -------------------------
			// 1) Process Manpower
			// -------------------------
			let manpowerRaw = [];
			let planId = null;

			if (Array.isArray(manpowerData) && manpowerData.length) {
				manpowerRaw = manpowerData[0].planDetails || [];
				planId = manpowerData[0].id; // ✅ planId
			}

			const processedManpower = processManpowerData(manpowerRaw);

			// -------------------------
			// 2) โหลด MAXIMUM ตาม planId
			// -------------------------
			if (planId) {
				try {
					const maxRes = await fetch(`${API_URL}/maximum/plan/${planId}`);
					const maxData = await maxRes.json();

					const maxMap = {};
					if (Array.isArray(maxData)) {
						maxData.forEach((m) => {
							maxMap[m.jobId] = m.maximum;
						});
					}

					setMaxByJob(maxMap);
				} catch (err) {
					console.error("LOAD MAX ERROR:", err);
				}
			} else {
				setMaxByJob({});
			}

			// -------------------------
			// 3) Map Daily Report
			// -------------------------
			const dailyMap = {};
			if (Array.isArray(dailyData)) {
				dailyData.forEach((d) => {
					const key = `${d.jobId}_${d.shiftId}`;
					dailyMap[key] = d;
				});
			}

			// -------------------------
			// 4) Combine
			// -------------------------
			const combined = processedManpower.map((m) => {
				const key = `${m.job?.id}_${m.shift?.id}`;
				const d = dailyMap[key] || {};

				return {
					job: m.job,
					shift: m.shift,
					jobId: m.jobId,
					shiftId: m.shiftId,
					manpower: m.manpower,
					shiftReserve: m.shiftReserve,

					inRoster: d.inRoster ?? 0,
					mSick: d.mSick ?? 0,
					mLeave: d.mLeave ?? 0,
					mVac: d.mVac ?? 0,
					otherLeave: d.otherLeave ?? 0,

					dSick: d.dSick ?? 0,
					dleave: d.dleave ?? 0,
					dVac: d.dVac ?? 0,
					dOtherLeave: d.dOtherLeave ?? 0,

					otOff: d.otOff ?? 0,
					ot8: d.ot8 ?? 0,
					otContinue: d.otContinue ?? 0,
					manpowerOperate: d.manpowerOperate ?? 0,

					reserve_unCount: d.reserve_unCount ?? 0,
					pregUnCount: d.pregUnCount ?? 0,
				};
			});

			// -------------------------
			// 5) setPlans
			// -------------------------
			setPlans([
				{
					division: dailyData[0]?.division || manpowerData[0]?.division || {},
					planDetails: combined,
				},
			]);
		} catch (e) {
			console.error("LOAD DATA ERROR:", e);
		} finally {
			setIsLoading(false);
		}
	}, [divisionId, reportDate]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const startEdit = (d) => {
		const key = `${d.job.id}_${d.shift.id}`;
		setEditingKey(key);
		setEditForm({
			divisionId,
			reportDate,
			jobId: d.jobId,
			shiftId: d.shiftId,
			...d,
		});
	};

	const [maxplan, setmaxplan] = useState([]);

	const getMax = async (planId) => {
		try {
			const res = await fetch(`${API_URL}/maximum/plan/${planId}`);
			const data = await res.json();

			// แปลง array -> object โดยใช้ jobId เป็น key
			const mapped = {};
			if (Array.isArray(data)) {
				data.forEach((m) => {
					mapped[m.jobId] = m.maximum;
				});
			}

			setMaxByJob(mapped);
		} catch (e) {
			console.error("LOAD MAX ERROR:", e);
			alert("error load maximum");
		}
	};

	const saveEdit = async () => {
		try {
			const res = await fetch(`${API_URL}/dailyreports`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editForm),
			});
			if (!res.ok) throw new Error("Save failed");

			setEditingKey(null);
			setEditForm({});
			loadData();
		} catch (e) {
			console.error("SAVE ERROR:", e);
			alert("บันทึกข้อมูลไม่สำเร็จ");
		}
	};

	const editInput = (field) => (
		<input
			type="number"
			className="w-16 border rounded p-1 text-center bg-white focus:ring-2 focus:ring-blue-300 outline-none"
			value={editForm[field] ?? 0}
			onChange={(e) =>
				setEditForm({ ...editForm, [field]: Number(e.target.value) })
			}
			onKeyDown={(e) => {
				if (e.key === "Enter") saveEdit();
				if (e.key === "Escape") {
					setEditingKey(null);
					setEditForm({});
				}
			}}
		/>
	);

	const jobGroups = useMemo(() => {
		if (!plans.length || !plans[0].planDetails) return {};
		const sortedDetails = [...plans[0].planDetails].sort(
			(a, b) => a.jobId - b.jobId || a.shiftId - b.shiftId
		);
		return sortedDetails.reduce((acc, d) => {
			const jobName = d?.job?.name || "UNKNOWN JOB";
			if (!acc[jobName]) acc[jobName] = [];
			acc[jobName].push(d);
			return acc;
		}, {});
	}, [plans]);

	// --- RENDER ---
	if (isLoading) {
		return (
			<div className="p-10 text-center text-gray-500 animate-pulse">
				กำลังโหลดข้อมูล...
			</div>
		);
	}

	if (!plans.length || !plans[0].planDetails.length) {
		return (
			<div className="p-6 text-center space-y-4">
				<div className="text-red-600 text-xl font-bold">
					สิ้นสุดสัญญาแล้ว หรือ ไม่พบข้อมูล
				</div>
				<div className="flex items-center gap-3 justify-center">
					<label className="font-bold">เลือกวันที่:</label>
					<input
						type="date"
						className="border   rounded shadow-sm"
						value={reportDate}
						onChange={(e) => setReportDate(e.target.value)}
					/>
				</div>
			</div>
		);
	}

	const plan = plans[0];

	const percent = (used, max) => {
		if (!max) return 0;
		return (used / max) * 100;
	};

	//  ALL
	// ===== Summary helpers =====
	const allItems = plans?.[0]?.planDetails || [];

	// กรอบกำลังพล (TOR + พัก)
	const totalPlanManpower =
		sumField(allItems, "manpower") + sumField(allItems, "shiftReserve");

	// มีคนลงงาน
	const totalInRoster = sumField(allItems, "inRoster");

	// กรอบสูงสุด (maximum)
	const totalMaximum = Object.values(maxByJob || {}).reduce(
		(sum, v) => sum + (Number(v) || 0),
		0
	);

	// %
	const totalPercent =
		totalMaximum > 0 ? (totalInRoster / totalMaximum) * 100 : 0;

	// ===== ลางานรวม =====
	const totalLeave =
		sumField(allItems, "mSick") +
		sumField(allItems, "mLeave") +
		sumField(allItems, "mVac") +
		sumField(allItems, "otherLeave") +
		sumField(allItems, "dSick") +
		sumField(allItems, "dleave") +
		sumField(allItems, "dVac") +
		sumField(allItems, "dOtherLeave");

	// ===== OT รวม =====
	const totalOT =
		sumField(allItems, "otOff") +
		sumField(allItems, "ot8") +
		sumField(allItems, "otContinue");

	// ===== ส่งปฏิบัติงานจริง =====
	const totalRealSend =
		sumField(allItems, "manpowerOperate") +
		sumField(allItems, "reserve_unCount") +
		sumField(allItems, "pregUnCount");

	// /////////////////////////

	return (
		<div className="p-3 space-y-3 bg-gray-50 min-h-screen  mb-5">
			{/* --- Alert Bar สีแดง --- */}

			{isDailyReportEmpty && (
				<div
					className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-sm mb-4"
					role="alert"
				>
					<p className="font-bold">แจ้งเตือน</p>
					<p>
						ยังไม่มีการบันทึกข้อมูล
						(ข้อมูลที่แสดงปัจจุบันเป็นค่าเริ่มต้นจากแผนงาน)
					</p>
				</div>
			)}

			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded shadow">
				<div className="flex justify-end">
					<button
						onClick={exportToImage}
						className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
					>
						<Image size={18} />
						{/* หรือใช้ <Download size={18} /> */}
						บันทึกเป็นรูปภาพ
					</button>
				</div>
				<h1 className="text-xl font-bold text-gray-800">
					Daily Dashboard -{" "}
					{plan.division?.name || <span className="text-red-500">N/A</span>}
				</h1>
				<div className="flex items-center gap-3">
					<label className="font-bold text-gray-600">วันที่รายงาน:</label>
					<input
						type="date"
						className="border border-gray-300   rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={reportDate}
						onChange={(e) => setReportDate(e.target.value)}
					/>
				</div>
			</div>

			<div id="export-area" className="space-y-2 bg-white p-4 pb-6">
				<h1 className=" font-bold text-gray-800 text-3xl" style={{ border: "none" }}>
					Daily Report -{" "}
					{plan.division?.name || <span className="text-red-500">N/A</span>}{" "}
					<label className="font-bold text-gray-600 text-3xl" style={{ border: "none" }}>
						{" "}
						วันที่รายงาน: {formatDate(reportDate)}
					</label>
				</h1>
				{/* Main Summary Table */}
				<div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-4 overflow-hidden p-6" style={{ border: "none" }}>
					<h2 className="text-xl font-bold mb-2" style={{ border: "none" }}>
						สรุปภาพรวม
					</h2>
					<table className="w-full text-[14px] border border-collapse text-center ">
						<thead className="bg-green-100 text-gray-700">
							<tr>
								<th className="border p-1   text-center" colSpan={3}>
									สรุป
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									แผนจัดกำลังพล
									<br />
									จำนวนจาก Roster
								</th>
								<th className="border p-1   text-center " colSpan={3}>
									แผนส่ง
								</th>
								<th className="border p-1   text-center " rowSpan={3}>
									ขาด/เกิน ตาราง
								</th>
								<th className="border p-1   text-center" colSpan={8}>
									ลางาน
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									รวม
								</th>
								<th className="border p-1   text-center" colSpan={3}>
									ล่วงเวลา
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									รวม
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									ส่งปฏิบัติงานนับยอด
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									เกิน/-ขาด TOR
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									ส่งจริง TOR+พัก
								</th>
								<th className="border p-1   text-center" rowSpan={3}>
									เกิน/-ขาด จากแผน
								</th>
							</tr>
							<tr>
								<th className="border p-1   text-center" rowSpan={2}>
									กรอบกำลังพล
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									มีคนลงงาน
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									คิดเป็น %
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									TOR
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									พัก
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									รวม
								</th>
								<th className="border p-1   text-center" colSpan={4}>
									รายเดือน
								</th>
								<th className="border p-1   text-center" colSpan={4}>
									รายวัน
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									วันหยุด
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									8 พัก 8{" "}
								</th>
								<th className="border p-1   text-center" rowSpan={2}>
									ต่อเนื่อง
								</th>
							</tr>
							<tr>
								<th className="border p-1   text-center">ป่วย</th>
								<th className="border p-1   text-center">ขาด</th>
								<th className="border p-1   text-center">พักร้อน</th>
								<th className="border p-1   text-center">อื่นๆ</th>
								<th className="border p-1   text-center">ป่วย</th>
								<th className="border p-1   text-center">ขาด</th>
								<th className="border p-1   text-center">พักร้อน</th>
								<th className="border p-1   text-center">อื่นๆ</th>
							</tr>
						</thead>
						<tbody>
							{/* ===== แถวบน : ค่าบวก ===== */}
							<tr className="font-bold text-xl">
								{/* กรอบกำลังพล */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(totalMaximum)}
								</td>

								{/* มีคนลงงาน */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(totalInRoster)}
								</td>

								{/* % */}
								<td className="border p-1 text-center" rowSpan={2}>
									{totalPercent.toFixed(2)}%
								</td>

								{/* แผนจัดกำลังพล (จาก Roster) */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(totalPlanManpower)}
								</td>

								{/* แผนส่ง TOR / พัก / รวม */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "manpower"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "shiftReserve"))}
								</td>
								<td className="border p-1 text-center bg-amber-200" rowSpan={2}>
									{formatNumber(totalPlanManpower)}
								</td>

								{/* ขาด / เกิน ตาราง */}
								<td className="border p-1 text-center bg-amber-200">
									{formatNumber(sumPositive(allItems, manDiff))}
								</td>

								{/* ลางาน รายเดือน */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "mSick"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "mLeave"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "mVac"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "otherLeave"))}
								</td>

								{/* ลางาน รายวัน */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "dSick"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "dleave"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "dVac"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "dOtherLeave"))}
								</td>

								{/* รวมลางาน */}
								<td className="border p-1 text-center bg-amber-200" rowSpan={2}>
									{formatNumber(totalLeave)}
								</td>

								{/* OT */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "otOff"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "ot8"))}
								</td>
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "otContinue"))}
								</td>

								{/* รวม OT */}
								<td className="border p-1 text-center bg-amber-200" rowSpan={2}>
									{formatNumber(totalOT)}
								</td>

								{/* ส่งปฏิบัติงานนับยอด */}
								<td className="border p-1 text-center" rowSpan={2}>
									{formatNumber(sumFieldAllPlans(plans, "manpowerOperate"))}
								</td>

								{/* เกิน / ขาด TOR */}
								<td className="border p-1 text-center bg-amber-200">
									{formatNumber(sumPositive(allItems, operateDiff))}
								</td>

								{/* ส่งจริง TOR+พัก */}
								<td className="border p-1 text-center bg-amber-200" rowSpan={2}>
									{formatNumber(totalRealSend)}
								</td>

								{/* เกิน / ขาด จากแผน */}
								<td className="border p-1 text-center bg-amber-200">
									{formatNumber(sumPositive(allItems, diffPlan))}
								</td>
							</tr>

							{/* ===== แถวล่าง : ค่าลบ ===== */}
							<tr className="font-bold bg-blue-50  text-xl">
								<td className="border p-1 text-center text-red-600">
									{formatNumber(sumNegative(allItems, manDiff))}
								</td>
								<td className="border p-1 text-center text-red-600">
									{formatNumber(sumNegative(allItems, operateDiff))}
								</td>
								<td className="border p-1 text-center text-red-600">
									{formatNumber(sumNegative(allItems, diffPlan))}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<h2
					className="text-xl font-bold text-gray-800"
					style={{ border: "none" }}
				>
					รายละเอียดตามงาน
				</h2>

				{Object.entries(jobGroups).map(([jobName, items], index) => (
					<div
						key={`${jobName}-${index}`}
						className="bg-white p-1 rounded-lg shadow  border border-gray-200"
					>
						<div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-1 overflow-hidden p-6">
							{maxByJob[items[0]?.jobId] !== undefined && (
								<div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
									<table className="w-full text-xl text-center border-collapse">
										<thead>
											<tr>
												<th
													colSpan={3}
													className="bg-gray-100 text-gray-800 text-xl font-bold py-2"
												>
													{jobName}
												</th>
											</tr>
											<tr className="bg-gray-50 text-gray-600">
												<th className="border px-2 py-1">กรอบกำลังพล</th>
												<th className="border px-2 py-1">มีคนลงงาน</th>
												<th className="border px-2 py-1">%</th>
											</tr>
										</thead>

										<tbody>
											<tr className="font-semibold">
												<td className="border py-2 text-xl">
													{formatNumber(maxByJob[items[0].jobId])}
												</td>
												<td className="border py-2 text-xl text-blue-600">
													{formatNumber(sumField(items, "inRoster"))}
												</td>
												<td className="border py-2 text-xl font-bold text-green-600">
													{percent(
														sumField(items, "inRoster"),
														maxByJob[items[0].jobId]
													).toFixed(2)}
													%
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							)}

							<table className="w-full text-center  border border-collapse ">
								<thead className="text-[14px]">
									<tr className="bg-yellow-100 text-gray-700">
										<th className="border p-1   text-center" rowSpan={3}>
											ผลัด
										</th>
										<th className="border p-1   text-center" colSpan={3}>
											แผนส่ง
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											Roster
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											เกิน/ขาด ตาราง
										</th>
										<th className="border p-1   text-center" colSpan={9}>
											ลางาน
										</th>
										<th className="border p-1   text-center" colSpan={4}>
											ล่วงเวลา
										</th>
										<th className="w-24 border   text-center" rowSpan={3}>
											ปฏิบัติงานส่งจริงนับยอด
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											เกิน/ขาด TOR
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											สำรองเปลี่ยนพัก
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											คนท้อง
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											รวมส่งจริง
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											เกิน/ขาด จากแผน
										</th>
										<th className="border p-1   text-center " rowSpan={3}>
											<span className="">แก้ไข</span>
										</th>
									</tr>
									<tr className="bg-yellow-100 text-gray-700">
										<th className="border p-1   text-center" rowSpan={3}>
											TOR
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											เปลี่ยนพัก
										</th>
										<th className="border p-1   text-center" rowSpan={3}>
											รวม
										</th>
										<th className="border p-1   text-center" colSpan={4}>
											รายเดือน
										</th>
										<th className="border p-1   text-center" colSpan={4}>
											รายวัน
										</th>
										<th className="border p-1   text-center" rowSpan={2}>
											รวม
										</th>
										<th className="border p-1   text-center" rowSpan={2}>
											วันหยุด
										</th>
										<th className="border p-1   text-center" rowSpan={2}>
											8 พัก 8
										</th>
										<th className="border p-1   text-center" rowSpan={2}>
											ต่อเนื่อง
										</th>
										<th className="border p-1   text-center" rowSpan={2}>
											รวม
										</th>
									</tr>
									<tr className="bg-yellow-100 text-gray-700">
										<th className="border p-1   text-center">ป่วย</th>
										<th className="border p-1   text-center">ขาด</th>
										<th className="border p-1   text-center">พักร้อน</th>
										<th className="border p-1   text-center">อื่นๆ</th>
										<th className="border p-1   text-center">ป่วย</th>
										<th className="border p-1   text-center">ขาด</th>
										<th className="border p-1   text-center">พักร้อน</th>
										<th className="border p-1   text-center">อื่นๆ</th>
									</tr>
								</thead>

								<tbody className="text-md">
									{items.map((d) => {
										const key = `${d.jobId}_${d.shiftId}`;
										const isEdit = editingKey === key;
										const isOffShift = d.shiftId === 6 || d.shiftId === 7;

										const totalLeave =
											(isEdit ? Number(editForm.mSick) || 0 : d.mSick) +
											(isEdit ? Number(editForm.mLeave) || 0 : d.mLeave) +
											(isEdit ? Number(editForm.mVac) || 0 : d.mVac) +
											(isEdit
												? Number(editForm.otherLeave) || 0
												: d.otherLeave) +
											(isEdit ? Number(editForm.dSick) || 0 : d.dSick) +
											(isEdit ? Number(editForm.dleave) || 0 : d.dleave) +
											(isEdit ? Number(editForm.dVac) || 0 : d.dVac) +
											(isEdit
												? Number(editForm.dOtherLeave) || 0
												: d.dOtherLeave);

										const totalOT =
											(isEdit ? Number(editForm.otOff) || 0 : d.otOff) +
											(isEdit ? Number(editForm.ot8) || 0 : d.ot8) +
											(isEdit
												? Number(editForm.otContinue) || 0
												: d.otContinue);

										const totalRealSend =
											(isEdit
												? Number(editForm.manpowerOperate) || 0
												: d.manpowerOperate) +
											(isEdit
												? Number(editForm.reserve_unCount) || 0
												: d.reserve_unCount) +
											(isEdit
												? Number(editForm.pregUnCount) || 0
												: d.pregUnCount);

										const balanceFromPlan =
											(isEdit ? Number(editForm.inRoster) || 0 : d.inRoster) -
											totalLeave +
											totalOT -
											totalRealSend;

										return (
											<tr
												key={key}
												className={`hover:bg-blue-50 px-1 transition-colors ${isEdit ? "bg-yellow-50" : ""
													}`}
											>
												<td className="border  bg-gray-300  px-1  text-center font-medium">
													{d.shift?.name}
												</td>

												{isOffShift ? (
													<>
														{/* ช่องว่างสำหรับผลัดหยุด/OJT */}
														<td
															className="border    px-1   bg-gray-400"
															colSpan={3}
														></td>
														<td className="border    px-1   text-center font-bold text-blue-600">
															{isEdit
																? editInput("inRoster")
																: formatNumber(d.inRoster)}
														</td>
														<td
															className="border    px-1   bg-gray-400"
															colSpan={20}
														></td>
													</>
												) : (
													<>
														<td className="border    px-1   text-center">
															{formatNumber(d.manpower)}
														</td>
														<td className="border    px-1   text-center">
															{formatNumber(d.shiftReserve)}
														</td>
														<td className="bg-amber-100 border    px-1   text-center font-bold text-gray-700">
															{formatNumber(d.manpower + d.shiftReserve)}
														</td>

														<td className="border    px-1   text-center font-bold text-gray-600">
															{isEdit
																? editInput("inRoster")
																: formatNumber(d.inRoster)}
														</td>
														<td
															className={`border bg-amber-100   px-1   text-center font-bold ${d.inRoster - (d.manpower + d.shiftReserve) < 0
																? "text-red-500"
																: "text-green-600"
																}`}
														>
															{formatNumber(
																(d.inRoster || 0) -
																(d.manpower + d.shiftReserve)
															)}
														</td>

														{/* Leave Columns - ไม่ใช้ formatNumber กับ editInput */}
														{[
															"mSick",
															"mLeave",
															"mVac",
															"otherLeave",
															"dSick",
															"dleave",
															"dVac",
															"dOtherLeave",
														].map((f) => (
															<td
																key={f}
																className="border    px-1   text-center text-gray-600"
															>
																{isEdit
																	? editInput(f)
																	: d[f] === 0
																		? "-"
																		: formatNumber(d[f])}
															</td>
														))}
														<td
															className={`border    px-1 bg-amber-100   text-center font-bold ${formatNumber(totalLeave) > 0
																? "text-green-600"
																: "text-red-500"
																}`}
														>
															{formatNumber(totalLeave)}
														</td>

														{/* OT Columns - ไม่ใช้ formatNumber กับ editInput */}
														{["otOff", "ot8", "otContinue"].map((f) => (
															<td
																key={f}
																className="border    px-1   text-center text-gray-600"
															>
																{isEdit
																	? editInput(f)
																	: d[f] === 0
																		? "-"
																		: formatNumber(d[f])}
															</td>
														))}
														<td className="bg-amber-100 border    px-1   text-center font-bold">
															{formatNumber(totalOT)}
														</td>

														<td className="border    px-1   text-center font-bold text-green-700">
															{isEdit
																? editInput("manpowerOperate")
																: formatNumber(d.manpowerOperate)}
														</td>
														<td className={`bg-amber-100 border px-1 text-center font-bold 
														${(d.manpowerOperate - d.manpower) < 0 ?
																"text-red-500" : "text-green-600"
															}`}>
															{formatNumber(
																(isEdit
																	? Number(editForm.manpowerOperate) || 0
																	: d.manpowerOperate) - d.manpower
															)}
														</td>

														<td className="border    px-1   text-center text-gray-600">
															{isEdit
																? editInput("reserve_unCount")
																: formatNumber(d.reserve_unCount)}
														</td>
														<td className="border    px-1   text-center text-gray-600">
															{isEdit
																? editInput("pregUnCount")
																: formatNumber(d.pregUnCount)}
														</td>

														<td className="bg-amber-100 border    px-1   text-center font-bold text-gray-800">
															{formatNumber(totalRealSend)}
														</td>
														<td
															className={`bg-amber-100 border    px-1   text-center font-bold ${balanceFromPlan < 0
																? "text-red-500"
																: "text-green-600"
																}`}
														>
															{formatNumber(balanceFromPlan)}
														</td>
													</>
												)}

												<td className="border    px-1 text-center ">
													{!isEdit ? (
														<button
															className="p-1 text-blue-600 hover:text-blue-800 transition"
															onClick={() => startEdit(d)}
															title="Edit"
														>
															<Pencil size={18} />
														</button>
													) : (
														<div className="flex flex-col gap-1 items-center">
															<button
																className="p-1 text-green-600 hover:text-green-800 transition"
																onClick={saveEdit}
																title="Save"
															>
																<Check size={18} />
															</button>
															<button
																className="p-1 text-gray-500 hover:text-gray-700 transition"
																onClick={() => {
																	setEditingKey(null);
																	setEditForm({});
																}}
																title="Cancel"
															>
																<X size={18} />
															</button>
														</div>
													)}

												</td>
											</tr>
										);
									})}

									<tr className="bg-gray-100 font-bold text-2xl text-gray-800">
										<td className="border p-1  text-center" rowSpan={2}>
											รวม
										</td>
										<td className="border p-1  text-center" rowSpan={2}>
											{formatNumber(sumField(items, "manpower"))}
										</td>
										<td className="border p-1  text-center" rowSpan={2}>
											{formatNumber(sumField(items, "shiftReserve"))}
										</td>
										<td
											className="border p-1  text-center bg-amber-200"
											rowSpan={2}
										>
											{formatNumber(
												sumField(items, "manpower") +
												sumField(items, "shiftReserve")
											)}
										</td>
										<td className="border p-1 text-center" rowSpan={2}>
											{formatNumber(sumField(items, "inRoster"))}
										</td>
										<td className="border p-1   text-center bg-amber-200">
											{sumPositive(items, manDiff)}
										</td>

										{/* Leave Sums */}
										{[
											"mSick",
											"mLeave",
											"mVac",
											"otherLeave",
											"dSick",
											"dleave",
											"dVac",
											"dOtherLeave",
										].map((f) => (
											<td key={f} className="border p-1   text-center" rowSpan={2}>
												{formatNumber(sumField(items, f))}
											</td>
										))}

										<td
											className="border p-1   text-center bg-amber-200"
											rowSpan={2}
										>
											{formatNumber(
												[
													"mSick",
													"mLeave",
													"mVac",
													"otherLeave",
													"dSick",
													"dleave",
													"dVac",
													"dOtherLeave",
												].reduce((acc, f) => acc + sumField(items, f), 0)
											)}
										</td>

										{/* OT Sums */}
										{["otOff", "ot8", "otContinue"].map((f) => (
											<td key={f} className="border p-1   text-center" rowSpan={2}>
												{formatNumber(sumField(items, f))}
											</td>
										))}
										<td
											className="border p-1   text-center bg-amber-200"
											rowSpan={2}
										>
											{formatNumber(
												sumField(items, "otOff") +
												sumField(items, "ot8") +
												sumField(items, "otContinue")
											)}
										</td>

										<td className="border p-1   text-center" rowSpan={2}>
											{formatNumber(sumField(items, "manpowerOperate"))}
										</td>
										<td className="border p-1   text-center bg-amber-200">
											{/* -----------------------------------------------------------------------------operateDiff */}
											{sumPositive(items, operateDiff)}
										</td>

										<td className="border p-1   text-center" rowSpan={2}>
											{formatNumber(sumField(items, "reserve_unCount"))}
										</td>
										<td className="border p-1   text-center" rowSpan={2}>
											{formatNumber(sumField(items, "pregUnCount"))}
										</td>

										<td
											className="border p-1   text-center bg-amber-200"
											rowSpan={2}
										>
											{formatNumber(
												sumField(items, "manpowerOperate") +
												sumField(items, "reserve_unCount") +
												sumField(items, "pregUnCount")
											)}
										</td>

										<td className="border p-1   text-center bg-amber-200">
											{/* ---------------------------------------------------------------------------------------------------------FromPlan */}
											{sumPositive(items, diffPlan)}
										</td>
										<td
											className="border p-1   text-center bg-gray-200"
											rowSpan={2}
										></td>
									</tr>
									<tr className="bg-red-100 font-bold text-xl">
										<td className="p-1"> {formatNumber(sumNegative(items, manDiff))}</td>
										<td className="p-1"> {formatNumber(sumNegative(items, operateDiff))}</td>
										<td className="p-1"> {formatNumber(sumNegative(items, diffPlan))}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
