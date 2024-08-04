import { Context } from './context'
import { calcSum } from './utils'

export interface ParsedScoreboard {
    problems: Array<number>
    users: Array<{
        rank: number
        uid: number
        ak: boolean
        score: number
        status: Array<{ score: number, ac: boolean }>
    }>
}

export async function parseScoreboard(ctx: Context, domainId: string, tid: string) {
    const { body: { tdoc: { rule }, rows, pdict } } = await ctx.get(`/d/${domainId}/contest/${tid}/scoreboard`)
    const anyoneAccept: Record<number, boolean> = {}
    const fullScore: Record<number, number> = {}
    const result: ParsedScoreboard = { problems: [], users: [] }
    for (const row of rows) {
        if (row[0].value === '#') {
            let i = -1
            for (const column of row) {
                i++
                if (column.type !== 'problem') continue
                result.problems.push(column.raw)
                anyoneAccept[i] = pdict[column.raw].nAccept > 0
            }
        }
        else {
            let i = -1
            for (const column of row) {
                i++
                if (column.type === 'records') {
                    column.value = column.raw[0].value
                    column.score = column.raw[0].score
                    column.raw = column.raw[0].raw
                    column.type = 'record'
                }
                const score = column.value && column.value !== '-' ? +column.value : 0
                if (column.style) fullScore[i] = score
            }
        }
    }
    for (const row of rows) {
        if (row[0].value === '#') continue
        const status: Array<{ score: number, ac: boolean }> = []
        let i = -1
        for (const column of row) {
            i++
            if (column.type !== 'record') continue
            let score = column.value && column.value !== '-' ? +column.value : 0
            let ac = anyoneAccept[i] && fullScore[i] === score
            if (rule === 'acm') {
                ac = column.hover !== ''
                score = ac ? 1 : 0
            }
            if (rule === 'codeforces') {
                ac = column.hover !== ''
                score = ac ? +column.value.split('(')[0] : 0
            }
            status.push({ score, ac })
        }
        result.users.push({
            rank: +row[0].value,
            uid: row[1].raw,
            score: calcSum(status.map((doc) => doc.score)),
            ak: status.every((doc) => doc.ac),
            status,
        })
    }
    return result
}
