// src/app/(dashboard)/student/attendance/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { attendanceApi } from "@/services/attendanceService";
import { lessonApi } from "@/services/lessonService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { userApi } from "@/services/userService";
import { Attendance, Lesson, Group, Subject, User } from "@/types";
import {
  Calendar,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  UserIcon,
  Filter,
  BarChart3,
  Clock,
} from "lucide-react";

export default function StudentAttendancePage() {
  const { user } = useAuthStore();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Получаем группы студента
  const { data: studentGroups = [] } = useQuery({
    queryKey: ["student-groups", user?.$id],
    queryFn: () => groupApi.getGroupsByStudentId(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем посещаемость студента
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["student-attendance", user?.$id],
    queryFn: () => attendanceApi.getByStudentId(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем все дисциплины
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  // Получаем уроки для групп студента
  const { data: allLessons = [] } = useQuery({
    queryKey: ["student-lessons", studentGroups.map((g) => g.$id)],
    queryFn: async () => {
      if (studentGroups.length === 0) return [];

      const lessonPromises = studentGroups.map((group) =>
        lessonApi.getLessonsByGroup(group.$id)
      );

      const lessonArrays = await Promise.all(lessonPromises);
      return lessonArrays.flat();
    },
    enabled: studentGroups.length > 0,
  });

  // Получаем преподавателей
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => userApi.getUsersByRole("TEACHER" as any),
  });

  // Создаем карты для быстрого доступа
  const subjectsMap = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [subjects]);

  const groupsMap = React.useMemo(() => {
    return studentGroups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, Group>);
  }, [studentGroups]);

  const teachersMap = React.useMemo(() => {
    return teachers.reduce((acc, teacher) => {
      acc[teacher.$id] = teacher;
      return acc;
    }, {} as Record<string, User>);
  }, [teachers]);

  const attendanceMap = React.useMemo(() => {
    return attendanceRecords.reduce((acc, record) => {
      acc[record.lessonId] = record;
      return acc;
    }, {} as Record<string, Attendance>);
  }, [attendanceRecords]);

  // Фильтрация уроков
  const filteredLessons = React.useMemo(() => {
    return allLessons.filter((lesson) => {
      if (selectedSubject !== "all" && lesson.subjectId !== selectedSubject) {
        return false;
      }

      if (selectedGroup !== "all" && lesson.groupId !== selectedGroup) {
        return false;
      }

      return true;
    });
  }, [allLessons, selectedSubject, selectedGroup]);

  // Сортировка уроков по дате (новые сверху)
  const sortedLessons = React.useMemo(() => {
    return [...filteredLessons].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredLessons]);

  // Статистика посещаемости
  const attendanceStats = React.useMemo(() => {
    const totalLessons = filteredLessons.length;
    const attendedLessons = filteredLessons.filter(
      (lesson) => attendanceMap[lesson.$id]?.present
    ).length;
    const missedLessons = filteredLessons.filter(
      (lesson) =>
        attendanceMap[lesson.$id] && !attendanceMap[lesson.$id].present
    ).length;
    const notMarkedLessons = totalLessons - attendedLessons - missedLessons;

    const attendancePercentage =
      totalLessons > 0 ? (attendedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      attendedLessons,
      missedLessons,
      notMarkedLessons,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    };
  }, [filteredLessons, attendanceMap]);

  const getAttendanceIcon = (lesson: Lesson) => {
    const attendance = attendanceMap[lesson.$id];

    if (!attendance) {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }

    return attendance.present ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getAttendanceStatus = (lesson: Lesson) => {
    const attendance = attendanceMap[lesson.$id];

    if (!attendance) {
      return { text: "Не отмечено", color: "text-gray-600 bg-gray-50" };
    }

    return attendance.present
      ? { text: "Присутствовал", color: "text-green-600 bg-green-50" }
      : { text: "Отсутствовал", color: "text-red-600 bg-red-50" };
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Моя посещаемость
        </h1>
        <p className="text-gray-600">
          Отслеживайте свою посещаемость занятий по дисциплинам
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Всего занятий</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceStats.totalLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Посещено</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceStats.attendedLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Пропущено</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceStats.missedLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Не отмечено</p>
              <p className="text-xl font-bold text-gray-900">
                {attendanceStats.notMarkedLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow  border-[6699FF]">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-indigo-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Процент</p>
              <p
                className={`text-xl font-bold ${getAttendanceColor(
                  attendanceStats.attendancePercentage
                )}`}
              >
                {attendanceStats.attendancePercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow  border-[6699FF]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дисциплина
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2  border-[6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все дисциплины</option>
              {subjects.map((subject) => (
                <option key={subject.$id} value={subject.$id}>
                  {subject.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Группа
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2  border-[6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все группы</option>
              {studentGroups.map((group) => (
                <option key={group.$id} value={group.$id}>
                  {group.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Показано: {sortedLessons.length} занятий
            </div>
          </div>
        </div>
      </div>

      {/* Список занятий */}
      {sortedLessons.length > 0 ? (
        <div className="bg-white rounded-lg shadow  border-[6699FF]">
          <div className="divide-y divide-gray-200">
            {sortedLessons.map((lesson) => {
              const subject = subjectsMap[lesson.subjectId];
              const group = groupsMap[lesson.groupId];
              const teacher = teachersMap[lesson.teacherId];
              const status = getAttendanceStatus(lesson);

              return (
                <div key={lesson.$id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getAttendanceIcon(lesson)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lesson.title}
                        </h3>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          {subject && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {subject.title}
                            </div>
                          )}
                          {group && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {group.title}
                            </div>
                          )}
                          {teacher && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {teacher.name}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(lesson.date).toLocaleDateString("ru-RU")}
                          </div>
                        </div>

                        {lesson.description && (
                          <p className="text-gray-700 text-sm mt-2">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow  border-[6699FF]">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Занятий не найдено
          </h3>
          <p className="text-gray-500">
            {selectedSubject !== "all" || selectedGroup !== "all"
              ? "Попробуйте изменить фильтры"
              : "Занятия пока не назначены"}
          </p>
        </div>
      )}
    </div>
  );
}
