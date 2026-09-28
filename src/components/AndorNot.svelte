<script>
 import GateCard from '../lib/GateCard.svelte'
 import andImg from '../assets/and.png'
 import orImg from '../assets/or.png'
 import notImg from '../assets/not.png'
</script>

<p>
Three gates are enugh to build everything on thins board. every other gate you will meet later is just
these three wired together in a diferent order. Clcik the button under each picture to set
the inputs and watch which row of the table you land on.
</p>

<h2>AND</h2>

<p>
The AND gate says yes only when both of its inputs say yes. One input low is enough to hold the 
output at 0. Think of two switches in a row: the current only gets through if both are closed.
whenever you want something to happen only under two conditions at the same time, this is the part 
you reach for 
</p>

<GateCard
src ={andImg}
alt="AND gate in kicad a 74AHC1G08 with inputs a and b"
inputs={['a', 'b']}
fn = {(v) => v.a && v.b}
/>

<p>
the chip is a 74AHC1G08. Pin 1 and 2 are the inputs, pin 4 is the output and 5 and 3 are 
power and ground. those last two are not part of the logic, the gate just needs them to live. most
drawings in the rest of this leave them out to keep thinks readable
</p>

<h2>OR</h2>
<p>
the or gate is the relaxed one. it outputs 1 as soon as at least one input is 1, and it doas not
care if both are. Only the case where everything is 0 gives a 0. two switches side by side this 
time, either one closed is enough for the current to pass.
</p>

<GateCard
 src={orImg}
 alt="OR gate in kicad, a 74AHC1G32 with inputs a and b"
 inputs={['a', 'b']}
 fn={(v) => v.a || v.b}
/>

<p>
notice that it has a diverent shape than the and gate it is curved and has a oiunted nose if the back is flat
and the nose js round it means and so you can read the shematic by the siluette alone once you have seen a few which is exactly 
what you will be doing in the future
</p>

<h2>Inverter</h2>

<p>
the inverter, also called Not, is the simplest of the three one input and one output and it just
flips the valure a 1 goes in a 0 comes out that sounds usless at first but you can combine logic gates
and then it is probaply one of the most inportant ones you will se that on the bigger sheets later
</p>

<GateCard
src={notImg}
alt="inverter in kicad, one gate of a 74HC04"
inputs={['a']}
fn={(v) => !v.a}
/>

<p>
the little circle on the output is important part of the symbol. that circle always means
inverted, and you will see it stuck onto other gates too. a triangle on its own would just be a
buffer which passes the signal through unchanged
</p>

<h2> that was our whole box of gates</h2>

<p>
and or and not. every rule this machine follows, counting neighbours, deciding life and death,
keeping track of which cell is being worked on, is build out of these three the next page shows how 
they get combined the other gates you will see in the next schemetic
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