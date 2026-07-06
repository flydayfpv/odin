'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import {
  LuSave,
  LuArrowLeft
} from 'react-icons/lu';

import BranchSelect from '@/app/components/BranchSelect';

export default function CreateTORPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);

  const [form, setForm] = useState({
    branch_id: '',
    version_name: '',
    effective_start: '',
    effective_end: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {

    try {

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/branches`
      );

      setBranches(res.data);

    } catch (err) {

      console.error(err);

    }

  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSave = async () => {

    try {

      setLoading(true);

      const response =
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tor-versions`,
          {
            branch_id:
              Number(form.branch_id),

            version_name:
              form.version_name,

            effective_start:
              form.effective_start,

            effective_end:
              form.effective_end,

            status:
              form.status
          }
        );

      alert('TOR Created');

      router.push(
        `/tor/${response.data.id}/details`
      );

    } catch (error) {

      console.error(error);

      alert(
        error?.response?.data?.message ||
        'Save Failed'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="p-6">

      <div className="flex justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Create TOR Version
          </h1>

          <p className="text-slate-500">
            Create New TOR Plan
          </p>

        </div>

        <button
          onClick={() => router.back()}
          className="
            flex
            items-center
            gap-2
            border
            px-4
            py-2
            rounded-lg
          "
        >
          <LuArrowLeft />
          Back
        </button>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <div className="grid md:grid-cols-2 gap-5">

          <div>

            <label className="block mb-2">
              Branch
            </label>

            <BranchSelect
              branches={branches}
              value={form.branch_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  branch_id: e.target.value
                })
              }
            />

          </div>

          <div>

            <label className="block mb-2">
              Version Name
            </label>

            <input
              type="text"
              name="version_name"
              value={form.version_name}
              onChange={handleChange}
              placeholder="TOR 2026 V1"
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
              "
            />

          </div>

          <div>

            <label className="block mb-2">
              Effective Start
            </label>

            <input
              type="date"
              name="effective_start"
              value={form.effective_start}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
              "
            />

          </div>

          <div>

            <label className="block mb-2">
              Effective End
            </label>

            <input
              type="date"
              name="effective_end"
              value={form.effective_end}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
              "
            />

          </div>

          <div>

            <label className="block mb-2">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
              "
            >
              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="INACTIVE">
                INACTIVE
              </option>

            </select>

          </div>

        </div>

        <div className="mt-8">

          <button
            onClick={handleSave}
            disabled={loading}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-6
              py-3
              rounded-lg
              flex
              items-center
              gap-2
            "
          >

            <LuSave />

            {
              loading
                ? 'Saving...'
                : 'Save TOR'
            }

          </button>

        </div>

      </div>

    </div>

  );

}