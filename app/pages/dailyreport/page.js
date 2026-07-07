'use client';
import { useState, useEffect } from 'react';

export default function DailyReportEntry() {
  // --- 1. State Management ---
  const [torDetails, setTorDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [criteria, setCriteria] = useState({
    date: '',
    shift_id: '',
    branch_id: '11'
  });

  // State สำหรับเก็บข้อมูลตาม Model DailyReportDetail
  const [formData, setFormData] = useState({
    present_qty: 0, sick_qty: 0, absent_qty: 0, vacation_qty: 0,
    other_leave_qty: 0, ot_dayoff_qty: 0, ot_rest_shift_qty: 0,
    ot_serail_qty: 0, reserve_qty: 0, reserv_ot_qty: 0,
    resverve_serial_qty: 0, uncounted_qty: 0, ojt_qty: 0
  });

  // --- 2. Data Fetching ---
  const fetchTorData = async () => {
    if (!criteria.date || !criteria.shift_id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tor-versions/active?date=${criteria.date}&branch_id=${criteria.branch_id}`);
      const result = await res.json();
      const filtered = result?.data?.torDetails?.filter(
        d => d.shift_id === parseInt(criteria.shift_id)
      ) || [];
      setTorDetails(filtered);
    } catch (err) {
      console.error(err);
      setTorDetails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTorData(); }, [criteria.date, criteria.shift_id]);

  // --- 3. Handlers ---
  const selectedDetail = torDetails.find(d => d.id === parseInt(selectedDetailId));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = async () => {
    if (!selectedDetail) return;
    const payload = {
      ...formData,
      report_id: 1, // กำหนด ID รายงานหลัก (ปรับตามการใช้งานจริง)
      department_id: selectedDetail.department_id,
      shift_id: selectedDetail.shift_id,
      tor_qty: selectedDetail.required_qty
    };
    
    try {
      const res = await fetch('/api/daily-report-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("บันทึกข้อมูลเรียบร้อย!");
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">รายงานกำลังพลประจำวัน</h1>

      {/* ขั้นตอนการเลือก */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="date" className="border p-2 rounded" onChange={(e) => setCriteria({...criteria, date: e.target.value})} />
        <select className="border p-2 rounded" disabled={!criteria.date} onChange={(e) => setCriteria({...criteria, shift_id: e.target.value})}>
          <option value="">-- เลือก Shift --</option>
          <option value="7">เช้า</option>
          <option value="9">ดึก</option>
        </select>
      </div>

      <select className="w-full border p-2 rounded" disabled={!criteria.shift_id} onChange={(e) => setSelectedDetailId(e.target.value)}>
        <option value="">-- เลือกตำแหน่ง --</option>
        {torDetails.map(d => <option key={d.id} value={d.id}>{d.position.name}</option>)}
      </select>

      {/* ฟอร์มกรอกข้อมูล */}
      {selectedDetail && (
        <div className="border p-4 rounded bg-gray-50">
          <p className="font-bold mb-2">TOR Requirement: {selectedDetail.required_qty} คน</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="text-xs uppercase">{key.replace('_qty', '')}</label>
                <input name={key} type="number" className="w-full border p-1 rounded" onChange={handleChange} />
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} className="mt-4 w-full bg-green-600 text-white p-2 rounded">บันทึกรายงาน</button>
        </div>
      )}
    </div>
  );
}