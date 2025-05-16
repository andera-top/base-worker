<p align="center">
  <img src="https://andera.top/img/github.png" alt="Andera" style="max-width: 100%; height: auto;"/>
</p>

# Andera Base Worker

**Andera** is a high-performance, open-source Task Orchestration Platform (TOP) designed for simplicity, flexibility, and scalability.  
It enables you to build, run, and manage distributed workers for any kind of task, from AI agents to automation scripts.

> **Note:** This repository is a template. You should customize this README and the codebase for your own worker project.

---

## What is Andera?

Andera is composed of three main components:
- **Load Balancer:** Routes and prioritizes tasks, manages worker clusters, and provides a dashboard for monitoring.
- **Base Worker:** A template project for building your own custom workers by adding business logic (functions, services, helpers, tags).
- **Worker Core:** The core engine, included as a dependency, that handles all non-business logic for workers.

Learn more: [Andera Documentation](https://andera.top/docs/)

---

## Why use Base Worker?

- **Technology-agnostic:** Use any language, tool, or runtime in your functions and services.
- **Performance-first:** Designed for maximum throughput and low latency.
- **Simplicity:** No manual configuration for functions, services, or tags. Just add your code and go.
- **Cloud, VM, or bare metal:** Deploy anywhere, easily.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Installation

```sh
git clone <your-fork-or-repo-url>
cd base-worker
cp .env.example .env
npm install
```

Edit `.env` to set your keys and configuration.

---

## Configuration

- All environment variables are documented in `.env.example`.
- For advanced configuration, see the [Base Worker Configuration Guide](https://andera.top/docs/base-worker/configuration/).

---

## Usage

### Run in Development

```sh
npm run dev
```

### Build & Run in Production

```sh
npm run build
npm start
```

### Run with Docker

You should use Docker Compose to run the Base Worker for a robust and production-ready setup.

### Build the Docker image

```sh
docker-compose build
```

### Run the stack

```sh
docker-compose up
```

This will start the Base Worker with all environment variables from your `.env` file.

> **Do not use `docker run` directly.** The recommended way is to use `docker-compose up` to ensure all dependencies and configuration are handled correctly.

The image is named `andera-top/base-worker` by default.

---

## Customizing Your Worker

- Add your functions in `src/functions/`
- Add your services in `src/services/`
- Add helpers in `src/helpers/`
- Add tags in `src/tags/`

**Example: Hello World Function**

```typescript
import { defineFunction } from '@andera-top/worker-core'

export const hello = defineFunction({
  params: {
    name: { type: 'string', required: false, default: 'World' }
  },
  handler: async (params) => {
    return { message: `Hello ${params.name}!` }
  }
})
```

See more examples in the [Functions documentation](https://andera.top/docs/base-worker/functions/).

---

## Endpoints

- `POST /task` — Receives tasks for execution
- `GET /health` — Public status info; more details with authentication
- `GET /logs` — Last 1000 log lines (authentication required)
- `POST /on` and `/off` — Enable/disable task acceptance

All endpoints return gzipped data. Logs are managed natively.  
See [API Reference](https://andera.top/docs/base-worker/usage/) for details.

---

## Testing your Worker

After installation and configuration, you can test your worker as follows:

### 1. Health Check

Make sure your worker is running (default port: 3000):

```bash
npm start
```
Or, if using Docker:
```bash
docker-compose build
docker-compose up
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```
Expected response:
```json
{
  "status": "ready"
}
```

### 2. Test a Function

Call a function (e.g., `hello`) using the `/task` endpoint:
```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "function": "hello",
    "input": { "name": "Andera" },
    "contract": 1
  }'
```
Expected response:
```json
{
  "success": true,
  "result": {
    "message": "Hello Andera!"
  }
}
```

For more details, see the [Testing Guide](https://andera.top/docs/base-worker/test/).

---

## Deployment

- [Deployment Guide](https://andera.top/docs/base-worker/deployment/)
- Supports local, Docker, and cloud deployment.

---

## Useful Links

- [Andera Documentation](https://andera.top/docs/)
- [Base Worker Reference](https://andera.top/docs/base-worker/)

---

## Contributing

Andera is open source and community-driven!
See [CONTRIBUTING.md](CONTRIBUTING.md) for repository guidelines, and [How to Contribute](https://andera.top/docs/contribute) for the project's philosophy and license.

---

## License

For license details, see the [LICENSE](LICENSE) file.