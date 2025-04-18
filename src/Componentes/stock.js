import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function reducirStock(cartItems) {
  // Aseguramos que cartItems sea siempre un array
  if (!Array.isArray(cartItems)) {
    console.warn("cartItems no es un array. Lo convertimos en uno.");
    cartItems = [cartItems];
  }

  if (cartItems.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  for (const item of cartItems) {
    if (!item.id || typeof item.id !== "string") {
      console.error(`Error: El artículo tiene un ID inválido o faltante:`, item);
      continue;
    }

    const productoRef = doc(db, "products", item.id);
    const productoSnap = await getDoc(productoRef);

    if (!productoSnap.exists()) {
      console.error(`Producto no encontrado en Firestore: ${item.id}`);
      continue;
    }

    const data = productoSnap.data();
    const stockActual = data.stock;

    if (item.quantity <= 0 || item.quantity > stockActual) {
      console.error(`Cantidad inválida o stock insuficiente para el producto ${item.id}. Stock actual: ${stockActual}, cantidad solicitada: ${item.quantity}`);
      continue;
    }

    const nuevoStock = stockActual - item.quantity;

    try {
      await updateDoc(productoRef, {
        stock: nuevoStock,
        updatedAt: new Date().toISOString(),
      });
      console.log(`Stock actualizado para el producto ${item.id}. Nuevo stock: ${nuevoStock}`);
    } catch (error) {
      console.error(`Error al actualizar el stock del producto ${item.id}:`, error);
    }
  }
}
