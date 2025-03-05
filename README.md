Clone the forked repository from your terminal:

git clone git@github.com:<github_username>/refly.git
3. Verify dependencies
Refly requires the following dependencies to build:

Docker
Docker Compose
Node.js v20.x (LTS)
4. Installation
Refly consists of multiple packages managed in a monorepo structure. The main components are:

Web Application (apps/web/): The main web interface
API Server (apps/api/): The backend server
AI Workspace Common (packages/ai-workspace-common/): Shared AI workspace UI components
i18n (packages/i18n/): Internationalization support
Follow these steps to install:

Spin up all the middlewares:
cd deploy/docker
docker-compose -f docker-compose.middleware.yml up -d
Install dependencies:
corepack enable
pnpm install
Set up environment variables for both API and web:
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
Start developing:
pnpm build
pnpm dev
You can visit http://localhost:5173 to start developing Refly.

Developing
To help you quickly navigate where your contribution fits, here's a brief outline of Refly's structure:

Backend Structure
[apps/server/]             // Main server application
├── src/
│   ├── controllers/      // API route handlers
│   ├── services/        // Business logic implementation
│   ├── models/          // Data models and types
│   ├── ai/              // AI feature implementations
│   │   ├── llm/        // LLM integration and management
│   │   ├── rag/        // RAG pipeline implementation
│   │   └── memory/     // Context memory management
│   ├── canvas/         // Canvas-related backend services
│   └── utils/          // Shared utilities

[packages/]
├── ai-core/            // Core AI functionality
│   ├── src/
│   │   ├── llm/       // LLM abstraction and implementations
│   │   ├── memory/    // Memory systems
│   │   └── rag/       // RAG implementations
│
└── shared/            // Shared types and utilities
    └── src/
        └── types/     // Common TypeScript types
The backend is built with Nest.js and TypeScript, focusing on:

AI feature implementation including LLM integration, RAG pipelines, and context memory
Canvas state management and real-time collaboration
RESTful APIs and WebSocket connections for real-time features
Efficient data storage and retrieval for knowledge bases
Frontend Structure
[apps/web/]                 // Main web application
├── src/
│   ├── components/         // React components
│   ├── styles/            // Global styles and themes
│   └── main.tsx           // Application entry point

[packages/]
├── ai-workspace-common/   // Shared AI workspace components
│   ├── src/
│   │   ├── components/    // Canvas, editor, and AI feature components
│   │   └── utils/        // Shared utilities
│
└── i18n/                 // Internationalization
    ├── src/
    │   ├── en-US/        // English translations
    │   └── zh-Hans/      // Chinese translations
