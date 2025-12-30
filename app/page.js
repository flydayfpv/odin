'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // clear localStorage
    localStorage.removeItem("role");
    localStorage.removeItem("divisionId");
    localStorage.removeItem("odin_token");

    // redirect ไปหน้า Login
    router.replace("/odin/Login");
  }, [router]);

  return null; // ไม่ต้อง render อะไร
}
