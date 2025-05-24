// src/app/(dashboard)/super-admin/surveys/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { surveyApi } from "@/services/surveyService";
import { Survey, SurveyQuestion, SurveyCreateDto } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  ClipboardList,
  Search,
  Eye,
  EyeOff,
  List,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  RotateCcw,
} from "lucide-react";

export default function SuperAdminSurveysPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [viewingQuestions, setViewingQuestions] = useState<Survey | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<Survey | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Получение опросников
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: surveyApi.getAllSurveys,
  });

  // Получение вопросов для просмотра/редактирования
  const { data: surveyQuestions = [], refetch: refetchQuestions } = useQuery({
    queryKey: [
      "survey-questions",
      viewingQuestions?.$id || editingQuestions?.$id,
    ],
    queryFn: () =>
      surveyApi.getQuestionsBySurveyId(
        (viewingQuestions || editingQuestions)!.$id
      ),
    enabled: !!(viewingQuestions || editingQuestions),
  });

  // Создание опросника
  const createMutation = useMutation({
    mutationFn: async (data: {
      survey: SurveyCreateDto;
      questions: string[];
    }) => {
      const survey = await surveyApi.createSurvey(data.survey);

      // Создаем вопросы
      for (let i = 0; i < data.questions.length; i++) {
        await surveyApi.createQuestion({
          surveyId: survey.$id,
          text: data.questions[i],
          order: i + 1,
        });
      }

      return survey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      setIsCreateModalOpen(false);
      toast.success("Опросник успешно создан");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании опросника: ${error.message}`);
    },
  });

  // Обновление опросника
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SurveyCreateDto>;
    }) => surveyApi.updateSurvey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      setEditingSurvey(null);
      toast.success("Опросник успешно обновлен");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении опросника: ${error.message}`);
    },
  });

  // Создание вопроса
  const createQuestionMutation = useMutation({
    mutationFn: (data: { surveyId: string; text: string; order: number }) =>
      surveyApi.createQuestion(data),
    onSuccess: () => {
      refetchQuestions();
      toast.success("Вопрос добавлен");
    },
    onError: (error) => {
      toast.error(`Ошибка при добавлении вопроса: ${error.message}`);
    },
  });

  // Обновление вопроса
  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      surveyApi.updateQuestion(id, { text }),
    onSuccess: () => {
      refetchQuestions();
      toast.success("Вопрос обновлен");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении вопроса: ${error.message}`);
    },
  });

  // Удаление вопроса
  const deleteQuestionMutation = useMutation({
    mutationFn: surveyApi.deleteQuestion,
    onSuccess: () => {
      refetchQuestions();
      toast.success("Вопрос удален");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении вопроса: ${error.message}`);
    },
  });

  // Изменение порядка вопросов
  const reorderQuestionsMutation = useMutation({
    mutationFn: surveyApi.reorderQuestions,
    onSuccess: () => {
      refetchQuestions();
      toast.success("Порядок вопросов обновлен");
    },
    onError: (error) => {
      toast.error(`Ошибка при изменении порядка: ${error.message}`);
    },
  });

  // Изменение статуса опросника
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      surveyApi.updateSurvey(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast.success("Статус опросника изменен");
    },
    onError: (error) => {
      toast.error(`Ошибка при изменении статуса: ${error.message}`);
    },
  });

  // Удаление опросника
  const deleteMutation = useMutation({
    mutationFn: surveyApi.deleteSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast.success("Опросник удален");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении опросника: ${error.message}`);
    },
  });

  // Фильтрация опросников
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && survey.isActive) ||
      (filterStatus === "inactive" && !survey.isActive);

    return matchesSearch && matchesFilter;
  });

  const handleCreateSubmit = (data: {
    title: string;
    description: string;
    questions: string[];
  }) => {
    const surveyData: SurveyCreateDto = {
      title: data.title,
      description: data.description,
      createdBy: user?.$id || "",
      isActive: true,
    };

    createMutation.mutate({ survey: surveyData, questions: data.questions });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSurvey) return;

    const formData = new FormData(e.currentTarget);

    const data: Partial<SurveyCreateDto> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
    };

    updateMutation.mutate({ id: editingSurvey.$id, data });
  };

  const handleToggleStatus = (survey: Survey) => {
    const action = survey.isActive ? "деактивировать" : "активировать";
    if (
      window.confirm(
        `Вы уверены, что хотите ${action} опросник "${survey.title}"?`
      )
    ) {
      toggleStatusMutation.mutate({
        id: survey.$id,
        isActive: !survey.isActive,
      });
    }
  };

  const handleDelete = (survey: Survey) => {
    if (
      window.confirm(
        `Вы уверены, что хотите удалить опросник "${survey.title}"?`
      )
    ) {
      deleteMutation.mutate(survey.$id);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка опросников...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление опросниками
        </h1>
        <p className="text-gray-600">
          Создание опросников для оценки преподавателей студентами
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardList className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего опросников
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter((s) => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeOff className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Неактивных</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter((s) => !s.isActive).length}
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
            <option value="all">Все опросники</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать опросник
          </button>
        </div>
      </div>

      {/* Список опросников */}
      {filteredSurveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.$id}
              className="bg-white border rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-6 w-6 text-indigo-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {survey.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            survey.isActive
                          )}`}
                        >
                          {survey.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {survey.description}
                </p>

                <div className="text-xs text-gray-500 mb-4">
                  Создан:{" "}
                  {new Date(survey.$createdAt).toLocaleDateString("ru-RU")}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setEditingSurvey(survey)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Редактировать
                  </button>

                  <button
                    onClick={() => setViewingQuestions(survey)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    <List className="h-3 w-3" />
                    Просмотр
                  </button>

                  <button
                    onClick={() => setEditingQuestions(survey)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Вопросы
                  </button>

                  <button
                    onClick={() => handleToggleStatus(survey)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                      survey.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {survey.isActive ? (
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
                    onClick={() => handleDelete(survey)}
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all"
              ? "Опросники не найдены"
              : "Опросники не созданы"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первый опросник для оценки преподавателей"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать опросник
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания */}
      {isCreateModalOpen && (
        <CreateSurveyModal
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Модальное окно редактирования */}
      {editingSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Редактировать опросник
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название опросника *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingSurvey.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    defaultValue={editingSurvey.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingSurvey(null)}
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

      {/* Модальное окно просмотра вопросов */}
      {viewingQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Вопросы опросника: {viewingQuestions.title}
                </h2>
                <button
                  onClick={() => setViewingQuestions(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {surveyQuestions.length > 0 ? (
                <div className="space-y-3">
                  {surveyQuestions
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((question, index) => (
                      <div
                        key={question.$id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <p className="text-gray-900">{question.text}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  В этом опроснике пока нет вопросов
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования вопросов */}
      {editingQuestions && (
        <EditQuestionsModal
          survey={editingQuestions}
          questions={surveyQuestions}
          onClose={() => setEditingQuestions(null)}
          onCreateQuestion={createQuestionMutation.mutate}
          onUpdateQuestion={updateQuestionMutation.mutate}
          onDeleteQuestion={deleteQuestionMutation.mutate}
          onReorderQuestions={reorderQuestionsMutation.mutate}
          isLoading={
            createQuestionMutation.isPending ||
            updateQuestionMutation.isPending ||
            deleteQuestionMutation.isPending ||
            reorderQuestionsMutation.isPending
          }
        />
      )}
    </div>
  );
}

// Компонент для создания опросника с вопросами
function CreateSurveyModal({
  onSubmit,
  onClose,
  isLoading,
}: {
  onSubmit: (data: {
    title: string;
    description: string;
    questions: string[];
  }) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [questions, setQuestions] = useState<string[]>([""]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const validQuestions = questions.filter((q) => q.trim().length > 0);

    if (validQuestions.length === 0) {
      toast.error("Добавьте хотя бы один вопрос");
      return;
    }

    onSubmit({ title, description, questions: validQuestions });
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < questions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [
        newQuestions[targetIndex],
        newQuestions[index],
      ];
      setQuestions(newQuestions);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Создать опросник
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название опросника *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите название опросника"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание *
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Описание опросника"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Вопросы *
                </label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Добавить вопрос
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Введите текст вопроса"
                    />
                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, "up")}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ArrowUp className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                      {index < questions.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, "down")}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ArrowDown className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Студенты будут оценивать каждый вопрос по шкале от 0 до 10
              </p>
            </div>
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
              {isLoading ? "Создание..." : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Компонент для редактирования вопросов
function EditQuestionsModal({
  survey,
  questions,
  onClose,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  isLoading,
}: {
  survey: Survey;
  questions: SurveyQuestion[];
  onClose: () => void;
  onCreateQuestion: (data: {
    surveyId: string;
    text: string;
    order: number;
  }) => void;
  onUpdateQuestion: (data: { id: string; text: string }) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (questionIds: string[]) => void;
  isLoading: boolean;
}) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editingText, setEditingText] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");

  const sortedQuestions = questions.sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const handleEditQuestion = (question: SurveyQuestion) => {
    setEditingQuestionId(question.$id);
    setEditingText(question.text);
  };

  const handleSaveQuestion = () => {
    if (editingQuestionId && editingText.trim()) {
      onUpdateQuestion({ id: editingQuestionId, text: editingText.trim() });
      setEditingQuestionId(null);
      setEditingText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingText("");
  };

  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      const nextOrder = Math.max(...questions.map((q) => q.order || 0), 0) + 1;
      onCreateQuestion({
        surveyId: survey.$id,
        text: newQuestionText.trim(),
        order: nextOrder,
      });
      setNewQuestionText("");
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот вопрос?")) {
      onDeleteQuestion(questionId);
    }
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...sortedQuestions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [
        newQuestions[targetIndex],
        newQuestions[index],
      ];

      // Обновляем порядок
      const reorderedIds = newQuestions.map((q) => q.$id);
      onReorderQuestions(reorderedIds);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Редактировать вопросы: {survey.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Добавление нового вопроса */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-3">
              Добавить новый вопрос
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Введите текст нового вопроса"
                onKeyPress={(e) => e.key === "Enter" && handleAddQuestion()}
              />
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestionText.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Список вопросов */}
          {sortedQuestions.length > 0 ? (
            <div className="space-y-3">
              {sortedQuestions.map((question, index) => (
                <div
                  key={question.$id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>

                    <div className="flex-1">
                      {editingQuestionId === question.$id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveQuestion}
                              disabled={!editingText.trim() || isLoading}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                              Сохранить
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900">{question.text}</p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {editingQuestionId !== question.$id && (
                        <>
                          {index > 0 && (
                            <button
                              onClick={() => moveQuestion(index, "up")}
                              disabled={isLoading}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <ArrowUp className="h-4 w-4 text-gray-500" />
                            </button>
                          )}
                          {index < sortedQuestions.length - 1 && (
                            <button
                              onClick={() => moveQuestion(index, "down")}
                              disabled={isLoading}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <ArrowDown className="h-4 w-4 text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditQuestion(question)}
                            disabled={isLoading}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600 disabled:opacity-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.$id)}
                            disabled={isLoading}
                            className="p-1 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              В этом опроснике пока нет вопросов. Добавьте первый вопрос выше.
            </div>
          )}

          {sortedQuestions.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Всего вопросов:</strong> {sortedQuestions.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Студенты будут оценивать каждый вопрос по шкале от 0 до 10
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
