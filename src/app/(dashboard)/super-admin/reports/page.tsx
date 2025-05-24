// src/app/(dashboard)/super-admin/reports/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/services/userService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { surveyApi } from "@/services/surveyService";
import { UserRole } from "@/types";
import {
  BarChart3,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Calendar,
  Award,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function SuperAdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedType, setSelectedType] = useState("overview");

  // Получение данных
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getAllUsers,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: surveyApi.getAllSurveys,
  });

  const isLoading =
    usersLoading || groupsLoading || subjectsLoading || surveysLoading;

  // Вычисление статистики
  const stats = {
    users: {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      byRole: {
        [UserRole.SUPER_ADMIN]: users.filter(
          (u) => u.role === UserRole.SUPER_ADMIN
        ).length,
        [UserRole.ACADEMIC_ADVISOR]: users.filter(
          (u) => u.role === UserRole.ACADEMIC_ADVISOR
        ).length,
        [UserRole.TEACHER]: users.filter((u) => u.role === UserRole.TEACHER)
          .length,
        [UserRole.STUDENT]: users.filter((u) => u.role === UserRole.STUDENT)
          .length,
      },
    },
    groups: {
      total: groups.length,
      withStudents: groups.filter(
        (g) => g.studentIds && g.studentIds.length > 0
      ).length,
      empty: groups.filter((g) => !g.studentIds || g.studentIds.length === 0)
        .length,
      totalStudents: groups.reduce(
        (total, group) => total + (group.studentIds?.length || 0),
        0
      ),
    },
    subjects: {
      total: subjects.length,
      active: subjects.filter((s) => s.isActive).length,
      inactive: subjects.filter((s) => !s.isActive).length,
    },
    surveys: {
      total: surveys.length,
      active: surveys.filter((s) => s.isActive).length,
      inactive: surveys.filter((s) => !s.isActive).length,
    },
  };

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    console.log(`Экспорт в формате ${format}`);
    // TODO: Реализовать экспорт
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-lg">Загрузка отчетов...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Отчеты и аналитика
        </h1>
        <p className="text-gray-600">
          Общая статистика системы и аналитические отчеты
        </p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="quarter">За квартал</option>
            <option value="year">За год</option>
            <option value="all">За все время</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="overview">Общий обзор</option>
            <option value="users">Пользователи</option>
            <option value="groups">Группы</option>
            <option value="subjects">Дисциплины</option>
            <option value="surveys">Опросы</option>
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Всего пользователей
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.users.total}
              </p>
              <p className="text-sm text-green-600">
                {stats.users.active} активных
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Учебных групп</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.groups.total}
              </p>
              <p className="text-sm text-green-600">
                {stats.groups.totalStudents} студентов
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Дисциплин</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.subjects.total}
              </p>
              <p className="text-sm text-green-600">
                {stats.subjects.active} активных
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Опросников</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.surveys.total}
              </p>
              <p className="text-sm text-green-600">
                {stats.surveys.active} активных
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Детальные отчеты */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение пользователей по ролям */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Распределение пользователей по ролям
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Супер админы</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.users.byRole[UserRole.SUPER_ADMIN] /
                          stats.users.total) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.users.byRole[UserRole.SUPER_ADMIN]}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Академ советники</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.users.byRole[UserRole.ACADEMIC_ADVISOR] /
                          stats.users.total) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.users.byRole[UserRole.ACADEMIC_ADVISOR]}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Преподаватели</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.users.byRole[UserRole.TEACHER] /
                          stats.users.total) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.users.byRole[UserRole.TEACHER]}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Студенты</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.users.byRole[UserRole.STUDENT] /
                          stats.users.total) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {stats.users.byRole[UserRole.STUDENT]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Статус активности */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Активность пользователей
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Активные пользователи
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${
                        stats.users.total > 0
                          ? (stats.users.active / stats.users.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {stats.users.active} (
                  {stats.users.total > 0
                    ? Math.round((stats.users.active / stats.users.total) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Неактивные пользователи
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{
                      width: `${
                        stats.users.total > 0
                          ? (stats.users.inactive / stats.users.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {stats.users.inactive} (
                  {stats.users.total > 0
                    ? Math.round(
                        (stats.users.inactive / stats.users.total) * 100
                      )
                    : 0}
                  %)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика групп */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Статистика групп
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Группы со студентами
                </p>
                <p className="text-xs text-green-600">
                  Активно используемые группы
                </p>
              </div>
              <span className="text-lg font-bold text-green-800">
                {stats.groups.withStudents}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Пустые группы
                </p>
                <p className="text-xs text-yellow-600">Группы без студентов</p>
              </div>
              <span className="text-lg font-bold text-yellow-800">
                {stats.groups.empty}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Средний размер группы
                </p>
                <p className="text-xs text-blue-600">Студентов на группу</p>
              </div>
              <span className="text-lg font-bold text-blue-800">
                {stats.groups.total > 0
                  ? Math.round(stats.groups.totalStudents / stats.groups.total)
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Статистика дисциплин и опросов */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Дисциплины и опросы
          </h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Дисциплины
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Всего:</span>
                <span className="font-medium">{stats.subjects.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Активные:</span>
                <span className="font-medium text-green-600">
                  {stats.subjects.active}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Неактивные:</span>
                <span className="font-medium text-red-600">
                  {stats.subjects.inactive}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Опросники
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Всего:</span>
                <span className="font-medium">{stats.surveys.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Активные:</span>
                <span className="font-medium text-green-600">
                  {stats.surveys.active}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Неактивные:</span>
                <span className="font-medium text-red-600">
                  {stats.surveys.inactive}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительные отчеты */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Дополнительные отчеты
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Рост пользователей
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Анализ роста количества пользователей по периодам
            </p>
            <button className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
              Просмотреть отчет
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Активность по периодам
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Отчет о посещаемости и активности студентов
            </p>
            <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
              Просмотреть отчет
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Рейтинг преподавателей
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Сводный отчет по оценкам преподавателей студентами
            </p>
            <button className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors">
              Просмотреть отчет
            </button>
          </div>
        </div>
      </div>

      {/* Последние изменения */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Последние изменения в системе
        </h2>

        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Новые пользователи за последние 7 дней
                  </p>
                  <p className="text-xs text-gray-600">
                    {
                      users.filter((u) => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(u.$createdAt) > weekAgo;
                      }).length
                    }{" "}
                    новых пользователей
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {
                    users.filter((u) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(u.$createdAt) > weekAgo;
                    }).length
                  }
                </span>
              </div>

              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Активные дисциплины
                  </p>
                  <p className="text-xs text-gray-600">
                    Дисциплины, доступные для преподавания
                  </p>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {stats.subjects.active}
                </span>
              </div>

              <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <ClipboardList className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Активные опросы
                  </p>
                  <p className="text-xs text-gray-600">
                    Опросники для оценки преподавателей
                  </p>
                </div>
                <span className="text-sm font-bold text-purple-600">
                  {stats.surveys.active}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендации и предупреждения */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Системные рекомендации
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Предупреждения */}
          {stats.groups.empty > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">
                    Внимание: Пустые группы
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Обнаружено {stats.groups.empty} пустых групп. Рекомендуется
                    назначить студентов или удалить неиспользуемые группы.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.users.inactive > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-orange-800 mb-2">
                    Неактивные пользователи
                  </h3>
                  <p className="text-sm text-orange-700">
                    {stats.users.inactive} пользователей ожидают активации.
                    Проверьте заявки и активируйте подходящих кандидатов.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Позитивные показатели */}
          {stats.subjects.active > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    Отличная работа!
                  </h3>
                  <p className="text-sm text-green-700">
                    В системе активно {stats.subjects.active} дисциплин. Это
                    обеспечивает разнообразие учебного процесса.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.surveys.active > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Система оценки работает
                  </h3>
                  <p className="text-sm text-blue-700">
                    Активных опросников: {stats.surveys.active}. Студенты могут
                    оценивать качество преподавания.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Сводка */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Сводка системы</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.users.active}
            </p>
            <p className="text-sm text-gray-600">Активных пользователей</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {stats.groups.withStudents}
            </p>
            <p className="text-sm text-gray-600">Действующих групп</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.subjects.active}
            </p>
            <p className="text-sm text-gray-600">Активных дисциплин</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {stats.surveys.active}
            </p>
            <p className="text-sm text-gray-600">Работающих опросов</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Система функционирует стабильно. Общая активность:
            <span className="font-medium text-indigo-600">
              {stats.users.total > 0
                ? Math.round((stats.users.active / stats.users.total) * 100)
                : 0}
              %
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
