// src/app/(dashboard)/teacher/assignments/create/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { assignmentApi } from "@/services/assignmentService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { CreateAssignmentDto } from "@/types";
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
} from "lucide-react";

export default function TeacherCreateAssignmentPage() {
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

  // Мутация для создания задания
  const createMutation = useMutation({
    mutationFn: (data: CreateAssignmentDto) =>
      assignmentApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      toast.success("Задание успешно создано!");
      router.push("/teacher");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании задания: ${error.message}`);
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

    const data: CreateAssignmentDto = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      groupId: selectedGroupSubject.groupId,
      subjectId: selectedGroupSubject.subjectId,
      teacherId: user?.$id || "",
      dueDate: formData.get("dueDate") as string,
      maxScore: parseInt(formData.get("maxScore") as string) || 100,
    };

    createMutation.mutate(data);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Создать контрольное задание
        </h1>
        <p className="text-gray-600">
          Создайте новое задание для студентов своих групп
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
                    className="flex items-center"
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
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {combo.group?.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span>{combo.subject?.title}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Основная информация о задании */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Информация о задании
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название задания *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите название задания"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание задания *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Опишите задание подробно: что нужно сделать, какие требования, критерии оценки..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Срок сдачи *
                    </label>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Максимальный балл
                    </label>
                    <input
                      type="number"
                      name="maxScore"
                      min="1"
                      max="1000"
                      defaultValue="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Инструкции для студентов */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Инструкции для студентов
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      • Студенты смогут отправлять ссылки на свои работы (Google
                      Docs, Figma, GitHub и т.п.)
                    </p>
                    <p>
                      • После отправки работы вы сможете ее проверить и оценить
                    </p>
                    <p>• Студенты увидят ваши комментарии и оценки</p>
                    <p>• Работы можно переотправлять до срока сдачи</p>
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
                {createMutation.isPending ? "Создание..." : "Создать задание"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Нет доступных групп и дисциплин
            </h3>
            <p className="text-gray-500 mb-6">
              Обратитесь к академсоветнику для назначения вам групп и дисциплин
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
    </div>
  );
}
