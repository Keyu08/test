# Agent Pairing Fix

## Problem
The frontend was showing "Failed to fetch" errors during agent pairing even though the agent was running and reachable. Root cause: the agent required a pairing token for ALL endpoints, including the `/health` liveness check.

## Solution Applied
Implemented **Fix #1** — Authentication middleware improvements:

### 1. Agent Changes (`mock-agent/src/index.ts`)
- **Allow OPTIONS requests**: All CORS preflight requests now bypass token validation (return 200 immediately)
- **Public endpoints**: `/health` and `/ping` no longer require X-Methodica-Token header
- **CORS headers**: Added proper `Access-Control-Allow-*` headers to all responses
- **Protected endpoints**: All data endpoints (`/dataset/*`, `/plan/*`, `/run`, `/export`) still require valid token

### 2. Frontend Client (`lib/agent-client.ts`)
- **Better error extraction**: Health check now parses JSON error responses and extracts meaningful messages
- **Network error detection**: Catches fetch errors and provides helpful message about agent connectivity
- **Error messages**: Returns specific messages like "Cannot reach agent. Is it running on http://127.0.0.1:7337?"

### 3. Frontend Context (`lib/agent-context.tsx`)
- **Error propagation**: Now passes actual error messages from agent client to UI (not just generic strings)
- **Retry logic**: checkConnection() method now reports specific error reasons

### 4. UI Components
**Agent Status Banner** (`components/agent-status-banner.tsx`):
- Shows meaningful help text based on error type
- "Cannot reach agent" → suggests running npm run agent
- "Invalid pairing token" → suggests checking the token

**Pairing Modal** (`components/pairing-modal.tsx`):
- Displays specific error reasons to user
- Conditional help text for common issues
- Clearer instructions

## Testing the Fix

### Step 1: Start the Agent
```bash
npm run agent
```
Output should show:
```
📊 Methodica Mock Analysis Agent
🔑 Pairing Token: [32-char hex token]
🚀 Server: http://127.0.0.1:7337
✅ Agent listening on http://127.0.0.1:7337
```

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Verify Fixes
1. **No token**: You should NOT see "Failed to fetch"
   - Instead: Clear error message asking you to run `npm run agent`
   - Banner shows: "Cannot reach agent. Make sure to run npm run agent..."

2. **Wrong token**: Enter a random token
   - Error: "Invalid or missing pairing token"
   - Help text: "Enter the correct pairing token from the agent console"

3. **Correct token**: Enter token from agent console
   - Should connect successfully
   - Banner disappears, app shows pairing modal

## Technical Details

### What Changed in Agent
```typescript
// BEFORE: Required auth for everything
if (!validateToken(req)) {
  res.writeHead(401);
  res.end(JSON.stringify({ error: 'Invalid token' }));
  return;
}

// AFTER: Public endpoints + OPTIONS allowed
const isPublicEndpoint = pathname === '/health' || pathname === '/ping';

if (method === 'OPTIONS') {
  res.writeHead(200);
  res.end();
  return;
}

if (!isPublicEndpoint && !validateToken(req)) {
  res.writeHead(401);
  res.end(JSON.stringify({ error: 'Invalid token' }));
  return;
}
```

### Why This Works
1. **Browser preflight**: Before trying real requests, browsers send OPTIONS. These now pass.
2. **Agent discovery**: Frontend can now check `/health` to see if agent is reachable (no token needed)
3. **Clear errors**: If token is wrong, `/health` still returns 401 with error message that we parse
4. **Protected operations**: All actual analysis endpoints still require valid token

## Security Notes
- Localhost-only binding (127.0.0.1 check still in place)
- `/health` is unauthenticated but IP-restricted
- All protected endpoints still require valid token
- Token is printed to console at startup (expected for local development)

## If Issues Persist

### Symptom: Still seeing "Failed to fetch"
- Verify agent is running: `curl http://127.0.0.1:7337/health`
- Should return: `{"status":"healthy","version":"1.0.0"}`
- Check browser console for actual fetch error details

### Symptom: "Invalid pairing token" with correct token
- Verify token exactly matches output from `npm run agent`
- No spaces, copy entire 32-character hex string
- Token changes each time agent restarts

### Symptom: Agent connection works but modal still shows
- Refresh browser (Ctrl+Shift+R)
- Clear localStorage: DevTools → Application → Local Storage → methodica_pairing_token
- Re-enter token
