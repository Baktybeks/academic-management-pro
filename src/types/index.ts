// src/types/index.ts

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ACADEMIC_ADVISOR = "ACADEMIC_ADVISOR",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Супер Админ",
  [UserRole.ACADEMIC_ADVISOR]: "Академ. совет.",
  [UserRole.TEACHER]: "Преподаватель",
  [UserRole.STUDENT]: "Студент",
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
}
export interface UpdateGroupDto {
  title?: string;
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
