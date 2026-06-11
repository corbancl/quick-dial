<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getNotes, addNote, updateNote, deleteNote } from '../stores/notes.svelte';

  let open = $state(false);
  let editingId = $state<string | null>(null);
  let newText = $state('');

  function toggle() { open = !open; if (!open) { editingId = null; newText = ''; } }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    addNote(text);
    newText = '';
  }

  function startEdit(id: string, text: string) {
    editingId = id;
    newText = text;
  }

  function saveEdit(id: string) {
    const text = newText.trim();
    if (text) updateNote(id, text); else deleteNote(id);
    editingId = null;
    newText = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { editingId = null; newText = ''; open = false; }
    if (e.key === 'Enter' && editingId) saveEdit(editingId);
  }

  function noteDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const fmt = (n: number) => String(n).padStart(2, '0');
    if (sameDay) return `${fmt(d.getHours())}:${fmt(d.getMinutes())}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  const notes = $derived(getNotes());
</script>

<div class="notes-float">
  <!-- 触发按钮 -->
  <button class="notes-trigger" onclick={toggle} title={t('note.title')}>
    <span class="notes-trigger-icon">📝</span>
    {#if notes.length > 0}
      <span class="notes-badge">{notes.length}</span>
    {/if}
  </button>

  <!-- 下拉面板 -->
  {#if open}
    <!-- 点击外部关闭 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="notes-backdrop" role="button" tabindex="-1" onclick={toggle}></div>

    <div class="notes-panel">
      <div class="notes-panel-header">
        <span>{t('note.title')} ({notes.length})</span>
        <button class="notes-close" onclick={toggle}>×</button>
      </div>

      <form class="notes-form" onsubmit={handleSubmit}>
        <input class="notes-input" type="text" bind:value={newText}
          placeholder={t('note.placeholder')} onkeydown={handleKeydown} autocomplete="off" />
      </form>

      <div class="notes-cards">
        {#each notes as item (item.id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="note-card" class:editing={editingId === item.id}
            role="button" tabindex="0"
            onclick={() => !editingId && startEdit(item.id, item.text)}
            onkeydown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !editingId) { e.preventDefault(); startEdit(item.id, item.text); } }}>
            {#if editingId === item.id}
              <!-- svelte-ignore a11y_autofocus -->
              <input class="note-edit-input" type="text" bind:value={newText}
                onblur={() => saveEdit(item.id)}
                onkeydown={(e) => { if (e.key === 'Enter') saveEdit(item.id); handleKeydown(e); }}
                autofocus autocomplete="off" />
            {:else}
              <p class="note-text">{item.text}</p>
            {/if}
            <div class="note-foot">
              <span class="note-date">{noteDate(item.createdAt)}</span>
              <button class="note-del" onclick={(e) => { e.stopPropagation(); deleteNote(item.id); }}>×</button>
            </div>
          </div>
        {/each}

        {#if notes.length === 0}
          <p class="notes-empty">{t('note.empty')}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .notes-float {
    position: relative;
    display: inline-flex;
  }

  .notes-trigger {
    display: flex; align-items: center; gap: 4px;
    background: none; border: none; cursor: pointer;
    font-size: 18px; padding: 2px; position: relative;
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .notes-trigger:hover {
    opacity: 0.9;
  }
  .notes-badge {
    position: absolute;
    top: -4px; right: -6px;
    min-width: 16px; height: 16px;
    padding: 0 4px;
    background: #3b82f6;
    color: white; font-size: 10px; font-weight: 700;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }
  .notes-trigger-icon { line-height: 1; }

  /* 遮罩 */
  .notes-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: transparent;
  }

  /* 面板 */
  .notes-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 1000;
    width: 340px;
    max-height: 400px;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .notes-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 8px;
    font-size: 14px; font-weight: 600;
    color: var(--text-color, #1e293b);
  }
  .notes-close {
    background: none; border: none; font-size: 18px;
    color: var(--text-color, #1e293b); opacity: 0.4; cursor: pointer;
    padding: 0; line-height: 1;
  }
  .notes-close:hover { opacity: 0.8; }

  .notes-form { padding: 0 16px 10px; }
  .notes-input {
    width: 100%; padding: 8px 12px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 10px;
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color, #1e293b);
    font-size: 13px; outline: none; box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .notes-input:focus { border-color: #3b82f6; }
  .notes-input::placeholder { color: var(--text-color, #1e293b); opacity: 0.3; }

  .notes-cards {
    padding: 0 16px 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .note-card {
    background: var(--hover-bg, rgba(0,0,0,0.03));
    border: 1px solid var(--card-border, rgba(0,0,0,0.04));
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
  }
  .note-card:hover { border-color: rgba(59,130,246,0.2); }
  .note-card.editing { border-color: #3b82f6; cursor: default; }

  .note-text {
    font-size: 13px; color: var(--text-color, #1e293b);
    line-height: 1.6; margin: 0 0 6px;
    word-break: break-word; white-space: pre-wrap;
  }
  .note-edit-input {
    width: 100%; padding: 6px 8px; margin-bottom: 6px;
    border: 1px solid #3b82f6; border-radius: 6px;
    background: var(--card-bg); color: var(--text-color, #1e293b);
    font-size: 13px; outline: none; box-sizing: border-box;
  }

  .note-foot {
    display: flex; align-items: center; justify-content: space-between;
  }
  .note-date { font-size: 10px; color: var(--text-color, #1e293b); opacity: 0.3; }
  .note-del {
    background: none; border: none; font-size: 14px; opacity: 0;
    cursor: pointer; padding: 0 2px; line-height: 1;
    color: var(--text-color, #1e293b); transition: opacity 0.15s;
  }
  .note-card:hover .note-del { opacity: 0.3; }
  .note-del:hover { opacity: 0.8 !important; color: #ef4444; }

  .notes-empty {
    text-align: center; font-size: 12px;
    color: var(--text-color, #1e293b); opacity: 0.35;
    padding: 16px 0;
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .notes-panel {
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
  }
</style>
