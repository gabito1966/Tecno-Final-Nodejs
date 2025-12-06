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

    for (const user of users) {
        try {
            const userRecord = await admin.auth().createUser({
                email: user.email,
                password: user.password || "123456",
                displayName: user.name,
            });

            await db.collection("users").doc(userRecord.uid).set(
                {
                    name: user.name,
                    email: user.email,
                    role: user.role || "user",
                    createdAt: new Date(),
                },
                { merge: true }
            );

            console.log(`Usuario sincronizado: ${user.email}`);
        } catch (err) {
            console.error(`Error con usuario ${user.email}:`, err.message);
        }
    }

    console.log("Sincronización completa.");
}

main();
