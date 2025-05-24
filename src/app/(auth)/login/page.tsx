// app/(auth)/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import Layout from "@/components/common/Layout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { login, error, clearError, loading, user } = useAuth();

  const router = useRouter();

  // Добавляем эффект для перенаправления после успешного входа
  useEffect(() => {
    if (user && user.isActive) {
      redirectByRole(user.role);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    clearError();

    try {
      await login(email, password);
      // Перенаправление теперь будет происходить в useEffect
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при входе";
      setErrorMessage(message);
    }
  };

  // Функция перенаправления на основе роли пользователя
  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        router.push("/super_admin");
        break;
      case UserRole.ACADEMIC_ADVISOR:
        router.push("/academic-advisor");
        break;
      case UserRole.TEACHER:
        router.push("/teacher");
        break;
      case UserRole.STUDENT:
        router.push("/student");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <Layout title="Вход в систему">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Остальной код остается без изменений */}
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Вход в систему
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Введите свои учетные данные для доступа к панели управления
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {(error || errorMessage) && (
              <div className="p-4 text-red-700 bg-red-100 rounded-md">
                {errorMessage || error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? "Вход..." : "Войти"}
              </button>
            </div>

            <div className="text-center text-sm">
              <p>
                Нет аккаунта?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
