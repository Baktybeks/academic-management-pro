// src/types/index.ts

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ACADEMIC_ADVISOR = "ACADEMIC_ADVISOR",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Супер админ",
  [UserRole.ACADEMIC_ADVISOR]: "Академ. советник",
  [UserRole.TEACHER]: "Преподаватель",
  [UserRole.STUDENT]: "Студент",
};

export const UserRoleColors: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "bg-red-100 text-red-800",
  [UserRole.ACADEMIC_ADVISOR]: "bg-blue-100 text-blue-800",
  [UserRole.TEACHER]: "bg-green-100 text-green-800",
  [UserRole.STUDENT]: "bg-purple-100 text-purple-800",
};

export const getRoleLabel = (role: UserRole): string => {
  return UserRoleLabels[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  return UserRoleColors[role] || "bg-gray-100 text-gray-800";
};

export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

export type LetterGrade =
  | "неудовлетворительно"
  | "удовлетворительно"
  | "хорошо"
  | "отлично";

export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Subject extends BaseDocument {
  title: string;
  description?: string;
  createdBy: string;
  isActive: boolean;
}

export interface Group extends BaseDocument {
  title: string;
  studentIds: string[];
  createdBy: string;
}

export interface TeacherAssignment extends BaseDocument {
  teacherId: string;
  groupId: string;
  subjectId: string;
  assignedBy: string;
}

export interface Lesson extends BaseDocument {
  title: string;
  description?: string;
  date: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
}

export interface Attendance extends BaseDocument {
  lessonId: string;
  studentId: string;
  present: boolean;
}

export interface Assignment extends BaseDocument {
  title: string;
  description: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  maxScore: number;
  isActive: boolean;
}

export interface AssignmentSubmission extends BaseDocument {
  assignmentId: string;
  studentId: string;
  submissionUrl: string;
  submittedAt: string;
  score: number | null;
  comment?: string;
  isChecked: boolean;
  checkedAt?: string;
  checkedBy?: string;
}

export interface GradingPeriod extends BaseDocument {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
}

export interface FinalGrade extends BaseDocument {
  studentId: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  gradingPeriodId: string;
  totalScore: number;
  letterGrade: LetterGrade;
}

export interface Survey extends BaseDocument {
  title: string;
  description: string;
  isActive: boolean;
  createdBy: string;
}

export interface SurveyQuestion extends BaseDocument {
  surveyId: string;
  text: string;
  order: number;
}

export interface SurveyPeriod extends BaseDocument {
  title: string;
  description?: string;
  surveyId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
}

export interface SurveyResponse extends BaseDocument {
  surveyId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  surveyPeriodId: string;
  submittedAt: string;
}

export interface SurveyAnswer extends BaseDocument {
  responseId: string;
  questionId: string;
  value: number;
}

// DTO (Data Transfer Objects)

export interface CreateSubjectDto {
  title: string;
  description?: string;
}

export interface UpdateSubjectDto {
  title?: string;
  description?: string;
}

export interface CreateGroupDto {
  title: string;
  studentIds?: string[];
  createdBy: string;
}

export interface UpdateGroupDto {
  title?: string;
  studentIds?: string[];
}

export interface LessonCreateDto {
  title: string;
  description?: string;
  date: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  date?: string;
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  maxScore?: number;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  isActive?: boolean;
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

export interface GradingPeriodCreateDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface SurveyCreateDto {
  title: string;
  description: string;
  createdBy: string;
  isActive?: boolean;
}

export interface SurveyQuestionCreateDto {
  surveyId: string;
  text: string;
  order?: number;
}

export interface SurveyPeriodCreateDto {
  title: string;
  description?: string;
  surveyId: string;
  startDate: string;
  endDate: string;
}

export interface SubmitSurveyDto {
  surveyId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  surveyPeriodId: string;
  answers: Array<{
    questionId: string;
    value: number;
  }>;
}

export interface CreateSurveyResponseDto {
  surveyId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  surveyPeriodId: string;
}

export interface CreateSurveyAnswerDto {
  responseId: string;
  questionId: string;
  value: number;
}

export interface StudentGradeInfo {
  student: User;
  totalScore: number;
  letterGrade: LetterGrade;
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

// Константы оценок
export const GRADE_SCALE = {
  EXCELLENT: { min: 87, max: 100, label: "отлично" },
  GOOD: { min: 74, max: 86, label: "хорошо" },
  SATISFACTORY: { min: 61, max: 73, label: "удовлетворительно" },
  UNSATISFACTORY: { min: 0, max: 60, label: "неудовлетворительно" },
} as const;

export const getLetterGrade = (score: number): LetterGrade => {
  if (score >= GRADE_SCALE.EXCELLENT.min) return GRADE_SCALE.EXCELLENT.label;
  if (score >= GRADE_SCALE.GOOD.min) return GRADE_SCALE.GOOD.label;
  if (score >= GRADE_SCALE.SATISFACTORY.min)
    return GRADE_SCALE.SATISFACTORY.label;
  return GRADE_SCALE.UNSATISFACTORY.label;
};

export const getGradeColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 87) return "text-green-600 bg-green-50";
  if (percentage >= 74) return "text-blue-600 bg-blue-50";
  if (percentage >= 61) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

export const getLetterGradeColor = (letterGrade: string) => {
  switch (letterGrade) {
    case "отлично":
      return "text-green-600 bg-green-50 border-green-200";
    case "хорошо":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "удовлетворительно":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "неудовлетворительно":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};
