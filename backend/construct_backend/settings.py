import os
from datetime import timedelta
from pathlib import Path

JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-secret-key')

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = JWT_SECRET_KEY
# BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY = 'replace-me-in-production'
# DEBUG = True
DEBUG = False

# ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS = ['103.235.71.9', '127.0.0.1','0.0.0.0','druvo.druvo.in','project.druvo.in',]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'projects',
]

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
CORS_ALLOW_HEADERS = [ '*' ] 
CORS_ALLOW_METHODSS = [ '*' ] 
# CORS_ALLOWED_ORIGINS = [
    
#     "http://druvo.druvo.in:8083","http://project.druvo.in:8083","http://localhost:3000","http://103.235.71.9:3000",
#     "http://project.druvo.in:3000","http://project.druvo.in",
 
# ]
CORS_ALLOWED_ORIGINS = [
    
    "https://project.druvo.in"
 
]
    
ROOT_URLCONF = 'construct_backend.urls'

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

WSGI_APPLICATION = 'construct_backend.wsgi.application'
ASGI_APPLICATION = 'construct_backend.asgi.application'

# ---- MySQL ----
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'conproject',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': 'localhost',
        'PORT': '3306',
        # 'OPTIONS': {
        #     'charset': 'utf8mb4',
        # }
    }
}

AUTH_USER_MODEL = 'projects.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}