import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: 0,
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Debes iniciar sesión");
        
        const adminDoc = await getDoc(doc(db, "admins", user.email));
        if (!adminDoc.exists()) throw new Error("No tienes permisos de administrador");
      } catch (err) {
        setError(err.message);
        navigate('/login');
      }
    };

    checkAdmin();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleStockChange = (amount) => {
    setFormData(prev => ({
      ...prev,
      stock: Math.max(0, parseInt(prev.stock || 0) + amount)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.name || !formData.price || !formData.image || formData.stock < 0) {
        throw new Error("Todos los campos son obligatorios");
      }

      const imageRef = ref(storage, `products/${Date.now()}-${formData.image.name}`);
      await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(imageRef);

      const productId = Date.now().toString();
      const productData = {
        id: productId,
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: imageUrl,
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "products", productId), productData);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error al agregar producto:", err);
      setError(err.message || "Ocurrió un error al agregar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      stock: 0,
      image: null
    });
    setPreviewImage('');
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="success-container">
        <h2>¡Producto agregado exitosamente!</h2>
        <div className="success-actions">
          <button onClick={() => navigate('/admin/products')} className="btn primary">
            Ver lista de productos
          </button>
          <button onClick={resetForm} className="btn secondary">
            Agregar otro producto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-container">
      <h1 className="add-product-title">Agregar Nuevo Producto</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Precio ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Imagen del Producto</label>
            <div className="file-upload">
              <label className="file-upload-label">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                  required
                />
                Seleccionar Archivo
              </label>
              <span className="file-name">
                {formData.image ? formData.image.name : 'Ningún archivo seleccionado'}
              </span>
            </div>
            {previewImage && (
              <div className="image-preview">
                <img 
                  src={previewImage} 
                  alt="Vista previa" 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+no+disponible';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group stock-control">
            <label>Cantidad en Stock</label>
            <div className="stock-input-group">
              <button 
                type="button" 
                className="stock-button minus"
                onClick={() => handleStockChange(-1)}
              >
                -
              </button>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="stock-input"
                required
              />
              <button 
                type="button" 
                className="stock-button plus"
                onClick={() => handleStockChange(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Descripción del Producto</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-textarea"
              rows="5"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')}
            className="cancel-button"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? 'Agregando...' : 'Agregar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;