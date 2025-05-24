// src/components/common/Navbar.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, getRoleLabel, getRoleColor } from "@/types";
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
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            href: "/super-admin/users",
            label: "Пользователи",
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
          {
            href: "/super-admin/survey-periods",
            label: "Периоды опросов",
            icon: FileText,
          },
          { href: "/super-admin/reports", label: "Отчеты", icon: BarChart3 },
          { href: "/super-admin/settings", label: "Настройки", icon: Settings },
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

  const handleMobileMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-lg border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Левая часть - Логотип */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                BAMORA
              </span>
            </Link>

            {/* Десктопная навигация */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
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

          <div className="flex items-center">
            <div className="hidden lg:block ml-4 relative">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="h-5 w-5" />
                <span>{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
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

            {/* Кнопка гамбургера */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden ml-4 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-40">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Навигационные элементы */}
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMobileMenuItemClick}
                className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}

            {/* Разделитель */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Информация о пользователе */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-8 w-8 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>

              {/* Кнопка выхода */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay для закрытия меню */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
