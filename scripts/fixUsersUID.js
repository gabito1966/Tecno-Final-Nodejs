import admin from "firebase-admin";
import { db } from "../src/config/firebase.js";

const fixUsersUID = async () => {
    try {
        console.log("Corrigiendo usuarios...");

        const snapshot = await db.collection("users").get();

        for (const doc of snapshot.docs) {
            const oldId = doc.id;         // el email
            const data = doc.data();

            if (!data.email) {
                console.log(`Omitido: documento sin email`);
                continue;
            }

            // Si ya existe en Auth, saltar
            const existsInAuth = await admin.auth().getUserByEmail(data.email).catch(() => null);

            let uid;

            if (existsInAuth) {
                uid = existsInAuth.uid;
                console.log(`Usuario ${data.email} ya existe en Auth con UID ${uid}`);
            } else {
                // Crear usuario nuevo
                const userRecord = await admin.auth().createUser({
                    email: data.email,
                    displayName: data.name || "",
                    emailVerified: true
                });

                uid = userRecord.uid;
                console.log(`Usuario ${data.email} creado en Auth con UID ${uid}`);
            }

            // Si UID = oldId no hacemos nada
            if (uid === oldId) {
                console.log(`Documento ${oldId} ya tiene UID correcto`);
                continue;
            }

            // MOVER DOCUMENTO
            await db.collection("users").doc(uid).set(data);
            await db.collection("users").doc(oldId).delete();

            console.log(`Firestore: movido ${oldId} → ${uid}`);
        }

        console.log("Corrección completa.");
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

fixUsersUID();
