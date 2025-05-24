// src/app/(dashboard)/super-admin/page.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  useAcademicCouncil,
  useAllUsers,
  usePendingUsers,
} from "@/services/authService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { surveyApi } from "@/services/surveyService";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  ClipboardList,
  FileText,
  Settings,
  TrendingUp,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

export default function SuperAdminDashboard() {
  // Получение данных для статистики
  const { data: academicCouncil = [] } = useAcademicCouncil();
  const { data: allUsers = [] } = useAllUsers();
  const { data: pendingUsers = [] } = usePendingUsers();

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: surveyApi.getAllSurveys,
  });

  const { data: activeSurveyPeriods = [] } = useQuery({
    queryKey: ["active-survey-periods"],
    queryFn: surveyPeriodApi.getActiveSurveyPeriods,
  });

  const menuItems = [
    {
      title: "Академсоветники",
      description: "Создание и управление академсоветниками",
      href: "/super-admin/academic-advisor",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
      count: academicCouncil.length,
    },
    {
      title: "Дисциплины",
      description: "Создание и управление учебными дисциплинами",
      href: "/super-admin/subjects",
      icon: BookOpen,
      color: "bg-green-500 hover:bg-green-600",
      count: subjects.filter((s) => s.isActive).length,
    },
    {
      title: "Группы",
      description: "Создание и управление учебными группами",
      href: "/super-admin/groups",
      icon: GraduationCap,
      color: "bg-purple-500 hover:bg-purple-600",
      count: groups.length,
    },
    {
      title: "Периоды оценок",
      description: "Создание периодов для выставления финальных оценок",
      href: "/super-admin/grading-periods",
      icon: Calendar,
      color: "bg-orange-500 hover:bg-orange-600",
      count: 0, // Добавим позже
    },
    {
      title: "Опросники",
      description: "Создание опросников для оценки преподавателей",
      href: "/super-admin/surveys",
      icon: ClipboardList,
      color: "bg-indigo-500 hover:bg-indigo-600",
      count: surveys.filter((s) => s.isActive).length,
    },
    {
      title: "Периоды опросов",
      description: "Управление периодами проведения опросов",
      href: "/super-admin/survey-periods",
      icon: FileText,
      color: "bg-pink-500 hover:bg-pink-600",
      count: activeSurveyPeriods.length,
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

  // Вычисляем дополнительную статистику
  const totalStudentsInGroups = groups.reduce(
    (total, group) => total + (group.studentIds?.length || 0),
    0
  );

  const recentActions = [
    {
      id: 1,
      action: "Создан новый опросник",
      target: "Оценка преподавания",
      time: "2 часа назад",
      type: "survey",
      icon: ClipboardList,
      color: "text-indigo-600",
    },
    {
      id: 2,
      action: "Добавлена дисциплина",
      target: "Математический анализ",
      time: "1 день назад",
      type: "subject",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      id: 3,
      action: "Создана группа",
      target: "ИТ-21-1",
      time: "2 дня назад",
      type: "group",
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      id: 4,
      action: "Активирован академсоветник",
      target: "Иванов И.И.",
      time: "3 дня назад",
      type: "user",
      icon: Users,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель Супер Администратора
        </h1>
        <p className="text-gray-600">
          Управление академической системой, создание основных сущностей и
          контроль процессов
        </p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Общий контингент
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.length}
              </p>
              <p className="text-xs text-gray-500">
                Всех пользователей в системе
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Активные дисциплины
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.filter((s) => s.isActive).length}
              </p>
              <p className="text-xs text-gray-500">
                из {subjects.length} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Учебные группы
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.length}
              </p>
              <p className="text-xs text-gray-500">
                {totalStudentsInGroups} студентов в группах
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {activeSurveyPeriods.length}
              </p>
              <p className="text-xs text-gray-500">
                из {surveys.length} опросников
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${item.color} text-white p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <item.icon className="h-8 w-8" />
              <div className="text-right">
                {item.count !== undefined && (
                  <div className="text-2xl font-bold">{item.count}</div>
                )}
                {/* <div className="text-xs opacity-75">СуперАдмин</div> */}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Нижняя секция с уведомлениями и активностью */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Требуют внимания */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Требуют внимания
          </h2>

          <div className="space-y-4">
            {pendingUsers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Пользователи ожидают активации
                    </h3>
                    <p className="text-sm text-yellow-700">
                      {pendingUsers.length} новых пользователей требуют
                      активации
                    </p>
                  </div>
                </div>
              </div>
            )}

            {academicCouncil.filter((a) => !a.isActive).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Неактивные академсоветники
                    </h3>
                    <p className="text-sm text-blue-700">
                      {academicCouncil.filter((a) => !a.isActive).length}{" "}
                      академсоветников не активированы
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subjects.filter((s) => !s.isActive).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Неактивные дисциплины
                    </h3>
                    <p className="text-sm text-red-700">
                      {subjects.filter((s) => !s.isActive).length} дисциплин
                      деактивированы
                    </p>
                  </div>
                </div>
              </div>
            )}

            {groups.filter((g) => !g.studentIds || g.studentIds.length === 0)
              .length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-purple-800">
                      Пустые группы
                    </h3>
                    <p className="text-sm text-purple-700">
                      {
                        groups.filter(
                          (g) => !g.studentIds || g.studentIds.length === 0
                        ).length
                      }{" "}
                      групп без студентов
                    </p>
                  </div>
                </div>
              </div>
            )}

            {[
              pendingUsers,
              academicCouncil.filter((a) => !a.isActive),
              subjects.filter((s) => !s.isActive),
              groups.filter((g) => !g.studentIds || g.studentIds.length === 0),
            ].every((arr) => arr.length === 0) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">
                      Все в порядке
                    </h3>
                    <p className="text-sm text-green-700">
                      Нет задач, требующих немедленного внимания
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Последние действия */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-500" />
            Последние действия
          </h2>

          <div className="bg-white rounded-lg shadow border">
            <div className="divide-y divide-gray-200">
              {recentActions.map((action) => (
                <div key={action.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {action.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {action.target}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {action.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-gray-50 text-center">
              <Link
                href="/super-admin/activity-log"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Посмотреть все действия →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Системная аналитика
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Распределение пользователей
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Академсоветники:</span>
                <span className="font-medium">{academicCouncil.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Преподаватели:</span>
                <span className="font-medium">
                  {allUsers.filter((u) => u.role === "TEACHER").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Студенты:</span>
                <span className="font-medium">
                  {allUsers.filter((u) => u.role === "STUDENT").length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Контент системы
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Опросники:</span>
                <span className="font-medium">{surveys.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Дисциплины:</span>
                <span className="font-medium">{subjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Учебные группы:</span>
                <span className="font-medium">{groups.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Системная активность
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Активные опросы:</span>
                <span className="font-medium">
                  {activeSurveyPeriods.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Ожидают активации:
                </span>
                <span className="font-medium">{pendingUsers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего действий:</span>
                <span className="font-medium">{recentActions.length}+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
