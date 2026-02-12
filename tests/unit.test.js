const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const UserManager = require('../managers/entities/user/User.manager');
const SchoolManager = require('../managers/entities/school/School.manager');
const ClassroomManager = require('../managers/entities/classroom/Classroom.manager');
const StudentManager = require('../managers/entities/student/Student.manager');

let mongoServer;
let mongomodels;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Load models
    mongomodels = {
        User: require('../managers/entities/user/User.mongoModel'),
        School: require('../managers/entities/school/School.mongoModel'),
        Classroom: require('../managers/entities/classroom/Classroom.mongoModel'),
        Student: require('../managers/entities/student/Student.mongoModel'),
    };
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Unit Tests: User Manager', () => {
    let userManager;
    let mockValidators;
    let mockTokenManager;
    const mockShark = {
        addDirectAccess: jest.fn().mockResolvedValue({ ok: true })
    };

    beforeEach(() => {
        mockValidators = {
            user: {
                createUser: jest.fn().mockResolvedValue(null),
                login: jest.fn().mockResolvedValue(null),
            }
        };
        mockTokenManager = {
            genLongToken: jest.fn().mockReturnValue('long-token'),
            genShortToken: jest.fn().mockReturnValue('short-token'),
        };
        userManager = new UserManager({
            mongomodels,
            validators: mockValidators,
            managers: { 
                token: mockTokenManager,
                shark: mockShark
            },
            config: { dotEnv: {} }
        });
    });

    it('should create a user successfully', async () => {
        const school = new mongomodels.School({ name: 'S0', address: 'A0', contactEmail: 'e0@e.com', phoneNumber: '0' });
        await school.save();

        const userData = {
            username: 'testuser',
            email: 'test@test.com',
            password: 'password123',
            role: 'school_admin',
            schoolId: school._id
        };
        const result = await userManager.createUser(userData);
        expect(result.user).toBeDefined();
        expect(result.user.username).toBe(userData.username);
        const userInDb = await mongomodels.User.findOne({ email: userData.email });
        expect(userInDb).toBeDefined();
    });

    it('should fail creation if validation fails', async () => {
        mockValidators.user.createUser.mockResolvedValue('Invalid data');
        const result = await userManager.createUser({ username: 'invalid' });
        expect(result.error).toBe('Invalid data');
        expect(result.code).toBe(400);
    });
});

describe('Unit Tests: School Manager', () => {
    let schoolManager;
    let mockValidators;

    beforeEach(() => {
        mockValidators = {
            school: {
                createSchool: jest.fn().mockResolvedValue(null),
                updateSchool: jest.fn().mockResolvedValue(null),
            }
        };
        schoolManager = new SchoolManager({
            mongomodels,
            validators: mockValidators
        });
    });

    it('should create a school successfully', async () => {
        const schoolData = {
            name: 'Test School',
            address: '123 Street',
            contactEmail: 'school@test.com',
            phoneNumber: '1234567890'
        };
        const result = await schoolManager.createSchool(schoolData);
        expect(result.school).toBeDefined();
        expect(result.school.name).toBe(schoolData.name);
    });
});

describe('Unit Tests: Classroom Manager', () => {
    let classroomManager;
    let mockValidators;

    beforeEach(() => {
        mockValidators = {
            classroom: {
                createClassroom: jest.fn().mockResolvedValue(null),
                updateClassroom: jest.fn().mockResolvedValue(null),
            }
        };
        classroomManager = new ClassroomManager({
            mongomodels,
            validators: mockValidators
        });
    });

    it('should create a classroom successfully', async () => {
        const school = new mongomodels.School({ name: 'S1', address: 'A1', contactEmail: 'e@e.com', phoneNumber: '1' });
        await school.save();

        const classroomData = {
            schoolId: school._id,
            name: 'Class 1',
            capacity: 30
        };
        const result = await classroomManager.createClassroom(classroomData);
        expect(result.classroom).toBeDefined();
        expect(result.classroom.name).toBe(classroomData.name);
    });
});

describe('Unit Tests: Student Manager', () => {
    let studentManager;
    let mockValidators;

    beforeEach(() => {
        mockValidators = {
            student: {
                enrollStudent: jest.fn().mockResolvedValue(null),
                transferStudent: jest.fn().mockResolvedValue(null),
            }
        };
        studentManager = new StudentManager({
            mongomodels,
            validators: mockValidators
        });
    });

    it('should enroll a student successfully', async () => {
        const school = new mongomodels.School({ name: 'S2', address: 'A2', contactEmail: 'e2@e.com', phoneNumber: '2' });
        await school.save();
        const classroom = new mongomodels.Classroom({ schoolId: school._id, name: 'C1', capacity: 20 });
        await classroom.save();

        const studentData = {
            schoolId: school._id,
            classroomId: classroom._id,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            gender: 'male'
        };
        const result = await studentManager.enrollStudent(studentData);
        expect(result.student).toBeDefined();
        expect(result.student.firstName).toBe(studentData.firstName);
    });
});
