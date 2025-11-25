import { NextResponse } from 'next/server';
import { ollamaClient } from '@/lib/ollama';

export async function GET() {
  try {
    const isConnected = await ollamaClient.checkConnection();
    const models = isConnected ? await ollamaClient.getAvailableModels() : [];

    return NextResponse.json({
      connected: isConnected,
      models,
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        models: [],
        error: error.message,
      },
      { status: 200 }
    );
  }
}
