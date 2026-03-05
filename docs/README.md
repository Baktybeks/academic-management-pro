# Документация Academic Management Pro

Краткий указатель по документации проекта.

## Документы

| Документ | Описание |
|----------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Архитектура: структура проекта, поток данных, технологии, безопасность |
| [USER_ROLES.md](./USER_ROLES.md) | Роли пользователей и доступ к маршрутам (супер-админ, советник, преподаватель, студент) |
| [DATABASE.md](./DATABASE.md) | Схема БД Appwrite: коллекции, поля, скрипты setup/reset |
| [API_AND_SERVICES.md](./API_AND_SERVICES.md) | Сервисы и API: работа с Appwrite, аутентификация, типы и DTO |
| [SETUP.md](./SETUP.md) | Установка, переменные окружения, первый запуск и команды |

## Быстрый старт

1. Установить зависимости: `npm install`
2. Настроить `.env.local` (см. [SETUP.md](./SETUP.md))
3. Создать коллекции в Appwrite: `npm run db:setup`
4. Запустить: `npm run dev`

Подробности — в [SETUP.md](./SETUP.md).
