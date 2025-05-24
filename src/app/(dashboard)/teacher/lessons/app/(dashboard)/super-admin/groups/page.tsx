// src/app/(dashboard)/super-admin/groups/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { groupApi } from "@/services/groupService";
import { useStudents } from "@/services/authService";
import { Group, User } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  UserPlus,
  UserMinus,
  GraduationCap,
} from "lucide-react";

export default function SuperAdminGroupsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [managingStudentsGroup, setManagingStudentsGroup] =
    useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Получение групп
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  // Получение студентов
  const { data: students = [] } = useStudents();

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
    mutationFn: ({
      id,
      title,
      studentIds,
    }: {
      id: string;
      title: string;
      studentIds: string[];
    }) => groupApi.updateGroup(id, { title, studentIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setEditingGroup(null);
      setManagingStudentsGroup(null);
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

  // Активные студенты
  const activeStudents = students.filter((student) => student.isActive);

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
      studentIds: editingGroup.studentIds || [],
    });
  };

  const handleStudentsUpdate = (studentIds: string[]) => {
    if (!managingStudentsGroup) return;

    updateMutation.mutate({
      id: managingStudentsGroup.$id,
      title: managingStudentsGroup.title,
      studentIds,
    });
  };

  const handleDelete = (group: Group) => {
    if (
      window.confirm(`Вы уверены, что хотите удалить группу "${group.title}"?`)
    ) {
      deleteMutation.mutate(group.$id);
    }
  };

  const getStudentsInGroup = (group: Group) => {
    if (!group.studentIds) return [];
    return students.filter((student) =>
      group.studentIds?.includes(student.$id)
    );
  };

  const getStudentsNotInGroup = (group: Group) => {
    const studentIdsInGroup = group.studentIds || [];
    return activeStudents.filter(
      (student) => !studentIdsInGroup.includes(student.$id)
    );
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
        <p className="text-gray-600">Создание и управление учебными группами</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Доступных студентов
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeStudents.length}
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
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Создать группу
        </button>
      </div>

      {/* Список групп */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const studentsInGroup = getStudentsInGroup(group);

            return (
              <div
                key={group.$id}
                className="bg-white border rounded-lg shadow-sm"
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
                          {studentsInGroup.length} студентов
                        </p>
                      </div>
                    </div>
                  </div>

                  {studentsInGroup.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Студенты:
                      </h4>
                      <div className="space-y-1">
                        {studentsInGroup.slice(0, 3).map((student) => (
                          <div
                            key={student.$id}
                            className="text-sm text-gray-600"
                          >
                            {student.name}
                          </div>
                        ))}
                        {studentsInGroup.length > 3 && (
                          <div className="text-sm text-gray-500">
                            и еще {studentsInGroup.length - 3}...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Создана:{" "}
                    {new Date(group.createdAt).toLocaleDateString("ru-RU")}
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
                      onClick={() => setManagingStudentsGroup(group)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <UserPlus className="h-3 w-3" />
                      Студенты
                    </button>

                    <button
                      onClick={() => handleDelete(group)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "По вашему запросу групп не найдено"
              : "Группы пока не созданы"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать первую группу
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно управления студентами */}
      {managingStudentsGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Управление студентами группы "{managingStudentsGroup.title}"
              </h2>

              <StudentManagement
                group={managingStudentsGroup}
                students={students}
                onUpdate={handleStudentsUpdate}
                isLoading={updateMutation.isPending}
              />
            </div>

            <div className="px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => setManagingStudentsGroup(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для управления студентами в группе
function StudentManagement({
  group,
  students,
  onUpdate,
  isLoading,
}: {
  group: Group;
  students: User[];
  onUpdate: (studentIds: string[]) => void;
  isLoading: boolean;
}) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    group.studentIds || []
  );

  const activeStudents = students.filter((student) => student.isActive);
  const studentsInGroup = activeStudents.filter((student) =>
    selectedStudents.includes(student.$id)
  );
  const availableStudents = activeStudents.filter(
    (student) => !selectedStudents.includes(student.$id)
  );

  const handleAddStudent = (studentId: string) => {
    const newSelection = [...selectedStudents, studentId];
    setSelectedStudents(newSelection);
    onUpdate(newSelection);
  };

  const handleRemoveStudent = (studentId: string) => {
    const newSelection = selectedStudents.filter((id) => id !== studentId);
    setSelectedStudents(newSelection);
    onUpdate(newSelection);
  };

  return (
    <div className="space-y-6">
      {/* Студенты в группе */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Студенты в группе ({studentsInGroup.length})
        </h3>
        {studentsInGroup.length > 0 ? (
          <div className="space-y-2">
            {studentsInGroup.map((student) => (
              <div
                key={student.$id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900">
                    {student.name}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({student.email})
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student.$id)}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  <UserMinus className="h-4 w-4" />
                  Удалить
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">В группе пока нет студентов</p>
        )}
      </div>

      {/* Доступные студенты */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Доступные студенты ({availableStudents.length})
        </h3>
        {availableStudents.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableStudents.map((student) => (
              <div
                key={student.$id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900">
                    {student.name}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({student.email})
                  </span>
                </div>
                <button
                  onClick={() => handleAddStudent(student.$id)}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Добавить
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Все активные студенты уже добавлены в группы
          </p>
        )}
      </div>
    </div>
  );
}
