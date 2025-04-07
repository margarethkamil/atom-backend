📄 También disponible en: [Español](README_es.md)

# Atom Backend

API Backend para la Aplicación de Gestión de Tareas Atom, construida con Firebase Cloud Functions y Express.js.

## Características

- API RESTful construida con Express.js y TypeScript
- Desplegada como Firebase Cloud Functions (v2)
- Firebase Firestore para almacenamiento de datos
- Múltiples métodos de autenticación:
  - Autenticación basada en JWT
  - Integración con Google OAuth
- Validación de API Key para comunicación segura cliente-servidor
- Protección CORS con orígenes permitidos
- Middleware de manejo de errores
- Registro estructurado
- Principios SOLID y Arquitectura Limpia

## Endpoints de la API

| Método | Endpoint               | Descripción                          | Autenticación |
|--------|------------------------|--------------------------------------|---------------|
| POST   | /api/auth/login        | Iniciar sesión con email             | Pública       |
| POST   | /api/auth/register     | Registrar nuevo usuario              | Pública       |
| POST   | /api/auth/google       | Autenticar con token ID de Google    | Pública       |
| GET    | /api/auth/google/init  | Iniciar OAuth de Google (servidor)   | Pública       |
| GET    | /api/auth/google/callback | Manejar callback de OAuth de Google | Pública     |
| GET    | /api/tasks             | Obtener todas las tareas             | Requerida     |
| POST   | /api/tasks             | Crear una nueva tarea                | Requerida     |
| GET    | /api/tasks/:id         | Obtener una tarea específica         | Requerida     |
| PUT    | /api/tasks/:id         | Actualizar una tarea                 | Requerida     |
| DELETE | /api/tasks/:id         | Eliminar una tarea                   | Requerida     |
| GET    | /health                | Verificación de salud del servicio   | Pública       |

## Estructura del Proyecto

```
├── src/
│   ├── controllers/      # Manejadores de peticiones (auth, task)
│   ├── services/         # Lógica de negocio y acceso a datos
│   ├── models/           # Modelos de datos (user, task)
│   ├── routes/           # Definición de rutas API
│   ├── middlewares/      # Middleware (error, auth, validation, apikey)
│   ├── config/           # Archivos de configuración (Firebase)
│   │   └── credentials/  # Credenciales Firebase (ignoradas por git)
│   ├── utils/            # Funciones utilitarias
│   └── server.ts         # Punto de entrada de la aplicación
├── functions/            # Configuración de Firebase Cloud Functions
│   ├── index.js          # Punto de entrada para Cloud Functions
│   └── package.json      # Dependencias específicas para Functions
├── dist/                 # Salida compilada de TypeScript
├── public/               # Archivos estáticos
├── .env.example          # Plantilla de variables de entorno
├── firebase.json         # Configuración de Firebase
├── firestore.rules       # Reglas de seguridad de Firestore
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración de TypeScript
```

## Arquitectura

La aplicación sigue una arquitectura limpia y por capas:

- **Controllers**: Manejan las peticiones y respuestas HTTP
- **Services**: Implementan la lógica de negocio e interactúan con la capa de datos
- **Models**: Definen estructuras de datos
- **Middlewares**: Procesan las peticiones antes de que lleguen a los manejadores de rutas
- **Routes**: Definen los endpoints API y sus manejadores
- **Utils**: Proporcionan funciones auxiliares en toda la aplicación

## Despliegue en Cloud Functions

El backend está desplegado como una Firebase Cloud Function (v2) con la siguiente configuración:

- **Nombre de la Función**: atom
- **Región**: us-central1
- **Runtime**: Node.js 20
- **Memoria**: Predeterminada (256MB)
- **Timeout**: Predeterminado (60s)
- **Punto de Entrada**: Aplicación Express.js

La configuración incluye un middleware que maneja automáticamente el prefijo de URL `/atom`, permitiendo que funcionen perfectamente tanto el acceso directo a la URL de la API como el formato de URL de Cloud Functions.

## Sistema de Autenticación

### Autenticación por Email
Los usuarios pueden registrarse e iniciar sesión con su dirección de email. El sistema genera tokens JWT para la gestión de sesiones.

### Autenticación con Google
Se admiten dos métodos de autenticación de Google:

