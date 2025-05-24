// scripts/setupCollections.js
const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
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
};

const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    role: {
      type: "enum",
      required: true,
      elements: ["SUPER_ADMIN", "ACADEMIC_ADVISOR", "TEACHER", "STUDENT"],
    },
    isActive: { type: "boolean", required: false, default: false },
    createdAt: { type: "datetime", required: true },
    createdBy: { type: "string", required: false },
  },

  subjects: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: false, size: 1000 },
    createdBy: { type: "string", required: true, size: 36 },
    isActive: { type: "boolean", required: false, default: true },
    createdAt: { type: "datetime", required: true },
  },

  groups: {
    title: { type: "string", required: true, size: 255 },
    studentIds: { type: "string", required: false, array: true },
    createdBy: { type: "string", required: true, size: 36 },
    createdAt: { type: "datetime", required: true },
  },

  teacherAssignments: {
    teacherId: { type: "string", required: true, size: 36 },
    groupId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    assignedBy: { type: "string", required: true, size: 36 },
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
    present: { type: "boolean", required: false, default: false },
    createdAt: { type: "datetime", required: true },
  },

  assignments: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 2000 },
    groupId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    dueDate: { type: "datetime", required: true },
    maxScore: { type: "integer", required: false, default: 100 },
    isActive: { type: "boolean", required: false, default: true },
    createdAt: { type: "datetime", required: true },
  },

  assignmentSubmissions: {
    assignmentId: { type: "string", required: true, size: 36 },
    studentId: { type: "string", required: true, size: 36 },
    submissionUrl: { type: "url", required: true, size: 500 },
    submittedAt: { type: "datetime", required: true },
    score: { type: "integer", required: false, min: 0, max: 100 },
    comment: { type: "string", required: false, size: 1000 },
    isChecked: { type: "boolean", required: false, default: false },
    checkedAt: { type: "datetime", required: false },
    checkedBy: { type: "string", required: false, size: 36 },
  },

  gradingPeriods: {
    title: { type: "string", required: true, size: 255 },
    description: { type: "string", required: false, size: 1000 },
    startDate: { type: "datetime", required: true },
    endDate: { type: "datetime", required: true },
    isActive: { type: "boolean", required: false, default: false },
    createdBy: { type: "string", required: true, size: 36 },
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
    isActive: { type: "boolean", required: false, default: true },
    createdBy: { type: "string", required: true, size: 36 },
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
    isActive: { type: "boolean", required: false, default: false },
    createdBy: { type: "string", required: true, size: 36 },
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
    responseId: { type: "string", required: true, size: 36 },
    questionId: { type: "string", required: true, size: 36 },
    value: { type: "integer", required: true, min: 0, max: 10 },
    createdAt: { type: "datetime", required: true },
  },
};

