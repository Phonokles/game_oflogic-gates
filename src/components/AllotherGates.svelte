<script>
  import GateCard from '../lib/GateCard.svelte'
  import Shots from '../lib/shot.svelte'
 
  import nandImg from '../assets/nand.png'
  import nandExp from '../assets/nandexp.png'
  import norImg from '../assets/nor.png'
  import norExp from '../assets/norexp.png'
  import xorImg from '../assets/xor.png'
  import xorExp from '../assets/xorexp.png'
  import xnorImg from '../assets/xnor.png'
  import xnorExp from '../assets/xnorexp.png'
</script>
<p>
there are four more gates you will run into on the schmatic. None of them are new in any real
sense. Each one is And, Or and the inverter from the las page glued together in a slightly
different order and then sold as one chip. for every gate below you get the symbol, its table and
a picture of what is actualy going on inside.
</p>

<h2>Nand</h2>

<p>
Nand is And with the answer flipped It outputs 1 almost all the time, and only drops to 0 in the
one case where both inputs are 1. the name is short for not and, and the little circle on the 
output of the symbol is what tells you about the flip.
</p>
<GateCard
src={nandImg}
alt="Nand gate in kicad, a 74AHC1G00"
inputs={['a','b']}
fn={(v) => !(v.a && v.b)}
/>

<Shots
src={nandExp}
alt="an And gate followed by an inverter"
caption="an And gate with an inverter stuck on the output exactly the same behaviour as the single 74AHC1G00
above. just with two chips instead of one"
/>

<p>
this is the pattern for the whole page take a gate, invert the output get a new gate with a new 
name. that circle on the symbole is a inverter that someone drew as a dt to save space.
</p>

<h2>Nor</h2>

<p>
Nor is the same trick as before but applied to or. Or outputs 1 when at least one input is 1, so Nor outputs 1 
only when nothing is on at all. It is the gate that ask are both of these off.
</p>

<GateCard
src={norImg}
alt="Nor gate in kicad, a 74AHC1G02"
inputs={['a', 'b']}
fn={(v) => !(v.a || v.b)}
/>

<Shots
src={norExp}
alt="an OR ate follow by an inverter"
caption="an Or gate plus an inverter. same result as the singel 74AHC1G02"
/>

<p> Nor shows up a lot on this board. look at the counter sheet an you will find nor gate with
    both inputs tied to the same signal, which turns them into a plain inverter. that i a common
    trick when you have a spare gate left over and need an inverter but do not want to place another chip
</p>

<h2>Xor</h2>

<p>
xor is the odd one out and the only one here that is not just some other gate with a dot on it
it outputs 1 when its two inputs are different, and 0 when they are the same. in full version
you call it exclusive or
</p>

<GateCard
src={xorImg}
alt="Xor gate in kicad a 74AHC1G86"
inputs={['a', 'b']}
fn={(v) => v.a !== v.b}
/>

<Shots
src={xorExp}
alt="Xor built from two inverters, two and gates, a Norgate and an inverter"
caption="Xor build out of the three basic gates. five chips for what the 74AHC1G86  doe on its own."
/>
<p>
xor matters more than the others here, because it is the heard of an adder. add two single bit
and the result is one bit of sum and one bit of cary, and that sum bit is precisely a xor. the 
chapter on counting neighbout comes back to this.
</p>

<h2>Xnor</h2>

<p>
annd xor with the answer flipped is xnor. it outputs 1 when both inpts are the same, no matter
whether they are both on or both off, which makes it the gate you use to ask are these two equal.
</p>

<GateCard
sr={xnorImg}
alt="xnor gate in kica, onegate of a 4077"
inputs={['a','b']}
fn={(v) => v.a === v.b}
/>

<Shots
src={xnorExp}
alt="the same circuit as Xor only the last inverter is gone. the nor at the end already delivers the flipped answer"
caption="the same circuit as Xor, only the last inverter is gone. the nor at the end already delivers the flipped answer."
/>

<p>
the symbol is the xor shape with a circle on the output, an the chip in this drawing is a 4077.
that one is drawn a bit differently from the others: it holds four gates in one package so the 
symbol is split into parts and the power pins sit in their own little box labelled U6E off to the 
side. Same chip just carved up so it fits on the sheet
</p>

<h2> why bother with all of them</h2>

<p>
since every one of these can be built from And, or and an inverter, you might wonder why they
exist as chips at all. Space nad speed. every gate you do not place is a chip you do not solder, a 
bit of board you do not use, and a few nanoseconds the signal doas not spend travelling. On a board
that alredy carries a lot of chips, picking the right gate instead of building it out of
three cheaper one add up quickly
</p>

<p>
there is a nice fact hiding in here too. nand on its own is enough to build every other gate,
icluding and, or and the inverter. so is Nor. people have build entire computer out of nothing 
but one kind of gate, purely to prove the poit.
</p>
<style>

p{
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 18px;
}
h2{
    font-size: 20px;
    margin: 36px 0 14px;
}
</style>