<script lang="ts">
  import { GROUP_ICONS, DEFAULT_GROUP_ICON } from '../utils/groupIcons';

  interface Props {
    icon?: string;
    size?: number;
  }
  let { icon, size = 22 }: Props = $props();

  type Render =
    | { type: 'svg'; path: string }
    | { type: 'fa'; cls: string }
    | { type: 'img'; src: string }
    | { type: 'emoji'; text: string };

  function resolve(v: string | undefined): Render {
    const s = (v || '').trim();
    if (!s) return { type: 'svg', path: GROUP_ICONS[DEFAULT_GROUP_ICON] };
    if (GROUP_ICONS[s]) return { type: 'svg', path: GROUP_ICONS[s] };
    if (s.startsWith('fa-')) return { type: 'fa', cls: s };
    if (/^(https?:)?\/\//.test(s) || s.startsWith('data:')) return { type: 'img', src: s };
    return { type: 'emoji', text: s };
  }

  const r = $derived(resolve(icon));
</script>

{#if r.type === 'svg'}
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={r.path} />
  </svg>
{:else if r.type === 'fa'}
  <i class={r.cls} style="font-size:{size}px;line-height:1"></i>
{:else if r.type === 'img'}
  <img src={r.src} width={size} height={size} alt="" style="object-fit:cover;border-radius:6px;display:block" />
{:else}
  <span style="font-size:{Math.round(size * 0.8)}px;line-height:1">{r.text}</span>
{/if}
