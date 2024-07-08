// simple backend with 3 endpoints, login, logut and a protected route. It sill use jwt and send it via cookies to the frontend

import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
const APP_PORT = 3010
const JWT_SECRET = 'secret'
const CLIENT_URL = 'http://localhost:5173'
const isAuthenticated = (req, res, next) => {
    console.log("cookies",req.cookies)
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
const corsOptions = {
    origin: CLIENT_URL,
    credentials: true
}
const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))

app.get("/", (req, res) => {
    res.json({ message: "Hello World" })
})

app.post('/login', (req, res) => {
    const { username, password } = req.body
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
        res.cookie('token', token, { httpOnly: true })
        res.json({ message: 'Login successful' })
    } else {
        res.status(401).json({ message: 'Invalid credentials' })
    }
})

app.get('/protected', isAuthenticated,(req, res) => {
    res.json({ message: 'The secret data is: 42' })
})

app.post('/logout', (req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Logout successful' })
})

app.listen(APP_PORT, () => console.log('Server started on port '+APP_PORT))
