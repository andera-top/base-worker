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

## Role of the Base Worker

The **Base Worker** can be used as a standalone component or as part of a cluster managed by the [Load Balancer](https://andera.top/docs/load-balancer/introduction). You can run and interact with your Workers directly for simple or single-instance use cases, or add an aditional Load Balancer. Duplicating the Base Worker to start building a Worker is the easiest way to start adding value!

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

All configuration for the **Base Worker** is managed through the `.env` file. The file `src/config/index.ts` loads these variables and makes them available in your code.

### Environment Variables

Below are the main environment variables used by the **Base Worker**.

| Variable              | Description                                                                                                    | Default                |
|-----------------------|----------------------------------------------------------------------------------------------------------------|------------------------|
| `AUTH_KEY`            | Authentication key required to access the Worker endpoints (except `/health` public info).                     | `default-auth-key`     |
| `LB_AUTH_KEY`         | Key used to validate requests coming from the Load Balancer. Change only if you use it.                        | `default-lb-auth-key`  |
| `PORT`                | HTTP port for the Worker API.                                                                                  | `3000`                 |
| `WEBSOCKET_PORT`      | Port for the WebSocket server (for real-time slot updates with the Load Balancer ; change only if you use it). | `3001`                 |
| `GROUP`               | The group this Worker belongs to (used for routing and contract versioning).                                   | `default`              |
| `CONTRACT`            | The contract version implemented by this Worker.                                                               | `1`                    |
| `SLOTS`               | Number of parallel tasks the Worker can handle.                                                                | `10`                   |
| `DEFAULT_TIMEOUT`     | Default timeout (ms) for task execution.                                                                       | `30000`                |
| `LOG_LEVEL`           | Log verbosity (`info`, `warn`, `error`, etc.).                                                                 | `info`                 |
| `MAX_LOGS`            | Number of log lines to keep in memory (for `/logs`).                                                           | `1000`                 |
| `WEBHOOK_TIMEOUT`     | Timeout (ms) for webhook calls.                                                                                | `5000`                 |
| `WEBHOOK_MAX_RETRIES` | Number of times to retry a failed webhook.                                                                     | `3`                    |
| `WEBHOOK_RETRY_DELAY` | Delay (ms) between webhook retries.                                                                            | `1000`                 |
| `WEBHOOK_HEADERS`     | JSON object of headers to send with webhook requests.                                                          | `{}`                   |
| `OPENAPI_ENABLED`     | Enable OpenAPI documentation endpoints (`/docs` and `/openapi`).                                               | `true`                 |

### Usage

- All configuration is loaded at startup and available via the `config` object in `src/config/index.ts`.
- These variables control authentication, routing, logging, slot management, and advanced features.

### Example `.env`

```env
AUTH_KEY=default-auth-key
LB_AUTH_KEY=default-lb-auth-key
PORT=3000
WEBSOCKET_PORT=3001
GROUP=default
CONTRACT=1
SLOTS=10
DEFAULT_TIMEOUT=30000
LOG_LEVEL=info
MAX_LOGS=1000
WEBHOOK_TIMEOUT=5000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=1000
WEBHOOK_HEADERS={}
OPENAPI_ENABLED=true
```

For advanced configuration, see the [Base Worker Configuration Guide](https://andera.top/docs/base-worker/configuration/).

---

## Usage

### Manual setup

#### Run the application

```sh
npm run dev
```

#### Build & Run in Production

```sh
npm run build
npm start
```

### Docker setup

You should use Docker Compose to run the Base Worker for a robust and production-ready setup.

#### Create a Docker network for Andera

```sh
docker network create andera-net
```

#### Build the Docker image

```sh
docker-compose build
```

#### Run the stack

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
docker network create andera-net
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