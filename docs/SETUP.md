# Установка и запуск

## Требования

- Node.js 18+
- npm или yarn
- Аккаунт [Appwrite](https://appwrite.io) (облако или self-hosted)

## 1. Клонирование и зависимости

```bash
git clone <repo-url>
cd academic-management-pro
npm install
```

## 2. Переменные окружения

Скопируйте пример и заполните значения:

```bash
cp .env.example .env.local
```

В `.env.local` должны быть заданы (см. также `src/constants/appwriteConfig.ts`):

- `NEXT_PUBLIC_BASE_URL` — базовый URL приложения (например, http://localhost:3000)
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` — например, https://cloud.appwrite.io/v1
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` — ID проекта в Appwrite
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` — ID базы данных
- ID всех коллекций:  
  `NEXT_PUBLIC_USERS_COLLECTION_ID`, `NEXT_PUBLIC_SUBJECTS_COLLECTION_ID`, `NEXT_PUBLIC_GROUPS_COLLECTION_ID`, и т.д.

Для скриптов создания/сброса БД дополнительно:

- `APPWRITE_API_KEY` — API Key с правами на создание/удаление коллекций и запись данных

Имена переменных для коллекций перечислены в `appwriteConfig.ts`; при отсутствии переменной подставляется имя по умолчанию (users, subjects, groups, …).

## 3. Appwrite

1. В консоли Appwrite создайте проект и базу данных.
2. Либо создайте коллекции вручную по схеме из `scripts/setupCollections.js`, либо выполните скрипты (требуется API Key в `.env.local`):

```bash
# Проверка подключения
npm run db:test

# Создать коллекции и атрибуты
npm run db:setup

# При необходимости: сброс и повторное создание
npm run db:reset-setup
```

## 4. Запуск

```bash
# Режим разработки
npm run dev
```

Откройте http://localhost:3000. Неавторизованный пользователь будет перенаправлен на `/login`.

## 5. Первый вход

Если в базе ещё нет пользователей с ролью `SUPER_ADMIN`, первый зарегистрированный пользователь получит роль супер-админа. Далее супер-админ может создавать и активировать пользователей через `/super-admin/users` и страницу активации академического советника.

## Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для production |
| `npm run start` | Запуск production-сервера |
| `npm run lint` | Проверка линтером |
| `npm run db:test` | Проверка подключения к Appwrite |
| `npm run db:setup` | Создание коллекций |
| `npm run db:reset` | Удаление коллекций |
| `npm run db:reset-setup` | Сброс и создание коллекций заново |

Подробнее о ролях и маршрутах: [USER_ROLES.md](./USER_ROLES.md). О структуре БД: [DATABASE.md](./DATABASE.md).
