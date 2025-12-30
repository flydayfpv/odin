"use client";

import React, { useEffect, useState, useMemo } from "react";


// ----------------------
// utils
// ----------------------
const formatNumber = (n) => {
	const num = Number(n);
	if (isNaN(num)) return "-";
	return num.toLocaleString();
};
const getDaysInMonth = (month, year) => {
	// month: 1-12
	return new Date(year, month, 0).getDate();
};

const getWeekendCount = (year, month) => {
	let count = 0;
	const days = new Date(year, month, 0).getDate();

	for (let d = 1; d <= days; d++) {
		const day = new Date(year, month - 1, d).getDay();
		if (day === 0 || day === 6) count++;
	}

	return count;
};

const tdClass = "border border-slate-300 p-2";
const tdBoldClass =
	"border border-slate-300 p-2 text-center font-bold text-slate-700 bg-slate-50/50";



export default function ManpowerSummary() {

	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	const now = new Date();
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [year, setYear] = useState(now.getFullYear());
	const [plans, setPlans] = useState([]);
	const [summary, setSummary] = useState([]);
	const [loading, setLoading] = useState(false);
	const [reportDate, setReportDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [divisionId, setDivisionId] = useState(null);
	const [maximum, setMaximum] = useState([]);
	const [planId, setPlanId] = useState(null);

	useEffect(() => {
		const id = localStorage.getItem("divisionId");
		setDivisionId(id);
	}, []);


	useEffect(() => {
		const getMaximum = async () => {
			if (!planId) return;

			try {
				const res = await fetch(`${API_URL}/maximum/plan/${planId}`);
				if (!res.ok) throw new Error("Fetch failed");

				const data = await res.json();
				setMaximum(data);
			} catch (err) {
				console.error("Error fetching maximum:", err);
			}
		};

		getMaximum();
	}, [planId]);



	useEffect(() => {
		if (!divisionId) return; // 🔥 สำคัญมาก

		const load = async () => {
			setLoading(true);
			try {
				const [planRes, sumRes] = await Promise.all([
					fetch(
						`http://61.7.159.216:9000/odin_api/manpowerplans/getPlan/from/${month}/${year}?divisionId=${divisionId}`
					),
					fetch(
						`http://61.7.159.216:9000/odin_api/summary/monthly?month=${month}&year=${year}&divisionId=${divisionId}`
					),
				]);

				const planJson = await planRes.json();
				const sumJson = await sumRes.json();

				setPlans(planJson.data || []);
				const planId = planJson.data[0].planDetails[0].planId;
				setPlanId(planId);

				setSummary(sumJson.data || []);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [month, year, divisionId]);


	const summaryMap = useMemo(() => {
		const map = {};
		summary.forEach((r) => {
			const key = `${r.divisionId}-${r.jobId ?? "null"}`;
			map[key] = r;
		});
		return map;
	}, [summary]);

	const maximumMap = useMemo(() => {
  const map = {};
  maximum.forEach((m) => {
    map[m.jobId] = Number(m.maximum) || 0;
  });
  return map;
}, [maximum]);


	const tableData = useMemo(() => {
		return plans.map((plan) => {
			const jobs = {};
			plan.planDetails?.forEach((d) => {
				const jobId = d.job?.id ?? "null";
				const jobName = d.job?.name || "งานทั่วไป";
				const shiftName = d.shift?.name;
				const manpower = Number(d.manpower) || 0;

				if (!jobs[jobId]) {
					const sum = summaryMap[`${plan.divisionId}-${jobId}`] || {};
					jobs[jobId] = {
						jobId,
						jobName,
						morning: 0, afternoon: 0, night: 0,

						ShiftReserve: 0,


						// รายเดือน (Monthly - m)
						mSick: Number(sum.mSick) || 0,
						mLeave: Number(sum.mLeave) || 0,
						mVac: Number(sum.mVac) || 0,
						mOther: Number(sum.otherLeave) || 0,
						// รายวัน (Daily - d)
						dSick: Number(sum.dSick) || 0,
						dLeave: Number(sum.dleave) || 0, // ตาม JSON key: dleave
						dVac: Number(sum.dVac) || 0,
						dOther: Number(sum.dOtherLeave) || 0,
						// รวมและอื่นๆ
						leaveTotal: Number(sum.leaveTotal) || 0,
						otOff: Number(sum.otOff) || 0,
						ot8: Number(sum.ot8) || 0,
						otContinue: Number(sum.otContinue) || 0,
						otTotal: Number(sum.otTotal) || 0,
						operate: Number(sum.manpowerOperate) || 0,
						reserve: Number(sum.reserve_unCount) || 0,
						preg: Number(sum.pregUnCount) || 0,
					};
				}
				if (shiftName === "เช้า") jobs[jobId].morning += manpower;
				if (shiftName === "บ่าย") jobs[jobId].afternoon += manpower;
				if (shiftName === "ดึก") jobs[jobId].night += manpower;
			});
			return {
				divisionId: plan.divisionId,
				divisionName: plan.division?.name || "ไม่ระบุ",
				divisionShort: plan.division?.shortText || "",
				jobs: Object.values(jobs),
			};
		});
	}, [plans, summaryMap]);

	return (
		<div className="max-w-full mx-auto p-4 space-y-4 bg-slate-50 min-h-screen">
			<div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
				<h1 className="text-xl font-bold text-slate-800">สรุปสถิติกำลังพล (รายเดือน)</h1>
				<div className="text-sm text-slate-500">ข้อมูลประจำเดือน {month}/{year}</div>
				<div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg border">
					<div className="flex items-center gap-2">
						<label className="font-bold text-gray-700 whitespace-nowrap">เดือน:</label>
						<select
							className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
							value={month}
							onChange={(e) => setMonth(Number(e.target.value))}
						>
							{Array.from({ length: 12 }, (_, i) => (
								<option key={i + 1} value={i + 1}>
									{new Date(0, i).toLocaleString('th-TH', { month: 'long' })}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-center gap-2">
						<label className="font-bold text-gray-700">ปี (ค.ศ.):</label>
						<input
							type="number"
							className="border border-gray-300 rounded px-2 py-1 w-24 focus:ring-2 focus:ring-blue-500 outline-none"
							value={year}
							onChange={(e) => setYear(Number(e.target.value))}
						/>
					</div>
				</div>
			</div>



			<div className="overflow-x-auto bg-white border rounded-xl shadow-md">
				<table className="min-w-full table-auto border-collapse bg-white">
					<thead>
						{/* ROW 1: หัวข้อหลัก - เน้นความหนาของเส้นขอบด้านล่างเพื่อแบ่งกลุ่ม */}
						<tr className="text-[16px] font-bold text-slate-800">
							<th colSpan={3} className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-white">
								งวดที่ ...
							</th>

							<th colSpan={3} rowSpan="2" className="border border-slate-300  px-2 py-3 text-center text-blue-500 bg-white">
								แผนกำลังพลตาม TOR
							</th>
							<th className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">
								A
							</th>

							<th colSpan="2" rowSpan="2" className="border border-slate-300  px-2 py-3 text-center text-blue-500 bg-white">
								บรท.บริหารเอง
							</th>

							<th colSpan="3" className="border border-slate-300  px-2 py-3 text-center text-blue-500 bg-white">
								รอบ วันที่ 1 ถึง วันสิ้นเดือน
							</th>
							<th className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">1</th>
							<th className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">B</th>
							<th colSpan="2" className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">C</th>

							<th colSpan="2" rowSpan="2" className="border border-slate-300  px-2 py-3 text-center text-blue-500 bg-white">
								ตารางและจำนวนวันทำงาน
							</th>

							<th colSpan="2" className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">2</th>

							<th rowSpan="4" className="border border-slate-400 px-3 py-3 text-center text-blue-500 bg-white">
								ส่งแรง
							</th>

							<th className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">D</th>
							<th colSpan="2" className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">E</th>
							<th colSpan="2" className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">F</th>
							<th className="border border-slate-300 px-2 py-3 text-center text-blue-500 bg-gray-200">G</th>

							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">3</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">4</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">5</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">6</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">7</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">8</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">9</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">10</th>
							<th colSpan="2" className="border border-slate-200 px-2 py-3 text-center text-blue-500 bg-gray-200">11</th>
						</tr>

						{/* ROW 2: รายละเอียดรอง */}
						<tr className="text-[14px] font-semibold text-slate-600 bg-white">
							<th colSpan={3} className="border border-slate-300 px-2 py-2 text-center">ประจำเดือน</th>


							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center text-blue-700">กำลังพลตาม TOR</th>

							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center text-blue-700">วันทำงาน</th>

							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center text-indigo-700">วันหยุด ทอท.</th>
							<th className="border border-slate-300 px-2 py-2 text-center text-indigo-700">จำนวนแรงจ้าง</th>
							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center text-indigo-700">กรอบอนุมัติ</th>

							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">เฉพาะที่ส่งนับยอดได้</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">ตามตารางงาน</th>
							<th className="border border-slate-300 px-2 py-2 text-center text-rose-600">ส่วนต่าง</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">พนักงานลาออก</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">กำลังพลระหว่างอบรม</th>
							<th className="border border-slate-300 px-2 py-2 text-center text-rose-600">สรรหาเพิ่มเติม</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">ส่วนต่าง เกิน/-ขาด</th>
							<th colSpan={4} className="border border-slate-300 px-2 py-2 text-center">จำนวนแรง ขาด ลา ทุกประเภท</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center text-gray-700">ขาด ลา (แรง)</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">OT 1 เท่า</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">OT 1.5 เท่า</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">OT 2 เท่า</th>
							<th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">OT รวม (แรง)</th>
							<th colSpan={2} rowSpan={2} className="border border-slate-300 px-2 py-2 text-center text-red-600">ส่งขาด (แรง)</th>
						</tr>

						{/* ROW 3: รายละเอียดลึกสุด */}
						<tr className="text-[12px] font-[14px] text-slate-500 bg-gray-100">
							<th className="border border-slate-300 px-2 py-1 text-center">ลำดับ</th>
							<th className="border border-slate-300 px-2 py-1 text-center">หน่วยงาน</th>
							<th className="border border-slate-300 px-2 py-1 text-center">ส่วนงาน</th>

							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center">เช้า</th>
							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center">บ่าย</th>
							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center">ดึก</th>
							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center text-blue-700">พัก</th>
							<th rowSpan={2} className="border border-slate-300 px-2 py-2 text-center text-blue-700">หยุด</th>
							<th className="border border-slate-300 px-2 py-1 text-center text-indigo-600">ส./อา.</th>
							<th className="border border-slate-300 px-2 py-1 text-center text-indigo-600">นักขัตฤกษ์</th>

							<th className="border border-slate-300 px-2 py-1 text-center">{getDaysInMonth(month, year)} วัน</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center"> % </th>
							<th className="border border-slate-300 px-2 py-1 text-center">ตาราง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">วัน</th>
							<th className="border border-slate-300 px-2 py-1 text-center">นับยอดได้</th>
							<th className="border border-slate-300 px-2 py-1 text-center"> % </th>
							<th className="border border-slate-300 px-2 py-1 text-center">B - A</th>
							<th className="border border-slate-300 px-2 py-1 text-center">{"Month"}</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">OJT</th>
							<th className="border border-slate-300 px-2 py-1 text-center">อบรม</th>
							<th className="border border-slate-300 px-2 py-1 text-center">กรอบ ปีที่ 1/2(2)</th>
							<th className="border border-slate-300 px-2 py-1 text-center">(2 - 1)</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>
							<th className="border border-slate-300 px-2 py-1 text-center">แรง</th>
							<th className="border border-slate-300 px-2 py-1 text-center">%</th>


						</tr>
					</thead>

					<tbody>
						{tableData.map((div, i) =>
							div.jobs.map((j, idx) => (
								<tr
									key={`${div.divisionId}-${j.jobId}`}
									className="border-b border-slate-300 hover:bg-slate-50 text-center text-[14px]"
								>
									{idx === 0 && (
										<>
											<td rowSpan={div.jobs.length} className="border-r p-2">
												{i + 1}
											</td>
											<td
												rowSpan={div.jobs.length}
												className="border-r p-2 font-bold text-slate-700 bg-slate-50/50"
											>
												{div.divisionShort}
											</td>
										</>
									)}

									<td className="border-r p-2 text-left whitespace-nowrap">
										{j.jobName}
									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										{formatNumber(j.morning)}
									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										{formatNumber(j.afternoon)}
									</td>

									<td className="border-r p-2">
										{formatNumber(j.night)}
									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										{formatNumber(
											(Number(j.morning) || 0) +
											(Number(j.afternoon) || 0) +
											(Number(j.night) || 0)
										)}
									</td>

									<td className="border-r p-2">---</td>
									<td className="border-r p-2">
										Plan ID {planId} <br/>
										Job Id: {j.jobId || 0} <br/>
										Shift Id: {j.shiftName || 0}
										

									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										{getDaysInMonth(month, year)}
									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										{getWeekendCount(year, month)}
									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										นักขัตฤกษ์
									</td>

									<td className="border-r p-2 font-bold bg-slate-50/50">
										{(
											((Number(j.morning) || 0) +
												(Number(j.afternoon) || 0) +
												(Number(j.night) || 0)) *
											(Number(getDaysInMonth(month, year)) || 0)
										)}
									</td>

									{/* columns "-" ต่อได้ตามเดิม ไม่มีผลแล้ว */}
									<td className="border-r p-2">-</td>
									<td className="border-r p-2">Sum</td>
								</tr>
							))
						)}
					</tbody>

				</table>
			</div>
			<p className="text-[11px] text-slate-400">* หมายเหตุ: m = พนักงานรายเดือน, d = พนักงานรายวัน | ข้อมูลรวมคำนวณจาก API สรุปรายเดือน</p>



		</div>
	);
}