// src/app/(dashboard)/academic-advisor/assignments/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { useActiveTeachers } from "@/services/authService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import {
  TeacherAssignment,
  User,
  Group,
  Subject,
  CreateTeacherAssignmentDto,
} from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  BookOpen,
  Users,
  UserIcon,
  Search,
  Filter,
  UserPlus,
  Link as LinkIcon,
} from "lucide-react";

export default function AcademicCouncilAssignmentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Получение данных
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: teacherAssignmentApi.getAllAssignments,
  });

  const { data: teachers = [] } = useActiveTeachers();
  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  // Создание назначения
  const createMutation = useMutation({
    mutationFn: (data: CreateTeacherAssignmentDto) =>
      teacherAssignmentApi.createAssignment(data, user?.$id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      setIsCreateModalOpen(false);
      toast.success("Назначение успешно создано");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании назначения: ${error.message}`);
    },
  });

  // Удаление назначения
  const deleteMutation = useMutation({
    mutationFn: teacherAssignmentApi.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      toast.success("Назначение удалено");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении назначения: ${error.message}`);
    },
  });

  // Создаем карты для быстрого доступа
  const teachersMap = React.useMemo(() => {
    return teachers.reduce((acc, teacher) => {
      acc[teacher.$id] = teacher;
      return acc;
    }, {} as Record<string, User>);
  }, [teachers]);

  const groupsMap = React.useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, Group>);
  }, [groups]);

  const subjectsMap = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [subjects]);

  // Фильтрация назначений
  const filteredAssignments = assignments.filter((assignment) => {
    const teacher = teachersMap[assignment.teacherId];
    const subject = subjectsMap[assignment.subjectId];
    const group = groupsMap[assignment.groupId];

    if (!teacher || !subject || !group) return false;

    // Поиск
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTeacher = teacher.name.toLowerCase().includes(searchLower);
      const matchesSubject = subject.title.toLowerCase().includes(searchLower);
      const matchesGroup = group.title.toLowerCase().includes(searchLower);

      if (!matchesTeacher && !matchesSubject && !matchesGroup) {
        return false;
      }
    }

    // Фильтр по преподавателю
    if (filterTeacher !== "all" && assignment.teacherId !== filterTeacher) {
      return false;
    }

    // Фильтр по дисциплине
    if (filterSubject !== "all" && assignment.subjectId !== filterSubject) {
      return false;
    }

    return true;
  });

  // Группировка назначений по преподавателям
  const assignmentsByTeacher = React.useMemo(() => {
    const grouped: Record<
      string,
      {
        teacher: User;
        assignments: Array<{
          assignment: TeacherAssignment;
          subject: Subject;
          group: Group;
        }>;
      }
    > = {};

    filteredAssignments.forEach((assignment) => {
      const teacher = teachersMap[assignment.teacherId];
      const subject = subjectsMap[assignment.subjectId];
      const group = groupsMap[assignment.groupId];

      if (!teacher || !subject || !group) return;

      if (!grouped[teacher.$id]) {
        grouped[teacher.$id] = {
          teacher,
          assignments: [],
        };
      }

      grouped[teacher.$id].assignments.push({
        assignment,
        subject,
        group,
      });
    });

    return grouped;
  }, [filteredAssignments, teachersMap, subjectsMap, groupsMap]);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateTeacherAssignmentDto = {
      teacherId: formData.get("teacherId") as string,
      groupId: formData.get("groupId") as string,
      subjectId: formData.get("subjectId") as string,
    };

    createMutation.mutate(data);
  };

  const handleDelete = (assignment: TeacherAssignment) => {
    const teacher = teachersMap[assignment.teacherId];
    const subject = subjectsMap[assignment.subjectId];
    const group = groupsMap[assignment.groupId];

    if (
      window.confirm(
        `Вы уверены, что хотите удалить назначение "${teacher?.name}" → "${subject?.title}" → "${group?.title}"?`
      )
    ) {
      deleteMutation.mutate(assignment.$id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка назначений...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Назначения преподавателей
        </h1>
        <p className="text-gray-600">
          Привязка преподавателей к группам и дисциплинам
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LinkIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего назначений
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Преподавателей с назначениями
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(assignmentsByTeacher).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Дисциплин задействовано
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(assignments.map((a) => a.subjectId)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Групп задействовано
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(assignments.map((a) => a.groupId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Преподаватель, дисциплина, группа..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Преподаватель
            </label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все преподаватели</option>
              {teachers.map((teacher) => (
                <option key={teacher.$id} value={teacher.$id}>
                  {teacher.name}
                </option>
              ))}
            </select>
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

          <div className="flex items-end">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Создать назначение
            </button>
          </div>
        </div>
      </div>

      {/* Список назначений по преподавателям */}
      {Object.keys(assignmentsByTeacher).length > 0 ? (
        <div className="space-y-6">
          {Object.values(assignmentsByTeacher).map(
            ({ teacher, assignments: teacherAssignments }) => (
              <div
                key={teacher.$id}
                className="bg-white rounded-lg shadow border"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-6 w-6 text-indigo-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {teacher.email} • {teacherAssignments.length}{" "}
                          назначений
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacherAssignments.map(
                      ({ assignment, subject, group }) => (
                        <div
                          key={assignment.$id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-purple-500" />
                              <span className="font-medium text-gray-900">
                                {subject.title}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-gray-600">
                              {group.title}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            Создано:{" "}
                            {new Date(assignment.createdAt).toLocaleDateString(
                              "ru-RU"
                            )}
                          </div>

                          <button
                            onClick={() => handleDelete(assignment)}
                            disabled={deleteMutation.isPending}
                            className="w-full flex items-center justify-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Удалить
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterTeacher !== "all" || filterSubject !== "all"
              ? "Назначений не найдено"
              : "Назначения не созданы"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterTeacher !== "all" || filterSubject !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первое назначение преподавателя"}
          </p>
          {!searchTerm &&
            filterTeacher === "all" &&
            filterSubject === "all" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Создать назначение
              </button>
            )}
        </div>
      )}

      {/* Модальное окно создания назначения */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать назначение
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Преподаватель *
                    </label>
                    <select
                      name="teacherId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Выберите преподавателя</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.$id} value={teacher.$id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дисциплина *
                    </label>
                    <select
                      name="subjectId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Выберите дисциплину</option>
                      {subjects
                        .filter((s) => s.isActive)
                        .map((subject) => (
                          <option key={subject.$id} value={subject.$id}>
                            {subject.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Группа *
                    </label>
                    <select
                      name="groupId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Выберите группу</option>
                      {groups.map((group) => (
                        <option key={group.$id} value={group.$id}>
                          {group.title} ({group.studentIds?.length || 0}{" "}
                          студентов)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    После создания назначения преподаватель сможет создавать
                    задания для выбранной группы по выбранной дисциплине.
                  </p>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
