// Mock del componente Breadcrumb para evitar errores visuales
jest.mock('../../../layouts/AdminLayout/Breadcrumb', () => () => <div data-testid="breadcrumb" />);

// Mock del axiosInstance antes de importar el componente
jest.mock('../../../utils/axios', () => ({
  __esModule: true, // Indica que es un módulo ES6
  default: {
    post: jest.fn(), // Crea una función simulada para axios.post
  },
}));

// Mock de useNavigate de react-router-dom
const mockNavigate = jest.fn(); // Crea una función simulada para navegación
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Mantiene el resto de funcionalidades originales
  useNavigate: () => mockNavigate, // Reemplaza useNavigate por el mock
}));

// Importa React y utilidades de testing
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react'; // Utilidades para testear componentes
import { MemoryRouter } from 'react-router-dom'; // Router en memoria para pruebas
import Login from './Login'; // Importa el componente Login a testear
import axiosInstance from '../../../utils/axios'; // Importa el mock de axios

// Helper para renderizar el componente Login dentro de un router simulado
const renderWithRouter = (ui) => render(
  <MemoryRouter 
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    {ui}
  </MemoryRouter>
);

// Helper para llenar el formulario de login con datos de prueba
const fillLoginForm = (username = 'usuario_existente', password = 'contraseña_correcta') => {
  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: username },
  });
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: password },
  });
};

// Helper para llenar el formulario de registro con datos de prueba
const fillRegisterForm = (username = 'testuser') => {
  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: username },
  });
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: `${username}@mail.com` },
  });
  fireEvent.change(screen.getByPlaceholderText('Cédula'), {
    target: { value: '123456789' },
  });
  fireEvent.change(screen.getByPlaceholderText('Dirección'), {
    target: { value: 'Calle 123' },
  });
  fireEvent.change(screen.getByPlaceholderText('Teléfono'), {
    target: { value: '5551234567' },
  });
  fireEvent.change(screen.getByPlaceholderText('First Name'), {
    target: { value: 'Test' },
  });
  fireEvent.change(screen.getByPlaceholderText('Last Name'), {
    target: { value: 'User' },
  });
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'password123' },
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
    target: { value: 'password123' },
  });
};

// Inicia el bloque de tests para el componente Login
describe('Login Component', () => {
  // Antes de cada test, limpia los mocks y el localStorage
  beforeEach(() => {
    jest.clearAllMocks(); // Limpia todos los mocks de Jest
    localStorage.clear(); // Limpia el almacenamiento local simulado
    mockNavigate.mockClear(); // Limpia el mock de navegación
  });

  // Grupo de tests: Renderizado inicial
  describe('Renderizado inicial', () => {
    it('muestra el formulario de login por defecto', () => {
      renderWithRouter(<Login />);
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Sign in');
    });

    it('muestra el breadcrumb', () => {
      renderWithRouter(<Login />);
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });
  });

  // Grupo de tests: Cambio entre formularios
  describe('Cambio entre formularios', () => {
    it('permite cambiar al formulario de registro', () => {
      renderWithRouter(<Login />);
      fireEvent.click(screen.getByText('Sign up'));
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Cédula')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Sign up');
    });

    it('permite volver al formulario de login desde registro', () => {
      renderWithRouter(<Login />);
      fireEvent.click(screen.getByText('Sign up'));
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Sign up');
      fireEvent.click(screen.getByText('Sign in'));
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Sign in');
    });
  });
});