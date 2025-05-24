// src/constants/appwriteConfig.ts

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    // Основные коллекции
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    subjects: process.env.NEXT_PUBLIC_SUBJECTS_COLLECTION_ID || "subjects",
    groups: process.env.NEXT_PUBLIC_GROUPS_COLLECTION_ID || "groups",

    // Привязки и назначения
    teacherAssignments:
      process.env.NEXT_PUBLIC_TEACHER_ASSIGNMENTS_COLLECTION_ID ||
      "teacher_assignments",

    // Занятия и посещаемость
    lessons: process.env.NEXT_PUBLIC_LESSONS_COLLECTION_ID || "lessons",
    attendance:
      process.env.NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID || "attendance",

    // Контрольные задания
    assignments:
      process.env.NEXT_PUBLIC_ASSIGNMENTS_COLLECTION_ID || "assignments",
    assignmentSubmissions:
      process.env.NEXT_PUBLIC_ASSIGNMENT_SUBMISSIONS_COLLECTION_ID ||
      "assignment_submissions",

    // Оценки и периоды
    gradingPeriods:
      process.env.NEXT_PUBLIC_GRADING_PERIODS_COLLECTION_ID ||
      "grading_periods",
    finalGrades:
      process.env.NEXT_PUBLIC_FINAL_GRADES_COLLECTION_ID || "final_grades",

    // Опросники
    surveys: process.env.NEXT_PUBLIC_SURVEYS_COLLECTION_ID || "surveys",
    surveyQuestions:
      process.env.NEXT_PUBLIC_SURVEY_QUESTIONS_COLLECTION_ID ||
      "survey_questions",
    surveyPeriods:
      process.env.NEXT_PUBLIC_SURVEY_PERIODS_COLLECTION_ID || "survey_periods",
    surveyResponses:
      process.env.NEXT_PUBLIC_SURVEY_RESPONSES_COLLECTION_ID ||
      "survey_responses",
    surveyAnswers:
      process.env.NEXT_PUBLIC_SURVEY_ANSWERS_COLLECTION_ID || "survey_answers",
  },
};

// Список всех необходимых переменных окружения
const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  "NEXT_PUBLIC_USERS_COLLECTION_ID",
  "NEXT_PUBLIC_SUBJECTS_COLLECTION_ID",
  "NEXT_PUBLIC_GROUPS_COLLECTION_ID",
  "NEXT_PUBLIC_TEACHER_ASSIGNMENTS_COLLECTION_ID",
  "NEXT_PUBLIC_LESSONS_COLLECTION_ID",
  "NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID",
  "NEXT_PUBLIC_ASSIGNMENTS_COLLECTION_ID",
  "NEXT_PUBLIC_ASSIGNMENT_SUBMISSIONS_COLLECTION_ID",
  "NEXT_PUBLIC_GRADING_PERIODS_COLLECTION_ID",
  "NEXT_PUBLIC_FINAL_GRADES_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEYS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_QUESTIONS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_PERIODS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_RESPONSES_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_ANSWERS_COLLECTION_ID",
];

