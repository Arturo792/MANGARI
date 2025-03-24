import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/editProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setFormData({
            name: productData.name || '',
            price: productData.price || '',
            description: productData.description || '',
            stock: productData.stock || 0
          });
          setPreviewImage(productData.image || '');
        } else {
          setError("Producto no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        setError("Error al cargar el producto");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleStockChange = (amount) => {
    setFormData(prev => ({
      ...prev,
      stock: Math.max(0, parseInt(prev.stock) + amount)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    try {
      let imageUrl = previewImage;

      if (imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(doc(db, "products", id), {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: imageUrl,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setError("Error al actualizar producto. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando producto...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => navigate('/admin/products')} className="back-button">
        Volver a la lista
      </button>
    </div>
  );

  return (
    <div className="edit-product-container">
      <h1 className="edit-product-title">Editar Producto</h1>
      
      {success && (
        <div className="success-message">
          <p>¡Producto actualizado correctamente!</p>
          <div className="success-animation"></div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="edit-product-form">
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
                />
                Seleccionar Archivo
              </label>
              <span className="file-name">
                {imageFile ? imageFile.name : 'Ningún archivo seleccionado'}
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

        {error && <p className="error-message">{error}</p>}

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
            disabled={isUploading}
            className="submit-button"
          >
            {isUploading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;