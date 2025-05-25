// src/app/(dashboard)/teacher/lessons/create/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { lessonApi, LessonCreateDto } from "@/services/lessonService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import {
  convertLocalDateTimeToISO,
  getMinDateTime,
  getDefaultDateTime,
} from "@/utils/dateUtils";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Users,
  Calendar,
  FileText,
  AlertCircle,
  Save,
  Clock,
} from "lucide-react";

export default function TeacherCreateLessonPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedGroupSubject, setSelectedGroupSubject] = useState<{
    groupId: string;
    subjectId: string;
  } | null>(null);

  // Получаем назначения преподавателя
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () =>
      teacherAssignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем дисциплины и группы для отображения названий
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  // Мутация для создания занятия
  const createMutation = useMutation({
    mutationFn: (data: LessonCreateDto) => lessonApi.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
      toast.success("Занятие успешно создано!");
      router.push("/teacher/lessons");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании занятия: ${error.message}`);
    },
  });

  // Создаем карты для быстрого доступа
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleBack = () => {
    router.back();
  };

  // Функции для работы с датами перенесены в утилиты
  // Используем импортированные функции getMinDateTime и getDefaultDateTime

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к занятиям
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Создать занятие
        </h1>
        <p className="text-gray-600">
          Запланируйте новое занятие для своих групп
        </p>
      </div>

      <div className="max-w-2xl">
        {groupSubjectCombinations.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор группы и дисциплины */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Выбор группы и дисциплины
              </h2>

              <div className="space-y-3">
                {groupSubjectCombinations.map((combo, index) => (
                  <label
                    key={`${combo.groupId}-${combo.subjectId}`}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="groupSubject"
                      value={`${combo.groupId}-${combo.subjectId}`}
                      checked={
                        selectedGroupSubject?.groupId === combo.groupId &&
                        selectedGroupSubject?.subjectId === combo.subjectId
                      }
                      onChange={() =>
                        setSelectedGroupSubject({
                          groupId: combo.groupId,
                          subjectId: combo.subjectId,
                        })
                      }
                      className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900">
                          {combo.group?.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">
                          {combo.subject?.title}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Основная информация о занятии */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Информация о занятии
              </h2>

              <div className="space-y-4">
                <div>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Например: "Лекция №1. Введение в предмет"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата и время проведения *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    min={getMinDateTime()}
                    defaultValue={getDefaultDateTime()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Выберите дату и время проведения занятия
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание занятия
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Опишите план занятия, темы, которые будут рассмотрены..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Необязательное поле. Поможет студентам подготовиться к
                    занятию
                  </p>
                </div>
              </div>
            </div>

            {/* Информационный блок */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Что произойдет после создания занятия?
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Занятие появится в расписании студентов</p>
                    <p>• Вы сможете отметить посещаемость после проведения</p>
                    <p>• Студенты увидят информацию о занятии заранее</p>
                    <p>• Занятие можно будет отредактировать или удалить</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={createMutation.isPending || !selectedGroupSubject}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {createMutation.isPending ? "Создание..." : "Создать занятие"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Нет доступных групп и дисциплин
            </h3>
            <p className="text-gray-500 mb-6">
              Обратитесь к академ советнику для назначения вам групп и дисциплин
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Назад
            </button>
          </div>
        )}
      </div>

      {/* Дополнительная информация */}
      <div className="max-w-2xl mt-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Полезные советы
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              • Планируйте занятия заранее, чтобы студенты могли подготовиться
            </p>
            <p>• Добавляйте подробное описание для лучшего понимания темы</p>
            <p>• Указывайте точное время начала и окончания занятия</p>
            <p>• После проведения не забудьте отметить посещаемость</p>
          </div>
        </div>
      </div>
    </div>
  );
}
