// src/services/surveyService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Survey, SurveyQuestion } from "@/types";

export interface SurveyCreateDto {
  title: string;
  description: string;
  createdBy: string;
  isActive?: boolean;
}

export interface SurveyQuestionCreateDto {
  surveyId: string;
  text: string;
  order?: number;
}

export const surveyApi = {
  // === ОПРОСНИКИ ===

  // Получить все опросники
  getAllSurveys: async (): Promise<Survey[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Survey[];
    } catch (error) {
      console.error("Ошибка при получении опросников:", error);
      return [];
    }
  },

  // Получить активные опросники
  getActiveSurveys: async (): Promise<Survey[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        [Query.equal("isActive", true), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Survey[];
    } catch (error) {
      console.error("Ошибка при получении активных опросников:", error);
      return [];
    }
  },

  // Получить опросник по ID
  getSurveyById: async (id: string): Promise<Survey | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Ошибка при получении опросника:", error);
      return null;
    }
  },

  // Получить опросники, созданные конкретным пользователем
  getSurveysByCreator: async (creatorId: string): Promise<Survey[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        [Query.equal("createdBy", creatorId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Survey[];
    } catch (error) {
      console.error("Ошибка при получении опросников по создателю:", error);
      return [];
    }
  },

  // Создать опросник (только Супер админ)
  createSurvey: async (data: SurveyCreateDto): Promise<Survey> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        ID.unique(),
        {
          ...data,
          isActive: data.isActive ?? true,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Ошибка при создании опросника:", error);
      throw error;
    }
  },

  // Обновить опросник
  updateSurvey: async (
    id: string,
    data: Partial<SurveyCreateDto>
  ): Promise<Survey> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id,
        data
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Ошибка при обновлении опросника:", error);
      throw error;
    }
  },

  // Удалить опросник
  deleteSurvey: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении опросника:", error);
      throw error;
    }
  },

  // === ВОПРОСЫ ОПРОСНИКА ===

  // Получить все вопросы опросника
  getQuestionsBySurveyId: async (
    surveyId: string
  ): Promise<SurveyQuestion[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        [Query.equal("surveyId", surveyId), Query.orderAsc("order")]
      );
      return response.documents as unknown as SurveyQuestion[];
    } catch (error) {
      console.error("Ошибка при получении вопросов опросника:", error);
      return [];
    }
  },

  // Получить вопрос по ID
  getQuestionById: async (id: string): Promise<SurveyQuestion | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        id
      );
      return response as unknown as SurveyQuestion;
    } catch (error) {
      console.error("Ошибка при получении вопроса:", error);
      return null;
    }
  },

  // Создать вопрос опросника
  createQuestion: async (
    data: SurveyQuestionCreateDto
  ): Promise<SurveyQuestion> => {
    try {
      // Определяем порядок вопроса, если не указан
      let order = data.order;
      if (!order) {
        const existingQuestions = await surveyApi.getQuestionsBySurveyId(
          data.surveyId
        );
        order = existingQuestions.length + 1;
      }

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        ID.unique(),
        {
          surveyId: data.surveyId,
          text: data.text,
          order,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as SurveyQuestion;
    } catch (error) {
      console.error("Ошибка при создании вопроса:", error);
      throw error;
    }
  },

  // Обновить вопрос
  updateQuestion: async (
    id: string,
    data: Partial<SurveyQuestionCreateDto>
  ): Promise<SurveyQuestion> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        id,
        data
      );
      return response as unknown as SurveyQuestion;
    } catch (error) {
      console.error("Ошибка при обновлении вопроса:", error);
      throw error;
    }
  },

  // Удалить вопрос
  deleteQuestion: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении вопроса:", error);
      throw error;
    }
  },

  // Массовое создание вопросов
  bulkCreateQuestions: async (
    surveyId: string,
    questionTexts: string[]
  ): Promise<SurveyQuestion[]> => {
    try {
      const questions = await Promise.all(
        questionTexts.map((text, index) =>
          surveyApi.createQuestion({
            surveyId,
            text,
            order: index + 1,
          })
        )
      );
      return questions;
    } catch (error) {
      console.error("Ошибка при массовом создании вопросов:", error);
      throw error;
    }
  },

  // Изменить порядок вопросов
  reorderQuestions: async (questionIds: string[]): Promise<void> => {
    try {
      await Promise.all(
        questionIds.map((id, index) =>
          surveyApi.updateQuestion(id, { order: index + 1 })
        )
      );
    } catch (error) {
      console.error("Ошибка при изменении порядка вопросов:", error);
      throw error;
    }
  },

  // === СТАТИСТИКА И АНАЛИТИКА ===

  // Получить статистику опросника
  getSurveyStats: async (
    surveyId: string
  ): Promise<{
    totalQuestions: number;
    totalResponses: number;
    activePeriodsCount: number;
    averageRating: number;
  }> => {
    try {
      // Получаем количество вопросов
      const questions = await surveyApi.getQuestionsBySurveyId(surveyId);

      // Получаем количество периодов
      const periodsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        [Query.equal("surveyId", surveyId)]
      );

      const activePeriodsCount = periodsResponse.documents.filter(
        (period: any) => period.isActive
      ).length;

      // Получаем количество ответов
      const responsesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.equal("surveyId", surveyId)]
      );

      // Подсчитываем средний рейтинг (упрощенно)
      let averageRating = 0;
      if (responsesResponse.documents.length > 0) {
        // Для подсчета среднего рейтинга нужно получить все ответы на вопросы
        // Это упрощенная версия - в реальности нужно получить все ответы и подсчитать
        averageRating = 7.5; // Заглушка
      }

      return {
        totalQuestions: questions.length,
        totalResponses: responsesResponse.documents.length,
        activePeriodsCount,
        averageRating,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики опросника:", error);
      return {
        totalQuestions: 0,
        totalResponses: 0,
        activePeriodsCount: 0,
        averageRating: 0,
      };
    }
  },

  // Поиск опросников
  searchSurveys: async (searchTerm: string): Promise<Survey[]> => {
    try {
      const surveys = await surveyApi.getAllSurveys();
      const searchLower = searchTerm.toLowerCase();

      return surveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(searchLower) ||
          survey.description.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Ошибка при поиске опросников:", error);
      return [];
    }
  },

  // Проверить, используется ли опросник в активных периодах
  isSurveyInUse: async (surveyId: string): Promise<boolean> => {
    try {
      const periodsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyPeriods,
        [Query.equal("surveyId", surveyId), Query.equal("isActive", true)]
      );

      return periodsResponse.documents.length > 0;
    } catch (error) {
      console.error("Ошибка при проверке использования опросника:", error);
      return false;
    }
  },
};
