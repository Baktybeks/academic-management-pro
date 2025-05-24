// src/services/teacherAssignmentService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { TeacherAssignment, CreateTeacherAssignmentDto } from "@/types";

export const teacherAssignmentApi = {
  // Получить все назначения
  getAllAssignments: async (): Promise<TeacherAssignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as TeacherAssignment[];
    } catch (error) {
      console.error("Ошибка при получении назначений:", error);
      return [];
    }
  },

  // Получить назначения конкретного преподавателя
  getAssignmentsByTeacher: async (
    teacherId: string
  ): Promise<TeacherAssignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [Query.equal("teacherId", teacherId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as TeacherAssignment[];
    } catch (error) {
      console.error("Ошибка при получении назначений преподавателя:", error);
      return [];
    }
  },

  // Получить назначения по группе
  getAssignmentsByGroup: async (
    groupId: string
  ): Promise<TeacherAssignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [Query.equal("groupId", groupId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as TeacherAssignment[];
    } catch (error) {
      console.error("Ошибка при получении назначений по группе:", error);
      return [];
    }
  },

  // Получить назначения по дисциплине
  getAssignmentsBySubject: async (
    subjectId: string
  ): Promise<TeacherAssignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [Query.equal("subjectId", subjectId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as TeacherAssignment[];
    } catch (error) {
      console.error("Ошибка при получении назначений по дисциплине:", error);
      return [];
    }
  },

  // Создать назначение (только Академсоветник)
  createAssignment: async (
    data: CreateTeacherAssignmentDto,
    assignedBy: string
  ): Promise<TeacherAssignment> => {
    try {
      // Проверяем, нет ли уже такого назначения
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [
          Query.equal("teacherId", data.teacherId),
          Query.equal("groupId", data.groupId),
          Query.equal("subjectId", data.subjectId),
        ]
      );

      if (existing.documents.length > 0) {
        throw new Error("Такое назначение уже существует");
      }

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        ID.unique(),
        {
          ...data,
          assignedBy,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as TeacherAssignment;
    } catch (error) {
      console.error("Ошибка при создании назначения:", error);
      throw error;
    }
  },

  // Проверить существование назначения
  checkAssignmentExists: async (
    teacherId: string,
    groupId: string,
    subjectId: string
  ): Promise<boolean> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [
          Query.equal("teacherId", teacherId),
          Query.equal("groupId", groupId),
          Query.equal("subjectId", subjectId),
        ]
      );
      return response.documents.length > 0;
    } catch (error) {
      console.error("Ошибка при проверке назначения:", error);
      return false;
    }
  },

  // Удалить назначение
  deleteAssignment: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении назначения:", error);
      throw error;
    }
  },

  // Получить назначения, созданные конкретным академсоветником
  getAssignmentsByAssigner: async (
    assignerId: string
  ): Promise<TeacherAssignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.teacherAssignments,
        [Query.equal("assignedBy", assignerId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as TeacherAssignment[];
    } catch (error) {
      console.error("Ошибка при получении назначений по создателю:", error);
      return [];
    }
  },

  // Массовое создание назначений
  bulkCreateAssignments: async (
    assignments: CreateTeacherAssignmentDto[],
    assignedBy: string
  ): Promise<TeacherAssignment[]> => {
    try {
      const results = await Promise.all(
        assignments.map((assignment) =>
          teacherAssignmentApi.createAssignment(assignment, assignedBy)
        )
      );
      return results;
    } catch (error) {
      console.error("Ошибка при массовом создании назначений:", error);
      throw error;
    }
  },

  // Получить уникальные комбинации группа-дисциплина для преподавателя
  getTeacherGroupSubjectCombinations: async (
    teacherId: string
  ): Promise<
    Array<{
      groupId: string;
      subjectId: string;
      assignment: TeacherAssignment;
    }>
  > => {
    try {
      const assignments = await teacherAssignmentApi.getAssignmentsByTeacher(
        teacherId
      );

      return assignments.map((assignment) => ({
        groupId: assignment.groupId,
        subjectId: assignment.subjectId,
        assignment,
      }));
    } catch (error) {
      console.error("Ошибка при получении комбинаций:", error);
      return [];
    }
  },
};
