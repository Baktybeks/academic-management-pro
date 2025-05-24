"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  useCreateUser,
  useAcademicCouncil,
  useActivateUser,
  useDeactivateUser,
} from "@/services/authService";
import { User, UserRole, UserRoleLabels } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Search,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  Crown,
} from "lucide-react";

export default function SuperAdminAcademicCouncilPage() {
  const { user } = useAuthStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: academicCouncilMembers = [], isLoading } = useAcademicCouncil();
  const createUserMutation = useCreateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const filteredMembers = academicCouncilMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && member.isActive) ||
      (filterStatus === "inactive" && !member.isActive);

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
        role: UserRole.ACADEMIC_ADVISOR,
        createdBy: user?.$id || "",
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          toast.success("Академ советник успешно создан");
          (e.target as HTMLFormElement).reset();
        },
        onError: (error) => {
          toast.error(`Ошибка при создании академсоветника: ${error.message}`);
        },
      }
    );
  };

  const handleActivate = (member: User) => {
    activateMutation.mutate(member.$id, {
      onSuccess: () => {
        toast.success(`Академ советник ${member.name} активирован`);
      },
      onError: (error) => {
        toast.error(`Ошибка при активации: ${error.message}`);
      },
    });
  };

  const handleDeactivate = (member: User) => {
    if (
      window.confirm(
        `Вы уверены, что хотите деактивировать академсоветника "${member.name}"?`
      )
    ) {
      deactivateMutation.mutate(member.$id, {
        onSuccess: () => {
          toast.success(`Академ советник ${member.name} деактивирован`);
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
          <div className="text-lg">Загрузка академ советников...</div>
        </div>
      </div>
    );
  }
  console.log(filteredMembers, "filteredMembersfilteredMembersfilteredMembers");

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление академ советниками
        </h1>
        <p className="text-gray-600">
          Создание и управление академ советниками системы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего академ советников
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {academicCouncilMembers.length}
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
                {academicCouncilMembers.filter((m) => m.isActive).length}
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
                {academicCouncilMembers.filter((m) => !m.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
            Создать академ советника
          </button>
        </div>
      </div>

      {filteredMembers.length > 0 ? (
        <div className="bg-white rounded-lg shadow border">
          <div className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <div key={member.$id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Crown className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            member.isActive
                          )}`}
                        >
                          {member.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Создан:{" "}
                          {new Date(member.$createdAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {UserRoleLabels[member.role]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.isActive ? (
                      <button
                        onClick={() => handleDeactivate(member)}
                        disabled={deactivateMutation.isPending}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <UserX className="h-4 w-4 inline mr-1" />
                        Деактивировать
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(member)}
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
          <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all"
              ? "Академ советники не найдены"
              : "Нет академ советников"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первого академсоветника"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать академсоветника
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания академсоветника */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать академсоветника
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

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-800">
                      Академ советник будет создан с неактивным статусом. После
                      создания вы сможете его активировать.
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-1">
                        Полномочия академсоветника:
                      </p>
                      <div className="text-xs text-yellow-700 space-y-1">
                        <p>• Создание и управление преподавателями</p>
                        <p>• Создание и управление студентами</p>
                        <p>
                          • Назначение преподавателей к группам и дисциплинам
                        </p>
                        <p>• Активация пользователей</p>
                        <p>• Просмотр оценок и посещаемости</p>
                      </div>
                    </div>
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
      <div className="mt-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Рекомендации по управлению академ советниками
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Создавайте академ советников только для доверенных лиц</p>
                <p>• Регулярно проверяйте активность академ советников</p>
                <p>• При необходимости деактивируйте неиспользуемые аккаунты</p>
                <p>• Академ советники имеют широкие права в системе</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
