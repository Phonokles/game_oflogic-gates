<script>
  export let src
  export let alt = ''
  export let inputs = ['a', 'b']
  export let fn
  export let outName = 'output'

  let state = {}
  for (const n of inputs) state[n] = false

  $: rows = build(inputs, fn)
  $: out = !!fn(state)
  $: here = key(state)

  function key(v) {
    return inputs.map((n) => (v[n] ? '1' : '0')).join('')
  }

  function build(names, f) {
    const list = []
    for (let bits = 0; bits < 1 << names.length; bits++) {
      const v = {}
      names.forEach((n, i) => {
        v[n] = !!(bits & (1 << (names.length - 1 - i)))
      })
      list.push({ v, out: !!f(v), k: key(v) })
    }
    return list
  }

  function toggle(n) {
    state = { ...state, [n]: !state[n] }
  }
</script>

<div class="card">
  <div class="pic">
    <img {src} {alt} />
  </div>

  <div class="side">
    <table>
      <thead>
        <tr>
          {#each inputs as n}<th>{n}</th>{/each}
          <th class="out">{outName}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as r}
          <tr class:now={r.k === here}>
            {#each inputs as n}<td>{r.v[n] ? 1 : 0}</td>{/each}
            <td class="out">{r.out ? 1 : 0}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="controls">
    {#each inputs as n}
      <button on:click={() => toggle(n)} aria-pressed={state[n]}>
        <span class="name">{n}</span>
        <span class="lamp" class:on={state[n]}>{state[n] ? 1 : 0}</span>
      </button>
    {/each}

    <span class="result">
      <span class="name">{outName}</span>
      <span class="lamp" class:on={out}>{out ? 1 : 0}</span>
    </span>
  </div>
</div>

<style>
  .card {
    --on: #26267d;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'pic side'
      'ctrl side';
    gap: 0 22px;
    align-items: start;
    margin: 24px 0 30px;
  }

  .pic {
    grid-area: pic;
    min-width: 0;
  }

  img {
    display: block;
    width: 100%;
    max-width: 420px;
    height: auto;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .side {
    grid-area: side;
    align-self: stretch;
    border-left: 1px solid var(--border);
    padding-left: 22px;
  }

  table {
    border-collapse: collapse;
    font-family: var(--code);
    font-size: 14px;
  }

  th,
  td {
    border: 1px solid var(--border);
    padding: 5px 16px;
    text-align: center;
    color: var(--fg-faint);
  }

  th {
    color: var(--fg);
    font-weight: 600;
  }

  .out {
    background: #1b1e1f;
  }

  tr.now td {
    color: var(--on);
    background: #15161d;
  }

  tr.now td.out {
    background: #171624;
  }

  .controls {
    grid-area: ctrl;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
  }

  button {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    color: var(--fg);
  }

  button:hover {
    border-color: var(--fg-faint);
  }

  button:focus-visible {
    outline: 2px solid var(--sidebar-active);
    outline-offset: 2px;
  }

  .result {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 6px;
    padding: 6px 10px;
    border: 1px dashed var(--border);
    border-radius: 4px;
  }

  .name {
    font-family: var(--code);
    font-size: 13px;
    color: var(--fg);
  }

  .lamp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-family: var(--code);
    font-size: 13px;
    color: var(--fg-faint);
    border: 1px solid var(--border);
    background: #17191a;
  }

  .lamp.on {
    color: #141617;
    background: var(--on);
    border-color: var(--on);
  }

  @media (max-width: 720px) {
    .card {
      grid-template-columns: 1fr;
      grid-template-areas:
        'pic'
        'ctrl'
        'side';
    }

    .side {
      border-left: none;
      border-top: 1px solid var(--border);
      padding-left: 0;
      padding-top: 16px;
      margin-top: 16px;
    }
  }
</style>