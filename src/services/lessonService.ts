// src/services/lessonService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Lesson } from "@/types";

export interface LessonCreateDto {
  title: string;
  description?: string;
  date: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
}

export const lessonApi = {
  // Получить все занятия
  getAllLessons: async (): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.orderDesc("date")]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Ошибка при получении занятий:", error);
      return [];
    }
  },

  // Получить занятия по группе
  getLessonsByGroup: async (groupId: string): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("groupId", groupId), Query.orderDesc("date")]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Ошибка при получении занятий группы:", error);
      return [];
    }
  },

  // Получить занятия по дисциплине
  getLessonsBySubject: async (subjectId: string): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("subjectId", subjectId), Query.orderDesc("date")]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Ошибка при получении занятий по дисциплине:", error);
      return [];
    }
  },

  // Получить занятия преподавателя
  getLessonsByTeacher: async (teacherId: string): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("teacherId", teacherId), Query.orderDesc("date")]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Ошибка при получении занятий преподавателя:", error);
      return [];
    }
  },

  // Получить занятия для группы и дисциплины
  getLessonsByGroupAndSubject: async (
    groupId: string,
    subjectId: string
  ): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [
          Query.equal("groupId", groupId),
          Query.equal("subjectId", subjectId),
          Query.orderDesc("date"),
        ]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Ошибка при получении занятий группы и дисциплины:", error);
      return [];
    }
  },

  // Получить занятие по ID
  getLessonById: async (id: string): Promise<Lesson | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error("Ошибка при получении занятия:", error);
      return null;
    }
  },

  // Создать занятие (преподаватель)
  createLesson: async (data: LessonCreateDto): Promise<Lesson> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error("Ошибка при создании занятия:", error);
      throw error;
    }
  },

  // Обновить занятие
  updateLesson: async (
    id: string,
    data: Partial<LessonCreateDto>
  ): Promise<Lesson> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id,
        data
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error("Ошибка при обновлении занятия:", error);
      throw error;
    }
  },

  // Удалить занятие
  deleteLesson: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении занятия:", error);
      throw error;
    }
  },

  // Получить занятия за период
  getLessonsByDateRange: async (
    startDate: string,
    endDate: string,
    teacherId?: string
  ): Promise<Lesson[]> => {
    try {
      const queries = [
        Query.greaterThanEqual("date", startDate),
        Query.lessThanEqual("date", endDate),
        Query.orderAsc("date"),
      ];

      if (teacherId) {
        queries.push(Query.equal("teacherId", teacherId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        queries
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Ошибка при получении занятий за период:", error);
      return [];
    }
  },

  // Получить статистику занятий преподавателя
  getTeacherLessonStats: async (
    teacherId: string
  ): Promise<{
    totalLessons: number;
    upcomingLessons: number;
    completedLessons: number;
    subjectsCount: number;
    groupsCount: number;
  }> => {
    try {
      const lessons = await lessonApi.getLessonsByTeacher(teacherId);
      const now = new Date();

      const completedLessons = lessons.filter(
        (lesson) => new Date(lesson.date) < now
      ).length;
      const upcomingLessons = lessons.length - completedLessons;

      const subjectsCount = new Set(lessons.map((l) => l.subjectId)).size;
      const groupsCount = new Set(lessons.map((l) => l.groupId)).size;

      return {
        totalLessons: lessons.length,
        upcomingLessons,
        completedLessons,
        subjectsCount,
        groupsCount,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики занятий:", error);
      return {
        totalLessons: 0,
        upcomingLessons: 0,
        completedLessons: 0,
        subjectsCount: 0,
        groupsCount: 0,
      };
    }
  },
};
