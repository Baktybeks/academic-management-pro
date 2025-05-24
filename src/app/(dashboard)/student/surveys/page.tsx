// src/app/(dashboard)/student/surveys/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { surveyPeriodApi } from "@/services/surveyPeriodService";
import { surveyApi } from "@/services/surveyService";
import { surveyResponseApi } from "@/services/surveyResponseService";
import { teacherAssignmentApi } from "@/services/teacherAssignmentService";
import { groupApi } from "@/services/groupService";
import { subjectApi } from "@/services/subjectService";
import { userApi } from "@/services/userService";
import {
  SurveyPeriod,
  Survey,
  SurveyQuestion,
  TeacherAssignment,
  Group,
  Subject,
  User,
  SubmitSurveyDto,
} from "@/types";
import { toast } from "react-toastify";
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  Users,
  UserIcon,
  Send,
  ArrowLeft,
} from "lucide-react";

export default function StudentSurveysPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedSurveyPeriod, setSelectedSurveyPeriod] =
    useState<SurveyPeriod | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<{
    teacher: User;
    subject: Subject;
    group: Group;
    assignment: TeacherAssignment;
  } | null>(null);

  // Получаем активные периоды опросов
  const { data: activeSurveyPeriods = [] } = useQuery({
    queryKey: ["active-survey-periods"],
    queryFn: surveyPeriodApi.getActiveSurveyPeriods,
  });

  // Получаем группы студента
  const { data: studentGroups = [] } = useQuery({
    queryKey: ["student-groups", user?.$id],
    queryFn: () => groupApi.getGroupsByStudentId(user?.$id || ""),
    enabled: !!user?.$id,
  });

  // Получаем назначения преподавателей для групп студента
  const { data: teacherAssignments = [] } = useQuery({
    queryKey: [
      "teacher-assignments-for-groups",
      studentGroups.map((g) => g.$id),
    ],
    queryFn: async () => {
      if (studentGroups.length === 0) return [];

      const assignmentPromises = studentGroups.map((group) =>
        teacherAssignmentApi.getAssignmentsByGroup(group.$id)
      );

      const assignmentArrays = await Promise.all(assignmentPromises);
      return assignmentArrays.flat();
    },
    enabled: studentGroups.length > 0,
  });

  // Получаем дополнительные данные
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectApi.getAllSubjects,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => userApi.getUsersByRole("TEACHER" as any),
  });

  // Получаем ответы студента на опросы
  const { data: studentResponses = [] } = useQuery({
    queryKey: ["student-survey-responses", user?.$id],
    queryFn: () => surveyResponseApi.getStudentSurveyResponses(user?.$id || ""),
    enabled: !!user?.$id,
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

  // Получаем доступных для оценки преподавателей
  const availableTeachers = React.useMemo(() => {
    if (!selectedSurveyPeriod) return [];

    return teacherAssignments
      .map((assignment) => {
        const teacher = teachersMap[assignment.teacherId];
        const subject = subjectsMap[assignment.subjectId];
        const group = groupsMap[assignment.groupId];

        if (!teacher || !subject || !group) return null;

        // Проверяем, не проходил ли студент уже этот опрос
        const hasCompleted = studentResponses.some(
          (response) =>
            response.teacherId === teacher.$id &&
            response.subjectId === subject.$id &&
            response.surveyPeriodId === selectedSurveyPeriod.$id
        );

        return {
          teacher,
          subject,
          group,
          assignment,
          hasCompleted,
        };
      })
      .filter(Boolean) as Array<{
      teacher: User;
      subject: Subject;
      group: Group;
      assignment: TeacherAssignment;
      hasCompleted: boolean;
    }>;
  }, [
    selectedSurveyPeriod,
    teacherAssignments,
    teachersMap,
    subjectsMap,
    groupsMap,
    studentResponses,
  ]);

  const handleSelectPeriod = (period: SurveyPeriod) => {
    setSelectedSurveyPeriod(period);
    setSelectedTeacher(null);
  };

  const handleSelectTeacher = (teacherData: {
    teacher: User;
    subject: Subject;
    group: Group;
    assignment: TeacherAssignment;
  }) => {
    setSelectedTeacher(teacherData);
  };

  const handleBack = () => {
    if (selectedTeacher) {
      setSelectedTeacher(null);
    } else if (selectedSurveyPeriod) {
      setSelectedSurveyPeriod(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        {(selectedSurveyPeriod || selectedTeacher) && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Опросы преподавателей
        </h1>
        <p className="text-gray-600">
          Оценивайте работу ваших преподавателей и помогайте улучшить качество
          образования
        </p>
      </div>

      {!selectedSurveyPeriod ? (
        <SurveyPeriodsList
          periods={activeSurveyPeriods}
          onSelectPeriod={handleSelectPeriod}
        />
      ) : !selectedTeacher ? (
        <TeachersList
          period={selectedSurveyPeriod}
          teachers={availableTeachers}
          onSelectTeacher={handleSelectTeacher}
        />
      ) : (
        <SurveyForm
          period={selectedSurveyPeriod}
          teacher={selectedTeacher}
          student={user!}
          onComplete={() => {
            queryClient.invalidateQueries({
              queryKey: ["student-survey-responses"],
            });
            setSelectedTeacher(null);
          }}
        />
      )}
    </div>
  );
}

// Компонент списка периодов опросов
function SurveyPeriodsList({
  periods,
  onSelectPeriod,
}: {
  periods: SurveyPeriod[];
  onSelectPeriod: (period: SurveyPeriod) => void;
}) {
  if (periods.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow border">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Нет активных опросов
        </h3>
        <p className="text-gray-500">
          В данный момент нет доступных опросов для прохождения
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Доступные опросы</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {periods.map((period) => (
          <div
            key={period.$id}
            className="bg-white border rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="h-6 w-6 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {period.title}
              </h3>
            </div>

            {period.description && (
              <p className="text-gray-600 text-sm mb-4">{period.description}</p>
            )}

            <div className="text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Начало:{" "}
                  {new Date(period.startDate).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Окончание:{" "}
                  {new Date(period.endDate).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectPeriod(period)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Пройти опрос
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Компонент списка преподавателей для оценки
function TeachersList({
  period,
  teachers,
  onSelectTeacher,
}: {
  period: SurveyPeriod;
  teachers: Array<{
    teacher: User;
    subject: Subject;
    group: Group;
    assignment: TeacherAssignment;
    hasCompleted: boolean;
  }>;
  onSelectTeacher: (teacherData: {
    teacher: User;
    subject: Subject;
    group: Group;
    assignment: TeacherAssignment;
  }) => void;
}) {
  const availableTeachers = teachers.filter((t) => !t.hasCompleted);
  const completedTeachers = teachers.filter((t) => t.hasCompleted);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Выберите преподавателя для оценки
      </h2>
      <p className="text-gray-600 mb-6">Период: {period.title}</p>

      {availableTeachers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Доступно для оценки ({availableTeachers.length})
          </h3>

          <div className="space-y-4">
            {availableTeachers.map((teacherData) => (
              <div
                key={`${teacherData.teacher.$id}-${teacherData.subject.$id}`}
                className="bg-white border rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold">
                          {teacherData.teacher.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <span>{teacherData.subject.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span>{teacherData.group.title}</span>
                      </div>
                    </div>

                    {teacherData.subject.description && (
                      <p className="text-sm text-gray-600">
                        {teacherData.subject.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectTeacher(teacherData)}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Оценить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedTeachers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Уже оценено ({completedTeachers.length})
          </h3>

          <div className="space-y-4">
            {completedTeachers.map((teacherData) => (
              <div
                key={`${teacherData.teacher.$id}-${teacherData.subject.$id}`}
                className="bg-gray-50 border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-gray-700">
                          {teacherData.teacher.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">
                          {teacherData.subject.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">
                          {teacherData.group.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Оценено</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teachers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Нет преподавателей для оценки
          </h3>
          <p className="text-gray-500">
            В этом периоде нет доступных преподавателей для оценки
          </p>
        </div>
      )}
    </div>
  );
}

// Компонент формы опроса
function SurveyForm({
  period,
  teacher,
  student,
  onComplete,
}: {
  period: SurveyPeriod;
  teacher: {
    teacher: User;
    subject: Subject;
    group: Group;
    assignment: TeacherAssignment;
  };
  student: User;
  onComplete: () => void;
}) {
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Получаем опрос
  const { data: survey } = useQuery({
    queryKey: ["survey", period.surveyId],
    queryFn: () => surveyApi.getSurveyById(period.surveyId),
  });

  // Получаем вопросы опроса
  const { data: questions = [] } = useQuery({
    queryKey: ["survey-questions", period.surveyId],
    queryFn: () => surveyApi.getQuestionsBySurveyId(period.surveyId),
    enabled: !!period.surveyId,
  });

  // Мутация для отправки ответов
  const submitMutation = useMutation({
    mutationFn: async (data: SubmitSurveyDto) => {
      // Создаем основной ответ
      const response = await surveyResponseApi.createResponse({
        surveyId: data.surveyId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        subjectId: data.subjectId,
        surveyPeriodId: data.surveyPeriodId,
      });

      // Создаем ответы на вопросы
      await Promise.all(
        data.answers.map((answer) =>
          surveyResponseApi.createAnswer({
            responseId: response.$id,
            questionId: answer.questionId,
            value: answer.value,
          })
        )
      );

      return response;
    },
    onSuccess: () => {
      toast.success("Спасибо за ваши ответы!");
      onComplete();
    },
    onError: (error) => {
      toast.error(`Ошибка при отправке ответов: ${error.message}`);
    },
  });

  const handleRatingChange = (questionId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем, что все вопросы отвечены
    const unansweredQuestions = questions.filter((q) => !ratings[q.$id]);
    if (unansweredQuestions.length > 0) {
      toast.error("Пожалуйста, ответьте на все вопросы");
      return;
    }

    const data: SubmitSurveyDto = {
      surveyId: period.surveyId,
      studentId: student.$id,
      teacherId: teacher.teacher.$id,
      subjectId: teacher.subject.$id,
      surveyPeriodId: period.$id,
      answers: questions.map((question) => ({
        questionId: question.$id,
        value: ratings[question.$id],
      })),
    };

    submitMutation.mutate(data);
  };

  if (!survey || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Загрузка опроса...</div>
      </div>
    );
  }

  const sortedQuestions = questions.sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{survey.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Преподаватель</div>
              <div className="font-medium">{teacher.teacher.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Дисциплина</div>
              <div className="font-medium">{teacher.subject.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Группа</div>
              <div className="font-medium">{teacher.group.title}</div>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">{survey.description}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Пожалуйста, оцените работу преподавателя по каждому пункту от 0 до
            10, где 0 - совершенно неудовлетворительно, 10 - превосходно.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sortedQuestions.map((question, index) => (
          <div
            key={question.$id}
            className="bg-white rounded-lg shadow border p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {index + 1}. {question.text}
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">0</span>
              {[...Array(11)].map((_, rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(question.$id, rating)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    ratings[question.$id] === rating
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-300 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {rating}
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">10</span>
            </div>

            {ratings[question.$id] !== undefined && (
              <div className="mt-2 text-sm text-gray-600">
                Ваша оценка: {ratings[question.$id]}/10
              </div>
            )}
          </div>
        ))}

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Готовы отправить ответы?
              </h3>
              <p className="text-sm text-gray-600">
                Проверьте свои ответы перед отправкой. После отправки изменить
                их будет нельзя.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                submitMutation.isPending ||
                Object.keys(ratings).length !== questions.length
              }
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {submitMutation.isPending ? "Отправка..." : "Отправить ответы"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
