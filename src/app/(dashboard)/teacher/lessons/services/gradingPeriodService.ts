// src/services/gradingPeriodService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { GradingPeriod, FinalGrade } from "@/types";

export interface GradingPeriodCreateDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface FinalGradeCreateDto {
  studentId: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  gradingPeriodId: string;
  totalScore: number;
  letterGrade: string;
}

export const gradingPeriodApi = {
  // === ПЕРИОДЫ ОЦЕНОК ===

  // Получить все периоды оценок
  getAllGradingPeriods: async (): Promise<GradingPeriod[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as GradingPeriod[];
    } catch (error) {
      console.error("Ошибка при получении периодов оценок:", error);
      return [];
    }
  },

  // Получить активные периоды оценок
  getActiveGradingPeriods: async (): Promise<GradingPeriod[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        [Query.equal("isActive", true), Query.orderDesc("startDate")]
      );
      return response.documents as unknown as GradingPeriod[];
    } catch (error) {
      console.error("Ошибка при получении активных периодов:", error);
      return [];
    }
  },

  // Получить период по ID
  getGradingPeriodById: async (id: string): Promise<GradingPeriod | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        id
      );
      return response as unknown as GradingPeriod;
    } catch (error) {
      console.error("Ошибка при получении периода оценок:", error);
      return null;
    }
  },

  // Создать период оценок (только СуперАдмин)
  createGradingPeriod: async (
    data: GradingPeriodCreateDto,
    createdBy: string
  ): Promise<GradingPeriod> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        ID.unique(),
        {
          ...data,
          createdBy,
          isActive: false, // Новые периоды создаются неактивными
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as GradingPeriod;
    } catch (error) {
      console.error("Ошибка при создании периода оценок:", error);
      throw error;
    }
  },

  // Обновить период оценок
  updateGradingPeriod: async (
    id: string,
    data: Partial<GradingPeriodCreateDto>
  ): Promise<GradingPeriod> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        id,
        data
      );
      return response as unknown as GradingPeriod;
    } catch (error) {
      console.error("Ошибка при обновлении периода оценок:", error);
      throw error;
    }
  },

  // Активировать/деактивировать период оценок
  toggleGradingPeriodStatus: async (
    id: string,
    isActive: boolean
  ): Promise<GradingPeriod> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        id,
        { isActive }
      );
      return response as unknown as GradingPeriod;
    } catch (error) {
      console.error("Ошибка при изменении статуса периода:", error);
      throw error;
    }
  },

  // Удалить период оценок
  deleteGradingPeriod: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.gradingPeriods,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении периода оценок:", error);
      throw error;
    }
  },

  // === ФИНАЛЬНЫЕ ОЦЕНКИ ===

  // Получить финальные оценки по периоду
  getFinalGradesByPeriod: async (periodId: string): Promise<FinalGrade[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.finalGrades,
        [Query.equal("gradingPeriodId", periodId), Query.orderAsc("studentId")]
      );
      return response.documents as unknown as FinalGrade[];
    } catch (error) {
      console.error("Ошибка при получении финальных оценок:", error);
      return [];
    }
  },

  // Получить финальные оценки студента
  getFinalGradesByStudent: async (studentId: string): Promise<FinalGrade[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.finalGrades,
        [Query.equal("studentId", studentId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as FinalGrade[];
    } catch (error) {
      console.error("Ошибка при получении оценок студента:", error);
      return [];
    }
  },

  // Получить финальные оценки по преподавателю
  getFinalGradesByTeacher: async (teacherId: string): Promise<FinalGrade[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.finalGrades,
        [Query.equal("teacherId", teacherId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as FinalGrade[];
    } catch (error) {
      console.error("Ошибка при получении оценок преподавателя:", error);
      return [];
    }
  },

  // Получить финальные оценки по группе и дисциплине
  getFinalGradesByGroupAndSubject: async (
    groupId: string,
    subjectId: string,
    periodId?: string
  ): Promise<FinalGrade[]> => {
    try {
      const queries = [
        Query.equal("groupId", groupId),
        Query.equal("subjectId", subjectId),
      ];

      if (periodId) {
        queries.push(Query.equal("gradingPeriodId", periodId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.finalGrades,
        queries
      );
      return response.documents as unknown as FinalGrade[];
    } catch (error) {
      console.error("Ошибка при получении оценок группы:", error);
      return [];
    }
  },

  // Создать или обновить финальную оценку
  upsertFinalGrade: async (data: FinalGradeCreateDto): Promise<FinalGrade> => {
    try {
      // Проверяем, существует ли уже оценка
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.finalGrades,
        [
          Query.equal("studentId", data.studentId),
          Query.equal("subjectId", data.subjectId),
          Query.equal("gradingPeriodId", data.gradingPeriodId),
        ]
      );

      if (existing.documents.length > 0) {
        // Обновляем существующую оценку
        const response = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.finalGrades,
          existing.documents[0].$id,
          {
            totalScore: data.totalScore,
            letterGrade: data.letterGrade,
          }
        );
        return response as unknown as FinalGrade;
      } else {
        // Создаем новую оценку
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.finalGrades,
          ID.unique(),
          {
            ...data,
            createdAt: new Date().toISOString(),
          }
        );
        return response as unknown as FinalGrade;
      }
    } catch (error) {
      console.error("Ошибка при создании/обновлении финальной оценки:", error);
      throw error;
    }
  },

  // Массовое создание финальных оценок
  bulkCreateFinalGrades: async (
    grades: FinalGradeCreateDto[]
  ): Promise<void> => {
    try {
      await Promise.all(
        grades.map((grade) => gradingPeriodApi.upsertFinalGrade(grade))
      );
    } catch (error) {
      console.error("Ошибка при массовом создании оценок:", error);
      throw error;
    }
  },

  // Удалить финальную оценку
  deleteFinalGrade: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.finalGrades,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении финальной оценки:", error);
      throw error;
    }
  },

  // Получить статистику по периоду оценок
  getGradingPeriodStats: async (
    periodId: string
  ): Promise<{
    totalStudents: number;
    gradedStudents: number;
    averageScore: number;
    gradeDistribution: Record<string, number>;
  }> => {
    try {
      const grades = await gradingPeriodApi.getFinalGradesByPeriod(periodId);

      const totalStudents = grades.length;
      const gradedStudents = grades.filter(
        (g) => g.totalScore !== undefined
      ).length;

      const scores = grades
        .map((g) => g.totalScore)
        .filter((score) => score !== undefined);

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      const gradeDistribution = grades.reduce((acc, grade) => {
        acc[grade.letterGrade] = (acc[grade.letterGrade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalStudents,
        gradedStudents,
        averageScore: Math.round(averageScore * 100) / 100,
        gradeDistribution,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики периода:", error);
      return {
        totalStudents: 0,
        gradedStudents: 0,
        averageScore: 0,
        gradeDistribution: {},
      };
    }
  },
};
