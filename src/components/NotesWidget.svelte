<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getSortedNotes, addNote, updateNote, deleteNote, setNoteColor, setNoteStatus, toggleNotePin } from '../stores/notes.svelte';
  import { getSettings, setNotesDisplayMode } from '../stores/settings.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import type { NoteColor, NoteStatus, NotesDisplayMode } from '../types';
  import { NOTE_COLOR_MAP, NOTE_COLORS } from '../types';

  let newText = $state('');
  let editingId = $state<string | null>(null);
  let editText = $state('');
  let selectedId = $state<string>('');
  let colorMenuId = $state<string | null>(null);
  let modeMenuOpen = $state(false);

  const notes = $derived(getSortedNotes());
  const currentMode = $derived(getSettings().notesDisplayMode);
  const isPro = $derived(getIsPro());

  // 免费用户强制回退到非 colorful 模式
  const displayMode = $derived(
    currentMode === 'colorful' && !isPro ? 'structured' : currentMode
  );

  function handleSubmit(e: Event) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    addNote(text);
    newText = '';
  }

  function startEdit(id: string, text: string) {
    editingId = id;
    editText = text;
  }

  function saveEdit(id: string) {
    const text = editText.trim();
    if (text) updateNote(id, text); else deleteNote(id);
    editingId = null;
    editText = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { editingId = null; editText = ''; colorMenuId = null; modeMenuOpen = false; }
    if (e.key === 'Enter' && editingId && editText.trim()) saveEdit(editingId);
  }

  function selectNote(id: string) {
    selectedId = id;
  }

  function cycleStatus(id: string, current: NoteStatus) {
    const next: Record<NoteStatus, NoteStatus> = { normal: 'important', important: 'done', done: 'normal' };
    setNoteStatus(id, next[current]);
  }

  function switchMode(mode: NotesDisplayMode) {
    if (mode === 'colorful' && !isPro) {
      alert(t('note.proRequired'));
      return;
    }
    setNotesDisplayMode(mode);
    modeMenuOpen = false;
  }

  function noteDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const fmt = (n: number) => String(n).padStart(2, '0');
    if (sameDay) return `${fmt(d.getHours())}:${fmt(d.getMinutes())}`;
    const sameYear = d.getFullYear() === now.getFullYear();
    if (sameYear) return `${d.getMonth() + 1}/${d.getDate()}`;
    return `${d.getFullYear() % 100}/${d.getMonth() + 1}/${d.getDate()}`;
  }

  function statusIcon(s: NoteStatus): string {
    return s === 'done' ? '✅' : s === 'important' ? '⚡' : '•';
  }

  function statusLabel(s: NoteStatus): string {
    return s === 'done' ? t('note.statusDone') : s === 'important' ? t('note.statusImportant') : t('note.statusNormal');
  }

  const selectedNote = $derived(notes.find((n) => n.id === selectedId) || null);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="notes-section">
  <!-- 头部：标题 + 输入框 + 模式切换 -->
  <div class="notes-topbar">
    <span class="notes-title">📝 {t('note.title')}</span>

    <form class="notes-add-form" onsubmit={handleSubmit}>
      <input
        class="notes-add-input"
        type="text"
        bind:value={newText}
        placeholder={t('note.placeholder')}
        autocomplete="off"
      />
      <button type="submit" class="notes-add-btn" disabled={!newText.trim()}>+</button>
    </form>

    <!-- 模式切换 -->
    <div class="mode-switch">
      <button class="mode-toggle" onclick={() => modeMenuOpen = !modeMenuOpen} title={t('note.mode')}>
        {displayMode === 'colorful' ? '🎨' : displayMode === 'structured' ? '📋' : '📃'}
      </button>
      {#if modeMenuOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="mode-menu" role="menu">
          <button class="mode-option" class:active={displayMode === 'structured'}
            onclick={() => switchMode('structured')}>📋 {t('note.modeStructured')}</button>
          <button class="mode-option" class:active={displayMode === 'list'}
            onclick={() => switchMode('list')}>📃 {t('note.modeList')}</button>
          <button class="mode-option pro-option" class:active={displayMode === 'colorful'}
            disabled={!isPro}
            onclick={() => switchMode('colorful')}>
            🎨 {t('note.modeColorful')}{!isPro ? ' 🔒' : ''}
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- 空状态 -->
  {#if notes.length === 0}
    <div class="notes-empty">{t('note.empty')}</div>
  {:else}

    <!-- ========== 方案A：彩色便签卡 (Pro) ========== -->
    {#if displayMode === 'colorful'}
      <div class="notes-colorful">
        {#each notes as item (item.id)}
          {@const c = NOTE_COLOR_MAP[item.color]}
          <div
            class="colorful-card"
            style="background-color: {c.bg}; border-color: {c.border}; color: {c.text};"
            class:editing={editingId === item.id}
            class:pinned={item.pinned}
          >
            <!-- 折角 -->
            <div class="fold-corner" style="border-right-color: {c.border}; border-bottom-color: {c.border};"></div>

            <!-- 状态点 -->
            <button class="status-dot" style="color: {c.text}; opacity: 0.6;"
              title={statusLabel(item.status)}
              onclick={(e) => { e.stopPropagation(); cycleStatus(item.id, item.status); }}>
              {statusIcon(item.status)}
            </button>

            {#if editingId === item.id}
              <!-- svelte-ignore a11y_autofocus -->
              <input class="colorful-edit" type="text" bind:value={editText}
                onblur={() => saveEdit(item.id)}
                onkeydown={(e) => { if (e.key === 'Enter') saveEdit(item.id); }}
                autofocus autocomplete="off" style="color: {c.text};" />
            {:else}
              <p class="colorful-text" ondblclick={() => startEdit(item.id, item.text)}>{item.text}</p>
            {/if}

            <div class="colorful-foot">
              <span class="colorful-date">{noteDate(item.createdAt)}</span>
              <div class="colorful-actions">
                <!-- 换色 -->
                <button class="tiny-btn" title={t('note.color')}
                  onclick={(e) => { e.stopPropagation(); colorMenuId = colorMenuId === item.id ? null : item.id; }}>
                  🎨
                </button>
                {#if colorMenuId === item.id}
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div class="color-picker-popup" role="menu" tabindex="-1"
                    onclick={(e) => e.stopPropagation()}
                    onkeydown={() => {}}>
                    {#each NOTE_COLORS as cl}
                      {@const cm = NOTE_COLOR_MAP[cl]}
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <button class="color-swatch" style="background-color: {cm.bg}; border-color: {cm.border};"
                        class:selected={item.color === cl}
                        title={cl}
                        onclick={() => { setNoteColor(item.id, cl); colorMenuId = null; }}
                        onkeydown={() => {}}></button>
                    {/each}
                  </div>
                {/if}
                <button class="tiny-btn" title={item.pinned ? t('note.unpin') : t('note.pin')}
                  onclick={(e) => { e.stopPropagation(); toggleNotePin(item.id); }}>
                  📌
                </button>
                <button class="tiny-btn del" title={t('common.delete')}
                  onclick={(e) => { e.stopPropagation(); deleteNote(item.id); }}>
                  ×
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

    <!-- ========== 方案B：结构化卡片 (Free) ========== -->
    {:else if displayMode === 'structured'}
      <div class="notes-structured">
        {#each notes as item (item.id)}
          <div class="struct-card" class:editing={editingId === item.id} class:pinned={item.pinned}
            class:done={item.status === 'done'}>
            <!-- 左侧色条 + 状态 -->
            <div class="struct-left">
              <button class="struct-color-dot" style="background-color: {NOTE_COLOR_MAP[item.color].bg}; border-color: {NOTE_COLOR_MAP[item.color].border};"
                title={statusLabel(item.status)}
                onclick={(e) => { e.stopPropagation(); cycleStatus(item.id, item.status); }}>
                {statusIcon(item.status)}
              </button>
            </div>

            <div class="struct-body">
              {#if editingId === item.id}
                <!-- svelte-ignore a11y_autofocus -->
                <input class="struct-edit" type="text" bind:value={editText}
                  onblur={() => saveEdit(item.id)}
                  onkeydown={(e) => { if (e.key === 'Enter') saveEdit(item.id); }}
                  autofocus autocomplete="off" />
              {:else}
                <p class="struct-text" ondblclick={() => startEdit(item.id, item.text)}>{item.text}</p>
              {/if}

              <div class="struct-meta">
                <span class="struct-status-chip" class:important={item.status === 'important'} class:done={item.status === 'done'}>
                  {statusLabel(item.status)}
                </span>
                <span class="struct-date">{noteDate(item.createdAt)}</span>
              </div>
            </div>

            <div class="struct-right">
              <button class="tiny-btn" title={item.pinned ? t('note.unpin') : t('note.pin')}
                onclick={(e) => { e.stopPropagation(); toggleNotePin(item.id); }}>
                📌
              </button>
              <button class="tiny-btn" title={t('note.edit')}
                onclick={() => startEdit(item.id, item.text)}>
                ✏️
              </button>
              <button class="tiny-btn del" title={t('common.delete')}
                onclick={(e) => { e.stopPropagation(); deleteNote(item.id); }}>
                ×
              </button>
            </div>
          </div>
        {/each}
      </div>

    <!-- ========== 方案C：列表+预览 (Free) ========== -->
    {:else if displayMode === 'list'}
      <div class="notes-list-layout">
        <!-- 左侧列表 -->
        <div class="list-sidebar">
          {#each notes as item (item.id)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="list-item"
              class:selected={selectedId === item.id}
              class:pinned={item.pinned}
              class:done={item.status === 'done'}
              role="button" tabindex="0"
              onclick={() => selectNote(item.id)}
              onkeydown={(e) => { if (e.key === 'Enter') selectNote(item.id); }}>
              <span class="list-color-dot" style="background-color: {NOTE_COLOR_MAP[item.color].border};"></span>
              <span class="list-item-text">{item.text.length > 28 ? item.text.slice(0, 28) + '…' : item.text}</span>
              {#if item.pinned}<span class="list-pin-mark">📌</span>{/if}
            </div>
          {/each}
        </div>

        <!-- 右侧预览 -->
        <div class="list-preview">
          {#if selectedNote}
            <div class="preview-header">
              <span class="preview-status" style="background-color: {NOTE_COLOR_MAP[selectedNote.color].bg}; border-color: {NOTE_COLOR_MAP[selectedNote.color].border};">
                {statusLabel(selectedNote.status)}
              </span>
              <span class="preview-date">{noteDate(selectedNote.createdAt)}</span>
            </div>

            {#if editingId === selectedNote.id}
              <!-- svelte-ignore a11y_autofocus -->
              <textarea class="preview-edit" bind:value={editText}
                onblur={() => saveEdit(selectedNote.id)}
                onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(selectedNote.id); } }}
                autofocus autocomplete="off"></textarea>
            {:else}
              <p class="preview-text" ondblclick={() => startEdit(selectedNote.id, selectedNote.text)}>{selectedNote.text}</p>
            {/if}

            <div class="preview-actions">
              <button class="action-btn" onclick={() => cycleStatus(selectedNote.id, selectedNote.status)}>
                {statusIcon(selectedNote.status)} {statusLabel(selectedNote.status)}
              </button>
              <button class="action-btn" onclick={() => toggleNotePin(selectedNote.id)}>
                📌 {selectedNote.pinned ? t('note.unpin') : t('note.pin')}
              </button>
              <button class="action-btn" onclick={() => startEdit(selectedNote.id, selectedNote.text)}>
                ✏️ {t('note.edit')}
              </button>
              <button class="action-btn del" onclick={() => { selectedId = ''; deleteNote(selectedNote.id); }}>
                🗑 {t('common.delete')}
              </button>
            </div>
          {:else}
            <p class="preview-placeholder">{notes.length > 0 ? t('note.selectHint') : t('note.empty')}</p>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .notes-section {
    width: 100%;
    margin: 20px auto;
    max-width: 800px;
    padding: 0 24px;
  }

  /* ====== 顶部栏 ====== */
  .notes-topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .notes-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #e2e8f0);
    opacity: 0.85;
    white-space: nowrap;
  }
  .notes-add-form {
    display: flex;
    flex: 1;
    gap: 6px;
  }
  .notes-add-input {
    flex: 1;
    padding: 7px 12px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
    border-radius: 10px;
    background: var(--input-bg, rgba(255,255,255,0.06));
    color: var(--text-color, #e2e8f0);
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }
  .notes-add-input:focus { border-color: #3b82f6; }
  .notes-add-input::placeholder { opacity: 0.35; }
  .notes-add-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 10px;
    background: #3b82f6;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .notes-add-btn:disabled { opacity: 0.3; cursor: default; }

  /* 模式切换 */
  .mode-switch { position: relative; }
  .mode-toggle {
    width: 32px;
    height: 32px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    border-radius: 10px;
    background: var(--input-bg, rgba(255,255,255,0.06));
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s;
  }
  .mode-toggle:hover { border-color: #3b82f6; }
  .mode-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: 100;
    background: var(--card-bg, #1e293b);
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    border-radius: 12px;
    padding: 4px;
    min-width: 180px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .mode-option {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--text-color, #e2e8f0);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
  }
  .mode-option:hover { background: var(--hover-bg, rgba(255,255,255,0.06)); }
  .mode-option.active { background: rgba(59,130,246,0.12); color: #3b82f6; }
  .mode-option.pro-option:disabled { opacity: 0.4; cursor: not-allowed; }

  .notes-empty {
    text-align: center;
    padding: 32px;
    font-size: 13px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.35;
  }

  /* ====== 通用小组件 ====== */
  .tiny-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 4px;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
  }
  .tiny-btn.del:hover { color: #ef4444; }

  /* ========== 方案A：彩色便签卡 ========== */
  .notes-colorful {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .colorful-card {
    position: relative;
    border: 1px solid;
    border-radius: 4px;
    padding: 14px 14px 10px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 1px 2px 6px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    min-height: 100px;
  }
  .colorful-card:hover {
    transform: translateY(-2px) rotate(0deg);
    box-shadow: 2px 4px 12px rgba(0,0,0,0.12);
  }
  .colorful-card:nth-child(odd) { transform: rotate(-1deg); }
  .colorful-card:nth-child(even) { transform: rotate(0.5deg); }
  .colorful-card:nth-child(3n) { transform: rotate(1deg); }
  .colorful-card:hover { transform: translateY(-2px) rotate(0deg) !important; }
  .colorful-card.pinned { box-shadow: 2px 3px 8px rgba(59,130,246,0.15); }

  .fold-corner {
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 16px 16px 0;
    border-color: transparent var(--card-border, #f9e076) transparent transparent;
    border-right-color: inherit;
    opacity: 0.5;
  }

  .status-dot {
    position: absolute;
    top: 6px;
    left: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    padding: 0;
  }

  .colorful-text {
    font-size: 14px;
    line-height: 1.6;
    margin: 8px 0 0;
    word-break: break-word;
    white-space: pre-wrap;
    flex: 1;
    cursor: default;
  }
  .colorful-edit {
    width: 100%;
    padding: 6px 0;
    margin-top: 6px;
    border: none;
    border-bottom: 1px dashed currentColor;
    background: transparent;
    font-size: 14px;
    outline: none;
    font-family: inherit;
    flex: 1;
  }

  .colorful-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
    position: relative;
  }
  .colorful-date {
    font-size: 10px;
    opacity: 0.55;
  }
  .colorful-actions {
    display: flex;
    align-items: center;
    gap: 1px;
  }
  .colorful-card:hover .tiny-btn { opacity: 0.5; }
  .colorful-card .tiny-btn:hover { opacity: 1 !important; }

  .color-picker-popup {
    position: absolute;
    bottom: 100%;
    right: 0;
    display: flex;
    gap: 4px;
    background: var(--card-bg, #fff);
    border: 1px solid var(--card-border, rgba(0,0,0,0.1));
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    z-index: 10;
    margin-bottom: 4px;
  }
  .color-swatch {
    width: 22px;
    height: 22px;
    border: 2px solid;
    border-radius: 6px;
    cursor: pointer;
    padding: 0;
    transition: transform 0.12s;
  }
  .color-swatch:hover { transform: scale(1.2); }
  .color-swatch.selected { box-shadow: 0 0 0 2px #3b82f6; }

  /* ========== 方案B：结构化卡片 ========== */
  /* 桌面端：2列水平网格 */
  .notes-structured {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .struct-card.pinned {
    border-left: none;
    border-top: 2px solid #3b82f6;
  }
  /* 窄屏回退竖排 */
  @media (max-width: 800px) {
    .notes-structured {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .struct-card.pinned {
      border-top: none;
      border-left: 2px solid #3b82f6;
    }
  }
  .struct-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: var(--card-bg, rgba(255,255,255,0.04));
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
    border-radius: 12px;
    transition: all 0.15s;
  }
  .struct-card:hover {
    border-color: rgba(59,130,246,0.2);
    background: var(--hover-bg, rgba(255,255,255,0.06));
  }
  .struct-card:hover .tiny-btn { opacity: 0.4; }
  .struct-card .tiny-btn:hover { opacity: 1 !important; }
  .struct-card.done { opacity: 0.6; }
  .struct-card.done .struct-text { text-decoration: line-through; }
  /* pinned 样式由上方 grid/mobile 规则单独控制 */

  .struct-left {
    flex-shrink: 0;
    padding-top: 2px;
  }
  .struct-color-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.12s;
    background: none;
  }
  .struct-color-dot:hover { transform: scale(1.15); }

  .struct-body {
    flex: 1;
    min-width: 0;
  }
  .struct-text {
    font-size: 13px;
    line-height: 1.55;
    color: var(--text-color, #e2e8f0);
    margin: 0 0 6px;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .struct-edit {
    width: 100%;
    padding: 6px 8px;
    margin-bottom: 6px;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text-color);
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
  }
  .struct-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .struct-status-chip {
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 8px;
    background: rgba(255,255,255,0.1);
    color: var(--text-color, #e2e8f0);
    opacity: 0.65;
  }
  .struct-status-chip.important { background: rgba(251, 191, 36, 0.15); color: #fbbf24; opacity: 1; }
  .struct-status-chip.done { background: rgba(52, 211, 153, 0.15); color: #34d399; opacity: 1; }
  .struct-date {
    font-size: 10px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.45;
  }
  .struct-right {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  /* ========== 方案C：列表+预览 ========== */
  .notes-list-layout {
    display: flex;
    gap: 0;
    border: 1px solid var(--card-border, rgba(255,255,255,0.06));
    border-radius: 14px;
    overflow: hidden;
    min-height: 200px;
    max-height: 500px;
  }
  .list-sidebar {
    width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    border-right: 1px solid var(--card-border, rgba(255,255,255,0.06));
    background: var(--input-bg, rgba(255,255,255,0.02));
  }
  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.04));
    transition: background 0.12s;
    font-size: 13px;
    color: var(--text-color, #e2e8f0);
  }
  .list-item:hover { background: var(--hover-bg, rgba(255,255,255,0.04)); }
  .list-item.selected { background: rgba(59,130,246,0.1); border-left: 2px solid #3b82f6; }
  .list-item.done { opacity: 0.5; }
  .list-color-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .list-item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .list-pin-mark { font-size: 10px; flex-shrink: 0; }

  .list-preview {
    flex: 1;
    padding: 16px 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .preview-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .preview-status {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 8px;
    border: 1px solid;
    color: var(--text-color, #e2e8f0);
    opacity: 0.7;
  }
  .preview-date {
    font-size: 11px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.5;
  }
  .preview-text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-color, #e2e8f0);
    white-space: pre-wrap;
    word-break: break-word;
    flex: 1;
    margin: 0;
  }
  .preview-edit {
    width: 100%;
    flex: 1;
    padding: 10px;
    border: 1px solid #3b82f6;
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-color);
    font-size: 14px;
    line-height: 1.7;
    font-family: inherit;
    outline: none;
    resize: none;
    box-sizing: border-box;
  }
  .preview-placeholder {
    text-align: center;
    color: var(--text-color, #e2e8f0);
    opacity: 0.3;
    font-size: 13px;
    padding: 40px 0;
  }
  .preview-actions {
    display: flex;
    gap: 6px;
    margin-top: 14px;
    flex-wrap: wrap;
    border-top: 1px solid var(--card-border, rgba(255,255,255,0.06));
    padding-top: 12px;
  }
  .action-btn {
    padding: 5px 10px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.1));
    border-radius: 8px;
    background: var(--input-bg, rgba(255,255,255,0.04));
    color: var(--text-color, #e2e8f0);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.12s;
  }
  .action-btn:hover { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
  .action-btn.del:hover { border-color: #ef4444; color: #ef4444; }
</style>
