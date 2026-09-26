# DesT

AI Decision Replay & Audit Platform

## Project overview

DesT is a MERN application for capturing AI decision traces, preserving the events and evidence behind each outcome, and presenting that information for audit and human review. It is designed as a final-year project demonstration and as a foundation for production-grade AI observability.

The repository contains a React/Vite client, an Express/Mongoose API, authentication flows, application and decision persistence, seed data, and API testing documentation. Some planned modules are represented by frontend pages and models but are not yet fully connected to backend routes; those limitations are called out here rather than hidden.

## Problem statement

AI systems often produce outcomes without making the reasoning process, supporting evidence, risk level, or human intervention easy to inspect. This makes debugging, compliance review, incident investigation, and accountability difficult.

DesT addresses this by storing a decision together with its ordered processing events, application context, evidence, review history, and audit metadata.

## Objectives

- Capture decision metadata and processing traces.
- Make AI outcomes explainable through replayable events and evidence.
- Support controlled human review workflows.
- Provide application-level ownership and authenticated access.
- Create a foundation for analytics, notifications, and real-time monitoring.
- Keep local configuration and secret handling explicit.

## Features

### Currently available

- React + Vite single-page application.
- Express API with MongoDB/Mongoose configuration.
- JWT-based registration, login, current-user lookup, and logout response.
- Protected client routes.
- AI application creation, listing, updating, and deletion.
- Decision ingestion, listing, and detail retrieval.
- Seed data with fictional users, applications, decisions, events, evidence, and reviews.
- Centralized backend error formatting.
- Frontend error boundary and responsive dashboard styling.
- Postman collection and testing plan.

### Planned or incomplete

- Complete server-side RBAC middleware across every module.
- Full paginated decision search/filter API.
- Database-backed replay, evidence, review, audit, analytics, and notification APIs.
- Socket.IO server/client integration.
- Backend AI analysis service.
- Recharts-based analytics dashboards.

## Architecture

```text
React/Vite browser
        |
        | Axios HTTP requests
        v
Express API (Node.js)
        |
        | Mongoose
        v
MongoDB / MongoDB Atlas
```

The client stores the current user and bearer token for the current prototype. The backend owns database access, authentication verification, and error responses.

## Technology stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Responsive CSS

### Backend

- Node.js
- Express.js
- Mongoose
- MongoDB
- dotenv
- cors
- bcryptjs
- jsonwebtoken
- nodemon for development

## Folder structure

```text
DesT/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── docs/
│   ├── TESTING_PLAN.md
│   └── postman/
├── README.md
├── .gitignore
└── package.json
```

## Installation

### Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB locally or a MongoDB Atlas cluster.

### Install dependencies

```powershell
git clone <your-repository-url>
cd DecisionTrace
npm run install:all
```

### Configure local environment

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Edit the local files with your own values. Never commit them.

### Run the API

```powershell
cd server
npm run dev
```

### Run the frontend

In a second terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Environment variables

### Backend: `server/.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=<local-or-atlas-mongodb-uri>
JWT_SECRET=<local-random-secret>
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
AI_API_KEY=
```

### Frontend: `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Only non-sensitive configuration may use the `VITE_` prefix because Vite embeds those values into browser assets.

## Database setup

### Local MongoDB

Start MongoDB locally and use:

```text
mongodb://127.0.0.1:27017/decisiontrace
```

### MongoDB Atlas

Create a cluster, create a least-privilege database user, and store the Atlas SRV URI only in the backend environment. Do not place database credentials in source code.

### Seed fictional data

```powershell
npm run seed
```

The seed script creates fictional users and realistic test records. It does not contain real personal information.

## API documentation

Development base URL:

```text
http://localhost:5000
```

### Public endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API welcome response |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | Return logout acknowledgement |

### Authenticated endpoints currently connected

Send `Authorization: Bearer <jwt>` with these requests:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/me` | Return the current user |
| GET | `/api/applications` | List owned applications |
| POST | `/api/applications` | Create an application |
| PATCH | `/api/applications/:id` | Update an owned application |
| DELETE | `/api/applications/:id` | Delete an owned application and its decisions |
| GET | `/api/decisions` | List owned decisions |
| POST | `/api/decisions/ingest` | Ingest a decision |
| GET | `/api/decisions/:id` | Get an owned decision |

Example decision ingestion:

```json
{
  "application": "<application-id>",
  "externalDecisionId": "demo-decision-001",
  "input": {
    "caseType": "fictional-support-request"
  },
  "output": {
    "decision": "human_review"
  },
  "status": "completed",
  "confidence": 0.78,
  "riskLevel": "medium"
}
```

For runnable requests and token variables, see [DecisionTrace.postman_collection.json](./docs/postman/DecisionTrace.postman_collection.json).

## Screenshots

Add project screenshots to `docs/screenshots/` and link them here:

```text
docs/screenshots/dashboard.png
docs/screenshots/decision-details.png
docs/screenshots/application-management.png
```

Example:

```markdown
![DesT dashboard](./docs/screenshots/dashboard.png)
```

Screenshots are intentionally not fabricated in this repository.

## Testing

Run the available checks from the repository root:

```powershell
npm run check
npm run lint
npm run build
```

The complete testing strategy, test IDs, expected results, manual cases, and current blocked areas are documented in [docs/TESTING_PLAN.md](./docs/TESTING_PLAN.md).

## Future enhancements

- Complete RBAC enforcement on every server route.
- HTTP-only cookie sessions or refresh-token rotation.
- Paginated decision search and filtering.
- Actual decision replay from persisted events.
- Evidence, review, and immutable audit-log workflows.
- MongoDB aggregation-based analytics.
- Socket.IO monitoring and notification delivery.
- Structured AI analysis stored separately from original decisions.
- Automated unit, API, integration, and browser test suites.
- CI/CD with dependency, lint, build, and security checks.

## Contributors

DesT is currently maintained by the project owner and contributors working through GitHub pull requests.

To contribute, create a focused branch, make a tested change, update related documentation, and open a pull request with validation results.

## GitHub setup

### Initialize Git

Run from the project root:

```powershell
git init
git branch -M main
git add .
git status
```

Review `git status` carefully. Confirm that no `.env` file, credential, token, database URI, or build output is staged.

### First commit

```powershell
git commit -m "Initial DesT project"
```

### Branch strategy

- `main`: stable, deployable code.
- `develop`: optional integration branch for the next release.
- `feature/<short-name>`: new features.
- `fix/<short-name>`: bug fixes.
- `docs/<short-name>`: documentation-only work.

Use pull requests for changes into `main`, require review, and run the check, lint, and build commands before merging.

### Protect environment files

The root `.gitignore` excludes `.env` and `.env.*` while allowing example templates. Verify protection with:

```powershell
git check-ignore -v server\.env client\.env
git status --short
```

If a secret was ever committed, rotate it immediately. Removing it from the latest commit does not make the old credential safe.

### Connect and push to GitHub

Create an empty repository on GitHub, then run:

```powershell
git remote add origin https://github.com/<github-user>/decisiontrace.git
git push -u origin main
```

For a feature branch:

```powershell
git switch -c feature/<short-name>
git push -u origin feature/<short-name>
```

Use GitHub Actions or another CI provider to run `npm ci`, `npm run check`, `npm run lint`, and `npm run build` on every pull request.
