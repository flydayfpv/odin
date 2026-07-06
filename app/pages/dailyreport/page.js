'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function DailyReportPage() {

  const [reportDate, setReportDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    );

  const [departments, setDepartments] =
    useState([]);

  const [expandedDepartment,
    setExpandedDepartment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    try {

      const response =
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/departments/report-template`
        );

      setDepartments(
        response.data
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const updateRow = (
    depIndex,
    rowIndex,
    field,
    value
  ) => {

    const temp =
      [...departments];

    temp[depIndex]
      .rows[rowIndex][field] =
      Number(value);

    setDepartments(temp);

  };

  const saveDraft = async () => {

    try {

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/daily-reports`,
        {
          report_date:
            reportDate,
          departments
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'Draft saved successfully'
      });

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });

    }

  };

  const submitReport = async () => {

    const result =
      await Swal.fire({
        title: 'Submit Report ?',
        icon: 'question',
        showCancelButton: true
      });

    if (!result.isConfirmed)
      return;

    Swal.fire({
      icon: 'success',
      title: 'Submitted'
    });

  };

  const summary =
    departments.reduce(
      (acc, dep) => {

        dep.rows.forEach(row => {

          acc.tor += row.tor_qty;

          acc.present +=
            row.present_qty || 0;

        });

        return acc;

      },
      {
        tor: 0,
        present: 0
      }
    );

  const shortage =
    summary.tor -
    summary.present;

  return (

    <div className="p-6">

      {/* HEADER */}

      <div
        className="
        bg-white
        rounded-xl
        shadow
        p-6
        mb-6
      "
      >

        <div
          className="
          flex
          justify-between
          items-center
        "
        >

          <div>

            <h1
              className="
              text-3xl
              font-bold
            "
            >
              Daily Manpower Report
            </h1>

            <p
              className="
              text-slate-500
            "
            >
              ODIN Daily Reporting
            </p>

          </div>

          <input
            type="date"
            value={reportDate}
            onChange={(e) =>
              setReportDate(
                e.target.value
              )
            }
            className="
              border
              rounded-lg
              px-4
              py-2
            "
          />

        </div>

      </div>

      {/* SUMMARY */}

      <div
        className="
        grid
        md:grid-cols-4
        gap-4
        mb-6
      "
      >

        <SummaryCard
          title="TOR"
          value={summary.tor}
        />

        <SummaryCard
          title="Present"
          value={summary.present}
        />

        <SummaryCard
          title="Shortage"
          value={shortage}
        />

        <SummaryCard
          title="Attendance"
          value={
            summary.tor > 0
              ? (
                  summary.present /
                  summary.tor *
                  100
                ).toFixed(1) + '%'
              : '0%'
          }
        />

      </div>

      {/* DEPARTMENTS */}

      {
        departments.map(
          (
            department,
            depIndex
          ) => (

            <div
              key={department.id}
              className="
                bg-white
                rounded-xl
                shadow
                mb-4
              "
            >

              <button
                onClick={() =>
                  setExpandedDepartment(
                    expandedDepartment ===
                      department.id
                      ? null
                      : department.id
                  )
                }
                className="
                  w-full
                  p-4
                  text-left
                  flex
                  justify-between
                "
              >

                <div>

                  <h2
                    className="
                    font-bold
                    text-lg
                  "
                  >
                    {department.name}
                  </h2>

                  <p
                    className="
                    text-sm
                    text-slate-500
                  "
                  >
                    TOR :
                    {' '}
                    {
                      department.rows
                        .reduce(
                          (a, b) =>
                            a +
                            b.tor_qty,
                          0
                        )
                    }
                  </p>

                </div>

                <span>

                  {
                    expandedDepartment ===
                    department.id
                      ? '−'
                      : '+'
                  }

                </span>

              </button>

              {
                expandedDepartment ===
                  department.id && (

                  <div
                    className="
                    border-t
                    overflow-auto
                  "
                  >

                    <table
                      className="
                      w-full
                      text-sm
                    "
                    >

                      <thead>

                        <tr
                          className="
                          bg-slate-100
                        "
                        >

                          <th className="p-3">
                            Position
                          </th>

                          <th className="p-3">
                            Shift
                          </th>

                          <th className="p-3">
                            TOR
                          </th>

                          <th className="p-3">
                            Present
                          </th>

                          <th className="p-3">
                            Sick
                          </th>

                          <th className="p-3">
                            Vacation
                          </th>

                          <th className="p-3">
                            Other
                          </th>

                          <th className="p-3">
                            Shortage
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {
                          department.rows.map(
                            (
                              row,
                              rowIndex
                            ) => {

                              const short =
                                row.tor_qty -
                                (
                                  row.present_qty ||
                                  0
                                );

                              return (

                                <tr
                                  key={
                                    row.id
                                  }
                                  className="
                                  border-t
                                "
                                >

                                  <td className="p-3">
                                    {
                                      row.position
                                    }
                                  </td>

                                  <td className="p-3">
                                    {
                                      row.shift
                                    }
                                  </td>

                                  <td
                                    className="
                                    p-3
                                    bg-slate-100
                                  "
                                  >
                                    {
                                      row.tor_qty
                                    }
                                  </td>

                                  <td className="p-3">

                                    <input
                                      type="number"
                                      value={
                                        row.present_qty ||
                                        ''
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updateRow(
                                          depIndex,
                                          rowIndex,
                                          'present_qty',
                                          e.target
                                            .value
                                        )
                                      }
                                      className="
                                      w-20
                                      border
                                      rounded
                                      px-2
                                      py-1
                                    "
                                    />

                                  </td>

                                  <td className="p-3">

                                    <input
                                      type="number"
                                      value={
                                        row.sick_qty ||
                                        ''
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updateRow(
                                          depIndex,
                                          rowIndex,
                                          'sick_qty',
                                          e.target
                                            .value
                                        )
                                      }
                                      className="
                                      w-20
                                      border
                                      rounded
                                      px-2
                                      py-1
                                    "
                                    />

                                  </td>

                                  <td className="p-3">

                                    <input
                                      type="number"
                                      value={
                                        row.vacation_qty ||
                                        ''
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updateRow(
                                          depIndex,
                                          rowIndex,
                                          'vacation_qty',
                                          e.target
                                            .value
                                        )
                                      }
                                      className="
                                      w-20
                                      border
                                      rounded
                                      px-2
                                      py-1
                                    "
                                    />

                                  </td>

                                  <td className="p-3">

                                    <input
                                      type="number"
                                      value={
                                        row.other_leave_qty ||
                                        ''
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updateRow(
                                          depIndex,
                                          rowIndex,
                                          'other_leave_qty',
                                          e.target
                                            .value
                                        )
                                      }
                                      className="
                                      w-20
                                      border
                                      rounded
                                      px-2
                                      py-1
                                    "
                                    />

                                  </td>

                                  <td
                                    className="
                                    p-3
                                    font-bold
                                    text-red-600
                                  "
                                  >
                                    {short}
                                  </td>

                                </tr>

                              );

                            }
                          )
                        }

                      </tbody>

                    </table>

                  </div>

                )
              }

            </div>

          )
        )
      }

      {/* FOOTER */}

      <div
        className="
        flex
        justify-end
        gap-3
        mt-6
      "
      >

        <button
          onClick={saveDraft}
          className="
          bg-yellow-500
          text-white
          px-6
          py-3
          rounded-lg
        "
        >
          Save Draft
        </button>

        <button
          onClick={submitReport}
          className="
          bg-blue-600
          text-white
          px-6
          py-3
          rounded-lg
        "
        >
          Submit Report
        </button>

      </div>

    </div>

  );

}

function SummaryCard({
  title,
  value
}) {

  return (

    <div
      className="
      bg-white
      shadow
      rounded-xl
      p-4
    "
    >

      <div
        className="
        text-slate-500
        text-sm
      "
      >
        {title}
      </div>

      <div
        className="
        text-3xl
        font-bold
      "
      >
        {value}
      </div>

    </div>

  );

}