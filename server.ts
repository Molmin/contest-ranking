import express from 'express'
import cors from 'cors'
import bodyparser from 'body-parser'
import registerServer from './src/backend'
import { AddressInfo } from 'net'

const app = express()
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))

app.all('*', (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
    if ('OPTIONS' == req.method) return res.send(200)
    next()
})

registerServer(app)

const server = app.listen(4468, () => {
    console.info(`Port ${(server.address() as AddressInfo).port} is opened`);
})
