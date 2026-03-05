# Архитектура проекта Academic Management Pro

## Обзор

**Academic Management Pro** — веб-приложение для управления учебным процессом: пользователи, группы, предметы, занятия, посещаемость, задания, оценки и опросы. Стек: **Next.js 15** (App Router), **Appwrite** (БД и аутентификация), **React Query**, **Zustand**, **Tailwind CSS**.

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Группа маршрутов: логин, регистрация
│   ├── (dashboard)/        # Защищённый дашборд по ролям
│   │   ├── super-admin/    # Супер-админ
│   │   ├── academic-advisor/ # Академический советник
│   │   ├── teacher/        # Преподаватель
│   │   └── student/        # Студент
│   ├── api/                # API Routes (Next.js)
│   ├── layout.tsx
│   ├── page.tsx            # Редирект по роли
│   └── providers.tsx       # React Query, тосты, синхронизация auth
├── components/
│   ├── common/             # Navbar, Layout
│   ├── attendance/         # Таблицы, фильтры, аналитика посещаемости
│   ├── grades/             # Карточки оценок, таблицы, фильтры
│   └── ...
├── constants/
│   └── appwriteConfig.ts   # Endpoint, projectId, databaseId, коллекции
├── hooks/
│   ├── useAuth.ts
│   └── useSyncAuthCookie.ts # Синхронизация auth-storage в cookie для middleware
├── middleware.ts           # Защита маршрутов, редирект по роли
├── services/               # Работа с Appwrite (БД, аккаунт)
├── store/
│   └── authStore.ts        # Zustand: user, login, logout
└── types/
    └── index.ts            # UserRole, сущности, DTO, константы оценок
```

## Поток данных

1. **Аутентификация**: Appwrite Account (email/password) + документ пользователя в коллекции `users` (роль, `isActive`). Сессия хранится в cookie `auth-storage` (Zustand persist), middleware читает cookie и редиректит по роли.
2. **Данные**: Сервисы в `src/services/` используют Appwrite SDK (Databases). Компоненты запрашивают данные через React Query (useQuery/useMutation), кэш и инвалидация — через QueryClient.
3. **Состояние**: Глобальное состояние авторизации — Zustand (`authStore`). Остальное — серверное состояние через React Query.

## Роли и маршруты

| Роль              | Префикс маршрута   | Назначение |
|-------------------|--------------------|------------|
| SUPER_ADMIN       | `/super-admin`     | Пользователи, предметы, группы, периоды оценок, опросы, отчёты, настройки |
| ACADEMIC_ADVISOR  | `/academic-advisor` | Студенты, группы, преподаватели, посещаемость, задания, оценки, отчёты, опросы |
| TEACHER           | `/teacher`         | Занятия, посещаемость, задания, сдача работ, оценки |
| STUDENT           | `/student`         | Задания, сдача, оценки, посещаемость, опросы |

Подробнее: [USER_ROLES.md](./USER_ROLES.md).

## Ключевые технологии

- **Next.js 15** — App Router, Server/Client Components, API routes.
- **Appwrite** — хостинг БД, аутентификация; доступ из браузера и из API (node-appwrite в скриптах).
- **TanStack React Query** — кэш, фоновое обновление, мутации.
- **Zustand** — хранилище пользователя и синхронизация с cookie для middleware.
- **Tailwind CSS** — стили.
- **TypeScript** — типы в `src/types/index.ts`.

## Безопасность

- Middleware проверяет наличие и активность пользователя (`isActive`), иначе редирект на `/login`.
- Доступ к маршрутам разграничен по роли: обращение к чужому префиксу приводит к редиректу на дашборд своей роли.
- Права на уровне данных задаются в Appwrite (коллекции, атрибуты, индексы) и при необходимости через API Key в серверных скриптах.

Подробнее: [SETUP.md](./SETUP.md), [DATABASE.md](./DATABASE.md).
