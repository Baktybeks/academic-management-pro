// src/app/(dashboard)/teacher/group/[groupId]/subject/[subjectId]/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { userApi } from "@/services/userService";
import { lessonApi } from "@/services/lessonService";
import { assignmentApi } from "@/services/assignmentService";
import { attendanceApi } from "@/services/attendanceService";
import { formatLocalDateTime, isPastDate } from "@/utils/dateUtils";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BarChart3,
  User as UserIcon,
  Search,
  Filter,
} from "lucide-react";

export default function TeacherGroupSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const groupId = params.groupId as string;
  const subjectId = params.subjectId as string;

  const [activeTab, setActiveTab] = useState<
    "lessons" | "assignments" | "students" | "attendance"
  >("lessons");
  const [searchTerm, setSearchTerm] = useState("");

  // Получаем данные группы и дисциплины
  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupApi.getGroupById(groupId),
    enabled: !!groupId,
  });

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => subjectApi.getSubjectById(subjectId),
    enabled: !!subjectId,
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
      );
    },
    enabled: !!group?.studentIds && group.studentIds.length > 0,
  });

  // Получаем занятия для группы и дисциплины
  const { data: lessons = [] } = useQuery({
    queryKey: ["group-subject-lessons", groupId, subjectId],
    queryFn: () => lessonApi.getLessonsByGroupAndSubject(groupId, subjectId),
    enabled: !!groupId && !!subjectId,
  });

  // Получаем задания для группы и дисциплины
  const { data: assignments = [] } = useQuery({
    queryKey: ["group-subject-assignments", groupId, subjectId],
    queryFn: () =>
      assignmentApi.getAssignmentsByGroupAndSubject(groupId, subjectId),
    enabled: !!groupId && !!subjectId,
  });

  // Получаем посещаемость для группы и дисциплины
  const { data: attendance = [] } = useQuery({
    queryKey: ["group-subject-attendance", groupId, subjectId],
    queryFn: () => attendanceApi.getGroupSubjectAttendance(groupId, subjectId),
    enabled: !!groupId && !!subjectId,
  });

  // Получаем все ответы на задания
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ["group-subject-submissions", assignments.map((a) => a.$id)],
    queryFn: async () => {
      if (assignments.length === 0) return [];

      const submissionPromises = assignments.map((assignment) =>
        assignmentApi.getSubmissionsByAssignment(assignment.$id)
      );

      const submissionArrays = await Promise.all(submissionPromises);
      return submissionArrays.flat();
    },
    enabled: assignments.length > 0,
  });

  // Фильтрация студентов для поиска
  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students;

    const searchLower = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
    );
  }, [students, searchTerm]);

  // Статистика
  const stats = React.useMemo(() => {
    const totalLessons = lessons.length;
    const totalAssignments = assignments.length;
    const totalStudents = students.length;

    const pastLessons = lessons.filter((l) => isPastDate(l.date)).length;
    const upcomingLessons = totalLessons - pastLessons;

    const activeAssignments = assignments.filter(
      (a) => a.isActive && !isPastDate(a.dueDate)
    ).length;
    const completedSubmissions = allSubmissions.filter(
      (s) => s.isChecked
    ).length;
    const uncheckedSubmissions = allSubmissions.filter(
      (s) => !s.isChecked
    ).length;

    // Подсчет посещаемости
    const attendanceByStudent = students.reduce((acc, student) => {
      const studentAttendance = attendance.filter(
        (a) => a.studentId === student.$id
      );
      const presentCount = studentAttendance.filter((a) => a.present).length;
      const totalCount = studentAttendance.length;
      acc[student.$id] = {
        present: presentCount,
        total: totalCount,
        percentage: totalCount > 0 ? (presentCount / totalCount) * 100 : 0,
      };
      return acc;
    }, {} as Record<string, { present: number; total: number; percentage: number }>);

    const averageAttendance =
      totalStudents > 0
        ? Object.values(attendanceByStudent).reduce(
            (sum, data) => sum + data.percentage,
            0
          ) / totalStudents
        : 0;

    return {
      totalLessons,
      pastLessons,
      upcomingLessons,
      totalAssignments,
      activeAssignments,
      totalStudents,
      completedSubmissions,
      uncheckedSubmissions,
      averageAttendance: Math.round(averageAttendance),
      attendanceByStudent,
    };
  }, [lessons, assignments, students, allSubmissions, attendance]);

  const handleBack = () => {
    router.push("/teacher");
  };

  const formatDate = (dateString: string) => {
    return formatLocalDateTime(dateString);
  };

  const isOverdue = (dateString: string) => {
    return isPastDate(dateString);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 87) return "text-green-600";
    if (percentage >= 74) return "text-blue-600";
    if (percentage >= 61) return "text-yellow-600";
    return "text-red-600";
  };

  if (!group || !subject) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка...</div>
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
          Назад к панели
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">{group.title}</h1>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-700">
              {subject.title}
            </h2>
          </div>
        </div>

        {subject.description && (
          <p className="text-gray-600 mb-4">{subject.description}</p>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Студентов</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Занятий</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalLessons}
              </p>
              <p className="text-xs text-gray-500">
                {stats.pastLessons} прошедших, {stats.upcomingLessons}{" "}
                предстоящих
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Заданий</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAssignments}
              </p>
              <p className="text-xs text-gray-500">
                {stats.activeAssignments} активных
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Посещаемость</p>
              <p
                className={`text-2xl font-bold ${getAttendanceColor(
                  stats.averageAttendance
                )}`}
              >
                {stats.averageAttendance}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Быстрые действия
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/teacher/lessons/create?groupId=${groupId}&subjectId=${subjectId}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать занятие
          </Link>

          <Link
            href={`/teacher/assignments/create?groupId=${groupId}&subjectId=${subjectId}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Создать задание
          </Link>

          {stats.uncheckedSubmissions > 0 && (
            <Link
              href="/teacher/submissions"
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Проверить работы ({stats.uncheckedSubmissions})
            </Link>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "lessons",
                label: "Занятия",
                icon: Calendar,
                count: stats.totalLessons,
              },
              {
                id: "assignments",
                label: "Задания",
                icon: FileText,
                count: stats.totalAssignments,
              },
              {
                id: "students",
                label: "Студенты",
                icon: Users,
                count: stats.totalStudents,
              },
              { id: "attendance", label: "Посещаемость", icon: CheckCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Содержимое вкладок */}
      <div className="bg-white rounded-lg shadow border">
        {/* Вкладка "Занятия" */}
        {activeTab === "lessons" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Занятия ({lessons.length})
              </h3>
              <Link
                href={`/teacher/lessons/create?groupId=${groupId}&subjectId=${subjectId}`}
                className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Добавить занятие
              </Link>
            </div>

            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((lesson) => (
                    <div
                      key={lesson.$id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(lesson.date)}
                          </span>
                          {isPastDate(lesson.date) ? (
                            <span className="text-green-600">Проведено</span>
                          ) : (
                            <span className="text-blue-600">Запланировано</span>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/teacher/attendance/lesson/${lesson.$id}`}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Посещаемость
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Занятий пока нет
                </h4>
                <p className="text-gray-600 mb-4">
                  Создайте первое занятие для этой группы
                </p>
                <Link
                  href={`/teacher/lessons/create?groupId=${groupId}&subjectId=${subjectId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Создать занятие
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Вкладка "Задания" */}
        {activeTab === "assignments" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Задания ({assignments.length})
              </h3>
              <Link
                href={`/teacher/assignments/create?groupId=${groupId}&subjectId=${subjectId}`}
                className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Добавить задание
              </Link>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments
                  .sort(
                    (a, b) =>
                      new Date(b.$createdAt).getTime() -
                      new Date(a.$createdAt).getTime()
                  )
                  .map((assignment) => {
                    const submissions = allSubmissions.filter(
                      (s) => s.assignmentId === assignment.$id
                    );
                    const checkedCount = submissions.filter(
                      (s) => s.isChecked
                    ).length;

                    return (
                      <div
                        key={assignment.$id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {assignment.title}
                            </h4>
                            {assignment.isActive ? (
                              isOverdue(assignment.dueDate) ? (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                  Просрочено
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  Активно
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                Неактивно
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Срок: {formatDate(assignment.dueDate)}
                            </span>
                            <span>Макс. балл: {assignment.maxScore}</span>
                            <span>Ответов: {submissions.length}</span>
                            <span>Проверено: {checkedCount}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/teacher/assignments/${assignment.$id}`}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Просмотр
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Заданий пока нет
                </h4>
                <p className="text-gray-600 mb-4">
                  Создайте первое задание для этой группы
                </p>
                <Link
                  href={`/teacher/assignments/create?groupId=${groupId}&subjectId=${subjectId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Создать задание
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Вкладка "Студенты" */}
        {activeTab === "students" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Студенты ({students.length})
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Поиск студента..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents
                  .sort((a, b) => a.name.localeCompare(b.name, "ru"))
                  .map((student) => {
                    const studentAttendance =
                      stats.attendanceByStudent[student.$id];
                    const studentSubmissions = allSubmissions.filter(
                      (s) => s.studentId === student.$id && s.isChecked
                    );
                    const averageGrade =
                      studentSubmissions.length > 0
                        ? studentSubmissions.reduce((sum, s) => {
                            const assignment = assignments.find(
                              (a) => a.$id === s.assignmentId
                            );
                            return (
                              sum +
                              ((s.score || 0) / (assignment?.maxScore || 1)) *
                                100
                            );
                          }, 0) / studentSubmissions.length
                        : 0;

                    return (
                      <div key={student.$id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {student.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Посещаемость:</span>
                            <span
                              className={`font-medium ${getAttendanceColor(
                                studentAttendance?.percentage || 0
                              )}`}
                            >
                              {studentAttendance?.percentage || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Средняя оценка:
                            </span>
                            <span
                              className={`font-medium ${getGradeColor(
                                averageGrade,
                                100
                              )}`}
                            >
                              {Math.round(averageGrade)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Сдано работ:</span>
                            <span className="font-medium text-gray-900">
                              {studentSubmissions.length} из{" "}
                              {assignments.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "Студенты не найдены"
                    : "В группе нет студентов"}
                </h4>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Попробуйте изменить поисковый запрос"
                    : "Обратитесь к академ советнику для добавления студентов"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка "Посещаемость" */}
        {activeTab === "attendance" && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Общая посещаемость
            </h3>

            {students.length > 0 &&
            lessons.filter((l) => isPastDate(l.date)).length > 0 ? (
              <div className="space-y-4">
                {students
                  .sort((a, b) => {
                    const aAttendance =
                      stats.attendanceByStudent[a.$id]?.percentage || 0;
                    const bAttendance =
                      stats.attendanceByStudent[b.$id]?.percentage || 0;
                    return bAttendance - aAttendance;
                  })
                  .map((student) => {
                    const studentAttendance =
                      stats.attendanceByStudent[student.$id];

                    return (
                      <div
                        key={student.$id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {student.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">
                                {studentAttendance?.present || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {(studentAttendance?.total || 0) -
                                  (studentAttendance?.present || 0)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div
                              className={`text-lg font-bold ${getAttendanceColor(
                                studentAttendance?.percentage || 0
                              )}`}
                            >
                              {studentAttendance?.percentage || 0}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {studentAttendance?.present || 0} из{" "}
                              {studentAttendance?.total || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Данных о посещаемости нет
                </h4>
                <p className="text-gray-600">
                  {lessons.length === 0
                    ? "Создайте занятия и отметьте посещаемость"
                    : "Проведите занятия и отметьте посещаемость"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
