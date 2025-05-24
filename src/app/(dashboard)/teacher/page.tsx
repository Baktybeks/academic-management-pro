// src/app/(dashboard)/teacher/page.tsx

"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { assignmentApi } from "@/services/assignmentService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();

  // Получаем назначения преподавателя
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () =>
      teacherAssignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем непроверенные работы
  const { data: uncheckedSubmissions = [] } = useQuery({
    queryKey: ["unchecked-submissions", user?.$id],
    queryFn: () =>
      assignmentApi.getUncheckedSubmissionsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем дисциплины для отображения названий
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  // Получаем группы для отображения названий
  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  // Создаем карты для быстрого поиска
  const subjectsMap = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, (typeof subjects)[0]>);
  }, [subjects]);

  const groupsMap = React.useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, (typeof groups)[0]>);
  }, [groups]);

  // Группируем назначения по дисциплинам
  const assignmentsBySubject = React.useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      const subjectId = assignment.subjectId;
      if (!acc[subjectId]) {
        acc[subjectId] = [];
      }
      acc[subjectId].push(assignment);
      return acc;
    }, {} as Record<string, typeof assignments>);
  }, [assignments]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель преподавателя
        </h1>
        <p className="text-gray-600">
          Добро пожаловать, {user?.name}! Управляйте занятиями и контрольными
          заданиями.
        </p>
      </div>

      {/* Быстрая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Дисциплины</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(assignmentsBySubject).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Групп</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Непроверенных работ
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {uncheckedSubmissions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Сегодня занятий
              </p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Быстрые действия
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/teacher/assignments/create"
            className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-indigo-900">
                  Создать задание
                </h3>
                <p className="text-sm text-indigo-700">
                  Новое контрольное задание
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/teacher/lessons/create"
            className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Добавить занятие
                </h3>
                <p className="text-sm text-green-700">
                  Запланировать новое занятие
                </p>
              </div>
            </div>
          </Link>

          {uncheckedSubmissions.length > 0 && (
            <Link
              href="/teacher/submissions"
              className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Проверить работы
                  </h3>
                  <p className="text-sm text-red-700">
                    {uncheckedSubmissions.length} непроверенных работ
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Мои дисциплины и группы */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Мои дисциплины и группы
        </h2>

        {Object.keys(assignmentsBySubject).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(assignmentsBySubject).map(
              ([subjectId, subjectAssignments]) => {
                const subject = subjectsMap[subjectId];
                if (!subject) return null;

                return (
                  <div
                    key={subjectId}
                    className="bg-white rounded-lg shadow border"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-indigo-500" />
                          {subject.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {subjectAssignments.length} группы
                        </span>
                      </div>

                      {subject.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {subject.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectAssignments.map((assignment) => {
                          const group = groupsMap[assignment.groupId];
                          if (!group) return null;

                          return (
                            <Link
                              key={assignment.$id}
                              href={`/teacher/group/${group.$id}/subject/${subject.$id}`}
                              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">
                                    {group.title}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {group.studentIds?.length || 0} студентов
                                </span>
                              </div>
                              <div className="mt-2 flex gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  Занятия
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  Задания
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Нет назначенных дисциплин
            </h3>
            <p className="text-gray-500">
              Обратитесь к академсоветнику для назначения вам групп и дисциплин
            </p>
          </div>
        )}
      </div>

      {/* Последние действия */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Последние действия
        </h2>

        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Здесь будет отображаться история ваших последних действий
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
