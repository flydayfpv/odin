'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    LuPlus,
    LuPencil,
    LuTrash2,
    LuX,
    LuSave
} from 'react-icons/lu';

export default function TORDetailPage() {
    const [editingRow, setEditingRow] = useState(null);
    const [editForm, setEditForm] = useState({
        department_id: '',
        position_id: '',
        shift_id: '',
        required_qty: 0
    });
    const params = useParams();

    const [groups, setGroups] =
        useState({});

    const [departments, setDepartments] =
        useState([]);

    const [positions, setPositions] =
        useState([]);

    const [shifts, setShifts] =
        useState([]);

    const [showAddDialog, setShowAddDialog] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [form, setForm] =
        useState({
            department_id: '',
            position_id: '',
            shift_id: '',
            required_qty: 0
        });

    useEffect(() => {

        loadMaster();
        loadData();

    }, []);


    const openEdit = async (row) => {

        try {

            await loadPositions(
                row.department_id
            );

            setEditForm({

                department_id:
                    row.department_id,

                position_id:
                    row.position_id,

                shift_id:
                    row.shift_id,

                required_qty:
                    row.required_qty

            });

            setEditingRow(row);

        } catch (error) {

            console.error(error);

        }

    };

    const updateDetail = async () => {

        try {

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tor-details/${editingRow.id}`,
                {

                    department_id:
                        Number(editForm.department_id),

                    position_id:
                        Number(editForm.position_id),

                    shift_id:
                        Number(editForm.shift_id),

                    required_qty:
                        Number(editForm.required_qty)

                }
            );

            await Swal.fire({
                icon: 'success',
                title: 'Updated Successfully',
                timer: 1500,
                showConfirmButton: false
            });

            setEditingRow(null);

            loadData();

        } catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text:
                    error.response?.data?.message ||
                    error.message
            });

        }

    };

    const loadMaster = async () => {

        try {

            const [depRes, shiftRes] =
                await Promise.all([

                    axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/departments`
                    ),

                    axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/shifts`
                    )

                ]);

            setDepartments(depRes.data);
            setShifts(shiftRes.data);

        } catch (error) {

            console.error(error);

        }

    };

    const loadPositions = async (
        departmentId
    ) => {

        try {

            const response =
                await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${departmentId}/positions`
                );

            setPositions(
                response.data
            );

        } catch (error) {

            console.error(error);

        }

    };

    const loadData = async () => {

        try {

            setLoading(true);

            const response =
  await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tor-details/version/${params.id}`
  );

const details =
  response.data.data || response.data;

const grouped = {};

details.forEach(item => {

                const dep =
                    item.department?.name ||
                    'Unknown';

                const pos =
                    item.position?.name ||
                    'Unknown';

                if (!grouped[dep]) {
                    grouped[dep] = {};
                }

                if (!grouped[dep][pos]) {
                    grouped[dep][pos] = [];
                }

                grouped[dep][pos].push(item);

            });

            setGroups(grouped);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };


    const buildMatrix = (data) => {

        const result = {};

        data.forEach(item => {

            const dep =
                item.department?.name;

            const pos =
                item.position?.name;

            if (!result[dep]) {
                result[dep] = {};
            }

            if (!result[dep][pos]) {

                result[dep][pos] = {
                    เช้า: 0,
                    บ่าย: 0,
                    ดึก: 0
                };

            }

            result[dep][pos][item.shift.name] =
                item.required_qty;

        });

        return result;

    };

    const saveNew = async () => {

        try {

            if (
                !form.department_id ||
                !form.position_id ||
                !form.shift_id
            ) {

                return Swal.fire({
                    icon: 'warning',
                    title: 'Incomplete Data',
                    text:
                        'Please select Department, Position and Shift'
                });

            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tor-details`,
                {

                    tor_version_id:
                        Number(params.id),

                    department_id:
                        Number(form.department_id),

                    position_id:
                        Number(form.position_id),

                    shift_id:
                        Number(form.shift_id),

                    required_qty:
                        Number(form.required_qty)

                }
            );

            await Swal.fire({
                icon: 'success',
                title: 'Saved Successfully',
                timer: 1500,
                showConfirmButton: false
            });

            setShowAddDialog(false);

            setForm({
                department_id: '',
                position_id: '',
                shift_id: '',
                required_qty: 0
            });

            loadData();

        } catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text:
                    error.response?.data?.message ||
                    error.message
            });

        }

    };

    const deleteRow = async (id) => {

        const result =
            await Swal.fire({

                title: 'Delete Record?',

                text:
                    'This action cannot be undone',

                icon: 'warning',

                showCancelButton: true,

                confirmButtonText: 'Delete',

                cancelButtonText: 'Cancel',

                confirmButtonColor: '#dc2626'

            });

        if (!result.isConfirmed)
            return;

        try {

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tor-details/${id}`
            );

            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                timer: 1500,
                showConfirmButton: false
            });

            loadData();

        } catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text:
                    error.response?.data?.message ||
                    error.message
            });

        }

    };

    return (

        <div className="p-6">

            {/* HEADER */}

            <div className="flex justify-between mb-6">

                <div>

                    <h1 className="text-3xl font-bold">

                        TOR Detail Matrix

                    </h1>

                    <p className="text-slate-500">

                        TOR Version #{params.id}

                    </p>

                </div>

                <button
                    onClick={() =>
                        setShowAddDialog(true)
                    }
                    className="
            flex items-center gap-2
            bg-green-600
            text-white
            px-5 py-3
            rounded-xl
          "
                >

                    <LuPlus />

                    Add Position

                </button>

            </div>

            {/* DATA */}

            {

                loading
                    ? (
                        <div>
                            Loading...
                        </div>
                    )
                    : Object.keys(groups).map(
                        department => (

                            <div
                                key={department}
                                className="
                  bg-white
                  rounded-xl
                  shadow
                  mb-8
                  overflow-hidden
                "
                            >

                                <div
                                    className="
                    bg-blue-600
                    text-white
                    px-6 py-4
                    font-semibold
                  "
                                >

                                    {department}

                                </div>

                                <table className="w-full">

                                    <thead>

                                        <tr
                                            className="
                        bg-slate-100
                      "
                                        >

                                            <th className="p-4 text-left">
                                                Position
                                            </th>

                                            <th className="p-4 text-left">
                                                Shift
                                            </th>

                                            <th className="p-4 text-left">
                                                Required
                                            </th>

                                            <th className="p-4 text-center">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {
                                            Object.entries(
                                                groups[
                                                department
                                                ]
                                            ).map(
                                                ([position, rows]) =>

                                                    rows.map(
                                                        (
                                                            row,
                                                            index
                                                        ) => (

                                                            <tr
                                                                key={row.id}
                                                                className="border-t"
                                                            >

                                                                {

                                                                    index === 0 &&
                                                                    (

                                                                        <td
                                                                            rowSpan={
                                                                                rows.length
                                                                            }
                                                                            className="
                                        p-4
                                        font-medium
                                        align-top
                                        border-r
                                      "
                                                                        >

                                                                            {
                                                                                position
                                                                            }

                                                                        </td>

                                                                    )

                                                                }

                                                                <td className="p-4">

                                                                    {
                                                                        row.shift?.name
                                                                    }

                                                                </td>

                                                                <td className="p-4">

                                                                    {
                                                                        row.required_qty
                                                                    }

                                                                </td>

                                                                <td className="p-4">

                                                                    <div
                                                                        className="
                                      flex
                                      justify-center
                                      gap-2
                                    "
                                                                    >

                                                                        <button
                                                                            onClick={() =>
                                                                                openEdit(row)
                                                                            }
                                                                            className="
    p-2
    rounded-lg
    bg-yellow-100
    hover:bg-yellow-200
  "
                                                                        >
                                                                            <LuPencil />
                                                                        </button>

                                                                        <button
                                                                            onClick={() =>
                                                                                deleteRow(
                                                                                    row.id
                                                                                )
                                                                            }
                                                                            className="
                                        p-2
                                        rounded-lg
                                        bg-red-100
                                      "
                                                                        >

                                                                            <LuTrash2 />

                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )
                                            )
                                        }

                                    </tbody>

                                </table>

                            </div>

                        )
                    )

            }

            {/* ADD DIALOG */}

            {

                showAddDialog && (

                    <div
                        className="
              fixed inset-0
              bg-black/50
              flex
              items-center
              justify-center
              z-50
            "
                    >

                        <div
                            className="
                bg-white
                rounded-xl
                w-full
                max-w-xl
                p-6
              "
                        >

                            <div
                                className="
                  flex
                  justify-between
                  mb-6
                "
                            >

                                <h2
                                    className="
                    text-xl
                    font-bold
                  "
                                >

                                    Add Position

                                </h2>

                                <button
                                    onClick={() =>
                                        setShowAddDialog(
                                            false
                                        )
                                    }
                                >

                                    <LuX />

                                </button>

                            </div>

                            <div className="space-y-4">

                                {/* DEPARTMENT */}

                                <select
                                    value={
                                        form.department_id
                                    }
                                    onChange={async e => {

                                        const depId =
                                            e.target.value;

                                        setForm({
                                            ...form,
                                            department_id:
                                                depId,
                                            position_id: ''
                                        });

                                        await loadPositions(
                                            depId
                                        );

                                    }}
                                    className="
                    w-full
                    border
                    rounded-lg
                    px-4 py-3
                  "
                                >

                                    <option value="">
                                        Select Department
                                    </option>

                                    {
                                        departments.map(
                                            dep => (

                                                <option
                                                    key={dep.id}
                                                    value={dep.id}
                                                >

                                                    {dep.name}

                                                </option>

                                            )
                                        )
                                    }

                                </select>

                                {/* POSITION */}

                                <select
                                    value={
                                        form.position_id
                                    }
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            position_id:
                                                e.target.value
                                        })
                                    }
                                    className="
                    w-full
                    border
                    rounded-lg
                    px-4 py-3
                  "
                                >

                                    <option value="">
                                        Select Position
                                    </option>

                                    {
                                        positions.map(
                                            pos => (

                                                <option
                                                    key={pos.id}
                                                    value={pos.id}
                                                >

                                                    {pos.code}
                                                    {' - '}
                                                    {pos.name}

                                                </option>

                                            )
                                        )
                                    }

                                </select>

                                {/* SHIFT */}

                                <select
                                    value={form.shift_id}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            shift_id:
                                                e.target.value
                                        })
                                    }
                                    className="
                    w-full
                    border
                    rounded-lg
                    px-4 py-3
                  "
                                >

                                    <option value="">
                                        Select Shift
                                    </option>

                                    {
                                        shifts.map(
                                            shift => (

                                                <option
                                                    key={shift.id}
                                                    value={shift.id}
                                                >

                                                    {shift.name}

                                                </option>

                                            )
                                        )
                                    }

                                </select>

                                {/* QTY */}

                                <input
                                    type="number"
                                    placeholder="Required Qty"
                                    value={
                                        form.required_qty
                                    }
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            required_qty:
                                                e.target.value
                                        })
                                    }
                                    className="
                    w-full
                    border
                    rounded-lg
                    px-4 py-3
                  "
                                />

                            </div>

                            <div
                                className="
                  flex
                  justify-end
                  gap-3
                  mt-6
                "
                            >

                                <button
                                    onClick={() =>
                                        setShowAddDialog(
                                            false
                                        )
                                    }
                                    className="
                    px-5 py-3
                    bg-gray-200
                    rounded-lg
                  "
                                >

                                    Cancel

                                </button>

                                <button
                                    onClick={saveNew}
                                    className="
                    flex items-center gap-2
                    bg-blue-600
                    text-white
                    px-5 py-3
                    rounded-lg
                  "
                                >

                                    <LuSave />

                                    Save

                                </button>

                            </div>

                        </div>

                    </div>

                )

            }


            {
                editingRow && (

                    <div
                        className="
        fixed inset-0
        bg-black/50
        flex items-center
        justify-center
        z-50
      "
                    >

                        <div
                            className="
          bg-white
          rounded-xl
          w-full
          max-w-xl
          p-6
        "
                        >

                            <h2
                                className="
            text-xl
            font-bold
            mb-6
          "
                            >
                                Edit TOR Detail
                            </h2>

                            <div className="space-y-4">

                                <select
                                    value={
                                        editForm.department_id
                                    }
                                    className="
              w-full
              border
              rounded-lg
              px-4 py-3
            "
                                    disabled
                                >

                                    {departments.map(dep => (

                                        <option
                                            key={dep.id}
                                            value={dep.id}
                                        >
                                            {dep.name}
                                        </option>

                                    ))}

                                </select>

                                <select
                                    value={
                                        editForm.position_id
                                    }
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            position_id:
                                                e.target.value
                                        })
                                    }
                                    className="
              w-full
              border
              rounded-lg
              px-4 py-3
            "
                                >

                                    {positions.map(pos => (

                                        <option
                                            key={pos.id}
                                            value={pos.id}
                                        >
                                            {pos.code} - {pos.name}
                                        </option>

                                    ))}

                                </select>

                                <select
                                    value={
                                        editForm.shift_id
                                    }
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            shift_id:
                                                e.target.value
                                        })
                                    }
                                    className="
              w-full
              border
              rounded-lg
              px-4 py-3
            "
                                >

                                    {shifts.map(shift => (

                                        <option
                                            key={shift.id}
                                            value={shift.id}
                                        >
                                            {shift.name}
                                        </option>

                                    ))}

                                </select>

                                <input
                                    type="number"
                                    value={
                                        editForm.required_qty
                                    }
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            required_qty:
                                                e.target.value
                                        })
                                    }
                                    className="
              w-full
              border
              rounded-lg
              px-4 py-3
            "
                                />

                            </div>

                            <div
                                className="
            flex
            justify-end
            gap-3
            mt-6
          "
                            >

                                <button
                                    onClick={() =>
                                        setEditingRow(null)
                                    }
                                    className="
              px-5 py-3
              bg-gray-200
              rounded-lg
            "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={updateDetail}
                                    className="
              bg-blue-600
              text-white
              px-5 py-3
              rounded-lg
            "
                                >
                                    Update
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}