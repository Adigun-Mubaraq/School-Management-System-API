module.exports = class ClassroomManager {
    constructor({ config, managers, mongomodels, validators } = {}) {
        this.config = config;
        this.managers = managers;
        this.mongomodels = mongomodels;
        this.validators = validators;
        this.httpExposed = [
            'post=createClassroom',
            'get=getClassrooms',
            'get=getClassroom',
            'patch=updateClassroom',
            'delete=deleteClassroom'
        ];
    }

    async createClassroom({ __token, __rbac, schoolId, name, capacity, resources }) {
        const result = await this.validators.classroom.createClassroom({ schoolId, name, capacity });
        if (result) return { error: result, code: 400 };

        const classroom = new this.mongomodels.Classroom({
            schoolId,
            name,
            capacity,
            resources
        });

        await classroom.save();
        return { classroom };
    }

    async getClassrooms({ __token, __rbac, schoolId }) {
        const query = schoolId ? { schoolId } : {};
        const classrooms = await this.mongomodels.Classroom.find(query).populate('schoolId', 'name');
        return { classrooms };
    }

    async getClassroom({ __token, __rbac, classroomId }) {
        const classroom = await this.mongomodels.Classroom.findById(classroomId).populate('schoolId', 'name');
        if (!classroom) return { error: 'Classroom not found', code: 404 };
        return { classroom };
    }

    async updateClassroom({ __token, __rbac, classroomId, name, capacity, resources }) {
        const result = await this.validators.classroom.updateClassroom({ classroomId, name, capacity });
        if (result) return { error: result, code: 400 };

        const updates = { name, capacity, resources };
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const classroom = await this.mongomodels.Classroom.findByIdAndUpdate(
            classroomId,
            { $set: updates },
            { new: true }
        );

        if (!classroom) return { error: 'Classroom not found', code: 404 };
        return { classroom };
    }

    async deleteClassroom({ __token, __rbac, classroomId }) {
        const classroom = await this.mongomodels.Classroom.findByIdAndDelete(classroomId);
        if (!classroom) return { error: 'Classroom not found', code: 404 };
        return { message: 'Classroom deleted successfully' };
    }
}
