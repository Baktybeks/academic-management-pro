// src/app/(dashboard)/academic-advisor/survey-results/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveTeachers } from "@/services/authService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
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
} from "lucide-react";

export default function AcademicAdvisorSurveyResultsPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current");
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

  // Демо-данные для результатов опросов
  const demoSurveyResults = [
    {
      id: "1",
      teacherName: "Петров Петр Петрович",
      subjectName: "Математический анализ",
      groupNames: ["ИТ-21-1", "ИТ-21-2"],
      periodName: "Осенний семестр 2024",
      responseCount: 45,
      totalStudents: 50,
      responseRate: 90,
      averageRating: 4.2,
      questions: [
        { id: "q1", text: "Качество объяснения материала", rating: 4.3 },
        { id: "q2", text: "Организованность занятий", rating: 4.1 },
        { id: "q3", text: "Доступность для вопросов", rating: 4.5 },
        { id: "q4", text: "Практическая ценность занятий", rating: 4.0 },
        { id: "q5", text: "Общая оценка преподавателя", rating: 4.2 },
      ],
      trend: "up",
      previousRating: 3.9,
    },
    {
      id: "2",
      teacherName: "Сидоров Сидор Сидорович",
      subjectName: "Программирование",
      groupNames: ["ИТ-21-1"],
      periodName: "Осенний семестр 2024",
      responseCount: 23,
      totalStudents: 25,
      responseRate: 92,
      averageRating: 4.7,
      questions: [
        { id: "q1", text: "Качество объяснения материала", rating: 4.8 },
        { id: "q2", text: "Организованность занятий", rating: 4.6 },
        { id: "q3", text: "Доступность для вопросов", rating: 4.9 },
        { id: "q4", text: "Практическая ценность занятий", rating: 4.7 },
        { id: "q5", text: "Общая оценка преподавателя", rating: 4.5 },
      ],
      trend: "up",
      previousRating: 4.4,
    },
    {
      id: "3",
      teacherName: "Козлова Анна Анатольевна",
      subjectName: "Базы данных",
      groupNames: ["ИТ-21-2"],
      periodName: "Осенний семестр 2024",
      responseCount: 18,
      totalStudents: 22,
      responseRate: 82,
      averageRating: 3.8,
      questions: [
        { id: "q1", text: "Качество объяснения материала", rating: 3.7 },
        { id: "q2", text: "Организованность занятий", rating: 4.0 },
        { id: "q3", text: "Доступность для вопросов", rating: 3.6 },
        { id: "q4", text: "Практическая ценность занятий", rating: 3.9 },
        { id: "q5", text: "Общая оценка преподавателя", rating: 3.8 },
      ],
      trend: "down",
      previousRating: 4.1,
    },
  ];

  // Фильтрация данных
  const filteredResults = demoSurveyResults.filter((result) => {
    if (selectedTeacher !== "all" && result.teacherName !== selectedTeacher)
      return false;
    if (selectedSubject !== "all" && result.subjectName !== selectedSubject)
      return false;
    return true;
  });

  // Статистика
  const stats = {
    totalSurveys: filteredResults.length,
    averageRating:
      filteredResults.length > 0
        ? Math.round(
            (filteredResults.reduce((sum, r) => sum + r.averageRating, 0) /
              filteredResults.length) *
              10
          ) / 10
        : 0,
    totalResponses: filteredResults.reduce(
      (sum, r) => sum + r.responseCount,
      0
    ),
    averageResponseRate:
      filteredResults.length > 0
        ? Math.round(
            filteredResults.reduce((sum, r) => sum + r.responseRate, 0) /
              filteredResults.length
          )
        : 0,
    excellentRatings: filteredResults.filter((r) => r.averageRating >= 4.5)
      .length,
    goodRatings: filteredResults.filter(
      (r) => r.averageRating >= 4.0 && r.averageRating < 4.5
    ).length,
    needsImprovement: filteredResults.filter((r) => r.averageRating < 4.0)
      .length,
  };

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

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === "down") {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const exportResults = () => {
    console.log("Экспорт результатов опросов");
    // Здесь будет логика экспорта
  };

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
        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
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
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Режим просмотра
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все преподаватели</option>
              {teachers.map((teacher) => (
                <option key={teacher.$id} value={teacher.name}>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все дисциплины</option>
              {subjects.map((subject) => (
                <option key={subject.$id} value={subject.title}>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="current">Текущий семестр</option>
              <option value="previous">Предыдущий семестр</option>
              <option value="year">Весь год</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportResults}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </button>
          </div>
        </div>
      </div>

      {/* Распределение оценок */}
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
              {Math.round((stats.excellentRatings / stats.totalSurveys) * 100)}%
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
              {Math.round((stats.needsImprovement / stats.totalSurveys) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      {viewMode === "overview" && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Результаты опросов ({filteredResults.length})
            </h3>

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
                      Отклик
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Средняя оценка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тенденция
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.groupNames.join(", ")}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(
                            result.trend,
                            result.averageRating - result.previousRating
                          )}
                          <span
                            className={`text-sm ${
                              result.trend === "up"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {result.trend === "up" ? "+" : ""}
                            {(
                              result.averageRating - result.previousRating
                            ).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Детальный просмотр */}
      {viewMode === "detailed" && (
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.teacherName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result.subjectName} • {result.groupNames.join(", ")}
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
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {getTrendIcon(
                      result.trend,
                      result.averageRating - result.previousRating
                    )}
                    <span
                      className={`text-xs ${
                        result.trend === "up"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {result.trend === "up" ? "+" : ""}
                      {(result.averageRating - result.previousRating).toFixed(
                        1
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Детализация по вопросам
                  </h4>
                  <div className="space-y-3">
                    {result.questions.map((question) => (
                      <div
                        key={question.id}
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
                        Предыдущая оценка:
                      </span>
                      <span className="font-medium">
                        {result.previousRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Изменение:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          result.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {getTrendIcon(
                          result.trend,
                          result.averageRating - result.previousRating
                        )}
                        {result.trend === "up" ? "+" : ""}
                        {(result.averageRating - result.previousRating).toFixed(
                          1
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Сравнение */}
      {viewMode === "comparison" && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Сравнительный анализ
          </h3>

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
                      key={result.id}
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
                            {result.subjectName}
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
                          <span className="font-medium">{totalResponses}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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

      {stats.averageRating >= 4.5 && (
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
    </div>
  );
}
