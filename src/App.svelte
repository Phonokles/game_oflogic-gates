<script>
  import { sections } from  './data.js'
  import WhatAreGates from  './components/WhatAreGates.svelte'
  import AndOrNot from      './components/AndorNot.svelte'
  import AllotherGates from './components/AllotherGates.svelte'
  import FullSimulation from './components/FullSimulation.svelte'
  const views = {
    'what-are-gates': WhatAreGates,
    'and-or-not': AndOrNot,
    'all-other-gates': AllotherGates,
    'simulation': FullSimulation,
  }

  const pages = []
  sections.forEach((section, si) => {
    section.children.forEach((child, ci) => {
      pages.push({
        id: child.id,
        label: child.label,
        section: section.label,
        no: (si + 1) + '.' + (ci + 1)
      })
    })
  })

  let index = -1

  $: current = index >= 0 ? pages[index] : null

  function go(i) {
    if (i < -1 || i >= pages.length) return
    index = i
    document.querySelector('.content')?.scrollTo(0, 0)
  }

  function openPage(id) {
    go(pages.findIndex(p => p.id === id))
  }

  function onKey(e) {
    if (e.target.tagName === 'INPUT') return
    if (e.key === 'ArrowLeft') go(index - 1)
    if (e.key === 'ArrowRight') go(index + 1)
  }
</script>

<svelte:window on:keydown={onKey} />

<div class="layout">
  <aside class="sidebar">
    <button class="entry root" class:on={index === -1} on:click={() => go(-1)}>
      Game of Logic Gates
    </button>

    {#each sections as section, si}
      <div class="chapter">
        <span class="no">{si + 1}.</span>
        <span>{section.label}</span>
      </div>
      {#each section.children as child, ci}
        <button
          class="entry sub"
          class:on={current?.id === child.id}
          on:click={() => openPage(child.id)}
        >
          <span class="no">{si + 1}.{ci + 1}.</span>
          <span>{child.label}</span>
        </button>
      {/each}
    {/each}

    <div class="pad"></div>
  </aside>

  <div class="main">
    <header class="topbar">
      <span class="topbar-title">Game of Logic Gates</span>
    </header>

    <button class="nav prev" disabled={index <= -1} on:click={() => go(index - 1)} aria-label="previous">
      &#10094;
    </button>
    <button class="nav next" disabled={index >= pages.length - 1} on:click={() => go(index + 1)} aria-label="next">
      &#10095;
    </button>

    <div class="content">
      <article>
        {#if current}
          <h1>{current.label}</h1>
          {#if views[current.id]}
            <svelte:component this={views[current.id]} />
          {:else}
            <div class="placeholder">construction</div>
          {/if}
        {:else}
          <h1>Game of Logic Gates</h1>
          <p>conways game of life only build with logic gates
            <br> that means no code or any micro controlers<br><br>
            so this website will show you how it all works with sims.
          </p>
        {/if}
      </article>
    </div>
  </div>
</div>

<style>
  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar {
    width: 300px;
    min-width: 300px;
    background: var(--sidebar-bg);
    overflow-y: auto;
    padding: 10px 0 0;
    font-size: 14px;
  }

  .chapter {
    display: flex;
    gap: 8px;
    padding: 9px 20px 4px;
    color: var(--sidebar-fg);
    font-weight: 700;
  }

  .entry {
    display: flex;
    gap: 8px;
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    padding: 6px 20px;
    font-size: 14px;
    color: var(--sidebar-fg);
    cursor: pointer;
    line-height: 1.5;
  }

  .entry.sub {
    padding-left: 34px;
  }

  .entry:hover {
    color: #fff;
  }

  .entry.on {
    color: var(--sidebar-active);
    font-weight: 600;
  }

  .no {
    font-weight: 700;
    flex-shrink: 0;
  }

  .root {
    margin-bottom: 4px;
  }

  .pad {
    height: 40px;
  }

  .main {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .topbar {
    height: 50px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .topbar-title {
    font-size: 18px;
    color: var(--fg-faint);
  }

  .nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--icons);
    font-size: 32px;
    line-height: 1;
    padding: 20px 16px;
    cursor: pointer;
    z-index: 2;
  }

  .nav:hover:not(:disabled) {
    color: var(--icons-hover);
  }

  .nav:disabled {
    opacity: 0.2;
    cursor: default;
  }

  .prev {
    left: 10px;
  }

  .next {
    right: 10px;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 0 90px 140px;
  }

  article {
    max-width: 750px;
    margin: 0 auto;
    padding-top: 20px;
  }

  h1 {
    font-size: 32px;
    line-height: 1.3;
    margin-bottom: 26px;
  }

  p {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 18px;
  }

  .placeholder {
    margin-top: 10px;
    padding: 56px;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--fg-faint);
    font-family: var(--code);
    font-size: 14px;
    text-align: center;
  }

</style>