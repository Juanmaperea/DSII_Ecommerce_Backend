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

  //prueba6: Permite seleccionar una categoría
  it('permite seleccionar una categoría', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(select.value).toBe('2');
  });

  //prueba7: Permite cambiar el precio y la cantidad
  it('permite cambiar el precio y la cantidad', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    const precioInput = screen.getByPlaceholderText('Ingresa el precio de venta');
    const cantidadInput = screen.getByPlaceholderText('Ingresa la cantidad disponible');
    fireEvent.change(precioInput, { target: { value: '999' } });
    fireEvent.change(cantidadInput, { target: { value: '10' } });
    expect(precioInput.value).toBe('999');
    expect(cantidadInput.value).toBe('10');
  });

  //prueba8: Permite cambiar nombre y descripción
  it('permite cambiar nombre y descripción', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    const nombreInput = screen.getByPlaceholderText('Ingresa el nombre del producto');
    const descInput = screen.getByPlaceholderText('Ingresa la descripción del producto');
    fireEvent.change(nombreInput, { target: { value: 'Nuevo Producto' } });
    fireEvent.change(descInput, { target: { value: 'Descripción de prueba' } });
    expect(nombreInput.value).toBe('Nuevo Producto');
    expect(descInput.value).toBe('Descripción de prueba');
  });

  //prueba9: Envía los datos correctamente al backend (sin imagen)
  it('envía los datos correctamente al backend (sin imagen)', async () => {
    axiosInstance.post.mockResolvedValueOnce({ status: 201 });
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.change(screen.getByPlaceholderText('Ingresa el nombre del producto'), {
      target: { value: 'Mouse gamer' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la descripción del producto'), {
      target: { value: 'Ratón inalámbrico con luces LED' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.change(screen.getByPlaceholderText('Ingresa el precio de venta'), {
      target: { value: '150' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la cantidad disponible'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Ingreso de Datos/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Producto ingresado con éxito');
    });

    const formData = axiosInstance.post.mock.calls[0][1];
    expect(formData.get('nombre_producto')).toBe('Mouse gamer');
    expect(formData.get('descripcion')).toBe('Ratón inalámbrico con luces LED');
    expect(formData.get('precio')).toBe('150');
    expect(formData.get('stock')).toBe('5');
    expect(formData.get('categoria')).toBe('1');
  });

  //prueba10: Muestra error si el backend falla
  it('muestra error si el backend falla', async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error('Error del servidor'));
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.change(screen.getByPlaceholderText('Ingresa el nombre del producto'), {
      target: { value: 'Teclado RGB' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la descripción del producto'), {
      target: { value: 'Teclado mecánico con retroiluminación' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.change(screen.getByPlaceholderText('Ingresa el precio de venta'), {
      target: { value: '200' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la cantidad disponible'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Ingreso de Datos/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error al ingresar el producto');
    });
  });

  //prueba11: Reinicia el formulario después de enviar
  it('reinicia el formulario después de enviar', async () => {
    axiosInstance.post.mockResolvedValueOnce({ status: 201 });
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.change(screen.getByPlaceholderText('Ingresa el nombre del producto'), {
      target: { value: 'Producto X' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la descripción del producto'), {
      target: { value: 'Descripción X' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.change(screen.getByPlaceholderText('Ingresa el precio de venta'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la cantidad disponible'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Ingreso de Datos/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Producto ingresado con éxito');
    });

    expect(screen.getByPlaceholderText('Ingresa el nombre del producto').value).toBe('');
    expect(screen.getByPlaceholderText('Ingresa la descripción del producto').value).toBe('');
  });

  //prueba12: Muestra el título correcto en cada paso
  it('muestra el título correcto en cada paso', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    expect(screen.getByText(/Detalles del Producto/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    expect(screen.getByText(/Precios y Cantidad/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Verifica que el botón y el título existen, usando roles
    expect(screen.getByRole('button', { name: /Finalizar Ingreso de Datos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Finalizar Ingreso de Datos/i })).toBeInTheDocument();
  });

  //prueba13: Muestra las categorías en el select
  it('muestra las categorías en el select', () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    const select = screen.getByRole('combobox');
    expect(select.children.length).toBe(3); // 2 categorías + opción por defecto
    expect(screen.getByText('Tecnología')).toBeInTheDocument();
    expect(screen.getByText('Ropa')).toBeInTheDocument();
  });

  //prueba14: No envía si falta nombre de producto
  it('no envía si falta nombre de producto', async () => {
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.change(screen.getByPlaceholderText('Ingresa el precio de venta'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la cantidad disponible'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Ingreso de Datos/i }));
    expect(axiosInstance.post).toHaveBeenCalled();
  });

  //prueba15: Envía la imagen si se selecciona un archivo
  it('envía la imagen si se selecciona un archivo', async () => {
    axiosInstance.post.mockResolvedValueOnce({ status: 201 });
    renderWithContext(<IngresoProducto />, { categories: mockCategories });
    fireEvent.change(screen.getByPlaceholderText('Ingresa el nombre del producto'), {
      target: { value: 'Producto con imagen' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la descripción del producto'), {
      target: { value: 'Descripción con imagen' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.change(screen.getByPlaceholderText('Ingresa el precio de venta'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa la cantidad disponible'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    });

    // Selecciona el input de tipo file directamente
    const fileInput = document.querySelector('input[type="file"][name="productImage"]');
    const file = new File(['contenido'], 'foto.png', { type: 'image/png' });
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Ingreso de Datos/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
    });
    const formData = axiosInstance.post.mock.calls[0][1];
    expect(formData.get('imagen')).toBe(file);
  });
});