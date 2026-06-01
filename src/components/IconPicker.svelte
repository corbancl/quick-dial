<script lang="ts">
  import { t } from '../utils/i18n.svelte';

  interface Props {
    value: string;
    onselect: (icon: string) => void;
  }

  // 分类名翻译映射
  function cn(n: string) {
    return ({'常用':'cat.common','社交':'cat.social','开发':'cat.dev','媒体':'cat.media','办公':'cat.office','学习':'cat.study','品牌':'cat.brand'} as Record<string,string>)[n] || n;
  }

  let { value, onselect }: Props = $props();

  type IconCategory = { name: string; icons: { value: string; label: string; type: 'emoji' | 'fa' }[] };

  const categories: IconCategory[] = [
    {
      name: '常用',
      icons: [
        { value: '🌐', label: '网页', type: 'emoji' },
        { value: '📧', label: '邮箱', type: 'emoji' },
        { value: '🔍', label: '搜索', type: 'emoji' },
        { value: '🏠', label: '主页', type: 'emoji' },
        { value: '⭐', label: '收藏', type: 'emoji' },
        { value: '📌', label: '置顶', type: 'emoji' },
        { value: '📋', label: '列表', type: 'emoji' },
        { value: '🔗', label: '链接', type: 'emoji' },
        { value: '💡', label: '灵感', type: 'emoji' },
        { value: '📝', label: '笔记', type: 'emoji' },
      ]
    },
    {
      name: '社交',
      icons: [
        { value: '💬', label: '聊天', type: 'emoji' },
        { value: '💚', label: '微信', type: 'emoji' },
        { value: '🐧', label: 'QQ', type: 'emoji' },
        { value: '📱', label: '手机', type: 'emoji' },
        { value: '✉️', label: '邮件', type: 'emoji' },
        { value: '📢', label: '通知', type: 'emoji' },
        { value: '👥', label: '社区', type: 'emoji' },
        { value: '💭', label: '评论', type: 'emoji' },
      ]
    },
    {
      name: '开发',
      icons: [
        { value: '🐙', label: 'GitHub', type: 'emoji' },
        { value: '💻', label: '代码', type: 'emoji' },
        { value: '🗄️', label: '数据库', type: 'emoji' },
        { value: '☁️', label: '云服务', type: 'emoji' },
        { value: '🐳', label: 'Docker', type: 'emoji' },
        { value: '🔧', label: '工具', type: 'emoji' },
        { value: '📦', label: '包管理', type: 'emoji' },
        { value: '🚀', label: '部署', type: 'emoji' },
        { value: '🛠️', label: '设置', type: 'emoji' },
        { value: '🧩', label: '插件', type: 'emoji' },
      ]
    },
    {
      name: '媒体',
      icons: [
        { value: '▶️', label: '视频', type: 'emoji' },
        { value: '🎵', label: '音乐', type: 'emoji' },
        { value: '🎬', label: '影视', type: 'emoji' },
        { value: '📺', label: 'B站', type: 'emoji' },
        { value: '📰', label: '新闻', type: 'emoji' },
        { value: '🎮', label: '游戏', type: 'emoji' },
        { value: '📷', label: '相册', type: 'emoji' },
        { value: '🎨', label: '设计', type: 'emoji' },
      ]
    },
    {
      name: '办公',
      icons: [
        { value: '📊', label: '图表', type: 'emoji' },
        { value: '📅', label: '日历', type: 'emoji' },
        { value: '📁', label: '文件', type: 'emoji' },
        { value: '🛒', label: '购物', type: 'emoji' },
        { value: '💰', label: '财务', type: 'emoji' },
        { value: '📈', label: '数据', type: 'emoji' },
        { value: '🗂️', label: '归档', type: 'emoji' },
        { value: '📎', label: '附件', type: 'emoji' },
      ]
    },
    {
      name: '学习',
      icons: [
        { value: '📚', label: '阅读', type: 'emoji' },
        { value: '🎓', label: '教育', type: 'emoji' },
        { value: '📖', label: '文档', type: 'emoji' },
        { value: '🧠', label: 'AI', type: 'emoji' },
        { value: '🔬', label: '研究', type: 'emoji' },
        { value: '🌍', label: '百科', type: 'emoji' },
        { value: '🎯', label: '目标', type: 'emoji' },
        { value: '🏆', label: '成就', type: 'emoji' },
      ]
    },
    {
      name: '品牌',
      icons: [
        { value: 'fa-brands fa-github', label: 'GitHub', type: 'fa' },
        { value: 'fa-brands fa-google', label: 'Google', type: 'fa' },
        { value: 'fa-brands fa-youtube', label: 'YouTube', type: 'fa' },
        { value: 'fa-brands fa-bilibili', label: 'B站', type: 'fa' },
        { value: 'fa-brands fa-weixin', label: '微信', type: 'fa' },
        { value: 'fa-brands fa-qq', label: 'QQ', type: 'fa' },
        { value: 'fa-brands fa-twitter', label: 'X/Twitter', type: 'fa' },
        { value: 'fa-brands fa-instagram', label: 'Instagram', type: 'fa' },
        { value: 'fa-brands fa-facebook', label: 'Facebook', type: 'fa' },
        { value: 'fa-brands fa-docker', label: 'Docker', type: 'fa' },
        { value: 'fa-brands fa-npm', label: 'npm', type: 'fa' },
        { value: 'fa-brands fa-node', label: 'Node.js', type: 'fa' },
        { value: 'fa-brands fa-steam', label: 'Steam', type: 'fa' },
        { value: 'fa-brands fa-spotify', label: 'Spotify', type: 'fa' },
        { value: 'fa-brands fa-discord', label: 'Discord', type: 'fa' },
        { value: 'fa-brands fa-reddit', label: 'Reddit', type: 'fa' },
        { value: 'fa-brands fa-stack-overflow', label: 'Stack Overflow', type: 'fa' },
        { value: 'fa-brands fa-python', label: 'Python', type: 'fa' },
      ]
    },
  ];

  let activeCategory = $state(categories[0].name);
  let customUrl = $state('');

  $effect(() => {
    customUrl = value.startsWith('http') ? value : '';
  });

  function switchCategory(cat: string, e: MouseEvent) {
    activeCategory = cat;
  }

  function select(icon: string) {
    onselect(icon);
  }

  function handleCustomUrl() {
    const trimmed = customUrl.trim();
    if (trimmed) {
      onselect(trimmed);
    }
  }
