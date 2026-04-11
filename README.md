# Minyeo Farm MVP

Monorepo for Minyeo Farm online store.

## Structure

- `backend`: Spring Boot API server (Java 17, Spring Security, JPA, MySQL, JWT, Toss skeleton, Naver OAuth skeleton)
- `frontend`: Next.js App Router (TypeScript) client

## Run (Local)

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
