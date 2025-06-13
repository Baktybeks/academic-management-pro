// src/app/(dashboard)/super-admin/groups/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { groupApi } from "@/services/groupService";
import { Group } from "@/types";
import { toast } from "react-toastify";
import { Plus, Edit, Trash2, Users, Search, GraduationCap } from "lucide-react";

export default function SuperAdminGroupsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Получение групп
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  // Создание группы
  const createMutation = useMutation({
    mutationFn: (title: string) =>
      groupApi.createGroup({ title, createdBy: user?.$id || "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsCreateModalOpen(false);
      toast.success("Группа успешно создана");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании группы: ${error.message}`);
    },
  });

  // Обновление группы
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      groupApi.updateGroup(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setEditingGroup(null);
      toast.success("Группа успешно обновлена");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении группы: ${error.message}`);
    },
  });

  // Удаление группы
  const deleteMutation = useMutation({
    mutationFn: groupApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Группа удалена");
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении группы: ${error.message}`);
    },
  });

  // Фильтрация групп
  const filteredGroups = groups.filter((group) =>
    group.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    createMutation.mutate(title);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGroup) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    updateMutation.mutate({
      id: editingGroup.$id,
      title,
    });
  };

  const handleDelete = (group: Group) => {
    if (
      window.confirm(`Вы уверены, что хотите удалить группу "${group.title}"?`)
    ) {
      deleteMutation.mutate(group.$id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка групп...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление группами
        </h1>
        <p className="text-gray-600">
          Создание и базовое управление учебными группами
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Примечание:</strong> Назначение студентов в группы
            происходит на странице академсоветника. Здесь вы можете создавать
            новые группы и редактировать их названия.
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего групп</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Студентов в группах
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce(
                  (total, group) => total + (group.studentIds?.length || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Пустых групп</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  groups.filter(
                    (group) =>
                      !group.studentIds || group.studentIds.length === 0
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Поиск и создание */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по названию группы..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2  bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Создать группу
        </button>
      </div>

      {/* Список групп */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.$id}
              className="bg-white border-[6699FF] rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-indigo-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.studentIds?.length || 0} студентов
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Создана:{" "}
                  {new Date(group.$createdAt).toLocaleDateString("ru-RU")}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingGroup(group)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Редактировать
                  </button>

                  <button
                    onClick={() => handleDelete(group)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Удалить
                  </button>
                </div>

                {(group.studentIds?.length || 0) > 0 && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                    В группе есть студенты. Управление составом группы доступно
                    академ советникам.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border-[6699FF]">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "По вашему запросу групп не найдено"
              : "Группы пока не созданы"}
          </p>
          {!searchTerm && (
            <div className="flex justify-center mt-4"> {/* Добавлен этот div */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
              >
                Создать первую группу
              </button>
            </div>
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
                  Создать группу
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название группы *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите название группы"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p>
                    <strong>Примечание:</strong> После создания группы академ
                    советники смогут назначить в неё студентов и управлять
                    составом.
                  </p>
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
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Редактировать группу
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название группы *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingGroup.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-md hover:bg-[#0044CC] transition-colors"
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
