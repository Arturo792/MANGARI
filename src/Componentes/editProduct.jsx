// EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/editProduct.css';

const EditProduct = () => {
  const { id } = useParams(); // Obtener el ID del producto desde la URL
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProductName(productData.name);
          setProductPrice(productData.price);
          setProductImage(productData.image);
          setProductDescription(productData.description);
        } else {
          setError("Producto no encontrado.");
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        setError("Error al obtener el producto.");
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await updateDoc(doc(db, "products", id), {
        name: productName,
        price: parseFloat(productPrice),
        image: productImage,
        description: productDescription,
      });
      alert("Producto actualizado correctamente.");
      navigate('/products'); // Redirige a la lista de productos
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setError("Error al actualizar producto. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="edit-product-container">
      <h1>Editar Producto</h1>
      <form onSubmit={handleSubmit} className="edit-product-form">
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
          Actualizar Producto
        </button>
      </form>
    </div>
  );
};

export default EditProduct;