// src/app/(dashboard)/academic-advisor/grades/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveTeachers, useActiveStudents } from "@/services/authService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { assignmentApi } from "@/services/assignmentService";
import {
  BarChart3,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  FileText,
  Download,
  Eye,
} from "lucide-react";

export default function AcademicAdvisorGradesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("overview");

  // Получение данных
  const { data: teachers = [] } = useActiveTeachers();
  const { data: students = [] } = useActiveStudents();

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getActiveSubjects,
  });

  const { data: gradingPeriods = [] } = useQuery({
    queryKey: ["grading-periods"],
    queryFn: gradingPeriodApi.getAllGradingPeriods,
  });

  const { data: finalGrades = [] } = useQuery({
    queryKey: ["final-grades", selectedPeriod],
    queryFn: () => {
      if (selectedPeriod !== "all") {
        return gradingPeriodApi.getFinalGradesByPeriod(selectedPeriod);
      }
      return Promise.resolve([]);
    },
    enabled: selectedPeriod !== "all",
  });

  // Демо-данные для отображения
  const demoGrades = [
    {
      id: "1",
      studentName: "Иванов Иван Иванович",
      groupName: "ИТ-21-1",
      subjectName: "Математический анализ",
      teacherName: "Петров П.П.",
      totalScore: 87,
      letterGrade: "отлично",
      assignments: [
        { name: "Контрольная работа 1", score: 85, maxScore: 100 },
        { name: "Лабораторная работа 1", score: 90, maxScore: 100 },
        { name: "Тест 1", score: 88, maxScore: 100 },
      ],
      attendance: 95,
    },
    {
      id: "2",
      studentName: "Петрова Анна Сергеевна",
      groupName: "ИТ-21-1",
      subjectName: "Программирование",
      teacherName: "Сидоров С.С.",
      totalScore: 92,
      letterGrade: "отлично",
      assignments: [
        { name: "Проект 1", score: 95, maxScore: 100 },
        { name: "Практическая работа 1", score: 88, maxScore: 100 },
        { name: "Экзамен", score: 93, maxScore: 100 },
      ],
      attendance: 98,
    },
    {
      id: "3",
      studentName: "Сидоров Петр Алексеевич",
      groupName: "ИТ-21-2",
      subjectName: "Базы данных",
      teacherName: "Козлова К.К.",
      totalScore: 74,
      letterGrade: "хорошо",
      assignments: [
        { name: "Курсовая работа", score: 78, maxScore: 100 },
        { name: "Лабораторная работа 2", score: 72, maxScore: 100 },
        { name: "Зачет", score: 76, maxScore: 100 },
      ],
      attendance: 85,
    },
  ];

  // Вычисляем статистику
  const stats = {
    totalStudents: students.length,
    studentsWithGrades: demoGrades.length,
    averageScore: Math.round(
      demoGrades.reduce((sum, grade) => sum + grade.totalScore, 0) /
        demoGrades.length
    ),
    excellentGrades: demoGrades.filter((g) => g.letterGrade === "отлично")
      .length,
    goodGrades: demoGrades.filter((g) => g.letterGrade === "хорошо").length,
    satisfactoryGrades: demoGrades.filter(
      (g) => g.letterGrade === "удовлетворительно"
    ).length,
    unsatisfactoryGrades: demoGrades.filter(
      (g) => g.letterGrade === "неудовлетворительно"
    ).length,
  };

  // Фильтрация данных
  const filteredGrades = demoGrades.filter((grade) => {
    if (selectedGroup !== "all" && grade.groupName !== selectedGroup)
      return false;
    if (selectedSubject !== "all" && grade.subjectName !== selectedSubject)
      return false;
    if (selectedTeacher !== "all" && grade.teacherName !== selectedTeacher)
      return false;
    return true;
  });

  const getGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case "отлично":
        return "bg-green-100 text-green-800";
      case "хорошо":
        return "bg-blue-100 text-blue-800";
      case "удовлетворительно":
        return "bg-yellow-100 text-yellow-800";
      case "неудовлетворительно":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportGrades = () => {
    console.log("Экспорт оценок");
    // Здесь будет логика экспорта
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Просмотр оценок
        </h1>
        <p className="text-gray-600">
          Мониторинг и анализ успеваемости студентов
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Студентов с оценками
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.studentsWithGrades}
              </p>
              <p className="text-xs text-gray-500">
                из {stats.totalStudents} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Средний балл</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageScore}
              </p>
              <div className="flex items-center text-green-600 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Отличников</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.excellentGrades}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round(
                  (stats.excellentGrades / stats.studentsWithGrades) * 100
                )}
                % от всех
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Качество знаний
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  ((stats.excellentGrades + stats.goodGrades) /
                    stats.studentsWithGrades) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-gray-500">Отлично + Хорошо</p>
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
              <option value="analytics">Аналитика</option>
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
                <option key={group.$id} value={group.title}>
                  {group.title}
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

          <div className="flex items-end">
            <button
              onClick={exportGrades}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.excellentGrades}
            </div>
            <div className="text-sm text-green-800">Отлично</div>
            <div className="text-xs text-gray-600">
              {Math.round(
                (stats.excellentGrades / stats.studentsWithGrades) * 100
              )}
              %
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.goodGrades}
            </div>
            <div className="text-sm text-blue-800">Хорошо</div>
            <div className="text-xs text-gray-600">
              {Math.round((stats.goodGrades / stats.studentsWithGrades) * 100)}%
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.satisfactoryGrades}
            </div>
            <div className="text-sm text-yellow-800">Удовлетворительно</div>
            <div className="text-xs text-gray-600">
              {Math.round(
                (stats.satisfactoryGrades / stats.studentsWithGrades) * 100
              )}
              %
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.unsatisfactoryGrades}
            </div>
            <div className="text-sm text-red-800">Неудовлетворительно</div>
            <div className="text-xs text-gray-600">
              {Math.round(
                (stats.unsatisfactoryGrades / stats.studentsWithGrades) * 100
              )}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Список оценок */}
      {viewMode === "overview" && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Список оценок ({filteredGrades.length})
            </h3>

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
                      Преподаватель
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Балл
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Оценка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Посещаемость
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grade.groupName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grade.subjectName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grade.teacherName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {grade.totalScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${getGradeColor(
                            grade.letterGrade
                          )}`}
                        >
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {grade.attendance}%
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
          {filteredGrades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white rounded-lg shadow border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {grade.studentName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {grade.groupName} • {grade.subjectName} •{" "}
                    {grade.teacherName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {grade.totalScore}
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${getGradeColor(
                      grade.letterGrade
                    )}`}
                  >
                    {grade.letterGrade}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Результаты заданий
                  </h4>
                  <div className="space-y-2">
                    {grade.assignments.map((assignment, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {assignment.name}
                        </span>
                        <span className="font-medium">
                          {assignment.score}/{assignment.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Дополнительная информация
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Посещаемость:
                      </span>
                      <span className="font-medium">{grade.attendance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Среднее за задания:
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          grade.assignments.reduce(
                            (sum, a) => sum + (a.score / a.maxScore) * 100,
                            0
                          ) / grade.assignments.length
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Аналитика */}
      {viewMode === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика по группам
            </h3>
            <div className="space-y-4">
              {["ИТ-21-1", "ИТ-21-2"].map((groupName) => {
                const groupGrades = filteredGrades.filter(
                  (g) => g.groupName === groupName
                );
                const avg =
                  groupGrades.length > 0
                    ? Math.round(
                        groupGrades.reduce((sum, g) => sum + g.totalScore, 0) /
                          groupGrades.length
                      )
                    : 0;

                return (
                  <div
                    key={groupName}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">{groupName}</div>
                      <div className="text-sm text-gray-600">
                        {groupGrades.length} студентов
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{avg}</div>
                      <div className="text-sm text-gray-500">Средний балл</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика по дисциплинам
            </h3>
            <div className="space-y-4">
              {["Математический анализ", "Программирование", "Базы данных"].map(
                (subjectName) => {
                  const subjectGrades = filteredGrades.filter(
                    (g) => g.subjectName === subjectName
                  );
                  const avg =
                    subjectGrades.length > 0
                      ? Math.round(
                          subjectGrades.reduce(
                            (sum, g) => sum + g.totalScore,
                            0
                          ) / subjectGrades.length
                        )
                      : 0;

                  return (
                    <div
                      key={subjectName}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{subjectName}</div>
                        <div className="text-sm text-gray-600">
                          {subjectGrades.length} оценок
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{avg}</div>
                        <div className="text-sm text-gray-500">
                          Средний балл
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
