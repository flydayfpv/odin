"use client";
import { useState } from "react";
import CurrentTor from "@/app/components/CurrentTor";

export default function ManpowerReport() {
  const tabs = ["X-Ray", "Guard", "Other"];
  const [activeTab, setActiveTab] = useState("X-Ray");

  return (
    <div className="p-6">
     <div className="flex w-full space-x-8"> {/* Use 'flex' and 'space-x-8' for the main row container */}
    
    {/* From Date Group */}
    <div className="flex flex-col flex-1"> {/* Use 'flex-col' to stack label/input, and 'flex-1' to take up equal space */}
        <label className="text-2xl font-bold mb-4 block">Date</label>
        <input
            type="date"
            className="border border-slate-300 rounded px-3 py-2 w-full"
        />
    </div>
    
  
    
</div>
      {/* Tabs */}
      <div className="flex border-b border-slate-300 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-indigo-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded p-4">
        {activeTab === "X-Ray" && (
          <div>
            <CurrentTor activetab={activeTab} />
            <h3 className="text-lg font-semibold mb-2">X-Ray Unit Report</h3>
            <p className="text-slate-600 text-sm">
              ข้อมูลกำลังพลในหน่วย X-Ray ทั้งหมด...
            </p>
          </div>
        )}

        {activeTab === "Guard" && (
          <div>
            <CurrentTor activetab={activeTab} />
            <h3 className="text-lg font-semibold mb-2">Guard Duty Report</h3>
            <p className="text-slate-600 text-sm">
              ข้อมูลเจ้าหน้าที่รักษาความปลอดภัย...
            </p>
          </div>
        )}

        {activeTab === "Other" && (
          <div>
            <CurrentTor activetab={activeTab} />
            <h3 className="text-lg font-semibold mb-2">
              Other Personnel Report
            </h3>
            <p className="text-slate-600 text-sm">
              ข้อมูลเจ้าหน้าที่ประเภทอื่น ๆ...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
