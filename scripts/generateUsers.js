import bcrypt from "bcryptjs";
import fs from "fs";

const users = [
    {
        "id": 1,
        "nombre": "Gabriel",
        "email": "gabriel@gmail.com",
        "password": "gabriel1234",
        "role": "admin"
    },
    {
        "id": 2,
        "nombre": "Francisco",
        "email": "francisco@gmail.com",
        "password": "francisco1234",
        "role": "user"
    },
    {
        "id": 3,
        "nombre": "Mabel",
        "email": "mabel@mail.com",
        "password": "mabel1234",
        "role": "user"
    }
];

const hashPasswords = async () => {
    const hashedUsers = [];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        hashedUsers.push({
            id: user.id,
            email: user.email,
            password: hashedPassword,
            role: user.role
        });
    }
    fs.writeFileSync("scripts/usersHashed.json", JSON.stringify(hashedUsers, null, 2));
    console.log("✔ Archivo usersHashed.json generado con contraseñas hasheadas.");
};

hashPasswords();
