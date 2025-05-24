// src/app/(dashboard)/academic-advisor/groups/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { groupApi } from "@/services/groupService";
import { useActiveStudents } from "@/services/authService";
import { Group, User, CreateGroupDto, UpdateGroupDto } from "@/types";
import { toast } from "react-toastify";
import {
  Plus,
  Users,
  UserPlus,
  UserMinus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function AcademicAdvisorGroupsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Получение данных
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: students = [] } = useActiveStudents();

  // Мутации
  const createMutation = useMutation({
    mutationFn: (data: CreateGroupDto) => groupApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsCreateModalOpen(false);
      toast.success("Группа успешно создана");
    },
    onError: (error) => {
      toast.error(`Ошибка при создании группы: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDto }) =>
      groupApi.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsEditModalOpen(false);
      setSelectedGroup(null);
      toast.success("Группа успешно обновлена");
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении группы: ${error.message}`);
    },
  });

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

  // Создание карты студентов
  const studentsMap = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.$id] = student;
      return acc;
    }, {} as Record<string, User>);
  }, [students]);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateGroupDto = {
      title: formData.get("title") as string,
      createdBy: user?.$id || "",
      studentIds: [],
    };

    createMutation.mutate(data);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const formData = new FormData(e.currentTarget);
    const data: UpdateGroupDto = {
      title: formData.get("title") as string,
    };

    updateMutation.mutate({ id: selectedGroup.$id, data });
  };

  const handleDeleteGroup = (group: Group) => {
    if (
      window.confirm(
        `Вы уверены, что хотите удалить группу "${group.title}"? Это действие нельзя отменить.`
      )
    ) {
      deleteMutation.mutate(group.$id);
    }
  };

  const handleManageStudents = (group: Group) => {
    setSelectedGroup(group);
    setIsStudentModalOpen(true);
  };

  const handleStudentToggle = (studentId: string, isAdding: boolean) => {
    if (!selectedGroup) return;

    const currentStudentIds = selectedGroup.studentIds || [];
    const updatedStudentIds = isAdding
      ? [...currentStudentIds, studentId]
      : currentStudentIds.filter((id) => id !== studentId);

    const updatedGroup = { ...selectedGroup, studentIds: updatedStudentIds };
    setSelectedGroup(updatedGroup);

    // Обновляем группу в базе
    updateMutation.mutate({
      id: selectedGroup.$id,
      data: { studentIds: updatedStudentIds },
    });
  };

  const getGroupStats = (group: Group) => {
    const studentCount = group.studentIds?.length || 0;
    const activeStudentsCount =
      group.studentIds?.filter((id) => studentsMap[id]?.isActive).length || 0;

    return { studentCount, activeStudentsCount };
  };

  const unassignedStudents = students.filter(
    (student) =>
      !groups.some((group) => group.studentIds?.includes(student.$id))
  );

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
          Создание групп и добавление в них студентов
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
                Неназначенных студентов
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {unassignedStudents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Пустых групп</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  groups.filter(
                    (g) => !g.studentIds || g.studentIds.length === 0
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Поиск и кнопка создания */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск групп..."
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

      {/* Предупреждение о неназначенных студентах */}
      {unassignedStudents.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Есть неназначенные студенты
              </h3>
              <p className="text-sm text-yellow-700">
                {unassignedStudents.length} студентов не добавлены ни в одну
                группу. Добавьте их в группы для организации учебного процесса.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Список групп */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const stats = getGroupStats(group);
            return (
              <div
                key={group.$id}
                className="bg-white rounded-lg shadow border"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.title}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Студентов:</span>
                      <span className="font-medium">{stats.studentCount}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Активных:</span>
                      <span className="font-medium text-green-600">
                        {stats.activeStudentsCount}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Создана:{" "}
                      {new Date(group.$createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleManageStudents(group)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      Управление студентами
                    </button>

                    {group.studentIds && group.studentIds.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600 mb-2">
                          Студенты в группе:
                        </p>
                        <div className="space-y-1">
                          {group.studentIds.slice(0, 3).map((studentId) => {
                            const student = studentsMap[studentId];
                            return student ? (
                              <div
                                key={studentId}
                                className="text-xs text-gray-700"
                              >
                                {student.name}
                              </div>
                            ) : null;
                          })}
                          {group.studentIds.length > 3 && (
                            <div className="text-xs text-gray-500">
                              и еще {group.studentIds.length - 3}...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "Группы не найдены" : "Нет групп"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Попробуйте изменить поисковый запрос"
              : "Создайте первую группу для организации студентов"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Создать группу
            </button>
          )}
        </div>
      )}

      {/* Модальное окно создания группы */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Создать группу
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название группы *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Например: ИТ-21-1"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    После создания группы вы сможете добавить в неё студентов.
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования группы */}
      {isEditModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Редактировать группу
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название группы *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={selectedGroup.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedGroup(null);
                  }}
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
      {isStudentModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Студенты группы "{selectedGroup.title}"
                </h2>
                <button
                  onClick={() => {
                    setIsStudentModalOpen(false);
                    setSelectedGroup(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Все студенты ({students.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {students.map((student) => {
                      const isInGroup =
                        selectedGroup.studentIds?.includes(student.$id) ||
                        false;
                      return (
                        <div
                          key={student.$id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <GraduationCap className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!student.isActive && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                Неактивен
                              </span>
                            )}

                            <button
                              onClick={() =>
                                handleStudentToggle(student.$id, !isInGroup)
                              }
                              disabled={updateMutation.isPending}
                              className={`p-2 rounded transition-colors ${
                                isInGroup
                                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                                  : "bg-green-100 text-green-600 hover:bg-green-200"
                              }`}
                            >
                              {isInGroup ? (
                                <UserMinus className="h-4 w-4" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedGroup.studentIds &&
                  selectedGroup.studentIds.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Студенты в группе ({selectedGroup.studentIds.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedGroup.studentIds.map((studentId) => {
                          const student = studentsMap[studentId];
                          return student ? (
                            <div
                              key={studentId}
                              className="p-2 bg-green-50 text-green-800 rounded text-sm"
                            >
                              {student.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setIsStudentModalOpen(false);
                  setSelectedGroup(null);
                  queryClient.invalidateQueries({ queryKey: ["groups"] });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
