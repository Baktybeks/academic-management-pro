// src/app/(dashboard)/super-admin/survey-periods/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import { surveyApi } from "@/services/surveyService";
import { SurveyPeriod, Survey, SurveyPeriodCreateDto } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Search,
  Play,
  Pause,
  Calendar,
  Clock,
  ClipboardList,
  BarChart3,
  Users,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SurveyPeriodCreateFormData {
  title: string;
  description: string;
  surveyId: string;
  startDate: string;
  endDate: string;
}

export default function SuperAdminSurveyPeriodsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<SurveyPeriod | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Получение периодов опросов
  const {
    data: surveyPeriods = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["survey-periods"],
    queryFn: surveyPeriodApi.getAllSurveyPeriods,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Получение опросников для выбора
  const { data: surveys = [] } = useQuery({
    queryKey: ["surveys"],
    queryFn: surveyApi.getAllSurveys,
  });

  // Логирование для отладки
  React.useEffect(() => {
    console.log("Survey Periods Data:", surveyPeriods);
    console.log("Surveys Data:", surveys);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
  }, [surveyPeriods, surveys, isLoading, error]);

  // Создание периода опроса
  const createMutation = useMutation({
    mutationFn: (data: SurveyPeriodCreateDto) =>
      surveyPeriodApi.createSurveyPeriod(data, user?.$id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-periods"] });
      setIsCreateModalOpen(false);
      toast.success("Период опроса успешно создан");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании периода: ${error.message}`);
    },
  });

  // Обновление периода опроса
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SurveyPeriodCreateDto>;
    }) => surveyPeriodApi.updateSurveyPeriod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-periods"] });
      setEditingPeriod(null);
      toast.success("Период опроса успешно обновлен");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении периода: ${error.message}`);
    },
  });

  // Изменение статуса периода
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      surveyPeriodApi.toggleSurveyPeriodStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-periods"] });
      toast.success("Статус периода изменен");
    },
    onError: (error) => {
      toast.error(`Ошибка при изменении статуса: ${error.message}`);
    },
  });

  // Удаление периода
  const deleteMutation = useMutation({
    mutationFn: surveyPeriodApi.deleteSurveyPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-periods"] });
      toast.success("Период опроса удален");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении периода: ${error.message}`);
    },
  });

  // Фильтрация периодов
  const filteredPeriods = surveyPeriods.filter((period) => {
    const matchesSearch =
      period.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (period.description &&
        period.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && period.isActive) ||
      (filterStatus === "inactive" && !period.isActive) ||
      (filterStatus === "upcoming" &&
        new Date(period.startDate) > new Date()) ||
      (filterStatus === "current" &&
        new Date(period.startDate) <= new Date() &&
        new Date(period.endDate) >= new Date()) ||
      (filterStatus === "expired" && new Date(period.endDate) < new Date());

    return matchesSearch && matchesFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: SurveyPeriodCreateDto = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      surveyId: formData.get("surveyId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    createMutation.mutate(data);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPeriod) return;

    const formData = new FormData(e.currentTarget);

    const data: Partial<SurveyPeriodCreateDto> = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      surveyId: formData.get("surveyId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    updateMutation.mutate({ id: editingPeriod.$id, data });
  };

  const handleToggleStatus = (period: SurveyPeriod) => {
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

  const handleDelete = (period: SurveyPeriod) => {
    if (
      window.confirm(`Вы уверены, что хотите удалить период "${period.title}"?`)
    ) {
      deleteMutation.mutate(period.$id);
    }
  };

  const getPeriodStatus = (period: SurveyPeriod) => {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (!period.isActive) {
      return {
        status: "inactive",
        label: "Неактивен",
        color: "bg-gray-100 text-gray-800",
      };
    }

    if (now < startDate) {
      return {
        status: "upcoming",
        label: "Запланирован",
        color: "bg-blue-100 text-blue-800",
      };
    }

    if (now >= startDate && now <= endDate) {
      return {
        status: "current",
        label: "Активен",
        color: "bg-green-100 text-green-800",
      };
    }

    return {
      status: "expired",
      label: "Завершен",
      color: "bg-red-100 text-red-800",
    };
  };

  const getSurveyTitle = (surveyId: string) => {
    const survey = surveys.find((s) => s.$id === surveyId);
    return survey ? survey.title : "Опросник не найден";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  // Вычисление статистики с защитой от ошибок
  const stats = React.useMemo(() => {
    const now = new Date();
    return {
      total: surveyPeriods.length,
      active: surveyPeriods.filter((p) => {
        try {
          return (
            p.isActive &&
            new Date(p.startDate) <= now &&
            new Date(p.endDate) >= now
          );
        } catch {
          return false;
        }
      }).length,
      upcoming: surveyPeriods.filter((p) => {
        try {
          return new Date(p.startDate) > now;
        } catch {
          return false;
        }
      }).length,
      completed: surveyPeriods.filter((p) => {
        try {
          return new Date(p.endDate) < now;
        } catch {
          return false;
        }
      }).length,
    };
  }, [surveyPeriods]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-lg">Загрузка периодов опросов...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ошибка загрузки данных
            </h3>
            <p className="text-gray-500 mb-4">
              Не удалось загрузить периоды опросов
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log(
    surveyPeriods,
    "surveyPeriodssurveyPeriodssurveyPeriodssurveyPeriods"
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление периодами опросов
        </h1>
        <p className="text-gray-600">
          Создание и управление периодами проведения опросов студентов
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего периодов
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
                {stats.upcoming}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Завершенных</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Индикатор отладки (временно для проверки) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <strong>Debug Info:</strong> Periods: {surveyPeriods.length}, Surveys:{" "}
          {surveys.length}, Active: {stats.active}, Upcoming: {stats.upcoming},
          Completed: {stats.completed}
        </div>
      )}

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
            <option value="current">Текущие</option>
            <option value="upcoming">Запланированные</option>
            <option value="expired">Завершенные</option>
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

      {/* Предупреждение если нет опросников */}
      {surveys.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Внимание!</p>
              <p className="text-sm text-yellow-700">
                Для создания периодов опросов необходимо сначала создать
                опросники.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Список периодов */}
      {filteredPeriods.length > 0 ? (
        <div className="space-y-4">
          {filteredPeriods.map((period) => {
            const status = getPeriodStatus(period);
            const surveyTitle = getSurveyTitle(period.surveyId);

            return (
              <div
                key={period.$id}
                className="bg-white border rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-6 w-6 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {period.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {period.description && (
                        <p className="text-gray-700 mb-3">
                          {period.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          <span>
                            <strong>Опросник:</strong> {surveyTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            <strong>Период:</strong>{" "}
                            {formatDate(period.startDate)} -{" "}
                            {formatDate(period.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            <strong>Создан:</strong>{" "}
                            {formatDate(period.$createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
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
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                        period.isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
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
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all"
              ? "Периодов не найдено"
              : "Периоды опросов не созданы"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первый период для проведения опросов"}
          </p>
          {!searchTerm && filterStatus === "all" && surveys.length > 0 && (
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
        <SurveyPeriodModal
          title="Создать период опроса"
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
          surveys={surveys}
        />
      )}

      {/* Модальное окно редактирования */}
      {editingPeriod && (
        <SurveyPeriodModal
          title="Редактировать период опроса"
          onSubmit={handleEditSubmit}
          onClose={() => setEditingPeriod(null)}
          isLoading={updateMutation.isPending}
          surveys={surveys}
          defaultValues={editingPeriod}
        />
      )}
    </div>
  );
}

// Компонент модального окна для создания/редактирования периода
function SurveyPeriodModal({
  title,
  onSubmit,
  onClose,
  isLoading,
  surveys,
  defaultValues,
}: {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isLoading: boolean;
  surveys: Survey[];
  defaultValues?: SurveyPeriod;
}) {
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опросник *
                </label>
                <select
                  name="surveyId"
                  required
                  defaultValue={defaultValues?.surveyId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите опросник</option>
                  {surveys
                    .filter((s) => s.isActive)
                    .map((survey) => (
                      <option key={survey.$id} value={survey.$id}>
                        {survey.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата и время начала *
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
                    Дата и время окончания *
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
                  <strong>Примечание:</strong> Период будет создан в неактивном
                  состоянии. После создания вы сможете его активировать для
                  открытия студентам.
                </p>
              </div>
            )}

            {surveys.filter((s) => s.isActive).length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Внимание:</strong> Нет активных опросников. Сначала
                  создайте и активируйте опросник.
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
              disabled={
                isLoading || surveys.filter((s) => s.isActive).length === 0
              }
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
