// src/types/index.ts

// Обновленные роли согласно ТЗ
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN", // СуперАдмин
  ACADEMIC_COUNCIL = "ACADEMIC_COUNCIL", // Академсоветник
  TEACHER = "TEACHER", // Преподаватель
  STUDENT = "STUDENT", // Студент
}

// Базовые типы
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// Пользователь
export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Дисциплины
export interface Subject extends BaseDocument {
  title: string;
  description?: string;
  createdBy: string; // ID СуперАдмина
  isActive: boolean;
  createdAt: string;
}

// Группы
export interface Group extends BaseDocument {
  title: string;
  studentIds: string[]; // Массив ID студентов
  createdBy: string; // ID Академсоветника
  createdAt: string;
}

// Привязка преподавателей к группам и дисциплинам
export interface TeacherAssignment extends BaseDocument {
  teacherId: string;
  groupId: string;
  subjectId: string;
  assignedBy: string; // ID Академсоветника
  createdAt: string;
}

// Занятия
export interface Lesson extends BaseDocument {
  title: string;
  description?: string;
  date: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  createdAt: string;
}

// Посещаемость
export interface Attendance extends BaseDocument {
  lessonId: string;
  studentId: string;
  present: boolean;
  createdAt: string;
}

// Контрольные задания
export interface Assignment extends BaseDocument {
  title: string;
  description: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  maxScore: number; // Максимальный балл (по умолчанию 100)
  isActive: boolean;
  createdAt: string;
}

// Ответы студентов на контрольные задания
export interface AssignmentSubmission extends BaseDocument {
  assignmentId: string;
  studentId: string;
  submissionUrl: string; // Ссылка на Google Docs, Figma и т.п.
  submittedAt: string;
  score?: number; // Баллы от преподавателя (0-100)
  comment?: string; // Комментарий преподавателя
  isChecked: boolean; // Проверено ли задание
  checkedAt?: string;
  checkedBy?: string; // ID преподавателя
}

// Периоды для выставления оценок
export interface GradingPeriod extends BaseDocument {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string; // ID СуперАдмина
  createdAt: string;
}

// Финальные оценки
export interface FinalGrade extends BaseDocument {
  studentId: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  gradingPeriodId: string;
  totalScore: number; // Общий балл (0-100)
  letterGrade: string; // "неудовлетворительно" | "удовлетворительно" | "хорошо" | "отлично"
  createdAt: string;
}

// Опросники для оценки преподавателей
export interface Survey extends BaseDocument {
  title: string;
  description: string;
  isActive: boolean;
  createdBy: string; // ID СуперАдмина
  createdAt: string;
}

// Вопросы опросника
export interface SurveyQuestion extends BaseDocument {
  surveyId: string;
  text: string;
  order: number; // Порядок вопроса
  createdAt: string;
}

// Периоды опросов
export interface SurveyPeriod extends BaseDocument {
  title: string;
  description?: string;
  surveyId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string; // ID СуперАдмина
  createdAt: string;
}

// Ответы студентов на опросники (основная запись)
export interface SurveyResponse extends BaseDocument {
  surveyId: string;
  studentId: string;
  teacherId: string; // Преподаватель, которого оценивают
  subjectId: string; // По какой дисциплине
  surveyPeriodId: string;
  submittedAt: string;
}

// Ответы на конкретные вопросы (отдельная коллекция)
export interface SurveyAnswer extends BaseDocument {
  responseId: string; // Связь с SurveyResponse
  questionId: string;
  value: number; // Оценка от 0 до 10
  createdAt: string;
}

// Интерфейсы для форм и DTOs
export interface CreateSubjectDto {
  title: string;
  description?: string;
}

export interface CreateGroupDto {
  title: string;
  studentIds?: string[];
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  groupId: string;
  subjectId: string;
  dueDate: string;
  maxScore?: number;
}

export interface SubmitAssignmentDto {
  assignmentId: string;
  submissionUrl: string;
}

export interface GradeSubmissionDto {
  submissionId: string;
  score: number;
  comment?: string;
}

export interface CreateTeacherAssignmentDto {
  teacherId: string;
  groupId: string;
  subjectId: string;
}

export interface CreateSurveyDto {
  title: string;
  description: string;
  questions: string[];
}

export interface SubmitSurveyDto {
  surveyId: string;
  teacherId: string;
  subjectId: string;
  surveyPeriodId: string;
  answers: Array<{
    questionId: string;
    value: number;
  }>;
}

// Вспомогательные типы
export interface StudentGradeInfo {
  student: User;
  totalScore: number;
  letterGrade: string;
  assignments: AssignmentSubmission[];
  attendance: Attendance[];
}

export interface TeacherRating {
  teacher: User;
  subject: Subject;
  averageRating: number;
  totalResponses: number;
  questionRatings: Array<{
    question: SurveyQuestion;
    averageRating: number;
  }>;
}

// Константы для оценок
export const GRADE_SCALE = {
  EXCELLENT: { min: 87, max: 100, label: "отлично" },
  GOOD: { min: 74, max: 86, label: "хорошо" },
  SATISFACTORY: { min: 61, max: 73, label: "удовлетворительно" },
  UNSATISFACTORY: { min: 0, max: 60, label: "неудовлетворительно" },
} as const;

// Функция для определения буквенной оценки
export const getLetterGrade = (score: number): string => {
  if (score >= GRADE_SCALE.EXCELLENT.min) return GRADE_SCALE.EXCELLENT.label;
  if (score >= GRADE_SCALE.GOOD.min) return GRADE_SCALE.GOOD.label;
  if (score >= GRADE_SCALE.SATISFACTORY.min)
    return GRADE_SCALE.SATISFACTORY.label;
  return GRADE_SCALE.UNSATISFACTORY.label;
};
