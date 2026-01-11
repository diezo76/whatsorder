import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set. AI parsing will be disabled.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  timeout: 30000, // 30 secondes
  maxRetries: 2, // Retry automatique en cas d'échec
});

export const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

export const isAIEnabled = () => {
  return !!process.env.OPENAI_API_KEY && 
         process.env.OPENAI_API_KEY !== 'dummy-key';
};
