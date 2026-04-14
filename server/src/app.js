import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'


import authRoutes from './routes/auth.routes.js'
import searchRoutes from './routes/search.routes.js'
import playlistRoutes from './routes/playlist.routes.js'
import likesRoutes from './routes/likes.routes.js'
import historyRoutes from './routes/history.routes.js'
import userRoutes from './routes/user.routes.js'
import './services/passport.service.js'

export const prisma = new PrismaClient()

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'vynl_session_secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/likes', likesRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/user', userRoutes)

app.get('/health', (req, res) => res.json({ status: 'Vynl is alive 🎵' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🎵 Vynl server running on port ${PORT}`))
