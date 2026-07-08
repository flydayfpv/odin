'use client';
import { useState, useEffect } from 'react';

export default function DailyReportEntry() {

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  // --- State Management ---
  const [torDetails, setTorDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState('');
  const [criteria, setCriteria] = useState({ date: '', shift_id: '', branch_id: '11' });
  const [formData, setFormData] = useState({
    present_qty: 0, sick_qty: 0, absent_qty: 0, vacation_qty: 0,
    other_leave_qty: 0, ot_dayoff_qty: 0, ot_rest_shift_qty: 0,
    ot_serail_qty: 0, reserve_qty: 0, reserv_ot_qty: 0,
    resverve_serial_qty: 0, uncounted_qty: 0, ojt_qty: 0, help_qty: 0
  });

  // --- Configuration ---
  const formGroups = [{ name: "กำลังพล", color: "border-rose-500 bg-rose-50", fields: ["present_qty", "uncounted_qty", "ojt_qty"] },
  { name: "การลา", color: "border-blue-500 bg-blue-50", fields: ["sick_qty", "absent_qty", "vacation_qty", "other_leave_qty"] },
  { name: "โอที (OT)", color: "border-orange-500 bg-orange-50", fields: ["ot_dayoff_qty", "ot_rest_shift_qty", "ot_serail_qty"] },
  { name: "สำรอง", color: "border-emerald-500 bg-emerald-50", fields: ["reserve_qty", "reserv_ot_qty", "resverve_serial_qty", "help_qty"] }

  ];

  const labelMapping = {
    present_qty: "กำลังพลตามตารางงาน", sick_qty: "ป่วย", absent_qty: "ขาดงาน", vacation_qty: "พักร้อน",
    other_leave_qty: "อื่นๆ", ot_dayoff_qty: "วันหยุด", ot_rest_shift_qty: "8 พัก 8",
    ot_serail_qty: "ต่อกะ", reserve_qty: "ตารางงาน", reserv_ot_qty: " OT",
    resverve_serial_qty: "ต่อกะ", uncounted_qty: "ไม่นับยอด", ojt_qty: "OJT", help_qty: "ช่วยงาน"
  };

  // --- API Functions ---
  const fetchTorData = async () => {
    if (!criteria.date || !criteria.shift_id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tor-versions/active?date=${criteria.date}&branch_id=${criteria.branch_id}`);
      const result = await res.json();
      const filtered = result?.data?.torDetails?.filter(d => d.shift_id === parseInt(criteria.shift_id)) || [];
      setTorDetails(filtered);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    const selectedDetail = torDetails.find(d => d.id === parseInt(selectedDetailId));
    if (!selectedDetail) return;

    setSaving(true);
    try {
      const res = await fetch('/api/daily-report-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, report_id: 1, department_id: selectedDetail.department_id, shift_id: selectedDetail.shift_id, tor_qty: selectedDetail.required_qty })
      });
      if (res.ok) alert("บันทึกข้อมูลเรียบร้อย!");
      else throw new Error("Save Failed");
    } catch (err) { alert("เกิดข้อผิดพลาด"); } finally { setSaving(false); }
  };

  // --- Effects ---
  useEffect(() => { fetchTorData(); }, [criteria.date, criteria.shift_id]);

  // รีเซ็ตฟอร์มเมื่อเปลี่ยนตำแหน่ง
  useEffect(() => {
    setFormData({ present_qty: 0, sick_qty: 0, absent_qty: 0, vacation_qty: 0, other_leave_qty: 0, ot_dayoff_qty: 0, ot_rest_shift_qty: 0, ot_serail_qty: 0, reserve_qty: 0, reserv_ot_qty: 0, resverve_serial_qty: 0, uncounted_qty: 0, ojt_qty: 0, help_qty: 0 });
  }, [selectedDetailId]);

  const selectedDetail = torDetails.find(d => d.id === parseInt(selectedDetailId));
  const calculateGroupTotal = (fields) => {
    return fields.reduce((sum, key) => sum + (formData[key] || 0), 0);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">รายงานกำลังพลประจำวัน</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="date" className="border p-3 rounded shadow-sm" onChange={(e) => setCriteria({ ...criteria, date: e.target.value })} />
        <select className="border p-3 rounded shadow-sm" onChange={(e) => setCriteria({ ...criteria, shift_id: e.target.value })}>
          <option value="">-- เลือกกะ --</option>
          <option value="7">เช้า</option>
          <option value="8">บ่าย</option>
          <option value="9">ดึก</option>
        </select>
        <select className="border p-3 rounded shadow-sm" onChange={(e) => setSelectedDetailId(e.target.value)}>
          <option value="">-- เลือกตำแหน่ง --</option>
          {torDetails.map(d => <option key={d.id} value={d.id}>{d.position.name}</option>)}
        </select>
      </div>

      {loading && <p className="text-center py-4">กำลังโหลด...</p>}

      {/* Main Form */}
      {selectedDetail && !loading && (
        <div className="space-y-6">
          {/* ส่วนหัวชื่อตำแหน่ง */}
          <div className="bg-blue-600 text-white p-4 rounded-lg flex justify-between shadow-lg">
            <span className="font-bold text-lg">{selectedDetail.position.name}</span>
            <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-bold">TOR: {selectedDetail.required_qty}</span>
          </div>
          <div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className='w-1/7'>TOR</th>
                  <th className='w-1/7'>มีคน</th>
                  <th className='w-1/7'>ขาดตารางงาน</th>
                  <th className='w-1/7'>รวมลา</th>
                  <th className='w-1/7'>รวม OT</th>
                  <th className='w-1/7'>รวมสำรอง</th>
                  <th className='w-1/7'>ส่งขาด/เกิน</th>
                </tr>
                <tr>
                  <td className="text-center">{selectedDetail.required_qty}</td>
                  <td className="text-center">{formData.present_qty}</td>
                  <td className={`text-center ${(selectedDetail.required_qty - formData.present_qty) > 0 ? 'text-gray-600 font-bold bg-red-200' : ''}`}>
                    {selectedDetail.required_qty - formData.present_qty}
                  </td>                
                    <td className="text-center">{formData.sick_qty + formData.absent_qty + formData.vacation_qty + formData.other_leave_qty}</td>
                    <td className="text-center">{formData.overtime_qty}</td>
                    <td className="text-center">{formData.reserved_qty}</td>
                  <td className={`text-center ${(formData.present_qty - formData.sick_qty + formData.absent_qty - formData.vacation_qty - formData.other_leave_qty + formData.overtime_qty) - selectedDetail.required_qty > 0 ? 'text-gray-600 font-bold bg-red-200' : ''}`}>
                    {(formData.present_qty - formData.sick_qty + formData.absent_qty - formData.vacation_qty - formData.other_leave_qty + formData.overtime_qty ) - selectedDetail.required_qty}
                  </td>
                </tr>
              </thead>
            </table>
          </div>
          {/* ตารางแสดงข้อมูล */}
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            {formGroups.map((group) => (
              <div key={group.name} className="flex border-b border-gray-300">
                {/* Header กลุ่ม */}
                <div className="w-32 bg-gray-200 p-4 flex items-center justify-center font-bold text-gray-700 border-r border-gray-300 text-center">
                  {group.name}
                </div>

                {/* ฟิลด์ข้อมูลในกลุ่ม */}
                <div className={`flex-1 grid ${group.name === "กำลังพล" ? "grid-cols-3" : "grid-flow-col auto-cols-fr"}`}>
                  {group.fields.map((key) => (
                    <div key={key} className="border-r border-gray-200 flex flex-col">
                      <label className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50 p-2 text-center border-b border-gray-200">
                        {labelMapping[key]}
                      </label>
                      <input
                        type="number"
                        name={key}
                        value={formData[key]}
                        className="w-full p-2 text-center font-bold text-lg outline-none focus:bg-blue-50"
                        onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  ))}

                  {/* เงื่อนไข: ถ้าไม่ใช่กลุ่ม "กำลังพล" ถึงจะแสดงช่อง รวม */}
                  {/* {group.name !== "กำลังพล" && (
                    <div className="bg-yellow-50 flex flex-col border-l border-gray-300">
                      <label className="text-[10px] uppercase font-bold text-gray-600 p-2 text-center border-b border-gray-300 bg-gray-200">รวม</label>
                      <div className="flex-1 flex items-center justify-center bg-gray-100 font-bold text-lg text-blue-700">
                        {calculateGroupTotal(group.fields)}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit} disabled={saving}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกรายงาน"}
          </button>
        </div>
      )}
    </div>
  );
}