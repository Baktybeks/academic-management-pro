// src/services/attendanceService.ts

import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Attendance } from "@/types";

export interface AttendanceCreateDto {
  lessonId: string;
  studentId: string;
  present: boolean;
}

export const attendanceApi = {
  // Получить всю посещаемость
  getAllAttendance: async (): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Ошибка при получении посещаемости:", error);
      return [];
    }
  },

  // Получить посещаемость по занятию
  getByLessonId: async (lessonId: string): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("lessonId", lessonId)]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Ошибка при получении посещаемости занятия:", error);
      return [];
    }
  },

  // Получить посещаемость студента
  getByStudentId: async (studentId: string): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("studentId", studentId), Query.orderDesc("$createdAt")]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Ошибка при получении посещаемости студента:", error);
      return [];
    }
  },

  // Получить конкретную запись посещаемости
  getAttendanceRecord: async (
    lessonId: string,
    studentId: string
  ): Promise<Attendance | null> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("lessonId", lessonId), Query.equal("studentId", studentId)]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as Attendance)
        : null;
    } catch (error) {
      console.error("Ошибка при получении записи посещаемости:", error);
      return null;
    }
  },

  // Создать или обновить запись посещаемости
  upsertAttendance: async (data: AttendanceCreateDto): Promise<Attendance> => {
    try {
      // Проверяем, существует ли уже запись
      const existing = await attendanceApi.getAttendanceRecord(
        data.lessonId,
        data.studentId
      );

      if (existing) {
        // Обновляем существующую запись
        const response = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          existing.$id,
          { present: data.present }
        );
        return response as unknown as Attendance;
      } else {
        // Создаем новую запись
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          ID.unique(),
          {
            ...data,
            createdAt: new Date().toISOString(),
          }
        );
        return response as unknown as Attendance;
      }
    } catch (error) {
      console.error("Ошибка при создании/обновлении посещаемости:", error);
      throw error;
    }
  },

  // Массовое обновление посещаемости для занятия
  bulkUpdateAttendance: async (
    lessonId: string,
    attendanceData: Array<{ studentId: string; present: boolean }>
  ): Promise<void> => {
    try {
      await Promise.all(
        attendanceData.map((data) =>
          attendanceApi.upsertAttendance({
            lessonId,
            studentId: data.studentId,
            present: data.present,
          })
        )
      );
    } catch (error) {
      console.error("Ошибка при массовом обновлении посещаемости:", error);
      throw error;
    }
  },

  // Удалить запись посещаемости
  deleteAttendance: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении записи посещаемости:", error);
      throw error;
    }
  },

  // Получить статистику посещаемости студента
  getStudentAttendanceStats: async (
    studentId: string
  ): Promise<{
    totalLessons: number;
    attendedLessons: number;
    missedLessons: number;
    attendancePercentage: number;
  }> => {
    try {
      const attendance = await attendanceApi.getByStudentId(studentId);

      const totalLessons = attendance.length;
      const attendedLessons = attendance.filter((a) => a.present).length;
      const missedLessons = totalLessons - attendedLessons;
      const attendancePercentage =
        totalLessons > 0 ? (attendedLessons / totalLessons) * 100 : 0;

      return {
        totalLessons,
        attendedLessons,
        missedLessons,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики посещаемости:", error);
      return {
        totalLessons: 0,
        attendedLessons: 0,
        missedLessons: 0,
        attendancePercentage: 0,
      };
    }
  },

  // Получить статистику посещаемости по занятию
  getLessonAttendanceStats: async (
    lessonId: string
  ): Promise<{
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
    attendancePercentage: number;
  }> => {
    try {
      const attendance = await attendanceApi.getByLessonId(lessonId);

      const totalStudents = attendance.length;
      const presentStudents = attendance.filter((a) => a.present).length;
      const absentStudents = totalStudents - presentStudents;
      const attendancePercentage =
        totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;

      return {
        totalStudents,
        presentStudents,
        absentStudents,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики занятия:", error);
      return {
        totalStudents: 0,
        presentStudents: 0,
        absentStudents: 0,
        attendancePercentage: 0,
      };
    }
  },

  // Получить посещаемость группы по дисциплине
  getGroupSubjectAttendance: async (
    groupId: string,
    subjectId: string
  ): Promise<Attendance[]> => {
    try {
      // Получаем все занятия для группы и дисциплины
      const lessonsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("groupId", groupId), Query.equal("subjectId", subjectId)]
      );

      const lessonIds = lessonsResponse.documents.map((l) => l.$id);

      if (lessonIds.length === 0) return [];

      // Получаем посещаемость для всех занятий
      const attendancePromises = lessonIds.map((lessonId) =>
        attendanceApi.getByLessonId(lessonId)
      );

      const attendanceArrays = await Promise.all(attendancePromises);
      return attendanceArrays.flat();
    } catch (error) {
      console.error("Ошибка при получении посещаемости группы:", error);
      return [];
    }
  },
};
