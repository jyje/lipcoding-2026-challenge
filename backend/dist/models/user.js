"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = exports.UserSchema = void 0;
exports.generateUserId = generateUserId;
exports.createUser = createUser;
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
// User 스키마
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    nickname: zod_1.z.string().min(2).max(50),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    lastAccessAt: zod_1.z.string().datetime(),
});
// 사용자 생성 요청
exports.CreateUserSchema = zod_1.z.object({
    nickname: zod_1.z.string().min(2).max(50),
});
// 사용자 ID 생성 (UUID 대신 짧은 ID)
function generateUserId() {
    return crypto_1.default.randomBytes(8).toString('hex');
}
// 사용자 객체 생성
function createUser(nickname) {
    const now = new Date().toISOString();
    return {
        id: generateUserId(),
        nickname,
        createdAt: now,
        updatedAt: now,
        lastAccessAt: now,
    };
}
//# sourceMappingURL=user.js.map