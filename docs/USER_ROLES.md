# Роли пользователей и доступ

## Роли (UserRole)

| Роль              | Метка в UI           | Описание |
|-------------------|----------------------|----------|
| `SUPER_ADMIN`     | Супер админ          | Полный доступ к настройкам системы |
| `ACADEMIC_ADVISOR`| Академ. советник     | Курирование групп, студентов, отчёты |
| `TEACHER`         | Преподаватель        | Занятия, посещаемость, задания, оценки |
| `STUDENT`         | Студент              | Просмотр заданий, сдача работ, оценки, опросы |

Роли и цвета заданы в `src/types/index.ts` (`UserRole`, `UserRoleLabels`, `UserRoleColors`).

## Маршруты по ролям

### Супер-админ (`/super-admin`)

- `/super-admin` — главная панель
- `/super-admin/users` — пользователи
- `/super-admin/subjects` — предметы
- `/super-admin/groups` — группы
- `/super-admin/academic-advisor` — академические советники
- `/super-admin/grading-periods` — периоды оценивания
- `/super-admin/surveys` — опросы
- `/super-admin/survey-periods` — периоды опросов
- `/super-admin/reports` — отчёты
- `/super-admin/settings` — настройки

### Академический советник (`/academic-advisor`)

- `/academic-advisor` — главная
- `/academic-advisor/students` — студенты
- `/academic-advisor/groups` — группы
- `/academic-advisor/teachers` — преподаватели
- `/academic-advisor/attendance` — посещаемость
- `/academic-advisor/assignments` — задания
- `/academic-advisor/grades` — оценки
- `/academic-advisor/reports` — отчёты
- `/academic-advisor/survey-results` — результаты опросов
- `/academic-advisor/activation` — активация пользователей

### Преподаватель (`/teacher`)

- `/teacher` — главная
- `/teacher/lessons` — занятия (список и создание)
- `/teacher/lessons/create` — создание занятия
- `/teacher/group/[groupId]/subject/[subjectId]` — группа/предмет
- `/teacher/attendance/lesson/[lessonId]` — посещаемость по занятию
- `/teacher/assignments` — задания
- `/teacher/assignments/create` — создание задания
- `/teacher/assignments/[assignmentId]/submissions` — сдачи по заданию
- `/teacher/submissions` — все сдачи
- `/teacher/grades` — оценки

### Студент (`/student`)

- `/student` — главная
- `/student/assignments` — задания
- `/student/grades` — оценки
- `/student/attendance` — посещаемость
- `/student/surveys` — опросы

## Логика middleware

- **Публичные пути**: `/login`, `/register` — доступны без авторизации; при наличии активного пользователя — редирект на дашборд по роли.
- **Остальные пути**: требуют авторизации и `user.isActive === true` (кроме SUPER_ADMIN, который может заходить при неактивном флаге).
- **Проверка роли**: при заходе на `/super-admin`, `/academic-advisor`, `/teacher`, `/student` проверяется соответствие роли; при несоответствии — редирект на дашборд своей роли.
- **Главная `/`**: редирект на дашборд по роли.

Код: `src/middleware.ts`.
