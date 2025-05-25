// src/app/(dashboard)/teacher/assignments/[assignmentId]/submissions/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { assignmentApi } from "@/services/assignmentService";
import { subjectApi } from "@/services/subjectService";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import { formatLocalDateTime } from "@/utils/dateUtils";
import {
  Assignment,
  AssignmentSubmission,
  Group,
  Subject,
  User,
} from "@/types";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  User as UserIcon,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Calendar,
  Users,
  BookOpen,
  Search,
  Filter,
  Download,
  BarChart3,
  Award,
} from "lucide-react";

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const assignmentId = params.assignmentId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [gradingModal, setGradingModal] = useState<{
    submission: AssignmentSubmission;
    student: User;
  } | null>(null);

  // Получаем информацию о задании
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      // Получаем задание через список заданий преподавателя
      const assignments = await assignmentApi.getAssignmentsByTeacher(
        user?.$id || ""
      );
      return assignments.find((a) => a.$id === assignmentId) || null;
    },
    enabled: !!assignmentId && !!user?.$id,
  });

  // Получаем ответы на задание
  const { data: submissions = [] } = useQuery({
    queryKey: ["assignment-submissions", assignmentId],
    queryFn: () => assignmentApi.getSubmissionsByAssignment(assignmentId),
    enabled: !!assignmentId,
  });

  // Получаем дополнительные данные
  const { data: subject } = useQuery({
    queryKey: ["subject", assignment?.subjectId],
    queryFn: () => subjectApi.getSubjectById(assignment!.subjectId),
    enabled: !!assignment?.subjectId,
  });

  const { data: group } = useQuery({
    queryKey: ["group", assignment?.groupId],
    queryFn: () => groupApi.getGroupById(assignment!.groupId),
    enabled: !!assignment?.groupId,
  });

  // Получаем студентов группы
  const { data: students = [] } = useQuery({
    queryKey: ["group-students", group?.studentIds],
    queryFn: async () => {
      if (!group?.studentIds || group.studentIds.length === 0) return [];

      const studentPromises = group.studentIds.map((studentId) =>
        userApi.getUserById(studentId)
      );

      const studentsData = await Promise.all(studentPromises);
      return studentsData.filter(
        (student): student is NonNullable<typeof student> => student !== null
      );
    },
    enabled: !!group?.studentIds && group.studentIds.length > 0,
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
      queryClient.invalidateQueries({ queryKey: ["assignment-submissions"] });
      setGradingModal(null);
      toast.success("Работа успешно оценена!");
    },
    onError: (error) => {
      toast.error(`Ошибка при оценке работы: ${error.message}`);
    },
  });

  // Создаем карту студентов
  const studentsMap = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.$id] = student;
      return acc;
    }, {} as Record<string, User>);
  }, [students]);

  // Создаем полную информацию о работах (включая тех, кто не сдал)
  const submissionsWithStudents = React.useMemo(() => {
    const submissionsMap = submissions.reduce((acc, submission) => {
      acc[submission.studentId] = submission;
      return acc;
    }, {} as Record<string, AssignmentSubmission>);

    return students.map((student) => ({
      student,
      submission: submissionsMap[student.$id] || null,
      hasSubmitted: !!submissionsMap[student.$id],
      isChecked: submissionsMap[student.$id]?.isChecked || false,
    }));
  }, [students, submissions]);

  // Фильтрация работ
  const filteredSubmissions = React.useMemo(() => {
    return submissionsWithStudents.filter((item) => {
      // Поиск по имени студента
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!item.student.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Фильтр по статусу
      if (filterStatus === "submitted" && !item.hasSubmitted) return false;
      if (filterStatus === "not-submitted" && item.hasSubmitted) return false;
      if (filterStatus === "checked" && !item.isChecked) return false;
      if (
        filterStatus === "unchecked" &&
        (item.isChecked || !item.hasSubmitted)
      )
        return false;

      return true;
    });
  }, [submissionsWithStudents, searchTerm, filterStatus]);

  // Сортировка: непроверенные сверху, потом по алфавиту
  const sortedSubmissions = React.useMemo(() => {
    return [...filteredSubmissions].sort((a, b) => {
      // Сначала непроверенные работы
      if (a.hasSubmitted && b.hasSubmitted) {
        if (a.isChecked !== b.isChecked) {
          return a.isChecked ? 1 : -1;
        }
      }

      // Потом те, кто сдал, перед теми, кто не сдал
      if (a.hasSubmitted !== b.hasSubmitted) {
        return a.hasSubmitted ? -1 : 1;
      }

      // В конце по алфавиту
      return a.student.name.localeCompare(b.student.name, "ru");
    });
  }, [filteredSubmissions]);

  // Статистика
  const stats = React.useMemo(() => {
    const totalStudents = students.length;
    const submittedCount = submissions.length;
    const checkedCount = submissions.filter((s) => s.isChecked).length;
    const uncheckedCount = submittedCount - checkedCount;
    const notSubmittedCount = totalStudents - submittedCount;

    const scores = submissions
      .filter((s) => s.isChecked && s.score !== null)
      .map((s) => s.score as number);

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    const maxScore = assignment?.maxScore || 100;
    const averagePercentage =
      maxScore > 0 ? (averageScore / maxScore) * 100 : 0;

    return {
      totalStudents,
      submittedCount,
      checkedCount,
      uncheckedCount,
      notSubmittedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage),
    };
  }, [students, submissions, assignment]);

  const handleGradeSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gradingModal) return;

    const formData = new FormData(e.currentTarget);
    const score = parseInt(formData.get("score") as string);
    const comment = formData.get("comment") as string;

    if (isNaN(score) || score < 0 || score > (assignment?.maxScore || 100)) {
      toast.error(`Балл должен быть от 0 до ${assignment?.maxScore || 100}`);
      return;
    }

    gradeMutation.mutate({
      submissionId: gradingModal.submission.$id,
      score,
      comment: comment.trim() || undefined,
    });
  };

  const handleBack = () => {
    router.push("/teacher/assignments");
  };

  const isOverdue = assignment
    ? new Date(assignment.dueDate) < new Date()
    : false;

  if (assignmentLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка задания...</div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Задание не найдено
          </h3>
          <p className="text-gray-600 mb-4">
            Возможно, задание было удалено или у вас нет доступа к нему
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Назад к заданиям
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заданиям
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ответы на задание
        </h1>
        <p className="text-gray-600">
          Просматривайте и оценивайте работы студентов
        </p>
      </div>

      {/* Информация о задании */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {assignment.title}
              </h2>
              {assignment.isActive ? (
                isOverdue ? (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    Просрочено
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Активно
                  </span>
                )
              ) : (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                  Неактивно
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {subject && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Дисциплина</div>
                    <div className="font-medium">{subject.title}</div>
                  </div>
                </div>
              )}

              {group && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Группа</div>
                    <div className="font-medium">{group.title}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Срок сдачи</div>
                  <div className="font-medium">
                    {formatLocalDateTime(assignment.dueDate)}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{assignment.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Максимальный балл: <strong>{assignment.maxScore}</strong>
              </span>
              <span className="text-gray-600">
                Создано:{" "}
                <strong>{formatLocalDateTime(assignment.$createdAt)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Всего студентов
              </p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Сдали</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.submittedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Проверено</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.checkedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Требует проверки
              </p>
              <p className="text-xl font-bold text-gray-900">
                {stats.uncheckedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Средний балл</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.averagePercentage}%
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
              Статус
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все студенты</option>
              <option value="submitted">Сдали работу</option>
              <option value="not-submitted">Не сдали</option>
              <option value="checked">Проверенные</option>
              <option value="unchecked">Требуют проверки</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Показано: {sortedSubmissions.length} из {students.length}
            </div>
          </div>
        </div>
      </div>

      {/* Список работ */}
      {sortedSubmissions.length > 0 ? (
        <div className="space-y-4">
          {sortedSubmissions.map((item) => (
            <div
              key={item.student.$id}
              className={`bg-white border rounded-lg shadow-sm ${
                !item.hasSubmitted
                  ? "border-l-4 border-l-gray-400 bg-gray-50"
                  : !item.isChecked
                  ? "border-l-4 border-l-orange-400"
                  : "border-l-4 border-l-green-400"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {item.student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.student.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.student.email}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        {!item.hasSubmitted ? (
                          <span className="px-2 py-1 text-xs rounded-full text-gray-600 bg-gray-100">
                            Не сдал работу
                          </span>
                        ) : (
                          <>
                            <span className="text-sm text-gray-600">
                              Сдано:{" "}
                              {formatLocalDateTime(
                                item.submission!.submittedAt
                              )}
                            </span>

                            {item.isChecked ? (
                              <span
                                className={`px-2 py-1 text-xs rounded-full `}
                              >
                                получил {item.submission!.score}/
                                {assignment.maxScore}
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full text-orange-600 bg-orange-50">
                                Требует проверки
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {item.hasSubmitted &&
                        item.isChecked &&
                        item.submission!.comment && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Ваш комментарий:
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.submission!.comment}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {item.hasSubmitted && (
                      <>
                        <a
                          href={item.submission!.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Открыть работу
                        </a>

                        <button
                          onClick={() =>
                            setGradingModal({
                              submission: item.submission!,
                              student: item.student,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          <Star className="h-3 w-3" />
                          {item.isChecked ? "Переоценить" : "Оценить"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Студентов не найдено
          </h3>
          <p className="text-gray-500">Попробуйте изменить фильтры поиска</p>
        </div>
      )}

      {/* Модальное окно оценки */}
      {gradingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleGradeSubmission}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Оценить работу
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Студент:</strong> {gradingModal.student.name}
                    </div>
                    <div>
                      <strong>Задание:</strong> {assignment.title}
                    </div>
                    <div>
                      <strong>Максимальный балл:</strong> {assignment.maxScore}
                    </div>
                    <div>
                      <strong>Сдано:</strong>{" "}
                      {formatLocalDateTime(gradingModal.submission.submittedAt)}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Балл (0-{assignment.maxScore}) *
                  </label>
                  <input
                    type="number"
                    name="score"
                    required
                    min="0"
                    max={assignment.maxScore}
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