// Проверка наличия переменных окружения
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(", ")}`
  );
}

// Схема атрибутов для коллекций Appwrite (для справки при создании коллекций)
export const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    role: {
      type: "enum",
      required: true,
      elements: ["SUPER_ADMIN", "ACADEMIC_COUNCIL", "TEACHER", "STUDENT"],
    },
    isActive: { type: "boolean", required: true, default: false },
    createdAt: { type: "datetime", required: true },
  },

  subjects: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: false, size: 1000 },
    createdBy: { type: "string", required: true, size: 36 }, // ID СуперАдмина
    isActive: { type: "boolean", required: true, default: true },
    createdAt: { type: "datetime", required: true },
  },

  groups: {
    title: { type: "string", required: true, size: 255 },
    studentIds: { type: "string", required: false, array: true }, // Массив ID студентов
    createdBy: { type: "string", required: true, size: 36 }, // ID Академсоветника
    createdAt: { type: "datetime", required: true },
  },

  teacherAssignments: {
    teacherId: { type: "string", required: true, size: 36 },
    groupId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    assignedBy: { type: "string", required: true, size: 36 }, // ID Академсоветника
    createdAt: { type: "datetime", required: true },
  },

  lessons: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: false, size: 1000 },
    date: { type: "datetime", required: true },
    groupId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    createdAt: { type: "datetime", required: true },
  },

  attendance: {
    lessonId: { type: "string", required: true, size: 36 },
    studentId: { type: "string", required: true, size: 36 },
    present: { type: "boolean", required: true },
    createdAt: { type: "datetime", required: true },
  },

  assignments: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 2000 },
    groupId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    dueDate: { type: "datetime", required: true },
    maxScore: { type: "integer", required: true, default: 100 },
    isActive: { type: "boolean", required: true, default: true },
    createdAt: { type: "datetime", required: true },
  },

  assignmentSubmissions: {
    assignmentId: { type: "string", required: true, size: 36 },
    studentId: { type: "string", required: true, size: 36 },
    submissionUrl: { type: "url", required: true, size: 500 },
    submittedAt: { type: "datetime", required: true },
    score: { type: "integer", required: false, min: 0, max: 100 },
    comment: { type: "string", required: false, size: 1000 },
    isChecked: { type: "boolean", required: true, default: false },
    checkedAt: { type: "datetime", required: false },
    checkedBy: { type: "string", required: false, size: 36 },
  },

  gradingPeriods: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: false, size: 1000 },
    startDate: { type: "datetime", required: true },
    endDate: { type: "datetime", required: true },
    isActive: { type: "boolean", required: true, default: false },
    createdBy: { type: "string", required: true, size: 36 }, // ID СуперАдмина
    createdAt: { type: "datetime", required: true },
  },

  finalGrades: {
    studentId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    groupId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    gradingPeriodId: { type: "string", required: true, size: 36 },
    totalScore: { type: "integer", required: true, min: 0, max: 100 },
    letterGrade: { type: "string", required: true, size: 50 },
    createdAt: { type: "datetime", required: true },
  },

  surveys: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 1000 },
    isActive: { type: "boolean", required: true, default: true },
    createdBy: { type: "string", required: true, size: 36 }, // ID СуперАдмина
    createdAt: { type: "datetime", required: true },
  },

  surveyQuestions: {
    surveyId: { type: "string", required: true, size: 36 },
    text: { type: "string", required: true, size: 500 },
    order: { type: "integer", required: true, min: 1 },
    createdAt: { type: "datetime", required: true },
  },

  surveyPeriods: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: false, size: 1000 },
    surveyId: { type: "string", required: true, size: 36 },
    startDate: { type: "datetime", required: true },
    endDate: { type: "datetime", required: true },
    isActive: { type: "boolean", required: true, default: false },
    createdBy: { type: "string", required: true, size: 36 }, // ID СуперАдмина
    createdAt: { type: "datetime", required: true },
  },

  surveyResponses: {
    surveyId: { type: "string", required: true, size: 36 },
    studentId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    surveyPeriodId: { type: "string", required: true, size: 36 },
    submittedAt: { type: "datetime", required: true },
  },

  surveyAnswers: {
    responseId: { type: "string", required: true, size: 36 }, // Связь с SurveyResponse
    questionId: { type: "string", required: true, size: 36 },
    value: { type: "integer", required: true, min: 0, max: 10 },
    createdAt: { type: "datetime", required: true },
  },
};

// Индексы для оптимизации запросов
export const COLLECTION_INDEXES = {
  users: [
    { key: "email", type: "unique" },
    { key: "role", type: "key" },
    { key: "isActive", type: "key" },
  ],
  subjects: [
    { key: "createdBy", type: "key" },
    { key: "isActive", type: "key" },
  ],
  groups: [{ key: "createdBy", type: "key" }],
  teacherAssignments: [
    { key: "teacherId", type: "key" },
    { key: "groupId", type: "key" },
    { key: "subjectId", type: "key" },
    {
      key: "teacherId_groupId_subjectId",
      type: "unique",
      attributes: ["teacherId", "groupId", "subjectId"],
    },
  ],
  lessons: [
    { key: "groupId", type: "key" },
    { key: "subjectId", type: "key" },
    { key: "teacherId", type: "key" },
    { key: "date", type: "key" },
  ],
  attendance: [
    { key: "lessonId", type: "key" },
    { key: "studentId", type: "key" },
    {
      key: "lessonId_studentId",
      type: "unique",
      attributes: ["lessonId", "studentId"],
    },
  ],
  assignments: [
    { key: "groupId", type: "key" },
    { key: "subjectId", type: "key" },
    { key: "teacherId", type: "key" },
    { key: "isActive", type: "key" },
    { key: "dueDate", type: "key" },
  ],
  assignmentSubmissions: [
    { key: "assignmentId", type: "key" },
    { key: "studentId", type: "key" },
    { key: "isChecked", type: "key" },
    {
      key: "assignmentId_studentId",
      type: "unique",
      attributes: ["assignmentId", "studentId"],
    },
  ],
  gradingPeriods: [
    { key: "isActive", type: "key" },
    { key: "createdBy", type: "key" },
  ],
  finalGrades: [
    { key: "studentId", type: "key" },
    { key: "subjectId", type: "key" },
    { key: "gradingPeriodId", type: "key" },
  ],
  surveys: [
    { key: "isActive", type: "key" },
    { key: "createdBy", type: "key" },
  ],
  surveyQuestions: [
    { key: "surveyId", type: "key" },
    { key: "order", type: "key" },
  ],
  surveyPeriods: [
    { key: "surveyId", type: "key" },
    { key: "isActive", type: "key" },
  ],
  surveyResponses: [
    { key: "surveyId", type: "key" },
    { key: "studentId", type: "key" },
    { key: "teacherId", type: "key" },
    { key: "subjectId", type: "key" },
    { key: "surveyPeriodId", type: "key" },
    {
      key: "student_teacher_subject_period",
      type: "unique",
      attributes: ["studentId", "teacherId", "subjectId", "surveyPeriodId"],
    },
  ],
  surveyAnswers: [
    { key: "responseId", type: "key" },
    { key: "questionId", type: "key" },
  ],
};
