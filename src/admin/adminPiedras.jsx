import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/adminPiedras.modules.css';

const AdminPiedras = () => {
  const [piedras, setPiedras] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    propiedad: '',
    signos: '',
    descripcionCosmica: '',
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Cargar piedras al iniciar
  useEffect(() => {
    const loadPiedras = async () => {
      try {
        setIsLoading(true);
        const querySnapshot = await getDocs(collection(db, 'piedras'));
        const piedrasData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Maneja nombres de campos inconsistentes
          return {
            id: doc.id,
            nombre: data.nombre || '',
            propiedad: data.propiedad || '',
            signos: data.signos || '',
            descripcionCosmica: data.descripcionCosmica || data.descriptonCosmicas || '',
            imagen: data.imagen || ''
          };
        });
        setPiedras(piedrasData);
      } catch (err) {
        console.error("Error cargando piedras:", err);
        setError("Error al cargar la lista de piedras");
      } finally {
        setIsLoading(false);
      }
    };
    loadPiedras();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `piedras/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.nombre || !formData.propiedad || !formData.signos || !formData.descripcionCosmica) {
        throw new Error("Todos los campos son obligatorios");
      }

      let imagenUrl = formData.imagen;
      if (formData.imagen && typeof formData.imagen !== 'string') {
        imagenUrl = await uploadImage(formData.imagen);
      }

      const piedraData = {
        nombre: formData.nombre,
        propiedad: formData.propiedad,
        signos: formData.signos,
        descripcionCosmica: formData.descripcionCosmica,
        imagen: imagenUrl
      };

      if (editingId) {
        await updateDoc(doc(db, 'piedras', editingId), piedraData);
      } else {
        await addDoc(collection(db, 'piedras'), piedraData);
      }

      // Recargar datos
      const querySnapshot = await getDocs(collection(db, 'piedras'));
      setPiedras(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Manejar nombres inconsistentes
        descripcionCosmica: doc.data().descripcionCosmica || doc.data().descriptonCosmicas || ''
      })));
      
      setShowSuccess(true);
      resetForm();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (piedra) => {
    setFormData({
      nombre: piedra.nombre,
      propiedad: piedra.propiedad,
      signos: piedra.signos,
      descripcionCosmica: piedra.descripcionCosmica,
      imagen: piedra.imagen
    });
    setPreviewImage(piedra.imagen);
    setEditingId(piedra.id);
  };

  const handleDelete = async (id, imagenUrl) => {
    if (window.confirm('¿Eliminar esta piedra?')) {
      try {
        if (imagenUrl) {
          const imageRef = ref(storage, imagenUrl);
          try {
            await deleteObject(imageRef);
          } catch (storageError) {
            console.warn("No se pudo eliminar la imagen:", storageError);
          }
        }

        await deleteDoc(doc(db, 'piedras', id));
        setPiedras(piedras.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error:", err);
        setError("Error al eliminar");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      propiedad: '',
      signos: '',
      descripcionCosmica: '',
      imagen: null
    });
    setPreviewImage('');
    setEditingId(null);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="success-container">
        <h2>¡Piedra {editingId ? 'actualizada' : 'agregada'} correctamente!</h2>
        <div className="success-actions">
          <button onClick={() => navigate('/admin')} className="btn primary">
            Volver al panel
          </button>
          <button onClick={resetForm} className="btn secondary">
            {editingId ? 'Editar otra' : 'Agregar otra'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-piedras-container">
      <h1>Administrar Piedras</h1>
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading">Cargando...</div>}

      <form onSubmit={handleSubmit} className="piedra-form">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Propiedades:</label>
          <input
            type="text"
            name="propiedad"
            value={formData.propiedad}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Signos:</label>
          <input
            type="text"
            name="signos"
            value={formData.signos}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripcionCosmica"
            value={formData.descripcionCosmica}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
  <label>Cargar Imagen::</label>
  
  {/* Contenedor personalizado */}
  <div className="custom-file-upload">
    {/* Input real (oculto) */}
    <input 
      type="file" 
      id="file-upload"
      accept="image/*"
      onChange={handleImageChange}
      required={!editingId}
    />
    
    {/* Nuestro diseño personalizado */}
    <label htmlFor="file-upload" className="custom-file-button icon-only">
  <svg viewBox="0 0 24 24">
    <path d="M11 15h2v-3h3v-2h-3V7h-2v3H8v2h3zM5 21h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2z"/>
  </svg>
</label>
    
    {/* Nombre del archivo seleccionado */}
    {formData.imagen && (
      <div className="file-name">
        {typeof formData.imagen === 'string' 
          ? 'Imagen actual' 
          : formData.imagen.name}
      </div>
    )}
  </div>
  
  {/* Preview de la imagen */}
  {previewImage && (
    <div className="image-preview-container">
      <img 
        src={previewImage} 
        alt="Preview" 
        className="image-preview"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
        }}
      />
    </div>
  )}
</div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="piedras-list">
        <h2>Lista de Piedras</h2>
        {piedras.length === 0 ? (
          <p>No hay piedras registradas</p>
        ) : (
          <div className="piedras-grid">
            {piedras.map(piedra => (
              <div key={piedra.id} className="piedra-card">
                <div className="piedra-image-container">
                  <img 
                    src={piedra.imagen} 
                    alt={piedra.nombre} 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible';
                    }}
                  />
                </div>
                <div className="piedra-info">
                  <h3>{piedra.nombre}</h3>
                  <p><strong>Propiedad:</strong> {piedra.propiedad}</p>
                </div>
                <div className="piedra-actions">
                  <button onClick={() => handleEdit(piedra)} className="edit-btn">
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(piedra.id, piedra.imagen)} 
                    className="delete-btn"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPiedras;