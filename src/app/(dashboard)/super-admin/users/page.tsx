// app/(dashboard)/super-admin/users/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  useCreateUser,
  useAllUsers,
  useActivateUser,
  useDeactivateUser,
} from "@/services/authService";
import {
  User,
  UserRole,
  UserRoleLabels,
  getRoleColor,
  getRoleLabel,
} from "@/types";
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
  BookOpen,
  GraduationCap,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SuperAdminUsersPage() {
  const { user } = useAuthStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.ACADEMIC_ADVISOR
  );

  const { data: allUsers = [], isLoading } = useAllUsers();
  const createUserMutation = useCreateUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  // Фильтруем пользователей (исключаем супер-администраторов)
  const managedUsers = allUsers.filter((u) => u.role !== UserRole.SUPER_ADMIN);

  const filteredUsers = managedUsers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && member.isActive) ||
      (filterStatus === "inactive" && !member.isActive);

    const matchesRole = filterRole === "all" || member.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Статистика по ролям
  const stats = {
    total: managedUsers.length,
    academicAdvisors: managedUsers.filter(
      (u) => u.role === UserRole.ACADEMIC_ADVISOR
    ).length,
    teachers: managedUsers.filter((u) => u.role === UserRole.TEACHER).length,
    students: managedUsers.filter((u) => u.role === UserRole.STUDENT).length,
    active: managedUsers.filter((u) => u.isActive).length,
    inactive: managedUsers.filter((u) => !u.isActive).length,
  };

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
        role: selectedRole,
        createdBy: user?.$id || "",
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          toast.success(`${getRoleLabel(selectedRole)} успешно создан`);
          (e.target as HTMLFormElement).reset();
        },
        onError: (error) => {
          toast.error(`Ошибка при создании пользователя: ${error.message}`);
        },
      }
    );
  };

  const handleActivate = (member: User) => {
    activateMutation.mutate(member.$id, {
      onSuccess: () => {
        toast.success(
          `${getRoleLabel(member.role)} ${member.name} активирован`
        );
      },
      onError: (error) => {
        toast.error(`Ошибка при активации: ${error.message}`);
      },
    });
  };

  const handleDeactivate = (member: User) => {
    if (
      window.confirm(
        `Вы уверены, что хотите деактивировать ${getRoleLabel(
          member.role
        ).toLowerCase()} "${member.name}"?`
      )
    ) {
      deactivateMutation.mutate(member.$id, {
        onSuccess: () => {
          toast.success(
            `${getRoleLabel(member.role)} ${member.name} деактивирован`
          );
        },
        onError: (error) => {
          toast.error(`Ошибка при деактивации: ${error.message}`);
        },
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ACADEMIC_ADVISOR:
        return Crown;
      case UserRole.TEACHER:
        return BookOpen;
      case UserRole.STUDENT:
        return GraduationCap;
      default:
        return Users;
    }
  };

  const getRolePermissions = (role: UserRole) => {
    switch (role) {
      case UserRole.ACADEMIC_ADVISOR:
        return [
          "Создание и управление преподавателями",
          "Создание и управление студентами",
          "Назначение преподавателей к группам",
          "Активация пользователей",
          "Просмотр оценок и посещаемости",
        ];
      case UserRole.TEACHER:
        return [
          "Создание и проведение занятий",
          "Создание контрольных заданий",
          "Выставление оценок студентам",
          "Отметка посещаемости",
          "Просмотр групп и дисциплин",
        ];
      case UserRole.STUDENT:
        return [
          "Просмотр расписания занятий",
          "Сдача контрольных заданий",
          "Просмотр своих оценок",
          "Прохождение опросов преподавателей",
          "Просмотр посещаемости",
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка пользователей...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление пользователями
        </h1>
        <p className="text-gray-600">
          Создание и управление всеми пользователями системы
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-500 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Всего</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <Crown className="h-6 w-6 text-blue-500 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Советники</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.academicAdvisors}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Преподаватели</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.teachers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <GraduationCap className="h-6 w-6 text-purple-500 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Студенты</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.students}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <UserCheck className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Активных</p>
              <p className="text-lg font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <UserX className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Неактивных</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border-[6699FF]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Имя или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все роли</option>
              <option value={UserRole.ACADEMIC_ADVISOR}>
                Академ советники
              </option>
              <option value={UserRole.TEACHER}>Преподаватели</option>
              <option value={UserRole.STUDENT}>Студенты</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setIsCreateModalOpen(true)}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Создать пользователя
            </button>
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg shadow border-[6699FF]">
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <div key={member.$id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${getRoleColor(
                            member.role
                          )}`}
                        >
                          <RoleIcon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {member.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              member.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.isActive ? "Активен" : "Неактивен"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(
                              member.role
                            )}`}
                          >
                            {getRoleLabel(member.role)}
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
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border-[6699FF]">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== "all" || filterRole !== "all"
              ? "Пользователи не найдены"
              : "Нет пользователей"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all" || filterRole !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первого пользователя"}
          </p>
          {!searchTerm && filterStatus === "all" && filterRole === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
            >
              Создать пользователя
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания пользователя */}
      {isCreateModalOpen && (
      <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать пользователя
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль пользователя *
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as UserRole)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={UserRole.ACADEMIC_ADVISOR}>
                      Академический советник
                    </option>
                    <option value={UserRole.TEACHER}>Преподаватель</option>
                    <option value={UserRole.STUDENT}>Студент</option>
                  </select>
                </div>

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
                    {React.createElement(getRoleIcon(selectedRole), {
                      className: "h-5 w-5 text-blue-600 mr-2",
                    })}
                    <p className="text-sm text-blue-800">
                      {getRoleLabel(selectedRole)} будет создан с неактивным
                      статусом. После создания вы сможете его активировать.
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-1">
                        Полномочия {getRoleLabel(selectedRole).toLowerCase()}:
                      </p>
                      <div className="text-xs text-yellow-700 space-y-1">
                        {getRolePermissions(selectedRole).map(
                          (permission, index) => (
                            <p key={index}>• {permission}</p>
                          )
                        )}
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
                  className="px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createUserMutation.isPending ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Информационный блок */}
      <div className="mt-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Рекомендации по управлению пользователями
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Сначала создавайте академических советников</p>
                <p>
                  • Преподавателей и студентов могут создавать академ советники
                </p>
                <p>• Регулярно проверяйте активность пользователей</p>
                <p>• При необходимости деактивируйте неиспользуемые аккаунты</p>
                <p>• Каждая роль имеет определенные права в системе</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
