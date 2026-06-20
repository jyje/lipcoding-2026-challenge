import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initializeDatabase } from './database';
import { registerUserRoutes } from './routes/user';
import { analyzeBrainDump } from './services/analyzeService';
import { authenticateBearer } from './middleware/auth';
import 'dotenv/config';

const app = Fastify({ logger: true });

app.register(cors);

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'healthy', timestamp: new Date().toISOString() };
});

// Analyze endpoint (v1)
app.post<{
  Body: {
    brain_dump: string;
    time_budget_min?: number;
  };
}>('/api/v1/analyze', async (request, reply) => {
  const token = await authenticateBearer(request, reply);
  if (!token) {
    return reply.status(401).send({
      detail: {
        type: 'missing_token',
        message: 'Authorization header with Bearer token is required',
      },
    });
  }

  const { brain_dump, time_budget_min = 90 } = request.body;

  if (!brain_dump || brain_dump.trim().length === 0) {
    return reply.status(400).send({
      detail: {
        type: 'missing_brain_dump',
        message: 'brain_dump is required',
      },
    });
  }

  try {
    const result = await analyzeBrainDump(brain_dump, time_budget_min);
    
    // Convert response to snake_case for frontend compatibility
    return {
      summary: result.summary,
      top_actions: result.topActions.map(action => ({
        id: action.id,
        title: action.title,
        reason: action.reason,
        priority: action.priority,
        estimate_min: action.estimateMin,
        done: action.done,
      })),
      risks: result.risks,
      time_budget_min: time_budget_min,
      tag: {
        space: result.tag.space,
        career_signals: result.tag.careerSignals,
        keywords: result.tag.keywords,
        confidence: result.tag.confidence,
      },
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      detail: {
        type: 'analysis_error',
        message: error instanceof Error ? error.message : 'Failed to analyze brain dump',
      },
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

// Goals overview endpoint
app.get('/api/v1/goals/overview', async (request, reply) => {
  // Return overview of goals by space (work, career, tech)
  // For now, return empty structure - frontend will handle empty state
  return {
    goals: [
      {
        space: 'work' as const,
        top_task: null,
      },
      {
        space: 'career' as const,
        top_task: null,
      },
      {
        space: 'tech' as const,
        top_task: null,
      },
    ],
  };
});

// Agent chat endpoint
app.post<{
  Body: {
    message: string;
    tasks?: Array<{
      id: string;
      title: string;
      description: string;
      status: string;
      priority: number;
      space: string;
    }>;
  };
}>('/api/v1/agent/chat', async (request, reply) => {
  const token = await authenticateBearer(request, reply);
  if (!token) {
    return reply.status(401).send({
      detail: {
        type: 'missing_token',
        message: 'Authorization header with Bearer token is required',
      },
    });
  }

  const { message, tasks } = request.body;

  if (!message || message.trim().length === 0) {
    return reply.status(400).send({
      detail: {
        type: 'missing_message',
        message: 'message is required',
      },
    });
  }

  try {
    // Call Copilot SDK for agent chat response
    const result = await analyzeBrainDump(message, 60);

    return {
      reply: `분석 완료: ${result.summary}`,
      changes: [
        {
          type: 'reply_only' as const,
          target_id: 'agent',
          field: 'reply',
          value: result.summary,
        },
      ],
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      detail: {
        type: 'agent_error',
        message: error instanceof Error ? error.message : 'Failed to get agent response',
      },
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

    const port = parseInt(process.env.PORT || '8010', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
