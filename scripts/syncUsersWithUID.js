import "dotenv/config";
import admin from "firebase-admin";
import fs from "fs";

admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    }),
});

const db = admin.firestore();

async function main() {
    const users = JSON.parse(fs.readFileSync("./scripts/users.json"));

    for (const u of users) {
        try {
            const uid = String(u.id); // ← Asegura string siempre

            let userRecord;
            try {
                userRecord = await admin.auth().getUser(uid);
                console.log(`Usuario ya existe en Auth: ${u.email}`);
            } catch {
                userRecord = await admin.auth().createUser({
                    uid,
                    email: u.email,
                    password: u.password || "123456",
                    displayName: u.name,
                });
                console.log(`Usuario creado en Auth: ${u.email}`);
            }

            await db.collection("users").doc(uid).set(
                {
                    name: u.name,
                    email: u.email,
                    role: u.role || "user",
                    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
                },
                { merge: true }
            );
        } catch (err) {
            console.error(`Error con usuario ${u.email}:`, err.message);
        }
    }

    console.log("Sincronización completa con UID existentes.");
}

main();

