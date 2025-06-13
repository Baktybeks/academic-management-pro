// src/app/(dashboard)/teacher/submissions/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { assignmentApi } from "@/services/assignmentService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { userApi } from "@/services/userService";
import {
  Assignment,
  AssignmentSubmission,
  Group,
  Subject,
  User,
} from "@/types";
import { toast } from "react-toastify";
import {
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  User as UserIcon,
  Users,
  BookOpen,
  Filter,
  Search,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react";

export default function TeacherSubmissionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedAssignment, setSelectedAssignment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("unchecked");
  const [searchTerm, setSearchTerm] = useState("");
  const [gradingModal, setGradingModal] = useState<{
    submission: AssignmentSubmission;
    assignment: Assignment;
    student: User;
  } | null>(null);

  // Получаем задания преподавателя
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments", user?.$id],
    queryFn: () => assignmentApi.getAssignmentsByTeacher(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем все ответы на задания преподавателя
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ["teacher-submissions", teacherAssignments.map((a) => a.$id)],
    queryFn: async () => {
      if (teacherAssignments.length === 0) return [];

      const submissionPromises = teacherAssignments.map((assignment) =>
        assignmentApi.getSubmissionsByAssignment(assignment.$id)
      );

      const submissionArrays = await Promise.all(submissionPromises);
      return submissionArrays.flat();
    },
    enabled: teacherAssignments.length > 0,
  });

  // Получаем дисциплины и группы
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getAllGroups,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => userApi.getUsersByRole("STUDENT" as any),
  });

  // Мутация для оценки работы
  const gradeMutation = useMutation({
    mutationFn: ({
      submissionId,
      score,
      comment,
    }: {
      submissionId: string;
      score: number;
      comment?: string;
    }) =>
      assignmentApi.gradeSubmission(
        { submissionId, score, comment },
        user?.$id || ""
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-submissions"] });
      setGradingModal(null);
      toast.success("Работа успешно оценена!");
    },
    onError: (error) => {
      toast.error(`Ошибка при оценке работы: ${error.message}`);
    },
  });

  // Создаем карты для быстрого доступа
  const assignmentsMap = React.useMemo(() => {
    return teacherAssignments.reduce((acc, assignment) => {
      acc[assignment.$id] = assignment;
      return acc;
    }, {} as Record<string, Assignment>);
  }, [teacherAssignments]);

  const subjectsMap = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject.$id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [subjects]);

  const groupsMap = React.useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group.$id] = group;
      return acc;
    }, {} as Record<string, Group>);
  }, [groups]);

  const studentsMap = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.$id] = student;
      return acc;
    }, {} as Record<string, User>);
  }, [students]);

  // Фильтрация работ
  const filteredSubmissions = React.useMemo(() => {
    return allSubmissions.filter((submission) => {
      const assignment = assignmentsMap[submission.assignmentId];
      const student = studentsMap[submission.studentId];

      if (!assignment || !student) return false;

      // Фильтр по заданию
      if (
        selectedAssignment !== "all" &&
        submission.assignmentId !== selectedAssignment
      ) {
        return false;
      }

      // Фильтр по статусу
      if (filterStatus === "checked" && !submission.isChecked) return false;
      if (filterStatus === "unchecked" && submission.isChecked) return false;

      // Поиск по имени студента или названию задания
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const studentMatch = student.name.toLowerCase().includes(searchLower);
        const assignmentMatch = assignment.title
          .toLowerCase()
          .includes(searchLower);
        if (!studentMatch && !assignmentMatch) return false;
      }

      return true;
    });
  }, [
    allSubmissions,
    selectedAssignment,
    filterStatus,
    searchTerm,
    assignmentsMap,
    studentsMap,
  ]);

  // Сортировка: непроверенные сверху
  const sortedSubmissions = React.useMemo(() => {
    return [...filteredSubmissions].sort((a, b) => {
      // Сначала непроверенные
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      // Потом по дате отправки (новые сверху)
      return (
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    });
  }, [filteredSubmissions]);

  const handleGradeSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gradingModal) return;

    const formData = new FormData(e.currentTarget);
    const score = parseInt(formData.get("score") as string);
    const comment = formData.get("comment") as string;

    if (isNaN(score) || score < 0 || score > gradingModal.assignment.maxScore) {
      toast.error(
        `Балл должен быть от 0 до ${gradingModal.assignment.maxScore}`
      );
      return;
    }

    gradeMutation.mutate({
      submissionId: gradingModal.submission.$id,
      score,
      comment: comment.trim() || undefined,
    });
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 87) return "text-green-600 bg-green-50";
    if (percentage >= 74) return "text-blue-600 bg-blue-50";
    if (percentage >= 61) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getGradeLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 87) return "Отлично";
    if (percentage >= 74) return "Хорошо";
    if (percentage >= 61) return "Удовлетворительно";
    return "Неудовлетворительно";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Проверка работ студентов
        </h1>
        <p className="text-gray-600">
          Просматривайте и оценивайте работы студентов
        </p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border-[6699FF]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Студент или задание..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Задание
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все задания</option>
              {teacherAssignments.map((assignment) => (
                <option key={assignment.$id} value={assignment.$id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все</option>
              <option value="unchecked">Непроверенные</option>
              <option value="checked">Проверенные</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Найдено: {sortedSubmissions.length} работ
            </div>
          </div>
        </div>
      </div>

      {/* Список работ */}
      {sortedSubmissions.length > 0 ? (
        <div className="space-y-4">
          {sortedSubmissions.map((submission) => {
            const assignment = assignmentsMap[submission.assignmentId];
            const student = studentsMap[submission.studentId];
            const subject = subjectsMap[assignment?.subjectId];
            const group = groupsMap[assignment?.groupId];

            if (!assignment || !student) return null;

            return (
              <div
                key={submission.$id}
                className={`bg-white border-[6699FF] rounded-lg shadow-sm ${
                  !submission.isChecked ? "border-l-4 border-l-orange-400" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        {submission.isChecked ? (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getGradeColor(
                              submission.score || 0,
                              assignment.maxScore
                            )}`}
                          >
                            {submission.score}/{assignment.maxScore} -{" "}
                            {getGradeLabel(
                              submission.score || 0,
                              assignment.maxScore
                            )}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full text-orange-600 bg-orange-50">
                            Требует проверки
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          {student.name}
                        </div>
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
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(submission.submittedAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">
                        {assignment.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Открыть работу студента
                        </a>

                        <span className="text-sm text-gray-500">
                          Макс. балл: {assignment.maxScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Комментарий преподавателя (если есть) */}
                  {submission.isChecked && submission.comment && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Ваш комментарий:
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {submission.comment}
                      </p>
                    </div>
                  )}

                  {/* Действия */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setGradingModal({
                          submission,
                          assignment,
                          student,
                        })
                      }
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {submission.isChecked ? "Переоценить" : "Оценить"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border-[6699FF]">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Работ не найдено
          </h3>
          <p className="text-gray-500">
            {searchTerm ||
            selectedAssignment !== "all" ||
            filterStatus !== "all"
              ? "Попробуйте изменить фильтры поиска"
              : "Студенты пока не отправили работы"}
          </p>
        </div>
      )}

      {/* Модальное окно оценки */}
      {gradingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <form onSubmit={handleGradeSubmission}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Оценить работу
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <div>
                      <strong>Студент:</strong> {gradingModal.student.name}
                    </div>
                    <div>
                      <strong>Задание:</strong> {gradingModal.assignment.title}
                    </div>
                    <div>
                      <strong>Максимальный балл:</strong>{" "}
                      {gradingModal.assignment.maxScore}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Балл (0-{gradingModal.assignment.maxScore}) *
                  </label>
                  <input
                    type="number"
                    name="score"
                    required
                    min="0"
                    max={gradingModal.assignment.maxScore}
                    defaultValue={gradingModal.submission.score || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите балл"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Комментарий (необязательно)
                  </label>
                  <textarea
                    name="comment"
                    rows={4}
                    defaultValue={gradingModal.submission.comment || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Оставьте комментарий для студента..."
                  />
                </div>

                <div className="mb-4">
                  <a
                    href={gradingModal.submission.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Открыть работу студента
                  </a>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setGradingModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={gradeMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  {gradeMutation.isPending
                    ? "Сохранение..."
                    : "Сохранить оценку"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
