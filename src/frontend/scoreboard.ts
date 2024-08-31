import { ResponseScoreboard } from '../backend'
import { } from '.'

export function renderScoreboard(scoreboard: ResponseScoreboard) {
  const thead = $('.column-scoreboard > table > thead')
  const tbody = $('.column-scoreboard > table > tbody')
  thead.empty()
  for(const contest of scoreboard.contests) {
    thead.append(`<th>${contest}</th>`)
  }
  tbody.empty()
}
