import { db } from './config/firebase.js'; // Ajusta la ruta

const updateProductIds = async () => {
    try {
        const snapshot = await db.collection('products').orderBy('id').get();
        if (snapshot.empty) {
            console.log('No hay productos para actualizar.');
            return;
        }

        let newId = 1; // Empieza desde 1
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const currentId = data.id;

            if (currentId !== newId) {
                // Crea un nuevo doc con el nuevo ID
                await db.collection('products').doc(String(newId)).set({
                    ...data,
                    id: newId
                });

                // Elimina el doc antiguo
                await db.collection('products').doc(doc.id).delete();
                console.log(`Producto ${currentId} actualizado a ${newId}`);
            }
            newId++;
        }

        console.log('✅ Actualización de IDs completada.');
    } catch (err) {
        console.error('Error actualizando IDs:', err);
    }
};

updateProductIds();