1. **Flujo del lado del cliente**: El frontend obtiene un token ID de Google y lo envía a `/api/auth/google` para verificación
2. **Flujo del lado del servidor**: El backend inicia el flujo OAuth a través de `/api/auth/google/init` y maneja la respuesta

### Seguridad de API Key
El sistema implementa validación de API key con dos modos:

1. **Auto-inyección**: Los orígenes confiables (URLs del frontend) reciben automáticamente API keys
2. **Validación manual**: Las peticiones externas (como Postman) deben proporcionar API keys válidas en los encabezados

## Primeros Pasos

### Requisitos Previos

- Node.js (v20 o posterior recomendado)
- npm o yarn
- Proyecto Firebase con Firestore

### Instalación

1. Clonar el repositorio:
```bash
git clone <url-repositorio>
cd atom-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configurar Firebase:
   - Crear un proyecto Firebase en la [Consola Firebase](https://console.firebase.google.com/)
   - Configurar base de datos Firestore en tu proyecto
   - Habilitar Autenticación con Google en la sección de Authentication
   - Ir a Project Settings > Service Accounts > Generate New Private Key
   - Crear el directorio de credenciales y guardar el archivo JSON:
   ```bash
   mkdir -p src/config/credentials
   # Mover el archivo JSON descargado a este directorio
   mv ~/Downloads/tus-credenciales-firebase.json src/config/credentials/app-credentials.json
   ```
   - Establecer GOOGLE_APPLICATION_CREDENTIALS en tu archivo `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./src/config/credentials/app-credentials.json
   ```

5. Configurar API Keys:
   - Para desarrollo local, establecer DEFAULT_API_KEY en tu archivo .env
   - Para producción, configurar las API keys en el servicio Cloud Run:
   ```bash
   gcloud run services update atom --set-env-vars DEFAULT_API_KEY="tu-api-key" --region=us-central1
   ```

### Desarrollo

Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

### Compilación para Producción

Compilar el proyecto:
```bash
npm run build
```

Iniciar el servidor de producción:
```bash
npm start
```

## Despliegue en Firebase Cloud Functions

1. Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Iniciar sesión en Firebase:
```bash
firebase login
```

3. Compilar y desplegar:
```bash
npm run build
cd functions
firebase deploy --only functions
```

Después del despliegue, tu API estará disponible en:
```
https://atom-dqytahs6oq-uc.a.run.app
```

## Variables de Entorno

Se requieren las siguientes variables de entorno:

| Variable                      | Descripción                                 | Requerido para             |
|-------------------------------|---------------------------------------------|----------------------------|
| GOOGLE_APPLICATION_CREDENTIALS| Ruta al archivo JSON de credenciales        | Desarrollo local           |
| DEFAULT_API_KEY               | API key predeterminada para validación      | Producción y desarrollo    |
| FIREBASE_PROJECT_ID           | ID del proyecto Firebase                    | Desarrollo y producción    |
| GOOGLE_CLIENT_ID              | ID de cliente OAuth de Google              | Autenticación con Google   |
| GOOGLE_CLIENT_SECRET          | Secreto de cliente OAuth de Google         | Autenticación con Google   |
| JWT_SECRET                    | Secreto para generación de tokens JWT      | Sistema de autenticación   |
| CORS_ORIGIN                   | Orígenes permitidos para CORS              | Peticiones cross-origin    |

## Modelo de Datos en Firestore

### Colección de Usuarios
```
users/{userId}
  - id: string
  - email: string
  - displayName: string (opcional)
  - photoURL: string (opcional)
  - authType: 'email' | 'google'
  - googleId: string (solo para auth de Google)
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastLogin: timestamp
  - isActive: boolean
```

### Colección de Tareas
```
tasks/{taskId}
  - id: string
  - userId: string (referencia a usuario)
  - title: string
  - description: string
  - priority: 'low' | 'medium' | 'high'
  - status: 'pending' | 'in-progress' | 'completed'
  - dueDate: timestamp (opcional)
  - tags: string[] (opcional)
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Seguridad

- Todas las rutas API (excepto las públicas) requieren autenticación
- Las reglas de seguridad de Firestore aseguran que los usuarios solo puedan acceder a sus propios datos
- Las variables de entorno protegen la información sensible
- La validación de API Key asegura el acceso al backend

<sub>Creado por Margareth Ortiz</sub>
<sub>07-04-2025</sub> 