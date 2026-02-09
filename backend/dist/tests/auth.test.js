"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const app_1 = __importDefault(require("../src/app"));
(0, vitest_1.describe)('POST /api/auth/register', () => {
    (0, vitest_1.test)('새 사용자를 등록하고 토큰을 반환한다', async () => {
        const res = await app_1.default.request('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'new@test.com',
                password: 'password123',
            })
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        const data = await res.json();
        (0, vitest_1.expect)(data).toHaveProperty('token');
        (0, vitest_1.expect)(data).toHaveProperty('user.email', 'new@test.com');
    });
});
(0, vitest_1.describe)('POST /api/auth/login', () => {
    (0, vitest_1.test)('올바른 자격증명으로 로그인하면 토큰을 반환한다', async () => {
        const res = await app_1.default.request('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'new@test.com',
                password: 'password123',
            })
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        const data = await res.json();
        (0, vitest_1.expect)(data).toHaveProperty('token');
    });
    (0, vitest_1.test)('잘못된 비밀번호로 로그인하면 401을 반환한다', async () => {
        const res = await app_1.default.request('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'new@test.com',
                password: 'wrongpassword',
            })
        });
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(await res.json()).toHaveProperty('error');
    });
});
