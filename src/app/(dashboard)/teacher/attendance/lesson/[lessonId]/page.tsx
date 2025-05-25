// src/app/(dashboard)/teacher/attendance/lesson/[lessonId]/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { lessonApi } from "@/services/lessonService";
import { attendanceApi } from "@/services/attendanceService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { userApi } from "@/services/userService";
import { Lesson, Group, Subject, User, Attendance } from "@/types";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  BookOpen,
  UserIcon,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { formatLocalDateTime } from "@/utils/dateUtils";

export default function TeacherLessonAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const lessonId = params.lessonId as string;

  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Получаем информацию о занятии
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonApi.getLessonById(lessonId),
    enabled: !!lessonId,
  });

  // Получаем информацию о группе
  const { data: group } = useQuery({
    queryKey: ["group", lesson?.groupId],
    queryFn: () => groupApi.getGroupById(lesson!.groupId),
    enabled: !!lesson?.groupId,
  });

  // Получаем информацию о дисциплине
  const { data: subject } = useQuery({
    queryKey: ["subject", lesson?.subjectId],
    queryFn: () => subjectApi.getSubjectById(lesson!.subjectId),
    enabled: !!lesson?.subjectId,
  });

  // Получаем студентов группы
  const { data: students = [] } = useQuery({
    queryKey: ["group-students", group?.studentIds],
    queryFn: async () => {
      if (!group?.studentIds || group.studentIds.length === 0) return [];

      const studentPromises = group.studentIds.map((studentId) =>
        userApi.getUserById(studentId)
      );

      const studentsData = await Promise.all(studentPromises);
      return studentsData.filter(
        (student): student is NonNullable<typeof student> => student !== null
      ); // ← Исправленная строка
    },
    enabled: !!group?.studentIds && group.studentIds.length > 0,
  });

  // Получаем текущие данные посещаемости
  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["lesson-attendance", lessonId],
    queryFn: () => attendanceApi.getByLessonId(lessonId),
    enabled: !!lessonId,
  });

  // Инициализируем данные посещаемости при загрузке
  React.useEffect(() => {
    if (students.length > 0 && existingAttendance.length >= 0) {
      const attendanceMap: Record<string, boolean> = {};

      students.forEach((student) => {
        const existingRecord = existingAttendance.find(
          (record) => record.studentId === student.$id
        );
        attendanceMap[student.$id] = existingRecord?.present ?? false;
      });

      setAttendanceData(attendanceMap);
    }
  }, [students, existingAttendance]);

  // Мутация для сохранения посещаемости
  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      const attendanceRecords = students.map((student) => ({
        studentId: student.$id,
        present: attendanceData[student.$id] || false,
      }));

      await attendanceApi.bulkUpdateAttendance(lessonId, attendanceRecords);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-attendance"] });
      setHasChanges(false);
      toast.success("Посещаемость успешно сохранена!");
    },
    onError: (error) => {
      toast.error(`Ошибка при сохранении: ${error.message}`);
    },
  });

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: present,
    }));
    setHasChanges(true);
  };

  const handleSelectAll = (present: boolean) => {
    const newData: Record<string, boolean> = {};
    students.forEach((student) => {
      newData[student.$id] = present;
    });
    setAttendanceData(newData);
    setHasChanges(true);
  };

  const handleReset = () => {
    const attendanceMap: Record<string, boolean> = {};
    students.forEach((student) => {
      const existingRecord = existingAttendance.find(
        (record) => record.studentId === student.$id
      );
      attendanceMap[student.$id] = existingRecord?.present ?? false;
    });
    setAttendanceData(attendanceMap);
    setHasChanges(false);
  };

  const handleSave = () => {
    saveAttendanceMutation.mutate();
  };

  const handleBack = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "У вас есть несохраненные изменения. Вы уверены, что хотите уйти?"
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Статистика
  const stats = React.useMemo(() => {
    const total = students.length;
    const present = Object.values(attendanceData).filter(Boolean).length;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return { total, present, absent, percentage: Math.round(percentage) };
  }, [students, attendanceData]);

  const formatDate = (dateString: string) => {
    return formatLocalDateTime(dateString);
  };

  if (lessonLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка занятия...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Занятие не найдено
          </h3>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к занятиям
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Отметка посещаемости
        </h1>
        <p className="text-gray-600">
          Отметьте присутствующих и отсутствующих студентов
        </p>
      </div>

      {/* Информация о занятии */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {lesson.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Дата и время</div>
              <div className="font-medium">{formatDate(lesson.date)}</div>
            </div>
          </div>

          {subject && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Дисциплина</div>
                <div className="font-medium">{subject.title}</div>
              </div>
            </div>
          )}

          {group && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Группа</div>
                <div className="font-medium">{group.title}</div>
              </div>
            </div>
          )}
        </div>

        {lesson.description && (
          <p className="text-gray-700">{lesson.description}</p>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Всего студентов
              </p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Присутствуют</p>
              <p className="text-xl font-bold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Отсутствуют</p>
              <p className="text-xl font-bold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-indigo-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Посещаемость</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.percentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleSelectAll(true)}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Отметить всех
        </button>

        <button
          onClick={() => handleSelectAll(false)}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Снять все отметки
        </button>

        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Сбросить изменения
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saveAttendanceMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 ml-auto"
        >
          <Save className="h-4 w-4" />
          {saveAttendanceMutation.isPending ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      {/* Список студентов */}
      {students.length > 0 ? (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Список студентов ({students.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {students
              .sort((a, b) => a.name.localeCompare(b.name, "ru"))
              .map((student, index) => (
                <div key={student.$id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleAttendanceChange(student.$id, true)
                        }
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          attendanceData[student.$id]
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-green-50"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Присутствует
                      </button>

                      <button
                        onClick={() =>
                          handleAttendanceChange(student.$id, false)
                        }
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          !attendanceData[student.$id]
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-gray-100 text-gray-600 hover:bg-red-50"
                        }`}
                      >
                        <XCircle className="h-4 w-4 inline mr-1" />
                        Отсутствует
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            В группе нет студентов
          </h3>
          <p className="text-gray-500">
            Обратитесь к академ советнику для добавления студентов в группу
          </p>
        </div>
      )}

      {/* Предупреждение о несохраненных изменениях */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Есть несохраненные изменения
              </p>
              <p className="text-xs text-yellow-700">
                Не забудьте сохранить изменения
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
