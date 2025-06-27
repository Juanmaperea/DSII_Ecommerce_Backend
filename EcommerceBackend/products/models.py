from django.db import models
from django.core.validators import MinValueValidator # <--- ¡Importación clave!
from decimal import Decimal
from django.conf import settings

class Categoria(models.Model):
    nombre_categoria = models.CharField(
        max_length=50,
        help_text="Nombre de la categoría del producto",
        unique=True
    )

    def __str__(self):
        return self.nombre_categoria

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

class Producto(models.Model):
    nombre_producto = models.CharField(
        max_length=100,
        help_text="Nombre del producto"
    )
    descripcion = models.TextField(
        help_text="Descripción detallada del producto"
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        help_text="Categoría a la que pertenece el producto"
    )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Precio del producto (máximo 10 dígitos, 2 decimales)",
        validators=[MinValueValidator(Decimal('0.00'), message="El precio no puede ser negativo.")] 
    )
    stock = models.IntegerField(
        help_text="Cantidad disponible en inventario",
        validators=[MinValueValidator(0, message="El stock no puede ser negativo.")]
    )
    ventas = models.IntegerField(
        default=0,
        help_text="Cantidad de veces que se ha vendido el producto"
    )
    # La forma correcta de referenciar un modelo de usuario personalizado
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        help_text="Usuario vendedor del producto"
    )
    imagen = models.BinaryField(
        null=True,
        blank=True,
        help_text="Imagen del producto en formato binario (opcional)"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.nombre_producto} - {self.categoria.nombre_categoria}"

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def clean(self):
        super().clean()
