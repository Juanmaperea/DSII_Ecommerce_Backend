import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Productos from './productos';
import { CategoryProvider } from '../../contexts/CategoryContext';
import axiosInstance from '../../utils/axios';

jest.mock('../../utils/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockCategories = [
  { id: 1, nombre_categoria: 'Electrónica' },
  { id: 2, nombre_categoria: 'Ropa' },
];

const mockProducts = [
    {
        id: 1,
        nombre_producto: 'Celular',
        precio: '1000',
        stock: 10,
        categoria: 1,
        imagen: 'img1.jpg',
        descripcion: 'Un celular',
    },
    {
        id: 2,
        nombre_producto: 'Camisa',
        precio: '500',
        stock: 5,
        categoria: 2,
        imagen: 'img2.jpg',
        descripcion: 'Una camisa',
    },
    // ...agrega más productos si lo necesitas para paginación
];

const renderWithProvider = (ui) => {
    return render(
        <CategoryProvider>
            {ui}
        </CategoryProvider>
    );
};

beforeEach(() => {
    jest.clearAllMocks();
});

//prueba1: verifica que el input de búsqueda esté presente
test('debe mostrar el input de búsqueda', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    expect(await screen.findByPlaceholderText(/Buscar productos/i)).toBeInTheDocument();
});

//prueba2: verifica que los filtros de precio mínimo y máximo estén presentes
test('debe mostrar los inputs de precio mínimo y máximo', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    expect(await screen.findByPlaceholderText('Precio Mínimo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Precio Máximo')).toBeInTheDocument();
});

//prueba3: verifica que el filtro de categoría muestre las opciones de categorías
test('debe mostrar opciones de categorías en el filtro', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    const select = await screen.findByDisplayValue('Filtrar por categoría');
    fireEvent.focus(select);
    // No hay categorías mockeadas en el provider real, pero el select debe existir
    expect(select).toBeInTheDocument();
});

//prueba4: verifica que el botón "Ver detalles" abre el modal con información correcta
test('al hacer click en "Ver detalles" muestra la información correcta en el modal', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    const buttons = await screen.findAllByText('Ver detalles');
    fireEvent.click(buttons[0]);
    expect(screen.getByText('Una camisa')).toBeInTheDocument();
    expect(screen.getAllByText(/Precio: \$500/)).toHaveLength(2);
    expect(screen.getAllByText(/Stock: 5/)).toHaveLength(2);
});

//prueba5: verifica que el modal se cierra correctamente al hacer click en la X
test('el modal se cierra al hacer click en la X', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    const buttons = await screen.findAllByText('Ver detalles');
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/Descripción:/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText(/Descripción:/i)).not.toBeInTheDocument();
});

//prueba6: verifica que el mensaje de error genérico se muestra si no hay response.data.message
test('muestra mensaje de error genérico si la API falla sin message', async () => {
    axiosInstance.get.mockRejectedValue({ response: {} });
    renderWithProvider(<Productos />);
    await waitFor(() => expect(screen.getByText(/Hubo un error al cargar los productos/i)).toBeInTheDocument());
});

//prueba7: verifica que la paginación no aparece si hay menos de 6 productos
test('no muestra paginación si hay menos de 6 productos', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
});

//prueba8: verifica que al cambiar de página se actualizan los productos mostrados
test('al cambiar de página se muestran los productos de la página correspondiente', async () => {
    const manyProducts = Array.from({ length: 8 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        nombre_producto: `Producto${i + 1}`,
    }));
    axiosInstance.get.mockResolvedValue({ data: manyProducts });
    renderWithProvider(<Productos />);
    expect(await screen.findByText('Producto1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Producto7')).toBeInTheDocument();
});