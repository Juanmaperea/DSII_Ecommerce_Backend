
import axiosInstance  from './utils/axios';

const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/app/dashboard/analytics',
          roles: [1] // Solo Administrador
        },
        {
          id: 'carrito',
          title: 'Carrito',
          type: 'item',
          icon: 'feather icon-shopping-cart',
          url: '/carrito',
          roles: [1, 2] // Administrador y Comprador
        },
        {
          id: 'usuario',
          title: 'Usuario',
          type: 'item',
          icon: 'feather icon-user',
          url: '/usuario',
          roles: [1] // Solo Administrador
        }
      ]
    },
    {
      id: 'auth',
      title: 'Authentication',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'login',
          title: 'Login',
          type: 'item',
          icon: 'feather icon-log-in',
          url: '/auth/login',
          target: true,
          breadcrumbs: false,
          roles: [1, 2] // Disponible para ambos
        },
        {
          id: 'reset-pass',
          title: 'Restablecer Contraseña',
          type: 'item',
          icon: 'feather icon-unlock',
          url: '/auth/reset-password-1',
          target: true,
          breadcrumbs: false,
          roles: [1, 2] // Disponible para ambos
        }
      ]
    }
  ]
};

/**
 * Obtiene los elementos del menú según el rol del usuario
 * @returns {Object} Elementos del menú filtrados
 */
export const getMenuItems = async () => {
  try {
    // Obtener la información del usuario desde el backend
    const response = await axiosInstance.get('/users/comprador/');
    console.log('Respuesta completa del backend:', response.data);

    // Acceder correctamente a is_staff
    const { is_staff } = response.data.user; // Extraer de user
    console.log('is_staff obtenido:', is_staff);

    // Determinar el rol basado en is_staff
    const userRole = is_staff ? 1 : 2; // 1 = Administrador, 2 = Comprador
    console.log('Rol del usuario:', userRole);

    // Filtrar los elementos del menú según el rol
    const filteredMenuItems = {
      ...menuItems,
      items: menuItems.items.map(group => ({
        ...group,
        children: group.children.filter(item => {
          const isAllowed = item.roles.includes(userRole);
          console.log(`Filtrando ${item.title}:`, { userRole, roles: item.roles, isAllowed });
          return isAllowed;
        })
      })).filter(group => group.children.length > 0) // Quitar grupos vacíos
    };

    console.log('Elementos de menú filtrados:', filteredMenuItems);
    return filteredMenuItems;
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error.response?.data || error.message);

    // En caso de error, devolver un menú vacío
    return {
      ...menuItems,
      items: []
    };
  }
};



export default menuItems;