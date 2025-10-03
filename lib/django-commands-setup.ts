// Commandes Django pour créer la structure complète de SubChain

export const DJANGO_SETUP_COMMANDS = {
  // 1. Création du projet Django
  CREATE_PROJECT: `
# Créer le projet Django
django-admin startproject subchain_backend
cd subchain_backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\\Scripts\\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
`,

  // 2. Création des applications
  CREATE_APPS: `
# Créer toutes les applications Django
python manage.py startapp accounts
python manage.py startapp subscriptions  
python manage.py startapp payments
python manage.py startapp currency
python manage.py startapp webhooks
python manage.py startapp analytics
python manage.py startapp notifications
python manage.py startapp api_management
`,

  // 3. Configuration des settings
  SETTINGS_CONFIGURATION: `
# settings.py - Configuration complète

import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'celery',
    'django_celery_beat',
    'django_celery_results',
]

LOCAL_APPS = [
    'accounts',
    'subscriptions',
    'payments', 
    'currency',
    'webhooks',
    'analytics',
    'notifications',
    'api_management',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'subchain_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'subchain_backend.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'subchain_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Redis Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery Configuration
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'SubChain API',
    'DESCRIPTION': 'API for SubChain subscription management platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@subchain.com')

# Algorand Configuration
ALGORAND_NODE_URL = os.getenv('ALGORAND_NODE_URL', 'https://testnet-api.algonode.cloud')
ALGORAND_INDEXER_URL = os.getenv('ALGORAND_INDEXER_URL', 'https://testnet-idx.algonode.cloud')
ALGORAND_NETWORK = os.getenv('ALGORAND_NETWORK', 'testnet')

# Currency API Configuration
COINGECKO_API_KEY = os.getenv('COINGECKO_API_KEY')
EXCHANGERATE_API_KEY = os.getenv('EXCHANGERATE_API_KEY')

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'subchain.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'subchain': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
`,

  // 4. Requirements.txt
  REQUIREMENTS: `
# requirements.txt - Toutes les dépendances nécessaires

Django>=4.2.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.2.0
django-cors-headers>=4.0.0
django-filter>=23.0.0
drf-spectacular>=0.26.0

# Base de données
psycopg2-binary>=2.9.0
django-redis>=5.2.0

# Tâches asynchrones
celery>=5.3.0
django-celery-beat>=2.5.0
django-celery-results>=2.5.0
redis>=4.5.0

# Algorand SDK
py-algorand-sdk>=2.0.0

# Utilitaires
python-decouple>=3.8
Pillow>=10.0.0
requests>=2.31.0
python-dateutil>=2.8.0

# Développement
django-debug-toolbar>=4.0.0
pytest-django>=4.5.0
factory-boy>=3.3.0
coverage>=7.0.0

# Production
gunicorn>=21.0.0
whitenoise>=6.5.0
sentry-sdk>=1.32.0
`,

  // 5. Variables d'environnement
  ENV_VARIABLES: `
# .env - Variables d'environnement

# Django
DJANGO_SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données PostgreSQL
DB_NAME=subchain_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@subchain.com

# Algorand
ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
ALGORAND_NETWORK=testnet

# APIs externes
COINGECKO_API_KEY=your-coingecko-api-key
EXCHANGERATE_API_KEY=your-exchangerate-api-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
`,

  // 6. URLs principales
  MAIN_URLS: `
# subchain_backend/urls.py - URLs principales

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/plans/', include('subscriptions.urls')),
    path('api/subscribers/', include('subscriptions.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/currency/', include('currency.urls')),
    path('api/webhooks/', include('webhooks.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/api-keys/', include('api_management.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
`,

  // 7. Commandes de migration
  MIGRATION_COMMANDS: `
# Commandes pour créer et appliquer les migrations

# Créer les migrations pour toutes les apps
python manage.py makemigrations accounts
python manage.py makemigrations subscriptions
python manage.py makemigrations payments
python manage.py makemigrations currency
python manage.py makemigrations webhooks
python manage.py makemigrations analytics
python manage.py makemigrations notifications
python manage.py makemigrations api_management

# Appliquer toutes les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Charger des données de test (optionnel)
python manage.py loaddata fixtures/initial_data.json
`,

  // 8. Commandes Celery
  CELERY_COMMANDS: `
# Démarrer Celery Worker (dans un terminal séparé)
celery -A subchain_backend worker --loglevel=info

# Démarrer Celery Beat pour les tâches programmées (dans un autre terminal)
celery -A subchain_backend beat --loglevel=info

# Surveiller les tâches Celery
celery -A subchain_backend flower

# Purger toutes les tâches en attente
celery -A subchain_backend purge
`,

  // 9. Structure des dossiers
  FOLDER_STRUCTURE: `
subchain_backend/
├── manage.py
├── requirements.txt
├── .env
├── subchain_backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── celery.py
├── accounts/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── subscriptions/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── payments/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── currency/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── services.py
│   └── tasks.py
├── webhooks/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tasks.py
├── analytics/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── services.py
├── notifications/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tasks.py
├── api_management/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── middleware.py
├── static/
├── media/
├── fixtures/
└── logs/
`
}

// Fonction pour générer tous les fichiers de configuration
export function generateDjangoSetup(): string {
  return Object.entries(DJANGO_SETUP_COMMANDS)
    .map(([key, value]) => `## ${key.replace(/_/g, ' ')}\n\n${value}`)
    .join('\n\n---\n\n')
}

// Fonction pour valider la configuration
export function validateDjangoSetup(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Vérifier les variables d'environnement requises
  const requiredEnvVars = [
    'DJANGO_SECRET_KEY',
    'DB_NAME',
    'DB_USER', 
    'DB_PASSWORD',
    'REDIS_URL'
  ]
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Variable d'environnement manquante: ${envVar}`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}
