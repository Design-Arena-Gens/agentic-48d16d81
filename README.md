## Inbox Automation Agent

This project delivers a browser-based AI-inspired agent that triages inbox messages, drafts formal replies for critical correspondence, and flags marketing campaigns for automatic unsubscribe flows. It is built with Next.js, the App Router, TypeScript, and Tailwind CSS and is ready for deployment on Vercel.

### Features

- Autonomous categorization of emails into *important* and *marketing* buckets using heuristic signal scoring.
- Formal reply drafting that adapts tone (balanced or very formal) and extracts actionable tasks and deadlines.
- Automated unsubscribe policy with adjustable aggressiveness and quick access to detected links.
- Sample dataset plus a composer to inject new emails and evaluate the agent’s workflow end-to-end.

### Development

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000 and uses in-memory data, making it simple to customize or integrate with real inbox providers.

### Production Build

```bash
npm run build
npm run start
```

### Deployment

The project is optimized for the Vercel platform. When you are ready to ship, run:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-48d16d81
```

Replace `$VERCEL_TOKEN` with a valid Vercel token if it is not already present in your environment.
