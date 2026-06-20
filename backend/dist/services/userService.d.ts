import { User, CreateUserRequest } from '../models/user';
export declare function getUserByNickname(nickname: string): Promise<User | null>;
export declare function getUserById(id: string): Promise<User | null>;
export declare function createNewUser(req: CreateUserRequest): Promise<User>;
export declare function updateLastAccess(userId: string): Promise<void>;
export declare function getAllUsers(): Promise<User[]>;
export declare function deleteUser(userId: string): Promise<void>;
//# sourceMappingURL=userService.d.ts.map