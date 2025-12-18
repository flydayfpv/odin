'use client';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MaximumTable({ maximums, onEdit, onDelete }) {


    const handleDeleteClick = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) onDelete(id);
    };

    return (
        <div className="overflow-x-auto bg-white rounded shadow mt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">JOB</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Maximum</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {maximums.map((m, idx) => (
                        <tr key={m.id}>
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2">{m.job?.name || '-'}</td>
                            <td className="px-4 py-2">{m.maximum}</td>
                            <td className="px-4 py-2 space-x-2">
                                <button
                                    onClick={() => onEdit(m)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(m.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {maximums.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">
                                No maximums found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
