// src/app/(dashboard)/teacher/grades/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { assignmentApi } from "@/services/assignmentService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import {
  Assignment,
  Group,
  Subject,
  User,
  AssignmentSubmission,
  getLetterGrade,
  getLetterGradeColor,
} from "@/types";
import { formatLocalDate } from "@/utils/dateUtils";
import { toast } from "react-toastify";
import {
  BarChart3,
  Users,
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  Star,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function TeacherGradesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"current" | "final">("current");
  const [editingGrades, setEditingGrades] = useState<
    Record<string, { score: number; letterGrade: string }>
  >({});

  // Получаем назначения преподавателя
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () =>
      teacherAssignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем активные периоды оценок
  const { data: gradingPeriods = [] } = useQuery({
    queryKey: ["active-grading-periods"],
    queryFn: gradingPeriodApi.getActiveGradingPeriods,
  });

  // Получаем текущий активный период
  const activePeriod = gradingPeriods.find((p) => p.isActive);

  // Получаем задания преподавателя
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments-list", user?.$id],
    queryFn: () => assignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем все ответы на задания преподавателя
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ["teacher-all-submissions", assignments.map((a) => a.$id)],
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

  // Получаем финальные оценки преподавателя
  const { data: finalGrades = [] } = useQuery({
    queryKey: ["teacher-final-grades", user?.$id, selectedPeriod],
    queryFn: () => gradingPeriodApi.getFinalGradesByTeacher(user?.$id || ""),
    enabled: !!user?.$id && viewMode === "final",
  });

  // Получаем дополнительные данные
  const { data: allSubjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: allGroups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => userApi.getUsersByRole("STUDENT" as any),
  });

  // Мутация для сохранения финальных оценок
  const saveFinalGradeMutation = useMutation({
    mutationFn: (data: {
      studentId: string;
      subjectId: string;
      groupId: string;
      totalScore: number;
      letterGrade: string;
    }) => {
      if (!activePeriod) throw new Error("Нет активного периода оценок");

      return gradingPeriodApi.upsertFinalGrade({
        studentId: data.studentId,
        subjectId: data.subjectId,
        groupId: data.groupId,
        teacherId: user?.$id || "",
        gradingPeriodId: activePeriod.$id,
        totalScore: data.totalScore,
        letterGrade: data.letterGrade,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-final-grades"] });
      toast.success("Финальная оценка сохранена!");
    },
    onError: (error) => {
      toast.error(`Ошибка при сохранении оценки: ${error.message}`);
    },
  });

  // Создаем карты для быстрого доступа
  const assignmentsMap = React.useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      acc[assignment.$id] = assignment;
      return acc;
    }, {} as Record<string, Assignment>);
  }, [assignments]);

  const subjectsMap = React.useMemo(() => {
    return allSubjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [allSubjects]);

  const groupsMap = React.useMemo(() => {
    return allGroups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, Group>);
  }, [allGroups]);

  const studentsMap = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.$id] = student;
      return acc;
    }, {} as Record<string, User>);
  }, [students]);

  // Получаем уникальные дисциплины и группы преподавателя
  const teacherSubjects = React.useMemo(() => {
    const subjectIds = new Set(teacherAssignments.map((a) => a.subjectId));
    return Array.from(subjectIds)
      .map((id) => subjectsMap[id])
      .filter(Boolean);
  }, [teacherAssignments, subjectsMap]);

  const teacherGroups = React.useMemo(() => {
    const groupIds = new Set(teacherAssignments.map((a) => a.groupId));
    return Array.from(groupIds)
      .map((id) => groupsMap[id])
      .filter(Boolean);
  }, [teacherAssignments, groupsMap]);

  // Фильтрация ответов для текущих оценок
  const filteredSubmissions = React.useMemo(() => {
    return allSubmissions.filter((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      const student = studentsMap[submission.studentId];

      if (!assignment || !student || !submission.isChecked) return false;

      // Фильтр по дисциплине
      if (
        selectedSubject !== "all" &&
        assignment.subjectId !== selectedSubject
      ) {
        return false;
      }

      // Фильтр по группе
      if (selectedGroup !== "all" && assignment.groupId !== selectedGroup) {
        return false;
      }

      // Поиск по имени студента
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!student.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [
    allSubmissions,
    selectedSubject,
    selectedGroup,
    searchTerm,
    assignmentsMap,
    studentsMap,
  ]);

  // Группировка оценок по студентам для текущих оценок
  const studentGrades = React.useMemo(() => {
    const gradesMap = new Map<
      string,
      {
        student: User;
        grades: Array<{
          assignment: Assignment;
          submission: AssignmentSubmission;
          subject: Subject;
          group: Group;
        }>;
        totalScore: number;
        maxScore: number;
        averagePercentage: number;
      }
    >();

    filteredSubmissions.forEach((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      const student = studentsMap[submission.studentId];
      const subject = subjectsMap[assignment?.subjectId];
      const group = groupsMap[assignment?.groupId];

      if (!assignment || !student || !subject || !group) return;

      if (!gradesMap.has(student.$id)) {
        gradesMap.set(student.$id, {
          student,
          grades: [],
          totalScore: 0,
          maxScore: 0,
          averagePercentage: 0,
        });
      }

      const studentData = gradesMap.get(student.$id)!;
      studentData.grades.push({
        assignment,
        submission,
        subject,
        group,
      });
      studentData.totalScore += submission.score || 0;
      studentData.maxScore += assignment.maxScore;
    });

    // Вычисляем средний процент
    gradesMap.forEach((studentData) => {
      if (studentData.maxScore > 0) {
        studentData.averagePercentage =
          (studentData.totalScore / studentData.maxScore) * 100;
      }
    });

    return Array.from(gradesMap.values()).sort(
      (a, b) => b.averagePercentage - a.averagePercentage
    );
  }, [
    filteredSubmissions,
    assignmentsMap,
    studentsMap,
    subjectsMap,
    groupsMap,
  ]);

  // Данные для финальных оценок
  const finalGradesData = React.useMemo(() => {
    if (viewMode !== "final") return [];

    // Группируем данные по комбинациям студент + предмет + группа
    const combinations = teacherAssignments
      .map((assignment) => {
        const subject = subjectsMap[assignment.subjectId];
        const group = groupsMap[assignment.groupId];

        if (!subject || !group || !group.studentIds) return null;

        return group.studentIds
          .map((studentId) => {
            const student = studentsMap[studentId];
            if (!student) return null;

            // Находим существующую финальную оценку
            const existingGrade = finalGrades.find(
              (fg) =>
                fg.studentId === studentId &&
                fg.subjectId === assignment.subjectId &&
                fg.groupId === assignment.groupId
            );

            // Вычисляем текущие баллы студента по данному предмету
            const studentSubmissions = allSubmissions.filter((sub) => {
              const assignment = assignmentsMap[sub.assignmentId];
              return (
                assignment &&
                assignment.subjectId === assignment.subjectId &&
                assignment.groupId === assignment.groupId &&
                sub.studentId === studentId &&
                sub.isChecked
              );
            });

            const totalScore = studentSubmissions.reduce(
              (sum, sub) => sum + (sub.score || 0),
              0
            );
            const maxScore = studentSubmissions.reduce((sum, sub) => {
              const assignment = assignmentsMap[sub.assignmentId];
              return sum + (assignment?.maxScore || 0);
            }, 0);

            const currentPercentage =
              maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
            const currentLetterGrade = getLetterGrade(currentPercentage);

            const key = `${studentId}-${assignment.subjectId}-${assignment.groupId}`;
            const editing = editingGrades[key];

            return {
              key,
              student,
              subject,
              group,
              currentScore: totalScore,
              currentLetterGrade,
              finalScore:
                editing?.score ?? existingGrade?.totalScore ?? totalScore,
              finalLetterGrade:
                editing?.letterGrade ??
                existingGrade?.letterGrade ??
                currentLetterGrade,
              hasExistingGrade: !!existingGrade,
              isEditing: !!editing,
            };
          })
          .filter(Boolean);
      })
      .flat()
      .filter(Boolean);

    return combinations.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t!.key === item!.key)
    ) as NonNullable<(typeof combinations)[0]>[];
  }, [
    teacherAssignments,
    subjectsMap,
    groupsMap,
    studentsMap,
    finalGrades,
    allSubmissions,
    assignmentsMap,
    editingGrades,
    viewMode,
  ]);

  // Статистика
  const stats = React.useMemo(() => {
    if (viewMode === "final") {
      const totalCombinations = finalGradesData.length;
      const gradedCombinations = finalGradesData.filter(
        (item) => item.hasExistingGrade
      ).length;
      const averageScore =
        finalGradesData.reduce((sum, item) => sum + item.finalScore, 0) /
          totalCombinations || 0;
      const excellentCount = finalGradesData.filter(
        (item) => item.finalLetterGrade === "отлично"
      ).length;

      return {
        totalStudents: new Set(finalGradesData.map((item) => item.student.$id))
          .size,
        totalGrades: totalCombinations,
        gradedCount: gradedCombinations,
        averagePercentage: Math.round(averageScore),
        excellentCount,
      };
    } else {
      const checkedSubmissions = allSubmissions.filter((s) => s.isChecked);
      const totalScore = checkedSubmissions.reduce(
        (sum, s) => sum + (s.score || 0),
        0
      );
      const maxPossibleScore = checkedSubmissions.reduce((sum, s) => {
        const assignment = assignmentsMap[s.assignmentId];
        return sum + (assignment?.maxScore || 0);
      }, 0);

      const averagePercentage =
        maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      const excellentCount = checkedSubmissions.filter((s) => {
        const assignment = assignmentsMap[s.assignmentId];
        const percentage = assignment
          ? ((s.score || 0) / assignment.maxScore) * 100
          : 0;
        return percentage >= 87;
      }).length;

      return {
        totalStudents: new Set(filteredSubmissions.map((s) => s.studentId))
          .size,
        totalGrades: checkedSubmissions.length,
        gradedCount: checkedSubmissions.length,
        averagePercentage: Math.round(averagePercentage),
        excellentCount,
      };
    }
  }, [
    viewMode,
    finalGradesData,
    allSubmissions,
    filteredSubmissions,
    assignmentsMap,
  ]);

  const handleEditGrade = (key: string, score: number) => {
    const letterGrade = getLetterGrade(score);
    setEditingGrades((prev) => ({
      ...prev,
      [key]: { score, letterGrade },
    }));
  };

  const handleSaveGrade = (item: (typeof finalGradesData)[0]) => {
    const editing = editingGrades[item.key];
    if (!editing) return;

    saveFinalGradeMutation.mutate({
      studentId: item.student.$id,
      subjectId: item.subject.$id,
      groupId: item.group.$id,
      totalScore: editing.score,
      letterGrade: editing.letterGrade,
    });

    // Убираем из редактирования
    setEditingGrades((prev) => {
      const newState = { ...prev };
      delete newState[item.key];
      return newState;
    });
  };

  const handleCancelEdit = (key: string) => {
    setEditingGrades((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Оценки студентов
            </h1>
            <p className="text-gray-600">
              Просматривайте и управляйте оценками студентов по вашим
              дисциплинам
            </p>
          </div>

          {/* Переключатель режимов */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("current")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === "current"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Текущие оценки
            </button>
            <button
              onClick={() => setViewMode("final")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === "final"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Финальные оценки
            </button>
          </div>
        </div>

        {/* Информация о периоде */}
        {viewMode === "final" && (
          <div className="mb-4">
            {activePeriod ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">
                      {activePeriod.title}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Период: {formatLocalDate(activePeriod.startDate)} -{" "}
                      {formatLocalDate(activePeriod.endDate)}
                    </p>
                    {activePeriod.description && (
                      <p className="text-sm text-blue-600 mt-1">
                        {activePeriod.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-900">
                      Нет активного периода оценок
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Обратитесь к супер администратору для активации периода
                      выставления финальных оценок
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
              <FileText className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {viewMode === "final" ? "Всего позиций" : "Всего оценок"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalGrades}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Средний %</p>
              <p className={`text-2xl font-bold `}>
                {stats.averagePercentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Отличных</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.excellentCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск студента
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Имя студента..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
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
              {teacherSubjects.map((subject) => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все группы</option>
              {teacherGroups.map((group) => (
                <option key={group.$id} value={group.$id}>
                  {group.title}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              Экспорт
            </button>
          </div> */}
        </div>
      </div>

      {/* Контент в зависимости от режима */}
      {viewMode === "final" ? (
        /* Финальные оценки */
        activePeriod ? (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Финальные оценки - {activePeriod.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Выставите финальные оценки студентам по своим дисциплинам
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ФИО
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дисциплина
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Группа
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Баллы за дз
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Финальные баллы
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Оценка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finalGradesData
                    .filter((item) => {
                      if (
                        selectedSubject !== "all" &&
                        item.subject.$id !== selectedSubject
                      )
                        return false;
                      if (
                        selectedGroup !== "all" &&
                        item.group.$id !== selectedGroup
                      )
                        return false;
                      if (
                        searchTerm &&
                        !item.student.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                        return false;
                      return true;
                    })
                    .map((item) => (
                      <tr
                        key={item.key}
                        className={item.hasExistingGrade ? "bg-green-50" : ""}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-600 font-semibold text-sm">
                                {item.student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.subject.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.group.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full `}
                          >
                            {item.currentScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingGrades[item.key]?.score || ""}
                              onChange={(e) =>
                                handleEditGrade(
                                  item.key,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="0-100"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
                              {item.finalScore}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLetterGradeColor(
                              item.finalLetterGrade
                            )}`}
                          >
                            {item.finalLetterGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {item.isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveGrade(item)}
                                disabled={saveFinalGradeMutation.isPending}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancelEdit(item.key)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleEditGrade(item.key, item.finalScore)
                              }
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {finalGradesData.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Нет данных для выставления оценок
                </h3>
                <p className="text-gray-500">
                  Убедитесь, что у вас есть назначения групп и дисциплин
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Нет активного периода оценок
            </h3>
            <p className="text-gray-500">
              Обратитесь к супер администратору для активации периода
              выставления финальных оценок
            </p>
          </div>
        )
      ) : /* Текущие оценки */
      studentGrades.length > 0 ? (
        <div className="space-y-6">
          {studentGrades.map((studentData) => (
            <div
              key={studentData.student.$id}
              className="bg-white border rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {studentData.student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {studentData.student.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {studentData.student.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold `}>
                      {Math.round(studentData.averagePercentage)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {studentData.totalScore} из {studentData.maxScore} баллов
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentData.grades.map((grade) => (
                    <div
                      key={`${grade.assignment.$id}-${grade.submission.$id}`}
                      className={`p-4 border rounded-lg `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {grade.assignment.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="h-4 w-4" />
                          <span className="font-bold">
                            {grade.submission.score}/{grade.assignment.maxScore}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <BookOpen className="h-3 w-3" />
                        <span>{grade.subject.title}</span>
                        <span>•</span>
                        <span>{grade.group.title}</span>
                      </div>
                      {grade.submission.comment && (
                        <div className="mt-2 text-xs text-gray-600 italic">
                          {grade.submission.comment}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(
                          grade.submission.checkedAt ||
                            grade.submission.submittedAt
                        ).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Оценок не найдено
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedSubject !== "all" || selectedGroup !== "all"
              ? "Попробуйте изменить фильтры поиска"
              : "Проверьте работы студентов, чтобы увидеть оценки"}
          </p>
        </div>
      )}
    </div>
  );
}
