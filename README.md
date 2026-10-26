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

The **Base Worker** can be used as a standalone component or as part of a cluster managed by the [Load Balancer](https://andera.top/docs/load-balancer/introduction). You can run and interact with your Workers directly for simple or single-instance use cases, or add a Load Balancer. Duplicating the Base Worker to start building a Worker is the easiest way to start adding value!

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Node 24 LTS recommended; supported: 22.23.4+, 24.22.1+ or 26.12.1+, which include the October 2026 security fixes; Docker uses Node 24.22.1)
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

Runtime settings and secrets come from environment variables, loaded from `.env` at startup. `src/config/index.ts` extends Worker Core configuration. MCP function selection lives separately in `mcp.json` and reloads without restarting.

### Environment Variables

Below are the main environment variables used by the **Base Worker**.

| Variable              | Description                                                                                                    | Default   |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | --------- |
| `AUTH_KEY`            | Key for REST tasks and administration; MCP uses its own token.                     | Required  |
| `LB_AUTH_KEY`         | Internal LB key; required even standalone, distinct from AUTH_KEY and identical to the Load Balancer's `LB_AUTH_KEY`. | Required  |
| `PORT`                | HTTP port for the Worker API.                                                                                  | `3000`    |
| `WEBSOCKET_PORT`      | Port for the WebSocket server (for real-time slot updates with the Load Balancer ; change only if you use it). | `3001`    |
| `GROUP` | Worker group for routing; the example sets `default`. | Required |
| `CONTRACT`            | The contract version implemented by this Worker.                                                               | `1`       |
| `SLOTS`               | Number of parallel tasks the Worker can handle.                                                                | `10`      |
| `DEFAULT_TIMEOUT`     | Default timeout (ms) for task execution.                                                                       | `30000`   |
| `LOG_LEVEL`           | Log verbosity: `debug`, `info`, `warn` or `error`.                                                             | `info`    |
| `MAX_LOGS`            | Number of log lines to keep in memory (for `/logs`).                                                           | `1000`    |
| `WEBHOOK_TIMEOUT`     | Timeout (ms) for webhook calls.                                                                                | `5000`    |
| `WEBHOOK_MAX_RETRIES` | Number of times to retry a failed webhook.                                                                     | `3`       |
| `WEBHOOK_RETRY_DELAY` | Delay (ms) between webhook retries.                                                                            | `1000`    |
| `WEBHOOK_HEADERS`     | JSON object of headers to send with webhook requests.                                                          | `{}`      |
| `OPENAPI_ENABLED`     | Enable OpenAPI documentation endpoints (`/docs` and `/openapi`, unauthenticated).                              | `false`   |
| `REQUEST_BODY_LIMIT` | REST task request body limit; MCP has a separate fixed 1 MiB limit. | `10mb` |
| `MCP_AUTH_KEY` | Dedicated bearer token without whitespace, distinct from both internal keys; otherwise MCP stays disabled. | Empty: disabled |
| `MCP_CONFIG_PATH` | Path relative to the application root, or absolute. | `mcp.json` |
| `MCP_ALLOWED_ORIGINS` | Comma-separated exact browser origins; native clients need none. | Empty |
| `CUSTOM_CONFIG` | Example Worker-specific setting (see `src/config/index.ts`). | `default-value` |

### Usage

- Environment settings are loaded at startup; restart after changing them.
- These variables control authentication, routing, logging, slot management, and advanced features.

### Example `.env`

```env
AUTH_KEY=<distinct-random-key>
LB_AUTH_KEY=<same-value-as-the-load-balancer>
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
OPENAPI_ENABLED=false
REQUEST_BODY_LIMIT=10mb
CUSTOM_CONFIG=default-value
MCP_AUTH_KEY=
MCP_CONFIG_PATH=mcp.json
MCP_ALLOWED_ORIGINS=
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
docker compose build
```

#### Run the stack

```sh
docker compose up
```

Compose passes the variables declared in `docker-compose.yml`. Include the MCP override above to load MCP settings and mount its configuration.

> **Do not use `docker run` directly.** The recommended way is to use `docker compose up` to ensure all dependencies and configuration are handled correctly.

The image is named `andera-top/base-worker` by default. On the `andera-net` network, add the Worker to the Load Balancer's `workers.json` as `http://andera-base-worker:3000` (the Compose service name); only the API port is published on the host, and the LB also needs the WebSocket port, reachable over the network.

---

