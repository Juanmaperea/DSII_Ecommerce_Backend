import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
import random
import string
from products.models import Categoria, Producto
from users.models import Usuario

class ProductoAPITestCase(APITestCase):
    """
    Tests básicos para la API de Productos y Categorías.
    """
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()

        # 1. Crear un usuario de prueba (vendedor) con permisos adecuados
        # Generar una cédula única para el vendedor
        self.vendedor_cedula = ''.join(random.choices(string.digits, k=9))
        self.vendedor = Usuario.objects.create_user(
            username='testvendedor',
            email='vendedor@example.com',
            password='testpassword',
            cedula=self.vendedor_cedula
        )
        # Dar permisos completos para Producto y Categoria a este vendedor
        content_type_producto = ContentType.objects.get_for_model(Producto)
        content_type_categoria = ContentType.objects.get_for_model(Categoria)
        
        permissions_producto = Permission.objects.filter(content_type=content_type_producto)
        permissions_categoria = Permission.objects.filter(content_type=content_type_categoria)
        
        self.vendedor.user_permissions.set(list(permissions_producto) + list(permissions_categoria))
        
        # Autenticar al cliente con el usuario vendedor
        self.client.force_authenticate(user=self.vendedor)

        # 2. Crear una categoría de prueba
        self.categoria_test = Categoria.objects.create(
            nombre_categoria='Electrónica'
        )

        # 3. Crear un producto de prueba asociado a la categoría y el vendedor
        self.producto_test = Producto.objects.create(
            nombre_producto='Televisor OLED',
            descripcion='Televisor de alta definición con pantalla OLED.',
            categoria=self.categoria_test,
            precio=1200.00,
            stock=50,
            vendedor=self.vendedor
        )

        # URLs de la API (ajusta si tus URLs son diferentes)
        self.productos_url = reverse('producto-list')
        self.categorias_url = reverse('categoria-list')

    def test_list_productos(self):
        """Verifica que se pueden listar productos."""
        response = self.client.get(self.productos_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre_producto'], self.producto_test.nombre_producto)

    def test_create_producto(self):
        """Verifica que se puede crear un nuevo producto."""
        data = {
            'nombre_producto': 'Auriculares Bluetooth',
            'descripcion': 'Auriculares inalámbricos con cancelación de ruido.',
            'categoria': self.categoria_test.id,
            'precio': 150.00,
            'stock': 100,
            'vendedor': self.vendedor.id
        }
        # El parser_classes ahora acepta JSON, así que format='json' está bien
        response = self.client.post(self.productos_url, data, format='json') 
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Producto.objects.count(), 2) # Un producto existente + el nuevo
        self.assertEqual(response.data['nombre_producto'], 'Auriculares Bluetooth')
