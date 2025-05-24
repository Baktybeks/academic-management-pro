// src/services/assignmentService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from "@/types";

export const assignmentApi = {
  // === МЕТОДЫ ДЛЯ РАБОТЫ С ЗАДАНИЯМИ ===

  // Получить все задания
  getAllAssignments: async (): Promise<Assignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Assignment[];
    } catch (error) {
      console.error("Ошибка при получении заданий:", error);
      return [];
    }
  },

  // Получить активные задания
  getActiveAssignments: async (): Promise<Assignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [Query.equal("isActive", true), Query.orderDesc("dueDate")]
      );
      return response.documents as unknown as Assignment[];
    } catch (error) {
      console.error("Ошибка при получении активных заданий:", error);
      return [];
    }
  },

  // Получить задания по группе
  getAssignmentsByGroup: async (groupId: string): Promise<Assignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [Query.equal("groupId", groupId), Query.orderDesc("dueDate")]
      );
      return response.documents as unknown as Assignment[];
    } catch (error) {
      console.error("Ошибка при получении заданий группы:", error);
      return [];
    }
  },

  // Получить задания по дисциплине
  getAssignmentsBySubject: async (subjectId: string): Promise<Assignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [Query.equal("subjectId", subjectId), Query.orderDesc("dueDate")]
      );
      return response.documents as unknown as Assignment[];
    } catch (error) {
      console.error("Ошибка при получении заданий по дисциплине:", error);
      return [];
    }
  },

  // Получить задания преподавателя
  getAssignmentsByTeacher: async (teacherId: string): Promise<Assignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [Query.equal("teacherId", teacherId), Query.orderDesc("dueDate")]
      );
      return response.documents as unknown as Assignment[];
    } catch (error) {
      console.error("Ошибка при получении заданий преподавателя:", error);
      return [];
    }
  },

  // Получить задания для группы и дисциплины
  getAssignmentsByGroupAndSubject: async (
    groupId: string,
    subjectId: string
  ): Promise<Assignment[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        [
          Query.equal("groupId", groupId),
          Query.equal("subjectId", subjectId),
          Query.orderDesc("dueDate"),
        ]
      );
      return response.documents as unknown as Assignment[];
    } catch (error) {
      console.error("Ошибка при получении заданий группы и дисциплины:", error);
      return [];
    }
  },

  // Создать задание (преподаватель)
  createAssignment: async (data: CreateAssignmentDto): Promise<Assignment> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        ID.unique(),
        {
          ...data,
          maxScore: data.maxScore || 100,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Assignment;
    } catch (error) {
      console.error("Ошибка при создании задания:", error);
      throw error;
    }
  },

  // Обновить задание
  updateAssignment: async (
    id: string,
    data: Partial<CreateAssignmentDto>
  ): Promise<Assignment> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        id,
        data
      );
      return response as unknown as Assignment;
    } catch (error) {
      console.error("Ошибка при обновлении задания:", error);
      throw error;
    }
  },

  // Деактивировать задание
  deactivateAssignment: async (id: string): Promise<Assignment> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignments,
        id,
        { isActive: false }
      );
      return response as unknown as Assignment;
    } catch (error) {
      console.error("Ошибка при деактивации задания:", error);
      throw error;
    }
  },

  // === МЕТОДЫ ДЛЯ РАБОТЫ С ОТВЕТАМИ СТУДЕНТОВ ===

  // Получить все ответы на задание
  getSubmissionsByAssignment: async (
    assignmentId: string
  ): Promise<AssignmentSubmission[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignmentSubmissions,
        [
          Query.equal("assignmentId", assignmentId),
          Query.orderAsc("isChecked"), // Непроверенные сверху
          Query.orderDesc("submittedAt"),
        ]
      );
      return response.documents as unknown as AssignmentSubmission[];
    } catch (error) {
      console.error("Ошибка при получении ответов на задание:", error);
      return [];
    }
  },

  // Получить ответы студента
  getSubmissionsByStudent: async (
    studentId: string
  ): Promise<AssignmentSubmission[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignmentSubmissions,
        [Query.equal("studentId", studentId), Query.orderDesc("submittedAt")]
      );
      return response.documents as unknown as AssignmentSubmission[];
    } catch (error) {
      console.error("Ошибка при получении ответов студента:", error);
      return [];
    }
  },

  // Получить непроверенные ответы преподавателя
  getUncheckedSubmissionsByTeacher: async (
    teacherId: string
  ): Promise<AssignmentSubmission[]> => {
    try {
      // Сначала получаем задания преподавателя
      const assignments = await assignmentApi.getAssignmentsByTeacher(
        teacherId
      );
      const assignmentIds = assignments.map((a) => a.$id);

      if (assignmentIds.length === 0) return [];

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignmentSubmissions,
        [Query.equal("isChecked", false), Query.orderDesc("submittedAt")]
      );

      // Фильтруем только ответы на задания этого преподавателя
      const submissions =
        response.documents as unknown as AssignmentSubmission[];
      return submissions.filter((sub) =>
        assignmentIds.includes(sub.assignmentId)
      );
    } catch (error) {
      console.error("Ошибка при получении непроверенных ответов:", error);
      return [];
    }
  },

  // Отправить ответ на задание (студент)
  submitAssignment: async (
    data: SubmitAssignmentDto,
    studentId: string
  ): Promise<AssignmentSubmission> => {
    try {
      // Проверяем, не отправил ли студент уже ответ
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignmentSubmissions,
        [
          Query.equal("assignmentId", data.assignmentId),
          Query.equal("studentId", studentId),
        ]
      );

      if (existing.documents.length > 0) {
        // Обновляем существующий ответ
        const response = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.assignmentSubmissions,
          existing.documents[0].$id,
          {
            submissionUrl: data.submissionUrl,
            submittedAt: new Date().toISOString(),
            isChecked: false, // Сбрасываем статус проверки
            score: undefined,
            comment: undefined,
            checkedAt: undefined,
            checkedBy: undefined,
          }
        );
        return response as unknown as AssignmentSubmission;
      } else {
        // Создаем новый ответ
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.assignmentSubmissions,
          ID.unique(),
          {
            ...data,
            studentId,
            submittedAt: new Date().toISOString(),
            isChecked: false,
          }
        );
        return response as unknown as AssignmentSubmission;
      }
    } catch (error) {
      console.error("Ошибка при отправке ответа:", error);
      throw error;
    }
  },

  // Оценить ответ (преподаватель)
  gradeSubmission: async (
    data: GradeSubmissionDto,
    teacherId: string
  ): Promise<AssignmentSubmission> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignmentSubmissions,
        data.submissionId,
        {
          score: data.score,
          comment: data.comment,
          isChecked: true,
          checkedAt: new Date().toISOString(),
          checkedBy: teacherId,
        }
      );
      return response as unknown as AssignmentSubmission;
    } catch (error) {
      console.error("Ошибка при оценке ответа:", error);
      throw error;
    }
  },

  // Получить ответ студента на конкретное задание
  getStudentSubmission: async (
    assignmentId: string,
    studentId: string
  ): Promise<AssignmentSubmission | null> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.assignmentSubmissions,
        [
          Query.equal("assignmentId", assignmentId),
          Query.equal("studentId", studentId),
        ]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as AssignmentSubmission)
        : null;
    } catch (error) {
      console.error("Ошибка при получении ответа студента:", error);
      return null;
    }
  },

  // Получить статистику по заданию
  getAssignmentStats: async (
    assignmentId: string
  ): Promise<{
    totalSubmissions: number;
    checkedSubmissions: number;
    uncheckedSubmissions: number;
    averageScore: number;
  }> => {
    try {
      const submissions = await assignmentApi.getSubmissionsByAssignment(
        assignmentId
      );

      const checkedSubmissions = submissions.filter((s) => s.isChecked);
      const scores = checkedSubmissions
        .map((s) => s.score)
        .filter((score) => score !== undefined) as number[];

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      return {
        totalSubmissions: submissions.length,
        checkedSubmissions: checkedSubmissions.length,
        uncheckedSubmissions: submissions.length - checkedSubmissions.length,
        averageScore: Math.round(averageScore * 100) / 100,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики задания:", error);
      return {
        totalSubmissions: 0,
        checkedSubmissions: 0,
        uncheckedSubmissions: 0,
        averageScore: 0,
      };
    }
  },
};
