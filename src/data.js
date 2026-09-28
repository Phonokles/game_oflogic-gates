export const sections = [
  {
    id: 'logic-gates',
    label: 'Logic Gates',
    children: [
      { id: 'what-are-gates', label: 'What are logic gates?' },
      { id: 'and-or-not', label: 'AND, OR, NOT' },
      { id: 'all-other-gates', label: 'All other Gates' },
    ]
  },
  {
    id: 'ring',
    label: 'Shift Register Ring',
    children: [
      { id: 'how-the-ring-works', label: 'How the ring works' },
      { id: 'taps', label: 'Taps and the 3x3 window' },
    ]
  },
  {
    id: 'counter',
    label: 'Counter',
    children: [
      { id: 'binary', label: 'Counting in binary' },
      { id: 'row-and-column', label: 'Row and column' },
    ]
  },
  {
    id: 'rule-logic',
    label: 'Rule Logic',
    children: [
      { id: 'gol-rules', label: 'Game of Life rules' },
      { id: 'adder', label: 'Counting neighbours' },
      { id: 'edge-mask', label: 'Edge mask' },
    ]
  },
  {
    id: 'display',
    label: 'Display',
    children: [
      { id: 'multiplexing', label: 'LED multiplexing' },
      { id: 'shift-register', label: '595 shift register' },
    ]
  },
  {
    id: 'all-together',
    label: 'All Together',
    children: [
      { id: 'simulation', label: 'Full simulation' },
    ]
  },
]