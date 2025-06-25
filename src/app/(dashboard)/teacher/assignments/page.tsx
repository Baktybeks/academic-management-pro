// src/app/(dashboard)/teacher/assignments/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { assignmentApi } from "@/services/assignmentService";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import Link from "next/link";
import { Assignment, Group, Subject } from "@/types";
import { toast } from "react-toastify";
import { formatLocalDateTime, isPastDate } from "@/utils/dateUtils";
import {
  Plus,
  FileText,
  Calendar,
  Users,
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export default function TeacherAssignmentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Получаем задания преподавателя
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () => assignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем назначения преподавателя для фильтрации
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments-filter", user?.$id],
    queryFn: () =>
      teacherAssignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем дополнительные данные
  const { data: allSubjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: allGroups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  // Фильтруем только дисциплины и группы преподавателя
  const subjects = React.useMemo(() => {
    const teacherSubjectIds = new Set(
      teacherAssignments.map((a) => a.subjectId)
    );
    return allSubjects.filter((subject) => teacherSubjectIds.has(subject.$id));
  }, [allSubjects, teacherAssignments]);

  const groups = React.useMemo(() => {
    const teacherGroupIds = new Set(teacherAssignments.map((a) => a.groupId));
    return allGroups.filter((group) => teacherGroupIds.has(group.$id));
  }, [allGroups, teacherAssignments]);

  // Мутация для деактивации задания
  const deactivateMutation = useMutation({
    mutationFn: assignmentApi.deactivateAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      toast.success("Задание деактивировано");
    },
    onError: (error) => {
      toast.error(`Ошибка при деактивации задания: ${error.message}`);
    },
  });

  // Создаем карты для быстрого доступа
  const subjectsMap = React.useMemo(() => {
    return allSubjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [allSubjects]);

  const groupsMap = React.useMemo(() => {
    return allGroups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, Group>);
  }, [allGroups]);

  // Получаем статистику для каждого задания
  const { data: assignmentStats = {} } = useQuery({
    queryKey: ["assignment-stats", assignments.map((a) => a.$id)],
    queryFn: async () => {
      if (assignments.length === 0) return {};

      const statsPromises = assignments.map(async (assignment) => {
        const stats = await assignmentApi.getAssignmentStats(assignment.$id);
        return [assignment.$id, stats] as const;
      });

      const statsResults = await Promise.all(statsPromises);
      return Object.fromEntries(statsResults);
    },
    enabled: assignments.length > 0,
  });

  // Фильтрация заданий
  const filteredAssignments = React.useMemo(() => {
    return assignments.filter((assignment) => {
      const subject = subjectsMap[assignment.subjectId];
      const group = groupsMap[assignment.groupId];

      if (!subject || !group) return false;

      // Поиск
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = assignment.title
          .toLowerCase()
          .includes(searchLower);
        const matchesSubject = subject.title
          .toLowerCase()
          .includes(searchLower);
        const matchesGroup = group.title.toLowerCase().includes(searchLower);

        if (!matchesTitle && !matchesSubject && !matchesGroup) {
          return false;
        }
      }

      // Фильтр по дисциплине
      if (filterSubject !== "all" && assignment.subjectId !== filterSubject) {
        return false;
      }

      // Фильтр по статусу
      if (filterStatus === "active" && !assignment.isActive) return false;
      if (filterStatus === "inactive" && assignment.isActive) return false;
      if (filterStatus === "overdue") {
        const isOverdue = new Date(assignment.dueDate) < new Date();
        if (!isOverdue) return false;
      }

      return true;
    });
  }, [
    assignments,
    searchTerm,
    filterSubject,
    filterStatus,
    subjectsMap,
    groupsMap,
  ]);

  // Сортировка заданий по дате создания (новые сверху)
  const sortedAssignments = React.useMemo(() => {
    return [...filteredAssignments].sort(
      (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );
  }, [filteredAssignments]);

  const handleDeactivate = (assignment: Assignment) => {
    const subject = subjectsMap[assignment.subjectId];
    const group = groupsMap[assignment.groupId];

    if (
      window.confirm(
        `Вы уверены, что хотите деактивировать задание "${assignment.title}" для группы ${group?.title}?`
      )
    ) {
      deactivateMutation.mutate(assignment.$id);
    }
  };

  const formatDate = (dateString: string) => {
    return formatLocalDateTime(dateString);
  };

  const isOverdue = (dateString: string) => {
    return isPastDate(dateString);
  };

  const getStatusColor = (assignment: Assignment) => {
    if (!assignment.isActive) return "bg-gray-100 text-gray-800";
    if (isOverdue(assignment.dueDate)) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusLabel = (assignment: Assignment) => {
    if (!assignment.isActive) return "Неактивно";
    if (isOverdue(assignment.dueDate)) return "Просрочено";
    return "Активно";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Мои задания
            </h1>
            <p className="text-gray-600">
              Управляйте контрольными заданиями для ваших групп
            </p>
          </div>

          <Link
            href="/teacher/assignments/create"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          style={{color: '#fff'}}>
            <Plus className="h-4 w-4" />
            Создать задание
          </Link>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего заданий</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активные</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  assignments.filter((a) => a.isActive && !isOverdue(a.dueDate))
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Просроченные</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  assignments.filter((a) => a.isActive && isOverdue(a.dueDate))
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Непроверенных</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(assignmentStats).reduce(
                  (sum, stats) => sum + (stats?.uncheckedSubmissions || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border-[6699FF]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Название, дисциплина, группа..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дисциплина
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все дисциплины</option>
              {subjects.map((subject) => (
                <option key={subject.$id} value={subject.$id}>
                  {subject.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="overdue">Просроченные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Найдено: {sortedAssignments.length} заданий
            </div>
          </div>
        </div>
      </div>

      {/* Список заданий */}
      {sortedAssignments.length > 0 ? (
        <div className="space-y-4">
          {sortedAssignments.map((assignment) => {
            const subject = subjectsMap[assignment.subjectId];
            const group = groupsMap[assignment.groupId];
            const stats = assignmentStats[assignment.$id];

            if (!subject || !group) return null;

            return (
              <div
                key={assignment.$id}
                className="bg-white border-[6699FF] rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            assignment
                          )}`}
                        >
                          {getStatusLabel(assignment)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {subject.title}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {group.title}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Срок: {formatDate(assignment.dueDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          Макс. балл: {assignment.maxScore}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {assignment.description}
                      </p>

                      {/* Статистика */}
                      {stats && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-600">
                            Всего ответов: {stats.totalSubmissions}
                          </span>
                          <span className="text-green-600">
                            Проверено: {stats.checkedSubmissions}
                          </span>
                          {stats.uncheckedSubmissions > 0 && (
                            <span className="text-orange-600">
                              Требует проверки: {stats.uncheckedSubmissions}
                            </span>
                          )}
                          {stats.averageScore > 0 && (
                            <span className="text-purple-600">
                              Средний балл: {stats.averageScore}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/teacher/assignments/${assignment.$id}`}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      Просмотр
                    </Link>

                    <Link
                      href={`/teacher/assignments/${assignment.$id}/submissions`}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Ответы ({stats?.totalSubmissions || 0})
                    </Link>

                    {assignment.isActive && (
                      <button
                        onClick={() => handleDeactivate(assignment)}
                        disabled={deactivateMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Деактивировать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border-[6699FF]">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterSubject !== "all" || filterStatus !== "all"
              ? "Заданий не найдено"
              : "Заданий пока нет"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterSubject !== "all" || filterStatus !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первое задание для ваших групп"}
          </p>
          {!searchTerm && filterSubject === "all" && filterStatus === "all" && (
            <Link
              href="/teacher/assignments/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
             style={{color: '#fff'}}>
              Создать задание
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
