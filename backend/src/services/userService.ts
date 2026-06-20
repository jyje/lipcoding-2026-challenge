import { dbRun, dbGet, dbAll } from '../database';
import { User, CreateUserRequest, createUser } from '../models/user';

// 닉네임으로 사용자 조회
export async function getUserByNickname(nickname: string): Promise<User | null> {
  const user = await dbGet<User>(
    'SELECT * FROM users WHERE nickname = ?',
    [nickname]
  );
  return user || null;
}

// ID로 사용자 조회
export async function getUserById(id: string): Promise<User | null> {
  const user = await dbGet<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return user || null;
}

// 새 사용자 생성
export async function createNewUser(req: CreateUserRequest): Promise<User> {
  // 중복 체크
  const existing = await getUserByNickname(req.nickname);
  if (existing) {
    throw new Error(`Nickname "${req.nickname}" already exists`);
  }

  const user = createUser(req.nickname);

  await dbRun(
    `INSERT INTO users (id, nickname, createdAt, updatedAt, lastAccessAt)
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, user.nickname, user.createdAt, user.updatedAt, user.lastAccessAt]
  );

  return user;
}

// 사용자 마지막 접속 시간 업데이트
export async function updateLastAccess(userId: string): Promise<void> {
  const now = new Date().toISOString();
  await dbRun(
    'UPDATE users SET lastAccessAt = ? WHERE id = ?',
    [now, userId]
  );
}

// 모든 사용자 조회 (관리용)
export async function getAllUsers(): Promise<User[]> {
  return dbAll<User>('SELECT * FROM users ORDER BY createdAt DESC');
}

// 사용자 삭제 (관리용)
export async function deleteUser(userId: string): Promise<void> {
  await dbRun('DELETE FROM users WHERE id = ?', [userId]);
}
