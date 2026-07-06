'use client';

export default function BranchSelect({
  branches = [],
  value = '',
  onChange,
  required = false
}) {

  return (

    <select
      value={value}
      onChange={onChange}
      required={required}
      className="
        w-full
        border
        border-slate-300
        rounded-lg
        px-4
        py-3
        focus:ring-2
        focus:ring-blue-500
        focus:outline-none
      "
    >

      <option value="">
        Select Branch
      </option>

      {branches.map((branch) => (

        <option
          key={branch.id}
          value={branch.id}
        >
          {branch.code} - {branch.name_th}
        </option>

      ))}

    </select>

  );

}