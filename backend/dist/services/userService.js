"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByNickname = getUserByNickname;
exports.getUserById = getUserById;
exports.createNewUser = createNewUser;
exports.updateLastAccess = updateLastAccess;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;
const database_1 = require("../database");
const user_1 = require("../models/user");
// 닉네임으로 사용자 조회
async function getUserByNickname(nickname) {
    const user = await (0, database_1.dbGet)('SELECT * FROM users WHERE nickname = ?', [nickname]);
    return user || null;
}
// ID로 사용자 조회
async function getUserById(id) {
    const user = await (0, database_1.dbGet)('SELECT * FROM users WHERE id = ?', [id]);
    return user || null;
}
// 새 사용자 생성
async function createNewUser(req) {
    // 중복 체크
    const existing = await getUserByNickname(req.nickname);
    if (existing) {
        throw new Error(`Nickname "${req.nickname}" already exists`);
    }
    const user = (0, user_1.createUser)(req.nickname);
    await (0, database_1.dbRun)(`INSERT INTO users (id, nickname, createdAt, updatedAt, lastAccessAt)
     VALUES (?, ?, ?, ?, ?)`, [user.id, user.nickname, user.createdAt, user.updatedAt, user.lastAccessAt]);
    return user;
}
// 사용자 마지막 접속 시간 업데이트
async function updateLastAccess(userId) {
    const now = new Date().toISOString();
    await (0, database_1.dbRun)('UPDATE users SET lastAccessAt = ? WHERE id = ?', [now, userId]);
}
// 모든 사용자 조회 (관리용)
async function getAllUsers() {
    return (0, database_1.dbAll)('SELECT * FROM users ORDER BY createdAt DESC');
}
// 사용자 삭제 (관리용)
async function deleteUser(userId) {
    await (0, database_1.dbRun)('DELETE FROM users WHERE id = ?', [userId]);
}
//# sourceMappingURL=userService.js.map