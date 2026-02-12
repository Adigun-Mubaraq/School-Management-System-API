const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const ManagersLoader = require('../loaders/ManagersLoader');
const config = require('../config/index.config');

// Mock external dependencies
jest.mock('ion-cortex');
jest.mock('oyster-db');
jest.mock('aeon-machine');

const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    client: { 
        sendCommand: jest.fn().mockResolvedValue(1)
    }
};
jest.mock('../cache/cache.dbh', () => () => mockCache);

describe('School Management System Integration Tests', () => {
    let mongoServer;
    let managers;
    let app;
    let superAdminToken;
    let schoolAdminToken;
    let schoolId;
    let classroomId;
    let studentId;

    // Simplified Oyster mock with in-memory storage for relations
    const oysterStore = new Map();
    const mockOyster = {
        call: jest.fn().mockImplementation(async (command, args) => {
            if (command === 'update_relations') {
                const userId = args._id;
                if (args.set && args.set._members) {
                    if (!oysterStore.has(userId)) oysterStore.set(userId, []);
                    oysterStore.get(userId).push(...args.set._members);
                }
                return { ok: true };
            }
            if (command === 'relation_score') {
                const userId = args._id;
                const members = oysterStore.get(userId) || [];
                const scores = {};
                const requestedNodes = args.items || [];
                
                for (const member of members) {
                    // member format: node:schoolId~rank:!
                    const parts = member.split('~');
                    const nodePart = parts[0]; // e.g., "node:schoolId"
                    const rankPart = parts[1].split(':')[0]; // e.g., "6"
                    
                    if (requestedNodes.includes(nodePart)) {
                        scores[member] = parseInt(rankPart);
                    }
                }
                return scores;
            }
            return {};
        })
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        config.dotEnv.MONGO_URI = mongoUri;

        const mockCortex = new (require('ion-cortex'))({
            prefix: config.dotEnv.CORTEX_PREFIX,
            type: config.dotEnv.CORTEX_TYPE,
            state: () => ({}),
            activeNodes: () => ({}),
        });
        mockCortex.sub = jest.fn();

        const managersLoader = new ManagersLoader({
            config,
            cache: mockCache,
            cortex: mockCortex,
            oyster: mockOyster,
            aeon: { call: jest.fn().mockResolvedValue({}) }
        });

        managers = managersLoader.load();
        await mongoose.connect(mongoUri);

        app = express();
        app.use(express.json());
        app.all('/api/:moduleName/:fnName', managers.userApi.mw);
    });

    afterAll(async () => {
        if (mongoose.connection) await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    describe('1. Authentication & Seeding', () => {
        it('should seed superadmin directly in DB', async () => {
            const hashedPassword = await require('bcrypt').hash('password123', 10);
            const superadmin = new managers.mongomodels.User({
                username: 'superadmin',
                email: 'superadmin@test.com',
                password: hashedPassword,
                role: 'superadmin'
            });
            await superadmin.save();
            expect(superadmin._id).toBeDefined();
        });

        it('should login as superadmin', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: 'superadmin@test.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            superAdminToken = res.body.data.shortToken;
            expect(superAdminToken).toBeDefined();
        });
    });

    describe('2. School Management (Superadmin)', () => {
        it('should create a school', async () => {
            const res = await request(app)
                .post('/api/school/createSchool')
                .set('token', superAdminToken)
                .send({
                    name: 'Greenwood High',
                    address: '123 Forest Road',
                    contactEmail: 'info@greenwood.com',
                    phoneNumber: '1234567890'
                });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            schoolId = res.body.data.school._id;
            expect(schoolId).toBeDefined();
        });
    });

    describe('3. User Management (Superadmin)', () => {
        it('should create a school admin', async () => {
            const res = await request(app)
                .post('/api/user/createUser')
                .set('token', superAdminToken)
                .send({
                    username: 'school_admin_1',
                    email: 'admin@greenwood.com',
                    password: 'password123',
                    role: 'school_admin',
                    schoolId: schoolId
                });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
        });

        it('should login as school admin', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: 'admin@greenwood.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            schoolAdminToken = res.body.data.shortToken;
            expect(schoolAdminToken).toBeDefined();
        });
    });

    describe('4. School Admin Operations & RBAC', () => {
        it('should allow school admin to create a classroom', async () => {
            const res = await request(app)
                .post('/api/classroom/createClassroom')
                .set('token', schoolAdminToken)
                .send({
                    schoolId,
                    name: 'Grade 10-A',
                    capacity: 30
                });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            classroomId = res.body.data.classroom._id;
        });

        it('should allow school admin to enroll a student', async () => {
            const res = await request(app)
                .post('/api/student/enrollStudent')
                .set('token', schoolAdminToken)
                .send({
                    schoolId,
                    classroomId,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    gender: 'male'
                });

            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            studentId = res.body.data.student._id;
        });

        it('should NOT allow school admin to create another school (RBAC check)', async () => {
            const res = await request(app)
                .post('/api/school/createSchool')
                .set('token', schoolAdminToken)
                .send({
                    name: 'Illegal School',
                    address: 'Some address',
                    contactEmail: 'illegal@school.com',
                    phoneNumber: '0000000000'
                });

            expect(res.status).toBe(403);
            expect(res.body.ok).toBe(false);
        });
    });

    describe('5. Data Retrieval', () => {
        it('should allow school admin to get their school profile', async () => {
            const res = await request(app)
                .get('/api/school/getSchool')
                .set('token', schoolAdminToken)
                .query({ schoolId });

            expect(res.status).toBe(200);
            expect(res.body.data.school.name).toBe('Greenwood High');
        });

        it('should allow school admin to list students', async () => {
            const res = await request(app)
                .get('/api/student/getStudents')
                .set('token', schoolAdminToken)
                .query({ schoolId });

            expect(res.status).toBe(200);
            expect(res.body.data.students.length).toBeGreaterThan(0);
        });
    });
});
