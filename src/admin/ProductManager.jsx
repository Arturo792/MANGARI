import React, { useState, useEffect } from 'react';
import { 
  doc, setDoc, getDoc, collection, 
  getDocs, deleteDoc, query, orderBy 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ProductManager.css'; // Importa el CSS

const ProductManager = ({ mode = 'create' }) => {
  const { productId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: 0,
    image: null,
    imageUrl: ''
  });
  const [products, setProducts] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Verificar permisos de admin
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

  // Cargar producto para editar
  useEffect(() => {
    if (mode === 'edit' && productId) {
      const loadProduct = async () => {
        try {
          setIsLoading(true);
          const productDoc = await getDoc(doc(db, "products", productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
            setFormData({
              name: productData.name,
              price: productData.price.toString(),
              description: productData.description,
              stock: productData.stock,
              image: null,
              imageUrl: productData.image
            });
            setPreviewImage(productData.image);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      loadProduct();
    }
  }, [mode, productId]);

  // Cargar lista de productos
  useEffect(() => {
    if (mode === 'list') {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsData);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
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
      stock: Math.max(0, (parseInt(prev.stock) || 0) + amount)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.name || !formData.price || formData.stock < 0) {
        throw new Error("Todos los campos son obligatorios");
      }

      let imageUrl = formData.imageUrl;
      
      // Subir nueva imagen solo si se seleccionó una
      if (formData.image) {
        const imageRef = ref(storage, `products/${Date.now()}-${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: imageUrl,
        description: formData.description,
        updatedAt: new Date().toISOString()
      };

      if (mode === 'create') {
        productData.id = Date.now().toString();
        productData.createdAt = new Date().toISOString();
        await setDoc(doc(db, "products", productData.id), productData);
      } else {
        await setDoc(doc(db, "products", productId), productData, { merge: true });
      }

      setShowSuccess(true);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      stock: 0,
      image: null,
      imageUrl: ''
    });
    setPreviewImage('');
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="success-container">
        <h2>
          {mode === 'create' 
            ? '¡Producto agregado exitosamente!' 
            : '¡Producto actualizado exitosamente!'}
        </h2>
        <div className="success-actions">
          <button onClick={() => navigate('/admin/products')} className="btn primary">
            Ver lista de productos
          </button>
          {mode === 'create' && (
            <button onClick={resetForm} className="btn secondary">
              Agregar otro producto
            </button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'list') {
    return (
      <div className="product-list-container">
        <div className="product-list-header">
          <h1>Administración de Productos</h1>
          <button 
            onClick={() => navigate('/admin/products/new')}
            className="add-product-button"
          >
            + Añadir Producto
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Cargando productos...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No hay productos registrados</p>
            <button 
              onClick={() => navigate('/admin/products/new')}
              className="add-product-button"
            >
              Añadir Primer Producto
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>${product.price.toFixed(2)}</p>
                  <p>Stock: {product.stock}</p>
                </div>
                <div className="product-actions">
                  <button 
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="delete-button"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <h1>
        {mode === 'create' 
          ? 'Agregar Nuevo Producto' 
          : 'Editar Producto'}
      </h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
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
          />
        </div>

        <div className="form-group">
          <label>Imagen</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="image-preview"
            />
          )}
        </div>

        <div className="form-group">
          <label>Stock</label>
          <div className="stock-controls">
            <button 
              type="button" 
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
            />
            <button 
              type="button" 
              onClick={() => handleStockChange(1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
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
            {isLoading 
              ? (mode === 'create' ? 'Agregando...' : 'Actualizando...') 
              : (mode === 'create' ? 'Agregar Producto' : 'Actualizar Producto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductManager;