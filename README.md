# Student Hub

Выполнил: Афонин Даниил Витальевич
Группа: ТРПО24-4

Полностью готовый локальный запуск состоит из PostgreSQL, Spring Boot API и React-интерфейса.

## Запуск через Docker Compose

Установите и запустите Docker Desktop, затем в терминале перейдите в корневую папку проекта. Docker Compose скачает необходимые базовые образы, соберёт frontend и backend, запустит PostgreSQL и приложение:

```bash
docker compose up --build -d
```

Дождитесь, пока база данных получит статус `healthy`:

```bash
docker compose ps
```

Откройте `http://localhost`. Если порт `80` занят, запустите проект на другом порту:

```bash
FRONTEND_PORT=8081 docker compose up --build -d
```

В этом случае откройте `http://localhost:8081`. При последующих запусках с тем же портом укажите `FRONTEND_PORT=8081` и в командах `docker compose`.

Посмотреть логи, если какой-либо контейнер не запустился:

```bash
docker compose logs
```

Остановка:

```bash
docker compose down
```

Остановка с удалением данных PostgreSQL:

```bash
docker compose down -v
```

По умолчанию PostgreSQL хранится в Docker volume `postgres-data`. При первом запуске Spring Boot автоматически создаёт схему, таблицы, тестовых пользователей и демонстрационных студентов.

## Тестовые аккаунты

При первом запуске приложения автоматически создаются эти учётные записи:

| Email | Пароль | Роль | Что можно проверить |
|---|---|---|---|
| `superadmin@example.com` | `superAdmin` | `SUPER_ADMIN` | Просмотр и управление командой и ролями |
| `admin@example.com` | `admin` | `ADMIN` | Просмотр, добавление, изменение и удаление учеников |
| `teacher@example.com` | `teacher` | `TEACHER` | Просмотр карточек учеников |

Войдите на `http://localhost` (или на выбранном `FRONTEND_PORT`) с email и паролем из таблицы. В чистой базе также создаются пять демонстрационных учеников. Эти пароли предназначены только для локального тестирования — не используйте их в опубликованном окружении.

## Локальный запуск без Docker

Backend:

```bash
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

В этом режиме фронтенд доступен на `http://localhost:5173`, а Vite проксирует `/api` на backend `http://localhost:8080`.
