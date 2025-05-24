// src/app/(dashboard)/academic-advisor/grades/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveTeachers, useActiveStudents } from "@/services/authService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { assignmentApi } from "@/services/assignmentService";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
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
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

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

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments"],
    queryFn: assignmentApi.getAllAssignments,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      // Получаем все проверенные работы
      const allSubmissions = [];
      for (const assignment of assignments) {
        const assignmentSubmissions =
          await assignmentApi.getSubmissionsByAssignment(assignment.$id);
        allSubmissions.push(
          ...assignmentSubmissions.filter(
            (s) => s.isChecked && s.score !== null
          )
        );
      }
      return allSubmissions;
    },
    enabled: assignments.length > 0,
  });

  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: teacherAssignmentApi.getAllAssignments,
  });

  const { data: finalGrades = [] } = useQuery({
    queryKey: ["final-grades", selectedPeriod],
    queryFn: () => {
      if (selectedPeriod !== "all") {
        return gradingPeriodApi.getFinalGradesByPeriod(selectedPeriod);
      }
      return [];
    },
    enabled: selectedPeriod !== "all",
  });

  // Создание карт для быстрого доступа
  const teachersMap = React.useMemo(() => {
    return teachers.reduce((acc, teacher) => {
      acc[teacher.$id] = teacher;
      return acc;
    }, {} as Record<string, any>);
  }, [teachers]);

  const studentsMap = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.$id] = student;
      return acc;
    }, {} as Record<string, any>);
  }, [students]);

  const groupsMap = React.useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, any>);
  }, [groups]);

  const subjectsMap = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, any>);
  }, [subjects]);

  const assignmentsMap = React.useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      acc[assignment.$id] = assignment;
      return acc;
    }, {} as Record<string, any>);
  }, [assignments]);

  // Агрегированные данные оценок
  const gradesData = React.useMemo(() => {
    const studentGrades: Record<
      string,
      {
        studentId: string;
        studentName: string;
        groupId: string;
        groupName: string;
        subjectId: string;
        subjectName: string;
        teacherId: string;
        teacherName: string;
        assignments: any[];
        totalScore: number;
        averageScore: number;
        letterGrade: string;
      }
    > = {};

    // Группируем оценки по студентам, предметам и группам
    submissions.forEach((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      if (!assignment) return;

      const student = studentsMap[submission.studentId];
      const group = groupsMap[assignment.groupId];
      const subject = subjectsMap[assignment.subjectId];
      const teacher = teachersMap[assignment.teacherId];

      if (!student || !group || !subject || !teacher) return;

      const key = `${submission.studentId}-${assignment.subjectId}-${assignment.groupId}`;

      if (!studentGrades[key]) {
        studentGrades[key] = {
          studentId: submission.studentId,
          studentName: student.name,
          groupId: assignment.groupId,
          groupName: group.title,
          subjectId: assignment.subjectId,
          subjectName: subject.title,
          teacherId: assignment.teacherId,
          teacherName: teacher.name,
          assignments: [],
          totalScore: 0,
          averageScore: 0,
          letterGrade: "",
        };
      }

      studentGrades[key].assignments.push({
        assignmentId: assignment.$id,
        assignmentTitle: assignment.title,
        maxScore: assignment.maxScore,
        score: submission.score,
        percentage: ((submission.score ?? 0) / assignment.maxScore) * 100,
        submittedAt: submission.submittedAt,
        checkedAt: submission.checkedAt,
        comment: submission.comment,
      });
    });

    // Вычисляем средние оценки и буквенные оценки
    Object.values(studentGrades).forEach((studentData) => {
      if (studentData.assignments.length > 0) {
        const totalPercentage = studentData.assignments.reduce(
          (sum, assignment) => sum + assignment.percentage,
          0
        );
        studentData.averageScore =
          totalPercentage / studentData.assignments.length;
        studentData.totalScore = Math.round(studentData.averageScore);

        // Определяем буквенную оценку
        if (studentData.averageScore >= 87) {
          studentData.letterGrade = "отлично";
        } else if (studentData.averageScore >= 74) {
          studentData.letterGrade = "хорошо";
        } else if (studentData.averageScore >= 61) {
          studentData.letterGrade = "удовлетворительно";
        } else {
          studentData.letterGrade = "неудовлетворительно";
        }
      }
    });

    return Object.values(studentGrades);
  }, [
    submissions,
    assignmentsMap,
    studentsMap,
    groupsMap,
    subjectsMap,
    teachersMap,
  ]);

  // Вычисляем статистику
  const stats = React.useMemo(() => {
    const totalStudents = students.length;
    const studentsWithGrades = gradesData.length;
    const averageScore =
      gradesData.length > 0
        ? Math.round(
            gradesData.reduce((sum, grade) => sum + grade.averageScore, 0) /
              gradesData.length
          )
        : 0;

    const excellentGrades = gradesData.filter(
      (g) => g.letterGrade === "отлично"
    ).length;
    const goodGrades = gradesData.filter(
      (g) => g.letterGrade === "хорошо"
    ).length;
    const satisfactoryGrades = gradesData.filter(
      (g) => g.letterGrade === "удовлетворительно"
    ).length;
    const unsatisfactoryGrades = gradesData.filter(
      (g) => g.letterGrade === "неудовлетворительно"
    ).length;

    return {
      totalStudents,
      studentsWithGrades,
      averageScore,
      excellentGrades,
      goodGrades,
      satisfactoryGrades,
      unsatisfactoryGrades,
      totalAssignments: assignments.length,
      checkedSubmissions: submissions.length,
    };
  }, [students, gradesData, assignments, submissions]);

  // Фильтрация данных
  const filteredGrades = React.useMemo(() => {
    return gradesData.filter((grade) => {
      if (selectedGroup !== "all" && grade.groupId !== selectedGroup)
        return false;
      if (selectedSubject !== "all" && grade.subjectId !== selectedSubject)
        return false;
      if (selectedTeacher !== "all" && grade.teacherId !== selectedTeacher)
        return false;
      return true;
    });
  }, [gradesData, selectedGroup, selectedSubject, selectedTeacher]);

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
    try {
      const headers = [
        "Студент",
        "Группа",
        "Дисциплина",
        "Преподаватель",
        "Средний балл",
        "Оценка",
        "Количество заданий",
      ];

      const rows = filteredGrades.map((grade) => [
        grade.studentName,
        grade.groupName,
        grade.subjectName,
        grade.teacherName,
        grade.averageScore.toFixed(1),
        grade.letterGrade,
        grade.assignments.length.toString(),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `grades_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Отчет успешно экспортирован");
    } catch (error) {
      toast.error("Ошибка при экспорте отчета");
    }
  };

  const handleViewDetails = (grade: any) => {
    // Можно добавить логику для детального просмотра
    console.log("Просмотр деталей для:", grade);
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
                {stats.averageScore > 75 ? "Хорошо" : "Требует улучшения"}
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
                {stats.studentsWithGrades > 0
                  ? Math.round(
                      (stats.excellentGrades / stats.studentsWithGrades) * 100
                    )
                  : 0}
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
                {stats.studentsWithGrades > 0
                  ? Math.round(
                      ((stats.excellentGrades + stats.goodGrades) /
                        stats.studentsWithGrades) *
                        100
                    )
                  : 0}
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
                <option key={group.$id} value={group.$id}>
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
                <option key={subject.$id} value={subject.$id}>
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
                <option key={teacher.$id} value={teacher.$id}>
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
              {stats.studentsWithGrades > 0
                ? Math.round(
                    (stats.excellentGrades / stats.studentsWithGrades) * 100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.goodGrades}
            </div>
            <div className="text-sm text-blue-800">Хорошо</div>
            <div className="text-xs text-gray-600">
              {stats.studentsWithGrades > 0
                ? Math.round(
                    (stats.goodGrades / stats.studentsWithGrades) * 100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.satisfactoryGrades}
            </div>
            <div className="text-sm text-yellow-800">Удовлетворительно</div>
            <div className="text-xs text-gray-600">
              {stats.studentsWithGrades > 0
                ? Math.round(
                    (stats.satisfactoryGrades / stats.studentsWithGrades) * 100
                  )
                : 0}
              %
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.unsatisfactoryGrades}
            </div>
            <div className="text-sm text-red-800">Неудовлетворительно</div>
            <div className="text-xs text-gray-600">
              {stats.studentsWithGrades > 0
                ? Math.round(
                    (stats.unsatisfactoryGrades / stats.studentsWithGrades) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      {viewMode === "overview" && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Список оценок ({filteredGrades.length})
            </h3>

            {filteredGrades.length > 0 ? (
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
                        Заданий
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGrades.map((grade, index) => (
                      <tr
                        key={`${grade.studentId}-${grade.subjectId}-${grade.groupId}`}
                        className="hover:bg-gray-50"
                      >
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
                            {grade.averageScore.toFixed(1)}
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
                            {grade.assignments.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewDetails(grade)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Нет данных об оценках
                </h3>
                <p className="text-gray-500">
                  {stats.totalAssignments === 0
                    ? "Создайте задания и проверьте работы студентов для отображения оценок"
                    : "Нет проверенных работ для выбранных фильтров"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Детальный просмотр */}
      {viewMode === "detailed" && (
        <div className="space-y-6">
          {filteredGrades.map((grade, index) => (
            <div
              key={`${grade.studentId}-${grade.subjectId}-${grade.groupId}`}
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
                    {grade.averageScore.toFixed(1)}
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
                    {grade.assignments.map((assignment, idx) => (
                      <div
                        key={assignment.assignmentId}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {assignment.assignmentTitle}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">
                            {assignment.score}/{assignment.maxScore}
                          </div>
                          <div className="text-xs text-gray-500">
                            {assignment.percentage.toFixed(1)}%
                          </div>
                        </div>
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
                        Всего заданий:
                      </span>
                      <span className="font-medium">
                        {grade.assignments.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Средний балл:
                      </span>
                      <span className="font-medium">
                        {grade.averageScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Лучший результат:
                      </span>
                      <span className="font-medium text-green-600">
                        {grade.assignments.length > 0
                          ? Math.max(
                              ...grade.assignments.map((a) => a.percentage)
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Худший результат:
                      </span>
                      <span className="font-medium text-red-600">
                        {grade.assignments.length > 0
                          ? Math.min(
                              ...grade.assignments.map((a) => a.percentage)
                            ).toFixed(1)
                          : 0}
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
              {Array.from(new Set(filteredGrades.map((g) => g.groupId))).map(
                (groupId) => {
                  const group = groupsMap[groupId];
                  const groupGrades = filteredGrades.filter(
                    (g) => g.groupId === groupId
                  );
                  const avg =
                    groupGrades.length > 0
                      ? Math.round(
                          groupGrades.reduce(
                            (sum, g) => sum + g.averageScore,
                            0
                          ) / groupGrades.length
                        )
                      : 0;

                  return (
                    <div
                      key={groupId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {group?.title || "Неизвестная группа"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {groupGrades.length} студентов
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

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика по дисциплинам
            </h3>
            <div className="space-y-4">
              {Array.from(new Set(filteredGrades.map((g) => g.subjectId))).map(
                (subjectId) => {
                  const subject = subjectsMap[subjectId];
                  const subjectGrades = filteredGrades.filter(
                    (g) => g.subjectId === subjectId
                  );
                  const avg =
                    subjectGrades.length > 0
                      ? Math.round(
                          subjectGrades.reduce(
                            (sum, g) => sum + g.averageScore,
                            0
                          ) / subjectGrades.length
                        )
                      : 0;

                  return (
                    <div
                      key={subjectId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {subject?.title || "Неизвестная дисциплина"}
                        </div>
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

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика по преподавателям
            </h3>
            <div className="space-y-4">
              {Array.from(new Set(filteredGrades.map((g) => g.teacherId))).map(
                (teacherId) => {
                  const teacher = teachersMap[teacherId];
                  const teacherGrades = filteredGrades.filter(
                    (g) => g.teacherId === teacherId
                  );
                  const avg =
                    teacherGrades.length > 0
                      ? Math.round(
                          teacherGrades.reduce(
                            (sum, g) => sum + g.averageScore,
                            0
                          ) / teacherGrades.length
                        )
                      : 0;

                  return (
                    <div
                      key={teacherId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {teacher?.name || "Неизвестный преподаватель"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {teacherGrades.length} оценок
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

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Общая статистика
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-sm text-blue-700">Всего заданий:</span>
                <span className="font-medium text-blue-900">
                  {stats.totalAssignments}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-sm text-green-700">
                  Проверенных работ:
                </span>
                <span className="font-medium text-green-900">
                  {stats.checkedSubmissions}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-sm text-purple-700">
                  Активных преподавателей:
                </span>
                <span className="font-medium text-purple-900">
                  {teachers.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
                <span className="text-sm text-indigo-700">
                  Активных дисциплин:
                </span>
                <span className="font-medium text-indigo-900">
                  {subjects.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Информационные блоки */}
      {stats.studentsWithGrades === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Нет данных об оценках
              </h3>
              <p className="text-sm text-blue-700">
                {stats.totalAssignments === 0
                  ? "Пока не создано ни одного задания. Преподаватели должны создать задания для выставления оценок."
                  : "Задания созданы, но работы студентов еще не проверены. Попросите преподавателей проверить работы."}
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.unsatisfactoryGrades > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Студенты с неудовлетворительными оценками
              </h3>
              <p className="text-sm text-red-700">
                {stats.unsatisfactoryGrades} студентов имеют
                неудовлетворительные оценки. Рекомендуется принять меры для
                улучшения их успеваемости.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.averageScore >= 85 && stats.studentsWithGrades > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Отличные показатели успеваемости!
              </h3>
              <p className="text-sm text-green-700">
                Средний балл составляет {stats.averageScore}. Это говорит о
                высоком качестве обучения и мотивации студентов.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
