import { Express, Request, Response } from 'express'
import yamljs from 'yamljs'
import { ParsedScoreboard, parseScoreboard } from './scoreboard'
import { Context } from './context'

export interface SystemConfig {
    hosts: Record<string, { username: string, password: string }>
}

export interface ResponseScoreboard {
    users: Array<{
        rank: number
        uid: number
        status: Record<string, number>
    }>
    contests: Array<{
        link: string
        problem: number
    }>
}

const ctx: Record<string, Context> = {}
const config: SystemConfig = yamljs.load('config.yml')

async function API(request: Request, response: Response) {
    const contests = [
        'https://oifha.com/d/ZSWeek_1/contest/66a641209eaf3556c0848e04',
        'https://oifha.com/d/ZSWeek_1/contest/66a9a6f79eaf3556c089e943',
        'https://oifha.com/d/ZSWeek_1/contest/66ac19569b6204996f8a5003',
        'https://oifha.com/d/ZSWeek_1/contest/66aeec619b6204996f9bb740',
    ]
    const scoreboards: ParsedScoreboard[] = []
    const result: ResponseScoreboard = { users: [], contests: [] }
    for (const contest of contests) {
        const url = new URL(contest)
        if (!ctx[url.origin]) {
            ctx[url.origin] = new Context(url.origin)
            const host = config.hosts[url.origin]
            if (host) await ctx[url.origin].login(host.username, host.password)
        }
        const scoreboard = await parseScoreboard(ctx[url.origin], contest.split('/d/')[1].split('/')[0], contest.split('/contest/')[1].split('/')[0])
        scoreboards.push(scoreboard)
        result.contests.push({ link: contest, problem: scoreboard.problems.length })
    }
    const users: Record<number, Record<string, number>> = {}
    for (const [contestId, scoreboard] of Object.entries(scoreboards)) {
        const maxScore = Math.max(scoreboard.users[0].score || 0, 1)
        for (const user of scoreboard.users) {
            users[user.uid] ||= {}
            for (const [pid, { score }] of Object.entries(user.status)) {
                users[user.uid][`R${+contestId + 1}${String.fromCharCode(65 + +pid)}`] = score
            }
            users[user.uid][`R${+contestId + 1}`] = user.score
            users[user.uid][`R${+contestId + 1}S`] = user.score / maxScore * 100
            users[user.uid].sum ||= 0
            users[user.uid].sum += user.score
            users[user.uid].sumS ||= 0
            users[user.uid].sumS += user.score / maxScore * 100
        }
    }
    let renderUsers = Object.entries(users).map(([uid, status]) => ({ rank: 0, uid: +uid, status }))
    renderUsers = renderUsers.sort((x, y) => y.status.sum - x.status.sum)
    let last = 10000000, nowRank = 0, rank = 0
    for (let user of renderUsers) {
        rank++
        if (user.status.sum !== last) last = user.status.sum, nowRank = rank
        user.rank = nowRank
    }
    result.users = renderUsers
    return response.send(result)
}

export default function registerServer(app: Express) {
    app.post('/api', async (request, response) => {
        try { await API(request, response) }
        catch (e: any) {
            console.error(e)
            response.send({ error: e.message || 'Unknown Error' })
        }
    })
}
