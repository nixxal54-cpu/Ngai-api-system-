# NGAI Platform Setup Guide

## Requirements
- Node.js 22+
- Firebase Project
- Puter API Key for Qwen3.6 Access

## Local Setup

1. Copy `.env.example` to `.env` and fill the variables.
2. Initialize Firebase via the Firebase console if starting from scratch, or let the embedded AI Studio tool do it for you.
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Run locally:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment Options

### Docker & Docker Compose
For VPS or VM deployments, run:
\`\`\`bash
docker-compose up -d
\`\`\`

### Render
Using the included \`render.yaml\`, simply connect your GitHub repository and it will deploy the Docker environment automatically.

### Vercel
Vercel handles serverless functions via the \`vercel.json\`. Install the Vercel CLI and run:
\`\`\`bash
vercel
\`\`\`

*Note: For serverless deployment (Vercel), you might need to adjust the Firebase SDK usage internally to accommodate stateless cold re-instantiations without memory leaks. The current Docker output is the recommended primary mechanism.*
