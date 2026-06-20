"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const database_1 = require("./database");
const user_1 = require("./routes/user");
const app = (0, fastify_1.default)({ logger: true });
app.register(cors_1.default);
// Health check endpoint
app.get('/health', async (request, reply) => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
});
// Analyze endpoint
app.post('/api/analyze', async (request, reply) => {
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
                priority: 1,
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
app.patch('/api/actions/:id', async (request, reply) => {
    const { id } = request.params;
    const { done } = request.body;
    return { id, done };
});
// Replan endpoint
app.post('/api/replan', async (request, reply) => {
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
        // 데이터베이스 초기화
        console.log('📦 Initializing database...');
        await (0, database_1.initializeDatabase)();
        // 사용자 라우트 등록
        console.log('👤 Registering user routes...');
        await (0, user_1.registerUserRoutes)(app);
        const port = parseInt(process.env.PORT || '3001', 10);
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`✅ Server listening on port ${port}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map