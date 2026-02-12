module.exports = class SchoolManager {
    constructor({ config, managers, mongomodels, validators } = {}) {
        this.config = config;
        this.managers = managers;
        this.mongomodels = mongomodels;
        this.validators = validators;
        this.httpExposed = [
            'post=createSchool',
            'get=getSchools',
            'get=getSchool',
            'patch=updateSchool',
            'delete=deleteSchool'
        ];
    }

    async createSchool({ __token, __rbac, name, address, contactEmail, phoneNumber, metadata }) {
        const result = await this.validators.school.createSchool({ name, address, contactEmail, phoneNumber });
        if (result) return { error: result, code: 400 };

        const school = new this.mongomodels.School({
            name,
            address,
            contactEmail,
            phoneNumber,
            metadata
        });

        await school.save();
        return { school };
    }

    async getSchools({ __token, __rbac }) {
        const schools = await this.mongomodels.School.find({});
        return { schools };
    }

    async getSchool({ __token, __rbac, schoolId }) {
        const school = await this.mongomodels.School.findById(schoolId);
        if (!school) return { error: 'School not found', code: 404 };
        return { school };
    }

    async updateSchool({ __token, __rbac, schoolId, name, address, contactEmail, phoneNumber, metadata }) {
        const result = await this.validators.school.updateSchool({ schoolId, name, address, contactEmail, phoneNumber });
        if (result) return { error: result, code: 400 };

        const updates = { name, address, contactEmail, phoneNumber, metadata };
        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const school = await this.mongomodels.School.findByIdAndUpdate(
            schoolId,
            { $set: updates },
            { new: true }
        );

        if (!school) return { error: 'School not found', code: 404 };
        return { school };
    }

    async deleteSchool({ __token, __rbac, schoolId }) {
        const school = await this.mongomodels.School.findByIdAndDelete(schoolId);
        if (!school) return { error: 'School not found', code: 404 };
        return { message: 'School deleted successfully' };
    }
}
