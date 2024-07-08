
# Proyecto de Autenticación con React y Node.js usando Cookies

## Índice

1. [Introducción](#introducción)
2. [Backend](#backend)
   - [server/index.js](#serverindexjs)
3. [Frontend](#frontend)
   - [client/App.jsx](#clientappjsx)
   - [client/utils/api.js](#clientutilsapijs)
4. [Ejecución](#ejecución)

## Introducción

Este proyecto es una guía paso a paso para crear una aplicación de autenticación utilizando React en el frontend y Node.js en el backend, utilizando cookies para mantener la sesión del usuario. 

El objetivo principal es permitir a los usuarios iniciar sesión, acceder a rutas protegidas y cerrar sesión. La aplicación utiliza JSON Web Tokens (JWT) para la autenticación, almacenados en cookies HTTP-only para mayor seguridad.

La aplicación incluye un sistema de autenticación simple con un usuario y contraseña predefinidos, pero se puede adaptar fácilmente para usar una base de datos de usuarios real.

## Backend

El backend, implementado con Node.js y Express, se encarga de manejar la lógica de autenticación, la creación y verificación de tokens JWT, y la gestión de cookies. Utiliza las librerías `jsonwebtoken` para los tokens JWT y `cookie-parser` para manejar las cookies.

### `server/index.js`

Este archivo configura el servidor utilizando Express. Maneja los endpoints para iniciar sesión, cerrar sesión y acceder a una ruta protegida. También implementa un middleware de autenticación para verificar los tokens JWT.

Aspectos clave:

1. Importaciones: Librerías necesarias para el servidor y manejo de autenticación (`express`, `cors`, `jsonwebtoken`, `cookie-parser`).
2. Middleware de Autenticación: Verifica el token JWT almacenado en la cookie.
3. Configuraciones de Express:
   - `cors()`: Habilita CORS para permitir peticiones de otros orígenes.
   - `cookieParser()`: Parsea las cookies en las peticiones.
   - `express.json()`: Parseo de JSON en el cuerpo de las peticiones.
4. Endpoints:
   - POST `/login`: Para iniciar sesión y crear un token JWT.
   - GET `/protected`: Ruta protegida que requiere autenticación.
   - POST `/logout`: Para cerrar sesión y eliminar la cookie del token.

#### Código:

```javascript
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

const APP_PORT = 3010
const JWT_SECRET = 'secret' // En producción, usar una clave secreta más segura
const CLIENT_URL = 'http://localhost:5173'

// Middleware para verificar la autenticación
const isAuthenticated = (req, res, next) => {
    const token = req.cookies?.token
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: 'Invalid token' })
            } else {
                next()
            }
        })
    } else {
        res.status(401).json({ message: 'Unauthorized' })
    }
}

// Configuración de CORS para permitir peticiones del cliente
const corsOptions = {
    origin: CLIENT_URL,
    credentials: true // Permitir envío de cookies
}

const app = express()
app.use(cookieParser()) // Parsear cookies
app.use(express.json()) // Parsear JSON en el body de las peticiones
app.use(cors(corsOptions)) // Habilitar CORS

// Ruta de login
app.post('/login', (req, res) => {
    const { username, password } = req.body
    // Verificar credenciales (en producción, usar una base de datos)
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
        res.cookie('token', token, { httpOnly: true })
        res.json({ message: 'Login successful' })
    } else {
        res.status(401).json({ message: 'Invalid credentials' })
    }
})

// Ruta protegida que requiere autenticación
app.get('/protected', isAuthenticated, (req, res) => {
    res.json({ message: 'The secret data is: 42' })
})

// Ruta de logout
app.post('/logout', (req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Logout successful' })
})

// Iniciar el servidor Express
app.listen(APP_PORT, () => console.log('Server started on port ' + APP_PORT))
```

## Frontend

El frontend, implementado con React, se encarga de proporcionar una interfaz de usuario para iniciar sesión, acceder a datos protegidos y cerrar sesión. Utiliza componentes para gestionar el estado de autenticación y las interacciones del usuario, y hace peticiones al backend para realizar las operaciones de autenticación.

### `client/App.jsx`

Este componente principal de la aplicación React gestiona el estado de autenticación y permite al usuario iniciar sesión, acceder a datos protegidos y cerrar sesión.

Aspectos clave:

1. Estado:
   - `isLoggedIn`: Define si el usuario está autenticado.
   - `data`: Almacena los datos protegidos obtenidos del servidor.
2. Funciones:
   - `handleLogin`: Maneja el inicio de sesión.
   - `handleLogout`: Maneja el cierre de sesión.
   - `handleProtected`: Obtiene los datos protegidos del servidor.

#### Código:

```jsx
import { useState } from 'react'
import { login, logout, getProtected } from './utils/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data, setData] = useState(null);

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    const result = await login("admin", "password")
    if (result.error) {
      alert(result.error)
    } else {
      setIsLoggedIn(true)
    }
  }

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    const result = await logout()
    if (result.error) {
      alert(result.error)
    } else {
      setIsLoggedIn(false)
    }
  }

  // Función para obtener datos protegidos
  const handleProtected = async () => {
    const result = await getProtected()
    if (result.error) {
      alert(result.error)
    } else {
      setData(result)
    }
  }

  return (
    <>
      <div className="App">
        <h1>Simple backend</h1>
        {!isLoggedIn && <button onClick={handleLogin}>Login</button>}
        {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
        <button onClick={handleProtected}>Get protected data</button>
      </div>
      {data && <p>{JSON.stringify(data)}</p>}
    </>
  )
}

export default App
```

### `client/utils/api.js`

Este archivo contiene funciones de utilidad para realizar peticiones al servidor, incluyendo las operaciones de autenticación y obtención de datos protegidos.

Aspectos clave:

1. `fetchData`: Función genérica para realizar peticiones al servidor.
2. `login`: Función para iniciar sesión.
3. `logout`: Función para cerrar sesión.
4. `getProtected`: Función para obtener datos protegidos.

#### Código:

```javascript
const API_URL = "http://localhost:3010"

// Función genérica para realizar peticiones al servidor
export const fetchData = async (route, method, inputData = null) => {
    const url = new URL(API_URL + route);
    const fetchOptions = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // Incluir cookies en las peticiones
    }
    
    if (inputData) {
        if (method === "get") {
            Object.keys(inputData).forEach(key => {
                url.searchParams.append(key, inputData[key]);
            })
        } else if (method === "post" || method === "put" || method === "patch") {
            fetchOptions.body = JSON.stringify(inputData);
        }
    }

    try {
        const result = await fetch(url.toString(), fetchOptions);
        const data = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return ({ error: error.message })
    }
}

// Funciones específicas para cada operación de autenticación
export const login = (username, password) => {
    return fetchData("/login", "post", { username, password });
}

export const logout = () => {
    return fetchData("/logout", "post");
}

export const getProtected = () => {
    return fetchData("/protected", "get");
}
```

## Ejecución

Para ejecutar el proyecto, se deben instalar las dependencias y ejecutar el servidor y la aplicación React.

1. **Instalación de dependencias**:

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Ejecución del servidor y la aplicación**:

   - **Servidor**:

     ```bash
     cd server
     npm run dev
     ```

   - **Cliente**:

     ```bash
     cd client
     npm run dev
     ```

Con estos pasos, se podrá acceder a la aplicación de React en `http://localhost:5173` y realizar operaciones de autenticación con el servidor en `http://localhost:3010`. Si se desea cambiar el puerto del servidor, se puede modificar en el archivo `server/index.js` y en los archivos de la aplicación React.

## Referencias
- [JSON Web Tokens | jwt.io](https://jwt.io/)
- [Express | npm](https://www.npmjs.com/package/express)
- [cookie-parser | npm](https://www.npmjs.com/package/cookie-parser)
- [jsonwebtoken | npm](https://www.npmjs.com/package/jsonwebtoken)