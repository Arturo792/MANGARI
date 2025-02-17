// AddProduct.jsx
import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Crea un documento en la colección "products"
      const productId = Date.now().toString(); // Usamos un ID único basado en el timestamp
      await setDoc(doc(db, "products", productId), {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: productImage,
        description: productDescription,
      });
      alert("Producto agregado correctamente.");
      navigate('/products'); // Redirige a la lista de productos
    } catch (error) {
      console.error("Error al agregar producto:", error);
      setError("Error al agregar producto. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="add-product-container">
      <h1>Agregar Producto</h1>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="input-group">
          <label>Nombre del Producto</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Precio del Producto</label>
          <input
            type="number"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>URL de la Imagen</label>
          <input
            type="text"
            value={productImage}
            onChange={(e) => setProductImage(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Descripción del Producto</label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button">
          Agregar Producto
        </button>
      </form>
    </div>
  );
};

export default AddProduct;