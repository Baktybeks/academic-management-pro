// src/app/(dashboard)/super-admin/page.tsx

import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const menuItems = [
    {
      title: "Академсоветники",
      description: "Создание и управление академсоветниками",
      href: "/super-admin/academic-council",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Дисциплины",
      description: "Создание и управление учебными дисциплинами",
      href: "/super-admin/subjects",
      icon: BookOpen,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Группы",
      description: "Создание и управление учебными группами",
      href: "/super-admin/groups",
      icon: GraduationCap,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Периоды оценок",
      description: "Создание периодов для выставления финальных оценок",
      href: "/super-admin/grading-periods",
      icon: Calendar,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Опросники",
      description: "Создание опросников для оценки преподавателей",
      href: "/super-admin/surveys",
      icon: ClipboardList,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Периоды опросов",
      description: "Управление периодами проведения опросов",
      href: "/super-admin/survey-periods",
      icon: FileText,
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      title: "Отчеты и аналитика",
      description: "Посещаемость студентов и рейтинг преподавателей",
      href: "/super-admin/reports",
      icon: BarChart3,
      color: "bg-cyan-500 hover:bg-cyan-600",
    },
    {
      title: "Системные настройки",
      description: "Общие настройки системы",
      href: "/super-admin/settings",
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель СуперАдминистратора
        </h1>
        <p className="text-gray-600">
          Управление академической системой, создание основных сущностей и
          контроль процессов
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${item.color} text-white p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <item.icon className="h-8 w-8" />
              <div className="text-right">
                <div className="text-xs opacity-75">СуперАдмин</div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Быстрая статистика */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Быстрая статистика
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Академсоветники
                </p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Дисциплины</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Группы</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Активные опросы
                </p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние действия */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Последние действия
        </h2>

        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Здесь будет отображаться лог последних действий в системе
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
