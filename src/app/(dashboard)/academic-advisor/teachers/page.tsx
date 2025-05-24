// src/app/(dashboard)/academic-advisor/teachers/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  useCreateUser,
  useTeachers,
  useActivateUser,
  useDeactivateUser,
} from "@/services/authService";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
} from "lucide-react";

export default function AcademicCouncilTeachersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Получение преподавателей
  const { data: teachers = [], isLoading } = useTeachers();

  // Мутации
  const createUserMutation = useCreateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  // Фильтрация преподавателей
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && teacher.isActive) ||
      (filterStatus === "inactive" && !teacher.isActive);

    return matchesSearch && matchesFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    createUserMutation.mutate(
      {
        name,
        email,
        password,
        role: UserRole.TEACHER,
        createdBy: user?.$id || "",
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          toast.success("Преподаватель успешно создан");
          (e.target as HTMLFormElement).reset();
        },
        onError: (error) => {
          toast.error(`Ошибка при создании преподавателя: ${error.message}`);
        },
      }
    );
  };

  const handleActivate = (teacher: User) => {
    activateMutation.mutate(teacher.$id, {
      onSuccess: () => {
        toast.success(`Преподаватель ${teacher.name} активирован`);
      },
      onError: (error) => {
        toast.error(`Ошибка при активации: ${error.message}`);
      },
    });
  };

  const handleDeactivate = (teacher: User) => {
    if (
      window.confirm(
        `Вы уверены, что хотите деактивировать преподавателя "${teacher.name}"?`
      )
    ) {
      deactivateMutation.mutate(teacher.$id, {
        onSuccess: () => {
          toast.success(`Преподаватель ${teacher.name} деактивирован`);
        },
        onError: (error) => {
          toast.error(`Ошибка при деактивации: ${error.message}`);
        },
      });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка преподавателей...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление преподавателями
        </h1>
        <p className="text-gray-600">
          Создание, активация и управление преподавателями
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего преподавателей
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers.filter((t) => t.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserX className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Неактивных</p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers.filter((t) => !t.isActive).length}
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
              placeholder="Поиск по имени или email..."
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
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать преподавателя
          </button>
        </div>
      </div>

      {/* Список преподавателей */}
      {filteredTeachers.length > 0 ? (
        <div className="bg-white rounded-lg shadow border">
          <div className="divide-y divide-gray-200">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.$id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {teacher.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            teacher.isActive
                          )}`}
                        >
                          {teacher.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Создан:{" "}
                          {new Date(teacher.$createdAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {teacher.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {teacher.isActive ? (
                      <button
                        onClick={() => handleDeactivate(teacher)}
                        disabled={deactivateMutation.isPending}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <UserX className="h-4 w-4 inline mr-1" />
                        Деактивировать
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(teacher)}
                        disabled={activateMutation.isPending}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        <UserCheck className="h-4 w-4 inline mr-1" />
                        Активировать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all"
              ? "Преподаватели не найдены"
              : "Нет преподавателей"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первого преподавателя"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать преподавателя
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания преподавателя */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать преподавателя
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Полное имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите полное имя"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите email"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите пароль (минимум 6 символов)"
                  />
                </div>

                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Преподаватель будет создан с неактивным статусом. После
                      создания вы сможете его активировать.
                    </p>
                  </div>
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
                  disabled={createUserMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createUserMutation.isPending ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
