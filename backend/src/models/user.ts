import { z } from 'zod';
import crypto from 'crypto';

// User 스키마
export const UserSchema = z.object({
  id: z.string(),
  nickname: z.string().min(2).max(50),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastAccessAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// 사용자 생성 요청
export const CreateUserSchema = z.object({
  nickname: z.string().min(2).max(50),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// 사용자 ID 생성 (UUID 대신 짧은 ID)
export function generateUserId(): string {
  return crypto.randomBytes(8).toString('hex');
}

// 사용자 객체 생성
export function createUser(nickname: string): User {
  const now = new Date().toISOString();
  return {
    id: generateUserId(),
    nickname,
    createdAt: now,
    updatedAt: now,
    lastAccessAt: now,
  };
}
