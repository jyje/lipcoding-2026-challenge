import Fastify from 'fastify';
import cors from 'fastify-cors';

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

  // TODO: Implement Copilot Extensions SDK integration
  // For now, return mock response
  return {
    summary: 'Analysis placeholder',
    topActions: [
      {
        id: 'a1',
        title: 'Action 1',
        reason: 'High priority',
        priority: 1 as const,
        estimateMin: 30,
        done: false,
      },
    ],
    planBlocks: [],
    risks: [],
  };
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
  };
}>('/api/replan', async (request, reply) => {
  const { remainingMin } = request.body;

  // TODO: Implement replan logic
  return {
    summary: 'Updated plan based on remaining time',
    topActions: [],
    planBlocks: [],
    risks: [],
  };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
