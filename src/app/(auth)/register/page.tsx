// app/(auth)/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import Layout from "@/components/common/Layout";
import { toast } from "react-toastify";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<UserRole | null>(null);

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

      // Устанавливаем состояние успешной регистрации
      setRegistrationSuccess(true);
      setRegisteredRole(role);

      // Показываем соответствующее уведомление
      if (isFirstUser || role === UserRole.SUPER_ADMIN) {
        toast.success("🎉 Регистрация завершена! Вы можете войти в систему.", {
          position: "top-center",
          autoClose: 5000,
        });

        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          router.push("/login?registered=true&activated=true");
        }, 3000);
      } else {
        toast.info("✅ Регистрация завершена! Ожидайте активации аккаунта.", {
          position: "top-center",
          autoClose: 7000,
        });

        // Перенаправляем на страницу входа через 5 секунд
        setTimeout(() => {
          router.push("/login?registered=true&activation=pending");
        }, 5000);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при регистрации";
      setErrorMessage(message);
      toast.error(`Ошибка регистрации: ${message}`);
    }
  };

  // Если регистрация прошла успешно, показываем сообщение
  if (registrationSuccess) {
    return (
      <Layout title="Регистрация завершена">
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
            {isFirstUser || registeredRole === UserRole.SUPER_ADMIN ? (
              // Сообщение для супер-администратора (автоактивация)
              <>
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Добро пожаловать!
                </h1>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Ваш аккаунт супер-администратора успешно создан и
                    автоматически активирован.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Имя:</strong> {name}
                      <br />
                      <strong>Email:</strong> {email}
                      <br />
                      <strong>Роль:</strong> Супер администратор
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Перенаправление на страницу входа...
                  </p>
                </div>
              </>
            ) : (
              // Сообщение для обычных пользователей (нужна активация)
              <>
                <div className="flex justify-center">
                  <Clock className="h-16 w-16 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Регистрация завершена!
                </h1>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Ваш аккаунт успешно создан, но требует активации
                    администратором.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Что дальше?
                      </span>
                    </div>
                    <ul className="text-sm text-amber-700 space-y-1 text-left">
                      <li>
                        • Администратор получит уведомление о вашей регистрации
                      </li>
                      <li>• После активации вы получите доступ к системе</li>
                      <li>• Попробуйте войти через несколько минут</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Имя:</strong> {name}
                      <br />
                      <strong>Email:</strong> {email}
                      <br />
                      <strong>Роль:</strong>{" "}
                      {registeredRole === UserRole.TEACHER
                        ? "Преподаватель"
                        : "Студент"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Перенаправление на страницу входа...
                  </p>
                </div>
              </>
            )}

            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Перейти ко входу
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Важно:</strong> После регистрации ваш аккаунт должен
                  быть активирован администратором перед первым входом в
                  систему.
                </p>
              </div>
            </div>
          )}

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {(error || errorMessage) && (
              <div className="p-4 text-red-700 bg-red-100 border border-red-200 rounded-md">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Вы будете зарегистрированы как{" "}
                    <strong>супер-администратор</strong> и автоматически
                    активированы (первый пользователь системы).
                  </p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
