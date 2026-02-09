"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const app_1 = __importDefault(require("../src/app"));
(0, vitest_1.describe)('GET /api/tasks', () => {
    let authToken;
    (0, vitest_1.beforeAll)(async () => {
        // 먼저 사용자 등록 및 로그인하여 토큰을 얻습니다.
        const registerRes = await app_1.default.request('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            })
        });
        (0, vitest_1.expect)(registerRes.status).toBe(201);
        const registerData = await registerRes.json();
        authToken = registerData.token;
    });
    (0, vitest_1.test)('인증된 사용자가 새 태스크를 생성한다', async () => {
        const res = await app_1.default.request('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: '새 태스크',
                description: '태스크 설명',
            })
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        const task = await res.json();
        (0, vitest_1.expect)(task.title).toBe('새 태스크');
        (0, vitest_1.expect)(task.status).toBe('pending');
    });
    (0, vitest_1.test)('인증된 사용자가 자신의 태스크 목록을 조회한다', async () => {
        const res = await app_1.default.request('/api/tasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(await res.json()).toBeInstanceOf(Array);
    });
});
(0, vitest_1.describe)('PATCH /api/tasks/:id', () => {
    let authToken;
    let taskId;
    (0, vitest_1.beforeAll)(async () => {
        // 사용자 등록 및 로그인
        const registerRes = await app_1.default.request('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            })
        });
        (0, vitest_1.expect)(registerRes.status).toBe(201);
        const registerData = await registerRes.json();
        authToken = registerData.token;
        // 태스크 생성
        const createTaskRes = await app_1.default.request('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: '테스트 태스크',
                description: '테스트 태스크 설명',
            })
        });
        (0, vitest_1.expect)(createTaskRes.status).toBe(201);
        const taskData = await createTaskRes.json();
        taskId = taskData.id;
    });
    (0, vitest_1.test)('인증된 사용자가 자신의 태스크 상태를 업데이트한다', async () => {
        const res = await app_1.default.request(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status: 'completed'
            })
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        const updatedTask = await res.json();
        (0, vitest_1.expect)(updatedTask.status).toBe('completed');
    });
});
(0, vitest_1.describe)('DELETE /api/tasks/:id', () => {
    let authToken;
    let taskId;
    (0, vitest_1.beforeAll)(async () => {
        // 사용자 등록 및 로그인
        const registerRes = await app_1.default.request('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            })
        });
        (0, vitest_1.expect)(registerRes.status).toBe(201);
        const registerData = await registerRes.json();
        authToken = registerData.token;
        // 태스크 생성
        const createTaskRes = await app_1.default.request('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: '삭제할 태스크',
                description: '삭제할 태스크 설명',
            })
        });
        (0, vitest_1.expect)(createTaskRes.status).toBe(201);
        const taskData = await createTaskRes.json();
        taskId = taskData.id;
    });
    (0, vitest_1.test)('인증된 사용자가 자신의 태스크를 삭제한다', async () => {
        const res = await app_1.default.request(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        (0, vitest_1.expect)(res.status).toBe(204);
    });
});
