import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'
import route from './routes'
import { corsOptions } from './config'

const app = express()

app.use(logger('dev'))

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(cors(corsOptions))

// routes init
route(app)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404))
})

export default app