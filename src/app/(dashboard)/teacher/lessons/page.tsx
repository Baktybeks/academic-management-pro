// src/app/(dashboard)/teacher/lessons/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { lessonApi } from "@/services/lessonService";
import { attendanceApi } from "@/services/attendanceService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import {
  formatLocalDateTime,
  convertLocalDateTimeToISO,
  isPastDate,
} from "@/utils/dateUtils";
import Link from "next/link";
import {
  Lesson,
  Group,
  Subject,
  User,
  LessonCreateDto,
  Attendance,
} from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Calendar,
  Users,
  BookOpen,
  UserIcon,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";

export default function TeacherLessonsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGroupSubject, setSelectedGroupSubject] = useState<{
    groupId: string;
    subjectId: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Получаем назначения преподавателя
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () =>
      teacherAssignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем занятия преподавателя
  const { data: lessons = [] } = useQuery({
    queryKey: ["teacher-lessons", user?.$id],
    queryFn: () => lessonApi.getLessonsByTeacher(user?.$id || ""),
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

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => userApi.getUsersByRole("STUDENT" as any),
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

  // Создание занятия
  const createMutation = useMutation({
    mutationFn: (data: LessonCreateDto) => lessonApi.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
      setIsCreateModalOpen(false);
      setSelectedGroupSubject(null);
      toast.success("Занятие успешно создано!");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании занятия: ${error.message}`);
    },
  });

  // Удаление занятия
  const deleteMutation = useMutation({
    mutationFn: lessonApi.deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
      toast.success("Занятие удалено");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении занятия: ${error.message}`);
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

  // Группируем назначения по комбинациям группа-дисциплина
  const groupSubjectCombinations = React.useMemo(() => {
    return teacherAssignments
      .map((assignment) => ({
        groupId: assignment.groupId,
        subjectId: assignment.subjectId,
        group: groupsMap[assignment.groupId],
        subject: subjectsMap[assignment.subjectId],
      }))
      .filter((combo) => combo.group && combo.subject);
  }, [teacherAssignments, groupsMap, subjectsMap]);

  // Фильтрация занятий
  const filteredLessons = React.useMemo(() => {
    return lessons.filter((lesson) => {
      const subject = subjectsMap[lesson.subjectId];
      const group = groupsMap[lesson.groupId];

      if (!subject || !group) return false;

      // Поиск
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = lesson.title.toLowerCase().includes(searchLower);
        const matchesSubject = subject.title
          .toLowerCase()
          .includes(searchLower);
        const matchesGroup = group.title.toLowerCase().includes(searchLower);

        if (!matchesTitle && !matchesSubject && !matchesGroup) {
          return false;
        }
      }

      // Фильтр по дисциплине
      if (filterSubject !== "all" && lesson.subjectId !== filterSubject) {
        return false;
      }

      return true;
    });
  }, [lessons, searchTerm, filterSubject, subjectsMap, groupsMap]);

  // Сортировка занятий по дате (новые сверху)
  const sortedLessons = React.useMemo(() => {
    return [...filteredLessons].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredLessons]);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedGroupSubject) {
      toast.error("Выберите группу и дисциплину");
      return;
    }

    const formData = new FormData(e.currentTarget);

    // Используем утилиту для правильной конвертации времени
    const localDateTime = formData.get("date") as string;
    const isoString = convertLocalDateTimeToISO(localDateTime);

    const data: LessonCreateDto = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      date: isoString,
      groupId: selectedGroupSubject.groupId,
      subjectId: selectedGroupSubject.subjectId,
      teacherId: user?.$id || "",
    };

    createMutation.mutate(data);
  };

  const handleDelete = (lesson: Lesson) => {
    const subject = subjectsMap[lesson.subjectId];
    const group = groupsMap[lesson.groupId];

    if (
      window.confirm(
        `Вы уверены, что хотите удалить занятие "${lesson.title}" для группы ${group?.title}?`
      )
    ) {
      deleteMutation.mutate(lesson.$id);
    }
  };

  // Используем утилиты для форматирования дат
  const formatDate = (dateString: string) => {
    return formatLocalDateTime(dateString);
  };

  const isLessonPast = (dateString: string) => {
    return isPastDate(dateString);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление занятиями
        </h1>
        <p className="text-gray-600">
          Создавайте занятия и отмечайте посещаемость студентов
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего занятий</p>
              <p className="text-2xl font-bold text-gray-900">
                {lessons.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Дисциплин</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(lessons.map((l) => l.subjectId)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Групп</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(lessons.map((l) => l.groupId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow  border-[6699FF]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="flex items-end">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Создать занятие
            </button>
          </div>
        </div>
      </div>

      {/* Список занятий */}
      {sortedLessons.length > 0 ? (
        <div className="space-y-4">
          {sortedLessons.map((lesson) => {
            const subject = subjectsMap[lesson.subjectId];
            const group = groupsMap[lesson.groupId];
            const isPast = isLessonPast(lesson.date);

            if (!subject || !group) return null;

            return (
              <div
                key={lesson.$id}
                className={`bg-white border rounded-lg shadow-sm ${
                  isPast ? "bg-gray-50" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lesson.title}
                        </h3>
                        {isPast ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            Завершено
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                            Предстоит
                          </span>
                        )}
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
                          <Clock className="h-4 w-4" />
                          {formatDate(lesson.date)}
                        </div>
                      </div>

                      {lesson.description && (
                        <p className="text-gray-700 mb-3">
                          {lesson.description}
                        </p>
                      )}

                      <div className="text-xs text-gray-500">
                        Создано:{" "}
                        {new Date(lesson.$createdAt).toLocaleDateString(
                          "ru-RU"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/teacher/attendance/lesson/${lesson.$id}`}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Посещаемость
                    </Link>

                    <button
                      onClick={() => handleDelete(lesson)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow  border-[6699FF]">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterSubject !== "all"
              ? "Занятий не найдено"
              : "Занятия не созданы"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterSubject !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первое занятие для ваших групп"}
          </p>
          {!searchTerm && filterSubject === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать занятие
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания занятия */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать занятие
                </h2>

                {/* Выбор группы и дисциплины */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Группа и дисциплина *
                  </label>
                  {groupSubjectCombinations.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {groupSubjectCombinations.map((combo, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="groupSubject"
                            value={`${combo.groupId}-${combo.subjectId}`}
                            checked={
                              selectedGroupSubject?.groupId === combo.groupId &&
                              selectedGroupSubject?.subjectId ===
                                combo.subjectId
                            }
                            onChange={() =>
                              setSelectedGroupSubject({
                                groupId: combo.groupId,
                                subjectId: combo.subjectId,
                              })
                            }
                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="text-sm">
                            {combo.group?.title} - {combo.subject?.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Нет назначений групп и дисциплин
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название занятия *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите название занятия"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата и время *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Описание занятия (необязательно)"
                  />
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setSelectedGroupSubject(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !selectedGroupSubject}
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
