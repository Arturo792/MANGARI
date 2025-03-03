import React from 'react';
import '../styles/Nosotros.css'; 

const Nosotros = () => {
  return (
    <div className="nosotros-container">
      {/* Sección Hero */}
      <div className="hero-section">
        <h1>Conócenos</h1>
        <p>
          En MANGARI, nos dedicamos a crear piezas únicas que combinan la belleza de la naturaleza con el diseño moderno.
        </p>
      </div>

      {/* Sección de Historia */}
      <div className="historia-section">
        <div className="historia-content">
          <h2>Nuestra Historia</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel justo nec nisi tincidunt tincidunt.
            Vivamus lacinia, nisi eget aliquet tincidunt, nisl nisi aliquet nisi, nec tincidunt nisl nisi nec nisi.
          </p>
          <p>
            Integer nec turpis eget nisi tincidunt tincidunt. Nulla vel justo nec nisi tincidunt tincidunt. Vivamus
            lacinia, nisi eget aliquet tincidunt, nisl nisi aliquet nisi, nec tincidunt nisl nisi nec nisi.
          </p>
        </div>
        <div className="historia-imagen">
          <img
            src="https://via.placeholder.com/400x300" // Reemplaza con una imagen real
            alt="Nuestra Historia"
          />
        </div>
      </div>

      {/* Sección de Misión y Visión */}
      <div className="mision-vision-section">
        <div className="mision">
          <h2>Misión</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel justo nec nisi tincidunt tincidunt.
            Vivamus lacinia, nisi eget aliquet tincidunt, nisl nisi aliquet nisi, nec tincidunt nisl nisi nec nisi.
          </p>
        </div>
        <div className="vision">
          <h2>Visión</h2>
          <p>
            Integer nec turpis eget nisi tincidunt tincidunt. Nulla vel justo nec nisi tincidunt tincidunt. Vivamus
            lacinia, nisi eget aliquet tincidunt, nisl nisi aliquet nisi, nec tincidunt nisl nisi nec nisi.
          </p>
        </div>
      </div>

      {/* Sección de Valores */}
      <div className="valores-section">
        <h2>Nuestros Valores</h2>
        <div className="valores-grid">
          <div className="valor-card">
            <h3>Calidad</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel justo nec nisi tincidunt tincidunt.
            </p>
          </div>
          <div className="valor-card">
            <h3>Sostenibilidad</h3>
            <p>
              Integer nec turpis eget nisi tincidunt tincidunt. Nulla vel justo nec nisi tincidunt tincidunt.
            </p>
          </div>
          <div className="valor-card">
            <h3>Innovación</h3>
            <p>
              Vivamus lacinia, nisi eget aliquet tincidunt, nisl nisi aliquet nisi, nec tincidunt nisl nisi nec nisi.
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Equipo */}
      <div className="equipo-section">
        <h2>Nuestro Equipo</h2>
        <div className="equipo-grid">
          <div className="miembro-equipo">
            <img
              src="https://via.placeholder.com/150" // Reemplaza con una imagen real
              alt="Miembro del Equipo"
            />
            <h3>Nombre del Miembro</h3>
            <p>Cargo</p>
          </div>
          <div className="miembro-equipo">
            <img
              src="https://via.placeholder.com/150" // Reemplaza con una imagen real
              alt="Miembro del Equipo"
            />
            <h3>Nombre del Miembro</h3>
            <p>Cargo</p>
          </div>
          <div className="miembro-equipo">
            <img
              src="https://via.placeholder.com/150" // Reemplaza con una imagen real
              alt="Miembro del Equipo"
            />
            <h3>Nombre del Miembro</h3>
            <p>Cargo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;