</script>

<div class="icon-picker">
  <!-- 分类标签 -->
  <div class="picker-tabs">
    {#each categories as cat}
      <button
        type="button"
        class="picker-tab"
        class:active={activeCategory === cat.name}
        onclick={(e) => switchCategory(cat.name, e)}
      >
        {t(cn(cat.name))}
      </button>
    {/each}
  </div>

  <!-- 图标网格 -->
  <div class="picker-grid">
    {#each categories.find(c => c.name === activeCategory)?.icons ?? [] as item}
      <button
        type="button"
        class="icon-btn"
        class:selected={value === item.value}
        onclick={() => select(item.value)}
        title={item.label}
      >
        {#if item.type === 'emoji'}
          <span class="icon-emoji">{item.value}</span>
        {:else}
          <i class="{item.value} icon-fa"></i>
        {/if}
        <span class="icon-label">{item.label}</span>
      </button>
    {/each}
  </div>

  <!-- 自定义 URL（高级选项） -->
  <details class="picker-advanced">
    <summary class="advanced-toggle">自定义图标 URL</summary>
    <div class="advanced-content">
      <input
        type="text"
        class="form-input"
        bind:value={customUrl}
        placeholder="https://example.com/icon.png"
        onchange={handleCustomUrl}
      />
    </div>
  </details>
</div>

<style>
  .icon-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .picker-tabs {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .picker-tab {
    padding: 4px 12px;
    border: none;
    background: var(--hover-bg, rgba(0,0,0,0.04));
    color: var(--text-color, #1e293b);
    font-size: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    opacity: 0.6;
  }

  .picker-tab:hover {
    opacity: 0.9;
    background: var(--hover-bg, rgba(0,0,0,0.08));
  }

  .picker-tab.active {
    opacity: 1;
    background: var(--primary-color, #4f46e5);
    color: white;
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    gap: 6px;
    max-height: 260px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px 6px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 10px;
    background: var(--card-bg, rgba(255,255,255,0.5));
    cursor: pointer;
    transition: all 0.15s;
  }

  .icon-btn:hover {
    border-color: var(--primary-color, #4f46e5);
    background: rgba(79, 70, 229, 0.06);
    transform: translateY(-1px);
  }

  .icon-btn.selected {
    border-color: var(--primary-color, #4f46e5);
    background: rgba(79, 70, 229, 0.12);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }

  .icon-emoji {
    font-size: 24px;
    line-height: 1;
  }

  .icon-fa {
    font-size: 20px;
    color: var(--text-color, #1e293b);
    opacity: 0.7;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn.selected .icon-fa {
    opacity: 1;
    color: var(--primary-color, #4f46e5);
  }

  .icon-label {
    font-size: 10px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 56px;
  }

  .picker-advanced {
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.06));
    padding-top: 8px;
  }

  .advanced-toggle {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    cursor: pointer;
    user-select: none;
  }

  .advanced-toggle:hover {
    opacity: 0.8;
  }

  .advanced-content {
    margin-top: 8px;
  }

  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--card-border, rgba(0,0,0,0.12));
    border-radius: 10px;
    font-size: 13px;
    background: var(--input-bg, rgba(0,0,0,0.02));
    color: var(--text-color, #1e293b);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .form-input:focus {
    border-color: var(--primary-color, #4f46e5);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
</style>
