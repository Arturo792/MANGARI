import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/editProfile.css'; // Estilos para el formulario

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para guardar los datos en Firebase o en el estado global
    console.log('Datos del perfil:', formData);
    alert('Perfil actualizado correctamente');
    navigate('/home'); // Redirige al usuario a la página principal
  };

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="input-group">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label htmlFor="name">Nombre</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <label htmlFor="address">Dirección</label>
        </div>

        <div className="input-group">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <label htmlFor="phone">Teléfono</label>
        </div>

        <button type="submit" className="submit-button" style={{ backgroundColor: '#BEAEA0', color: '#212121' }}>
          GUARDAR CAMBIOS
        </button>
      </form>
    </div>
  );
};

export default EditProfile;