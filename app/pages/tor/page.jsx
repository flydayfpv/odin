'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuEye
} from 'react-icons/lu';

export default function TORPage() {

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tors, setTors] = useState([]);

  const loadData = async () => {

    try {

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tor-versions`
      );

      setTors(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadData();

  }, []);

  const deleteTOR = async (id) => {

    if (!confirm('Delete TOR Version ?'))
      return;

    try {

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tor-versions/${id}`
      );

      loadData();

    } catch (error) {

      alert(error.response?.data?.message);

    }

  };

  const filteredData = tors.filter(item =>

    item.version_name
      ?.toLowerCase()
      .includes(search.toLowerCase())

  );

  return (

    <div className="p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            TOR Versions
          </h1>

          <p className="text-slate-500">
            Manage TOR Requirement
          </p>

        </div>

        <Link
          href="/pages/tor/create"
          className="
            flex items-center gap-2
            bg-blue-600 hover:bg-blue-700
            text-white
            px-5 py-3
            rounded-xl
          "
        >
          <LuPlus />
          Create TOR
        </Link>

      </div>

      {/* Search */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="relative">

          <LuSearch
            className="
              absolute
              left-3
              top-3.5
              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Search Version..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              border
              rounded-lg
              pl-10
              py-3
            "
          />

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                ID
              </th>

              <th className="p-4 text-left">
                Branch
              </th>

              <th className="p-4 text-left">
                Version
              </th>

              <th className="p-4 text-left">
                Effective Start
              </th>

              <th className="p-4 text-left">
                Effective End
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan="7"
                  className="
                    text-center
                    p-10
                  "
                >
                  Loading...
                </td>

              </tr>

            )}

            {!loading &&
              filteredData.length === 0 && (

              <tr>

                <td
                  colSpan="7"
                  className="
                    text-center
                    p-10
                    text-gray-500
                  "
                >
                  No Data
                </td>

              </tr>

            )}

            {filteredData.map(item => (

              <tr
                key={item.id}
                className="
                  border-t
                  hover:bg-slate-50
                "
              >

                <td className="p-4">
                  {item.id}
                </td>

                <td className="p-4">
                  {item.branch?.name_th}
                </td>

                <td className="p-4 font-medium">
                  {item.version_name}
                </td>

                <td className="p-4">
                  {item.effective_start
                    ? new Date(
                        item.effective_start
                      ).toLocaleDateString('th-TH')
                    : '-'}
                </td>

                <td className="p-4">
                  {item.effective_end
                    ? new Date(
                        item.effective_end
                      ).toLocaleDateString('th-TH')
                    : '-'}
                </td>

                <td className="p-4">

                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs
                      ${
                        item.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }
                    `}
                  >
                    {item.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-2">

                    <Link
                      href={`/pages/tor/${item.id}/details`}
                      className="
                        p-2
                        rounded-lg
                        bg-slate-100
                        hover:bg-slate-200
                      "
                    >
                      <LuEye />
                    </Link>

                    <Link
                      href={`/tor/${item.id}/edit`}
                      className="
                        p-2
                        rounded-lg
                        bg-yellow-100
                        hover:bg-yellow-200
                      "
                    >
                      <LuPencil />
                    </Link>

                    <button
                      onClick={() =>
                        deleteTOR(item.id)
                      }
                      className="
                        p-2
                        rounded-lg
                        bg-red-100
                        hover:bg-red-200
                      "
                    >
                      <LuTrash2 />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}