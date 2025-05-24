// src/services/attendanceAnalytics.ts

import { attendanceApi } from "./attendanceService";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Query } from "appwrite";
import { Attendance, Lesson, User, Group, Subject } from "@/types";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  totalLessons: number;
  attendedLessons: number;
  missedLessons: number;
  attendanceRate: number;
  recentAttendance: Array<{
    date: string;
    present: boolean;
    lessonId: string;
    lessonTitle: string;
  }>;
}

export interface AttendanceStats {
  totalStudents: number;
  averageAttendance: number;
  excellentAttendance: number;
  goodAttendance: number;
  poorAttendance: number;
  totalLessons: number;
  totalMissed: number;
}

export interface AttendanceFilters {
  groupId?: string;
  subjectId?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
}

export const attendanceAnalyticsApi = {
  // Получить агрегированные данные посещаемости
  getAttendanceRecords: async (
    filters?: AttendanceFilters
  ): Promise<AttendanceRecord[]> => {
    try {
      // Получаем все необходимые данные параллельно
      const [attendance, lessons, users, groups, subjects] = await Promise.all([
        attendanceApi.getAllAttendance(),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.lessons,
          [Query.orderDesc("date")]
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.groups
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.subjects
        ),
      ]);

      // Создаем карты для быстрого доступа
      const usersMap = new Map<string, User>(
        users.documents.map((u: any) => [u.$id, u as User])
      );
      const groupsMap = new Map<string, Group>(
        groups.documents.map((g: any) => [g.$id, g as Group])
      );
      const subjectsMap = new Map<string, Subject>(
        subjects.documents.map((s: any) => [s.$id, s as Subject])
      );
      const lessonsMap = new Map<string, Lesson>(
        lessons.documents.map((l: any) => [l.$id, l as Lesson])
      );

      // Группируем посещаемость по студентам
      const attendanceByStudent = new Map<string, Attendance[]>();
      attendance.forEach((record) => {
        if (!attendanceByStudent.has(record.studentId)) {
          attendanceByStudent.set(record.studentId, []);
        }
        attendanceByStudent.get(record.studentId)!.push(record);
      });

      // Группируем занятия по студентам через группы
      const lessonsByStudent = new Map<string, Lesson[]>();
      lessons.documents.forEach((lessonDoc: any) => {
        const lesson = lessonDoc as Lesson;
        const group = groupsMap.get(lesson.groupId);

        if (group && group.studentIds) {
          group.studentIds.forEach((studentId: string) => {
            if (!lessonsByStudent.has(studentId)) {
              lessonsByStudent.set(studentId, []);
            }
            lessonsByStudent.get(studentId)!.push(lesson);
          });
        }
      });

      // Создаем записи посещаемости
      const records: AttendanceRecord[] = [];

      attendanceByStudent.forEach((studentAttendance, studentId) => {
        const student = usersMap.get(studentId);
        if (!student || student.role !== "STUDENT") return;

        const studentLessons = lessonsByStudent.get(studentId) || [];

        // Группируем по дисциплинам
        const lessonsBySubject = new Map<string, Lesson[]>();
        studentLessons.forEach((lesson) => {
          if (!lessonsBySubject.has(lesson.subjectId)) {
            lessonsBySubject.set(lesson.subjectId, []);
          }
          lessonsBySubject.get(lesson.subjectId)!.push(lesson);
        });

        lessonsBySubject.forEach((subjectLessons, subjectId) => {
          const subject = subjectsMap.get(subjectId);
          if (!subject) return;

          const firstLesson = subjectLessons[0];
          const group = groupsMap.get(firstLesson.groupId);
          const teacher = usersMap.get(firstLesson.teacherId);

          if (!group || !teacher) return;

          // Применяем фильтры
          if (filters?.groupId && firstLesson.groupId !== filters.groupId)
            return;
          if (filters?.subjectId && subjectId !== filters.subjectId) return;
          if (filters?.teacherId && firstLesson.teacherId !== filters.teacherId)
            return;

          // Фильтр по датам
          let filteredLessons = subjectLessons;
          if (filters?.startDate || filters?.endDate) {
            filteredLessons = subjectLessons.filter((lesson) => {
              const lessonDate = new Date(lesson.date);
              if (filters.startDate && lessonDate < new Date(filters.startDate))
                return false;
              if (filters.endDate && lessonDate > new Date(filters.endDate))
                return false;
              return true;
            });
          }

          // Подсчитываем статистику
          const lessonIds = filteredLessons.map((l) => l.$id);
          const relevantAttendance = studentAttendance.filter((a) =>
            lessonIds.includes(a.lessonId)
          );

          const totalLessons = filteredLessons.length;
          const attendedLessons = relevantAttendance.filter(
            (a) => a.present
          ).length;
          const missedLessons = totalLessons - attendedLessons;
          const attendanceRate =
            totalLessons > 0 ? (attendedLessons / totalLessons) * 100 : 0;

          // Последние 5 занятий с деталями
          const recentLessons = filteredLessons
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5);

          const recentAttendance = recentLessons.map((lesson) => {
            const attendanceRecord = relevantAttendance.find(
              (a) => a.lessonId === lesson.$id
            );
            return {
              date: lesson.date,
              present: attendanceRecord?.present || false,
              lessonId: lesson.$id,
              lessonTitle: lesson.title,
            };
          });

          records.push({
            id: `${studentId}-${subjectId}`,
            studentId,
            studentName: student.name,
            groupId: group.$id,
            groupName: group.title,
            subjectId,
            subjectName: subject.title,
            teacherId: teacher.$id,
            teacherName: teacher.name,
            totalLessons,
            attendedLessons,
            missedLessons,
            attendanceRate: Math.round(attendanceRate * 10) / 10,
            recentAttendance,
          });
        });
      });

      return records.sort((a, b) => b.attendanceRate - a.attendanceRate);
    } catch (error) {
      console.error(
        "Ошибка при получении агрегированных данных посещаемости:",
        error
      );
      return [];
    }
  },

  // Получить статистику посещаемости
  getAttendanceStats: async (
    records: AttendanceRecord[]
  ): Promise<AttendanceStats> => {
    const totalStudents = records.length;
    const averageAttendance =
      totalStudents > 0
        ? Math.round(
            records.reduce((sum, record) => sum + record.attendanceRate, 0) /
              totalStudents
          )
        : 0;

    const excellentAttendance = records.filter(
      (r) => r.attendanceRate >= 90
    ).length;
    const goodAttendance = records.filter(
      (r) => r.attendanceRate >= 75 && r.attendanceRate < 90
    ).length;
    const poorAttendance = records.filter((r) => r.attendanceRate < 75).length;
    const totalLessons = records.reduce(
      (sum, record) => sum + record.totalLessons,
      0
    );
    const totalMissed = records.reduce(
      (sum, record) => sum + record.missedLessons,
      0
    );

    return {
      totalStudents,
      averageAttendance,
      excellentAttendance,
      goodAttendance,
      poorAttendance,
      totalLessons,
      totalMissed,
    };
  },

  // Получить статистику по группам
  getGroupStats: async (
    records: AttendanceRecord[]
  ): Promise<
    Array<{
      groupId: string;
      groupName: string;
      studentCount: number;
      averageAttendance: number;
      excellentCount: number;
      poorCount: number;
    }>
  > => {
    const groupMap = new Map<string, AttendanceRecord[]>();

    records.forEach((record) => {
      if (!groupMap.has(record.groupId)) {
        groupMap.set(record.groupId, []);
      }
      groupMap.get(record.groupId)!.push(record);
    });

    return Array.from(groupMap.entries())
      .map(([groupId, groupRecords]) => {
        const averageAttendance =
          groupRecords.length > 0
            ? Math.round(
                groupRecords.reduce((sum, r) => sum + r.attendanceRate, 0) /
                  groupRecords.length
              )
            : 0;

        return {
          groupId,
          groupName: groupRecords[0]?.groupName || "Неизвестная группа",
          studentCount: groupRecords.length,
          averageAttendance,
          excellentCount: groupRecords.filter((r) => r.attendanceRate >= 90)
            .length,
          poorCount: groupRecords.filter((r) => r.attendanceRate < 75).length,
        };
      })
      .sort((a, b) => b.averageAttendance - a.averageAttendance);
  },

  // Получить статистику по дисциплинам
  getSubjectStats: async (
    records: AttendanceRecord[]
  ): Promise<
    Array<{
      subjectId: string;
      subjectName: string;
      recordCount: number;
      averageAttendance: number;
      excellentCount: number;
      poorCount: number;
    }>
  > => {
    const subjectMap = new Map<string, AttendanceRecord[]>();

    records.forEach((record) => {
      if (!subjectMap.has(record.subjectId)) {
        subjectMap.set(record.subjectId, []);
      }
      subjectMap.get(record.subjectId)!.push(record);
    });

    return Array.from(subjectMap.entries())
      .map(([subjectId, subjectRecords]) => {
        const averageAttendance =
          subjectRecords.length > 0
            ? Math.round(
                subjectRecords.reduce((sum, r) => sum + r.attendanceRate, 0) /
                  subjectRecords.length
              )
            : 0;

        return {
          subjectId,
          subjectName:
            subjectRecords[0]?.subjectName || "Неизвестная дисциплина",
          recordCount: subjectRecords.length,
          averageAttendance,
          excellentCount: subjectRecords.filter((r) => r.attendanceRate >= 90)
            .length,
          poorCount: subjectRecords.filter((r) => r.attendanceRate < 75).length,
        };
      })
      .sort((a, b) => b.averageAttendance - a.averageAttendance);
  },

  // Экспорт данных посещаемости в CSV
  exportToCSV: (records: AttendanceRecord[]): string => {
    const headers = [
      "Студент",
      "Группа",
      "Дисциплина",
      "Преподаватель",
      "Всего занятий",
      "Посещено",
      "Пропущено",
      "Процент посещаемости",
    ];

    const rows = records.map((record) => [
      record.studentName,
      record.groupName,
      record.subjectName,
      record.teacherName,
      record.totalLessons.toString(),
      record.attendedLessons.toString(),
      record.missedLessons.toString(),
      `${record.attendanceRate}%`,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  },
};
