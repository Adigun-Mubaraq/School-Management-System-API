module.exports = class StudentManager {
    constructor({ config, managers, mongomodels, validators } = {}) {
        this.config = config;
        this.managers = managers;
        this.mongomodels = mongomodels;
        this.validators = validators;
        this.httpExposed = [
            'post=enrollStudent',
            'get=getStudents',
            'get=getStudentProfile',
            'patch=transferStudent',
            'delete=removeStudent'
        ];
    }

    async enrollStudent({ __token, __rbac, schoolId, classroomId, firstName, lastName, email, dateOfBirth, gender }) {
        const result = await this.validators.student.enrollStudent({ schoolId, classroomId, firstName, lastName, email, gender });
        if (result) return { error: result, code: 400 };

        const student = new this.mongomodels.Student({
            schoolId,
            classroomId,
            firstName,
            lastName,
            email,
            dateOfBirth,
            gender
        });

        await student.save();
        return { student };
    }

    async getStudents({ __token, __rbac, schoolId, classroomId }) {
        const query = {};
        if (schoolId) query.schoolId = schoolId;
        if (classroomId) query.classroomId = classroomId;

        const students = await this.mongomodels.Student.find(query)
            .populate('schoolId', 'name')
            .populate('classroomId', 'name');
        return { students };
    }

    async getStudentProfile({ __token, __rbac, studentId }) {
        const student = await this.mongomodels.Student.findById(studentId)
            .populate('schoolId', 'name')
            .populate('classroomId', 'name');
        if (!student) return { error: 'Student not found', code: 404 };
        return { student };
    }

    async transferStudent({ __token, __rbac, studentId, classroomId, schoolId }) {
        const result = await this.validators.student.transferStudent({ studentId, classroomId, schoolId });
        if (result) return { error: result, code: 400 };

        const updates = {};
        if (classroomId) updates.classroomId = classroomId;
        if (schoolId) updates.schoolId = schoolId;

        const student = await this.mongomodels.Student.findByIdAndUpdate(
            studentId,
            { $set: updates },
            { new: true }
        );

        if (!student) return { error: 'Student not found', code: 404 };
        return { student };
    }

    async removeStudent({ __token, __rbac, studentId }) {
        const student = await this.mongomodels.Student.findByIdAndDelete(studentId);
        if (!student) return { error: 'Student not found', code: 404 };
        return { message: 'Student removed successfully' };
    }
}
