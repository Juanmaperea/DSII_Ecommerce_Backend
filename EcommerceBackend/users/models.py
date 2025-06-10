from django.contrib.auth.models import AbstractUser
from django.db import models

class Rol(models.Model):
    nombre = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    cedula = models.CharField(max_length=10, unique=True)
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return f"{self.username} - {self.rol.nombre}"

class MetodoPago(models.Model):
    tipo_pago = models.CharField(max_length=50)

    def __str__(self):
        return self.tipo_pago


