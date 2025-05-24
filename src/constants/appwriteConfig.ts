// src/constants/appwriteConfig.ts

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    subjects: process.env.NEXT_PUBLIC_SUBJECTS_COLLECTION_ID || "subjects",
    groups: process.env.NEXT_PUBLIC_GROUPS_COLLECTION_ID || "groups",
    teacherAssignments:
      process.env.NEXT_PUBLIC_TEACHER_ASSIGNMENTS_COLLECTION_ID ||
      "teacher_assignments",
    lessons: process.env.NEXT_PUBLIC_LESSONS_COLLECTION_ID || "lessons",
    attendance:
      process.env.NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID || "attendance",
    assignments:
      process.env.NEXT_PUBLIC_ASSIGNMENTS_COLLECTION_ID || "assignments",
    assignmentSubmissions:
      process.env.NEXT_PUBLIC_ASSIGNMENT_SUBMISSIONS_COLLECTION_ID ||
      "assignment_submissions",
    gradingPeriods:
      process.env.NEXT_PUBLIC_GRADING_PERIODS_COLLECTION_ID ||
      "grading_periods",
    finalGrades:
      process.env.NEXT_PUBLIC_FINAL_GRADES_COLLECTION_ID || "final_grades",
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
} as const;

// Типы для TypeScript
export type CollectionName = keyof typeof appwriteConfig.collections;

// Валидация переменных окружения
const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  // Collection IDs
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
] as const;

// Проверка отсутствующих переменных
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️ Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(
      ", "
    )}`
  );

  if (process.env.NODE_ENV !== "development") {
    console.error(
      "❌ В production режиме все переменные окружения обязательны!"
    );
  }
}

// Функция для получения ID коллекции с валидацией
export const getCollectionId = (collectionName: CollectionName): string => {
  const id = appwriteConfig.collections[collectionName];
  if (!id) {
    throw new Error(`ID коллекции ${collectionName} не найден в конфигурации`);
  }
  return id;
};

// Вспомогательная функция для проверки конфигурации
export const validateAppwriteConfig = (): boolean => {
  const { endpoint, projectId, databaseId } = appwriteConfig;

  if (!endpoint || !projectId || !databaseId) {
    console.error("❌ Основные параметры Appwrite не настроены");
    return false;
  }

  const emptyCollections = Object.entries(appwriteConfig.collections)
    .filter(([_, id]) => !id)
    .map(([name]) => name);

  if (emptyCollections.length > 0) {
    console.error(
      `❌ Не настроены ID коллекций: ${emptyCollections.join(", ")}`
    );
    return false;
  }

  console.log("✅ Конфигурация Appwrite валидна");
  return true;
};

// Экспорт для использования в других частях приложения
export default appwriteConfig;
