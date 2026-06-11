<script lang="ts">
  import { t } from '../utils/i18n.svelte';
  import {
    getSortedTodos, getActiveCount, getTodosByStatus,
    addTodo, toggleTodo, cycleTodoStatus,
    setTodoPriority, setTodoDueDate,
    deleteTodo, clearDone,
  } from '../stores/todos.svelte';
  import { getSettings, setTodoDisplayMode } from '../stores/settings.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import type { TodoFilter, TodoPriority, TodoStatus } from '../types';

  type TodoFilter = 'all' | 'active' | 'done';

  let inputText = $state('');
  let filter = $state<TodoFilter>('active');

  const isPro = $derived(getIsPro());
  const displayMode = $derived(isPro ? getSettings().todoDisplayMode : 'list');

  // 返回列表模式下经过滤排序后的任务
  const sortedTodos = $derived.by(() => getSortedTodos(filter));
  const activeCount = $derived(getActiveCount());

  // 看板模式按状态分组
  const kanbanGroups = $derived.by(() => getTodosByStatus());
  const totalCount = $derived.by(() => Object.values(kanbanGroups).reduce((s, g) => s + g.length, 0));

  function handleSubmit(e: Event) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    addTodo(text);
    inputText = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') inputText = '';
  }

  function toggleMode() {
    if (!isPro) return;
    const next = getSettings().todoDisplayMode === 'list' ? 'kanban' : 'list';
    setTodoDisplayMode(next);
  }

  // 优先级颜色
  function priColor(p: TodoPriority): string {
    return { high: '#ef4444', normal: '#f59e0b', low: '#22c55e' }[p];
  }

  function priLabel(p: TodoPriority): string {
    return { high: t('todo.priorityHigh'), normal: t('todo.priorityNormal'), low: t('todo.priorityLow') }[p];
  }

  // 截止日期显示
  function dueLabel(ts: number | null): { text: string; urgent: boolean } {
    if (!ts) return { text: '', urgent: false };
    const now = new Date();
    const due = new Date(ts);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = today + 86400000;
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();

    if (dueDay < today) return { text: t('todo.dueOverdue'), urgent: true };
    if (dueDay === today) return { text: t('todo.dueToday'), urgent: true };
    if (dueDay === tomorrow) return { text: t('todo.dueTomorrow'), urgent: false };
    return { text: `${due.getMonth() + 1}-${due.getDate()}`, urgent: false };
  }

  function setTodayDue(id: string) {
    const d = new Date();
    setTodoDueDate(id, new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime());
  }

  function setTomorrowDue(id: string) {
    const d = new Date();
    setTodoDueDate(id, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 23, 59, 59).getTime());
  }

  function clearDueDate(id: string) {
    setTodoDueDate(id, null);
  }

  const filterTabs: { key: TodoFilter; label: string }[] = [
    { key: 'all', label: t('todo.filterAll') },
    { key: 'active', label: t('todo.filterActive') },
    { key: 'done', label: t('todo.filterDone') },
  ];

  const statusColumns: { key: TodoStatus; label: string; color: string }[] = [
    { key: 'todo', label: t('todo.statusTodo'), color: '#3b82f6' },
    { key: 'in_progress', label: t('todo.statusInProgress'), color: '#f59e0b' },
    { key: 'done', label: t('todo.statusDone'), color: '#22c55e' },
  ];
</script>

