// src/app/(dashboard)/academic-advisor/page.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ С РЕАЛЬНЫМИ ДАННЫМИ

"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  useTeachers,
  useStudents,
  usePendingUsers,
} from "@/services/authService";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import { userApi } from "@/services/userService";
import { formatLocalDateTime } from "@/utils/dateUtils";
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
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  Target,
  CheckCircle,
  FileText,
  UsersIcon,
} from "lucide-react";

// Интерфейс для действий
interface RecentAction {
  id: string;
  action: string;
  target: string;
  time: string;
  type: "activation" | "user" | "group" | "assignment" | "survey";
  icon: React.ComponentType<any>;
  color: string;
  createdAt: string;
}

export default function AcademicCouncilDashboard() {
  const { user } = useAuthStore();

  const { data: teachers = [] } = useTeachers();
  const { data: students = [] } = useStudents();
  const { data: pendingUsers = [] } = usePendingUsers();

  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: teacherAssignmentApi.getAllAssignments,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: activeSurveyPeriods = [] } = useQuery({
    queryKey: ["active-survey-periods"],
    queryFn: surveyPeriodApi.getActiveSurveyPeriods,
  });

  // Получение последних действий на основе реальных данных
  const { data: recentActions = [] } = useQuery({
    queryKey: ["recent-actions"],
    queryFn: async (): Promise<RecentAction[]> => {
      try {
        const actions: RecentAction[] = [];

        // Получаем последних активированных пользователей (последние 10 активных)
        const allUsers = await userApi.getAllUsers();
        const recentlyActivated = allUsers
          .filter((u) => u.isActive && u.role !== "SUPER_ADMIN")
          .sort(
            (a, b) =>
              new Date(b.$updatedAt).getTime() -
              new Date(a.$updatedAt).getTime()
          )
          .slice(0, 5);

        recentlyActivated.forEach((user) => {
          actions.push({
            id: `activation-${user.$id}`,
            action: `Активирован ${
              user.role === "TEACHER" ? "преподаватель" : "студент"
            }`,
            target: user.name,
            time: getRelativeTime(user.$updatedAt),
            type: "activation",
            icon: UserCheck,
            color: "text-green-600",
            createdAt: user.$updatedAt,
          });
        });

        // Получаем последние созданные группы (последние 5)
        const recentGroups = groups
          .sort(
            (a, b) =>
              new Date(b.$createdAt).getTime() -
              new Date(a.$createdAt).getTime()
          )
          .slice(0, 3);

        recentGroups.forEach((group) => {
          actions.push({
            id: `group-${group.$id}`,
            action: "Создана группа",
            target: group.title,
            time: getRelativeTime(group.$createdAt),
            type: "group",
            icon: UsersIcon,
            color: "text-teal-600",
            createdAt: group.$createdAt,
          });
        });

        // Получаем последние назначения преподавателей (последние 5)
        const recentAssignments = assignments
          .sort(
            (a, b) =>
              new Date(b.$createdAt).getTime() -
              new Date(a.$createdAt).getTime()
          )
          .slice(0, 3);

        for (const assignment of recentAssignments) {
          try {
            const teacher = teachers.find(
              (t) => t.$id === assignment.teacherId
            );
            const subject = subjects.find(
              (s) => s.$id === assignment.subjectId
            );
            const group = groups.find((g) => g.$id === assignment.groupId);

            if (teacher && subject && group) {
              actions.push({
                id: `assignment-${assignment.$id}`,
                action: "Создано назначение",
                target: `${teacher.name} → ${subject.title} → ${group.title}`,
                time: getRelativeTime(assignment.$createdAt),
                type: "assignment",
                icon: UserPlus,
                color: "text-purple-600",
                createdAt: assignment.$createdAt,
              });
            }
          } catch (error) {
            // Игнорируем ошибки для отдельных назначений
          }
        }

        // Получаем последние созданные пользователи (последние 3)
        const recentUsers = allUsers
          .filter((u) => u.role !== "SUPER_ADMIN")
          .sort(
            (a, b) =>
              new Date(b.$createdAt).getTime() -
              new Date(a.$createdAt).getTime()
          )
          .slice(0, 3);

        recentUsers.forEach((user) => {
          if (!recentlyActivated.find((u) => u.$id === user.$id)) {
            actions.push({
              id: `user-${user.$id}`,
              action: `Добавлен ${
                user.role === "TEACHER" ? "преподаватель" : "студент"
              }`,
              target: user.name,
              time: getRelativeTime(user.$createdAt),
              type: "user",
              icon: user.role === "TEACHER" ? Users : GraduationCap,
              color:
                user.role === "TEACHER" ? "text-blue-600" : "text-green-600",
              createdAt: user.$createdAt,
            });
          }
        });

        // Получаем последние периоды опросов (последние 2)
        const allSurveyPeriods = await surveyPeriodApi.getAllSurveyPeriods();
        const recentSurveyPeriods = allSurveyPeriods
          .sort(
            (a, b) =>
              new Date(b.$createdAt).getTime() -
              new Date(a.$createdAt).getTime()
          )
          .slice(0, 2);

        recentSurveyPeriods.forEach((period) => {
          actions.push({
            id: `survey-${period.$id}`,
            action: period.isActive ? "Активирован опрос" : "Создан опрос",
            target: period.title,
            time: getRelativeTime(period.$createdAt),
            type: "survey",
            icon: ClipboardList,
            color: "text-pink-600",
            createdAt: period.$createdAt,
          });
        });

        // Сортируем все действия по времени создания и возвращаем последние 8
        return actions
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 8);
      } catch (error) {
        console.error("Ошибка при получении последних действий:", error);
        return [];
      }
    },
    enabled: teachers.length > 0 && groups.length > 0 && subjects.length > 0,
  });

  // Функция для получения относительного времени
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "только что";
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} дн назад`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} нед назад`;

    return formatLocalDateTime(dateString).split(" ")[0]; // Только дата
  };

  const stats = {
    activeTeachers: teachers.filter((t) => t.isActive).length,
    totalTeachers: teachers.length,
    activeStudents: students.filter((s) => s.isActive).length,
    totalStudents: students.length,
    totalAssignments: assignments.length,
    totalGroups: groups.length,
    pendingActivations: pendingUsers.filter((u) => u.role !== "SUPER_ADMIN")
      .length,
    studentsInGroups: groups.reduce(
      (total, group) => total + (group.studentIds?.length || 0),
      0
    ),
    teachersWithAssignments: new Set(assignments.map((a) => a.teacherId)).size,
    emptyGroups: groups.filter(
      (g) => !g.studentIds || g.studentIds.length === 0
    ).length,
    unassignedTeachers:
      teachers.filter((t) => t.isActive).length -
      new Set(assignments.map((a) => a.teacherId)).size,
  };

  const menuItems = [
    {
      title: "Преподаватели",
      description: "Создание и управление преподавателями",
      href: "/academic-advisor/teachers",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
      count: stats.activeTeachers,
      subtext: `из ${stats.totalTeachers} всего`,
    },
    {
      title: "Студенты",
      description: "Создание и управление студентами",
      href: "/academic-advisor/students",
      icon: GraduationCap,
      color: "bg-green-500 hover:bg-green-600",
      count: stats.activeStudents,
      subtext: `из ${stats.totalStudents} всего`,
    },
    {
      title: "Группы",
      description: "Создание групп и добавление в них студентов",
      href: "/academic-advisor/groups",
      icon: UsersIcon,
      color: "bg-teal-500 hover:bg-teal-600",
      count: stats.totalGroups,
      subtext: `${stats.studentsInGroups} студентов в группах`,
    },
    {
      title: "Назначения преподавателей",
      description: "Привязка преподавателей к группам и дисциплинам",
      href: "/academic-advisor/assignments",
      icon: UserPlus,
      color: "bg-purple-500 hover:bg-purple-600",
      count: stats.totalAssignments,
      subtext: "активных назначений",
    },
    {
      title: "Активация пользователей",
      description: "Активация созданных пользователей",
      href: "/academic-advisor/activation",
      icon: UserCheck,
      color: "bg-orange-500 hover:bg-orange-600",
      count: stats.pendingActivations,
      subtext: "ожидают активации",
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
      count: activeSurveyPeriods.length,
      subtext: "активных опросов",
    },
    {
      title: "Отчеты",
      description: "Общие отчеты и аналитика",
      href: "/academic-advisor/reports",
      icon: FileText,
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель академ советника
        </h1>
        <p className="text-gray-600">
          Управление пользователями, группами, назначениями и мониторинг
          учебного процесса
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
                Активные преподаватели
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeTeachers}
              </p>
              <p className="text-xs text-gray-500">
                из {stats.totalTeachers} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Активные студенты
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeStudents}
              </p>
              <p className="text-xs text-gray-500">
                из {stats.totalStudents} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-teal-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Групп создано</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalGroups}
              </p>
              <p className="text-xs text-gray-500">
                {stats.studentsInGroups} студентов в группах
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Назначения</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAssignments}
              </p>
              <p className="text-xs text-gray-500">
                Преподаватель-группа-дисциплина
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <div className="text-xs opacity-75">Академ советник</div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {item.description}
            </p>
            {item.subtext && (
              <p className="text-xs opacity-75 mt-2">{item.subtext}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Нижняя секция */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Требуют внимания */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Требуют внимания
          </h2>

          <div className="space-y-4">
            {stats.pendingActivations > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Пользователи ожидают активации
                    </h3>
                    <p className="text-sm text-yellow-700">
                      {stats.pendingActivations} новых пользователей требуют
                      активации
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.unassignedTeachers > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Непривязанные преподаватели
                    </h3>
                    <p className="text-sm text-blue-700">
                      {stats.unassignedTeachers} преподавателей без назначений
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.totalStudents - stats.studentsInGroups > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">
                      Студенты без групп
                    </h3>
                    <p className="text-sm text-green-700">
                      {stats.totalStudents - stats.studentsInGroups} студентов
                      не добавлены в группы
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.emptyGroups > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">
                      Пустые группы
                    </h3>
                    <p className="text-sm text-orange-700">
                      {stats.emptyGroups} групп без студентов
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.pendingActivations === 0 &&
              stats.unassignedTeachers === 0 &&
              stats.totalStudents === stats.studentsInGroups &&
              stats.emptyGroups === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
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
            {recentActions.length > 0 ? (
              <>
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
                    href="/academic-advisor/activity-log"
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Посмотреть все действия →
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Нет последних действий</p>
                <p className="text-gray-400 text-sm">
                  Начните создавать пользователей и группы
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Дополнительная аналитика */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-500" />
          Ключевые показатели
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Эффективность активации
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Преподаватели:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.totalTeachers > 0
                            ? (stats.activeTeachers / stats.totalTeachers) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.totalTeachers > 0
                      ? Math.round(
                          (stats.activeTeachers / stats.totalTeachers) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Студенты:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          stats.totalStudents > 0
                            ? (stats.activeStudents / stats.totalStudents) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.totalStudents > 0
                      ? Math.round(
                          (stats.activeStudents / stats.totalStudents) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Покрытие назначениями
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">С назначениями:</span>
                <span className="font-medium">
                  {stats.teachersWithAssignments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Без назначений:</span>
                <span className="font-medium text-orange-600">
                  {stats.unassignedTeachers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего назначений:</span>
                <span className="font-medium">{stats.totalAssignments}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Организация студентов
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">В группах:</span>
                <span className="font-medium text-green-600">
                  {stats.studentsInGroups}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Без групп:</span>
                <span className="font-medium text-red-600">
                  {stats.totalStudents - stats.studentsInGroups}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего групп:</span>
                <span className="font-medium">{groups.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендации */}
      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Рекомендации по улучшению
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-indigo-800">
              Приоритетные задачи:
            </h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              {stats.pendingActivations > 0 && (
                <li>
                  • Активировать {stats.pendingActivations} ожидающих
                  пользователей
                </li>
              )}
              {stats.totalStudents - stats.studentsInGroups > 0 && (
                <li>
                  • Добавить {stats.totalStudents - stats.studentsInGroups}{" "}
                  студентов в группы
                </li>
              )}
              {stats.unassignedTeachers > 0 && (
                <li>
                  • Создать назначения для {stats.unassignedTeachers}{" "}
                  преподавателей
                </li>
              )}
              {stats.emptyGroups > 0 && (
                <li>• Заполнить {stats.emptyGroups} пустых групп</li>
              )}
              {stats.pendingActivations === 0 &&
                stats.unassignedTeachers === 0 &&
                stats.totalStudents === stats.studentsInGroups &&
                stats.emptyGroups === 0 && (
                  <li>• Все основные задачи выполнены!</li>
                )}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-indigo-800">
              Оптимизация процессов:
            </h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Регулярно проверять новых пользователей</li>
              <li>• Планировать назначения на семестр заранее</li>
              <li>• Мониторить активность преподавателей</li>
              <li>• Анализировать результаты опросов студентов</li>
              <li>• Следить за заполненностью групп</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