const COLLECTION_INDEXES = {
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

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const createAttribute = async (databaseId, collectionId, key, schema) => {
  try {
    const attributeType = schema.type;

    let isRequired = schema.required || false;
    let defaultValue = schema.default;

    if (isRequired && defaultValue !== null && defaultValue !== undefined) {
      console.log(
        `    ⚠️ Исправление ${key}: required=true с default значением -> required=false`
      );
      isRequired = false;
    }

    switch (attributeType) {
      case "string":
        return await databases.createStringAttribute(
          databaseId,
          collectionId,
          key,
          schema.size || 255,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "email":
        return await databases.createEmailAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "enum":
        return await databases.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          schema.elements,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "boolean":
        return await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue !== null && defaultValue !== undefined
            ? defaultValue
            : null,
          schema.array || false
        );

      case "datetime":
        return await databases.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "integer":
        return await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "url":
        return await databases.createUrlAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      default:
        throw new Error(`Неподдерживаемый тип атрибута: ${attributeType}`);
    }
  } catch (error) {
    console.error(`Ошибка создания атрибута ${key}:`, error.message);
    throw error;
  }
};

const createIndex = async (databaseId, collectionId, indexConfig) => {
  try {
    return await databases.createIndex(
      databaseId,
      collectionId,
      indexConfig.key,
      indexConfig.type,
      indexConfig.attributes || [indexConfig.key],
      indexConfig.orders || ["ASC"]
    );
  } catch (error) {
    console.error(`Ошибка создания индекса ${indexConfig.key}:`, error.message);
    throw error;
  }
};

const setupCollections = async () => {
  try {
    console.log("🚀 Начинаем создание коллекций...");
    console.log(
      "📋 Всего коллекций для создания:",
      Object.keys(COLLECTION_SCHEMAS).length
    );

    const databaseId = appwriteConfig.databaseId;

    if (!databaseId) {
      throw new Error("Database ID не найден! Проверьте переменные окружения.");
    }

    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      console.log(`\n📁 Создание коллекции: ${collectionName}`);

      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          collectionName,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          false
        );

        console.log(
          `  ✅ Коллекция ${collectionName} создана (ID: ${collectionId})`
        );

        console.log(`  📝 Добавление атрибутов...`);
        let attributeCount = 0;

        for (const [attributeKey, attributeSchema] of Object.entries(schema)) {
          try {
            await createAttribute(
              databaseId,
              collectionId,
              attributeKey,
              attributeSchema
            );
            attributeCount++;
            console.log(`    ✅ ${attributeKey} (${attributeSchema.type})`);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`    ❌ ${attributeKey}: ${error.message}`);
          }
        }

        console.log(
          `  📊 Создано атрибутов: ${attributeCount}/${
            Object.keys(schema).length
          }`
        );

        if (COLLECTION_INDEXES[collectionName]) {
          console.log(`  🔍 Создание индексов...`);
          let indexCount = 0;

          for (const indexConfig of COLLECTION_INDEXES[collectionName]) {
            try {
              await createIndex(databaseId, collectionId, indexConfig);
              indexCount++;
              console.log(`    ✅ Индекс: ${indexConfig.key}`);

              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(
                `    ❌ Индекс ${indexConfig.key}: ${error.message}`
              );
            }
          }

          console.log(
            `  📈 Создано индексов: ${indexCount}/${COLLECTION_INDEXES[collectionName].length}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Ошибка создания коллекции ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка коллекций завершена!");
    console.log("🔗 Откройте консоль Appwrite для проверки результата.");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("- Переменные окружения в .env.local");
    console.log("- Права доступа API ключа");
    console.log("- Подключение к интернету");
  }
};

const resetCollections = async () => {
  try {
    console.log("🗑️ Удаление существующих коллекций...");

    const databaseId = appwriteConfig.databaseId;
    let deletedCount = 0;

    for (const [collectionName] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];
        await databases.deleteCollection(databaseId, collectionId);
        deletedCount++;
        console.log(`✅ ${collectionName} удалена`);
      } catch (error) {
        console.log(`⚠️ ${collectionName} не найдена или уже удалена`);
      }
    }

    console.log(`🧹 Удалено коллекций: ${deletedCount}`);
  } catch (error) {
    console.error("Ошибка при удалении коллекций:", error.message);
  }
};

const checkEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Отсутствуют переменные окружения:");
    missing.forEach((env) => console.error(`  - ${env}`));
    console.log("\n💡 Создайте файл .env.local с необходимыми переменными");
    process.exit(1);
  }

  console.log("✅ Все переменные окружения найдены");
};

const main = async () => {
  console.log("🔧 Academic Management - Настройка базы данных\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "setup":
      await setupCollections();
      break;
    case "reset":
      await resetCollections();
      break;
    case "reset-setup":
      await resetCollections();
      console.log("\n⏳ Ожидание 3 секунды перед созданием...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await setupCollections();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupCollections.js setup        - Создать коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset        - Удалить коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset-setup  - Пересоздать коллекции"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}
