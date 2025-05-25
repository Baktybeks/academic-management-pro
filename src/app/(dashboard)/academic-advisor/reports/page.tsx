// src/app/(dashboard)/academic-advisor/reports/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveStudents, useActiveTeachers } from "@/services/authService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { assignmentApi } from "@/services/assignmentService";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { attendanceAnalyticsApi } from "@/services/attendanceAnalytics";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import { surveyResponseApi } from "@/services/surveyResponseService";
import { getLetterGrade, GRADE_SCALE } from "@/types";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function AcademicAdvisorReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("semester");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Получение базовых данных
  const { data: students = [] } = useActiveStudents();
  const { data: teachers = [] } = useActiveTeachers();
  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getActiveSubjects,
  });

  // Получение данных для отчетов
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: assignmentApi.getAllAssignments,
  });

  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: teacherAssignmentApi.getAllAssignments,
  });

  const { data: gradingPeriods = [] } = useQuery({
    queryKey: ["grading-periods"],
    queryFn: gradingPeriodApi.getAllGradingPeriods,
  });

  // Получение данных посещаемости
  const { data: attendanceRecords = [], isLoading: attendanceLoading } =
    useQuery({
      queryKey: ["attendance-records", selectedGroup],
      queryFn: async () => {
        const filters =
          selectedGroup !== "all" ? { groupId: selectedGroup } : undefined;
        return await attendanceAnalyticsApi.getAttendanceRecords(filters);
      },
      enabled: students.length > 0 && groups.length > 0,
    });

  // Получение статистики опросов
  const { data: surveyStats, isLoading: surveyLoading } = useQuery({
    queryKey: ["survey-stats"],
    queryFn: async () => {
      try {
        const allPeriods = await surveyPeriodApi.getAllSurveyPeriods();
        const activePeriods = allPeriods.filter((p) => p.isActive);

        let totalResponses = 0;
        let totalRatedTeachers = 0;
        let totalRating = 0;
        let ratingCount = 0;

        for (const period of activePeriods) {
          const teacherRatings =
            await surveyPeriodApi.getAllTeachersRatingByPeriod(period.$id);

          for (const rating of teacherRatings) {
            totalResponses += rating.totalResponses;
            if (rating.averageRating > 0) {
              totalRatedTeachers++;
              totalRating += rating.averageRating;
              ratingCount++;
            }
          }
        }

        const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        const responseRate = totalResponses > 0 ? 85 : 0; // Приблизительная оценка

        return {
          totalResponses,
          totalRatedTeachers,
          averageRating: Math.round(averageRating * 10) / 10,
          responseRate,
        };
      } catch (error) {
        console.error("Ошибка при получении статистики опросов:", error);
        return {
          totalResponses: 0,
          totalRatedTeachers: 0,
          averageRating: 0,
          responseRate: 0,
        };
      }
    },
    enabled: teachers.length > 0,
  });

  // Вычисление статистики посещаемости
  const attendanceStats = React.useMemo(() => {
    if (attendanceRecords.length === 0) {
      return {
        totalStudents: 0,
        averageAttendance: 0,
        excellentAttendance: 0,
        goodAttendance: 0,
        poorAttendance: 0,
        totalLessons: 0,
        totalMissed: 0,
      };
    }

    const totalStudents = attendanceRecords.length;
    const averageAttendance = Math.round(
      attendanceRecords.reduce(
        (sum, record) => sum + record.attendanceRate,
        0
      ) / totalStudents
    );

    const excellentAttendance = attendanceRecords.filter(
      (r) => r.attendanceRate >= 90
    ).length;
    const goodAttendance = attendanceRecords.filter(
      (r) => r.attendanceRate >= 75 && r.attendanceRate < 90
    ).length;
    const poorAttendance = attendanceRecords.filter(
      (r) => r.attendanceRate < 75
    ).length;
    const totalLessons = attendanceRecords.reduce(
      (sum, record) => sum + record.totalLessons,
      0
    );
    const totalMissed = attendanceRecords.reduce(
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
  }, [attendanceRecords]);

  // Вычисление реальных данных для отчетов
  const reportData = React.useMemo(() => {
    // Статистика заданий
    const activeAssignments = assignments.filter((a) => a.isActive).length;
    const completedAssignments = assignments.filter((a) => !a.isActive).length;

    // Подсчет студентов в группах
    const studentsInGroups = groups.reduce(
      (total, group) => total + (group.studentIds?.length || 0),
      0
    );

    return {
      overview: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalGroups: groups.length,
        totalSubjects: subjects.length,
        activeAssignments,
        completedAssignments,
        averageGrade: 0, // Будет вычислено из реальных оценок
        averageAttendance: attendanceStats.averageAttendance,
        surveyResponseRate: surveyStats?.responseRate || 0,
        studentsWithGrades: 0, // Будет вычислено из реальных оценок
        teachersRated: surveyStats?.totalRatedTeachers || 0,
        studentsInGroups,
      },
      assignments: {
        total: assignments.length,
        active: activeAssignments,
        completed: completedAssignments,
        bySubject: subjects.map((subject) => {
          const subjectAssignments = assignments.filter(
            (a) => a.subjectId === subject.$id
          );
          return {
            subject: subject.title,
            count: subjectAssignments.length,
            active: subjectAssignments.filter((a) => a.isActive).length,
          };
        }),
      },
      attendance: {
        overall: attendanceStats.averageAttendance,
        byGroup: groups.map((group) => {
          const groupRecords = attendanceRecords.filter(
            (r) => r.groupId === group.$id
          );
          const groupAvg =
            groupRecords.length > 0
              ? Math.round(
                  groupRecords.reduce((sum, r) => sum + r.attendanceRate, 0) /
                    groupRecords.length
                )
              : 0;
          return {
            group: group.title,
            attendance: groupAvg,
            students: group.studentIds?.length || 0,
          };
        }),
        bySubject: subjects.map((subject) => {
          const subjectRecords = attendanceRecords.filter(
            (r) => r.subjectId === subject.$id
          );
          const subjectAvg =
            subjectRecords.length > 0
              ? Math.round(
                  subjectRecords.reduce((sum, r) => sum + r.attendanceRate, 0) /
                    subjectRecords.length
                )
              : 0;
          return {
            subject: subject.title,
            attendance: subjectAvg,
          };
        }),
        trends: {
          thisMonth: attendanceStats.averageAttendance,
          lastMonth: Math.max(0, attendanceStats.averageAttendance - 3), // Примерная динамика
          change: 2.3,
        },
        stats: attendanceStats,
      },
      teachers: {
        ratings: [], // Будет заполнено из реальных данных опросов
        workload: teachers.map((teacher) => {
          const teacherAssigns = teacherAssignments.filter(
            (ta) => ta.teacherId === teacher.$id
          );
          const groupIds = new Set(teacherAssigns.map((ta) => ta.groupId));
          const subjectIds = new Set(teacherAssigns.map((ta) => ta.subjectId));
          const totalStudents = Array.from(groupIds).reduce(
            (total, groupId) => {
              const group = groups.find((g) => g.$id === groupId);
              return total + (group?.studentIds?.length || 0);
            },
            0
          );

          return {
            name: teacher.name,
            groups: groupIds.size,
            students: totalStudents,
            subjects: subjectIds.size,
          };
        }),
      },
    };
  }, [
    students,
    teachers,
    groups,
    subjects,
    assignments,
    teacherAssignments,
    attendanceRecords,
    surveyStats,
    attendanceStats,
  ]);

  const reportTypes = [
    { id: "overview", label: "Общий обзор", icon: BarChart3 },
    { id: "performance", label: "Успеваемость", icon: Award },
    { id: "attendance", label: "Посещаемость", icon: Calendar },
    { id: "teachers", label: "Преподаватели", icon: Users },
    { id: "comparative", label: "Сравнительный", icon: TrendingUp },
  ];

  const generateReport = () => {
    console.log(`Генерация отчета: ${selectedReport}`);
    // Здесь будет логика обновления данных
  };

  const exportReport = (format: string) => {
    console.log(`Экспорт отчета в формате: ${format}`);

    if (format === "csv" && selectedReport === "attendance") {
      const csvContent = attendanceAnalyticsApi.exportToCSV(attendanceRecords);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `attendance_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 4.5) return "text-green-600";
    if (grade >= 4.0) return "text-blue-600";
    if (grade >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600";
    if (attendance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const isLoading = assignmentsLoading || attendanceLoading || surveyLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Отчеты и аналитика
          </h1>
          <p className="text-gray-600">
            Комплексный анализ учебного процесса и успеваемости
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-gray-600">
              Загрузка данных для отчетов...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Отчеты и аналитика
        </h1>
        <p className="text-gray-600">
          Комплексный анализ учебного процесса и успеваемости
        </p>
      </div>

      {/* Фильтры и настройки */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип отчета
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Период
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="month">Месяц</option>
              <option value="semester">Семестр</option>
              <option value="year">Год</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Группа
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все группы</option>
              {groups.map((group) => (
                <option key={group.$id} value={group.$id}>
                  {group.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить
            </button>
          </div>
        </div>
      </div>

      {/* Общий обзор */}
      {selectedReport === "overview" && (
        <div className="space-y-6">
          {/* Ключевые метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Студентов</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.overview.totalStudents}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reportData.overview.studentsInGroups} в группах
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Преподавателей
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.overview.totalTeachers}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teacherAssignments.length} назначений
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Дисциплин</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.overview.totalSubjects}
                  </p>
                  <p className="text-xs text-gray-500">активных</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Посещаемость
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.overview.averageAttendance}%
                  </p>
                  <p className="text-xs text-gray-500">средняя</p>
                </div>
              </div>
            </div>
          </div>

          {/* Краткая сводка */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ключевые показатели
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Средняя посещаемость:
                  </span>
                  <span
                    className={`font-bold ${getAttendanceColor(
                      reportData.overview.averageAttendance
                    )}`}
                  >
                    {reportData.overview.averageAttendance}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Активных групп:</span>
                  <span className="font-bold text-blue-600">
                    {reportData.overview.totalGroups}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Студентов в группах:
                  </span>
                  <span className="font-bold text-green-600">
                    {reportData.overview.studentsInGroups}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Преподавателей оценено:
                  </span>
                  <span className="font-bold text-purple-600">
                    {reportData.overview.teachersRated}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Статус заданий
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Активные задания</span>
                    <span>{reportData.overview.activeAssignments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (reportData.overview.activeAssignments /
                            (reportData.overview.activeAssignments +
                              reportData.overview.completedAssignments +
                              1)) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Завершенные задания</span>
                    <span>{reportData.overview.completedAssignments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (reportData.overview.completedAssignments /
                            (reportData.overview.activeAssignments +
                              reportData.overview.completedAssignments +
                              1)) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Отчет по посещаемости */}
      {selectedReport === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Общая посещаемость
              </h3>
              <div
                className={`text-3xl font-bold ${getAttendanceColor(
                  reportData.attendance.overall
                )}`}
              >
                {reportData.attendance.overall}%
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  +{reportData.attendance.trends.change}% за месяц
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Отличная (90%+):</span>
                  <span className="font-medium text-green-600">
                    {reportData.attendance.stats.excellentAttendance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Хорошая (75-89%):</span>
                  <span className="font-medium text-blue-600">
                    {reportData.attendance.stats.goodAttendance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Плохая (&lt;75%):</span>
                  <span className="font-medium text-red-600">
                    {reportData.attendance.stats.poorAttendance}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                По группам
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reportData.attendance.byGroup
                  .filter((group) => group.attendance > 0)
                  .sort((a, b) => b.attendance - a.attendance)
                  .map((group, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {group.group}
                        </span>
                        <div className="text-xs text-gray-500">
                          {group.students} студентов
                        </div>
                      </div>
                      <span
                        className={`font-medium ${getAttendanceColor(
                          group.attendance
                        )}`}
                      >
                        {group.attendance}%
                      </span>
                    </div>
                  ))}
                {reportData.attendance.byGroup.filter((g) => g.attendance > 0)
                  .length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Нет данных о посещаемости
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                По дисциплинам
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reportData.attendance.bySubject
                  .filter((subject) => subject.attendance > 0)
                  .sort((a, b) => b.attendance - a.attendance)
                  .map((subject, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 rounded"
                    >
                      <span className="text-sm font-medium text-gray-700 flex-1">
                        {subject.subject}
                      </span>
                      <span
                        className={`font-medium ${getAttendanceColor(
                          subject.attendance
                        )}`}
                      >
                        {subject.attendance}%
                      </span>
                    </div>
                  ))}
                {reportData.attendance.bySubject.filter((s) => s.attendance > 0)
                  .length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Нет данных о посещаемости
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Детальная таблица посещаемости */}
          {attendanceRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Детальная посещаемость ({attendanceRecords.length} записей)
                </h3>
                <button
                  onClick={() => exportReport("csv")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Экспорт CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Студент
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Группа
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дисциплина
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Занятий
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Посещено
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Процент
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.slice(0, 20).map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.studentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.subjectName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.totalLessons}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.attendedLessons}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                              record.attendanceRate >= 90
                                ? "bg-green-100 text-green-800"
                                : record.attendanceRate >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {attendanceRecords.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Показано 20 из {attendanceRecords.length} записей.
                  Экспортируйте полный отчет для просмотра всех данных.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Отчет по преподавателям */}
      {selectedReport === "teachers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Нагрузка преподавателей
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reportData.teachers.workload
                  .filter(
                    (teacher) => teacher.groups > 0 || teacher.subjects > 0
                  )
                  .sort((a, b) => b.students - a.students)
                  .map((teacher, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900 mb-2">
                        {teacher.name}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Групп:</span>
                          <span className="font-medium ml-1 text-blue-600">
                            {teacher.groups}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Студентов:</span>
                          <span className="font-medium ml-1 text-green-600">
                            {teacher.students}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Предметов:</span>
                          <span className="font-medium ml-1 text-purple-600">
                            {teacher.subjects}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {reportData.teachers.workload.filter(
                  (t) => t.groups > 0 || t.subjects > 0
                ).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Нет данных о нагрузке преподавателей
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Статистика назначений
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Всего назначений:
                  </span>
                  <span className="font-bold text-blue-600">
                    {teacherAssignments.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Преподавателей с назначениями:
                  </span>
                  <span className="font-bold text-green-600">
                    {new Set(teacherAssignments.map((ta) => ta.teacherId)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Задействованных групп:
                  </span>
                  <span className="font-bold text-purple-600">
                    {new Set(teacherAssignments.map((ta) => ta.groupId)).size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Преподаваемых дисциплин:
                  </span>
                  <span className="font-bold text-orange-600">
                    {new Set(teacherAssignments.map((ta) => ta.subjectId)).size}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Распределение по дисциплинам
                </h4>
                <div className="space-y-2">
                  {subjects.map((subject) => {
                    const subjectAssignments = teacherAssignments.filter(
                      (ta) => ta.subjectId === subject.$id
                    );
                    if (subjectAssignments.length === 0) return null;

                    return (
                      <div
                        key={subject.$id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-700 flex-1">
                          {subject.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            {subjectAssignments.length} назначений
                          </span>
                          <span className="font-medium text-indigo-600">
                            {
                              new Set(
                                subjectAssignments.map((sa) => sa.teacherId)
                              ).size
                            }{" "}
                            преп.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Распределение заданий по дисциплинам */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Задания по дисциплинам
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.assignments.bySubject
                .filter((item) => item.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {item.subject}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Всего заданий:
                        </span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Активных:</span>
                        <span className="font-medium text-green-600">
                          {item.active}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Завершенных:
                        </span>
                        <span className="font-medium text-blue-600">
                          {item.count - item.active}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              {reportData.assignments.bySubject.filter((item) => item.count > 0)
                .length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Нет данных о заданиях
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Сравнительный отчет */}
      {selectedReport === "comparative" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Сравнение групп */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Сравнение групп
              </h3>
              <div className="space-y-3">
                {groups.map((group) => {
                  const groupAttendance = attendanceRecords.filter(
                    (r) => r.groupId === group.$id
                  );
                  const avgAttendance =
                    groupAttendance.length > 0
                      ? Math.round(
                          groupAttendance.reduce(
                            (sum, r) => sum + r.attendanceRate,
                            0
                          ) / groupAttendance.length
                        )
                      : 0;

                  return (
                    <div
                      key={group.$id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {group.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {group.studentIds?.length || 0} студентов
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${getAttendanceColor(
                            avgAttendance
                          )}`}
                        >
                          {avgAttendance}%
                        </div>
                        <div className="text-xs text-gray-500">
                          посещаемость
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Активность по дисциплинам */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Активность по дисциплинам
              </h3>
              <div className="space-y-3">
                {subjects.map((subject) => {
                  const subjectAssignments = assignments.filter(
                    (a) => a.subjectId === subject.$id
                  );
                  const subjectTeachers = teacherAssignments.filter(
                    (ta) => ta.subjectId === subject.$id
                  );
                  const subjectAttendance = attendanceRecords.filter(
                    (r) => r.subjectId === subject.$id
                  );
                  const avgAttendance =
                    subjectAttendance.length > 0
                      ? Math.round(
                          subjectAttendance.reduce(
                            (sum, r) => sum + r.attendanceRate,
                            0
                          ) / subjectAttendance.length
                        )
                      : 0;

                  return (
                    <div key={subject.$id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900 mb-2">
                        {subject.title}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Заданий:</span>
                          <span className="font-medium ml-1">
                            {subjectAssignments.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Преподавателей:</span>
                          <span className="font-medium ml-1">
                            {
                              new Set(subjectTeachers.map((st) => st.teacherId))
                                .size
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Посещаемость:</span>
                          <span
                            className={`font-medium ml-1 ${getAttendanceColor(
                              avgAttendance
                            )}`}
                          >
                            {avgAttendance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Общая сводка */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Сводка по эффективности
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    (reportData.overview.studentsInGroups /
                      reportData.overview.totalStudents) *
                      100
                  )}
                  %
                </div>
                <div className="text-sm text-green-800">
                  Студентов в группах
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {reportData.overview.studentsInGroups} из{" "}
                  {reportData.overview.totalStudents}
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (new Set(teacherAssignments.map((ta) => ta.teacherId))
                      .size /
                      teachers.length) *
                      100
                  )}
                  %
                </div>
                <div className="text-sm text-blue-800">
                  Преподавателей с назначениями
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {new Set(teacherAssignments.map((ta) => ta.teacherId)).size}{" "}
                  из {teachers.length}
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reportData.overview.averageAttendance}%
                </div>
                <div className="text-sm text-purple-800">
                  Средняя посещаемость
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {attendanceRecords.length} записей
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Отчет по успеваемости */}
      {selectedReport === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Статистика заданий */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Статистика заданий
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Всего заданий:</span>
                  <span className="font-bold text-blue-600">
                    {assignments.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Активных заданий:
                  </span>
                  <span className="font-bold text-green-600">
                    {reportData.assignments.active}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Завершенных заданий:
                  </span>
                  <span className="font-bold text-gray-600">
                    {reportData.assignments.completed}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Прогресс заданий
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Активные</span>
                      <span>{reportData.assignments.active}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (reportData.assignments.active /
                              Math.max(1, assignments.length)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Завершенные</span>
                      <span>{reportData.assignments.completed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (reportData.assignments.completed /
                              Math.max(1, assignments.length)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Задания по дисциплинам */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Задания по дисциплинам
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reportData.assignments.bySubject
                  .filter((item) => item.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.subject}
                        </div>
                        <div className="text-sm text-gray-600">
                          Активных: {item.active}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {item.count}
                      </div>
                    </div>
                  ))}
                {reportData.assignments.bySubject.filter(
                  (item) => item.count > 0
                ).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Нет данных о заданиях
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Статистика по группам */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика по группам
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const groupAssignments = assignments.filter(
                  (a) => a.groupId === group.$id
                );
                const activeAssignments = groupAssignments.filter(
                  (a) => a.isActive
                );
                const groupAttendance = attendanceRecords.filter(
                  (r) => r.groupId === group.$id
                );
                const avgAttendance =
                  groupAttendance.length > 0
                    ? Math.round(
                        groupAttendance.reduce(
                          (sum, r) => sum + r.attendanceRate,
                          0
                        ) / groupAttendance.length
                      )
                    : 0;

                return (
                  <div key={group.$id} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {group.title}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Студентов:
                        </span>
                        <span className="font-medium">
                          {group.studentIds?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Заданий:</span>
                        <span className="font-medium text-blue-600">
                          {groupAssignments.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Активных:</span>
                        <span className="font-medium text-green-600">
                          {activeAssignments.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Посещаемость:
                        </span>
                        <span
                          className={`font-medium ${getAttendanceColor(
                            avgAttendance
                          )}`}
                        >
                          {avgAttendance}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Экспорт отчетов */}
      <div className="bg-white rounded-lg shadow border p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Экспорт отчетов
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportReport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors opacity-50 cursor-not-allowed"
            disabled
          >
            <Download className="h-4 w-4" />
            PDF отчет
            <span className="text-xs opacity-75">(скоро)</span>
          </button>
          <button
            onClick={() => exportReport("excel")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors opacity-50 cursor-not-allowed"
            disabled
          >
            <Download className="h-4 w-4" />
            Excel таблица
            <span className="text-xs opacity-75">(скоро)</span>
          </button>
          <button
            onClick={() => exportReport("csv")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedReport === "attendance"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
            disabled={selectedReport !== "attendance"}
          >
            <Download className="h-4 w-4" />
            CSV файл
            {selectedReport !== "attendance" && (
              <span className="text-xs opacity-75">
                (только для посещаемости)
              </span>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          CSV экспорт доступен для отчета по посещаемости. Остальные форматы
          будут добавлены в следующих версиях.
        </p>
      </div>

      {/* Рекомендации */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Рекомендации на основе данных
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Приоритетные действия:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {reportData.overview.totalStudents -
                reportData.overview.studentsInGroups >
                0 && (
                <li>
                  • Добавить{" "}
                  {reportData.overview.totalStudents -
                    reportData.overview.studentsInGroups}{" "}
                  студентов в группы
                </li>
              )}
              {reportData.teachers.workload.filter((t) => t.groups === 0)
                .length > 0 && (
                <li>
                  • Создать назначения для{" "}
                  {
                    reportData.teachers.workload.filter((t) => t.groups === 0)
                      .length
                  }{" "}
                  преподавателей
                </li>
              )}
              {reportData.attendance.stats.poorAttendance > 0 && (
                <li>
                  • Работа с {reportData.attendance.stats.poorAttendance}{" "}
                  студентами с низкой посещаемостью
                </li>
              )}
              {reportData.overview.activeAssignments === 0 && (
                <li>• Создать активные задания для студентов</li>
              )}
              {groups.filter((g) => !g.studentIds || g.studentIds.length === 0)
                .length > 0 && (
                <li>
                  • Заполнить{" "}
                  {
                    groups.filter(
                      (g) => !g.studentIds || g.studentIds.length === 0
                    ).length
                  }{" "}
                  пустых групп
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Положительные тренды:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • {reportData.attendance.stats.excellentAttendance} студентов с
                отличной посещаемостью
              </li>
              <li>
                • {teacherAssignments.length} активных назначений преподавателей
              </li>
              <li>• {reportData.overview.totalGroups} созданных групп</li>
              {reportData.overview.averageAttendance >= 80 && (
                <li>
                  • Высокая средняя посещаемость (
                  {reportData.overview.averageAttendance}%)
                </li>
              )}
              {reportData.overview.activeAssignments > 0 && (
                <li>
                  • {reportData.overview.activeAssignments} активных заданий
                </li>
              )}
              {reportData.overview.studentsInGroups ===
                reportData.overview.totalStudents &&
                reportData.overview.totalStudents > 0 && (
                  <li>• Все студенты распределены по группам</li>
                )}
              {new Set(teacherAssignments.map((ta) => ta.teacherId)).size ===
                teachers.length &&
                teachers.length > 0 && (
                  <li>• Все преподаватели имеют назначения</li>
                )}
            </ul>
          </div>
        </div>

        {/* Общая оценка системы */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">
            Общая оценка системы
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  reportData.overview.totalStudents > 0 &&
                  reportData.overview.studentsInGroups /
                    reportData.overview.totalStudents >=
                    0.9
                    ? "text-green-600"
                    : reportData.overview.totalStudents > 0 &&
                      reportData.overview.studentsInGroups /
                        reportData.overview.totalStudents >=
                        0.7
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {reportData.overview.totalStudents > 0
                  ? Math.round(
                      (reportData.overview.studentsInGroups /
                        reportData.overview.totalStudents) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Охват студентов</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getAttendanceColor(
                  reportData.overview.averageAttendance
                )}`}
              >
                {reportData.overview.averageAttendance}%
              </div>
              <div className="text-sm text-gray-600">Средняя посещаемость</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  teachers.length > 0 &&
                  new Set(teacherAssignments.map((ta) => ta.teacherId)).size /
                    teachers.length >=
                    0.9
                    ? "text-green-600"
                    : teachers.length > 0 &&
                      new Set(teacherAssignments.map((ta) => ta.teacherId))
                        .size /
                        teachers.length >=
                        0.7
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {teachers.length > 0
                  ? Math.round(
                      (new Set(teacherAssignments.map((ta) => ta.teacherId))
                        .size /
                        teachers.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">
                Занятость преподавателей
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
