// src/app/(dashboard)/student/grades/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { assignmentApi } from "@/services/assignmentService";
import { gradingPeriodApi } from "@/services/gradingPeriodService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { userApi } from "@/services/userService";
import {
  AssignmentSubmission,
  Assignment,
  Group,
  Subject,
  User,
  FinalGrade,
  getLetterGrade,
} from "@/types";
import {
  BarChart3,
  BookOpen,
  Users,
  UserIcon,
  Filter,
  Star,
  Calendar,
  FileText,
  TrendingUp,
  Award,
} from "lucide-react";

export default function StudentGradesPage() {
  const { user } = useAuthStore();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Получаем группы студента
  const { data: studentGroups = [] } = useQuery({
    queryKey: ["student-groups", user?.$id],
    queryFn: () => groupApi.getGroupsByStudentId(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем ответы студента на задания
  const { data: submissions = [] } = useQuery({
    queryKey: ["student-submissions", user?.$id],
    queryFn: () => assignmentApi.getSubmissionsByStudent(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем финальные оценки студента
  const { data: finalGrades = [] } = useQuery({
    queryKey: ["student-final-grades", user?.$id],
    queryFn: () => gradingPeriodApi.getFinalGradesByStudent(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем задания для оценок
  const { data: allAssignments = [] } = useQuery({
    queryKey: ["student-assignments", studentGroups.map((g) => g.$id)],
    queryFn: async () => {
      if (studentGroups.length === 0) return [];

      const assignmentPromises = studentGroups.map((group) =>
        assignmentApi.getAssignmentsByGroup(group.$id)
      );

      const assignmentArrays = await Promise.all(assignmentPromises);
      return assignmentArrays.flat();
    },
    enabled: studentGroups.length > 0,
  });

  // Получаем дисциплины, группы, преподавателей
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

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

  const assignmentsMap = React.useMemo(() => {
    return allAssignments.reduce((acc, assignment) => {
      acc[assignment.$id] = assignment;
      return acc;
    }, {} as Record<string, Assignment>);
  }, [allAssignments]);

  // Фильтрация оценок
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      if (!assignment) return false;

      if (
        selectedSubject !== "all" &&
        assignment.subjectId !== selectedSubject
      ) {
        return false;
      }

      if (selectedGroup !== "all" && assignment.groupId !== selectedGroup) {
        return false;
      }

      return submission.isChecked && submission.score !== undefined;
    });
  }, [submissions, selectedSubject, selectedGroup, assignmentsMap]);

  // Группировка оценок по дисциплинам
  const gradesBySubject = React.useMemo(() => {
    const groups: Record<
      string,
      {
        subject: Subject;
        submissions: AssignmentSubmission[];
        averageScore: number;
        totalScore: number;
        maxPossibleScore: number;
        letterGrade: string;
      }
    > = {};

    filteredSubmissions.forEach((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      if (!assignment) return;

      const subjectId = assignment.subjectId;
      const subject = subjectsMap[subjectId];
      if (!subject) return;

      if (!groups[subjectId]) {
        groups[subjectId] = {
          subject,
          submissions: [],
          averageScore: 0,
          totalScore: 0,
          maxPossibleScore: 0,
          letterGrade: "",
        };
      }

      groups[subjectId].submissions.push(submission);
      groups[subjectId].totalScore += submission.score || 0;
      groups[subjectId].maxPossibleScore += assignment.maxScore;
    });

    // Вычисляем средние оценки и буквенные оценки
    Object.values(groups).forEach((group) => {
      if (group.submissions.length > 0) {
        group.averageScore = Math.round(
          (group.totalScore / group.maxPossibleScore) * 100
        );
        group.letterGrade = getLetterGrade(group.averageScore);
      }
    });

    return groups;
  }, [filteredSubmissions, assignmentsMap, subjectsMap]);

  // Статистика оценок
  const gradesStats = React.useMemo(() => {
    const checkedSubmissions = submissions.filter(
      (s) => s.isChecked && s.score !== undefined
    );
    const totalSubmissions = submissions.length;
    const checkedCount = checkedSubmissions.length;

    const scores = checkedSubmissions.map((s) => s.score!);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    return {
      totalSubmissions,
      checkedCount,
      uncheckedCount: totalSubmissions - checkedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      maxScore,
      minScore,
    };
  }, [submissions]);

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 87) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 74) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 61)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSubjectGradeColor = (averageScore: number) => {
    if (averageScore >= 87) return "text-green-600";
    if (averageScore >= 74) return "text-blue-600";
    if (averageScore >= 61) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои оценки</h1>
        <p className="text-gray-600">
          Просматривайте свои оценки за контрольные задания и итоговые
          результаты
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Всего работ</p>
              <p className="text-xl font-bold text-gray-900">
                {gradesStats.totalSubmissions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Оценено</p>
              <p className="text-xl font-bold text-gray-900">
                {gradesStats.checkedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-indigo-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Средний балл</p>
              <p className="text-xl font-bold text-gray-900">
                {gradesStats.averageScore || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Лучший</p>
              <p className="text-xl font-bold text-gray-900">
                {gradesStats.maxScore || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Award className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Дисциплин</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.keys(gradesBySubject).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Группа
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              Показано: {filteredSubmissions.length} оценок
            </div>
          </div>
        </div>
      </div>

      {/* Оценки по дисциплинам */}
      {Object.keys(gradesBySubject).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Оценки по дисциплинам
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(gradesBySubject).map(([subjectId, data]) => (
              <div
                key={subjectId}
                className="bg-white border rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {data.subject.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Средний балл:</span>
                    <span
                      className={`text-lg font-bold ${getSubjectGradeColor(
                        data.averageScore
                      )}`}
                    >
                      {data.averageScore}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Оценка:</span>
                    <span
                      className={`text-sm font-medium ${getSubjectGradeColor(
                        data.averageScore
                      )}`}
                    >
                      {data.letterGrade}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Работ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {data.submissions.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Общий балл:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {data.totalScore}/{data.maxPossibleScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список всех оценок */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Все оценки</h2>

        {filteredSubmissions.length > 0 ? (
          <div className="bg-white rounded-lg shadow border">
            <div className="divide-y divide-gray-200">
              {filteredSubmissions
                .sort(
                  (a, b) =>
                    new Date(b.submittedAt).getTime() -
                    new Date(a.submittedAt).getTime()
                )
                .map((submission) => {
                  const assignment = assignmentsMap[submission.assignmentId];
                  const subject = subjectsMap[assignment?.subjectId];
                  const group = groupsMap[assignment?.groupId];
                  const teacher = teachersMap[assignment?.teacherId];

                  if (!assignment) return null;

                  return (
                    <div key={submission.$id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assignment.title}
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
                              {new Date(
                                submission.submittedAt
                              ).toLocaleDateString("ru-RU")}
                            </div>
                          </div>

                          {submission.comment && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Комментарий: </span>
                              {submission.comment}
                            </div>
                          )}
                        </div>

                        <div
                          className={`px-4 py-2 rounded-lg border ${getGradeColor(
                            submission.score!,
                            assignment.maxScore
                          )}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {submission.score}/{assignment.maxScore}
                            </div>
                            <div className="text-xs">
                              {Math.round(
                                (submission.score! / assignment.maxScore) * 100
                              )}
                              %
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Оценок не найдено
            </h3>
            <p className="text-gray-500">
              {selectedSubject !== "all" || selectedGroup !== "all"
                ? "Попробуйте изменить фильтры"
                : "Пока нет проверенных работ с оценками"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
