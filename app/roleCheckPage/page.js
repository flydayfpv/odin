"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function RoleCheckPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("odin_token");

    console.log("🔑 token from localStorage:", token);

    if (!token) {
      console.warn("❌ No token → redirect /login");
      router.replace("/odin/Login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      console.log("✅ decoded JWT:", decoded);

      const roleName = decoded?.roleName;
      const divisionId = decoded?.divisionId;
      const exp = decoded?.exp;

      console.log("✅ roleName:", roleName);
      console.log("✅ divisionId:", divisionId);
      console.log("✅ exp:", exp);

      // ===== validate token =====
      if (!roleName) {
        console.warn("❌ Token has no roleName");
        localStorage.removeItem("odin_token");
        router.replace("/odin/Login");
        return;
      }

      // ===== save to localStorage =====
      localStorage.setItem("role", roleName);

      if (divisionId) {
        localStorage.setItem("divisionId", divisionId);
      }

      // ===== redirect =====
      router.replace("/odin/page/Dashboard");

    } catch (err) {
      console.error("❌ JWT decode error:", err);
      localStorage.removeItem("odin_token");
      router.replace("/odin/Login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-gray-600">
      Checking permission...
    </div>
  );
}
