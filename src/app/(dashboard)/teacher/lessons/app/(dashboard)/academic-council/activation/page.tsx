// src/app/(dashboard)/academic-council/activation/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  usePendingUsers,
  useActivateUser,
  useDeactivateUser,
  useAllUsers,
} from "@/services/authService";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";
import {
  UserCheck,
  UserX,
  Users,
  Mail,
  Calendar,
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function AcademicCouncilActivationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  // Получение данных
  const { data: pendingUsers = [], isLoading: pendingLoading } =
    usePendingUsers();
  const { data: allUsers = [], isLoading: allLoading } = useAllUsers();

  // Мутации
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  // Фильтрация пользователей
  const filteredUsers = React.useMemo(() => {
    let users: User[] = [];

    if (filterStatus === "pending") {
      users = pendingUsers;
    } else if (filterStatus === "active") {
      users = allUsers.filter((user) => user.isActive);
    } else if (filterStatus === "inactive") {
      users = allUsers.filter((user) => !user.isActive);
    } else {
      users = allUsers;
    }

    return users.filter((user) => {
      // Исключаем СуперАдминов из управления
      if (user.role === UserRole.SUPER_ADMIN) return false;

      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === "all" || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [pendingUsers, allUsers, filterStatus, searchTerm, filterRole]);

  const handleActivate = (user: User) => {
    activateMutation.mutate(user.$id, {
      onSuccess: () => {
        toast.success(`Пользователь ${user.name} активирован`);
      },
      onError: (error) => {
        toast.error(`Ошибка при активации: ${error.message}`);
      },
    });
  };

  const handleDeactivate = (user: User) => {
    if (
      window.confirm(
        `Вы уверены, что хотите деактивировать пользователя "${user.name}"?`
      )
    ) {
      deactivateMutation.mutate(user.$id, {
        onSuccess: () => {
          toast.success(`Пользователь ${user.name} деактивирован`);
        },
        onError: (error) => {
          toast.error(`Ошибка при деактивации: ${error.message}`);
        },
      });
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ACADEMIC_COUNCIL:
        return "Академсоветник";
      case UserRole.TEACHER:
        return "Преподаватель";
      case UserRole.STUDENT:
        return "Студент";
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ACADEMIC_COUNCIL:
        return "bg-blue-100 text-blue-800";
      case UserRole.TEACHER:
        return "bg-green-100 text-green-800";
      case UserRole.STUDENT:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Активен" : "Неактивен";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Статистика
  const stats = React.useMemo(() => {
    const nonSuperAdminUsers = allUsers.filter(
      (u) => u.role !== UserRole.SUPER_ADMIN
    );

    return {
      total: nonSuperAdminUsers.length,
      pending: pendingUsers.length,
      active: nonSuperAdminUsers.filter((u) => u.isActive).length,
      inactive: nonSuperAdminUsers.filter((u) => !u.isActive).length,
    };
  }, [allUsers, pendingUsers]);

  if (pendingLoading || allLoading) {
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
          Активация пользователей
        </h1>
        <p className="text-gray-600">
          Управление статусом активации пользователей системы
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Всего пользователей
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Ожидают активации
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
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
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
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
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
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
              <option value="pending">Ожидают активации</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="all">Все</option>
            </select>
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
              <option value={UserRole.ACADEMIC_COUNCIL}>Академсоветники</option>
              <option value={UserRole.TEACHER}>Преподаватели</option>
              <option value={UserRole.STUDENT}>Студенты</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Найдено: {filteredUsers.length} пользователей
            </div>
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg shadow border">
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.$id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            user.isActive
                          )}`}
                        >
                          {getStatusText(user.isActive)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Создан:{" "}
                          {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.isActive)}

                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivate(user)}
                        disabled={deactivateMutation.isPending}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <UserX className="h-4 w-4 inline mr-1" />
                        Деактивировать
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(user)}
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
            {searchTerm || filterRole !== "all"
              ? "Пользователи не найдены"
              : filterStatus === "pending"
              ? "Нет пользователей, ожидающих активации"
              : "Нет пользователей"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterRole !== "all"
              ? "Попробуйте изменить параметры поиска"
              : filterStatus === "pending"
              ? "Все пользователи уже активированы"
              : "Попробуйте изменить фильтр статуса"}
          </p>
        </div>
      )}

      {/* Информационные блоки */}
      {filterStatus === "pending" && pendingUsers.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Пользователи ожидают активации
              </h3>
              <p className="text-sm text-yellow-700">
                {pendingUsers.length} пользователей не могут войти в систему до
                активации их аккаунтов.
              </p>
            </div>
          </div>
        </div>
      )}

      {filterStatus === "active" && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Активные пользователи
              </h3>
              <p className="text-sm text-green-700">
                Эти пользователи могут полноценно работать в системе.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
