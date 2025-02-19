import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [productDescription, setProductDescription] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState({
    name: false,
    price: false,
    description: false,
  });
  const navigate = useNavigate();

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const storageRef = ref(storage, `product-images/${productImage.name}`);
      await uploadBytes(storageRef, productImage);
      const imageUrl = await getDownloadURL(storageRef);

      const productId = Date.now().toString();
      await setDoc(doc(db, "products", productId), {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: imageUrl,
        description: productDescription,
      });

      alert("Producto agregado correctamente.");
      navigate('/products');
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
          <label
            className={
              (isFocused.name || productName) ? 'label-hidden' : ''
            }
          >
            Nombre del Producto
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onFocus={() => handleFocus('name')}
            onBlur={() => handleBlur('name')}
            required
          />
        </div>

        <div className="input-group">
          <label
            className={
              (isFocused.price || productPrice) ? 'label-hidden' : ''
            }
          >
            Precio del Producto
          </label>
          <input
            type="number"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            onFocus={() => handleFocus('price')}
            onBlur={() => handleBlur('price')}
            required
          />
        </div>

        <div className="input-group">
          <label>Imagen del Producto</label>
          <input
            type="file"
            onChange={(e) => setProductImage(e.target.files[0])}
            required
          />
        </div>

        <div className="input-group">
          <label
            className={
              (isFocused.description || productDescription) ? 'label-hidden' : ''
            }
          >
            Descripción del Producto
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            onFocus={() => handleFocus('description')}
            onBlur={() => handleBlur('description')}
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