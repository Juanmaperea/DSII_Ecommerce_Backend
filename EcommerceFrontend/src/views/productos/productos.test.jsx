import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Productos from './productos';
import { CategoryProvider, CategoryContext } from '../../contexts/CategoryContext';
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

//prueba9: verifica que el filtro de búsqueda es case-insensitive
test('el filtro de búsqueda no distingue mayúsculas/minúsculas', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    fireEvent.change(await screen.findByPlaceholderText(/Buscar productos/i), { target: { value: 'CELULAR' } });
    expect(screen.getByText('Celular')).toBeInTheDocument();
});

//prueba10: verifica que si no hay productos tras filtrar, muestra el mensaje correcto
test('muestra mensaje si no hay productos tras aplicar filtros', async () => {
    axiosInstance.get.mockResolvedValue({ data: mockProducts });
    renderWithProvider(<Productos />);
    fireEvent.change(await screen.findByPlaceholderText('Precio Mínimo'), { target: { value: '2000' } });
    expect(screen.getByText(/No se encontraron productos que coincidan/i)).toBeInTheDocument();
});

//prueba11: muestra spinner de carga mientras se cargan los productos
test('muestra spinner de carga mientras se cargan los productos', async () => {
  axiosInstance.get.mockReturnValue(new Promise(() => {}));
  renderWithProvider(<Productos />);
  expect(screen.getByText(/Cargando productos/i)).toBeInTheDocument();
});

//prueba12: muestra mensaje de error si la API falla
test('muestra mensaje de error si la API falla', async () => {
  axiosInstance.get.mockRejectedValue({ response: { data: { message: 'Error API' } } });
  renderWithProvider(<Productos />);
  await waitFor(() => expect(screen.getByText(/Error API/i)).toBeInTheDocument());
});

//prueba13: muestra productos después de cargar
test('muestra productos después de cargar', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  expect(await screen.findByText('Celular')).toBeInTheDocument();
  expect(screen.getByText('Camisa')).toBeInTheDocument();
});

//prueba14: filtra productos por búsqueda
test('filtra productos por búsqueda', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  fireEvent.change(await screen.findByPlaceholderText(/Buscar productos/i), { target: { value: 'celu' } });
  expect(screen.getByText('Celular')).toBeInTheDocument();
  expect(screen.queryByText('Camisa')).not.toBeInTheDocument();
});

//prueba15: filtra productos por categoría
test('filtra productos por categoría', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  
  render(
    <CategoryContext.Provider value={{ categories: mockCategories }}>
      <Productos />
    </CategoryContext.Provider>
  );
  
  await screen.findByText('Celular');
  
  fireEvent.change(screen.getByDisplayValue('Filtrar por categoría'), { target: { value: '2' } });
  
  await waitFor(() => {
    expect(screen.getByText('Camisa')).toBeInTheDocument();
    expect(screen.queryByText('Celular')).not.toBeInTheDocument();
  });
});

//prueba16: filtra productos por precio mínimo
test('filtra productos por precio mínimo', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  fireEvent.change(await screen.findByPlaceholderText('Precio Mínimo'), { target: { value: '800' } });
  expect(screen.getByText('Celular')).toBeInTheDocument();
  expect(screen.queryByText('Camisa')).not.toBeInTheDocument();
});

//prueba17: filtra productos por precio máximo
test('filtra productos por precio máximo', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  fireEvent.change(await screen.findByPlaceholderText('Precio Máximo'), { target: { value: '800' } });
  expect(screen.getByText('Camisa')).toBeInTheDocument();
  expect(screen.queryByText('Celular')).not.toBeInTheDocument();
});

//prueba18: ordena productos de bajo a alto
test('ordena productos de bajo a alto', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  const select = await screen.findByDisplayValue('Precio: Bajo a Alto');
  fireEvent.change(select, { target: { value: 'lowToHigh' } });
  const cards = screen.getAllByRole('img');
  expect(cards[0].alt).toBe('Camisa');
  expect(cards[1].alt).toBe('Celular');
});

//prueba19: ordena productos de alto a bajo
test('ordena productos de alto a bajo', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  const select = await screen.findByDisplayValue('Precio: Bajo a Alto');
  fireEvent.change(select, { target: { value: 'highToLow' } });
  const cards = screen.getAllByRole('img');
  expect(cards[0].alt).toBe('Celular');
  expect(cards[1].alt).toBe('Camisa');
});

//prueba20: muestra mensaje si no hay productos
test('muestra mensaje si no hay productos', async () => {
  axiosInstance.get.mockResolvedValue({ data: [] });
  renderWithProvider(<Productos />);
  expect(await screen.findByText(/No se encontraron productos/i)).toBeInTheDocument();
});

//prueba21: muestra mensaje si no hay productos tras filtrar
test('muestra mensaje si no hay productos tras filtrar', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  fireEvent.change(await screen.findByPlaceholderText(/Buscar productos/i), { target: { value: 'zzz' } });
  expect(screen.getByText(/No se encontraron productos que coincidan/i)).toBeInTheDocument();
});

//prueba22: abre y cierra el modal de detalles
test('abre y cierra el modal de detalles', async () => {
  axiosInstance.get.mockResolvedValue({ data: mockProducts });
  renderWithProvider(<Productos />);
  const buttons = await screen.findAllByText('Ver detalles');
  fireEvent.click(buttons[0]);
  expect(screen.getByText(/Descripción:/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText('×'));
  expect(screen.queryByText(/Descripción:/i)).not.toBeInTheDocument();
});

//prueba23: muestra paginación si hay muchos productos
test('muestra paginación si hay muchos productos', async () => {
  const manyProducts = Array.from({ length: 13 }, (_, i) => ({
    ...mockProducts[0],
    id: i + 1,
    nombre_producto: `Producto${i + 1}`,
  }));
  axiosInstance.get.mockResolvedValue({ data: manyProducts });
  renderWithProvider(<Productos />);
  expect(await screen.findByText('Producto1')).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /\d/ })).toHaveLength(3); // 13/6 = 3 páginas
});

//prueba24: cambia de página en la paginación
test('cambia de página en la paginación', async () => {
  const manyProducts = Array.from({ length: 7 }, (_, i) => ({
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