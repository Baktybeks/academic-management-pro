// src/services/groupService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Group } from "@/types";

export interface GroupCreateDto {
  title: string;
  studentIds?: string[];
  createdBy: string;
}

export interface GroupUpdateDto {
  title?: string;
  studentIds?: string[];
}

export const groupApi = {
  // Получить все группы
  getAllGroups: async (): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.orderAsc("title")]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
      return [];
    }
  },

  // Получить группу по ID
  getGroupById: async (id: string): Promise<Group | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при получении группы:", error);
      return null;
    }
  },

  // Получить группы, созданные конкретным пользователем
  getGroupsByCreator: async (creatorId: string): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.equal("createdBy", creatorId), Query.orderAsc("title")]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Ошибка при получении групп по создателю:", error);
      return [];
    }
  },

  // Получить группы по студенту
  getGroupsByStudentId: async (studentId: string): Promise<Group[]> => {
    try {
      // Получаем все группы и фильтруем те, в которых есть этот студент
      const groups = await groupApi.getAllGroups();
      return groups.filter((group) => group.studentIds?.includes(studentId));
    } catch (error) {
      console.error("Ошибка при получении групп студента:", error);
      return [];
    }
  },

  // Создать группу
  createGroup: async (data: GroupCreateDto): Promise<Group> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        ID.unique(),
        {
          title: data.title,
          studentIds: data.studentIds || [],
          createdBy: data.createdBy,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
      throw error;
    }
  },

  // Обновить группу
  updateGroup: async (id: string, data: GroupUpdateDto): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id,
        data
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при обновлении группы:", error);
      throw error;
    }
  },

  // Удалить группу
  deleteGroup: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении группы:", error);
      throw error;
    }
  },

  // Добавить студента в группу
  addStudentToGroup: async (
    groupId: string,
    studentId: string
  ): Promise<Group> => {
    try {
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        throw new Error("Группа не найдена");
      }

      const currentStudentIds = group.studentIds || [];
      if (currentStudentIds.includes(studentId)) {
        throw new Error("Студент уже в группе");
      }

      const updatedStudentIds = [...currentStudentIds, studentId];
      return await groupApi.updateGroup(groupId, {
        studentIds: updatedStudentIds,
      });
    } catch (error) {
      console.error("Ошибка при добавлении студента в группу:", error);
      throw error;
    }
  },

  // Удалить студента из группы
  removeStudentFromGroup: async (
    groupId: string,
    studentId: string
  ): Promise<Group> => {
    try {
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        throw new Error("Группа не найдена");
      }

      const currentStudentIds = group.studentIds || [];
      const updatedStudentIds = currentStudentIds.filter(
        (id) => id !== studentId
      );

      return await groupApi.updateGroup(groupId, {
        studentIds: updatedStudentIds,
      });
    } catch (error) {
      console.error("Ошибка при удалении студента из группы:", error);
      throw error;
    }
  },

  // Массовое добавление студентов в группу
  bulkAddStudentsToGroup: async (
    groupId: string,
    studentIds: string[]
  ): Promise<Group> => {
    try {
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        throw new Error("Группа не найдена");
      }

      const currentStudentIds = group.studentIds || [];
      const newStudentIds = studentIds.filter(
        (id) => !currentStudentIds.includes(id)
      );

      const updatedStudentIds = [...currentStudentIds, ...newStudentIds];
      return await groupApi.updateGroup(groupId, {
        studentIds: updatedStudentIds,
      });
    } catch (error) {
      console.error("Ошибка при массовом добавлении студентов:", error);
      throw error;
    }
  },

  // Заменить всех студентов в группе
  replaceGroupStudents: async (
    groupId: string,
    studentIds: string[]
  ): Promise<Group> => {
    try {
      return await groupApi.updateGroup(groupId, { studentIds });
    } catch (error) {
      console.error("Ошибка при замене студентов группы:", error);
      throw error;
    }
  },

  // Получить статистику группы
  getGroupStats: async (
    groupId: string
  ): Promise<{
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    lessonsCount: number;
    assignmentsCount: number;
  }> => {
    try {
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        return {
          totalStudents: 0,
          activeStudents: 0,
          inactiveStudents: 0,
          lessonsCount: 0,
          assignmentsCount: 0,
        };
      }

      const totalStudents = group.studentIds?.length || 0;

      // Получаем информацию об активности студентов
      let activeStudents = 0;
      if (group.studentIds && group.studentIds.length > 0) {
        const studentsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          [Query.equal("$id", group.studentIds)]
        );

        activeStudents = studentsResponse.documents.filter(
          (doc: any) => doc.isActive
        ).length;
      }

      const inactiveStudents = totalStudents - activeStudents;

      // Получаем количество занятий для группы
      const lessonsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("groupId", groupId)]
      );

      // Получаем количество заданий для группы
      const assignmentsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [Query.equal("groupId", groupId)]
      );

      return {
        totalStudents,
        activeStudents,
        inactiveStudents,
        lessonsCount: lessonsResponse.documents.length,
        assignmentsCount: assignmentsResponse.documents.length,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики группы:", error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        lessonsCount: 0,
        assignmentsCount: 0,
      };
    }
  },

  // Поиск групп
  searchGroups: async (searchTerm: string): Promise<Group[]> => {
    try {
      const groups = await groupApi.getAllGroups();
      const searchLower = searchTerm.toLowerCase();

      return groups.filter((group) =>
        group.title.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Ошибка при поиске групп:", error);
      return [];
    }
  },

  // Проверить, существует ли группа с таким названием
  checkGroupTitleExists: async (
    title: string,
    excludeId?: string
  ): Promise<boolean> => {
    try {
      const groups = await groupApi.getAllGroups();
      const existingGroup = groups.find(
        (group) =>
          group.title.toLowerCase() === title.toLowerCase() &&
          group.$id !== excludeId
      );
      return !!existingGroup;
    } catch (error) {
      console.error("Ошибка при проверке названия группы:", error);
      return false;
    }
  },

  // Получить группы без студентов
  getEmptyGroups: async (): Promise<Group[]> => {
    try {
      const groups = await groupApi.getAllGroups();
      return groups.filter(
        (group) => !group.studentIds || group.studentIds.length === 0
      );
    } catch (error) {
      console.error("Ошибка при получении пустых групп:", error);
      return [];
    }
  },
};
