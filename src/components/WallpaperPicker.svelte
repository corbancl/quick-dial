<script lang="ts">
  import { getWallpaper, setWallpaper, setBlur, setBrightness } from '../stores/wallpaper.svelte';
  import { fetchRandomWallpaper } from '../utils/weather';
  import { getIsPro } from '../stores/subscription.svelte';
  import type { WallpaperConfig } from '../types';

  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let overlayEl: HTMLDivElement | undefined = $state();
  let contentEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    const o = overlayEl;
    const c = contentEl;
    if (!o) return;
    function handleClick(e: MouseEvent) {
      if (c && !c.contains(e.target as Node)) onclose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onclose();
    }
    o.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      o.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  });

  // 预设壁纸
  const presets = [
    { id: 'none', name: '无', type: 'solid' as const, value: 'transparent' },
    { id: 'gradient1', name: '深海', type: 'gradient' as const, value: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' },
    { id: 'gradient2', name: '极光', type: 'gradient' as const, value: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
    { id: 'gradient3', name: '竹青', type: 'gradient' as const, value: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { id: 'gradient4', name: '日落', type: 'gradient' as const, value: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' },
    { id: 'gradient5', name: '樱花', type: 'gradient' as const, value: 'linear-gradient(135deg, #ec4899 0%, #f9a8d4 100%)' },
    { id: 'gradient6', name: '暮紫', type: 'gradient' as const, value: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)' },
    { id: 'gradient7', name: '墨灰', type: 'gradient' as const, value: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)' },
    { id: 'gradient8', name: '薄荷', type: 'gradient' as const, value: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
    { id: 'gradient9', name: '赤霞', type: 'gradient' as const, value: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)' },
    { id: 'gradient10', name: '夜空', type: 'gradient' as const, value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
    { id: 'gradient11', name: '冰岛', type: 'gradient' as const, value: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' },
    { id: 'gradient12', name: '琥珀', type: 'gradient' as const, value: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' },
  ];

  let customUrl = $state('');
  let loadingRandom = $state(false);

  function applyPreset(preset: typeof presets[0]) {
    setWallpaper({
      type: preset.type,
      value: preset.value,
      blur: 0,
      brightness: 100,
    });
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setWallpaper({
        type: 'image',
        value: base64,
        blur: 0,
        brightness: 100,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleCustomUrl() {
    const url = customUrl.trim();
    if (!url) return;

    // 简单 URL 验证
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      alert('请输入有效的图片链接');
      return;
    }

    setWallpaper({
      type: 'image',
      value: url,
      blur: 0,
      brightness: 100,
    });
    customUrl = '';
  }

  function handleBlurChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = Math.max(0, Math.min(20, parseInt(input.value) || 0));
    setBlur(value);
  }

  function handleBrightnessChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = Math.max(50, Math.min(150, parseInt(input.value) || 100));
    setBrightness(value);
  }

  async function handleRandomWallpaper() {
    loadingRandom = true;
    try {
      const url = await fetchRandomWallpaper();
      if (url) {
        setWallpaper({
          type: 'image',
          value: url,
          blur: 0,
          brightness: 100,
        });
      } else {
        alert(t('wp.random') + ' 失败，请稍后重试');
      }
    } finally {
      loadingRandom = false;
    }
  }

  let wallpaper = $derived(getWallpaper());
</script>

<div class="modal-overlay" bind:this={overlayEl}>
  <div class="modal-content wallpaper-modal" bind:this={contentEl} role="presentation">
    <h3 class="modal-title">{t('wp.title')}</h3>

    <!-- 预设壁纸 -->
    <div class="preset-grid">
      {#each presets as preset}
        <button
          class="preset-item"
          class:active={wallpaper.value === preset.value}
          onclick={() => applyPreset(preset)}
          style="background: {preset.value};"
          title={preset.name}
        >
          {#if preset.id === 'none'}
            <span class="preset-label">无</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- 上传自定义壁纸 -->
    <div class="upload-section">
      {#if getIsPro()}
        <label class="btn btn-secondary upload-btn">
          <i class="fa-solid fa-upload"></i> 上传本地图片
          <input type="file" accept="image/*" onchange={handleFileUpload} hidden />
        </label>
        <button 
          class="btn btn-secondary random-btn" 
          onclick={handleRandomWallpaper}
          disabled={loadingRandom}
        >
          {#if loadingRandom}
            <i class="fa-solid fa-spinner fa-spin"></i> 加载中...
          {:else}
            <i class="fa-solid fa-shuffle"></i> {t('wp.random')}
          {/if}
        </button>
      {:else}
        <button 
          class="btn btn-secondary random-btn" 
          onclick={handleRandomWallpaper}
          disabled={loadingRandom}
        >
          {#if loadingRandom}
            <i class="fa-solid fa-spinner fa-spin"></i> 加载中...
          {:else}
            <i class="fa-solid fa-shuffle"></i> {t('wp.random')}
          {/if}
        </button>
        <span class="pro-tip">🔒 上传壁纸需 Pro</span>
      {/if}
    </div>

    <!-- URL 输入（仅 Pro） -->
    {#if getIsPro()}
      <div class="url-section">
        <input
          class="form-input"
          type="text"
          bind:value={customUrl}
          placeholder="输入图片链接..."
          onkeydown={(e) => { if (e.key === 'Enter') handleCustomUrl(); }}
        />
        <button class="btn btn-secondary" onclick={handleCustomUrl}>应用</button>
      </div>
    {/if}

    <!-- 模糊度 -->
    <div class="adjust-section">
      <span class="adjust-label">模糊度: {wallpaper.blur}px</span>
      <input
        class="adjust-slider"
        type="range"
        min="0"
        max="20"
        value={wallpaper.blur}
        onchange={handleBlurChange}
        aria-label="模糊度"
      />
    </div>

    <!-- 亮度 -->
    <div class="adjust-section">
      <span class="adjust-label">亮度: {wallpaper.brightness}%</span>
      <input
        class="adjust-slider"
        type="range"
        min="50"
        max="150"
        value={wallpaper.brightness}
        onchange={handleBrightnessChange}
        aria-label="亮度"
      />
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" onclick={onclose}>关闭</button>
    </div>
  </div>
</div>

<style>
  .wallpaper-modal {
    min-width: 320px;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .preset-item {
    aspect-ratio: 16/9;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
  }

  .preset-item:hover {
    border-color: var(--primary-color, #4f46e5);
    transform: scale(1.02);
  }

  .preset-item.active {
    border-color: var(--primary-color, #4f46e5);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
  }

  .preset-label {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.6;
  }

  .upload-section {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .upload-btn {
    cursor: pointer;
  }

  .random-btn {
    flex: 1;
  }

  .url-section {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .url-section .form-input {
    flex: 1;
    font-size: 13px;
  }

  .adjust-section {
    margin-bottom: 12px;
  }

  .adjust-label {
    display: block;
    font-size: 13px;
    color: var(--text-color, #1e293b);
    margin-bottom: 4px;
    opacity: 0.7;
  }

  .adjust-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--card-border, rgba(0,0,0,0.1));
    outline: none;
    -webkit-appearance: none;
  }

  .adjust-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color, #4f46e5);
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .pro-tip {
    font-size: 11px;
    color: var(--text-color, #1e293b);
    opacity: 0.4;
    display: flex;
    align-items: center;
    padding: 4px 0;
  }
</style>
