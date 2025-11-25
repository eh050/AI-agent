# Research AI Agent

An autonomous research interface built with Next.js 14+, powered entirely by Ollama (local LLM).

## Overview

This project provides a simple web UI that sends your prompts directly to an Ollama model running on your Debian server and displays the raw response.
There are no external APIs, no Tavily integration, and no API keys required. All research and reasoning happen inside your Ollama model.

## Features

- Autonomous research and reasoning through Ollama
- Single prompt input and response display
- Dark, modern interface optimized for desktop
- Ollama connection and model status indicator
- Copy-to-clipboard for Ollama responses

## Prerequisites

- Node.js 18+ and npm
- Ollama installed and running on the Debian server (default: `http://localhost:11434`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` to set your Ollama connection (no other API keys are required):

   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=gpt-oss:latest
   ```

   Adjust `OLLAMA_MODEL` to match a model that exists in the output of `ollama list` (for example `gpt-oss:latest` or `llama3.2`).

3. Start Ollama (if not already running):

   ```bash
   ollama serve
   ```

4. Pull the model you want to use:

   ```bash
   ollama pull gpt-oss:latest
   # or any other model you prefer (must match OLLAMA_MODEL)
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open your browser:

   - From the Debian machine: `http://localhost:3000`
   - From another machine on the network: `http://<debian-ip>:3000`

## How It Works

1. You enter a prompt into the web UI.
2. The frontend calls a Next.js route (`/api/ollama/generate`) with your prompt.
3. The backend uses `ollama.ts` to send the prompt to your local Ollama instance.
4. Ollama generates a response and returns it to the backend.
5. The frontend displays the raw text response in a dark-themed panel and allows you to copy it.

There is no multi-step planning, external web search, or Tavily integration. If your Ollama model has browsing or tool capabilities, it can use them internally, but the web app simply sends prompts and shows responses.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── ollama/
│   │       ├── check/route.ts      # Check Ollama connection and list models
│   │       └── generate/route.ts   # Send prompt to Ollama and return response
│   ├── globals.css                 # Global styles (dark theme)
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main Ollama prompt/response UI
├── components/
│   └── MissionInput.tsx            # (Not currently used by the simplified UI, kept for future extension)
├── lib/
│   └── ollama.ts                   # Ollama client
└── types/
    └── index.ts                    # TypeScript types
```

## Configuration

### Ollama

- Default URL: `http://localhost:11434`
- Model: configured via `.env.local` (`OLLAMA_MODEL`)
- Make sure the model exists in `ollama list`

## Troubleshooting

### Ollama not connected

- Ensure Ollama is running: `ollama serve`
- Check the URL in `.env.local` matches your Ollama instance
- Verify you have at least one model pulled: `ollama list`
- Confirm that `OLLAMA_MODEL` in `.env.local` matches one of the models listed

### Build or runtime errors

- Ensure all dependencies are installed: `npm install`
- Check Node.js version is 18 or higher: `node --version`
- Check the Next.js dev server logs if needed: `/tmp/nextjs.log` on the Debian server

## License

MIT
