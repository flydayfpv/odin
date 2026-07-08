'use client';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Component ย่อยสำหรับช่องกรอกข้อมูลแบบ Compact
const Field = ({ label, name, onChange }) => (
	<div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
		<label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{label}</label>
		<input
			type="number"
			className="w-full text-2xl font-semibold outline-none"
			placeholder="0"
			onChange={(e) => onChange(name, e.target.value)}
		/>
	</div>
);

export default function DailyReportEntry() {
	const [formData, setFormData] = useState({});
	const [startDate, setStartDate] = useState(new Date());

	const handleInputChange = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	return (
		<div className="p-4 bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-800">รายงานกำลังพล</h1>
				<p className="text-gray-500">กรุณากรอกข้อมูลประจำวัน</p>
			</div>
			<DatePicker
				selected={startDate}
				onChange={(date) => setStartDate(date)}
				dateFormat="dd/MM/yyyy" // กำหนด Format ตรงนี้ได้เลย
				className="border p-2 rounded"
			/>
			
			{/* Form Grid */}
			<div className="grid grid-cols-3 gap-3 mt-3">
				{/* หัวข้อหลัก กำหนด col-span-3 ให้เต็มหน้ากว้าง */}
				<label className="col-span-3 text-[18px] font-bold text-white uppercase bg-blue-500 block py-2 text-center rounded">
					กำลังพล
				</label>

				{/* หัวข้อย่อย */}
				<label className="text-[18px] font-bold text-gray-900 uppercase bg-gray-200 block py-1 text-center rounded">
					ตารางงาน
				</label>
				<label className="text-[18px] font-bold text-gray-900 uppercase bg-gray-200 block py-1 text-center rounded">
					ไม่นับยอด
				</label>
				<label className="text-[18px] font-bold text-gray-900 uppercase bg-gray-200 block py-1 text-center rounded">
					OJT
				</label>

				{/* ช่อง Input */}
				<input
					type="number"
					className="border border-gray-300 rounded p-2 text-center text-2xl font-semibold outline-none"
					placeholder="0"
					onChange={(e) => handleInputChange('sick_morning', e.target.value)}
				/>

				<input
					type="number"
					className="border border-gray-300 rounded p-2 text-center text-2xl font-semibold outline-none"
					placeholder="0"
					onChange={(e) => handleInputChange('sick_morning', e.target.value)}
				/>

				<input
					type="number"
					className="border border-gray-300 rounded p-2 text-center text-2xl font-semibold outline-none"
					placeholder="0"
					onChange={(e) => handleInputChange('sick_morning', e.target.value)}
				/>
			</div>



			<div className="grid grid-cols-4 gap-3 mt-3">

				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-left text-[18px] pl-5">
					ลา </label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">เช้า</label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">บ่าย</label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">ดึก</label>

				{/* Input Fields for Each Leave Type */}
				<label className="text-[10px] font-bold text-gray-900 uppercase block mb-1 w-full text-center text-[18px]">
					ป่วย
				</label>
				<input type="number" className="border  bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className=" border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />


				<label className="text-[10px] font-bold text-gray-900 uppercase block mb-1 w-full text-center text-[18px]">
					พักร้อน
				</label>
				<input type="number" className="border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className=" border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />


				<label className="text-[10px] font-bold text-gray-900 uppercase block mb-1 w-full text-center text-[18px]">
					อื่นๆ
				</label>
				<input type="number" className="border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className=" border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />



			</div>

			<div className="grid grid-cols-4 gap-4 mt-3">
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-left pl-5 text-[18px]">พักไม่นับยอด </label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">เช้า</label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">บ่าย</label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">ดึก</label>

				{/* Input Fields for Each Leave Type */}
				<label className="text-[16px] font-bold text-gray-900 uppercase block mb-1 w-full text-center text-[18px]">
					วันหยุด
				</label>
				<input type="number" className="border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className=" border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />


				<label className="text-[10px] font-bold text-gray-900 uppercase block mb-1 w-full text-center text-[18px]">
					8 พัก 8
				</label>
				<input type="number" className="border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className=" border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />


				<label className="text-[10px] font-bold text-gray-900 uppercase block mb-1 w-full text-center text-[18px]">
					ต่อเนือง
				</label>
				<input type="number" className="border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className=" border bg-white border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />

			</div>



			<div className="grid grid-cols-4 gap-4 mt-3">
				<label className="text-[16px] col-span-4 font-bold text-gray-900 uppercase bg-blue-400 block mb-1 w-full text-center pl-5 text-[18px]">พักไม่นับ </label>

				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-left pl-5 text-[18px]">ทำงาน </label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">OT</label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">ต่อเนื่อง</label>
				<label className="text-[16px] font-bold text-gray-900 uppercase bg-gray-200 block mb-1 w-full text-center text-[18px]">ช่วย</label>
				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />

				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />

				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />

				<input type="number" className="border border-gray-300 rounded w-full text-center text-2xl font-semibold outline-none" placeholder="0" onChange={(e) => handleInputChange('sick_morning', e.target.value)} />


			</div>


			{/* Action Button */}
			<button
				className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:bg-blue-700 transition"
				onClick={() => console.log(formData)}
			>
				บันทึกข้อมูล
			</button>
		</div>
	);
}