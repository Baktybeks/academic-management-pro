// src/app/(dashboard)/super-admin/grading-periods/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { GradingPeriod, GradingPeriodCreateDto } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Search,
  Play,
  Pause,
  BarChart3,
  Users,
  Award,
  Clock,
} from "lucide-react";

export default function SuperAdminGradingPeriodsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<GradingPeriod | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Получение периодов оценок
  const { data: gradingPeriods = [], isLoading } = useQuery({
    queryKey: ["grading-periods"],
    queryFn: gradingPeriodApi.getAllGradingPeriods,
  });

  // Создание периода оценок
  const createMutation = useMutation({
    mutationFn: (data: GradingPeriodCreateDto) =>
      gradingPeriodApi.createGradingPeriod(data, user?.$id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grading-periods"] });
      setIsCreateModalOpen(false);
      toast.success("Период оценок успешно создан");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании периода: ${error.message}`);
    },
  });

  // Обновление периода оценок
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<GradingPeriodCreateDto>;
    }) => gradingPeriodApi.updateGradingPeriod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grading-periods"] });
      setEditingPeriod(null);
      toast.success("Период оценок успешно обновлен");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении периода: ${error.message}`);
    },
  });

  // Изменение статуса периода
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      gradingPeriodApi.toggleGradingPeriodStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grading-periods"] });
      toast.success("Статус периода изменен");
    },
    onError: (error) => {
      toast.error(`Ошибка при изменении статуса: ${error.message}`);
    },
  });

  // Удаление периода
  const deleteMutation = useMutation({
    mutationFn: gradingPeriodApi.deleteGradingPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grading-periods"] });
      toast.success("Период оценок удален");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении периода: ${error.message}`);
    },
  });

  // Фильтрация периодов
  const filteredPeriods = gradingPeriods.filter((period) => {
    const matchesSearch =
      period.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (period.description &&
        period.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && period.isActive) ||
      (filterStatus === "inactive" && !period.isActive);

    return matchesSearch && matchesFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: GradingPeriodCreateDto = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    createMutation.mutate(data);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPeriod) return;

    const formData = new FormData(e.currentTarget);

    const data: Partial<GradingPeriodCreateDto> = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    updateMutation.mutate({ id: editingPeriod.$id, data });
  };

  const handleToggleStatus = (period: GradingPeriod) => {
    const action = period.isActive ? "деактивировать" : "активировать";
    if (
      window.confirm(
        `Вы уверены, что хотите ${action} период "${period.title}"?`
      )
    ) {
      toggleStatusMutation.mutate({
        id: period.$id,
        isActive: !period.isActive,
      });
    }
  };

  const handleDelete = (period: GradingPeriod) => {
    if (
      window.confirm(`Вы уверены, что хотите удалить период "${period.title}"?`)
    ) {
      deleteMutation.mutate(period.$id);
    }
  };

  const getStatusColor = (period: GradingPeriod) => {
    if (period.isActive) {
      return "bg-green-100 text-green-800";
    }

    const now = new Date();
    const endDate = new Date(period.endDate);

    if (endDate < now) {
      return "bg-gray-100 text-gray-800";
    }

    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (period: GradingPeriod) => {
    if (period.isActive) {
      return "Активен";
    }

    const now = new Date();
    const endDate = new Date(period.endDate);

    if (endDate < now) {
      return "Завершен";
    }

    return "Запланирован";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка периодов оценок...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление периодами оценок
        </h1>
        <p className="text-gray-600">
          Создание и управление периодами для выставления финальных оценок
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего периодов
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {gradingPeriods.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Play className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-gray-900">
                {gradingPeriods.filter((p) => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Запланированных
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  gradingPeriods.filter(
                    (p) => !p.isActive && new Date(p.endDate) >= new Date()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Завершенных</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  gradingPeriods.filter(
                    (p) => !p.isActive && new Date(p.endDate) < new Date()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Все периоды</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать период
          </button>
        </div>
      </div>

      {/* Список периодов */}
      {filteredPeriods.length > 0 ? (
        <div className="space-y-4">
          {filteredPeriods.map((period) => (
            <div
              key={period.$id}
              className="bg-white border rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-6 w-6 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {period.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          period
                        )}`}
                      >
                        {getStatusText(period)}
                      </span>
                    </div>

                    {period.description && (
                      <p className="text-gray-700 mb-3">{period.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <strong>Начало:</strong> {formatDate(period.startDate)}
                      </div>
                      <div>
                        <strong>Окончание:</strong> {formatDate(period.endDate)}
                      </div>
                      <div>
                        <strong>Создан:</strong> {formatDate(period.$createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPeriod(period)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Редактировать
                  </button>

                  <button
                    onClick={() => handleToggleStatus(period)}
                    disabled={toggleStatusMutation.isPending}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded hover:opacity-80 transition-colors ${
                      period.isActive
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {period.isActive ? (
                      <>
                        <Pause className="h-3 w-3" />
                        Деактивировать
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Активировать
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(period)}
                    disabled={period.isActive}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3" />
                    Удалить
                  </button>

                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">
                    <BarChart3 className="h-3 w-3" />
                    Статистика
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all"
              ? "Периодов не найдено"
              : "Периоды оценок не созданы"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первый период для выставления оценок"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать период
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания */}
      {isCreateModalOpen && (
        <GradingPeriodModal
          title="Создать период оценок"
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Модальное окно редактирования */}
      {editingPeriod && (
        <GradingPeriodModal
          title="Редактировать период оценок"
          onSubmit={handleEditSubmit}
          onClose={() => setEditingPeriod(null)}
          isLoading={updateMutation.isPending}
          defaultValues={editingPeriod}
        />
      )}
    </div>
  );
}

// Компонент модального окна для создания/редактирования периода
function GradingPeriodModal({
  title,
  onSubmit,
  onClose,
  isLoading,
  defaultValues,
}: {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isLoading: boolean;
  defaultValues?: GradingPeriod;
}) {
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={onSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название периода *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={defaultValues?.title || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите название периода"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={defaultValues?.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Описание периода (необязательно)"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата начала *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    required
                    defaultValue={
                      defaultValues
                        ? formatDateForInput(defaultValues.startDate)
                        : ""
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата окончания *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    required
                    defaultValue={
                      defaultValues
                        ? formatDateForInput(defaultValues.endDate)
                        : ""
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {!defaultValues && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Период будет создан в неактивном состоянии. После создания вы
                  сможете его активировать для открытия возможности выставления
                  оценок.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading
                ? "Сохранение..."
                : defaultValues
                ? "Сохранить"
                : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
