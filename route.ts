import { NextRequest, NextResponse } from 'next/server';
import { ollamaClient } from '@/lib/ollama';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    const isConnected = await ollamaClient.checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Ollama is not running' },
        { status: 503 },
      );
    }

    const response = await ollamaClient.generate(prompt, { temperature: 0.7 });

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Ollama generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response from Ollama' },
      { status: 500 },
    );
  }
}
