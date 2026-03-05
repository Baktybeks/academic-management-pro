# API и сервисы

## Обзор

Серверная логика и доступ к данным реализованы через:

1. **Сервисы в `src/services/`** — вызовы Appwrite из клиента (браузер): БД и Account.
2. **API Routes в `src/app/api/`** — HTTP-эндпоинты Next.js (например, проверка админов).

Коллекции и проект Appwrite задаются в `src/constants/appwriteConfig.ts`.

## Сервисы (src/services/)

| Сервис | Назначение |
|--------|------------|
| `appwriteClient.ts` | Общий клиент Appwrite (Client, Account, Databases). |
| `authService.ts` | Регистрация, вход, выход, получение текущего пользователя из БД по сессии Appwrite. |
| `userService.ts` | CRUD пользователей (список, создание, обновление, активация). |
| `subjectService.ts` | Предметы. |
| `groupService.ts` | Группы, привязка студентов. |
| `teacherAssignmentService.ts` | Назначения преподаватель–группа–предмет. |
| `lessonService.ts` | Занятия. |
| `attendanceService.ts` | Посещаемость по занятиям. |
| `attendanceAnalytics.ts` | Аналитика посещаемости. |
| `assignmentService.ts` | Задания. |
| `gradingPeriodService.ts` | Периоды оценивания. |
| `surveyService.ts` | Опросы и вопросы. |
| `surveyPeriodService.ts` | Периоды опросов. |
| `surveyResponseService.ts` | Ответы на опросы. |

В компонентах эти сервисы обычно вызываются внутри React Query (`useQuery`, `useMutation`) с последующей инвалидацией кэша.

## Аутентификация (authService)

- **getCurrentUser()** — по текущей сессии Appwrite ищет документ в `users` по email; возвращает пользователя, `null` или `{ notActivated: true }`.
- **register(name, email, password, role?)** — создаёт аккаунт в Appwrite и документ в `users` (если нет ни одного SUPER_ADMIN, первый пользователь становится SUPER_ADMIN).
- **login(email, password)** — вход через Appwrite Account.
- **logout()** — завершение сессии.

Активное состояние хранится в Zustand (`authStore`) и синхронизируется с cookie для middleware (`useSyncAuthCookie`).

## API Routes (src/app/api/)

- **check-admins** — проверка наличия супер-админов (используется при первой настройке/регистрации).

Остальная работа с данными идёт напрямую через сервисы и Appwrite из клиента.

## Типы и DTO

Интерфейсы сущностей и DTO для создания/обновления описаны в `src/types/index.ts`: User, Subject, Group, Lesson, Attendance, Assignment, AssignmentSubmission, GradingPeriod, FinalGrade, Survey, SurveyQuestion, SurveyPeriod, SurveyResponse, SurveyAnswer, а также Create/Update DTO и константы оценок.
