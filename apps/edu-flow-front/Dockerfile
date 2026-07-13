FROM node:22-alpine AS base
WORKDIR /repo

RUN npm install -g pnpm@9

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_AUTH_URL
ENV NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}

ARG NEXT_PUBLIC_ENDPOINT_URL
ENV NEXT_PUBLIC_ENDPOINT_URL=${NEXT_PUBLIC_ENDPOINT_URL}

# ปิด nx daemon และ cache เพราะมีปัญหา SQLite I/O ใน container
ENV NX_DAEMON=false
ENV NX_SKIP_NX_CACHE=true

RUN pnpm exec nx build edu-flow-front --configuration=production --skip-nx-cache

# ---- runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=base /repo/apps/edu-flow-front/.next/standalone ./
COPY --from=base /repo/apps/edu-flow-front/public ./apps/edu-flow-front/public
COPY --from=base /repo/apps/edu-flow-front/.next/static ./apps/edu-flow-front/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/edu-flow-front/server.js"]   