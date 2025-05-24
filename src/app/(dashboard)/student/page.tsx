// src/app/(dashboard)/student/page.tsx

"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { groupApi } from "@/services/groupService";
import { assignmentApi } from "@/services/assignmentService";
import { subjectApi } from "@/services/subjectService";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuthStore();

  // Получаем группы студента
  const { data: studentGroups = [] } = useQuery({
    queryKey: ["student-groups", user?.$id],
    queryFn: () => groupApi.getGroupsByStudentId(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем ответы студента на задания
  const { data: submissions = [] } = useQuery({
    queryKey: ["student-submissions", user?.$id],
    queryFn: () => assignmentApi.getSubmissionsByStudent(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем дисциплины для отображения названий
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  // Создаем карту дисциплин
  const subjectsMap = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, (typeof subjects)[0]>);
  }, [subjects]);

  // Статистика по работам
  const submissionStats = React.useMemo(() => {
    const checked = submissions.filter((s) => s.isChecked).length;
    const unchecked = submissions.length - checked;
    const averageScore = submissions
      .filter((s) => s.score !== undefined)
      .reduce((sum, s, _, arr) => sum + (s.score || 0) / arr.length, 0);

    return {
      total: submissions.length,
      checked,
      unchecked,
      averageScore: Math.round(averageScore * 100) / 100,
    };
  }, [submissions]);

  // Последние работы
  const recentSubmissions = React.useMemo(() => {
    return submissions
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .slice(0, 5);
  }, [submissions]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель студента
        </h1>
        <p className="text-gray-600">
          Добро пожаловать, {user?.name}! Отслеживайте свою успеваемость и
          выполняйте задания.
        </p>
      </div>

      {/* Быстрая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Мои группы</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentGroups.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего работ</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissionStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Проверено</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissionStats.checked}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Средний балл</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissionStats.averageScore || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Мои дисциплины</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/student/assignments"
            className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Контрольные задания
              </h3>
            </div>
            <p className="text-sm text-blue-700">
              Просмотр заданий и отправка ответов
            </p>
            {submissionStats.unchecked > 0 && (
              <div className="mt-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  {submissionStats.unchecked} непроверенных
                </span>
              </div>
            )}
          </Link>

          <Link
            href="/student/attendance"
            className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Посещаемость</h3>
            </div>
            <p className="text-sm text-green-700">
              Отслеживание посещения занятий
            </p>
          </Link>

          <Link
            href="/student/grades"
            className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Мои оценки</h3>
            </div>
            <p className="text-sm text-purple-700">Просмотр баллов и оценок</p>
          </Link>

          <Link
            href="/student/surveys"
            className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
              <h3 className="font-semibold text-indigo-900">Опросы</h3>
            </div>
            <p className="text-sm text-indigo-700">Оценка преподавателей</p>
          </Link>
        </div>
      </div>

      {/* Мои группы */}
      {studentGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Мои группы</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentGroups.map((group) => (
              <div
                key={group.$id}
                className="bg-white border rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{group.title}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {group.studentIds?.length || 0} студентов в группе
                </p>
                <div className="mt-3">
                  <Link
                    href={`/student/group/${group.$id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Перейти к дисциплинам →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Последние работы */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Последние работы
        </h2>

        {recentSubmissions.length > 0 ? (
          <div className="bg-white rounded-lg shadow border">
            <div className="divide-y divide-gray-200">
              {recentSubmissions.map((submission) => (
                <div key={submission.$id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        Задание #{submission.assignmentId.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Отправлено:{" "}
                        {new Date(submission.submittedAt).toLocaleDateString(
                          "ru-RU"
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {submission.isChecked ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-700">
                            {submission.score !== undefined
                              ? `${submission.score} б.`
                              : "Проверено"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-700">
                            На проверке
                          </span>
                        </div>
                      )}

                      <Link
                        href={submission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Открыть →
                      </Link>
                    </div>
                  </div>

                  {submission.comment && submission.isChecked && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Комментарий: </span>
                      {submission.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Нет отправленных работ
            </h3>
            <p className="text-gray-500">
              Начните выполнять контрольные задания
            </p>
            <Link
              href="/student/assignments"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Посмотреть задания
            </Link>
          </div>
        )}
      </div>

      {/* Уведомления */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Уведомления</h2>

        <div className="space-y-3">
          {submissionStats.unchecked > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800">
                    Работы на проверке
                  </h3>
                  <p className="text-sm text-orange-700">
                    {submissionStats.unchecked} работ ожидают проверки
                    преподавателем
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ClipboardList className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Доступные опросы
                </h3>
                <p className="text-sm text-blue-700">
                  Проверьте, есть ли новые опросы для оценки преподавателей
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
