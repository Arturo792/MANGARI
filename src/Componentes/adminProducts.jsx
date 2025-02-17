// AdminProducts.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/adminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (productId) => {
    navigate(`/admin/edit-product/${productId}`); // Redirige a la vista de edición
  };

  const handleDelete = async (productId) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      alert("Producto eliminado correctamente.");
      setProducts(products.filter((product) => product.id !== productId)); // Actualiza la lista
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  return (
    <div className="admin-products-container">
      <h1>Productos (Vista de Administrador)</h1>
      <ul className="admin-products-list">
        {products.map((product) => (
          <li key={product.id} className="admin-product-item">
            <img
              src={product.image}
              alt={product.name}
              className="admin-product-image"
            />
            <h2 className="admin-product-title">{product.name}</h2>
            <p className="admin-product-description">{product.description}</p>
            <p className="admin-product-price">${product.price}</p>
            <div className="admin-product-actions">
              <button
                className="edit-button"
                onClick={() => handleEdit(product.id)}
              >
                Editar
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(product.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminProducts;