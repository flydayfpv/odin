"use client";

import React, { useEffect, useState, useMemo } from "react";

export default function DivisionDepartmentShift({ month = 11, year = 2025 }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // Fetch
  // -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://61.7.159.216:9000/odin_api/manpowerplans/getPlan/from/${month}/${year}`
        );
        const json = await res.json();
        setPlans(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  // -------------------------
  // Transform data
  // -------------------------
  const summary = useMemo(() => {
  const result = {};

  plans.forEach((plan) => {
    const divisionName = plan.division?.name || "ไม่ระบุ Division";

    if (!result[divisionName]) {
      result[divisionName] = {};
    }

    (plan.planDetails || []).forEach((d) => {
      const departmentName =
        d.job?.department?.name || "ไม่ระบุ Department";

      const shiftName = d.shift?.name || "อื่นๆ";
      const manpower = Number(d.manpower) || 0;

      if (!result[divisionName][departmentName]) {
        result[divisionName][departmentName] = {
          เช้า: 0,
          บ่าย: 0,
          ดึก: 0,
          อื่นๆ: 0,
        };
      }

      if (result[divisionName][departmentName][shiftName] !== undefined) {
        result[divisionName][departmentName][shiftName] += manpower;
      }
    });
  });

  return result;
}, [plans]);


  // -------------------------
  // Render
  // -------------------------
  if (loading) {
    return <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-4 space-y-10">
      <h2 className="text-xl font-bold text-center">
        สรุปกำลังพล Division → Department → Shift ({month}/{year})
      </h2>

      {Object.entries(summary).map(([division, departments]) => (
        <table
          key={division}
          className="w-full border border-collapse text-sm"
        >
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan={5} className="p-2 text-left text-lg font-bold">
                {division}
              </th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border p-2 text-center">เช้า</th>
              <th className="border p-2 text-center">บ่าย</th>
              <th className="border p-2 text-center">ดึก</th>
              <th className="border p-2 text-center font-semibold">รวม</th>
            </tr>
          </thead>

         <tbody>
  {Object.entries(departments).map(([departmentName, shifts]) => {
    const total = shifts.เช้า + shifts.บ่าย + shifts.ดึก + shifts.อื่นๆ;

    return (
      <tr key={departmentName}>
        <td className="border p-2">{departmentName}</td>
        <td className="border p-2 text-center">{shifts.เช้า || "-"}</td>
        <td className="border p-2 text-center">{shifts.บ่าย || "-"}</td>
        <td className="border p-2 text-center">{shifts.ดึก || "-"}</td>
        <td className="border p-2 text-center font-bold bg-gray-50">
          {total}
        </td>
      </tr>
    );
  })}
</tbody>

        </table>
      ))}
    </div>
  );
}
