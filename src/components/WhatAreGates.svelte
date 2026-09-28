<p>
Eyery wire on this board is in one of two states. either there is voltage on it, or ther is not.
there is nothing in between people write these two statementsas 1 and 0, and thats alredy the whole 
alphabet this mashine knows
</p>

<p>
a logic gate is a small part that takes one or two  of those wires as input and drives one wire as
output. It has a fixed rule that also never changes: look at what comes in and decide what goes out. it
has no memory, it doas not know what happened a second ago, and it is not running any program. It
reacts, the way a light swich would react
</p>

<h2>The rule is a table</h2>

<p>
Bacause a wire can only be 0 or 1, there are not many situations a gate cane ver end up in. With 
two inputs there are exactly four. so you can write the complete behavior of a gate as a short
table, and then you know everything about it. here s the and gate, which outputs 1 only wen both
of its inputs are 1:
</p>

<table>
  <thead>
    <tr><th>a</th><th>b</th><th class="out">output</th></tr>
  </thead>
  <tbody>
    <tr><td>0</td><td>0</td><td class="out">0</td></tr>
    <tr><td>0</td><td>1</td><td class="out">0</td></tr>
    <tr><td>1</td><td>0</td><td class="out">0</td></tr>
    <tr><td>1</td><td>1</td><td class="out">1</td></tr>
  </tbody>
</table>
 

<p>
that is it. there is nothing hidden behind the table once you read one of these, you can basicly read
any gate, and the next page goes through the handful of them that exist.
</p>

<h2>but why dont we need more</h2>
<p>
it sounds far too simple to build anything with but you can wire the ourput of one gate into the
input of the next one, and then into the next and going on like that, and the rule start stacking. A few gates together can 
add two number a few more can remember a bit. enogh of them wired in the right order, can play 
conway's game of life on a 10 by 10 grid which is exactly what my board does
</p>

<p>
in real life a gate is a black plastic chip with metal legs, some of them smalle than a grain of
rice. the board ues a lot of them. Nowhere on it is there a processor, a microcontroler or a 
line of code. when you press the start button, no program runs. voltage jsut moves through wires,
and the pattern on the LED is what falls out the other end.
</p>



<style>
  p {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 18px;
  }
 
  h2 {
    font-size: 20px;
    margin: 34px 0 14px;
  }
 
  table {
    border-collapse: collapse;
    font-family: var(--code);
    font-size: 14px;
    margin: 22px 0 26px;
  }
 
  th,
  td {
    border: 1px solid var(--border);
    padding: 6px 18px;
    text-align: center;
    color: var(--fg-faint);
  }
 
  th {
    color: var(--fg);
    font-weight: 600;
  }
 
  .out {
    background: #1b1e1f;
    color: var(--fg-bright);
  }
</style>
