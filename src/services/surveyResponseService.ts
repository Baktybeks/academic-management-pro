// src/services/surveyResponseService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { SurveyResponse, SurveyAnswer } from "@/types";

export interface SurveyResponseCreateDto {
  surveyId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  surveyPeriodId: string;
}

export interface SurveyAnswerCreateDto {
  responseId: string;
  questionId: string;
  value: number;
}

export const surveyResponseApi = {
  // === ОТВЕТЫ НА ОПРОСЫ ===

  // Получить все ответы
  getAllSurveyResponses: async (): Promise<SurveyResponse[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.orderDesc("submittedAt")]
      );
      return response.documents as unknown as SurveyResponse[];
    } catch (error) {
      console.error("Ошибка при получении ответов на опросы:", error);
      return [];
    }
  },

  // Получить ответы по опроснику
  getResponsesBySurvey: async (surveyId: string): Promise<SurveyResponse[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.equal("surveyId", surveyId), Query.orderDesc("submittedAt")]
      );
      return response.documents as unknown as SurveyResponse[];
    } catch (error) {
      console.error("Ошибка при получении ответов по опроснику:", error);
      return [];
    }
  },

  // Получить ответы студента
  getStudentSurveyResponses: async (
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
  getResponsesByTeacher: async (
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

  // Получить ответы по периоду опроса
  getResponsesByPeriod: async (periodId: string): Promise<SurveyResponse[]> => {
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
      console.error("Ошибка при получении ответов по периоду:", error);
      return [];
    }
  },

  // Получить ответ по ID
  getResponseById: async (id: string): Promise<SurveyResponse | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        id
      );
      return response as unknown as SurveyResponse;
    } catch (error) {
      console.error("Ошибка при получении ответа:", error);
      return null;
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

  // Создать ответ на опрос
  createResponse: async (
    data: SurveyResponseCreateDto
  ): Promise<SurveyResponse> => {
    try {
      // Проверяем, не проходил ли студент уже этот опрос
      const hasCompleted = await surveyResponseApi.hasStudentCompletedSurvey(
        data.studentId,
        data.teacherId,
        data.subjectId,
        data.surveyPeriodId
      );

      if (hasCompleted) {
        throw new Error("Студент уже прошел этот опрос");
      }

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        ID.unique(),
        {
          ...data,
          submittedAt: new Date().toISOString(),
        }
      );
      return response as unknown as SurveyResponse;
    } catch (error) {
      console.error("Ошибка при создании ответа на опрос:", error);
      throw error;
    }
  },

  // Удалить ответ на опрос
  deleteResponse: async (id: string): Promise<boolean> => {
    try {
      // Сначала удаляем все ответы на вопросы
      const answers = await surveyResponseApi.getAnswersByResponse(id);
      await Promise.all(
        answers.map((answer) => surveyResponseApi.deleteAnswer(answer.$id))
      );

      // Затем удаляем основной ответ
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении ответа на опрос:", error);
      throw error;
    }
  },

  // === ОТВЕТЫ НА ВОПРОСЫ ===

  // Получить все ответы на вопросы
  getAllAnswers: async (): Promise<SurveyAnswer[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as SurveyAnswer[];
    } catch (error) {
      console.error("Ошибка при получении ответов на вопросы:", error);
      return [];
    }
  },

  // Получить ответы на вопросы по основному ответу
  getAnswersByResponse: async (responseId: string): Promise<SurveyAnswer[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        [Query.equal("responseId", responseId)]
      );
      return response.documents as unknown as SurveyAnswer[];
    } catch (error) {
      console.error("Ошибка при получении ответов на вопросы:", error);
      return [];
    }
  },

  // Получить ответы на конкретный вопрос
  getAnswersByQuestion: async (questionId: string): Promise<SurveyAnswer[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        [Query.equal("questionId", questionId)]
      );
      return response.documents as unknown as SurveyAnswer[];
    } catch (error) {
      console.error("Ошибка при получении ответов на вопрос:", error);
      return [];
    }
  },

  // Создать ответ на вопрос
  createAnswer: async (data: SurveyAnswerCreateDto): Promise<SurveyAnswer> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as SurveyAnswer;
    } catch (error) {
      console.error("Ошибка при создании ответа на вопрос:", error);
      throw error;
    }
  },

  // Обновить ответ на вопрос
  updateAnswer: async (id: string, value: number): Promise<SurveyAnswer> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        id,
        { value }
      );
      return response as unknown as SurveyAnswer;
    } catch (error) {
      console.error("Ошибка при обновлении ответа на вопрос:", error);
      throw error;
    }
  },

  // Удалить ответ на вопрос
  deleteAnswer: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении ответа на вопрос:", error);
      throw error;
    }
  },

  // Массовое создание ответов на вопросы
  bulkCreateAnswers: async (
    responseId: string,
    answers: Array<{ questionId: string; value: number }>
  ): Promise<SurveyAnswer[]> => {
    try {
      const createdAnswers = await Promise.all(
        answers.map((answer) =>
          surveyResponseApi.createAnswer({
            responseId,
            questionId: answer.questionId,
            value: answer.value,
          })
        )
      );
      return createdAnswers;
    } catch (error) {
      console.error("Ошибка при массовом создании ответов:", error);
      throw error;
    }
  },

  // === АНАЛИТИКА И СТАТИСТИКА ===

  // Получить статистику по вопросу
  getQuestionStats: async (
    questionId: string
  ): Promise<{
    totalAnswers: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  }> => {
    try {
      const answers = await surveyResponseApi.getAnswersByQuestion(questionId);

      const totalAnswers = answers.length;
      const ratings = answers.map((a) => a.value);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      const ratingDistribution = ratings.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      return {
        totalAnswers,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики вопроса:", error);
      return {
        totalAnswers: 0,
        averageRating: 0,
        ratingDistribution: {},
      };
    }
  },

  // Получить рейтинг преподавателя
  getTeacherRating: async (
    teacherId: string,
    subjectId?: string,
    periodId?: string
  ): Promise<{
    averageRating: number;
    totalResponses: number;
    ratingsByQuestion: Array<{
      questionId: string;
      averageRating: number;
      responseCount: number;
    }>;
  }> => {
    try {
      const queries = [Query.equal("teacherId", teacherId)];

      if (subjectId) {
        queries.push(Query.equal("subjectId", subjectId));
      }

      if (periodId) {
        queries.push(Query.equal("surveyPeriodId", periodId));
      }

      const responsesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        queries
      );

      const responses =
        responsesResponse.documents as unknown as SurveyResponse[];

      if (responses.length === 0) {
        return {
          averageRating: 0,
          totalResponses: 0,
          ratingsByQuestion: [],
        };
      }

      // Получаем все ответы на вопросы для этих ответов
      const answerPromises = responses.map((response) =>
        surveyResponseApi.getAnswersByResponse(response.$id)
      );

      const answerArrays = await Promise.all(answerPromises);
      const allAnswers = answerArrays.flat();

      // Группируем по вопросам
      const answersByQuestion = allAnswers.reduce((acc, answer) => {
        if (!acc[answer.questionId]) {
          acc[answer.questionId] = [];
        }
        acc[answer.questionId].push(answer.value);
        return acc;
      }, {} as Record<string, number[]>);

      // Вычисляем рейтинги по вопросам
      const ratingsByQuestion = Object.entries(answersByQuestion).map(
        ([questionId, values]) => ({
          questionId,
          averageRating:
            values.reduce((sum, val) => sum + val, 0) / values.length,
          responseCount: values.length,
        })
      );

      // Общий средний рейтинг
      const allRatings = allAnswers.map((a) => a.value);
      const averageRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length
          : 0;

      return {
        averageRating: Math.round(averageRating * 100) / 100,
        totalResponses: responses.length,
        ratingsByQuestion: ratingsByQuestion.map((r) => ({
          ...r,
          averageRating: Math.round(r.averageRating * 100) / 100,
        })),
      };
    } catch (error) {
      console.error("Ошибка при получении рейтинга преподавателя:", error);
      return {
        averageRating: 0,
        totalResponses: 0,
        ratingsByQuestion: [],
      };
    }
  },

  // Получить статистику опроса
  getSurveyResponseStats: async (
    surveyId: string,
    periodId?: string
  ): Promise<{
    totalResponses: number;
    uniqueStudents: number;
    uniqueTeachers: number;
    averageRating: number;
  }> => {
    try {
      const queries = [Query.equal("surveyId", surveyId)];

      if (periodId) {
        queries.push(Query.equal("surveyPeriodId", periodId));
      }

      const responsesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        queries
      );

      const responses =
        responsesResponse.documents as unknown as SurveyResponse[];

      const uniqueStudents = new Set(responses.map((r) => r.studentId)).size;
      const uniqueTeachers = new Set(responses.map((r) => r.teacherId)).size;

      // Получаем все ответы для вычисления среднего рейтинга
      const answerPromises = responses.map((response) =>
        surveyResponseApi.getAnswersByResponse(response.$id)
      );

      const answerArrays = await Promise.all(answerPromises);
      const allAnswers = answerArrays.flat();

      const allRatings = allAnswers.map((a) => a.value);
      const averageRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length
          : 0;

      return {
        totalResponses: responses.length,
        uniqueStudents,
        uniqueTeachers,
        averageRating: Math.round(averageRating * 100) / 100,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики опроса:", error);
      return {
        totalResponses: 0,
        uniqueStudents: 0,
        uniqueTeachers: 0,
        averageRating: 0,
      };
    }
  },
};
