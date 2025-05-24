"use client";

import React, { useState, useRef, useEffect } from "react";
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
  UsersIcon,
  UserCheck,
  UserPlus,
} from "lucide-react";

interface DropdownItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
}

interface NavigationItem {
  href?: string;
  label: string;
  icon: React.ComponentType<any>;
  dropdown?: DropdownItem[];
}

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const getNavigationItems = (): NavigationItem[] => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return [
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
            label: "Периоды",
            icon: Calendar,
            dropdown: [
              {
                href: "/super-admin/grading-periods",
                label: "Периоды оценок",
                icon: BarChart3,
                description: "Управление периодами выставления оценок",
              },
              {
                href: "/super-admin/survey-periods",
                label: "Периоды опросов",
                icon: ClipboardList,
                description: "Управление периодами проведения опросов",
              },
            ],
          },
          {
            href: "/super-admin/surveys",
            label: "Опросники",
            icon: ClipboardList,
          },
          { href: "/super-admin/reports", label: "Отчеты", icon: BarChart3 },
          { href: "/super-admin/settings", label: "Настройки", icon: Settings },
        ];

      case UserRole.ACADEMIC_ADVISOR:
        return [
          {
            label: "Управление пользователями",
            icon: Users,
            dropdown: [
              {
                href: "/academic-advisor/teachers",
                label: "Преподаватели",
                icon: Users,
                description: "Создание и управление преподавателями",
              },
              {
                href: "/academic-advisor/students",
                label: "Студенты",
                icon: GraduationCap,
                description: "Создание и управление студентами",
              },
              {
                href: "/academic-advisor/activation",
                label: "Активация",
                icon: UserCheck,
                description: "Активация созданных пользователей",
              },
            ],
          },
          {
            href: "/academic-advisor/groups",
            label: "Группы",
            icon: UsersIcon,
          },
          {
            href: "/academic-advisor/assignments",
            label: "Назначения",
            icon: UserPlus,
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
          {
            href: "/academic-advisor/survey-results",
            label: "Опросы",
            icon: ClipboardList,
          },
          {
            href: "/academic-advisor/reports",
            label: "Отчеты",
            icon: FileText,
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

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleMobileMenuItemClick = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdownElement = dropdownRefs.current[openDropdown];
        if (
          dropdownElement &&
          !dropdownElement.contains(event.target as Node)
        ) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  if (!user) return null;

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-lg border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 b1400:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                BAMORA
              </span>
            </Link>
            <div className="hidden b1400:ml-8 b1400:flex b1400:space-x-1">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  ref={(el) => {
                    dropdownRefs.current[item.label] = el;
                  }}
                >
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.label)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {openDropdown === item.label && (
                        <div className="absolute left-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                onClick={() => setOpenDropdown(null)}
                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              >
                                <div className="flex items-start gap-3">
                                  <dropdownItem.icon className="h-5 w-5 text-gray-400 mt-0.5" />
                                  <div>
                                    <div className="font-medium">
                                      {dropdownItem.label}
                                    </div>
                                    {dropdownItem.description && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {dropdownItem.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden b1400:block ml-4 relative">
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
              className="b1400:hidden ml-4 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
        <div className="b1400:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-40">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Навигационные элементы */}
            {navigationItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openDropdown === item.label && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            onClick={handleMobileMenuItemClick}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <dropdownItem.icon className="h-4 w-4" />
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={handleMobileMenuItemClick}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )}
              </div>
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
      {(isUserMenuOpen || isMobileMenuOpen || openDropdown) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
            setOpenDropdown(null);
          }}
        />
      )}
    </nav>
  );
}
