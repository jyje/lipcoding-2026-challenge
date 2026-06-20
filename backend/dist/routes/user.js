"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserRoutes = registerUserRoutes;
const user_1 = require("../models/user");
const userService_1 = require("../services/userService");
async function registerUserRoutes(app) {
    // 닉네임 사용 가능 여부 확인
    app.get('/api/users/check/:nickname', async (req, reply) => {
        const { nickname } = req.params;
        const existing = await (0, userService_1.getUserByNickname)(nickname);
        return reply.send({
            available: !existing,
            nickname,
        });
    });
    // 새 사용자 생성 (첫 접속)
    app.post('/api/users/register', async (req, reply) => {
        try {
            const { nickname } = user_1.CreateUserSchema.parse(req.body);
            const user = await (0, userService_1.createNewUser)({ nickname });
            return reply.code(201).send({
                success: true,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    createdAt: user.createdAt,
                },
            });
        }
        catch (error) {
            if (error.message.includes('already exists')) {
                return reply.code(409).send({
                    success: false,
                    error: error.message,
                });
            }
            if (error instanceof Error) {
                return reply.code(400).send({
                    success: false,
                    error: 'Invalid nickname',
                });
            }
            throw error;
        }
    });
    // 사용자 정보 조회
    app.get('/api/users/:userId', async (req, reply) => {
        const { userId } = req.params;
        const user = await (0, userService_1.getUserById)(userId);
        if (!user) {
            return reply.code(404).send({
                success: false,
                error: 'User not found',
            });
        }
        // 마지막 접속 시간 업데이트
        await (0, userService_1.updateLastAccess)(userId);
        return reply.send({
            success: true,
            user: {
                id: user.id,
                nickname: user.nickname,
                createdAt: user.createdAt,
                lastAccessAt: user.lastAccessAt,
            },
        });
    });
    // 닉네임으로 사용자 조회
    app.get('/api/users/by-nickname/:nickname', async (req, reply) => {
        const { nickname } = req.params;
        const user = await (0, userService_1.getUserByNickname)(nickname);
        if (!user) {
            return reply.code(404).send({
                success: false,
                error: 'User not found',
            });
        }
        return reply.send({
            success: true,
            user: {
                id: user.id,
                nickname: user.nickname,
                createdAt: user.createdAt,
            },
        });
    });
}
//# sourceMappingURL=user.js.map