import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticateBearer(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<string | null> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}
