import "dotenv/config";
import admin from "firebase-admin";

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

const usersToFix = [
    { uid: "7FzE6PupE6YLnqSXuinNO3tSqEn2", newPass: "gabriel1234" }, // Gabriel
    { uid: "Ca0sMHrEABQRr0cvuWoXvJChcmd2", newPass: "mabel1234" }, // Mabel
    { uid: "VTjfhvByhRYMoZUgAcg0rofgDED3", newPass: "py1234" }, // Py
];

async function main() {
    for (const u of usersToFix) {
        try {
            await admin.auth().updateUser(u.uid, { password: u.newPass });
            console.log(`✔ Contraseña actualizada para UID: ${u.uid}`);
        } catch (err) {
            console.error(`❌ Error con UID ${u.uid}:`, err.message);
        }
    }
    console.log("Listo.");
}

main();
