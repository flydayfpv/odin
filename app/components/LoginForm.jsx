'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  FaUserShield,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

import {
  LuUser,
  LuLock
} from 'react-icons/lu';

import axios from 'axios';

export default function LoginForm() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleLogin = async (e) => {

  e.preventDefault();

  try {

    setLoading(true);

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      form
    );

    const token = data.token;
    const user = data.user;

    localStorage.setItem(
      'token',
      token
    );

    document.cookie =
      `token=${token}; path=/`;

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );

    // เก็บ role names ไว้ใช้เร็วๆ
    const roleNames =
      user.roles.map(
        role => role.name
      );

    localStorage.setItem(
      'roles',
      JSON.stringify(roleNames)
    );

    router.replace('/pages/dashboard');

  } catch (error) {

    alert(
      error?.response?.data?.message ||
      'Login Failed'
    );

  } finally {

    setLoading(false);

  }

};

  return (
    <div className="w-full max-w-md">

      {/* Card */}

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 text-center">

          <div className="flex justify-center mb-4">

            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">

              <FaUserShield size={32} />

            </div>

          </div>

          <h1 className="text-3xl font-bold">
            ODIN
          </h1>

          <p className="text-blue-100 mt-2">
            Manpower Management System
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleLogin}
          className="p-8 space-y-5"
        >

          {/* Username */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>

            <div className="relative">

              <LuUser
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="
                w-full
                border
                rounded-lg
                pl-10
                pr-4
                py-3
                focus:ring-2
                focus:ring-blue-500
                focus:outline-none
                "
                required
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">

              <LuLock
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="
                w-full
                border
                rounded-lg
                pl-10
                pr-12
                py-3
                focus:ring-2
                focus:ring-blue-500
                focus:outline-none
                "
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                absolute
                right-3
                top-3
                text-gray-500
                "
              >

                {
                  showPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                }

              </button>

            </div>

          </div>

          {/* Remember */}

          <div className="flex justify-between items-center">

            <label className="flex items-center gap-2 text-sm">

              <input
                type="checkbox"
              />

              Remember me

            </label>

            <button
              type="button"
              className="
              text-sm
              text-blue-600
              hover:underline
              "
            >
              Forgot Password?
            </button>

          </div>

          {/* Login */}

          <button
            type="submit"
            disabled={loading}
            className="
            w-full
            bg-blue-900
            hover:bg-blue-800
            text-white
            py-3
            rounded-lg
            font-semibold
            transition
            disabled:opacity-50
            "
          >

            {
              loading
                ? 'Signing In...'
                : 'Sign In'
            }

          </button>

        </form>

      </div>

      <div className="text-center mt-4 text-sm text-gray-500">

        © {new Date().getFullYear()}
        {' '}
        ODIN v1.0

      </div>

    </div>
  );
}