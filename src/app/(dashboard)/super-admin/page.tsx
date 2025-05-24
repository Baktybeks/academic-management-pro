// src/app/(dashboard)/super-admin/page.tsx

"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/services/userService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { surveyApi } from "@/services/surveyService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import { UserRole } from "@/types";
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  ClipboardList,
  Settings,
  FileText,
  RefreshCw,
  Plus,
  UserCheck,
  Eye,
  Clock,
} from "lucide-react";

export default function SuperAdminDashboard() {
  // Получение данных для статистики
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getAllUsers,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: surveyApi.getAllSurveys,
  });

  const { data: gradingPeriods = [] } = useQuery({
    queryKey: ["grading-periods"],
    queryFn: gradingPeriodApi.getAllGradingPeriods,
  });

  const { data: surveyPeriods = [] } = useQuery({
    queryKey: ["survey-periods"],
    queryFn: surveyPeriodApi.getAllSurveyPeriods,
  });

  console.log(gradingPeriods, "gradingPeriodsgradingPeriodsgradingPeriods");
  console.log(surveyPeriods, "surveyPeriodsSurveyPeriodsSurveyPeriods");

  // Подсчет статистики
  const stats = {
    academicAdvisors: users.filter((u) => u.role !== UserRole.SUPER_ADMIN)
      .length,
    subjects: subjects.filter((s) => s.isActive).length,
    groups: groups.length,
    gradingPeriods: gradingPeriods.filter((gp) => gp.isActive).length,
    surveys: surveys.filter((s) => s.isActive).length,
    surveyPeriods: surveyPeriods.filter((sp) => sp.isActive).length,
  };

  const menuItems = [
    {
      title: "Пользователи",
      description: "Создание и управление пользователей",
      href: "/super-admin/users",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
      count: stats.academicAdvisors,
    },
    {
      title: "Дисциплины",
      description: "Создание и управление учебными дисциплинами",
      href: "/super-admin/subjects",
      icon: BookOpen,
      color: "bg-green-500 hover:bg-green-600",
      count: stats.subjects,
    },
    {
      title: "Группы",
      description: "Создание учебных групп",
      href: "/super-admin/groups",
      icon: GraduationCap,
      color: "bg-purple-500 hover:bg-purple-600",
      count: stats.groups,
    },
    {
      title: "Периоды оценок",
      description: "Создание периодов для выставления финальных оценок",
      href: "/super-admin/grading-periods",
      icon: Calendar,
      color: "bg-orange-500 hover:bg-orange-600",
      count: stats.gradingPeriods,
    },
    {
      title: "Опросники",
      description: "Создание опросников для оценки преподавателей",
      href: "/super-admin/surveys",
      icon: ClipboardList,
      color: "bg-indigo-500 hover:bg-indigo-600",
      count: stats.surveys,
    },
    {
      title: "Периоды опросов",
      description: "Управление периодами проведения опросов",
      href: "/super-admin/survey-periods",
      icon: FileText,
      color: "bg-pink-500 hover:bg-pink-600",
      count: stats.surveyPeriods,
    },
    {
      title: "Отчеты и аналитика",
      description: "Посещаемость студентов и рейтинг преподавателей",
      href: "/super-admin/reports",
      icon: BarChart3,
      color: "bg-cyan-500 hover:bg-cyan-600",
      count: null,
    },
    {
      title: "Системные настройки",
      description: "Общие настройки системы",
      href: "/super-admin/settings",
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600",
      count: null,
    },
  ];

  // Интерфейс для действий
  interface RecentAction {
    type: string;
    title: string;
    description: string;
    time: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }

  // Последние действия
  const recentActions = React.useMemo((): RecentAction[] => {
    const actions: RecentAction[] = [];

    // Последние созданные пользователи
    const recentUsers = users
      .filter((u) => u.role !== UserRole.SUPER_ADMIN)
      .sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )
      .slice(0, 3);

    recentUsers.forEach((user) => {
      actions.push({
        type: "user_created",
        title: `Новый ${
          user.role === UserRole.ACADEMIC_ADVISOR
            ? "академсоветник"
            : user.role === UserRole.TEACHER
            ? "преподаватель"
            : user.role === UserRole.STUDENT
            ? "студент"
            : "пользователь"
        }`,
        description: `${user.name} (${user.email})`,
        time: user.$createdAt,
        icon: Users,
        color: user.isActive
          ? "text-green-600 bg-green-100"
          : "text-yellow-600 bg-yellow-100",
      });
    });

    // Последние созданные дисциплины
    const recentSubjects = subjects
      .sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )
      .slice(0, 2);

    recentSubjects.forEach((subject) => {
      actions.push({
        type: "subject_created",
        title: "Новая дисциплина",
        description: subject.title,
        time: subject.$createdAt,
        icon: BookOpen,
        color: "text-blue-600 bg-blue-100",
      });
    });

    // Последние созданные группы
    const recentGroups = groups
      .sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )
      .slice(0, 2);

    recentGroups.forEach((group) => {
      actions.push({
        type: "group_created",
        title: "Новая группа",
        description: `${group.title} (${
          group.studentIds?.length || 0
        } студентов)`,
        time: group.$createdAt,
        icon: GraduationCap,
        color: "text-purple-600 bg-purple-100",
      });
    });

    // Последние созданные опросники
    const recentSurveys = surveys
      .sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )
      .slice(0, 2);

    recentSurveys.forEach((survey) => {
      actions.push({
        type: "survey_created",
        title: "Новый опросник",
        description: survey.title,
        time: survey.$createdAt,
        icon: ClipboardList,
        color: "text-indigo-600 bg-indigo-100",
      });
    });

    // Последние созданные периоды опросов
    const recentSurveyPeriods = surveyPeriods
      .sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )
      .slice(0, 2);

    recentSurveyPeriods.forEach((period) => {
      actions.push({
        type: "survey_period_created",
        title: "Новый период опроса",
        description: period.title,
        time: period.$createdAt,
        icon: Clock,
        color: "text-pink-600 bg-pink-100",
      });
    });

    // Сортируем по времени и берем последние 10
    return actions
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }, [users, subjects, groups, surveys, surveyPeriods]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "только что";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} дн назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель супер администратора
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
            className={`${item.color} text-white p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-4">
              <item.icon className="h-8 w-8" />
              <div className="text-right">
                {item.count !== null && (
                  <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 text-sm font-bold mt-1 w-15 ">
                    {item.count}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {item.description}
            </p>

            {/* Индикатор активности */}
            {item.count !== null && item.count > 0 && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full animate-pulse"></div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Быстрая статистика */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Быстрая статистика
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Пользователи
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.academicAdvisors}
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
                <p className="text-sm font-medium text-gray-600">Дисциплины</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.subjects}
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
                <p className="text-sm font-medium text-gray-600">Группы</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.groups}
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
                  {stats.surveys}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-pink-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Периоды опросов
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.surveyPeriods}
                </p>
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
            {recentActions.length > 0 ? (
              <div className="space-y-4">
                {recentActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`p-2 rounded-full ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {action.description}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeAgo(action.time)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Здесь будут отображаться последние действия в системе
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Информационные блоки */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Основные функции СуперАдмина
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Создание и управление академсоветниками</li>
            <li>• Создание дисциплин и учебных групп</li>
            <li>• Настройка периодов оценивания</li>
            <li>• Создание опросников для студентов</li>
            <li>• Управление периодами проведения опросов</li>
            <li>• Просмотр отчетов и аналитики</li>
            <li>• Управление системными настройками</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Рекомендации по работе
          </h3>
          <ul className="space-y-2 text-green-800">
            <li>• Сначала создайте академсоветников</li>
            <li>• Затем настройте дисциплины и группы</li>
            <li>• Создайте опросники и периоды опросов</li>
            <li>• Назначение студентов производится академсоветниками</li>
            <li>• Регулярно проверяйте отчеты системы</li>
            <li>• Создавайте резервные копии данных</li>
            <li>• Мониторьте активность пользователей</li>
          </ul>
        </div>
      </div>

      {/* Статус неактивированных пользователей */}
      {users.filter((u) => !u.isActive && u.role !== UserRole.SUPER_ADMIN)
        .length > 0 && (
        <div className="mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <UserCheck className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Требуется внимание
                </h3>
                <p className="text-sm text-yellow-700">
                  {
                    users.filter(
                      (u) => !u.isActive && u.role !== UserRole.SUPER_ADMIN
                    ).length
                  }{" "}
                  пользователей ожидают активации.
                </p>
              </div>
              <Link
                href="/super-admin/users"
                className="ml-auto text-sm text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Просмотреть
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
