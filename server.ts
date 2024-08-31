import express from 'express'
import cors from 'cors'
import bodyparser from 'body-parser'
import { AddressInfo } from 'net'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import registerServer from './src/backend'
import { minifyStyle } from './src/backend/utils'

const app = express()
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))

app.all('*', (request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*')
    response.set('Access-Control-Allow-Methods', 'GET')
    response.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
    if ('OPTIONS' === request.method) return response.send(200)
    next()
})

app.get('/public/jquery.min.js', (request, response) => response.send(readFileSync('src/frontend/node_modules/jquery/dist/jquery.min.js').toString()))
app.get('/public/ui.css', (request, response) => response.type('text/css').send(minifyStyle(readFileSync('src/frontend/public/ui.css').toString())))
app.get('/public/ui.js', (request, response) => response.send(readFileSync('src/frontend/dist/ui.js').toString()))
app.use('/public', express.static(path.join(__dirname, 'src/frontend/public')))
app.get('/', (request, response) => response.send(readFileSync('src/frontend/public/index.html').toString()))

registerServer(app)

const server = app.listen(4468, () => {
    console.info(`Port ${(server.address() as AddressInfo).port} is opened`);
})
