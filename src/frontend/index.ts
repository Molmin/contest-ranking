import JQuery from 'jquery'
import superagent from 'superagent'
import { renderScoreboard } from './scoreboard'
import { ResponseScoreboard } from '../backend'

declare module Window {
  interface Window {
    $: any
  }
}

export async function main() {
  const response = await superagent.post('/api').send({})
  renderScoreboard(response.body as ResponseScoreboard)
}

$(main)
