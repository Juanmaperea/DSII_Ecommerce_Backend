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

  // Grupo de tests: Funcionalidad de Login
  describe('Funcionalidad de Login', () => {
    it('permite iniciar sesión con credenciales válidas', async () => {
      // Simula una respuesta exitosa de login
      axiosInstance.post.mockResolvedValueOnce({
        status: 200,
        data: {
          tokens: {
            access: 'fake-access-token',
            refresh: 'fake-refresh-token'
          }
        }
      });

      renderWithRouter(<Login />);
      fillLoginForm();
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText(/Bienvenido, usuario_existente/i)).toBeInTheDocument();
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('users/login/', {
        username: 'usuario_existente',
        password: 'contraseña_correcta'
      });

      expect(localStorage.getItem('accessToken')).toBe('fake-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
      expect(mockNavigate).toHaveBeenCalledWith('/productos');
    });

    it('muestra error cuando el login falla', async () => {
      // Simula una respuesta de error
      axiosInstance.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Credenciales inválidas'
          }
        }
      });

      renderWithRouter(<Login />);
      fillLoginForm('usuario_malo', 'contraseña_mala');
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
      });

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('maneja errores sin mensaje específico', async () => {
      // Simula un error sin mensaje específico
      axiosInstance.post.mockRejectedValueOnce({
        response: null
      });

      renderWithRouter(<Login />);
      fillLoginForm();
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText('Error en la operación.')).toBeInTheDocument();
      });
    });
  });

// Grupo de tests: Funcionalidad de Registro
  describe('Funcionalidad de Registro', () => {
    it('permite registrar un nuevo usuario correctamente', async () => {
      // Simula una respuesta exitosa de registro
      axiosInstance.post.mockResolvedValueOnce({
        status: 201,
        data: {
          message: 'Usuario creado exitosamente'
        }
      });

      renderWithRouter(<Login />);
      fireEvent.click(screen.getByText('Sign up'));

      const username = 'testuser_new';
      fillRegisterForm(username);
      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

      await waitFor(() => {
        expect(screen.getByText(/Registro exitoso/i)).toBeInTheDocument();
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/users/signup/', {
        username: 'testuser_new',
        password1: 'password123',
        password2: 'password123',
        email: 'testuser_new@mail.com',
        first_name: 'Test',
        last_name: 'User',
        cedula: '123456789',
        direccion: 'Calle 123',
        telefono: '5551234567',
        rol: {
          nombre: 'Comprador'
        },
        groups: [2]
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Sign in');
      });
    });

    it('muestra error cuando el registro falla', async () => {
      // Simula una respuesta de error en el registro
      axiosInstance.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'El usuario ya existe'
          }
        }
      });

      renderWithRouter(<Login />);
      fireEvent.click(screen.getByText('Sign up'));

      fillRegisterForm('usuario_existente');
      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

      await waitFor(() => {
        expect(screen.getByText('El usuario ya existe')).toBeInTheDocument();
      });
    });
  });


  // Grupo de tests: Validación de formularios
  describe('Validación de formularios', () => {
    it('permite llenar todos los campos del registro', () => {
      renderWithRouter(<Login />);
      fireEvent.click(screen.getByText('Sign up'));

      fillRegisterForm('testuser');

      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('testuser@mail.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Calle 123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('User')).toBeInTheDocument();
    });

    it('limpia el mensaje cuando cambia entre formularios', async () => {
      renderWithRouter(<Login />);
      axiosInstance.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Error de prueba' }
        }
      });

      fillLoginForm();
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText('Error de prueba')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Sign up'));
      await waitFor(() => {
        expect(screen.queryByText('Error de prueba')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Sign up');
    });
  });

});



