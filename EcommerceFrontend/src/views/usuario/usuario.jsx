import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './usuario.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [personalInfo, setPersonalInfo] = useState({ name: '', email: '' });
  const [cards, setCards] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get('/users/comprador/')
      .then((response) => {
        const { user } = response.data;
        setPersonalInfo({
          name: user.username,
          email: user.email
        });
      })
      .catch((error) => {
        console.error('Error al obtener los datos del perfil:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const addCard = () => {
    setCards([...cards, { id: cards.length + 1, number: '' }]);
  };

  const handleCardChange = (index, value) => {
    const newCards = [...cards];
    newCards[index].number = value;
    setCards(newCards);
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const redirectToResetPassword = () => {
    navigate('/auth/reset-password-1');
  };

  const renderSectionButton = (icon, label, section) => (
    <button
      className="section-toggle-button"
      onClick={() => toggleSection(section)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSection(section)}
      role="button"
      tabIndex="0"
      type="button"
    >
      <span className="icon-text">
        <FontAwesomeIcon icon={icon} className="icon" />
        {label}
      </span>
      <span className={`arrow ${openSection === section ? 'up' : 'down'}`}>&#9662;</span>
    </button>
  );

  return (
    <div className="user-profile">
      <h1>Perfil de Usuario</h1>

      <div className="section">
        {renderSectionButton(faUser, 'Perfil', 'profile')}
        {openSection === 'profile' && (
          <>
            <form>
              <div className="mb-3">
                <label>
                  Nombre:
                  <input
                    type="text"
                    name="name"
                    value={personalInfo.name}
                    onChange={handleInputChange}
                    readOnly
                    className="form-control"
                  />
                </label>
              </div>
              <div className="mb-3">
                <label>
                  Correo Electrónico:
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handleInputChange}
                    readOnly
                    className="form-control"
                  />
                </label>
              </div>
            </form>
            <p>Aquí se mostrarán los datos de tu cuenta.</p>
          </>
        )}
      </div>

      <div className="section">
        {renderSectionButton(faLock, 'Seguridad', 'security')}
        {openSection === 'security' && (
          <>
            <p>Tienes configuraciones pendientes.</p>
            <button className="btn btn-primary" onClick={redirectToResetPassword}>
              Restablecer Contraseña
            </button>
          </>
        )}
      </div>

      <div className="section">
        {renderSectionButton(faCreditCard, 'Tarjetas', 'cards')}
        {openSection === 'cards' && (
          <>
            {cards.map((card, index) => (
              <div key={card.id} className="mb-3">
                <label>
                  Número de tarjeta:
                  <input
                    type="text"
                    value={card.number}
                    onChange={(e) => handleCardChange(index, e.target.value)}
                    className="form-control"
                  />
                </label>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addCard}>
              Agregar tarjeta
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
