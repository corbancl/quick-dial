<script lang="ts">
  import { fetchWeather, type WeatherData } from '../utils/weather';

  let { expanded = false, ontoggle = () => {}, compact = false }: { expanded?: boolean; ontoggle?: () => void; compact?: boolean } = $props();

  let weather = $state<WeatherData | null>(null);
  let loading = $state(true);

  $effect(() => {
    fetchWeather().then(data => {
      weather = data;
      loading = false;
    });
  });

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }
</script>

{#if loading}
  <div class="weather-widget loading">
    <div class="weather-skeleton"></div>
  </div>
{:else if weather}
  {#if compact}
  <div class="weather-widget compact" onclick={ontoggle} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && ontoggle()}>
    <div class="weather-main">
      <div class="weather-info">
        <div class="weather-temp">{weather.current.temperature}°</div>
        <div class="weather-desc">{weather.current.weather}</div>
      </div>
    </div>
  </div>
  {:else}
  <div class="weather-widget" onclick={ontoggle} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && ontoggle()}>
    <div class="weather-main">
      <div class="weather-icon">
        <img src={weather.current.icon} alt={weather.current.weather} />
      </div>
      <div class="weather-info">
        <div class="weather-temp">{weather.current.temperature}°</div>
        <div class="weather-desc">{weather.current.weather}</div>
      </div>
      <div class="weather-location">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        {weather.location.city}
      </div>
    </div>

    <div class="weather-details">
      <span class="detail-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        {weather.current.humidity}%
      </span>
      <span class="detail-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
        </svg>
        {weather.current.windDirection} {weather.current.windScale}
      </span>
    </div>

    {#if expanded && weather.forecast.length > 0}
      <div class="weather-forecast">
        {#each weather.forecast as day}
          <div class="forecast-day">
            <div class="forecast-date">{formatDate(day.date)}</div>
            <img src={day.dayWeatherIcon} alt={day.dayWeather} class="forecast-icon" />
            <div class="forecast-temp">
              <span class="temp-high">{day.dayTemp}°</span>
              <span class="temp-low">{day.nightTemp}°</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  {/if}
{/if}

<style>
  .weather-widget {
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    border-radius: 16px;
    padding: 12px 16px;
    backdrop-filter: blur(8px);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }

  .weather-widget.compact {
    background: none;
    border: none;
    border-radius: 0;
    padding: 0;
    backdrop-filter: none;
    box-shadow: none;
  }
  .weather-widget.compact:hover {
    transform: none;
  }
  .weather-widget.compact .weather-main {
    flex-direction: column;
    gap: 1px;
    align-items: flex-start;
  }
  .weather-widget.compact .weather-temp {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
  }
  .weather-widget.compact .weather-desc {
    font-size: 11px;
    opacity: 0.65;
    line-height: 1.2;
  }

  .weather-widget:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .weather-widget.loading {
    min-width: 200px;
    min-height: 60px;
  }

  .weather-skeleton {
    width: 100%;
    height: 40px;
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 75%);
    background-size: 200% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
    border-radius: 8px;
  }

  @keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .weather-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .weather-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .weather-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .weather-info {
    flex: 1;
  }

  .weather-temp {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
    line-height: 1;
  }

  .weather-desc {
    font-size: 13px;
    color: var(--text-color, #1e293b);
    opacity: 0.6;
    margin-top: 2px;
  }

  .weather-location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
  }

  .weather-details {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.04));
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.6;
  }

  .weather-forecast {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--card-border, rgba(0,0,0,0.04));
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .forecast-day {
    flex: 1;
    text-align: center;
  }

  .forecast-date {
    font-size: 12px;
    color: var(--text-color, #1e293b);
    opacity: 0.5;
    margin-bottom: 4px;
  }

  .forecast-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    margin: 4px 0;
  }

  .forecast-temp {
    display: flex;
    justify-content: center;
    gap: 4px;
    font-size: 13px;
  }

  .temp-high {
    color: var(--text-color, #1e293b);
    font-weight: 500;
  }

  .temp-low {
    color: var(--text-color, #1e293b);
    opacity: 0.5;
  }

  @media (max-width: 640px) {
    .weather-temp {
      font-size: 24px;
    }

    .weather-icon {
      width: 40px;
      height: 40px;
    }
  }
</style>
