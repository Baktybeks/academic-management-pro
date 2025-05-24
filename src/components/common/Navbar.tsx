// src/components/common/Navbar.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  LogOut,
  User,
  ChevronDown,
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  ClipboardList,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const getNavigationItems = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return [
          { href: "/super-admin", label: "Главная", icon: Home },
          {
            href: "/super-admin/academic-advisor",
            label: "Академсоветники",
            icon: Users,
          },
          {
            href: "/super-admin/subjects",
            label: "Дисциплины",
            icon: BookOpen,
          },
          { href: "/super-admin/groups", label: "Группы", icon: GraduationCap },
          {
            href: "/super-admin/grading-periods",
            label: "Периоды оценок",
            icon: Calendar,
          },
          {
            href: "/super-admin/surveys",
            label: "Опросники",
            icon: ClipboardList,
          },
          { href: "/super-admin/reports", label: "Отчеты", icon: BarChart3 },
        ];

      case UserRole.ACADEMIC_ADVISOR:
        return [
          { href: "/academic-advisor", label: "Главная", icon: Home },
          {
            href: "/academic-advisor/teachers",
            label: "Преподаватели",
            icon: Users,
          },
          {
            href: "/academic-advisor/students",
            label: "Студенты",
            icon: GraduationCap,
          },
          {
            href: "/academic-advisor/assignments",
            label: "Назначения",
            icon: FileText,
          },
          {
            href: "/academic-advisor/activation",
            label: "Активация",
            icon: Settings,
          },
          {
            href: "/academic-advisor/grades",
            label: "Оценки",
            icon: BarChart3,
          },
          {
            href: "/academic-advisor/attendance",
            label: "Посещаемость",
            icon: Calendar,
          },
        ];

      case UserRole.TEACHER:
        return [
          { href: "/teacher", label: "Главная", icon: Home },
          { href: "/teacher/assignments", label: "Задания", icon: FileText },
          { href: "/teacher/lessons", label: "Занятия", icon: Calendar },
          {
            href: "/teacher/submissions",
            label: "Проверка работ",
            icon: ClipboardList,
          },
          { href: "/teacher/grades", label: "Оценки", icon: BarChart3 },
        ];

      case UserRole.STUDENT:
        return [
          { href: "/student", label: "Главная", icon: Home },
          { href: "/student/assignments", label: "Задания", icon: FileText },
          {
            href: "/student/attendance",
            label: "Посещаемость",
            icon: Calendar,
          },
          { href: "/student/grades", label: "Оценки", icon: BarChart3 },
          { href: "/student/surveys", label: "Опросы", icon: ClipboardList },
        ];

      default:
        return [];
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "СуперАдмин";
      case UserRole.ACADEMIC_ADVISOR:
        return "Академсоветник";
      case UserRole.TEACHER:
        return "Преподаватель";
      case UserRole.STUDENT:
        return "Студент";
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-red-100 text-red-800";
      case UserRole.ACADEMIC_ADVISOR:
        return "bg-blue-100 text-blue-800";
      case UserRole.TEACHER:
        return "bg-green-100 text-green-800";
      case UserRole.STUDENT:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Левая часть - Логотип и навигация */}
          <div className="flex items-center">
            {/* Логотип */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Академия
              </span>
            </Link>

            {/* Основная навигация */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Правая часть - Пользователь */}
          <div className="flex items-center">
            {/* Роль пользователя */}
            <span
              className={`hidden sm:inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                user.role
              )}`}
            >
              {getRoleLabel(user.role)}
            </span>

            {/* Меню пользователя */}
            <div className="ml-4 relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Выпадающее меню */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* Информация о пользователе */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span
                        className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    {/* Пункты меню */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Выйти
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Мобильная навигация */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay для закрытия меню */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}
