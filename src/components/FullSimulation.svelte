<script>
  import {
    createBoard,
    stepBoard,
    readLabels,
    displayGrid,
    presetPattern,
    emptyPattern,
    SIZE,
    CELLS,
  } from '../lib/board.js'

  // alles was in src/assets/sheets/ liegt wird automatisch eingesammelt.
  // datei rein, fertig, hier muss nichts angepasst werden.
  const files = import.meta.glob('../assets/sheets/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
  })
  const shots = {}
  for (const path in files) {
    shots[path.split('/').pop().replace('.png', '')] = files[path]
  }

  // ein schritt ist ein sheet. neun davon ergeben eine zelle.
  const STATIONS = [
    {
      photo: 'clock',
      sheet: 'clock',
      title: 'the clock ticks',
      text: () =>
        'one pulse from the 555. the board only moves when this edge arrives, in between it just sits there.',
    },
    {
      photo: 'reset',
      sheet: 'reset',
      title: 'reset does nothing',
      text: () =>
        'the reset button is not pressed, so CLEAR_N stays high and no register gets wiped. this sheet only matters when someone presses the button.',
    },
    {
      photo: 'counter',
      sheet: 'counter',
      parts: ['U1', 'U2'],
      title: 'the counter picks the cell',
      text: (l) =>
        `the two counters hold column ${l.col} and row ${l.row}. that is the address of the cell being worked on.`,
    },
    {
      photo: 'buttons',
      sheet: 'buttons',
      title: 'the buttons get scanned',
      text: (l) =>
        `row ${l.row} is driven high and column ${l.col} is read back, the same address the counter just showed. RUN is 1 though, so whatever the buttons say gets thrown away.`,
    },
    {
      photo: 'ring',
      sheet: 'ring',
      parts: ['U23', 'U24', 'U25'],
      title: 'nine taps on the chain',
      text: (l) =>
        `the taps sit far enough apart that the cell and its eight neighbours come out at the same time. this cell is ${l.alive ? 'alive' : 'dead'}, ${l.count} of its neighbours are alive.`,
    },
    {
      photo: 'calculator',
      sheet: 'calculator',
      title: 'count the neighbours, apply the rule',
      text: (l) =>
        `the adders turn the eight bits into the number ${l.count}. the gates after them check for 3, or for 2 with the cell already alive. result: the cell ${l.Y ? 'lives' : 'dies'}.`,
    },
    {
      photo: 'counter',
      sheet: 'counter',
      parts: ['mask-sp', 'mask-zl', 'mask-out'],
      title: 'the edge mask',
      text: (l) =>
        l.mask.rand
          ? `column ${l.col} or row ${l.row} is on the border, so RAND is 1 and the result gets pushed down to 0 whatever the rule said.`
          : `not on the border, RAND is 0, so the result goes through unchanged.`,
    },
    {
      photo: 'mux',
      sheet: 'mux',
      title: 'rule or buttons',
      text: (l) =>
        `RUN is 1, so the rule wins and the buttons are ignored. NB is ${l.NB ? 1 : 0} and that bit goes into the front of the chain on the next pulse.`,
    },
    {
      photo: 'display',
      sheet: 'display',
      title: 'the screen',
      text: (l) =>
        `the value gets shifted into the 595, and row ${l.row} is the one lit right now. the screen is drawn one row after the other.`,
    },
  ]

  let phase = 'pattern'
  let pattern = presetPattern('glider')
  let watched = new Set([44])
  let gen = 0
  let cellIndex = 0
  let station = 0

  $: list = [...watched].sort((a, b) => a - b)
  $: cell = list.length ? list[Math.min(cellIndex, list.length - 1)] : 0
  $: board = boardAt(gen * CELLS + cell)
  $: labels = readLabels(board)
  $: grid = phase === 'run' ? displayGrid(board) : pattern
  $: now = STATIONS[station]
  $: shown = labels.sheets
    .filter((s) => s.id === now.sheet)
    .flatMap((s) => s.parts.filter((p) => !now.parts || now.parts.includes(p.id)))
  $: atStart = gen === 0 && cellIndex === 0 && station === 0

  function boardAt(tick) {
    let b = createBoard(pattern)
    for (let i = 0; i < tick; i++) b = stepBoard(b)
    return b
  }

  function edge(i) {
    const c = i % SIZE
    const r = Math.floor(i / SIZE)
    return c === 0 || c === SIZE - 1 || r === 0 || r === SIZE - 1
  }

  function name(i) {
    return 'column ' + (i % SIZE) + ', row ' + Math.floor(i / SIZE)
  }

  function toggleCell(i) {
    pattern[i] = !pattern[i]
    pattern = pattern
  }

  function toggleWatch(i) {
    if (watched.has(i)) watched.delete(i)
    else watched.add(i)
    watched = watched
  }

  function preset(n) {
    pattern = n === 'clear' ? emptyPattern() : presetPattern(n)
  }

  function next() {
    if (station < STATIONS.length - 1) {
      station += 1
    } else {
      station = 0
      nextCell()
    }
  }

  function nextCell() {
    if (cellIndex < list.length - 1) {
      cellIndex += 1
    } else {
      cellIndex = 0
      gen += 1
    }
    station = 0
  }

  function back() {
    if (station > 0) {
      station -= 1
      return
    }
    if (cellIndex > 0) {
      cellIndex -= 1
      station = STATIONS.length - 1
      return
    }
    if (gen > 0) {
      gen -= 1
      cellIndex = Math.max(0, list.length - 1)
      station = STATIONS.length - 1
    }
  }

  function restart() {
    phase = 'pattern'
    gen = 0
    cellIndex = 0
    station = 0
  }

  function start() {
    gen = 0
    cellIndex = 0
    station = 0
    phase = 'run'
  }
