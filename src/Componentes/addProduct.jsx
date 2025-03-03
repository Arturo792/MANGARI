import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [productDescription, setProductDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    price: false,
    description: false,
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para mostrar el mensaje de éxito
  const navigate = useNavigate();

  // Autenticar al usuario al cargar el componente
  useEffect(() => {
    const authenticateAdmin = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No estás autenticado.");
        }

        // Verifica si el usuario actual es un administrador
        const adminDoc = await getDoc(doc(db, "admins", user.email)); // Usa user.email
        if (!adminDoc.exists()) {
          throw new Error("No tienes permisos para agregar productos.");
        }

        console.log("Usuario autenticado:", user);
      } catch (error) {
        console.error("Error de autenticación:", error);
        setError("Error de autenticación. Inténtalo de nuevo.");
      }
    };

    authenticateAdmin();
  }, []);

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No estás autenticado.");
      }

      // Verifica si el usuario actual es un administrador
      const adminDoc = await getDoc(doc(db, "admins", user.email)); // Usa user.email
      if (!adminDoc.exists()) {
        throw new Error("No tienes permisos para agregar productos.");
      }

      console.log("Validando imagen...");
      if (!productImage) {
        throw new Error("Debes seleccionar una imagen para el producto.");
      }

      console.log("Subiendo imagen a Firebase Storage...");
      const storageRef = ref(storage, `products/${productImage.name}`);
      await uploadBytes(storageRef, productImage).then((snapshot) => {
        console.log("Imagen subida con éxito:", snapshot);
      });

      console.log("Obteniendo URL de la imagen...");
      const imageUrl = await getDownloadURL(storageRef); // Aquí obtienes la URL
      console.log("URL de la imagen:", imageUrl);

      console.log("Creando ID único para el producto...");
      const productId = Date.now().toString();

      console.log("Guardando datos en Firestore...");
      await setDoc(doc(db, "products", productId), {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: imageUrl, // Aquí guardas la URL en Firestore
        description: productDescription,
      });
      console.log("Producto guardado en Firestore.");

      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      setError(error.message || "Error al agregar producto. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear el formulario y permitir agregar otro producto
  const handleAddAnotherProduct = () => {
    setProductName('');
    setProductPrice('');
    setProductImage(null);
    setProductDescription('');
    setShowSuccessMessage(false);
  };

  return (
    <div className="add-product-container">
      <h1>Agregar Producto</h1>
      {showSuccessMessage ? (
        <div className="success-message">
          <p>¡Producto agregado correctamente!</p>
          <div className="success-buttons">
            <button onClick={() => navigate('/admin/products')} className="success-button">
              Ver lista de productos
            </button>
            <button onClick={handleAddAnotherProduct} className="success-button">
              Agregar otro producto
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="input-group">
            <label className={(isFocused.name || productName) ? 'label-hidden' : ''}>
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
            <label className={(isFocused.price || productPrice) ? 'label-hidden' : ''}>
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
              accept="image/*"
              onChange={(e) => setProductImage(e.target.files[0])}
              required
            />
          </div>

          <div className="input-group">
            <label className={(isFocused.description || productDescription) ? 'label-hidden' : ''}>
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

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Agregando...' : 'Agregar Producto'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddProduct;