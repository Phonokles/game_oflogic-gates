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
<h2> 1. Choose who starts alive</h2>
<p>
click the cells you want swiched on. On the real board you would be doing this with th 100
push buttons in edit mode, and the machine would shift your pattern into the register over 100
</p>
  <div class="setup">
    <div class="grid">
      {#each pattern as on, i}
        <button
          class="cell"
          class:on
          class:edge={edge(i)}
          title={label(i)}
          on:click={() => toggleCell(i)}
          aria-label={label(i)}
        ></button>
      {/each}
    </div>
 
    <div class="setup-side">
      <div class="presets">
        <button class="btn" on:click={() => preset('glider')}>glider</button>
        <button class="btn" on:click={() => preset('blinker')}>blinker</button>
        <button class="btn" on:click={() => preset('block')}>block</button>
        <button class="btn" on:click={() => preset('tub')}>tub</button>
        <button class="btn" on:click={() => preset('clear')}>clear</button>
      </div>
      <p class="hint">
        The darker frame is the edge. Those cells are forced dead by the edge mask on the counter
        sheet, so a pattern touching the frame will get eaten. Keep it in the middle.
      </p>
      <button class="btn go" on:click={() => (phase = 'watch')}>next</button>
    </div>
  </div>
{/if}
 
{#if phase === 'watch'}
<h2>2. Pick a cell to follow</h2>

<p>
The machine works on one cell at a time, so pick the one you want to keep an eye on you can 
jump straight to its turn later instead of clicking thorugh the other 99 cells.
</p>
<div class="setup">
    <div class="grid">
      {#each pattern as on, i}
        <button
          class="cell"
          class:on
          class:edge={edge(i)}
          class:watch={watched === i}
          title={label(i)}
          on:click={() => (watched = i)}
          aria-label={label(i)}
        ></button>
      {/each}
    </div>

    <div class="setup-side">
      <p class="hint">
        following <strong>{label(watched)}</strong>, which starts
        {pattern[watched] ? 'alive' : 'dead'}.
      </p>
      <button class="btn" on:click={() => (phase = 'pattern')}>back</button>
      <button class="btn go" on:click={start}>start the clock</button>
    </div>
  </div>
{/if}

{#if phase === 'run' && labels}
  <div class="bar">
    <span class="stat"><span class="k">generation</span><span class="v">{labels.gen}</span></span>
    <span class="stat"><span class="k">clock tick</span><span class="v">{labels.tick}</span></span>
    <span class="stat">
      <span class="k">working on</span>
      <span class="v">col {labels.col} row {labels.row}</span>
    </span>
        <span class="stat"><span class="k">neighbours</span><span class="v">{labels.count}</span></span>
  </div>

  <div class="setup">
    <div class="grid">
      {#each grid as on, i}
      <div
      class="cell"
      class:on
      class:edge={edge(i)}
      class:watch={watched === i}
      class:here={labels.cell === i}
      title={label(i)}
    ></div>
    {/each}
  </div>

  <div  class="setup-side">
  <p class="hint">
  The bright ring is the cell being worked on, the dashed one is the cell you are following
  while a pass is running the screen shows a mix: cells already visied carry the new
  generation, the rest still carry the old one. the real board looks exacly like this
  </p>

        {#if onWatched}
        <div class="verdict" class:live={labels.Y}>
          your cell is up now: {labels.alive ? 'alive' : 'dead'}, {labels.count} neighbours,
          rule says {labels.Y ? 'it lives' : 'it dies'}
        </div>
      {/if}
    </div>
  </div>

    <div class="controls">
    <button class="btn" on:click={back} disabled={!past.length}>back</button>
    <button class="btn" on:click={() => forward(1)}>next cell</button>
    <button class="btn" on:click={toWatched}>jump to my cell</button>
    <button class="btn" on:click={() => forward(CELLS)}>next generation</button>
    <span class="runrow">
      <input class="num" type="number" min="1" max="50" bind:value={gens} id="gens" />
      <button class="btn" on:click={() => forward(CELLS * Math.max(1, Math.min(50, gens)))}>
        run that many generations
      </button>
    </span>
    <button class="btn" on:click={restart}>start over</button>
  </div>

  <h2> What changed in this trick</h2>
  {#if !prev}
    <p class="hint">Nothing yet, the clock has not ticked. Press next cell</p>
    {:else if !changes.length}
    <p class="hint">Nothing changed. that happens on quiet streaches of the grid</p>

<style>
p {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 18px;
}
</style>