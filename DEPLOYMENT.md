# DecisionTrace production deployment

This project deploys as two services:

- `client/`: React/Vite static frontend
- `server/`: Node.js/Express API connected to MongoDB Atlas

Do not commit `.env`, `.env.*`, API keys, database credentials, or JWT secrets. Copy the example files into platform environment settings instead.

## 1. MongoDB Atlas setup

1. Create a MongoDB Atlas project and a production cluster.
2. Create a least-privilege database user for the application.
3. In **Network Access**, allow only the backend provider's static egress IPs. Avoid `0.0.0.0/0` for production.
4. Copy the SRV connection string and replace the username, password, and database name.
5. Store the resulting URI only as `MONGODB_URI` in the backend deployment platform.
6. Enable backups, alerts, and monitoring before accepting production traffic.

## 2. Backend deployment

Deploy `server/` to a Node-compatible service such as Render, Railway, Fly.io, AWS, or Azure.

Build/install command:

```powershell
npm ci
```

Start command:

```powershell
npm start
```

The platform must provide `PORT`; the API listens on `0.0.0.0` through Node's default server binding. Configure a health check at `/api/health`.

Required backend variables:

```text
NODE_ENV=production
PORT=<platform-provided-port>
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<at-least-32-random-characters>
JWT_EXPIRES_IN=1d
CLIENT_URL=https://app.example.com
AI_API_KEY=<server-only-provider-key-or-empty>
```

`AI_API_KEY` must never be placed in the frontend environment. The current repository does not yet call an AI provider; keep it unset until the backend AI service is implemented.

## 3. Frontend deployment

Deploy `client/` to a static host such as Vercel, Netlify, Cloudflare Pages, or an object-storage CDN.

Build/install commands:

```powershell
npm ci
npm run build
```

Publish directory:

```text
dist
```

Frontend variables must be configured before the build:

```text
VITE_API_URL=https://api.example.com/api
VITE_SOCKET_URL=https://api.example.com
```

Because Vite embeds `VITE_*` variables into browser JavaScript, never put secrets in them.

Configure the frontend host to serve `index.html` for unknown paths so React Router routes such as `/login` and `/dashboard` work after refresh.

## 4. Environment variables

Templates are available in:

- [server/.env.example](./server/.env.example)
- [client/.env.example](./client/.env.example)

Create local files only for development:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Use the deployment provider's secret/environment UI in production instead of creating committed files.

## 5. CORS configuration

Set `CLIENT_URL` to the exact frontend origin, including scheme and port when applicable:

```text
CLIENT_URL=https://app.example.com
```

Multiple trusted origins may be comma-separated. Do not use `*` with authenticated production APIs.

If the browser reports a CORS error, verify:

- the API URL does not have an accidental duplicate `/api`
- `CLIENT_URL` exactly matches the browser origin
- the API deployment is reachable over HTTPS
- the frontend was rebuilt after changing `VITE_API_URL`

## 6. Production API URL

If the backend is deployed at `https://api.example.com`, use:

```text
VITE_API_URL=https://api.example.com/api
```

Verify it before deploying the frontend:

```text
GET https://api.example.com/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "DecisionTrace API is running"
}
```

## 7. Socket.IO configuration

The environment contract is prepared with `VITE_SOCKET_URL`, but the current repository does not yet include a Socket.IO server/client dependency or an active socket connection. Do not advertise real-time production monitoring until Socket.IO is implemented and verified end to end.

When implemented:

- attach Socket.IO to the same HTTP server as Express
- allow only the frontend origin in the Socket.IO CORS settings
- authenticate the handshake with a short-lived token
- use `VITE_SOCKET_URL=https://api.example.com`
- configure the platform for WebSocket support and connection timeouts
- verify reconnection and horizontal-scaling requirements before enabling multiple API instances

## 8. Build commands

From the repository root:

```powershell
cd server
npm ci
npm run check

cd ..\client
npm ci
npm run lint
npm run build
```

## 9. Start commands

Backend production:

```powershell
cd server
npm start
```

Frontend local preview of the production build:

```powershell
cd client
npm run preview
```

The static host, not the Node API, should serve the built `client/dist` directory in production.

## 10. Common deployment errors

| Error | Likely cause | Fix |
|---|---|---|
| MongoServerSelectionError | Atlas IP/user/URI misconfiguration | Allow the backend egress IP, verify credentials, and URL-encode special password characters |
| `JWT_SECRET must be configured` | Missing or weak backend secret | Set a random secret of at least 32 characters |
| Browser CORS error | Wrong `CLIENT_URL` or stale frontend build | Match the exact origin and rebuild the frontend |
| 404 after refreshing `/dashboard` | Static host lacks SPA fallback | Rewrite unknown paths to `index.html` |
| API requests hit localhost | Missing or stale `VITE_API_URL` | Set it before `npm run build` and redeploy |
| WebSocket connection failed | Socket.IO not implemented, blocked, or wrong URL | Confirm the backend supports WebSockets and use the matching `VITE_SOCKET_URL` |
| Port bind failure | Hardcoded port or platform `PORT` ignored | Use the platform-provided `PORT` |
| Secrets visible in browser code | Secret placed in `VITE_*` variable | Move it to backend-only environment variables |
| Build passes but runtime fails | Environment variables were changed after build | Rebuild Vite after changing frontend variables |
