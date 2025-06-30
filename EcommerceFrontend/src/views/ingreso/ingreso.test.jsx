import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import IngresoProducto from './ingreso';
import { CategoryContext } from '../../contexts/CategoryContext';
import axiosInstance from '../../utils/axios';

jest.mock('../../utils/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const renderWithContext = (ui, { categories = [] } = {}) => {
  return render(
    <CategoryContext.Provider value={{ categories }}>
      {ui}
    </CategoryContext.Provider>
  );
};

const mockCategories = [
  { id: 1, nombre_categoria: 'Tecnología' },
  { id: 2, nombre_categoria: 'Ropa' },
];

describe('IngresoProducto Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  //prueba1: Renderiza los inputs de nombre y descripción en el paso 1
  it('renderiza inputs de nombre y descripción en el paso 1', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    expect(screen.getByPlaceholderText('Ingresa el nombre del producto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa la descripción del producto')).toBeInTheDocument();
  });

  //prueba2: Avanza al paso 2 al hacer clic en "Continuar"
  it('avanza al paso 2 al hacer clic en "Continuar"', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    expect(screen.getByPlaceholderText('Ingresa el precio de venta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa la cantidad disponible')).toBeInTheDocument();
  });

  //prueba3: Vuelve al paso 1 al hacer clic en "Volver"
  it('vuelve al paso 1 al hacer clic en "Volver"', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Volver/i }));
    expect(screen.getByPlaceholderText('Ingresa el nombre del producto')).toBeInTheDocument();
  });

  //prueba4: No permite avanzar más allá del paso 3
  it('no permite avanzar más allá del paso 3', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled();
  });

  //prueba5: No permite retroceder más allá del paso 1
  it('no permite retroceder más allá del paso 1', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    expect(screen.getByRole('button', { name: /Volver/i })).toBeDisabled();
  });
});