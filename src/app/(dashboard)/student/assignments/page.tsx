// src/app/(dashboard)/student/assignments/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { assignmentApi } from "@/services/assignmentService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { userApi } from "@/services/userService";
import {
  Assignment,
  AssignmentSubmission,
  Group,
  Subject,
  TeacherAssignment,
  User,
} from "@/types";
import { toast } from "react-toastify";
import {
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  Send,
  Calendar,
  BookOpen,
  Users,
  Filter,
  Search,
} from "lucide-react";

export default function StudentAssignmentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionModal, setSubmissionModal] = useState<{
    assignment: Assignment;
    existingSubmission?: AssignmentSubmission;
  } | null>(null);

  // Получаем группы студента
  const { data: studentGroups = [] } = useQuery({
    queryKey: ["student-groups", user?.$id],
    queryFn: () => groupApi.getGroupsByStudentId(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем все дисциплины
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  // Получаем задания для групп студента
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

  // Получаем ответы студента
  const { data: submissions = [] } = useQuery({
    queryKey: ["student-submissions", user?.$id],
    queryFn: () => assignmentApi.getSubmissionsByStudent(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем преподавателей
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => userApi.getUsersByRole("TEACHER" as any),
  });

  // Мутация для отправки ответа
  const submitMutation = useMutation({
    mutationFn: ({
      assignmentId,
      submissionUrl,
    }: {
      assignmentId: string;
      submissionUrl: string;
    }) =>
      assignmentApi.submitAssignment(
        { assignmentId, submissionUrl },
        user?.$id || ""
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-submissions"] });
      setSubmissionModal(null);
      toast.success("Ответ успешно отправлен!");
    },
    onError: (error) => {
      toast.error(`Ошибка при отправке ответа: ${error.message}`);
    },
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

  const submissionsMap = React.useMemo(() => {
    return submissions.reduce((acc, submission) => {
      acc[submission.assignmentId] = submission;
      return acc;
    }, {} as Record<string, AssignmentSubmission>);
  }, [submissions]);

  // Фильтрация заданий
  const filteredAssignments = React.useMemo(() => {
    return allAssignments.filter((assignment) => {
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

      // Фильтр по статусу
      const submission = submissionsMap[assignment.$id];
      if (filterStatus !== "all") {
        if (filterStatus === "submitted" && !submission) return false;
        if (filterStatus === "not-submitted" && submission) return false;
        if (
          filterStatus === "checked" &&
          (!submission || !submission.isChecked)
        )
          return false;
        if (
          filterStatus === "unchecked" &&
          (!submission || submission.isChecked)
        )
          return false;
      }

      // Поиск по названию
      if (
        searchTerm &&
        !assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [
    allAssignments,
    selectedSubject,
    selectedGroup,
    filterStatus,
    searchTerm,
    submissionsMap,
  ]);

  const handleSubmitAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!submissionModal) return;

    const formData = new FormData(e.currentTarget);
    const submissionUrl = formData.get("submissionUrl") as string;

    if (!submissionUrl.trim()) {
      toast.error("Введите ссылку на ответ");
      return;
    }

    submitMutation.mutate({
      assignmentId: submissionModal.assignment.$id,
      submissionUrl: submissionUrl.trim(),
    });
  };

  const getStatusColor = (assignment: Assignment) => {
    const submission = submissionsMap[assignment.$id];
    const isOverdue = new Date(assignment.dueDate) < new Date();

    if (!submission) {
      return isOverdue
        ? "text-red-600 bg-red-50"
        : "text-orange-600 bg-orange-50";
    }

    if (submission.isChecked) {
      return "text-green-600 bg-green-50";
    }

    return "text-blue-600 bg-blue-50";
  };

  const getStatusText = (assignment: Assignment) => {
    const submission = submissionsMap[assignment.$id];
    const isOverdue = new Date(assignment.dueDate) < new Date();

    if (!submission) {
      return isOverdue ? "Просрочено" : "Не сдано";
    }

    if (submission.isChecked) {
      return `Проверено${
        submission.score !== undefined ? ` (${submission.score} б.)` : ""
      }`;
    }

    return "На проверке";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Контрольные задания
        </h1>
        <p className="text-gray-600">
          Просматривайте задания и отправляйте свои ответы
        </p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск по названию..."
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
              <option value="not-submitted">Не сдано</option>
              <option value="submitted">Сдано</option>
              <option value="unchecked">На проверке</option>
              <option value="checked">Проверено</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Найдено: {filteredAssignments.length} заданий
            </div>
          </div>
        </div>
      </div>

      {/* Список заданий */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const submission = submissionsMap[assignment.$id];
            const subject = subjectsMap[assignment.subjectId];
            const group = groupsMap[assignment.groupId];
            const teacher = teachersMap[assignment.teacherId];
            const isOverdue = new Date(assignment.dueDate) < new Date();

            return (
              <div
                key={assignment.$id}
                className="bg-white border rounded-lg shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            assignment
                          )}`}
                        >
                          {getStatusText(assignment)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
                        {teacher && <div>Преподаватель: {teacher.name}</div>}
                      </div>

                      <p className="text-gray-700 mb-3">
                        {assignment.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                          Срок:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString(
                            "ru-RU"
                          )}
                          {isOverdue && " (просрочено)"}
                        </div>
                        <div className="text-gray-600">
                          Макс. балл: {assignment.maxScore}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Информация о сданной работе */}
                  {submission && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Ваш ответ:
                        </span>
                        <span className="text-xs text-gray-500">
                          Отправлено:{" "}
                          {new Date(submission.submittedAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Открыть ответ
                        </a>
                      </div>

                      {submission.isChecked && submission.comment && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <span className="text-sm font-medium text-gray-700">
                            Комментарий преподавателя:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {submission.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Действия */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSubmissionModal({
                          assignment,
                          existingSubmission: submission,
                        })
                      }
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {submission ? "Переотправить" : "Отправить ответ"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Заданий не найдено
          </h3>
          <p className="text-gray-500">
            {searchTerm ||
            selectedSubject !== "all" ||
            selectedGroup !== "all" ||
            filterStatus !== "all"
              ? "Попробуйте изменить фильтры поиска"
              : "Контрольные задания пока не назначены"}
          </p>
        </div>
      )}

      {/* Модальное окно отправки ответа */}
      {submissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleSubmitAssignment}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {submissionModal.existingSubmission
                    ? "Переотправить ответ"
                    : "Отправить ответ"}
                </h2>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {submissionModal.assignment.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {submissionModal.assignment.description}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ссылка на ваш ответ *
                  </label>
                  <input
                    type="url"
                    name="submissionUrl"
                    required
                    defaultValue={
                      submissionModal.existingSubmission?.submissionUrl || ""
                    }
                    placeholder="https://docs.google.com/... или https://figma.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Добавьте ссылку на Google Docs, Figma, GitHub или другой
                    сервис
                  </p>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSubmissionModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitMutation.isPending ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
