// src/app/(dashboard)/academic-advisor/reports/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveStudents, useActiveTeachers } from "@/services/authService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
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
} from "lucide-react";

export default function AcademicAdvisorReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("semester");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Получение данных
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

  // Демо-данные для отчетов
  const reportData = {
    overview: {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalGroups: groups.length,
      totalSubjects: subjects.length,
      activeAssignments: 15,
      completedAssignments: 8,
      averageGrade: 4.2,
      averageAttendance: 87.5,
      surveyResponseRate: 85.3,
      studentsWithGrades: 45,
      teachersRated: 12,
    },
    performance: {
      gradeDistribution: [
        { grade: "Отлично", count: 18, percentage: 40 },
        { grade: "Хорошо", count: 15, percentage: 33 },
        { grade: "Удовлетворительно", count: 10, percentage: 22 },
        { grade: "Неудовлетворительно", count: 2, percentage: 5 },
      ],
      topPerformers: [
        { name: "Иванов И.И.", group: "ИТ-21-1", avgGrade: 4.8 },
        { name: "Петрова А.С.", group: "ИТ-21-1", avgGrade: 4.7 },
        { name: "Сидоров П.А.", group: "ИТ-21-2", avgGrade: 4.6 },
      ],
      strugglingStudents: [
        {
          name: "Козлов А.В.",
          group: "ИТ-21-1",
          avgGrade: 3.2,
          issues: ["Низкие оценки", "Плохая посещаемость"],
        },
        {
          name: "Федоров В.В.",
          group: "ИТ-21-2",
          avgGrade: 3.4,
          issues: ["Пропуски занятий"],
        },
      ],
      subjectPerformance: [
        { subject: "Математический анализ", avgGrade: 4.1, students: 25 },
        { subject: "Программирование", avgGrade: 4.5, students: 23 },
        { subject: "Базы данных", avgGrade: 3.9, students: 22 },
      ],
    },
    attendance: {
      overall: 87.5,
      byGroup: [
        { group: "ИТ-21-1", attendance: 89.2, students: 25 },
        { group: "ИТ-21-2", attendance: 85.8, students: 22 },
      ],
      bySubject: [
        { subject: "Математический анализ", attendance: 88.5 },
        { subject: "Программирование", attendance: 91.2 },
        { subject: "Базы данных", attendance: 83.7 },
      ],
      trends: {
        thisMonth: 87.5,
        lastMonth: 85.2,
        change: 2.3,
      },
    },
    teachers: {
      ratings: [
        {
          name: "Петров П.П.",
          subject: "Математический анализ",
          rating: 4.2,
          responses: 23,
        },
        {
          name: "Сидоров С.С.",
          subject: "Программирование",
          rating: 4.7,
          responses: 22,
        },
        {
          name: "Козлова К.К.",
          subject: "Базы данных",
          rating: 3.8,
          responses: 20,
        },
      ],
      workload: [
        { name: "Петров П.П.", groups: 2, students: 47, subjects: 1 },
        { name: "Сидоров С.С.", groups: 1, students: 25, subjects: 1 },
        { name: "Козлова К.К.", groups: 1, students: 22, subjects: 1 },
      ],
    },
  };

  const reportTypes = [
    { id: "overview", label: "Общий обзор", icon: BarChart3 },
    { id: "performance", label: "Успеваемость", icon: Award },
    { id: "attendance", label: "Посещаемость", icon: Calendar },
    { id: "teachers", label: "Преподаватели", icon: Users },
    { id: "comparative", label: "Сравнительный", icon: TrendingUp },
  ];

  const generateReport = () => {
    console.log(`Генерация отчета: ${selectedReport}`);
    // Здесь будет логика генерации отчета
  };

  const exportReport = (format: string) => {
    console.log(`Экспорт отчета в формате: ${format}`);
    // Здесь будет логика экспорта
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
                <option key={group.$id} value={group.title}>
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
                  <p className="text-xs text-gray-500">активных</p>
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
                  <p className="text-xs text-gray-500">с назначениями</p>
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
                    Средний балл
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.overview.averageGrade}
                  </p>
                  <p className="text-xs text-gray-500">из 5.0</p>
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
                  <span className="text-sm text-gray-600">
                    Отклик на опросы:
                  </span>
                  <span className="font-bold text-green-600">
                    {reportData.overview.surveyResponseRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Студентов с оценками:
                  </span>
                  <span className="font-bold text-blue-600">
                    {reportData.overview.studentsWithGrades}
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
                      style={{ width: "65%" }}
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
                      style={{ width: "35%" }}
                    ></div>
                  </div>
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
            {/* Распределение оценок */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Распределение оценок
              </h3>
              <div className="space-y-3">
                {reportData.performance.gradeDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{item.grade}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index === 0
                              ? "bg-green-500"
                              : index === 1
                              ? "bg-blue-500"
                              : index === 2
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">
                        {item.count}
                      </span>
                      <span className="text-xs text-gray-500 w-8">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Успеваемость по дисциплинам */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Успеваемость по дисциплинам
              </h3>
              <div className="space-y-4">
                {reportData.performance.subjectPerformance.map(
                  (subject, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {subject.subject}
                        </div>
                        <div className="text-sm text-gray-600">
                          {subject.students} студентов
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${getGradeColor(
                          subject.avgGrade
                        )}`}
                      >
                        {subject.avgGrade}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Топ студенты и проблемные случаи */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Лучшие студенты
              </h3>
              <div className="space-y-3">
                {reportData.performance.topPerformers.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.group}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {student.avgGrade}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Требуют внимания
              </h3>
              <div className="space-y-3">
                {reportData.performance.strugglingStudents.map(
                  (student, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {student.group}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-red-600">
                          {student.avgGrade}
                        </div>
                      </div>
                      <div className="text-xs text-red-700">
                        {student.issues.join(", ")}
                      </div>
                    </div>
                  )
                )}
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
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                По группам
              </h3>
              <div className="space-y-3">
                {reportData.attendance.byGroup.map((group, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-700">{group.group}</span>
                    <span
                      className={`font-medium ${getAttendanceColor(
                        group.attendance
                      )}`}
                    >
                      {group.attendance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                По дисциплинам
              </h3>
              <div className="space-y-3">
                {reportData.attendance.bySubject.map((subject, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-700">
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Отчет по преподавателям */}
      {selectedReport === "teachers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Рейтинги преподавателей
              </h3>
              <div className="space-y-3">
                {reportData.teachers.ratings.map((teacher, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {teacher.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {teacher.subject}
                      </div>
                      <div className="text-xs text-gray-500">
                        {teacher.responses} ответов
                      </div>
                    </div>
                    <div
                      className={`text-lg font-bold ${getGradeColor(
                        teacher.rating
                      )}`}
                    >
                      {teacher.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Нагрузка преподавателей
              </h3>
              <div className="space-y-3">
                {reportData.teachers.workload.map((teacher, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-900 mb-2">
                      {teacher.name}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Групп:</span>
                        <span className="font-medium ml-1">
                          {teacher.groups}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Студентов:</span>
                        <span className="font-medium ml-1">
                          {teacher.students}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Предметов:</span>
                        <span className="font-medium ml-1">
                          {teacher.subjects}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Экспорт отчетов */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Экспорт отчетов
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportReport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF отчет
          </button>
          <button
            onClick={() => exportReport("excel")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel таблица
          </button>
          <button
            onClick={() => exportReport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV файл
          </button>
        </div>
      </div>

      {/* Рекомендации */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
              <li>• Работа со студентами с низкой успеваемостью</li>
              <li>• Повышение посещаемости дисциплин с низкими показателями</li>
              <li>
                • Методическая поддержка преподавателей с рейтингом ниже 4.0
              </li>
              <li>• Увеличение отклика на опросы в некоторых группах</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Положительные тренды:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Рост общей посещаемости на 2.3%</li>
              <li>• Высокие рейтинги большинства преподавателей</li>
              <li>• Активное участие студентов в опросах</li>
              <li>• Стабильная успеваемость по ключевым дисциплинам</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
