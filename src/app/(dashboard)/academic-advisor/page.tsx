// src/app/(dashboard)/academic-advisor/page.tsx

import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  UserCheck,
  BarChart3,
  ClipboardList,
  Settings,
  Calendar,
} from "lucide-react";

export default function AcademicCouncilDashboard() {
  const menuItems = [
    {
      title: "Преподаватели",
      description: "Создание и управление преподавателями",
      href: "/academic-advisor/teachers",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Студенты",
      description: "Создание и управление студентами",
      href: "/academic-advisor/students",
      icon: GraduationCap,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Назначения преподавателей",
      description: "Привязка преподавателей к группам и дисциплинам",
      href: "/academic-advisor/assignments",
      icon: UserPlus,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Активация пользователей",
      description: "Активация созданных пользователей",
      href: "/academic-advisor/activation",
      icon: UserCheck,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Просмотр оценок",
      description: "Просмотр и анализ оценок студентов",
      href: "/academic-advisor/grades",
      icon: BarChart3,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Посещаемость",
      description: "Мониторинг посещаемости студентов",
      href: "/academic-advisor/attendance",
      icon: Calendar,
      color: "bg-cyan-500 hover:bg-cyan-600",
    },
    {
      title: "Результаты опросов",
      description: "Просмотр результатов оценки преподавателей",
      href: "/academic-advisor/survey-results",
      icon: ClipboardList,
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      title: "Отчеты",
      description: "Общие отчеты и аналитика",
      href: "/academic-advisor/reports",
      icon: BarChart3,
      color: "bg-teal-500 hover:bg-teal-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель Академсоветника
        </h1>
        <p className="text-gray-600">
          Управление пользователями, назначениями и мониторинг учебного процесса
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
                <div className="text-xs opacity-75">Академсоветник</div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Статистика</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Преподаватели
                </p>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">Активных / Всего</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Студенты</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">Активных / Всего</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Ожидают активации
                </p>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">Новых пользователей</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Назначения</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-500">
                  Преподаватель-группа-дисциплина
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние действия и уведомления */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Требуют внимания
          </h2>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Пользователи ожидают активации
                  </h3>
                  <p className="text-sm text-yellow-700">
                    - новых пользователей требуют активации
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Непривязанные преподаватели
                  </h3>
                  <p className="text-sm text-blue-700">
                    - преподавателей без назначений
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Студенты без групп
                  </h3>
                  <p className="text-sm text-green-700">
                    - студентов не добавлены в группы
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Последние действия
          </h2>

          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">
                Здесь будет отображаться лог ваших последних действий
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
