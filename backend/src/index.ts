import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initializeDatabase } from './database';
import { registerUserRoutes } from './routes/user';
import { analyzeBrainDump } from './services/analyzeService';
import 'dotenv/config';

const app = Fastify({ logger: true });

app.register(cors);

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'healthy', timestamp: new Date().toISOString() };
});

// Analyze endpoint
app.post<{
  Body: {
    brainDump: string;
    timeBudgetMin?: number;
  };
}>('/api/analyze', async (request, reply) => {
  const { brainDump, timeBudgetMin = 120 } = request.body;

  if (!brainDump || brainDump.trim().length === 0) {
    return reply.status(400).send({
      error: 'brainDump is required',
    });
  }

  try {
    const result = await analyzeBrainDump(brainDump, timeBudgetMin);
    return result;
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      error: 'Failed to analyze brain dump',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Actions list endpoint
app.get('/api/actions', async (request, reply) => {
  return { actions: [] };
});

// Update action endpoint
app.patch<{
  Params: { id: string };
  Body: { done: boolean };
}>('/api/actions/:id', async (request, reply) => {
  const { id } = request.params;
  const { done } = request.body;

  return { id, done };
});

// Replan endpoint
app.post<{
  Body: {
    remainingMin: number;
    currentBrainDump?: string;
  };
}>('/api/replan', async (request, reply) => {
  const { remainingMin, currentBrainDump } = request.body;

  if (remainingMin < 0) {
    return reply.status(400).send({
      error: 'remainingMin must be >= 0',
    });
  }

  try {
    // If brain dump provided, re-analyze with new time budget
    if (currentBrainDump) {
      const result = await analyzeBrainDump(currentBrainDump, remainingMin);
      return result;
    }

    // Otherwise return placeholder for updating existing analysis
    return {
      summary: 'Plan updated based on remaining time',
      topActions: [],
      planBlocks: [],
      risks: [],
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      error: 'Failed to replan',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const start = async () => {
  try {
    // 데이터베이스 초기화
    console.log('📦 Initializing database...');
    await initializeDatabase();

    // 사용자 라우트 등록
    console.log('👤 Registering user routes...');
    await registerUserRoutes(app);

    const port = parseInt(process.env.PORT || '3001', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
