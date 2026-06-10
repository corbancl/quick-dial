<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getNotes, addNote, updateNote, deleteNote } from '../stores/notes.svelte';

  let collapsed = $state(true);
  let editingId = $state<string | null>(null);
  let newText = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    addNote(text);
    newText = '';
    if (collapsed) collapsed = false;
  }

  function startEdit(id: string, text: string) {
    editingId = id;
    newText = text;
  }

  function saveEdit(id: string) {
    const text = newText.trim();
    if (text) {
      updateNote(id, text);
    } else {
      deleteNote(id);
    }
    editingId = null;
    newText = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (editingId) {
        editingId = null;
        newText = '';
      } else {
        collapsed = true;
      }
    }
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

<div class="notes-widget" class:expanded={!collapsed}>
  {#if collapsed}
    <button class="notes-header" onclick={() => collapsed = false}>
      <span class="notes-icon">📝</span>
      <span class="notes-label">
        {notes.length > 0
          ? `${t('note.title')} · ${notes.length}`
          : t('note.title')}
      </span>
      <span class="notes-chevron">›</span>
    </button>
  {:else}
    <div class="notes-expanded">
      <div class="notes-top">
        <span class="notes-icon">📝</span>
        <span class="notes-label">{t('note.title')}</span>
        <button class="notes-collapse" onclick={() => collapsed = true} title={t('common.close')}>×</button>
      </div>

      <form class="notes-form" onsubmit={handleSubmit}>
        <input
          class="notes-input"
          type="text"
          bind:value={newText}
          placeholder={t('note.placeholder')}
          onkeydown={handleKeydown}
          autocomplete="off"
        />
      </form>

      <div class="notes-grid">
        {#each notes as item (item.id)}
          <div class="note-card" class:editing={editingId === item.id} onclick={() => !editingId && startEdit(item.id, item.text)}>
            {#if editingId === item.id}
              <input
                class="note-edit-input"
                type="text"
                bind:value={newText}
                onblur={() => saveEdit(item.id)}
                onkeydown={(e) => { if (e.key === 'Enter') saveEdit(item.id); handleKeydown(e); }}
                autofocus
                autocomplete="off"
              />
            {:else}
              <p class="note-text">{item.text}</p>
            {/if}
            <div class="note-footer">
              <span class="note-date">{noteDate(item.createdAt)}</span>
              <button
                class="note-delete"
                onclick={(e) => { e.stopPropagation(); deleteNote(item.id); }}
                title={t('common.delete')}
              >×</button>
            </div>
          </div>
        {/each}
      </div>

      {#if notes.length === 0}
        <p class="notes-empty">{t('note.empty')}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .notes-widget {
    max-width: 560px;
    margin: 0 auto 16px;
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 16px;
    padding: 0;
    transition: all 0.2s ease;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .notes-widget.expanded {
    padding: 16px 20px;
    border-color: rgba(59,130,246,0.2);
  }

  .notes-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: none;
    color: var(--text-color, #1e293b);
    font-size: 13px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .notes-header:hover { opacity: 1; }
  .notes-icon { font-size: 15px; }
  .notes-label { flex: 1; text-align: left; font-weight: 500; }
  .notes-chevron { font-size: 16px; opacity: 0.4; }

  .notes-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .notes-top .notes-label { flex: 1; font-size: 14px; font-weight: 600; }
  .notes-collapse {
    background: none; border: none; font-size: 18px;
    color: var(--text-color, #1e293b); opacity: 0.4; cursor: pointer;
    padding: 0 4px; line-height: 1;
  }
  .notes-collapse:hover { opacity: 0.8; }

  .notes-form { margin-bottom: 12px; }
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

  .notes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .note-card {
    background: var(--hover-bg, rgba(0,0,0,0.03));
    border: 1px solid var(--card-border, rgba(0,0,0,0.04));
    border-radius: 12px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    min-height: 64px;
  }
  .note-card:hover {
    border-color: rgba(59,130,246,0.2);
  }
  .note-card.editing {
    border-color: #3b82f6;
    cursor: default;
  }

  .note-text {
    flex: 1;
    font-size: 13px;
    color: var(--text-color, #1e293b);
    line-height: 1.6;
    margin: 0 0 6px;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .note-edit-input {
    flex: 1;
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text-color, #1e293b);
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    margin-bottom: 6px;
  }

  .note-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
  .note-date {
    font-size: 10px;
    color: var(--text-color, #1e293b);
    opacity: 0.3;
  }
  .note-delete {
    background: none; border: none;
    font-size: 14px; opacity: 0; cursor: pointer;
    color: var(--text-color, #1e293b);
    padding: 0 2px; line-height: 1;
    transition: opacity 0.15s;
  }
  .note-card:hover .note-delete { opacity: 0.3; }
  .note-delete:hover { opacity: 0.8 !important; color: #ef4444; }

  .notes-empty {
    text-align: center; font-size: 12px;
    color: var(--text-color, #1e293b); opacity: 0.35;
    padding: 12px 0 4px; margin: 0;
  }
</style>