<div class="todo-widget">
  <!-- 头部 -->
  <div class="todo-header">
    <span class="todo-icon">📋</span>
    <span class="todo-title">{t('todo.title')}</span>
    {#if totalCount > 0}
      <span class="todo-count">{activeCount}</span>
    {/if}
    <!-- 模式切换 (Pro) -->
    <button
      class="todo-mode-btn"
      class:pro-only={!isPro}
      onclick={toggleMode}
      title={!isPro ? t('todo.proRequired') : ''}
    >
      {displayMode === 'list' ? '☰' : '▦'}
      {#if !isPro}
        <span class="pro-lock">🔒</span>
      {/if}
    </button>
  </div>

  <!-- 输入框 + 筛选 -->
  <div class="todo-toolbar">
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
    {#if displayMode === 'list'}
      <div class="todo-filters">
        {#each filterTabs as tab}
          <button
            class="filter-tab"
            class:active={filter === tab.key}
            onclick={() => filter = tab.key}
          >{tab.label}</button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 列表模式 -->
  {#if displayMode === 'list'}
    <div class="todo-list-body">
      {#if sortedTodos.length === 0}
        <p class="todo-empty">{t('todo.empty')}</p>
      {:else}
        <div class="todo-grid">
          {#each sortedTodos as item (item.id)}
            {@const due = dueLabel(item.dueDate)}
            <div class="todo-card" class:is-done={item.status === 'done'}>
              <div class="card-row">
                <!-- 完成复选框 -->
                <button
                  class="todo-check"
                  class:checked={item.status === 'done'}
                  onclick={() => toggleTodo(item.id)}
                  title={item.status === 'done' ? t('todo.undo') : t('todo.done')}
                >
                  {item.status === 'done' ? '✓' : ''}
                </button>
                <!-- 文字 -->
                <span class="todo-text" title={item.text}>{item.text}</span>
                <!-- 操作按钮 (hover 显示) -->
                <div class="todo-actions">
                  <!-- 优先级选择 -->
                  <div class="pri-dropdown">
                    <button class="pri-btn" style="color:{priColor(item.priority)}" title={priLabel(item.priority)}>
                      ●
                    </button>
                    <div class="pri-menu">
                      {#each ['high', 'normal', 'low'] as p}
                        <button
                          class="pri-option"
                          class:selected={item.priority === p}
                          style="color:{priColor(p as TodoPriority)}"
                          onclick={() => setTodoPriority(item.id, p as TodoPriority)}
                        >● {priLabel(p as TodoPriority)}</button>
                      {/each}
                    </div>
                  </div>
                  <!-- 截止日期 -->
                  {#if true}
                    {@const dd = dueLabel(item.dueDate)}
                    <div class="due-dropdown">
                    <button
                      class="due-btn"
                      class:urgent={dd.urgent}
                      title={t('todo.setDueDate')}
                    >
                      {#if dd.text}
                        <span>{dd.text}</span>
                      {:else}
                        <span class="no-due">📅</span>
                      {/if}
                    </button>
                    <div class="due-menu">
                      <button onclick={() => setTodayDue(item.id)}>{t('todo.dueToday')}</button>
                      <button onclick={() => setTomorrowDue(item.id)}>{t('todo.dueTomorrow')}</button>
                      {#if item.dueDate}
                        <button onclick={() => clearDueDate(item.id)}>{t('todo.noDueDate')}</button>
                      {/if}
                    </div>
                  </div>
                  {/if}
                  <!-- 删除 -->
                  <button class="todo-del-btn" onclick={() => deleteTodo(item.id)} title={t('common.delete')}>
                    ×
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- 看板模式 (Pro) -->
  {#if displayMode === 'kanban'}
    <div class="todo-kanban">
      {#each statusColumns as col}
        <div class="kanban-col">
          <div class="kanban-col-header" style="border-color:{col.color}">
            <span class="col-dot" style="background:{col.color}"></span>
            <span class="col-label">{col.label}</span>
            <span class="col-count">{kanbanGroups[col.key]?.length ?? 0}</span>
          </div>
          <div class="kanban-items">
            {#each kanbanGroups[col.key] ?? [] as item (item.id)}
              {@const due = dueLabel(item.dueDate)}
              <button
                class="kanban-card"
                onclick={() => cycleTodoStatus(item.id)}
                tabindex="0"
                title={t('common.click') + ' ' + ['todo', 'in_progress', 'done'][(statusColumns.findIndex(c => c.key === item.status) + 1) % 3]}
              >
                <div class="kanban-pri" style="background:{priColor(item.priority)}"></div>
                <div class="kanban-body">
                  <span class="kanban-text">{item.text}</span>
                  <div class="kanban-meta">
                    {#if due.text}
                      <span class="kanban-due" class:urgent={due.urgent}>{due.text}</span>
                    {/if}
                    <span class="kanban-del" role="button" tabindex="0" onclick={(e) => { e.stopPropagation(); deleteTodo(item.id); }} onkeydown={(e) => { e.key === 'Enter' && deleteTodo(item.id); }}>
                      ×
                    </span>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- 底部清除 -->
  {#if kanbanGroups.done?.length > 0}
    <div class="todo-footer">
      <button class="todo-clear" onclick={clearDone}>
        {t('todo.clearDone')} ({kanbanGroups.done.length})
      </button>
    </div>
  {/if}
</div>

<style>
  .todo-widget {
    width: 100%;
    max-width: 800px;
    margin: 0 auto 16px;
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 16px;
    padding: 16px 20px;
    transition: all 0.2s ease;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* ===== 头部 ===== */
  .todo-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .todo-icon { font-size: 15px; }
  .todo-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color, #e2e8f0);
    opacity: 0.85;
    flex: 1;
  }
  .todo-count {
    font-size: 11px;
    background: #3b82f6;
    color: white;
    border-radius: 10px;
    padding: 1px 8px;
    font-weight: 600;
    min-width: 18px;
    text-align: center;
  }
  .todo-mode-btn {
    background: var(--hover-bg, rgba(255,255,255,0.06));
    border: 1px solid var(--card-border, rgba(255,255,255,0.08));
    border-radius: 8px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.55;
    font-size: 14px;
    cursor: pointer;
    padding: 3px 8px;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: opacity 0.15s;
  }
  .todo-mode-btn:hover { opacity: 0.85; }
  .todo-mode-btn.pro-only { cursor: not-allowed; }
  .pro-lock { font-size: 9px; }

  /* ===== 工具栏 ===== */
  .todo-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
  }
  .todo-form { margin: 0; }
  .todo-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--card-border, rgba(255,255,255,0.08));
    border-radius: 10px;
    background: var(--input-bg, rgba(255,255,255,0.06));
    color: var(--text-color, #e2e8f0);
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .todo-input:focus { border-color: #3b82f6; }
  .todo-input::placeholder {
    color: var(--text-color, #e2e8f0);
    opacity: 0.3;
  }

  .todo-filters {
    display: flex;
    gap: 4px;
  }
  .filter-tab {
    background: none;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.45;
    font-size: 12px;
    padding: 3px 10px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-tab:hover { opacity: 0.7; background: var(--hover-bg, rgba(255,255,255,0.04)); }
  .filter-tab.active {
    opacity: 1;
    background: rgba(59,130,246,0.12);
    border-color: rgba(59,130,246,0.3);
    color: #3b82f6;
  }

  /* ===== 列表模式 ===== */
  .todo-list-body {
    max-height: 360px;
    overflow-y: auto;
  }
  .todo-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  @media (max-width: 800px) {
    .todo-grid { grid-template-columns: 1fr; }
  }

  .todo-card {
    border-radius: 10px;
    border: 1px solid transparent;
    padding: 6px 10px;
    transition: all 0.15s;
  }
  .todo-card:hover {
    background: var(--hover-bg, rgba(255,255,255,0.04));
    border-color: var(--card-border, rgba(255,255,255,0.08));
  }
  .todo-card.is-done { opacity: 0.45; }

  .card-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .todo-check {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.2);
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
    flex-shrink: 0;
    padding: 0;
    transition: all 0.15s;
  }
  .todo-check:hover { border-color: #3b82f6; }
  .todo-check.checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .todo-text {
    flex: 1;
    font-size: 13px;
    color: var(--text-color, #e2e8f0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .is-done .todo-text { text-decoration: line-through; }

  /* 操作区 */
  .todo-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .todo-card:hover .todo-actions { opacity: 1; }

  /* 优先级下拉 */
  .pri-dropdown { position: relative; }
  .pri-btn {
    background: none; border: none;
    font-size: 14px; cursor: pointer; padding: 2px;
    line-height: 1;
  }
  .pri-menu {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 4px;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .pri-dropdown:hover .pri-menu { display: flex; flex-direction: column; }
  .pri-option {
    background: none; border: none;
    font-size: 12px; cursor: pointer; padding: 4px 8px;
    border-radius: 4px; text-align: left;
    color: #e2e8f0;
  }
  .pri-option:hover { background: rgba(255,255,255,0.08); }
  .pri-option.selected { background: rgba(59,130,246,0.15); }

  /* 截止日期下拉 */
  .due-dropdown { position: relative; }
  .due-btn {
    background: none; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-size: 10px; cursor: pointer; padding: 1px 5px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.6;
    display: flex; align-items: center; gap: 2px;
  }
  .due-btn:hover { opacity: 1; }
  .due-btn.urgent { color: #ef4444; border-color: rgba(239,68,68,0.3); opacity: 0.85; }
  .no-due { font-size: 11px; }
  .due-menu {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 4px;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .due-dropdown:hover .due-menu { display: flex; flex-direction: column; }
  .due-menu button {
    background: none; border: none;
    font-size: 12px; cursor: pointer; padding: 4px 8px;
    border-radius: 4px; text-align: left;
    color: #e2e8f0;
  }
  .due-menu button:hover { background: rgba(255,255,255,0.08); }

  .todo-del-btn {
    background: none; border: none;
    color: var(--text-color, #e2e8f0);
    opacity: 0.3; font-size: 16px;
    cursor: pointer; padding: 0 2px;
    line-height: 1; transition: opacity 0.15s;
  }
  .todo-del-btn:hover { opacity: 0.8; color: #ef4444; }

  /* 空状态 */
  .todo-empty {
    text-align: center;
    font-size: 12px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.35;
    padding: 16px 0 4px;
    margin: 0;
  }

  /* ===== 看板模式 ===== */
  .todo-kanban {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    max-height: 420px;
    overflow: hidden;
  }
  @media (max-width: 800px) {
    .todo-kanban { grid-template-columns: 1fr; max-height: none; }
  }

  .kanban-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .kanban-col-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-bottom: 2px solid;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-color, #e2e8f0);
  }
  .col-dot { width: 8px; height: 8px; border-radius: 50%; }
  .col-label { flex: 1; opacity: 0.7; }
  .col-count {
    font-size: 11px;
    background: rgba(255,255,255,0.06);
    border-radius: 8px;
    padding: 0 6px;
    opacity: 0.6;
  }

  .kanban-items {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 4px;
  }

  .kanban-card {
    display: flex;
    gap: 8px;
    width: 100%;
    text-align: left;
    font-family: inherit;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 8px 10px;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--text-color, #e2e8f0);
  }
  .kanban-card:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
  }
  .kanban-pri {
    width: 4px;
    border-radius: 2px;
    flex-shrink: 0;
    margin: 2px 0;
  }
  .kanban-body {
    flex: 1;
    min-width: 0;
  }
  .kanban-text {
    font-size: 13px;
    color: var(--text-color, #e2e8f0);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
  }
  .kanban-meta {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .kanban-due {
    font-size: 10px;
    color: var(--text-color, #e2e8f0);
    opacity: 0.5;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 0 5px;
  }
  .kanban-due.urgent { color: #ef4444; border-color: rgba(239,68,68,0.25); }
  .kanban-del {
    margin-left: auto;
    background: none; border: none;
    color: var(--text-color, #e2e8f0);
    opacity: 0; font-size: 14px;
    cursor: pointer; padding: 0 2px;
    line-height: 1; transition: opacity 0.15s;
  }
  .kanban-card:hover .kanban-del { opacity: 0.35; }
  .kanban-del:hover { opacity: 0.8 !important; color: #ef4444; }

  /* ===== 底部 ===== */
  .todo-footer {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--card-border, rgba(255,255,255,0.06));
  }
  .todo-clear {
    background: none;
    border: none;
    color: var(--text-color, #e2e8f0);
    opacity: 0.35;
    font-size: 11px;
    cursor: pointer;
    padding: 2px 12px;
    border-radius: 6px;
    transition: all 0.15s;
  }
  .todo-clear:hover {
    opacity: 0.7;
    background: var(--hover-bg, rgba(255,255,255,0.04));
  }
</style>
