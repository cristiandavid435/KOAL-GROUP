# KOAL Group

Sistema web desarrollado para apoyar la gestión operativa y administrativa de KOAL Group. El proyecto permite centralizar información relacionada con proyectos, personal, producción, frentes de trabajo, inventarios, herramientas, registros de gases, control de acceso y generación de reportes.

Este proyecto fue desarrollado de manera colaborativa con otros compañeros del SENA como parte de un proceso formativo y práctico. Mi responsabilidad principal dentro del equipo fue el desarrollo del **backend**, incluyendo la construcción de la API, los modelos de datos, la autenticación y la conexión entre la lógica del sistema y el frontend.

## Funcionalidades principales

- Autenticación de usuarios mediante tokens JWT.
- Gestión de usuarios, personal y permisos según el rol.
- Administración de proyectos y frentes de trabajo.
- Registro y consulta de producción e inventario.
- Control de entrada y salida del personal.
- Registro de gases y seguimiento de información operativa.
- Gestión de herramientas.
- Generación y consulta de reportes.
- Exportación de información desde el frontend.
- Interfaz adaptable con herramientas de accesibilidad.

## Tecnologías utilizadas

### Backend

- Python 3.13.
- Django 5.2.
- Django REST Framework.
- Simple JWT para autenticación basada en tokens.
- Django CORS Headers para permitir la comunicación con el frontend.
- SQLite como base de datos durante el desarrollo.

### Frontend

- React 18.
- TypeScript.
- Vite.
- Tailwind CSS.
- Axios para consumir la API REST.
- React Router para la navegación.
- ExcelJS y XLSX para el manejo y exportación de archivos de Excel.
- Lucide React, React Icons y SweetAlert2 para la interfaz y las notificaciones.

## Requisitos

- Python 3.13 o una versión compatible.
- Pipenv.
- Node.js y npm.
- Git.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd koal-group-koal
```

### 2. Ejecutar el backend

Desde la carpeta `backend`, instalar las dependencias y aplicar las migraciones:

```bash
cd backend
pipenv install
pipenv run python manage.py migrate
pipenv run python manage.py runserver 8000
```

La API estará disponible en:

```text
http://127.0.0.1:8000/api/
```

También es posible activar el entorno virtual antes de ejecutar Django:

```bash
pipenv shell
python manage.py migrate
python manage.py runserver 8000
```

### 3. Ejecutar el frontend

En otra terminal, desde la carpeta `Frondent`, instalar las dependencias y arrancar el servidor de desarrollo:

```bash
cd Frondent
npm install
npm run dev
```

El frontend estará disponible normalmente en:

```text
http://localhost:5173
```

El frontend está configurado para consumir la API del backend desde `http://127.0.0.1:8000/api/`.

## Comandos disponibles del frontend

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera la versión de producción
npm run lint      # Ejecuta las validaciones de ESLint
npm run preview   # Previsualiza la compilación de producción
```

## Autenticación

La API utiliza autenticación JWT. El inicio de sesión obtiene un token de acceso y el frontend lo envía automáticamente en las peticiones protegidas mediante el encabezado:

```text
Authorization: Bearer <token>
```

Los endpoints principales para los tokens son:

- `POST /api/token/`: obtener los tokens de acceso y renovación.
- `POST /api/token/refresh/`: renovar el token de acceso.

## Estructura del proyecto

```text
koal-group-koal/
├── backend/          # API, modelos, autenticación y base de datos
│   ├── api/
│   ├── config/
│   └── manage.py
├── Frondent/         # Aplicación web desarrollada con React y TypeScript
│   ├── src/
│   └── package.json
└── README.md
```

## Trabajo colaborativo

KOAL Group fue construido en equipo junto con otros aprendices del SENA. La colaboración permitió distribuir el análisis, diseño y desarrollo de los diferentes módulos del sistema.

Mi aporte se concentró en el **backend**, especialmente en:

- Diseño y mantenimiento de los modelos de datos.
- Desarrollo de endpoints para la API REST.
- Implementación de serializadores y permisos.
- Configuración de autenticación con JWT.
- Creación y actualización de migraciones de la base de datos.
- Integración de la API con el frontend.

## Estado del proyecto

Proyecto desarrollado con fines formativos y de demostración durante el proceso colaborativo en el SENA.
