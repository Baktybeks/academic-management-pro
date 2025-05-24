// app/(auth)/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Изменено с next/router
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import Layout from "@/components/common/Layout";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFirstUser, setIsFirstUser] = useState(false);

  const { register, error, clearError, loading } = useAuth();
  const router = useRouter();

  // Проверяем, есть ли администраторы в системе
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await fetch("/api/check-admins");
        const data = await response.json();
        setIsFirstUser(data.isFirstUser);

        // Если первый пользователь, сразу устанавливаем роль ADMIN
        if (data.isFirstUser) {
          setRole(UserRole.SUPER_ADMIN);
        }
      } catch (error) {
        console.error("Ошибка при проверке администраторов:", error);
      }
    };

    checkFirstUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    clearError();

    if (password !== confirmPassword) {
      setErrorMessage("Пароли не совпадают");
      return;
    }

    try {
      // Регистрируем пользователя с выбранной ролью
      await register(name, email, password, role);
      router.push("/login?registered=true");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при регистрации";
      setErrorMessage(message);
    }
  };

  return (
    <Layout title="Регистрация в системе">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Регистрация
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Создайте аккаунт для доступа к системе
            </p>
          </div>
          {!isFirstUser && role !== UserRole.SUPER_ADMIN && (
            <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md">
              Обратите внимание: после регистрации ваш аккаунт должен быть
              активирован администратором
            </div>
          )}
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {(error || errorMessage) && (
              <div className="p-4 text-red-700 bg-red-100 rounded-md">
                {errorMessage || error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Имя
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

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
                autoComplete="off"
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
                autoComplete="off"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Подтверждение пароля
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {!isFirstUser ? (
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Роль
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={UserRole.TEACHER}>Преподаватель</option>
                  <option value={UserRole.STUDENT}>Студент</option>
                </select>
              </div>
            ) : (
              <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-4">
                Вы будете зарегистрированы как администратор и автоматически
                активированы (первый пользователь системы)
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            </div>

            <div className="text-center text-sm">
              <p>
                Уже есть аккаунт?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Войти
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
