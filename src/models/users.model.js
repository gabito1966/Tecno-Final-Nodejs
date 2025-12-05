export class UserModel {
    constructor(name, email, role, passwordHash = null) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.passwordHash = passwordHash;
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
            role: this.role

        };
    }
}