## Function timeouts and cancellation

Worker Core passes an `AbortSignal` as `context.signal` to each handler attempt. Pass it to cancellable APIs such as `fetch(url, { signal: context?.signal })`, and check `context?.signal.throwIfAborted()` between steps. Existing functions remain compatible, but must use the signal to cooperate with cancellation.

At a function timeout, the caller receives an error immediately and the signal is aborted. The Worker keeps the slot until the handler settles, including cleanup. Timeout failures are never retried by the function runner; ordinary failures can still use `maxRetries`. Authenticated Worker `/health` lists lingering executions under `executions.timedOutRunning`, with function name, start/deadline timestamps and configured timeout; no inputs or credentials are included.

Direct REST calls return HTTP 504 with `code: "FUNCTION_TIMEOUT"` before any stream headers have been sent; MCP calls return a tool error. Late handler stream output is discarded. A handler that ignores cancellation can keep its slot indefinitely. Blocking synchronous code cannot be interrupted this way, and completed external side effects are not undone. Handlers must await their child operations for slot accounting to cover them.

## Customizing Your Worker

- Add your functions in `src/functions/`
- Add your services in `src/services/`
- Add helpers in `src/helpers/`
- Add tags in `src/tags/`

**Example: Hello World Function**

```typescript
import { defineFunction } from '@andera-top/worker-core'

export const hello = defineFunction({
  description: 'Return a greeting for the given name.',
  params: {
    name: { description: 'The person to greet.', type: 'string', required: false, default: 'World' },
  },
  handler: async params => {
    return { message: `Hello ${params.name}!` }
  },
})
```

See more examples in the [Functions documentation](https://andera.top/docs/base-worker/functions/).

---

## Endpoints

- `POST /mcp` — Optional MCP discovery and tool calls with `MCP_AUTH_KEY`
- `POST /task` — Receives tasks for execution
- `GET /health` — Public status info; more details with authentication
- `GET /logs` — Recent log lines, bounded by `MAX_LOGS` (authentication required)
- `POST /on` and `/off` — Enable/disable task acceptance

HTTP compression is negotiated when supported. Logs are managed natively.
See [API Reference](https://andera.top/docs/base-worker/usage/) for details.

---

## Testing your Worker

After installation and configuration, you can test your worker as follows:

### 1. Health Check

Make sure your worker is running (default port: 3000):

```bash
npm run build
npm start
```

Or, if using Docker:

```bash
docker network create andera-net
docker compose build
docker compose up
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
  -H "Authorization: Bearer <AUTH_KEY>" \
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

## MCP (optional)

The [Model Context Protocol](https://modelcontextprotocol.io) (MCP) is the standard way for AI agents such as Claude, Cursor or VS Code to discover and call tools. This Worker can expose its functions as MCP tools at `/mcp`: agents connect with one URL and one bearer token, and their calls go through the same validation, queue and slots as REST requests.

To enable it:

1. Set `MCP_AUTH_KEY` in `.env` to a dedicated random token (for example `openssl rand -hex 32`), different from `AUTH_KEY` and `LB_AUTH_KEY`.
2. Copy `mcp.example.json` to `mcp.json` and list the functions to expose. The example exposes only `hello`; `{}` exposes every function and `{"functions": []}` none.
3. Point your agent at `http://<host>:3000/mcp` with the header `Authorization: Bearer <MCP_AUTH_KEY>`.

With Docker, run `mkdir -p .mcp`, copy the example to `.mcp/mcp.json`, and start with `docker compose -f docker-compose.yml -f docker-compose.mcp.yml up --build`.

`mcp.json` reloads without a restart: invalid edits keep the last valid selection, and deleting the file disables MCP. Changing `MCP_AUTH_KEY` requires a restart. Without the token or the file, MCP stays off. A Load Balancer does not need this endpoint: it routes tasks through REST and can expose this Worker's functions through its own `/mcp`.

Setup and client configuration: [Worker MCP documentation](https://andera.top/docs/base-worker/mcp).

---

## Useful Links

- [Andera Documentation](https://andera.top/docs/)
- [Base Worker Reference](https://andera.top/docs/base-worker/)

---

## Contributing

Andera makes its source available and welcomes community contributions.
See [CONTRIBUTING.md](CONTRIBUTING.md) for repository guidelines, and [How to Contribute](https://andera.top/docs/contribute) for the project's philosophy and license.

---

## License

For license details, see the [LICENCE](LICENCE) file.
