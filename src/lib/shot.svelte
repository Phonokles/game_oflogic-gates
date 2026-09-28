<script>
export let src
export let alt =''
export let caption = ''
</script>   
<figure>
<img {src} {alt}/>
{#if caption}
<figcaption>{caption}</figcaption>
{/if}
</figure>
<style>
figure{
    margin: 22px 0 28px,
}
img{
    display: block;
    width: 100%;
}
figcaption{
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--fg-faint);
}
</style>