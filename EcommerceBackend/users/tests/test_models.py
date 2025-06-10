import pytest
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.test import TestCase
from users.models import Rol, Usuario


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
        