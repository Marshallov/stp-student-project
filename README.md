# Student Hub

Выполнил: Афонин Даниил Витальевич
Группа: ТРПО24-4

Локальный запуск без Docker состоит из Spring Boot API, временной H2 базы данных и React-интерфейса. Для постоянного хранения данных можно подключить PostgreSQL.

## Содержание

- [Требования](#требования)
- [Запуск без Docker](#запуск-без-docker)
- [Тестовые аккаунты](#тестовые-аккаунты)
- [Тесты и покрытие JaCoCo](#тесты-и-покрытие-jacoco)
- [Запуск через Docker Compose](#запуск-через-docker-compose)

## Требования

Для запуска приложения без Docker установите:

- **JDK 21**. Для сборки нужен именно JDK, а не только JRE.
- **Node.js 22** и npm для запуска React-интерфейса.
- Git — чтобы получить исходный код из репозитория.

Maven Wrapper входит в репозиторий и сам загрузит Maven нужной версии при первом запуске. Устанавливать Maven отдельно не требуется. PostgreSQL для обычного локального запуска также не нужен: приложение использует встроенную H2 in-memory базу данных.

Ссылки на официальные инструкции:

- [Загрузка JDK 21](https://adoptium.net/temurin/releases/?version=21)
- [Загрузка PostgreSQL](https://www.postgresql.org/download/)
- [Загрузка Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

После установки проверьте версии в терминале:

```bash
java -version
javac -version
node --version
npm --version
```

Для Java и компилятора должна отображаться версия 21.

## Запуск без Docker

В этом варианте backend и frontend запускаются локально. Для быстрого запуска достаточно JDK и Node.js: backend сам создаст временную базу H2 в памяти. PostgreSQL можно подключить отдельно, если необходимо сохранять данные между перезапусками.

### 1. Получите исходный код

```bash
git clone https://github.com/Marshallov/stp-student-project.git
cd stp-student-project
```

Если проект уже скачан архивом или через Git, откройте терминал в корневой папке проекта — там, где находятся `pom.xml` и папка `frontend`.

### 2. Запустите backend

Откройте первый терминал в корневой папке проекта и запустите backend.

**macOS или Linux:**

```bash
./mvnw clean spring-boot:run
```

**Windows (PowerShell):**

```powershell
.\mvnw.cmd clean spring-boot:run
```

При первом запуске Maven Wrapper загрузит Maven, поэтому может потребоваться подключение к интернету. Не закрывайте терминал: он нужен, пока работает backend. API запускается на `http://localhost:8080`.

По умолчанию приложение использует H2 in-memory: никаких дополнительных установок и переменных для базы не требуется. Все таблицы, тестовые аккаунты и демонстрационные студенты создаются автоматически. Данные в этой базе сбрасываются после остановки backend.

#### Необязательно: подключение PostgreSQL вместо H2

Если данные должны сохраняться после перезапуска, установите и запустите PostgreSQL, создайте базу `students_db`, затем перед запуском backend задайте параметры подключения.

Например, подключитесь к PostgreSQL под администратором и создайте отдельную роль и базу:

```sql
CREATE ROLE student_app WITH LOGIN PASSWORD 'your-password';
CREATE DATABASE students_db OWNER student_app;
```

**macOS или Linux:**

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/students_db
export SPRING_DATASOURCE_USERNAME=student_app
export SPRING_DATASOURCE_PASSWORD=your-password
./mvnw clean spring-boot:run
```

**Windows (PowerShell):**

```powershell
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/students_db"
$env:SPRING_DATASOURCE_USERNAME = "student_app"
$env:SPRING_DATASOURCE_PASSWORD = "your-password"
.\mvnw.cmd clean spring-boot:run
```

Для разработки не используйте простой пароль из примера. Приложение само создаст схему `students_schema`. Остальные параметры подключения описаны в `src/main/resources/application.yml`.

### 3. Запустите frontend

Откройте второй терминал:

```bash
cd frontend
npm ci
npm run dev
```

Откройте **http://localhost:5173**. Запросы frontend с путём `/api` автоматически перенаправляются на backend `http://localhost:8080`. Убедитесь, что оба терминала остаются запущенными.

### 4. Войдите в приложение

Для первого входа используйте один из автоматически создаваемых локальных аккаунтов из таблицы [Тестовые аккаунты](#тестовые-аккаунты). Они предназначены только для разработки и демонстрации; не используйте эти пароли в доступном из интернета окружении.

### 5. Остановите приложение

В терминалах backend и frontend нажмите **Ctrl+C**. При следующем запуске с H2 in-memory будут созданы новые демонстрационные данные.

## Тестовые аккаунты

При первом запуске приложения автоматически создаются эти учётные записи:

| Email | Пароль | Роль | Что можно проверить |
|---|---|---|---|
| `superadmin@example.com` | `superAdmin` | `SUPER_ADMIN` | Просмотр и управление командой и ролями |
| `admin@example.com` | `admin` | `ADMIN` | Просмотр, добавление, изменение и удаление учеников |
| `teacher@example.com` | `teacher` | `TEACHER` | Просмотр карточек учеников |

В чистой базе также создаются пять демонстрационных учеников. Эти учётные данные предназначены только для локального тестирования — не используйте их в опубликованном окружении.

## Тесты и покрытие JaCoCo

Для запуска unit-тестов, проверки минимального покрытия строк 80% и генерации отчётов выполните из корневой папки проекта:

```bash
./mvnw clean verify
```

В Windows PowerShell используйте `.\mvnw.cmd clean verify`. Команда компилирует backend, выполняет тесты и завершится ошибкой, если покрытие строк окажется ниже 80%. Для проверки тестов PostgreSQL запускать не требуется.

Отчёты JaCoCo создаются после успешной сборки:

- HTML: `target/site/jacoco/index.html`
- XML: `target/site/jacoco/jacoco.xml`

HTML-отчёт можно открыть браузером. Если вы меняли исходный код или тесты, выполните `./mvnw clean verify` повторно, чтобы сформировать свежий отчёт.

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

Войдите на `http://localhost` (или на выбранном `FRONTEND_PORT`) с данными из раздела [Тестовые аккаунты](#тестовые-аккаунты). В чистой базе также создаются пять демонстрационных учеников. Эти пароли предназначены только для локального тестирования — не используйте их в опубликованном окружении.
