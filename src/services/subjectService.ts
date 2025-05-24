// src/services/subjectService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Subject, CreateSubjectDto } from "@/types";

export const subjectApi = {
  // Получить все дисциплины
  getAllSubjects: async (): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Subject[];
    } catch (error) {
      console.error("Ошибка при получении дисциплин:", error);
      return [];
    }
  },

  // Получить активные дисциплины
  getActiveSubjects: async (): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.equal("isActive", true), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Subject[];
    } catch (error) {
      console.error("Ошибка при получении активных дисциплин:", error);
      return [];
    }
  },

  // Получить дисциплину по ID
  getSubjectById: async (id: string): Promise<Subject | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при получении дисциплины:", error);
      return null;
    }
  },

  // Создать дисциплину (только СуперАдмин)
  createSubject: async (
    data: CreateSubjectDto,
    createdBy: string
  ): Promise<Subject> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        ID.unique(),
        {
          ...data,
          createdBy,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при создании дисциплины:", error);
      throw error;
    }
  },

  // Обновить дисциплину
  updateSubject: async (
    id: string,
    data: Partial<CreateSubjectDto>
  ): Promise<Subject> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id,
        data
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при обновлении дисциплины:", error);
      throw error;
    }
  },

  // Активировать/деактивировать дисциплину
  toggleSubjectStatus: async (
    id: string,
    isActive: boolean
  ): Promise<Subject> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id,
        { isActive }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при изменении статуса дисциплины:", error);
      throw error;
    }
  },

  // Удалить дисциплину
  deleteSubject: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении дисциплины:", error);
      throw error;
    }
  },

  // Получить дисциплины, созданные конкретным пользователем
  getSubjectsByCreator: async (creatorId: string): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.equal("createdBy", creatorId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Subject[];
    } catch (error) {
      console.error("Ошибка при получении дисциплин по создателю:", error);
      return [];
    }
  },
};
