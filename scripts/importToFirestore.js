import "dotenv/config";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
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
        universe_domain: process.env.UNIVERSE_DOMAIN,
    }),
});

const db = getFirestore();

// Datos
const products = JSON.parse(fs.readFileSync("./scripts/products.json"));
const categories = JSON.parse(fs.readFileSync("./scripts/categories.json"));

async function importCollection(name, data) {
    const batch = db.batch();
    const colRef = db.collection(name);

    data.forEach((doc) => {
        const docRef = colRef.doc(); // ID automático
        batch.set(docRef, doc);
    });

    await batch.commit();
    console.log(`Importada colección: ${name}`);
}

async function main() {
    await importCollection("products", products);
    await importCollection("categories", categories);
    console.log("Todo importado correctamente.");
}

main();
