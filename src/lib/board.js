
export const SIZE = 10
export const CELLS = SIZE * SIZE
export const STAGES = 112
export const TAPS = {
  N0: 89,
  N1: 90,
  N2: 91,
  N3: 99,
  alive: 100,
  N4: 101,
  N5: 109,
  N6: 110,
  N7: 111,
}

export const NEIGHBOUR_DIR = {
  N0: 'down right',
  N1: 'down',
  N2: 'down left',
  N3: 'right',
  N4: 'left',
  N5: 'up right',
  N6: 'up',
  N7: 'up left',
}

const wrap = (n) => ((n % CELLS) + CELLS) % CELLS

function cellAtStage(c, s) {
  return wrap(c + CELLS - s)
}

export function createBoard(pattern) {
  const ring = new Array(STAGES).fill(false)
  for (let s = 1; s <= STAGES; s++) {
    ring[s - 1] = !!pattern[cellAtStage(0, s)]
  }
  return { ring, tick: 0 }
}

export function emptyPattern() {
  return new Array(CELLS).fill(false)
}

export const PRESETS = {
  glider: [34, 45, 53, 54, 55],
  blinker: [43, 44, 45],
  block: [44, 45, 54, 55],
  tub: [34, 43, 45, 54],
}

export function presetPattern(name) {
  const p = emptyPattern()
  for (const i of PRESETS[name] || []) p[i] = true
  return p
}

function halfAdder(a, b) {
  return { s: a !== b, c: a && b }
}

function fullAdder(a, b, cin) {
  const x = a !== b
  return { s: x !== cin, c: (a && b) || (cin && x) }
}
export function readBoard(state) {
  const { ring, tick } = state
  const c = tick % CELLS
  const col = c % SIZE
  const row = Math.floor(c / SIZE)

  const at = (s) => ring[s - 1]

  const n = {}
  for (const k of ['N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7']) n[k] = at(TAPS[k])
  const alive = at(TAPS.alive)

  const fa1 = fullAdder(n.N0, n.N1, n.N2)
  const fa2 = fullAdder(n.N3, n.N4, n.N5)
  const ha1 = halfAdder(n.N6, n.N7)
  const fa3 = fullAdder(fa1.s, fa2.s, ha1.s)
  const fa4 = fullAdder(fa1.c, fa2.c, ha1.c)
  const ha2 = halfAdder(fa3.c, fa4.s)

  const b0 = fa3.s
  const b1 = ha2.s
  const lt4 = !(fa4.c || ha2.c)
  const or1 = b0 || alive
  const t1 = lt4 && b1
  const Y = or1 && t1

  const count = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7'].filter((k) => n[k]).length

  const spA = !(bit(col, 0) || bit(col, 1))
  const spB = !(bit(col, 2) || bit(col, 3))
  const spIst0 = spA && spB
  const spIst9 = bit(col, 0) && bit(col, 3)
  const spRand = spIst0 || spIst9

  const zlA = !(bit(row, 0) || bit(row, 1))
  const zlB = !(bit(row, 2) || bit(row, 3))
  const zlIst0 = zlA && zlB
  const zlIst9 = bit(row, 0) && bit(row, 3)
  const zlRand = zlIst0 || zlIst9

  const rand = spRand || zlRand
  const regelOutN = !Y
  const regelMaskiert = !(regelOutN || rand)

  const run = true
  const runNGate = !run
  const tasteAktiv = false
  const tempA = regelMaskiert && run
  const tempB = tasteAktiv && runNGate
  const NB = tempA || tempB

  return {
    tick,
    gen: Math.floor(tick / CELLS),
    cell: c,
    col,
    row,
    n,
    alive,
    count,
    NB,
    Y,
    parts: { fa1, fa2, ha1, fa3, fa4, ha2, b0, b1, lt4, or1, t1 },
    mask: {
      spA,
      spB,
      spIst0,
      spIst9,
      spRand,
      zlA,
      zlB,
      zlIst0,
      zlIst9,
      zlRand,
      rand,
      regelOutN,
      regelMaskiert,
    },
    mux: { run, runNGate, tasteAktiv, tempA, tempB },
  }
}

function bit(value, index) {
  return !!(value & (1 << index))
}

export function stepBoard(state) {
  const r = readBoard(state)
  const ring = state.ring.slice(0, STAGES - 1)
  ring.unshift(r.NB)
  return { ring, tick: state.tick + 1 }
}

export function displayGrid(state) {
  const c = state.tick % CELLS
  const out = new Array(CELLS)
  for (let j = 0; j < CELLS; j++) {
    let s = wrap(c - j)
    if (s === 0) s = CELLS
    out[j] = state.ring[s - 1]
  }
  return out
}

export function freshCount(state) {
  return state.tick % CELLS
}

const nibble = (v) => [bit(v, 0), bit(v, 1), bit(v, 2), bit(v, 3)]

