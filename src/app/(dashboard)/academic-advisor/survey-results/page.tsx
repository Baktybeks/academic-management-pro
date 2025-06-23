// src/app/(dashboard)/academic-advisor/survey-results/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Query } from "appwrite";
import { databases } from "@/services/appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { useActiveTeachers } from "@/services/authService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import { surveyResponseApi } from "@/services/surveyResponseService";
import { surveyApi } from "@/services/surveyService";
import { userApi } from "@/services/userService";
import {
  ClipboardList,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  Award,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  Loader2,
} from "lucide-react";

interface TeacherSurveyResult {
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  groupNames: string[];
  periodId: string;
  periodName: string;
  responseCount: number;
  totalStudents: number;
  responseRate: number;
  averageRating: number;
  questions: Array<{
    id: string;
    text: string;
    rating: number;
  }>;
  trend?: "up" | "down" | "stable";
  previousRating?: number;
}

export default function AcademicAdvisorSurveyResultsPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("overview");

  // Получение данных
  const { data: teachers = [] } = useActiveTeachers();
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getActiveSubjects,
  });
  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });
  const { data: surveyPeriods = [] } = useQuery({
    queryKey: ["survey-periods"],
    queryFn: surveyPeriodApi.getAllSurveyPeriods,
  });

  // Получение результатов опросов
  const { data: surveyResults = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ["survey-results", selectedPeriod],
    queryFn: async (): Promise<TeacherSurveyResult[]> => {
      try {
        const results: TeacherSurveyResult[] = [];

        // Определяем периоды для анализа
        const periodsToAnalyze =
          selectedPeriod === "all"
            ? surveyPeriods
            : surveyPeriods.filter((p) => p.$id === selectedPeriod);

        for (const period of periodsToAnalyze) {
          // Получаем рейтинги всех преподавателей по периоду
          const teacherRatings =
            await surveyPeriodApi.getAllTeachersRatingByPeriod(period.$id);

          for (const rating of teacherRatings) {
            if (rating.totalResponses === 0) continue;

            // Получаем подробную информацию о преподавателе
            const teacher = teachers.find((t) => t.$id === rating.teacherId);
            if (!teacher) continue;

            // Получаем подробный рейтинг с вопросами
            const detailedRating =
              await surveyPeriodApi.getTeacherRatingByPeriod(
                rating.teacherId,
                period.$id
              );

            // Получаем ответы преподавателя для определения предметов
            const responses = await surveyResponseApi.getResponsesByTeacher(
              rating.teacherId
            );
            const periodResponses = responses.filter(
              (r) => r.surveyPeriodId === period.$id
            );

            // Получаем назначения преподавателя для определения групп
            const teacherAssignments = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.collections.teacherAssignments,
              [Query.equal("teacherId", rating.teacherId)]
            );

            // Группируем по предметам
            const subjectGroups = periodResponses.reduce((acc, response) => {
              if (!acc[response.subjectId]) {
                // Находим группы для данного предмета и преподавателя
                const subjectAssignments = teacherAssignments.documents.filter(
                  (assignment: any) =>
                    assignment.subjectId === response.subjectId
                );
                const groupIds = new Set(
                  subjectAssignments.map(
                    (assignment: any) => assignment.groupId
                  )
                );

                acc[response.subjectId] = {
                  subjectId: response.subjectId,
                  groupIds,
                  responseCount: 0,
                };
              }
              acc[response.subjectId].responseCount++;
              return acc;
            }, {} as Record<string, { subjectId: string; groupIds: Set<string>; responseCount: number }>);

            // Создаем результат для каждого предмета
            for (const [subjectId, subjectData] of Object.entries(
              subjectGroups
            )) {
              const subject = subjects.find((s) => s.$id === subjectId);
              if (!subject) continue;

              const relatedGroups = groups.filter((g) =>
                Array.from(subjectData.groupIds).includes(g.$id)
              );

              // Подсчитываем общее количество студентов в группах
              const totalStudents = relatedGroups.reduce(
                (sum, group) => sum + (group.studentIds?.length || 0),
                0
              );

              const result: TeacherSurveyResult = {
                teacherId: rating.teacherId,
                teacherName: teacher.name,
                subjectId: subject.$id,
                subjectName: subject.title,
                groupNames: relatedGroups.map((g) => g.title),
                periodId: period.$id,
                periodName: period.title,
                responseCount: subjectData.responseCount,
                totalStudents,
                responseRate:
                  totalStudents > 0
                    ? Math.round(
                        (subjectData.responseCount / totalStudents) * 100
                      )
                    : 0,
                averageRating: detailedRating.averageRating,
                questions: detailedRating.questionRatings.map((q) => ({
                  id: q.questionId,
                  text: q.questionText,
                  rating: q.averageRating,
                })),
              };

              results.push(result);
            }
          }
        }

        return results;
      } catch (error) {
        console.error("Ошибка при получении результатов опросов:", error);
        return [];
      }
    },
    enabled:
      surveyPeriods.length > 0 && teachers.length > 0 && subjects.length > 0,
  });

  // Фильтрация данных
  const filteredResults = surveyResults.filter((result) => {
    if (selectedTeacher !== "all" && result.teacherId !== selectedTeacher)
      return false;
    if (selectedSubject !== "all" && result.subjectId !== selectedSubject)
      return false;
    return true;
  });

  // Статистика
  const stats = React.useMemo(() => {
    if (filteredResults.length === 0) {
      return {
        totalSurveys: 0,
        averageRating: 0,
        totalResponses: 0,
        averageResponseRate: 0,
        excellentRatings: 0,
        goodRatings: 0,
        needsImprovement: 0,
      };
    }

    return {
      totalSurveys: filteredResults.length,
      averageRating:
        Math.round(
          (filteredResults.reduce((sum, r) => sum + r.averageRating, 0) /
            filteredResults.length) *
            10
        ) / 10,
      totalResponses: filteredResults.reduce(
        (sum, r) => sum + r.responseCount,
        0
      ),
      averageResponseRate: Math.round(
        filteredResults.reduce((sum, r) => sum + r.responseRate, 0) /
          filteredResults.length
      ),
      excellentRatings: filteredResults.filter((r) => r.averageRating >= 4.5)
        .length,
      goodRatings: filteredResults.filter(
        (r) => r.averageRating >= 4.0 && r.averageRating < 4.5
      ).length,
      needsImprovement: filteredResults.filter((r) => r.averageRating < 4.0)
        .length,
    };
  }, [filteredResults]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-800";
    if (rating >= 4.0) return "bg-blue-100 text-blue-800";
    if (rating >= 3.5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Отлично";
    if (rating >= 4.0) return "Хорошо";
    if (rating >= 3.5) return "Удовлетворительно";
    return "Требует улучшения";
  };

  const exportResults = () => {
    const csvContent = [
      [
        "Преподаватель",
        "Дисциплина",
        "Группы",
        "Отклик",
        "Средняя оценка",
        "Период",
      ],
      ...filteredResults.map((result) => [
        result.teacherName,
        result.subjectName,
        result.groupNames.join(", "),
        `${result.responseCount}/${result.totalStudents} (${result.responseRate}%)`,
        result.averageRating.toString(),
        result.periodName,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `survey_results_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingResults) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Результаты опросов
          </h1>
          <p className="text-gray-600">
            Анализ оценок преподавателей студентами
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-gray-600">
              Загрузка результатов опросов...
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
          Результаты опросов
        </h1>
        <p className="text-gray-600">Анализ оценок преподавателей студентами</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-[#6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardList className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Проведено опросов
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSurveys}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[#6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Средняя оценка
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating}
              </p>
              <p className="text-xs text-gray-500">из 5.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[#6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Отвеченных опросов
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalResponses}
              </p>
              <p className="text-xs text-gray-500">
                {stats.averageResponseRate}% отклик
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-[#6699FF]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Высокие оценки
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.excellentRatings}
              </p>
              <p className="text-xs text-gray-500">4.5+ баллов</p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border-[#6699FF]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Режим просмотра
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="overview">Обзор</option>
              <option value="detailed">Детально</option>
              <option value="comparison">Сравнение</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Преподаватель
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все преподаватели</option>
              {teachers.map((teacher) => (
                <option key={teacher.$id} value={teacher.$id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дисциплина
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              Период
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border-[#6699FF] border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все периоды</option>
              {surveyPeriods.map((period) => (
                <option key={period.$id} value={period.$id}>
                  {period.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportResults}
              disabled={filteredResults.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </button>
          </div>
        </div>
      </div>

      {/* Распределение оценок */}
      {stats.totalSurveys > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Распределение оценок
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.excellentRatings}
              </div>
              <div className="text-sm text-green-800">Отлично (4.5+)</div>
              <div className="text-xs text-gray-600">
                {Math.round(
                  (stats.excellentRatings / stats.totalSurveys) * 100
                )}
                %
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.goodRatings}
              </div>
              <div className="text-sm text-blue-800">Хорошо (4.0-4.4)</div>
              <div className="text-xs text-gray-600">
                {Math.round((stats.goodRatings / stats.totalSurveys) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.needsImprovement}
              </div>
              <div className="text-sm text-red-800">
                Требует улучшения (&lt;4.0)
              </div>
              <div className="text-xs text-gray-600">
                {Math.round(
                  (stats.needsImprovement / stats.totalSurveys) * 100
                )}
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      {viewMode === "overview" && (
        <div className="bg-white rounded-lg shadow border-[#6699FF]">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Результаты опросов ({filteredResults.length})
            </h3>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Результаты опросов не найдены
                </p>
                <p className="text-gray-400 text-sm">
                  Попробуйте изменить фильтры или проверьте наличие проведенных
                  опросов
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Преподаватель
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дисциплина
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Группы
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Период
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Отклик
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Средняя оценка
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((result, index) => (
                      <tr
                        key={`${result.teacherId}-${result.subjectId}-${result.periodId}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.teacherName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.subjectName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {result.groupNames.join(", ") || "Нет групп"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.periodName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.responseCount}/{result.totalStudents}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.responseRate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${getRatingBadge(
                              result.averageRating
                            )}`}
                          >
                            {result.averageRating.toFixed(1)}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {getRatingLabel(result.averageRating)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Детальный просмотр */}
      {viewMode === "detailed" && (
        <div className="space-y-6">
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Результаты опросов не найдены
                </p>
                <p className="text-gray-400 text-sm">
                  Попробуйте изменить фильтры или проверьте наличие проведенных
                  опросов
                </p>
              </div>
            </div>
          ) : (
            filteredResults.map((result, index) => (
              <div
                key={`${result.teacherId}-${result.subjectId}-${result.periodId}`}
                className="bg-white rounded-lg shadow border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.teacherName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {result.subjectName} •{" "}
                      {result.groupNames.join(", ") || "Нет групп"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.periodName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${getRatingColor(
                        result.averageRating
                      )}`}
                    >
                      {result.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">из 5.0</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Детализация по вопросам
                    </h4>
                    {result.questions.length > 0 ? (
                      <div className="space-y-3">
                        {result.questions.map((question, qIndex) => (
                          <div
                            key={`${question.id}-${qIndex}`}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-700 flex-1">
                              {question.text}
                            </span>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full"
                                  style={{
                                    width: `${(question.rating / 5) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8">
                                {question.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Нет детализации по вопросам
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Статистика опроса
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Участвовало студентов:
                        </span>
                        <span className="font-medium">
                          {result.responseCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Всего студентов:
                        </span>
                        <span className="font-medium">
                          {result.totalStudents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Процент участия:
                        </span>
                        <span className="font-medium text-green-600">
                          {result.responseRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Количество вопросов:
                        </span>
                        <span className="font-medium">
                          {result.questions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Сравнение */}
      {viewMode === "comparison" && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Сравнительный анализ
          </h3>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Нет данных для сравнения</p>
              <p className="text-gray-400 text-sm">
                Попробуйте изменить фильтры или проверьте наличие проведенных
                опросов
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Рейтинг преподавателей
                </h4>
                <div className="space-y-3">
                  {filteredResults
                    .sort((a, b) => b.averageRating - a.averageRating)
                    .map((result, index) => (
                      <div
                        key={`${result.teacherId}-${result.subjectId}-${result.periodId}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">
                              {result.teacherName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {result.subjectName} • {result.periodName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${getRatingColor(
                              result.averageRating
                            )}`}
                          >
                            {result.averageRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.responseCount} ответов
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Анализ по дисциплинам
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(
                    new Set(filteredResults.map((r) => r.subjectName))
                  ).map((subjectName) => {
                    const subjectResults = filteredResults.filter(
                      (r) => r.subjectName === subjectName
                    );
                    const avgRating =
                      subjectResults.reduce(
                        (sum, r) => sum + r.averageRating,
                        0
                      ) / subjectResults.length;
                    const totalResponses = subjectResults.reduce(
                      (sum, r) => sum + r.responseCount,
                      0
                    );

                    return (
                      <div key={subjectName} className="p-4 border rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">
                          {subjectName}
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Средняя оценка:
                            </span>
                            <span
                              className={`font-medium ${getRatingColor(
                                avgRating
                              )}`}
                            >
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Преподавателей:
                            </span>
                            <span className="font-medium">
                              {subjectResults.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Всего ответов:
                            </span>
                            <span className="font-medium">
                              {totalResponses}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Анализ по периодам
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(
                    new Set(filteredResults.map((r) => r.periodName))
                  ).map((periodName) => {
                    const periodResults = filteredResults.filter(
                      (r) => r.periodName === periodName
                    );
                    const avgRating =
                      periodResults.reduce(
                        (sum, r) => sum + r.averageRating,
                        0
                      ) / periodResults.length;
                    const totalResponses = periodResults.reduce(
                      (sum, r) => sum + r.responseCount,
                      0
                    );
                    const avgResponseRate = Math.round(
                      periodResults.reduce(
                        (sum, r) => sum + r.responseRate,
                        0
                      ) / periodResults.length
                    );

                    return (
                      <div key={periodName} className="p-4 border rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">
                          {periodName}
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Средняя оценка:
                            </span>
                            <span
                              className={`font-medium ${getRatingColor(
                                avgRating
                              )}`}
                            >
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Опросов проведено:
                            </span>
                            <span className="font-medium">
                              {periodResults.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Всего ответов:
                            </span>
                            <span className="font-medium">
                              {totalResponses}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Средний отклик:
                            </span>
                            <span className="font-medium text-green-600">
                              {avgResponseRate}%
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
        </div>
      )}

      {/* Предупреждения и рекомендации */}
      {stats.needsImprovement > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Требуют внимания
              </h3>
              <p className="text-sm text-red-700">
                {stats.needsImprovement} преподавателей получили оценку ниже 4.0
                баллов. Рекомендуется провести индивидуальные беседы и
                разработать план улучшения.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.averageRating >= 4.5 && stats.totalSurveys > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Отличные результаты!
              </h3>
              <p className="text-sm text-green-700">
                Средняя оценка преподавателей составляет {stats.averageRating}{" "}
                баллов. Это говорит о высоком качестве преподавания.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.totalSurveys === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Нет данных для анализа
              </h3>
              <p className="text-sm text-blue-700">
                Пока нет проведенных опросов для анализа. Создайте периоды
                опросов и убедитесь, что студенты проходят оценку
                преподавателей.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
