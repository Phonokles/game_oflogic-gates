<script>
  import {
    createBoard,
    stepBoard,
    readLabels,
    diffLabels,
    displayGrid,
    presetPattern,
    emptyPattern,
    SIZE,
    CELLS,
  } from '../lib/board.js'
 
  const SHEETS = [
    { id: 'clock', name: 'Clock' },
    { id: 'reset', name: 'Reset' },
    { id: 'counter', name: 'Counter' },
    { id: 'ring', name: 'Ring' },
    { id: 'calculator', name: 'Rule Logic' },
    { id: 'mux', name: 'Mux' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'display', name: 'Display' },
  ]
 
  let phase = 'pattern'
  let pattern = presetPattern('glider')
  let watched = 44
  let board = null
  let labels = null
  let prev = null
  let past = []
  let sheet = 'ring'
  let gens = 1
  let missing = {}
 
  $: grid = board ? displayGrid(board) : pattern
  $: changes = labels ? diffLabels(prev, labels) : []
  $: touched = new Set(changes.map((c) => c.sheet))
  $: onWatched = labels && labels.cell === watched
  $: edge = (i) => {
    const c = i % SIZE
    const r = Math.floor(i / SIZE)
    return c === 0 || c === SIZE - 1 || r === 0 || r === SIZE - 1
  }
 
  function toggleCell(i) {
    pattern[i] = !pattern[i]
    pattern = pattern
  }
 
  function preset(name) {
    pattern = name === 'clear' ? emptyPattern() : presetPattern(name)
  }
 
  function start() {
    board = createBoard(pattern)
    labels = readLabels(board)
    prev = null
    past = []
    phase = 'run'
  }
 
  function forward(n) {
    for (let k = 0; k < n; k++) {
      past.push(board)
      if (past.length > 400) past.shift()
      prev = labels
      board = stepBoard(board)
      labels = readLabels(board)
    }
    past = past
  }
 
  function back() {
    if (!past.length) return
    board = past.pop()
    past = past
    labels = readLabels(board)
    prev = past.length ? readLabels(past[past.length - 1]) : null
  }
 
  function toWatched() {
    let guard = 0
    while (board.tick % CELLS !== watched && guard++ <= CELLS) forward(1)
  }
 
  function restart() {
    phase = 'pattern'
    board = null
    labels = null
    prev = null
    past = []
  }
 
  function label(i) {
    return 'column ' + (i % SIZE) + ', row ' + Math.floor(i / SIZE)
  }
</script>
{#if phase === 'pattern'}
<p>
this page is the simulation of the whole board so the actual thing: 112 flip flops in a
chain, the counter walking through all 100 cells, the adder tree counting neighbours and the
rule deciding life and death. Every number you see below is read out of that, the same way a 
probe on the real board would read it.
</p>
<style>
p {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 18px;
}
</style>