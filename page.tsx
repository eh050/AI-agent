'use client';

import { useEffect, useState } from 'react';

interface OllamaStatus {
  connected: boolean;
  models: string[];
  baseUrl: string;
  error?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OllamaStatus | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/ollama/check');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setStatus({
        connected: false,
        models: [],
        baseUrl: 'http://localhost:11434',
        error: 'Failed to reach status endpoint',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResponse(data.response ?? '');
    } catch (e: any) {
      setError(e.message || 'Failed to get response from Ollama');
    } finally {
      setIsLoading(false);
    }
  };

  const primaryModel =
    status?.models && status.models.length > 0
      ? status.models[0]
      : process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'unknown-model';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Research Agent (Ollama)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Sends your prompt directly to Ollama running on the Debian server and shows the raw response.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={
                'inline-flex h-2 w-2 rounded-full ' +
                (status?.connected ? 'bg-emerald-400' : 'bg-red-500 animate-pulse')
              }
            />
            <span className="text-slate-400">
              Ollama:{' '}
              <span className="text-slate-100">
                {status?.connected ? 'Connected' : 'Not Connected'}
              </span>
              {status?.connected && status.models?.length > 0 && (
                <span className="ml-1 text-slate-400">({primaryModel})</span>
              )}
            </span>
          </div>
        </header>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-sm p-5 sm:p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-slate-200">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Ollama to perform research, summarize, or answer a question..."
              className="w-full h-32 sm:h-40 resize-none rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none transition-colors"
              >
                {isLoading ? 'Asking Ollama…' : 'Send to Ollama'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt('');
                  setResponse('');
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              <div className="font-semibold mb-0.5">Error</div>
              <div>{error}</div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">
                Ollama Response
              </span>
              {response && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(response);
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Copy
                </button>
              )}
            </div>
            <div className="min-h-[120px] max-h-[360px] overflow-auto rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 whitespace-pre-wrap">
              {isLoading && !response && !error && (
                <span className="text-slate-500">Waiting for Ollama...</span>
              )}
              {!isLoading && !response && !error && (
                <span className="text-slate-500">
                  The response from Ollama will appear here.
                </span>
              )}
              {response}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
