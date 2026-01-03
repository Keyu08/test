# Methodica

Statistical analysis software for biomedical research.

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start the Mock Analysis Agent

In one terminal:

```bash
npm run agent
```

The agent will print a pairing token to the console. Copy this token.

### Start the Frontend

In another terminal:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Pair with Agent

1. You'll see a modal asking for the pairing token
2. Paste the token from the agent console
3. Click "Connect"

## Features

- **Dataset Import**: Upload CSV files with automatic schema inference
- **Analysis Planning**: Get recommendations based on your data and goal
- **Statistical Testing**: Run t-tests, ANOVA, correlation, and dose-response analyses
- **Results Visualization**: Interactive Vega-Lite plots with export options
- **Freemium Model**: Free users get PNG export; Pro users get SVG, PDF, and full equations

## Demo License

To unlock Pro features during development, enter this license key:

```
METHODICA-PRO-DEMO
```

## Project Structure

```
├── app/
│   ├── api/                 # API route handlers (mocked)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── agent-status-banner.tsx
│   ├── dataset-import.tsx
│   ├── goal-picker.tsx
│   ├── pairing-modal.tsx
│   ├── plan-review.tsx
│   ├── results-*.tsx       # Results tabs components
│   ├── schema-review.tsx
│   └── vega-figure.tsx
├── lib/
│   ├── agent-client.ts     # HTTP client for local agent
│   ├── agent-context.tsx   # React context for agent connection
│   ├── csv-utils.ts        # CSV parsing utilities
│   ├── entitlements.ts     # License and feature gating
│   ├── idb.ts             # IndexedDB operations
│   └── types.ts           # TypeScript type definitions
├── mock-agent/            # Local analysis agent (Node.js)
│   ├── src/index.ts
│   └── tsconfig.json
└── fixtures/              # Example datasets

```

## Storage

- **IndexedDB**: Stores datasets, analysis plans, and run results
- **localStorage**: Stores pairing token and license key
- **No cloud persistence**: All data stays local

## Mock Agent Endpoints

The local agent runs on `http://127.0.0.1:7337` and provides:

- `POST /health` - Health check
- `POST /dataset/parse` - Parse CSV and infer schema
- `POST /dataset/summarize` - Generate summary statistics
- `POST /plan/validate` - Validate analysis plan
- `POST /run` - Execute analysis
- `POST /export` - Export results (PNG/SVG/PDF stub)

## Development

### Type Checking

```bash
npm run typecheck
```

### Build

```bash
npm run build
```

## Notes

- The app requires a local agent to function
- All analysis computations happen locally on the agent
- No user data is sent to external servers
- For production use, implement real license verification