</script>

{#if phase === 'pattern'}
  <p>
    This runs the whole board in code: the 112 flip flops, the counter that walks through all 100
    cells, the adders and the rule. Every value further down is read out of that, nothing is typed
    in by hand.
  </p>

  <h2>1. Choose who starts alive</h2>

  <p>
    Click the cells that should be on. On the board you would press the 100 buttons for this.
  </p>

  <div class="row">
    <div class="grid">
      {#each pattern as on, i}
        <button class="cell" class:on class:edge={edge(i)} title={name(i)} on:click={() => toggleCell(i)} aria-label={name(i)}></button>
      {/each}
    </div>

    <div class="side">
      <div class="btns">
        <button class="btn" on:click={() => preset('glider')}>glider</button>
        <button class="btn" on:click={() => preset('blinker')}>blinker</button>
        <button class="btn" on:click={() => preset('block')}>block</button>
        <button class="btn" on:click={() => preset('tub')}>tub</button>
        <button class="btn" on:click={() => preset('clear')}>clear</button>
      </div>
      <p class="hint">
        The darker frame is the edge. The edge mask holds those cells dead, so keep the pattern off
        it.
      </p>
      <button class="btn go" on:click={() => (phase = 'watch')}>next</button>
    </div>
  </div>
{/if}

{#if phase === 'watch'}
  <h2>2. Pick the cells you want to watch</h2>

  <p>
    The board does one cell at a time, all 100 in a row. Pick the ones you care about. You go
    through every sheet for each of them, then the next generation starts.
  </p>

  <div class="row">
    <div class="grid">
      {#each pattern as on, i}
        <button
          class="cell"
          class:on
          class:edge={edge(i)}
          class:watch={watched.has(i)}
          title={name(i)}
          on:click={() => toggleWatch(i)}
          aria-label={name(i)}
        ></button>
      {/each}
    </div>

    <div class="side">
      <p class="hint">
        {#if list.length}
          watching {list.length}
          {list.length === 1 ? 'cell' : 'cells'}: {list.map(name).join(' / ')}
        {:else}
          nothing picked yet, click at least one cell
        {/if}
      </p>
      <div class="btns">
        <button class="btn" on:click={() => (phase = 'pattern')}>back</button>
        <button class="btn go" on:click={start} disabled={!list.length}>start the clock</button>
      </div>
    </div>
  </div>
{/if}

{#if phase === 'run'}
  <div class="bar">
    <span class="stat"><span class="k">generation</span><span class="v">{gen}</span></span>
    <span class="stat">
      <span class="k">cell</span>
      <span class="v">{cellIndex + 1} of {list.length}</span>
    </span>
    <span class="stat">
      <span class="k">at</span>
      <span class="v">col {labels.col} row {labels.row}</span>
    </span>
    <span class="stat">
      <span class="k">sheet</span>
      <span class="v">{station + 1} of {STATIONS.length}</span>
    </span>
  </div>

  {#if shots[now.photo]}
    <img class="shot" src={shots[now.photo]} alt={'the ' + now.photo + ' sheet'} />
  {:else}
    <div class="noshot">
      put a photo of the {now.photo} sheet into src/assets/sheets/{now.photo}.png
    </div>
  {/if}

  <h2>{now.title}</h2>
  <p>{now.text(labels)}</p>

  <div class="row">
    <div class="values">
      {#each shown as part}
        <div class="group">
          <div class="part">{part.name}</div>
          {#each part.nets as n}
            <div class="line">
              <span class="net">{n.name}</span>
              <span class="lamp" class:on={n.v}>{n.v ? 1 : 0}</span>
              {#if n.note}<span class="note">{n.note}</span>{/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>

    <div class="side">
      <div class="grid small">
        {#each grid as on, i}
          <div class="cell" class:on class:edge={edge(i)} class:watch={watched.has(i)} class:here={labels.cell === i} title={name(i)}></div>
        {/each}
      </div>
      <p class="hint">
        white outline is the cell being worked on, dashed are the ones you picked. during a pass the
        screen is part old and part new generation, same as the real board.
      </p>
    </div>
  </div>

  <div class="btns">
    <button class="btn" on:click={back} disabled={atStart}>back</button>
    <button class="btn go" on:click={next}>
      {station < STATIONS.length - 1 ? 'next sheet' : cellIndex < list.length - 1 ? 'next cell' : 'next generation'}
    </button>
    <button class="btn" on:click={nextCell}>skip to next cell</button>
    <button class="btn" on:click={restart}>start over</button>
  </div>

  <details>
    <summary>every label on the board right now</summary>
    {#each labels.sheets as s}
      <div class="group">
        <div class="part">{s.name}</div>
        {#each s.parts as part}
          {#each part.nets as n}
            <div class="line">
              <span class="net">{n.name}</span>
              <span class="lamp" class:on={n.v}>{n.v ? 1 : 0}</span>
            </div>
          {/each}
        {/each}
      </div>
    {/each}
  </details>
{/if}

<style>
  p {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 18px;
  }

  h2 {
    font-size: 20px;
    margin: 24px 0 12px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 26px;
    align-items: flex-start;
    margin: 18px 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(10, 26px);
    grid-auto-rows: 26px;
    gap: 3px;
    flex-shrink: 0;
  }

  .grid.small {
    grid-template-columns: repeat(10, 16px);
    grid-auto-rows: 16px;
    gap: 2px;
  }

  .cell {
    width: 100%;
    height: 100%;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: #17191a;
    cursor: pointer;
  }

  div.cell {
    cursor: default;
  }

  .cell.edge {
    background: #121415;
    border-color: #2a2d2f;
  }

  .cell.on {
    background: #3f8fd0;
    border-color: #3f8fd0;
  }

  .cell.watch {
    outline: 2px dashed #8e99a2;
    outline-offset: -2px;
  }

  .cell.here {
    box-shadow: inset 0 0 0 2px #e8ecee;
  }

  .side {
    flex: 1;
    min-width: 230px;
  }

  .values {
    flex: 2;
    min-width: 280px;
  }

  .shot {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #0d0f10;
  }

  .noshot {
    border: 1px dashed var(--border);
    border-radius: 10px;
    padding: 46px 20px;
    text-align: center;
    font-family: var(--code);
    font-size: 13px;
    color: var(--fg-faint);
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 22px;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 14px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .k {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-faint);
  }

  .v {
    font-family: var(--code);
    font-size: 15px;
    color: var(--fg-bright);
  }

  .group {
    border-top: 1px solid var(--border);
    padding: 10px 0 4px;
  }

  .part {
    font-size: 13px;
    color: var(--fg);
    margin-bottom: 6px;
  }

  .line {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--code);
    font-size: 13px;
    padding: 3px 0;
  }

  .net {
    min-width: 140px;
    color: var(--fg-bright);
  }

  .lamp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--fg-faint);
    background: #17191a;
  }

  .lamp.on {
    background: #3f8fd0;
    border-color: #3f8fd0;
    color: #141617;
  }

  .note {
    font-family: var(--sans);
    font-size: 13px;
    color: var(--fg-faint);
  }

  .btns {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 14px;
  }

  .btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    font-family: var(--code);
    font-size: 13px;
    color: var(--fg);
    cursor: pointer;
  }

  .btn:hover:not(:disabled) {
    border-color: var(--fg-faint);
    color: var(--fg-bright);
  }

  .btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .btn.go {
    border-color: var(--sidebar-active);
    color: var(--sidebar-active);
  }

  .hint {
    font-size: 14px;
    line-height: 1.6;
    color: var(--fg-faint);
    margin: 12px 0 14px;
  }

  details {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
  }

  summary {
    cursor: pointer;
    font-size: 14px;
    color: var(--fg-bright);
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: repeat(10, 22px);
      grid-auto-rows: 22px;
    }
  }
</style>