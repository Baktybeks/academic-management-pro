// app/(auth)/login/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import Layout from "@/components/common/Layout";
import { toast } from "react-toastify";
import { CheckCircle, Clock, AlertTriangle, Info } from "lucide-react";

// Компонент для обработки URL параметров
function LoginNotifications() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get("registered");
    const activated = searchParams.get("activated");
    const activation = searchParams.get("activation");

    if (registered === "true") {
      if (activated === "true") {
        // Супер-администратор - автоактивирован
        toast.success(
          "🎉 Регистрация завершена! Аккаунт активирован, можете войти в систему.",
          {
            position: "top-center",
            autoClose: 6000,
          }
        );
      } else if (activation === "pending") {
        // Обычный пользователь - ожидает активации
        toast.info(
          "⏳ Регистрация завершена! Ваш аккаунт ожидает активации администратором.",
          {
            position: "top-center",
            autoClose: 8000,
          }
        );
      } else {
        // Общее сообщение о регистрации
        toast.success("✅ Регистрация завершена успешно!", {
          position: "top-center",
          autoClose: 5000,
        });
      }
    }
  }, [searchParams]);

  return null;
}

// Основной компонент логина
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { login, error, clearError, loading, user } = useAuth();
  const router = useRouter();

  // Перенаправление после успешного входа
  useEffect(() => {
    if (user && user.isActive) {
      toast.success(`Добро пожаловать, ${user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });
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
    } catch (error: any) {
      const message = error?.message || "Ошибка при входе";

      // Показываем специфичные сообщения в блоке ошибок формы
      if (
        message.includes("не активирован") ||
        message.includes("not activated")
      ) {
        setErrorMessage(
          "⚠️ Ваш аккаунт еще не активирован администратором. Попробуйте позже или обратитесь к администратору."
        );
      } else if (message.includes("Неверный") || message.includes("Invalid")) {
        setErrorMessage(
          "❌ Неверный email или пароль. Проверьте правильность введенных данных."
        );
      } else if (
        message.includes("заблокирован") ||
        message.includes("blocked")
      ) {
        setErrorMessage(
          "🚫 Ваш аккаунт заблокирован. Обратитесь к администратору системы."
        );
      } else if (
        message.includes("не найден") ||
        message.includes("not found")
      ) {
        setErrorMessage(
          "📧 Пользователь с таким email не найден. Проверьте email или зарегистрируйтесь."
        );
      } else {
        setErrorMessage(`Ошибка входа: ${message}`);
      }
    }
  };

  // Функция перенаправления на основе роли пользователя
  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        router.push("/super-admin");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Вход в систему
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Войдите в свой аккаунт для доступа к платформе
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || errorMessage) && (
            <div
              className={`p-4 border rounded-md ${
                (errorMessage || error)?.includes("не активирован") ||
                (errorMessage || error)?.includes("not activated")
                  ? "text-amber-700 bg-amber-100 border-amber-200"
                  : (errorMessage || error)?.includes("заблокирован") ||
                    (errorMessage || error)?.includes("blocked")
                  ? "text-red-700 bg-red-100 border-red-200"
                  : (errorMessage || error)?.includes("не найден") ||
                    (errorMessage || error)?.includes("not found")
                  ? "text-blue-700 bg-blue-100 border-blue-200"
                  : "text-red-700 bg-red-100 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {(errorMessage || error)?.includes("не активирован") ||
                (errorMessage || error)?.includes("not activated") ? (
                  <Clock className="h-4 w-4 flex-shrink-0" />
                ) : (errorMessage || error)?.includes("заблокирован") ||
                  (errorMessage || error)?.includes("blocked") ? (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                ) : (errorMessage || error)?.includes("не найден") ||
                  (errorMessage || error)?.includes("not found") ? (
                  <Info className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{errorMessage || error}</span>
              </div>
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
              placeholder="введите ваш email"
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
              placeholder="введите ваш пароль"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </div>

          <div className="text-center text-sm space-y-2">
            <p>
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Зарегистрироваться
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              Если ваш аккаунт не активирован, обратитесь к администратору
              системы
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// Fallback компонент для загрузки
function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Вход в систему
          </h1>
          <p className="mt-2 text-sm text-gray-600">Загрузка...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Layout title="Вход в систему">
      <Suspense fallback={<LoginPageFallback />}>
        <LoginNotifications />
        <LoginForm />
      </Suspense>
    </Layout>
  );
}
