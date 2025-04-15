import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Piedras.modules.css';

const Piedras = () => {
  const [piedras, setPiedras] = useState([]);
  const [selectedPiedra, setSelectedPiedra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPiedras = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'piedras'));
        const piedrasData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Corrige URLs de imágenes malformadas
          let imagenUrl = data.imagen || '';
          if (imagenUrl.includes('firebaesitorage')) {
            imagenUrl = imagenUrl.replace('firebaesitorage', 'firebasestorage');
          }
          
          return {
            id: doc.id,
            nombre: data.nombre || '',
            propiedad: data.propiedad || '',
            signos: data.signos || '',
            descripcionCosmica: data.descripcionCosmica || data.descriptonCosmicas || '',
            imagen: imagenUrl
          };
        });
        setPiedras(piedrasData);
      } catch (error) {
        console.error("Error cargando piedras:", error);
        setError("No se pudieron cargar las piedras. Por favor intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchPiedras();
    window.scrollTo(0, 0);
  }, []);

  const handleCardClick = (piedra) => {
    setSelectedPiedra(piedra);
    document.body.style.overflow = 'hidden'; // Deshabilita el scroll
  };

  const closeModal = () => {
    setSelectedPiedra(null);
    document.body.style.overflow = 'auto'; // Habilita el scroll nuevamente
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando catálogo de piedras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="reload-button" 
          onClick={() => window.location.reload()}
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="piedras-usuario-container">
      <div className="usuario-header">
        <h1>Catálogo de Piedras Energéticas</h1>
        <p className="header-subtitle">Descubre la magia y propiedades de cada piedra</p>
      </div>
      
      {piedras.length === 0 ? (
        <div className="no-piedras-container">
          <p className="no-piedras-message">Actualmente no tenemos piedras disponibles en nuestro catálogo</p>
          <p className="no-piedras-suggestion">Vuelve a intentarlo más tarde</p>
        </div>
      ) : (
        <div className="piedras-mosaico">
          {piedras.map((piedra) => (
            <div 
              key={piedra.id} 
              className="piedra-usuario-card"
              onClick={() => handleCardClick(piedra)}
            >
              <div className="piedra-usuario-imagen">
                <img 
                  src={piedra.imagen} 
                  alt={piedra.nombre}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
                  }}
                />
              </div>
              <div className="piedra-usuario-info">
                <h2 className="piedra-nombre">{piedra.nombre}</h2>
                <p className="piedra-propiedad">
                  <span className="propiedad-label">Propiedad:</span> 
                  {piedra.propiedad.length > 60 
                    ? `${piedra.propiedad.substring(0, 60)}...` 
                    : piedra.propiedad}
                </p>
                <div className="piedra-more-info">Ver detalles →</div>
              </div>
            </div>
          ))}
        </div>
      )}

{selectedPiedra && (
  <div className="usuario-modal-overlay" onClick={closeModal}>
    <div className="usuario-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="usuario-modal-close" onClick={closeModal}>×</button>
      
      <div className="usuario-modal-body">
        <div className="usuario-modal-imagen">
          <img 
            src={selectedPiedra.imagen} 
            alt={selectedPiedra.nombre}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible';
            }}
          />
        </div>
        
        <div className="usuario-modal-detalles">
          <h2 className="modal-piedra-nombre">{selectedPiedra.nombre}</h2>
          
          <div className="usuario-seccion">
            <h3 className="seccion-titulo">Propiedades Energéticas</h3>
            <p className="seccion-contenido">{selectedPiedra.propiedad}</p>
          </div>
          
          <div className="usuario-seccion">
            <h3 className="seccion-titulo">Signos Zodiacales Afines</h3>
            <p className="seccion-contenido">{selectedPiedra.signos}</p>
          </div>
          
          {selectedPiedra.descripcionCosmica && (
            <div className="usuario-seccion">
              <h3 className="seccion-titulo">Conexión Cósmica</h3>
              <p className="seccion-contenido">{selectedPiedra.descripcionCosmica}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Piedras;