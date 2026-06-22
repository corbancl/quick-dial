<script lang="ts">
  import { getRssData, addFeed, removeFeed, setArticles, markRead, markAllRead } from '../stores/rss.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import { fetchArticles, formatPubDate } from '../utils/rss';
  import { t, getLang } from '../utils/i18n.svelte';
  import { RSS_FEED_LIMIT } from '../types';
  import type { RssFeed } from '../types';

  let { onclose }: { onclose?: () => void } = $props();

  let activeFeedUrl = $state('');
  let showAdd = $state(false);
  let feedUrl = $state('');
  let feedTitle = $state('');
  let loading = $state(false);
  let error = $state('');

  const d = $derived(getRssData());
  const isPro = $derived(getIsPro());
  const lang = $derived(getLang());
  const activeFeed = $derived(d.feeds.find(f => f.url === activeFeedUrl) || null);
  const activeArticles = $derived(d.articles.filter(a => a.feedUrl === activeFeedUrl).slice(0, 20));
  const feedLimitReached = $derived(!isPro && d.feeds.length >= RSS_FEED_LIMIT);

  async function refresh() {
    if (!activeFeed) return;
    loading = true;
    error = '';
    try {
      const articles = await fetchArticles(activeFeed);
      setArticles(activeFeed.url, articles);
    } catch (e: any) {
      error = e.message || '加载失败';
    } finally {
      loading = false;
    }
  }

  async function handleAdd() {
    if (!feedUrl.trim()) return;
    loading = true;
    error = '';
    try {
      const articles = await fetchArticles({ url: feedUrl.trim(), title: '' });
      const hostname = new URL(feedUrl).hostname;
      const title = feedTitle.trim() || hostname;
      const feed: RssFeed = {
        url: feedUrl.trim(),
        title,
        icon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
      };
      if (!addFeed(feed)) {
        error = isPro ? '该源已存在' : `免费版最多 ${RSS_FEED_LIMIT} 个 RSS 源`;
      } else {
        setArticles(feed.url, articles);
        activeFeedUrl = feed.url;
        showAdd = false;
        feedUrl = '';
        feedTitle = '';
      }
    } catch (e: any) {
      error = '无效的 RSS 地址';
    } finally {
      loading = false;
    }
  }

  function handleRemove(url: string) {
    removeFeed(url);
    if (activeFeedUrl === url) {
      activeFeedUrl = d.feeds[0]?.url || '';
    }
  }

  $effect(() => {
    if (d.feeds.length > 0 && !activeFeedUrl) {
      activeFeedUrl = d.feeds[0].url;
      if (d.articles.filter(a => a.feedUrl === activeFeedUrl).length === 0) {
        refresh();
      }
    }
  });
</script>

