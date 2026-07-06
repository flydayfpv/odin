'use client';

import { LuBell } from 'react-icons/lu';

export default function Navbar() {

  return (

    <header
      className="
      bg-white
      border-b
      h-16
      px-6
      flex
      items-center
      justify-between
      "
    >

      <h2 className="font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <LuBell size={20} />

        <div className="text-right">

          <div className="font-medium">
            Admin
          </div>

          <div className="text-xs text-gray-500">
            Super Admin
          </div>

        </div>

      </div>

    </header>

  );

}