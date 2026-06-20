import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    nickname: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    lastAccessAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    nickname: string;
    createdAt: string;
    updatedAt: string;
    lastAccessAt: string;
}, {
    id: string;
    nickname: string;
    createdAt: string;
    updatedAt: string;
    lastAccessAt: string;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const CreateUserSchema: z.ZodObject<{
    nickname: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nickname: string;
}, {
    nickname: string;
}>;
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export declare function generateUserId(): string;
export declare function createUser(nickname: string): User;
//# sourceMappingURL=user.d.ts.map