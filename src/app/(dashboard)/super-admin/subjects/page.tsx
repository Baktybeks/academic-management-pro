// src/app/(dashboard)/super-admin/subjects/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectApi } from "@/services/subjectService";
import { useAuthStore } from "@/store/authStore";
import { Subject, CreateSubjectDto } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  Search,
  Filter,
} from "lucide-react";

export default function SubjectsManagementPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Получение дисциплин
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  // Создание дисциплины
  const createMutation = useMutation({
    mutationFn: (data: CreateSubjectDto) =>
      subjectApi.createSubject(data, user?.$id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsCreateModalOpen(false);
      toast.success("Дисциплина успешно создана");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании дисциплины: ${error.message}`);
    },
  });

  // Обновление дисциплины
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSubjectDto>;
    }) => subjectApi.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setEditingSubject(null);
      toast.success("Дисциплина успешно обновлена");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении дисциплины: ${error.message}`);
    },
  });

  // Изменение статуса дисциплины
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      subjectApi.toggleSubjectStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Статус дисциплины изменен");
    },
    onError: (error) => {
      toast.error(`Ошибка при изменении статуса: ${error.message}`);
    },
  });

  // Удаление дисциплины
  const deleteMutation = useMutation({
    mutationFn: subjectApi.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Дисциплина удалена");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении дисциплины: ${error.message}`);
    },
  });

  // Фильтрация дисциплин
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description &&
        subject.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterActive === null || subject.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateSubjectDto = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
    };

    createMutation.mutate(data);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSubject) return;

    const formData = new FormData(e.currentTarget);

    const data: Partial<CreateSubjectDto> = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
    };

    updateMutation.mutate({ id: editingSubject.$id, data });
  };

  const handleToggleStatus = (subject: Subject) => {
    toggleStatusMutation.mutate({
      id: subject.$id,
      isActive: !subject.isActive,
    });
  };

  const handleDelete = (subject: Subject) => {
    if (
      window.confirm(
        `Вы уверены, что хотите удалить дисциплину "${subject.title}"?`
      )
    ) {
      deleteMutation.mutate(subject.$id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка дисциплин...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление дисциплинами
        </h1>
        <p className="text-gray-600">
          Создание и управление учебными дисциплинами в системе
        </p>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filterActive === null ? "all" : filterActive.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActive(value === "all" ? null : value === "true");
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все дисциплины</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать дисциплину
          </button>
        </div>
      </div>

      {/* Список дисциплин */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.$id}
            className="bg-white border-[6699FF] rounded-lg shadow-sm"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {subject.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          subject.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subject.isActive ? "Активна" : "Неактивна"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {subject.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {subject.description}
                </p>
              )}

              <div className="text-xs text-gray-500 mb-4">
                Создана:{" "}
                {new Date(subject.$createdAt).toLocaleDateString("ru-RU")}
              </div>

              <div className="flex flex-wrap gap-2 ">
                <button
                  onClick={() => setEditingSubject(subject)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  <Edit className="h-3 w-3" />
                  Редактировать
                </button>

                <button
                  onClick={() => handleToggleStatus(subject)}
                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                    subject.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {subject.isActive ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Деактивировать
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      Активировать
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(subject)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || filterActive !== null
              ? "По вашему запросу дисциплин не найдено"
              : "Дисциплины пока не созданы"}
          </p>
          {!searchTerm && filterActive === null && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
            >
              Создать первую дисциплину
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать дисциплину
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название дисциплины *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите название дисциплины"
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
                    placeholder="Описание дисциплины (необязательно)"
                  />
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
                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
                >
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Редактировать дисциплину
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название дисциплины *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingSubject.title}
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
                    defaultValue={editingSubject.description || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
