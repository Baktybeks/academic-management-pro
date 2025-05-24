// src/services/surveyPeriodService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  SurveyPeriod,
  SurveyResponse,
  SurveyAnswer,
  TeacherRating,
} from "@/types";

export interface SurveyPeriodCreateDto {
  title: string;
  description?: string;
  surveyId: string;
  startDate: string;
  endDate: string;
}

export const surveyPeriodApi = {
  // === ПЕРИОДЫ ОПРОСОВ ===

  // Получить все периоды опросов
  getAllSurveyPeriods: async (): Promise<SurveyPeriod[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as SurveyPeriod[];
    } catch (error) {
      console.error("Ошибка при получении периодов опросов:", error);
      return [];
    }
  },

  // Получить активные периоды опросов
  getActiveSurveyPeriods: async (): Promise<SurveyPeriod[]> => {
    try {
      const currentDate = new Date().toISOString();
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        [
          Query.equal("isActive", true),
          Query.lessThanEqual("startDate", currentDate),
          Query.greaterThanEqual("endDate", currentDate),
          Query.orderDesc("startDate"),
        ]
      );
      return response.documents as unknown as SurveyPeriod[];
    } catch (error) {
      console.error("Ошибка при получении активных периодов опросов:", error);
      return [];
    }
  },

  // Получить период по ID
  getSurveyPeriodById: async (id: string): Promise<SurveyPeriod | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        id
      );
      return response as unknown as SurveyPeriod;
    } catch (error) {
      console.error("Ошибка при получении периода опроса:", error);
      return null;
    }
  },

  // Получить периоды по опроснику
  getSurveyPeriodsBySurvey: async (
    surveyId: string
  ): Promise<SurveyPeriod[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        [Query.equal("surveyId", surveyId), Query.orderDesc("startDate")]
      );
      return response.documents as unknown as SurveyPeriod[];
    } catch (error) {
      console.error("Ошибка при получении периодов опроса:", error);
      return [];
    }
  },

  // Создать период опроса (только Супер админ)
  createSurveyPeriod: async (
    data: SurveyPeriodCreateDto,
    createdBy: string
  ): Promise<SurveyPeriod> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        ID.unique(),
        {
          ...data,
          createdBy,
          isActive: false, // Новые периоды создаются неактивными
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as SurveyPeriod;
    } catch (error) {
      console.error("Ошибка при создании периода опроса:", error);
      throw error;
    }
  },

  // Обновить период опроса
  updateSurveyPeriod: async (
    id: string,
    data: Partial<SurveyPeriodCreateDto>
  ): Promise<SurveyPeriod> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        id,
        data
      );
      return response as unknown as SurveyPeriod;
    } catch (error) {
      console.error("Ошибка при обновлении периода опроса:", error);
      throw error;
    }
  },

  // Активировать/деактивировать период опроса
  toggleSurveyPeriodStatus: async (
    id: string,
    isActive: boolean
  ): Promise<SurveyPeriod> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        id,
        { isActive }
      );
      return response as unknown as SurveyPeriod;
    } catch (error) {
      console.error("Ошибка при изменении статуса периода опроса:", error);
      throw error;
    }
  },

  // Удалить период опроса
  deleteSurveyPeriod: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении периода опроса:", error);
      throw error;
    }
  },

  // === ОТВЕТЫ НА ОПРОСЫ ===

  // Получить ответы по периоду опроса
  getSurveyResponsesByPeriod: async (
    periodId: string
  ): Promise<SurveyResponse[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [
          Query.equal("surveyPeriodId", periodId),
          Query.orderDesc("submittedAt"),
        ]
      );
      return response.documents as unknown as SurveyResponse[];
    } catch (error) {
      console.error("Ошибка при получении ответов периода:", error);
      return [];
    }
  },

  // Получить ответы студента
  getSurveyResponsesByStudent: async (
    studentId: string
  ): Promise<SurveyResponse[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.equal("studentId", studentId), Query.orderDesc("submittedAt")]
      );
      return response.documents as unknown as SurveyResponse[];
    } catch (error) {
      console.error("Ошибка при получении ответов студента:", error);
      return [];
    }
  },

  // Получить ответы по преподавателю
  getSurveyResponsesByTeacher: async (
    teacherId: string
  ): Promise<SurveyResponse[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.equal("teacherId", teacherId), Query.orderDesc("submittedAt")]
      );
      return response.documents as unknown as SurveyResponse[];
    } catch (error) {
      console.error("Ошибка при получении ответов по преподавателю:", error);
      return [];
    }
  },

  // Проверить, прошел ли студент опрос
  hasStudentCompletedSurvey: async (
    studentId: string,
    teacherId: string,
    subjectId: string,
    periodId: string
  ): Promise<boolean> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [
          Query.equal("studentId", studentId),
          Query.equal("teacherId", teacherId),
          Query.equal("subjectId", subjectId),
          Query.equal("surveyPeriodId", periodId),
        ]
      );
      return response.documents.length > 0;
    } catch (error) {
      console.error("Ошибка при проверке прохождения опроса:", error);
      return false;
    }
  },

  // Получить статистику по периоду опроса
  getSurveyPeriodStats: async (
    periodId: string
  ): Promise<{
    totalResponses: number;
    uniqueStudents: number;
    uniqueTeachers: number;
    responseRate: number;
  }> => {
    try {
      const responses = await surveyPeriodApi.getSurveyResponsesByPeriod(
        periodId
      );

      const uniqueStudents = new Set(responses.map((r) => r.studentId)).size;
      const uniqueTeachers = new Set(responses.map((r) => r.teacherId)).size;

      // Примерный расчет отклика (можно уточнить логику)
      const responseRate =
        responses.length > 0 ? (uniqueStudents / 100) * 100 : 0;

      return {
        totalResponses: responses.length,
        uniqueStudents,
        uniqueTeachers,
        responseRate: Math.round(responseRate * 100) / 100,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики периода опроса:", error);
      return {
        totalResponses: 0,
        uniqueStudents: 0,
        uniqueTeachers: 0,
        responseRate: 0,
      };
    }
  },

  // === АНАЛИТИКА И РЕЙТИНГИ ===

  // Получить рейтинг преподавателя по периоду
  getTeacherRatingByPeriod: async (
    teacherId: string,
    periodId: string
  ): Promise<{
    averageRating: number;
    totalResponses: number;
    questionRatings: Array<{
      questionId: string;
      questionText: string;
      averageRating: number;
      responseCount: number;
    }>;
  }> => {
    try {
      // Получаем все ответы по преподавателю в данном периоде
      const responses = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [
          Query.equal("teacherId", teacherId),
          Query.equal("surveyPeriodId", periodId),
        ]
      );

      if (responses.documents.length === 0) {
        return {
          averageRating: 0,
          totalResponses: 0,
          questionRatings: [],
        };
      }

      // Получаем все ответы на вопросы
      const responseIds = responses.documents.map((r) => r.$id);
      const allAnswers: SurveyAnswer[] = [];

      for (const responseId of responseIds) {
        const answers = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.surveyAnswers,
          [Query.equal("responseId", responseId)]
        );
        allAnswers.push(...(answers.documents as unknown as SurveyAnswer[]));
      }

      // Группируем ответы по вопросам
      const questionGroups = allAnswers.reduce((acc, answer) => {
        if (!acc[answer.questionId]) {
          acc[answer.questionId] = [];
        }
        acc[answer.questionId].push(answer.value);
        return acc;
      }, {} as Record<string, number[]>);

      // Вычисляем средние оценки по вопросам
      const questionRatings = await Promise.all(
        Object.entries(questionGroups).map(async ([questionId, values]) => {
          const averageRating =
            values.reduce((sum, val) => sum + val, 0) / values.length;

          // Получаем текст вопроса
          let questionText = `Вопрос ${questionId.slice(-6)}`;
          try {
            const question = await databases.getDocument(
              appwriteConfig.databaseId,
              appwriteConfig.collections.surveyQuestions,
              questionId
            );
            questionText = question.text;
          } catch (e) {
            // Игнорируем ошибки получения текста вопроса
          }

          return {
            questionId,
            questionText,
            averageRating: Math.round(averageRating * 100) / 100,
            responseCount: values.length,
          };
        })
      );

      // Общий средний рейтинг
      const allRatings = Object.values(questionGroups).flat();
      const averageRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length
          : 0;

      return {
        averageRating: Math.round(averageRating * 100) / 100,
        totalResponses: responses.documents.length,
        questionRatings,
      };
    } catch (error) {
      console.error("Ошибка при получении рейтинга преподавателя:", error);
      return {
        averageRating: 0,
        totalResponses: 0,
        questionRatings: [],
      };
    }
  },

  // Получить общий рейтинг всех преподавателей по периоду
  getAllTeachersRatingByPeriod: async (
    periodId: string
  ): Promise<
    Array<{
      teacherId: string;
      averageRating: number;
      totalResponses: number;
    }>
  > => {
    try {
      const responses = await surveyPeriodApi.getSurveyResponsesByPeriod(
        periodId
      );

      // Группируем по преподавателям
      const teacherGroups = responses.reduce((acc, response) => {
        if (!acc[response.teacherId]) {
          acc[response.teacherId] = [];
        }
        acc[response.teacherId].push(response);
        return acc;
      }, {} as Record<string, SurveyResponse[]>);

      // Получаем рейтинги для каждого преподавателя
      const teacherRatings = await Promise.all(
        Object.entries(teacherGroups).map(
          async ([teacherId, teacherResponses]) => {
            const rating = await surveyPeriodApi.getTeacherRatingByPeriod(
              teacherId,
              periodId
            );
            return {
              teacherId,
              averageRating: rating.averageRating,
              totalResponses: rating.totalResponses,
            };
          }
        )
      );

      // Сортируем по рейтингу (убывание)
      return teacherRatings.sort((a, b) => b.averageRating - a.averageRating);
    } catch (error) {
      console.error(
        "Ошибка при получении рейтингов всех преподавателей:",
        error
      );
      return [];
    }
  },
};
