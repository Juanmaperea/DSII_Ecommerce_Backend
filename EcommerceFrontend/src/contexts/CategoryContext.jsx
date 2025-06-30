import React, { createContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../utils/axios';

// Crear el contexto
export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  // Obtener las categorías
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/products/api/categorias/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  // Crear una nueva categoría
  const createCategory = async (categoryName) => {
    try {
      const response = await axiosInstance.post('/products/api/categorias/', {
        nombre_categoria: categoryName,
      });
      setCategories((prevCategories) => [...prevCategories, response.data]);
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    categories,
    createCategory
  }), [categories]);

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

// Validación de props
CategoryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};