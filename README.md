# Intervu

**Intervu** is an AI-powered interview preparation platform that helps students prepare for technical interviews through structured DSA practice, company-specific learning paths, coding workspace, AI-assisted code analysis, and personalized progress tracking.

The platform combines curated coding problems, analytics, revision planning, and intelligent recommendations into a single application, providing a complete interview preparation experience.

---

## Features

### Authentication

* Secure user registration and login using JWT authentication.
* Protected routes and role-based authorization.
* User profile management.

### DSA Question Bank

* Curated collection of coding interview problems.
* Organised by:

  * Topics
  * Patterns
  * Difficulty
  * Companies
* Advanced search and filtering.

### Interactive Coding Workspace

* Integrated online code editor.
* Multi-language code execution through Judge0 API.
* Custom test case execution.
* Submission history.

### AI Code Review

* AI-powered code analysis using Google Gemini.
* Code quality assessment.
* Complexity analysis.
* Optimization suggestions.
* Best practices recommendations.

### Personalized Dashboard

* Track solved questions.
* Monitor progress across topics.
* Learning analytics.
* Performance statistics.
* Readiness score.

### Company Preparation

* Company-specific interview preparation.
* Frequently asked coding questions.
* Readiness analysis.
* Personalized recommendations.

### Smart Revision System

* Revision scheduling.
* Spaced repetition.
* Weak topic identification.
* Personalized revision recommendations.

### Learning Roadmap

* Structured DSA roadmap.
* Pattern-based learning.
* Progress tracking.
* Guided preparation path.

---

# Technology Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* Zustand
* Axios
* React Router
* Recharts

## Backend

* Node.js
* Express.js
* PostgreSQL
* Redis
* BullMQ
* JWT Authentication

## AI & External Services

* Google Gemini API
* Judge0 API

---

# Project Architecture

```
Frontend (React + Vite)
        │
        ▼
REST API
        │
        ▼
Backend (Express.js)
        │
 ┌──────┼─────────────┐
 │      │             │
 ▼      ▼             ▼
PostgreSQL Redis   Gemini API
 │                  │
 ▼                  ▼
Application Data   AI Analysis

        │
        ▼
 Judge0 API
```

---

# Project Structure

```
Intervu
│
├── frontend/                 # React application
├── src/                      # Express backend
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# Getting Started

## Prerequisites

* Node.js 20+
* PostgreSQL
* Redis
* Git

---

## Clone the Repository

```bash
git clone https://github.com/abhinavduddala/Intervu.git

cd Intervu
```

---

## Install Backend Dependencies

```bash
npm install
```

---

## Install Frontend Dependencies

```bash
cd frontend

npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

NODE_ENV=development

DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=

GEMINI_MODEL=gemini-2.5-flash

JUDGE0_API_URL=

JUDGE0_API_KEY=
```

---

## Run the Backend

```bash
npm run dev
```

---

## Run the Frontend

```bash
cd frontend

npm run dev
```

---

# API Modules

* Authentication
* User Management
* Questions
* Submissions
* AI Analysis
* Company Readiness
* Recommendations
* Revision
* Roadmap

---

# Key Capabilities

* AI-powered code reviews
* Online code execution
* Company-wise interview preparation
* Topic and pattern-based learning
* Personalized recommendations
* Performance analytics
* Progress tracking
* Revision scheduling
* Interactive coding workspace

---

# Future Enhancements

* Contest Mode
* Mock Interview Simulator
* Interview Experience Repository
* Resume Analyzer
* Behavioral Interview Preparation
* Leaderboards
* Discussion Forum
* Email Notifications
* GitHub Integration
* AI Voice Interviewer
* Mobile Application

---

# Deployment

## Frontend

* Vercel

## Backend

* Render

## Database

* PostgreSQL

---

