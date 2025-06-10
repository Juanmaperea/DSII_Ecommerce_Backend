import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core import mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from users.models import Rol, Usuario
from users.tokens import account_activation_token

User = get_user_model()

@pytest.mark.django_db
class TestAPIViews:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        # Set email backend to in-memory
        mail.outbox = []

    def test_signup_and_activation_flow(self):
        url = reverse('signup_view')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'cedula': '111222333',
            'password1': 'strongpass123',
            'password2': 'strongpass123',
            'direccion': 'Av. Test 123',
            'telefono': '3001112222',
            'rol': {'nombre': 'Cliente'},
            'groups': []
        }
        response = self.client.post(url, data, format='json')
        assert response.status_code == 201
        assert User.objects.filter(username='testuser').exists()
        user = User.objects.get(username='testuser')
        assert not user.is_active
        # Check email sent
        assert len(mail.outbox) == 1
        # Activation link extraction
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activate_url = reverse('activate', args=[uidb64, token])
        # Call activation
        resp = self.client.get(activate_url)
        # Should redirect to frontend login
        assert resp.status_code in (301, 302)
        user.refresh_from_db()
        assert user.is_active

    def test_login_active_and_inactive(self):
        rol = Rol.objects.create(nombre='Cliente', descripcion='Desc')
        user = User.objects.create_user(
            username='loginuser',
            email='log@example.com',
            password='loginpass',
            cedula='999888777',
            direccion='Calle 1',
            telefono='3000001111',
            rol=rol,
            is_active=False
        )
        url = reverse('login_view')
        # attempt inactive
        resp = self.client.post(url, {'username': 'loginuser', 'password': 'loginpass'}, format='json')
        assert resp.status_code == 401
        # activate
        user.is_active = True
        user.save()
        resp2 = self.client.post(url, {'username': 'loginuser', 'password': 'loginpass'}, format='json')
        assert resp2.status_code == 200
        assert 'tokens' in resp2.data
