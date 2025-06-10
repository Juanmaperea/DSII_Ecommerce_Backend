import pytest
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.test import TestCase
from users.models import Rol, Usuario, MetodoPago


@pytest.mark.django_db
class TestRolModel:
    """
    Test suite para el modelo Rol
    """
    
    def test_crear_rol_exitoso(self):
        """Test para crear un rol básico exitosamente"""
        rol = Rol.objects.create(
            nombre="Administrador",
            descripcion="Usuario con permisos administrativos completos"
        )
        
        assert rol.id is not None
        assert rol.nombre == "Administrador"
        assert rol.descripcion == "Usuario con permisos administrativos completos"
        assert str(rol) == "Administrador"

    def test_metodopago_str(self):
        metodo = MetodoPago.objects.create(tipo_pago="Tarjeta de Crédito")
        assert str(metodo) == "Tarjeta de Crédito" 

    def test_usuario_str_includes_username_and_rol(self):
        rol = Rol.objects.create(nombre="Cliente", descripcion="Usuario comprador")
        user = User.objects.create_user(
            username="juanpablo",
            password="pass1234",
            cedula="1234567890",
            direccion="Calle Falsa 123",
            telefono="3001234567",
            rol=rol
        )
        expected = f"{user.username} - {rol.nombre}"
        assert str(user) == expected
        