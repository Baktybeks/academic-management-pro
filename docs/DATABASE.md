# База данных (Appwrite)

## Обзор

Используется **Appwrite**: одна база данных, коллекции задаются через переменные окружения (см. `src/constants/appwriteConfig.ts` и `scripts/setupCollections.js`). Схема и индексы создаются скриптами `db:setup`, `db:reset`, `db:reset-setup`.

## Коллекции

| Коллекция              | Назначение |
|------------------------|------------|
| `users`                | Пользователи: name, email, role, isActive |
| `subjects`             | Предметы: title, description, createdBy, isActive |
| `groups`               | Группы: title, studentIds[], createdBy |
| `teacher_assignments`  | Назначения преподаватель–группа–предмет |
| `lessons`              | Занятия: title, date, groupId, subjectId, teacherId |
| `attendance`           | Посещаемость: lessonId, studentId, present |
| `assignments`          | Задания: title, description, groupId, subjectId, teacherId, dueDate, maxScore |
| `assignment_submissions` | Сдачи: assignmentId, studentId, submissionUrl, score, comment, isChecked |
| `grading_periods`      | Периоды оценивания: title, startDate, endDate, isActive |
| `final_grades`         | Итоговые оценки: studentId, subjectId, groupId, teacherId, gradingPeriodId, totalScore, letterGrade |
| `surveys`              | Опросы: title, description, isActive, createdBy |
| `survey_questions`     | Вопросы опроса: surveyId, text, order |
| `survey_periods`       | Периоды опроса: surveyId, startDate, endDate, isActive |
| `survey_responses`     | Ответы на опрос: surveyId, studentId, teacherId, subjectId, surveyPeriodId, submittedAt |
| `survey_answers`       | Ответы на вопросы: responseId, questionId, value (0–10) |

## Роли пользователей (поле `role` в `users`)

- `SUPER_ADMIN`
- `ACADEMIC_ADVISOR`
- `TEACHER`
- `STUDENT`

## Итоговые оценки (letterGrade)

- `отлично` (87–100)
- `хорошо` (74–86)
- `удовлетворительно` (61–73)
- `неудовлетворительно` (0–60)

Константы и функция пересчёта — в `src/types/index.ts` (`GRADE_SCALE`, `getLetterGrade`).

## Скрипты

- `npm run db:test` — проверка подключения к Appwrite.
- `npm run db:setup` — создание коллекций и атрибутов по схеме (если ещё нет).
- `npm run db:reset` — удаление коллекций.
- `npm run db:reset-setup` — reset + setup.

Для скриптов нужен `APPWRITE_API_KEY` в `.env.local`. Схема и индексы описаны в `scripts/setupCollections.js` (`COLLECTION_SCHEMAS`, `COLLECTION_INDEXES`).

## Переменные окружения (коллекции)

В `.env.local` задаются ID коллекций, например:

- `NEXT_PUBLIC_USERS_COLLECTION_ID`
- `NEXT_PUBLIC_SUBJECTS_COLLECTION_ID`
- `NEXT_PUBLIC_GROUPS_COLLECTION_ID`
- … (полный список в `appwriteConfig.ts`).

Если переменная не задана, используется имя по умолчанию (например, `users`, `subjects`).