export function readLabels(state) {
  const r = readBoard(state)
  const [sp0, sp1, sp2, sp3] = nibble(r.col)
  const [zl0, zl1, zl2, zl3] = nibble(r.row)
  const p = r.parts
  const m = r.mask
  const x = r.mux

  const sheets = [
    {
      id: 'clock',
      name: 'Clock',
      parts: [
        {
          id: 'U36',
          name: 'U36 NE555 astable',
          nets: [{ name: 'CLK', v: true, note: 'one pulse per step' }],
        },
      ],
    },
    {
      id: 'reset',
      name: 'Reset',
      parts: [
        {
          id: 'U37',
          name: 'U37 reset button and inverter',
          nets: [
            { name: 'CLEAR', v: false },
            { name: 'CLEAR_N', v: true, note: 'high means not clearing' },
          ],
        },
      ],
    },
    {
      id: 'counter',
      name: 'Counter',
      parts: [
        {
          id: 'U1',
          name: 'U1 74HC192 column counter',
          nets: [
            { name: 'SP0', v: sp0 },
            { name: 'SP1', v: sp1 },
            { name: 'SP2', v: sp2 },
            { name: 'SP3', v: sp3 },
            { name: 'SP_UEBERLAUF_N', v: !(r.col === 9), note: 'low on the jump from 9 to 0' },
          ],
        },
        {
          id: 'U2',
          name: 'U2 74HC192 row counter',
          nets: [
            { name: 'ZL0', v: zl0 },
            { name: 'ZL1', v: zl1 },
            { name: 'ZL2', v: zl2 },
            { name: 'ZL3', v: zl3 },
          ],
        },
        {
          id: 'mask-sp',
          name: 'U70 U71 U9 U8 U68 is the column on the edge',
          nets: [
            { name: 'SP_A', v: m.spA },
            { name: 'SP_B', v: m.spB },
            { name: 'SP_IST_0', v: m.spIst0 },
            { name: 'SP_IST_9', v: m.spIst9 },
            { name: 'SP_RAND', v: m.spRand },
          ],
        },
        {
          id: 'mask-zl',
          name: 'U72 U73 U4 U5 U69 is the row on the edge',
          nets: [
            { name: 'ZL_A', v: m.zlA },
            { name: 'ZL_B', v: m.zlB },
            { name: 'ZL_IST_0', v: m.zlIst0 },
            { name: 'ZL_IST_9', v: m.zlIst9 },
            { name: 'ZL_RAND', v: m.zlRand },
          ],
        },
        {
          id: 'mask-out',
          name: 'U74 U75 edge mask on the result',
          nets: [
            { name: 'RAND', v: m.rand, note: 'cell sits on the border' },
            { name: 'REGEL_OUT', v: r.Y },
            { name: 'REGEL_OUT_N', v: m.regelOutN },
            { name: 'REGEL_MASKIERT', v: m.regelMaskiert },
          ],
        },
      ],
    },
    {
      id: 'ring',
      name: 'Shift Register Ring',
      parts: [
        {
          id: 'U23',
          name: 'U23 taps at stage 89 90 91',
          nets: [
            { name: 'N0', v: r.n.N0, note: NEIGHBOUR_DIR.N0 },
            { name: 'N1', v: r.n.N1, note: NEIGHBOUR_DIR.N1 },
            { name: 'N2', v: r.n.N2, note: NEIGHBOUR_DIR.N2 },
          ],
        },
        {
          id: 'U24',
          name: 'U24 taps at stage 99 100 101',
          nets: [
            { name: 'N3', v: r.n.N3, note: NEIGHBOUR_DIR.N3 },
            { name: 'alive', v: r.alive, note: 'the cell being worked on' },
            { name: 'N4', v: r.n.N4, note: NEIGHBOUR_DIR.N4 },
          ],
        },
        {
          id: 'U25',
          name: 'U25 taps at stage 109 110 111',
          nets: [
            { name: 'N5', v: r.n.N5, note: NEIGHBOUR_DIR.N5 },
            { name: 'N6', v: r.n.N6, note: NEIGHBOUR_DIR.N6 },
            { name: 'N7', v: r.n.N7, note: NEIGHBOUR_DIR.N7 },
          ],
        },
        {
          id: 'U12',
          name: 'U12 head of the chain',
          nets: [{ name: 'NB', v: r.NB, note: 'gets clocked in at the front' }],
        },
      ],
    },
    {
      id: 'calculator',
      name: 'Rule Logic',
      parts: [
        {
          id: 'FA1',
          name: 'FA1 full adder, N0 N1 N2',
          nets: [
            { name: 's1', v: p.fa1.s, note: 'sum' },
            { name: 'c1', v: p.fa1.c, note: 'carry' },
          ],
        },
        {
          id: 'FA2',
          name: 'FA2 full adder, N3 N4 N5',
          nets: [
            { name: 's2', v: p.fa2.s },
            { name: 'c2', v: p.fa2.c },
          ],
        },
        {
          id: 'HA1',
          name: 'HA1 half adder, N6 N7',
          nets: [
            { name: 's3', v: p.ha1.s },
            { name: 'c3', v: p.ha1.c },
          ],
        },
        {
          id: 'FA3',
          name: 'FA3 full adder, s1 s2 s3',
          nets: [
            { name: 'b0', v: p.b0, note: 'bit 0 of the neighbour count' },
            { name: 'c4', v: p.fa3.c },
          ],
        },
        {
          id: 'FA4',
          name: 'FA4 full adder, c1 c2 c3',
          nets: [
            { name: 's5', v: p.fa4.s },
            { name: 'c5', v: p.fa4.c },
          ],
        },
        {
          id: 'HA2',
          name: 'HA2 half adder, c4 s5',
          nets: [
            { name: 'b1', v: p.b1, note: 'bit 1 of the neighbour count' },
            { name: 'c6', v: p.ha2.c },
          ],
        },
        {
          id: 'U40',
          name: 'U40 NOR, fewer than four',
          nets: [{ name: 'lt4', v: p.lt4 }],
        },
        {
          id: 'U41',
          name: 'U41 OR, b0 or alive',
          nets: [{ name: 'or1', v: p.or1 }],
        },
        {
          id: 'U43',
          name: 'U43 AND, lt4 and b1',
          nets: [{ name: 't1', v: p.t1 }],
        },
        {
          id: 'U42',
          name: 'U42 AND, the verdict',
          nets: [{ name: 'Y', v: r.Y, note: r.Y ? 'cell will live' : 'cell will die' }],
        },
      ],
    },
    {
      id: 'mux',
      name: 'Run / Edit Mux',
      parts: [
        {
          id: 'U26',
          name: 'U26 74HC74 run toggle',
          nets: [{ name: 'RUN', v: x.run }],
        },
        {
          id: 'U27',
          name: 'U27 NOR used as inverter',
          nets: [{ name: 'RUN_N_GATE', v: x.runNGate }],
        },
        {
          id: 'U28',
          name: 'U28 AND, rule path',
          nets: [{ name: 'TEMP_A', v: x.tempA }],
        },
        {
          id: 'U29',
          name: 'U29 AND, button path',
          nets: [{ name: 'TEMP_B', v: x.tempB }],
        },
        {
          id: 'U30',
          name: 'U30 OR, picks the winner',
          nets: [{ name: 'NB', v: r.NB }],
        },
      ],
    },
    {
      id: 'buttons',
      name: 'Button Matrix',
      parts: [
        {
          id: 'U10',
          name: 'U10 4514 row decoder',
          nets: [{ name: 'TZEILE' + r.row, v: true, note: 'row ' + r.row + ' driven high' }],
        },
        {
          id: 'U11',
          name: 'U11 4067 column mux',
          nets: [
            { name: 'TSPALTE' + r.col, v: false, note: 'column ' + r.col + ' selected' },
            { name: 'TASTE_AKTIV', v: x.tasteAktiv, note: 'ignored while RUN is 1' },
          ],
        },
      ],
    },
    {
      id: 'display',
      name: 'Display',
      parts: [
        {
          id: 'U31',
          name: 'U31 U32 74HC595 column register',
          nets: [
            { name: 'ALIVE', v: r.alive, note: 'shifted in every clock' },
            { name: 'SP_UEBERLAUF_N', v: !(r.col === 9), note: 'latches a finished row' },
          ],
        },
        {
          id: 'U35',
          name: 'U35 4028 row decoder',
          nets: [{ name: 'DZEILE' + r.row, v: true }],
        },
        {
          id: 'U33',
          name: 'U33 U34 ULN2003 row drivers',
          nets: [{ name: 'MZEILE' + r.row, v: true, note: 'this row is lit right now' }],
        },
      ],
    },
  ]

  return { ...r, sheets }
}
export function flatten(labels) {
  const map = {}
  for (const sheet of labels.sheets) {
    for (const part of sheet.parts) {
      for (const net of part.nets) {
        map[sheet.id + '/' + part.id + '/' + net.name] = net.v
      }
    }
  }
  return map
}

export function diffLabels(prev, next) {
  if (!prev) return []
  const a = flatten(prev)
  const b = flatten(next)
  const out = []
  for (const sheet of next.sheets) {
    for (const part of sheet.parts) {
      const changed = part.nets
        .filter((net) => {
          const key = sheet.id + '/' + part.id + '/' + net.name
          return !(key in a) || a[key] !== b[key]
        })
        .map((net) => {
          const key = sheet.id + '/' + part.id + '/' + net.name
          return { name: net.name, from: key in a ? a[key] : null, to: net.v, note: net.note }
        })
      if (changed.length) {
        out.push({ sheet: sheet.id, sheetName: sheet.name, part: part.name, nets: changed })
      }
    }
  }
  return out
}