<div class="rss-panel">
  <!-- 头部 -->
  <div class="rss-header">
    <div class="rss-header-left">
      <span class="rss-badge">RSS</span>
      {#if feedLimitReached && !isPro}
        <span class="rss-pro-badge">PRO</span>
      {/if}
    </div>
    <div class="rss-header-actions">
      <button class="rss-btn-icon" onclick={() => showAdd = !showAdd} title={t('common.add')}>
        <i class="fa-solid fa-plus"></i>
      </button>
      <button class="rss-btn-icon" onclick={() => { if (onclose) onclose(); }} title={t('common.close')}>
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>

  <!-- 源标签栏 -->
  {#if d.feeds.length > 0}
    <div class="rss-feed-bar">
      {#each d.feeds as feed}
        <button
          class="rss-feed-tab"
          class:active={activeFeedUrl === feed.url}
          onclick={() => {
            activeFeedUrl = feed.url;
            if (d.articles.filter(a => a.feedUrl === feed.url).length === 0) refresh();
          }}
        >
          {#if feed.icon}
            <img src={feed.icon} alt="" class="rss-feed-icon" />
          {/if}
          <span class="rss-feed-name">{feed.title}</span>
          <span class="rss-feed-count">
            {d.articles.filter(a => a.feedUrl === feed.url && !a.read).length || ''}
          </span>
          <span class="rss-feed-remove" onclick={(e) => { e.stopPropagation(); handleRemove(feed.url); }} onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleRemove(feed.url); } }} title={t('common.delete')} role="button" tabindex="0"><i class="fa-solid fa-xmark"></i></span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- 添加源表单 -->
  {#if showAdd}
    <div class="rss-add-form">
      <input class="rss-input" type="text" placeholder="RSS 地址" bind:value={feedUrl} onkeydown={(e) => e.key === 'Enter' && handleAdd()} />
      <input class="rss-input" type="text" placeholder="名称（可选）" bind:value={feedTitle} onkeydown={(e) => e.key === 'Enter' && handleAdd()} />
      <button class="rss-btn rss-btn-primary" onclick={handleAdd} disabled={loading || !feedUrl.trim()}>
        {loading ? t('common.loading') : t('common.add')}
      </button>
      <button class="rss-btn rss-btn-cancel" onclick={() => showAdd = false}>{t('common.cancel')}</button>
    </div>
  {/if}

  <!-- 工具栏（快捷操作） -->
  {#if activeFeed && activeArticles.length > 0}
    <div class="rss-toolbar">
      <span class="rss-feed-title">{activeFeed.title}</span>
      <button class="rss-btn-icon" onclick={refresh} disabled={loading} title={t('rss.refresh')}>
        <i class="fa-solid fa-rotate-right" class:spinning={loading}></i>
      </button>
      <button class="rss-btn-icon" onclick={() => markAllRead(activeFeedUrl)} title={t('rss.markAllRead')}>
        <i class="fa-solid fa-check-double"></i>
      </button>
    </div>
  {/if}

  {#if error}
    <div class="rss-error">{error}</div>
  {/if}

  <!-- 文章列表 -->
  <div class="rss-messages">
    {#if activeFeed && activeArticles.length === 0 && !loading}
      <div class="rss-empty">{t('rss.empty')}</div>
    {:else if d.feeds.length === 0}
      <div class="rss-empty">{t('rss.noFeed')}</div>
    {:else}
      {#each activeArticles as article}
        <a href={article.link} target="_blank" rel="noopener" class="rss-article" class:read={article.read} onclick={() => markRead(article.link)}>
          <div class="rss-article-title">{article.title}</div>
          {#if article.snippet}
            <div class="rss-article-snippet">{article.snippet}</div>
          {/if}
          <div class="rss-article-meta">
            {#if article.pubDate}
              <span class="rss-article-date">{formatPubDate(article.pubDate)}</span>
            {/if}
            <span class="rss-article-link">{t('rss.readMore')}</span>
          </div>
        </a>
      {/each}
    {/if}
  </div>
</div>

<style>
  .rss-panel {
    width: 480px;
    max-width: 95vw;
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-color, #0f172a);
    border-radius: 16px;
    font-size: 13px;
  }

  .rss-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    flex-shrink: 0;
  }
  .rss-header-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rss-badge { font-size: 12px; padding: 2px 8px; border-radius: 6px; font-weight: 600; background: #ea580c; color: #fff; }
  .rss-pro-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; }
  .rss-header-actions { display: flex; gap: 4px; }
  .rss-btn-icon {
    background: none; border: none; font-size: 15px;
    cursor: pointer; padding: 4px; line-height: 1;
    color: var(--text-color, #1e293b); opacity: 0.5;
    transition: opacity 0.15s;
    border-radius: 6px;
  }
  .rss-btn-icon:hover { opacity: 0.9; }

  /* 源标签栏 */
  .rss-feed-bar {
    display: flex;
    gap: 6px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    overflow-x: auto;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .rss-feed-bar::-webkit-scrollbar { display: none; }

  .rss-feed-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 14px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.1));
    background: var(--hover-bg, rgba(0,0,0,0.03));
    color: var(--text-color, #475569);
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .rss-feed-tab:hover { border-color: #ea580c; }
  .rss-feed-tab.active {
    background: #ea580c;
    border-color: #ea580c;
    color: #fff;
  }
  .rss-feed-tab.active .rss-feed-remove { color: rgba(255,255,255,0.7); }
  .rss-feed-icon { width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; }
  .rss-feed-name { max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
  .rss-feed-count { font-size: 11px; font-weight: 600; opacity: 0.7; }
  .rss-feed-count:empty { display: none; }
  .rss-feed-tab.active .rss-feed-count { opacity: 1; }

  .rss-feed-remove {
    background: none; border: none;
    color: var(--text-color, #64748b);
    cursor: pointer; font-size: 10px; padding: 0; line-height: 1;
    opacity: 0; transition: opacity 0.15s;
    display: flex; align-items: center;
  }
  .rss-feed-tab:hover .rss-feed-remove { opacity: 1; }
  .rss-feed-remove:hover { opacity: 1 !important; }

  /* 添加源表单 */
  .rss-add-form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    flex-shrink: 0;
  }
  .rss-input {
    flex: 1; min-width: 120px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.1));
    background: var(--input-bg, rgba(0,0,0,0.04));
    color: var(--text-color, #1e293b);
    font-size: 13px; font-family: inherit;
    outline: none; box-sizing: border-box;
  }
  .rss-input::placeholder { opacity: 0.4; }
  .rss-input:focus { border-color: #ea580c; }

  .rss-btn {
    padding: 8px 14px; border-radius: 8px; font-size: 13px;
    font-weight: 600; border: none; cursor: pointer;
    font-family: inherit;
  }
  .rss-btn-primary { background: #ea580c; color: #fff; }
  .rss-btn-cancel { background: var(--hover-bg, rgba(0,0,0,0.05)); color: var(--text-color, #1e293b); }
  .rss-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* 工具栏 */
  .rss-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.06));
    flex-shrink: 0;
  }
  .rss-feed-title { font-size: 12px; color: var(--text-color, #64748b); opacity: 0.7; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .spinning { animation: rss-spin 0.8s linear infinite; }
  @keyframes rss-spin { to { transform: rotate(360deg); } }

  /* 文章列表 */
  .rss-messages {
    flex: 1;
    overflow-y: auto;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .rss-article {
    display: block;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--hover-bg, rgba(0,0,0,0.03));
    text-decoration: none;
    transition: background 0.15s;
  }
  .rss-article:hover { background: var(--card-border, rgba(0,0,0,0.06)); }
  .rss-article.read { opacity: 0.45; }
  .rss-article-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-color, #1e293b);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .rss-article-snippet {
    font-size: 12px;
    color: var(--text-color, #64748b);
    opacity: 0.65;
    line-height: 1.45;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .rss-article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    font-size: 11px;
    color: var(--text-color, #94a3b8);
    opacity: 0.5;
  }
  .rss-article-link { opacity: 0.7; }

  .rss-error, .rss-empty {
    text-align: center;
    padding: 30px 0;
    color: var(--text-color, #94a3b8);
    font-size: 13px;
    opacity: 0.6;
  }
  .rss-error { color: #ef4444; opacity: 1; }

  @media (max-width: 540px) {
    .rss-panel { width: 100vw; max-height: 100vh; border-radius: 0; }
  }
</style>
