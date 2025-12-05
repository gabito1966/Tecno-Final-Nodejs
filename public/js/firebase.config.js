const firebaseConfig = {
    apiKey: "<%= VITE_API_KEY %>",
    authDomain: "<%= VITE_AUTH_DOMAIN %>",
    projectId: "<%= VITE_PROJECT_ID %>",
    storageBucket: "<%= VITE_STORAGE_BUCKET %>",
    messagingSenderId: "<%= VITE_MESSAGING_SENDER_ID %>",
    appId: "<%= VITE_APP_ID %>"
};

// Inicialización con SDK global (CDN)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.getAuth(app);
const db = firebase.getFirestore(app);
