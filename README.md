# AI Interview Web App

A MERN-style mock interview app for frontend, backend, and fullstack practice. Candidates can sign up, choose a role and seniority, take a 20-25 question adaptive interview, and review a scored report with strengths, weaknesses, tips, and transcript history.

## Stack

- React + Vite frontend
- Node.js + Express API
- MongoDB + Mongoose persistence
- OpenAI Responses API for question generation and evaluation

## Features

- JWT email/password authentication
- Role-scoped interviews for `frontend`, `backend`, and `fullstack`
- Seniority-aware question depth for `junior`, `mid`, and `senior`
- Adaptive interview targets between 20 and 25 questions
- Resume in-progress sessions after refresh
- Score reports with rubric categories and full transcripts
- Mock AI fallback in development when no OpenAI key is configured

## Project Structure

```text
client/   React application
server/   Express API and MongoDB models
```

## Environment

Create local env files from:

- [client/.env.example](/C:/Users/tufai/OneDrive/Documents/New%20project/client/.env.example)
- [server/.env.example](/C:/Users/tufai/OneDrive/Documents/New%20project/server/.env.example)

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

The client defaults to `http://localhost:5173` and the API defaults to `http://localhost:5000`.

## Test

```bash
npm test
```

The included test suite covers the pure interview planning utilities so it can run without a live database or API key.

## OpenAI Notes

The server uses the official JavaScript SDK and the Responses API with structured JSON outputs. By default it reads `OPENAI_API_KEY` from the environment and uses `gpt-5-mini` unless `OPENAI_MODEL` is set.
