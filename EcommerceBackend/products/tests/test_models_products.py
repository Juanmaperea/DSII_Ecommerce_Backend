from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from decimal import Decimal
from users.models import Usuario
from products.models import Categoria, Producto



class CategoriaModelTest(TestCase):
    """Tests para el modelo Categoria"""
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.categoria = Categoria.objects.create(
            nombre_categoria="Electrónicos"
        )
    
    def test_categoria_creation(self):
        """Test de creación básica de categoría"""
        self.assertTrue(isinstance(self.categoria, Categoria))
        self.assertEqual(self.categoria.nombre_categoria, "Electrónicos")
    
    def test_categoria_str_method(self):
        """Test del método __str__ de Categoria"""
        self.assertEqual(str(self.categoria), "Electrónicos")
    
