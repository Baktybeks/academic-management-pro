# Academic Management Backend

REST API на Spring Boot для проекта Academic Management Pro. Данные хранятся в PostgreSQL.

## Требования

- Java 17+
- PostgreSQL (или укажите URL в переменных окружения)

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `SPRING_DATASOURCE_URL` | URL БД | `jdbc:postgresql://localhost:5432/academic_management` |
| `SPRING_DATASOURCE_USERNAME` | Пользователь БД | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Пароль БД | `postgres` |
| `JWT_SECRET` | Секрет для подписи JWT (минимум 256 бит) | см. application.yml |
| `JWT_EXPIRATION_MS` | Время жизни JWT (мс) | `86400000` (24 ч) |
| `CORS_ORIGINS` | Разрешённые origins для CORS | `http://localhost:3000` |
| `SERVER_PORT` | Порт сервера | `8080` |

## Запуск

Если в папке `backend` нет скрипта `gradlew`, один раз выполните (нужен установленный [Gradle](https://gradle.org/install/)):  
`gradle wrapper`

```bash
# Сборка
./gradlew build
# Windows: gradlew.bat build

# Запуск
./gradlew bootRun

# С профилем dev (логи SQL)
./gradlew bootRun --args='--spring.profiles.active=dev'
```

API доступен по адресу: `http://localhost:8080`

## Первый пользователь

1. `POST /api/auth/register` с телом:
   ```json
   { "name": "Admin", "email": "admin@example.com", "password": "password123" }
   ```
   Если в БД ещё нет ни одного пользователя с ролью `SUPER_ADMIN`, первый зарегистрированный получит эту роль и будет активен.

2. Вход: `POST /api/auth/login` с `email` и `password`. В ответе — поле `token`. Дальнейшие запросы к `/api/*` выполняйте с заголовком:
   ```
   Authorization: Bearer <token>
   ```

## Основные эндпоинты

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Users**: `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/{id}`, `POST /api/users/{id}/activate`
- **Subjects**: `GET/POST /api/subjects`, `GET/PATCH/DELETE /api/subjects/{id}`
- **Groups**: `GET/POST /api/groups`, `GET/PATCH/DELETE /api/groups/{id}`

Доступ по ролям: супер-админ и академический советник — управление пользователями и группами; супер-админ — предметы и удаление. Остальные сущности (занятия, посещаемость, задания, оценки, опросы) можно добавить по аналогии с существующими контроллерами.
