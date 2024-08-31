import superagent from 'superagent'

const UA = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76',
].join(' ')

export class Context {
    public agent = superagent.agent()

    constructor(public endpoint = 'https://hydro.ac') { }

    get(url: string) {
        return this.agent
            .get(new URL(url, this.endpoint).toString())
            .set('User-Agent', UA)
            .accept('application/json')
            .retry(10)
    }
    post(url: string) {
        return this.agent
            .post(new URL(url, this.endpoint).toString())
            .set('User-Agent', UA)
            .accept('application/json')
            .retry(10)
    }

    async loggedIn() {
        const { body: { UserContext } } = await this.get(`/`)
        return JSON.parse(UserContext)._id
    }
    async login(username: string, password: string) {
        await this.post('/login').send({ uname: username, password })
    }
}
