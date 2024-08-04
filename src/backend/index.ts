import { Express } from 'express'

export default function registerServer(app: Express) {
    app.get('/', (request, response) => response.send(`hi`))
}
