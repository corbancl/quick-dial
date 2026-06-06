<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import { getTodos, getActiveCount, addTodo, toggleTodo, deleteTodo, clearDone } from '../stores/todos.svelte';

  let collapsed = $state(true);
  let inputText = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    addTodo(text);
    inputText = '';
    if (collapsed) collapsed = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      inputText = '';
      collapsed = true;
    }
  }

  const todos = $derived(getTodos());
  const activeCount = $derived(getActiveCount());
</script>

<div class="todo-widget" class:expanded={!collapsed}>
  <!-- 折叠状态：一行概要 -->
  {#if collapsed}
    <button class="todo-header" onclick={() => collapsed = false}>
      <span class="todo-icon">📋</span>
      <span class="todo-label">
        {activeCount > 0
          ? `${t('todo.title')} · ${activeCount} ${t('todo.pending')}`
          : t('todo.title')}
      </span>
      <span class="todo-chevron">›</span>
    </button>
  {:else}
    <!-- 展开状态：完整列表 -->
    <div class="todo-expanded">
      <div class="todo-top">
        <span class="todo-icon">📋</span>
        <span class="todo-label">{t('todo.title')}</span>
        <button class="todo-collapse" onclick={() => collapsed = true} title={t('common.close')}>×</button>
      </div>

      <form class="todo-form" onsubmit={handleSubmit}>
        <input
          class="todo-input"
          type="text"
          bind:value={inputText}
          placeholder={t('todo.placeholder')}
          onkeydown={handleKeydown}
          autocomplete="off"
        />
      </form>

      <ul class="todo-list">
        {#each todos as item (item.id)}
          <li class="todo-item" class:done={item.done}>
            <button
              class="todo-check"
              class:checked={item.done}
              onclick={() => toggleTodo(item.id)}
              aria-label={item.done ? t('todo.undo') : t('todo.done')}
            >
              {item.done ? '✓' : ''}
            </button>
            <span class="todo-text" title={item.text}>{item.text}</span>
            <button class="todo-delete" onclick={() => deleteTodo(item.id)} title={t('common.delete')}>
              ×
            </button>
          </li>
        {/each}
      </ul>

      {#if todos.length === 0}
        <p class="todo-empty">{t('todo.empty')}</p>
      {/if}

      {#if todos.some(t => t.done)}
        <button class="todo-clear" onclick={clearDone}>
          {t('todo.clearDone')}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .todo-widget {
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

  .todo-widget.expanded {
    padding: 16px 20px;
    border-color: rgba(59,130,246,0.2);
  }

  /* 折叠头部 */
  .todo-header {
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
  .todo-header:hover {
    opacity: 1;
  }
  .todo-icon {
    font-size: 15px;
  }
  .todo-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }
  .todo-chevron {
    font-size: 16px;
    opacity: 0.4;
    transition: transform 0.2s;
  }

  /* 展开状态 */
  .todo-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .todo-top .todo-label {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
  }
  .todo-collapse {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }
  .todo-collapse:hover { opacity: 0.8; }

  /* 输入框 */
  .todo-form {
    margin-bottom: 8px;
  }
  .todo-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 10px;
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color, #1e293b);
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .todo-input:focus {
    border-color: #3b82f6;
  }
  .todo-input::placeholder {
    color: var(--text-color, #1e293b);
    opacity: 0.3;
  }

  /* 列表 */
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 240px;
    overflow-y: auto;
  }
  .todo-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.03));
    transition: opacity 0.2s;
  }
  .todo-item:last-child {
    border-bottom: none;
  }
  .todo-item.done {
    opacity: 0.4;
  }
  .todo-item.done .todo-text {
    text-decoration: line-through;
  }

  .todo-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--card-border, rgba(0,0,0,0.15));
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: white;
    flex-shrink: 0;
    padding: 0;
    transition: all 0.15s;
  }
  .todo-check:hover {
    border-color: #3b82f6;
  }
  .todo-check.checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .todo-text {
    flex: 1;
    font-size: 13px;
    color: var(--text-color, #1e293b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .todo-delete {
    background: none;
    border: none;
    color: var(--text-color, #1e293b);
    opacity: 0;
    font-size: 16px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    transition: opacity 0.15s;
  }
  .todo-item:hover .todo-delete {
    opacity: 0.3;
  }
  .todo-delete:hover {
    opacity: 0.8 !important;
    color: #ef4444;
  }

  /* 空状态和底部操作 */
  .todo-empty {
    text-align: center;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.35;
    padding: 12px 0 4px;
    margin: 0;
  }
  .todo-clear {
    display: block;
    margin: 8px auto 0;
    background: none;
    border: none;
    color: var(--text-color, #1e293b);
    opacity: 0.35;
    font-size: 11px;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 6px;
    transition: all 0.15s;
  }
  .todo-clear:hover {
    opacity: 0.7;
    background: var(--hover-bg, rgba(0,0,0,0.04));
  }
</style>
