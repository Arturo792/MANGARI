import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const reducirStock = async (idProducto, cantidadReducir) => {
  const productoRef = doc(db, "products", idProducto);

  await runTransaction(db, async (transaction) => {
    const productoSnap = await transaction.get(productoRef);

    if (!productoSnap.exists()) {
      throw new Error(`Producto no encontrado: ${idProducto}`);
    }

    const stockActual = productoSnap.data().stock || 0;

    if (stockActual < cantidadReducir) {
      throw new Error(`Stock insuficiente del producto: ${idProducto}`);
    }

    const nuevoStock = stockActual - cantidadReducir;
    const updatedAt = new Date().toISOString()

    const updateData = {
      stock: nuevoStock,
      updatedAt: updatedAt.toString(),
    };

    transaction.update(productoRef, updateData);
    console.log(updateData);

    console.log(`Stock actualizado para ${idProducto}: ${stockActual} → ${nuevoStock}`);
  });
};
