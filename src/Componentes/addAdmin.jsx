import React, { useState } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore"; // Importa getDoc
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/addAdmin.css'; // Importa el CSS

const AddAdmin = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      const adminDoc = await getDoc(doc(db, "admins", user.email)); // Usa getDoc
      if (!adminDoc.exists()) {
        throw new Error("No tienes permisos para añadir administradores.");
      }

      // Añade el nuevo administrador a la colección "admins"
      const newAdminId = Date.now().toString();
      await setDoc(doc(db, "admins", newAdminId), {
        id: newAdminId,
        email: adminEmail,
      });

      alert("Administrador añadido correctamente.");
      navigate('/admin');
    } catch (error) {
      console.error("Error al añadir administrador:", error);
      setError(error.message || "Error al añadir administrador. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-admin-container">
      <h1>Añadir Administrador</h1>
      <form onSubmit={handleSubmit} className="add-admin-form">
        <div className="input-group">
          <label>Correo del Nuevo Administrador</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Añadiendo...' : 'Añadir Administrador'}
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;