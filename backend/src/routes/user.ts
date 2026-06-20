import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserSchema } from '../models/user';
import {
  getUserByNickname,
  getUserById,
  createNewUser,
  updateLastAccess,
} from '../services/userService';

export async function registerUserRoutes(app: FastifyInstance) {
  // 닉네임 사용 가능 여부 확인
  app.get('/api/users/check/:nickname', async (req: FastifyRequest<{
    Params: { nickname: string }
  }>, reply: FastifyReply) => {
    const { nickname } = req.params;

    const existing = await getUserByNickname(nickname);

    return reply.send({
      available: !existing,
      nickname,
    });
  });

  // 새 사용자 생성 (첫 접속)
  app.post<{ Body: { nickname: string } }>(
    '/api/users/register',
    async (req, reply) => {
      try {
        const { nickname } = CreateUserSchema.parse(req.body);

        const user = await createNewUser({ nickname });

        return reply.code(201).send({
          success: true,
          user: {
            id: user.id,
            nickname: user.nickname,
            createdAt: user.createdAt,
          },
        });
      } catch (error: any) {
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
    }
  );

  // 사용자 정보 조회
  app.get<{ Params: { userId: string } }>(
    '/api/users/:userId',
    async (req, reply) => {
      const { userId } = req.params;

      const user = await getUserById(userId);

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found',
        });
      }

      // 마지막 접속 시간 업데이트
      await updateLastAccess(userId);

      return reply.send({
        success: true,
        user: {
          id: user.id,
          nickname: user.nickname,
          createdAt: user.createdAt,
          lastAccessAt: user.lastAccessAt,
        },
      });
    }
  );

  // 닉네임으로 사용자 조회
  app.get<{ Params: { nickname: string } }>(
    '/api/users/by-nickname/:nickname',
    async (req, reply) => {
      const { nickname } = req.params;

      const user = await getUserByNickname(nickname);

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
    }
  );
}
