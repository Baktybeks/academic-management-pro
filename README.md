# Academic Management Pro

Веб-приложение для управления учебным процессом: пользователи, группы, предметы, занятия, посещаемость, задания, оценки и опросы.

## Стек

- **Next.js 15** (App Router)
- **Appwrite** — база данных и аутентификация
- **React Query** — кэш и запросы
- **Zustand** — состояние авторизации
- **Tailwind CSS** — стили
- **TypeScript**

## Роли

- **Супер-админ** — настройка системы (пользователи, предметы, группы, периоды оценок, опросы, отчёты)
- **Академический советник** — студенты, группы, преподаватели, посещаемость, задания, оценки, отчёты, опросы
- **Преподаватель** — занятия, посещаемость, задания, сдачи, оценки
- **Студент** — задания, сдача работ, оценки, посещаемость, опросы

## Быстрый старт

```bash
npm install
cp .env.example .env.local
# Заполните .env.local (Appwrite endpoint, projectId, databaseId, ID коллекций, при необходимости APPWRITE_API_KEY)
npm run db:setup   # создание коллекций в Appwrite
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Первый зарегистрированный пользователь станет супер-админом.

## Документация

Вся документация находится в папке **[docs/](./docs/)**:

| Документ | Описание |
|----------|----------|
| [docs/README.md](./docs/README.md) | Оглавление документации |
| [docs/SETUP.md](./docs/SETUP.md) | Установка и настройка |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Архитектура проекта |
| [docs/USER_ROLES.md](./docs/USER_ROLES.md) | Роли и маршруты |
| [docs/DATABASE.md](./docs/DATABASE.md) | Схема БД Appwrite |
| [docs/API_AND_SERVICES.md](./docs/API_AND_SERVICES.md) | Сервисы и API |

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Режим разработки |
| `npm run build` | Сборка |
| `npm run start` | Запуск production |
| `npm run lint` | Линтер |
| `npm run db:test` | Проверка подключения к Appwrite |
| `npm run db:setup` | Создание коллекций |
| `npm run db:reset` | Удаление коллекций |
| `npm run db:reset-setup` | Сброс и создание коллекций |

## Лицензия

Private.
