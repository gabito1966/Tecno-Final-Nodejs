// Verifica que Firebase esté cargado correctamente
if (!window.auth || !window.db) {
    console.error("Firebase no se inicializó correctamente.");
}

// Ejemplo: funciones globales
export function getCurrentUser() {
    return window.auth.currentUser;
}

export function onUserChanged(callback) {
    return window.auth.onAuthStateChanged(callback);
}

export async function getDocument(collection, id) {
    const ref = window.db.collection(collection).doc(id);
    const doc = await ref.get();
    return doc.exists ? doc.data() : null;
}

export async function addDocument(collection, data) {
    return window.db.collection(collection).add(data);
}

export async function logoutUser() {
    return window.auth.signOut();
}
