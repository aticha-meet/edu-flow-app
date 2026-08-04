# EduFlow

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/next?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Create Workspace with pnpm

Use pnpm dlx

```sh
pnpm dlx create-nx-workspace name --preset=next
```

## Add Build Project

```sh
pnpm add -D @nx/framwork
```

EX.

```sh
pnpm add -D @nx/express
```

## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev edu-flow-front
```

To create a production bundle:

```sh
npx nx build edu-flow-front
```

To see all available targets to run for a project, run:

```sh
npx nx show project edu-flow-front
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Project Structure

```
edu-flow-app/
│
├── apps/
│   │
│   ├── edu-flow-front/          # Next.js — เว็บหน้าบ้าน (frontend)
│   │   ├── src/
│   │   ├── public/
│   │   ├── next.config.js
│   │   └── Dockerfile
│   │
│   ├── edu-flow-api/             # Express — REST API หลัก (backend)
│   │   ├── src/
│   │   │   ├── configs/
│   │   │   ├── hooks/
│   │   │   ├── middleware/
│   │   │   ├── pkg/
│   │   │   ├── utils/
│   │   │   ├── main.ts
│   │   │   └── router.ts
│   │   └── Dockerfile
│   │
│   ├── edu-flow-backend/         # Shared backend logic / services
│   │
│   ├── edu-flow-front-e2e/       # E2E tests (frontend)
│   └── edu-flow-api-e2e/         # E2E tests (api)
│
├── lib/                          # Shared libraries ใช้ร่วมกันระหว่าง apps
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── docker-compose.yml            # Orchestrate ทุก service (web, api, db, tunnel)
├── prisma.config.ts
├── nx.json
├── pnpm-workspace.yaml
└── .env                          # Environment variables (ไม่ commit เข้า git)
```

## Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Monorepo         | Nx                                   |
| Package manager  | pnpm                                 |
| Frontend         | Next.js 16, React 19, Tailwind CSS 4 |
| Backend          | Express, Node.js                     |
| ORM              | Prisma 6                             |
| Database         | PostgreSQL 16                        |
| Auth             | NextAuth (Google / GitHub OAuth)     |
| Containerization | Docker, Docker Compose               |
| Tunnel / HTTPS   | Cloudflare Tunnel                    |

## Getting Started (Local Development)

```bash
pnpm install
pnpm exec prisma generate
pnpm exec nx serve edu-flow-front
pnpm exec nx serve edu-flow-api
```

## Deployment (Docker)

โปรเจกต์นี้ deploy ผ่าน Docker Compose รันทั้งหมด 4 service พร้อมกัน:

| Service       | หน้าที่                                   | Port (internal) |
| ------------- | ----------------------------------------- | --------------- |
| `web`         | Next.js frontend                          | 3000            |
| `api`         | Express backend                           | 3333            |
| `db`          | PostgreSQL 16                             | 5432            |
| `cloudflared` | Cloudflare Tunnel (HTTPS + public domain) | -               |

### Build และรันทั้งหมด

```bash
docker compose up -d --build
```

### รัน Database Migration (ครั้งแรก / หลัง schema เปลี่ยน)

```bash
docker compose exec api pnpm exec prisma migrate deploy
```

### หยุดการทำงานชั่วคราว (ไม่ลบข้อมูล)

```bash
docker compose stop
```

### รันกลับมาใหม่

```bash
docker compose start
```

### ดู log

```bash
docker compose logs -f web
docker compose logs -f api
```

## Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ (ดู `.env.example` ประกอบ):

```env
# Database
DOCKER_DATABASE_URL=postgresql://<user>:<password>@db:5432/<db_name>
DB_USER=
DB_PASSWORD=
DB_NAME=

# Auth
NEXTAUTH_URL=https://app.edflow.online
NEXTAUTH_SECRET=
NEXT_PUBLIC_AUTH_URL=https://app.edflow.online
NEXT_PUBLIC_ENDPOINT_URL=https://api.edflow.online

# Cloudflare
CF_TUNNEL_TOKEN=
```

## Live Environments

| Environment      | URL                       |
| ---------------- | ------------------------- |
| Web (Production) | https://app.edflow.online |
| API (Production) | https://api.edflow.online |
