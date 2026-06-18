<script lang="ts">
  import { getRssData, addFeed, removeFeed, setArticles, markRead, markAllRead } from '../stores/rss.svelte';
  import { getIsPro } from '../stores/subscription.svelte';
  import { fetchArticles, formatPubDate } from '../utils/rss';
  import { t, getLang } from '../utils/i18n.svelte';
  import { RSS_FEED_LIMIT } from '../types';
  import type { RssFeed } from '../types';

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

<div class="rss-widget">
  <!-- 源列表 -->
  <div class="feed-list">
    {#each d.feeds as feed}
      <button
        class="feed-tab"
        class:active={activeFeedUrl === feed.url}
        onclick={() => {
          activeFeedUrl = feed.url;
          if (d.articles.filter(a => a.feedUrl === feed.url).length === 0) refresh();
        }}
      >
        {#if feed.icon}
          <img src={feed.icon} alt="" class="feed-icon" />
        {/if}
        <span class="feed-name">{feed.title}</span>
        <span class="feed-count">
          {d.articles.filter(a => a.feedUrl === feed.url && !a.read).length || ''}
        </span>
        <span class="feed-remove" onclick={(e) => { e.stopPropagation(); handleRemove(feed.url); }} title={t('common.delete')} role="button" tabindex="0">×</span>
      </button>
    {/each}

    <button
      class="feed-add-btn"
      onclick={() => showAdd = !showAdd}
      disabled={feedLimitReached}
      title={feedLimitReached ? '免费版最多 ' + RSS_FEED_LIMIT + ' 个 RSS 源' : t('common.add')}
    >
      + {feedLimitReached ? `${RSS_FEED_LIMIT}/5` : t('common.add')}
    </button>
  </div>

  <!-- 添加源表单 -->
  {#if showAdd}
    <div class="add-form">
      <input type="text" placeholder="RSS 地址" bind:value={feedUrl} onkeydown={(e) => e.key === 'Enter' && handleAdd()} />
      <input type="text" placeholder="名称（可选）" bind:value={feedTitle} onkeydown={(e) => e.key === 'Enter' && handleAdd()} />
      <button onclick={handleAdd} disabled={loading || !feedUrl.trim()}>
        {loading ? t('common.loading') : t('common.add')}
      </button>
      <button onclick={() => showAdd = false}>{t('common.cancel')}</button>
    </div>
  {/if}

  <!-- 工具栏 -->
  {#if activeFeed}
    <div class="toolbar">
      <span class="feed-title">{activeFeed.title}</span>
      <button onclick={refresh} disabled={loading} title={t('rss.refresh')}>
        {loading ? '⏳' : '↻'}
      </button>
      <button onclick={() => markAllRead(activeFeedUrl)} title={t('rss.markAllRead')}>
        ✓
      </button>
    </div>
  {/if}

  {#if error}
    <div class="rss-error">{error}</div>
  {/if}

  {#if activeFeed}
    {#if activeArticles.length === 0 && !loading}
      <div class="rss-empty">{t('rss.empty')}</div>
    {:else}
      <div class="article-list">
        {#each activeArticles as article}
          <a href={article.link} target="_blank" rel="noopener" class="article-card" class:read={article.read} onclick={() => markRead(article.link)}>
            <div class="article-title">{article.title}</div>
            {#if article.snippet}
              <div class="article-snippet">{article.snippet}</div>
            {/if}
            <div class="article-meta">
              {#if article.pubDate}
                <span class="article-date">{formatPubDate(article.pubDate)}</span>
              {/if}
              <span class="article-link">🔗 {t('rss.readMore')}</span>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  {:else if d.feeds.length === 0}
    <div class="rss-empty">{t('rss.noFeed')}</div>
  {/if}
</div>

<style>
  /* 卡片容器 — 与 TodoWidget 保持一致 */
  .rss-widget {
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

  .feed-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--card-border, rgba(0,0,0,0.08));
  }
  .feed-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.12));
    background: var(--hover-bg, rgba(0,0,0,0.04));
    color: var(--text-color, #475569);
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    transition: all 0.15s;
  }
  .feed-tab:hover { border-color: var(--accent, #3b82f6); }
  .feed-tab.active {
    background: var(--accent, #3b82f6);
    border-color: var(--accent, #3b82f6);
    color: #fff;
  }
  .feed-icon { width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; }
  .feed-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .feed-count { font-size: 11px; font-weight: 600; }
  .feed-count:empty { display: none; }

  .feed-remove {
    background: none; border: none;
    color: var(--text-color, #64748b);
    cursor: pointer; font-size: 14px; padding: 0 2px; line-height: 1;
    opacity: 0; transition: opacity 0.15s;
  }
  .feed-tab:hover .feed-remove { opacity: 1; }
  .feed-remove:hover { color: #ef4444; }

  .feed-add-btn {
    padding: 4px 10px;
    border-radius: 16px;
    border: 1px dashed var(--card-border, rgba(0,0,0,0.15));
    background: none;
    color: var(--text-color, #64748b);
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
  }
  .feed-add-btn:hover { border-color: var(--accent, #3b82f6); color: var(--accent, #3b82f6); }
  .feed-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .add-form {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .add-form input {
    flex: 1; min-width: 120px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.12));
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color, #1e293b);
    font-size: 12px; font-family: inherit;
    outline: none;
  }
  .add-form input::placeholder {
    color: #94a3b8;
  }
  .add-form input:focus { border-color: var(--accent, #3b82f6); }
  .add-form button {
    padding: 6px 12px;
    border-radius: 8px;
    border: none;
    background: var(--accent, #3b82f6);
    color: #fff;
    cursor: pointer;
    font-size: 12px; font-family: inherit;
  }
  .add-form button:last-child {
    background: var(--hover-bg, rgba(0,0,0,0.04));
    color: var(--text-color, #475569);
  }
  .add-form button:disabled { opacity: 0.5; }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .feed-title { font-size: 12px; color: var(--text-color, #64748b); flex: 1; }
  .toolbar button {
    background: var(--hover-bg, rgba(0,0,0,0.04));
    border: 1px solid var(--card-border, rgba(0,0,0,0.08));
    border-radius: 6px;
    padding: 2px 8px;
    cursor: pointer;
    color: var(--text-color, #64748b);
    font-size: 12px;
  }
  .toolbar button:hover { color: var(--accent, #3b82f6); }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 420px;
    overflow-y: auto;
  }
  .article-card {
    display: block;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--hover-bg, rgba(0,0,0,0.03));
    text-decoration: none;
    transition: background 0.15s;
  }
  .article-card:hover { background: var(--card-border, rgba(0,0,0,0.06)); }
  .article-card.read { opacity: 0.55; }
  .article-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-color, #1e293b);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .article-snippet {
    font-size: 11px;
    color: var(--text-color, #64748b);
    opacity: 0.7;
    line-height: 1.4;
    margin-top: 3px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .article-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 11px;
    color: var(--text-color, #94a3b8);
    opacity: 0.65;
  }
  .rss-error, .rss-empty {
    text-align: center;
    padding: 20px;
    color: var(--text-color, #94a3b8);
    font-size: 13px;
  }
  .rss-error { color: #ef4444; }
</style>
