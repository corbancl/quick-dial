export interface WeatherData {
  location: {
    city: string;
    province: string;
  };
  current: {
    temperature: number;
    humidity: number;
    weather: string;
    windDirection: string;
    windScale: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    dayWeather: string;
    dayTemp: string;
    nightTemp: string;
    dayWeatherIcon: string;
  }>;
  updateTime: string;
}

interface ApiResponse {
  code: number;
  msg: string;
  data: {
    data: {
      location: {
        city: string;
        province: string;
      };
      current: {
        temperature: number;
        humidity: number;
        windDirection: string;
        windScale: string;
      };
      forecast: Array<{
        date: string;
        dayWeather: string;
        dayTemp: string;
        nightTemp: string;
        dayWeatherIcon: string;
      }>;
    };
  };
}

const API_URL = 'https://api.ruseo.cn/api/weather_ip';
const API_KEY = 'be4385f8-e5a2-49a4-b3ad-c6f23d1f38a1';
const CACHE_KEY = 'speed-dial-weather';
const CACHE_DURATION = 15 * 60 * 1000; // 15分钟缓存

export async function fetchRandomWallpaper(): Promise<string | null> {
  try {
    const response = await fetch(`https://api.ruseo.cn/api/wallpaper?key=${API_KEY}`);
    const result = await response.json();
    
    if (result.code === 0 && result.data?.image_url) {
      // 验证图片 URL 可访问，xxapi.cn 可能 HTTP/2 异常
      try {
        const check = await fetch(result.data.image_url, { method: 'HEAD', mode: 'no-cors' });
        if (check.ok || check.type === 'opaque') {
          return result.data.image_url;
        }
      } catch { /* 图片不可访问，使用后备 */ }
    }
    
    // 后备：使用 Picsum 随机壁纸（全球 CDN，可靠）
    const seed = Date.now();
    return `https://picsum.photos/seed/${seed}/1920/1080`;
  } catch {
    // API 完全不可用，直接后备
    const seed = Date.now();
    return `https://picsum.photos/seed/${seed}/1920/1080`;
  }
}

export interface LunarData {
  date: string;
  weekday: string;
  lunar: {
    formatted: string;
    year_ganzhi: string;
    year_shengxiao: string;
    day_ganzhi: string;
    month_ganzhi: string;
  };
  zodiac: string;
  solar_term: {
    current: string | null;
    prev: string;
    next: string;
    next_date: string;
  };
  holiday: {
    today: Array<{ name: string; type?: string }>;
  };
  almanac: {
    yi: string[];
    ji: string[];
    xi_shen: string;
    fu_shen: string;
    cai_shen: string;
  };
}

const LUNAR_CACHE_KEY = 'speed-dial-lunar';
const LUNAR_CACHE_DURATION = 1 * 60 * 60 * 1000; // 1小时缓存

export async function fetchLunar(date?: string): Promise<LunarData | null> {
  try {
    const cacheKey = date ? `${LUNAR_CACHE_KEY}-${date}` : LUNAR_CACHE_KEY;
    
    const cached = getCachedLunar(cacheKey);
    if (cached) {
      return cached;
    }
    
    const url = date 
      ? `https://api.ruseo.cn/api/lunar?key=${API_KEY}&date=${date}&scope=all`
      : `https://api.ruseo.cn/api/lunar?key=${API_KEY}&scope=all`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.code !== 0 || !result.data) {
      console.error('Lunar API error:', result.msg);
      return null;
    }
    
    const data: LunarData = {
      date: result.data.date,
      weekday: result.data.weekday,
      lunar: {
        formatted: result.data.lunar?.formatted || '',
        year_ganzhi: result.data.lunar?.year_ganzhi || '',
        year_shengxiao: result.data.lunar?.year_shengxiao || '',
        day_ganzhi: result.data.lunar?.day_ganzhi || '',
        month_ganzhi: result.data.lunar?.month_ganzhi || '',
      },
      zodiac: result.data.zodiac || '',
      solar_term: {
        current: result.data.solar_term?.current || null,
        prev: result.data.solar_term?.prev || '',
        next: result.data.solar_term?.next || '',
        next_date: result.data.solar_term?.next_date || '',
      },
      holiday: {
        today: result.data.holiday?.today || [],
      },
      almanac: {
        yi: result.data.almanac?.yi || [],
        ji: result.data.almanac?.ji || [],
        xi_shen: result.data.almanac?.xi_shen || '',
        fu_shen: result.data.almanac?.fu_shen || '',
        cai_shen: result.data.almanac?.cai_shen || '',
      },
    };
    
    cacheLunar(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch lunar:', error);
    return null;
  }
}

function getCachedLunar(cacheKey: string): LunarData | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > LUNAR_CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

function cacheLunar(cacheKey: string, data: LunarData): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
  }
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // 检查缓存
    const cached = getCachedWeather();
    if (cached) {
      return cached;
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}&day=3&hourtype=0&suntimetype=0`);
    const result: ApiResponse = await response.json();

    if (result.code !== 0 || !result.data?.data) {
      console.error('Weather API error:', result.msg);
      return null;
    }

    const apiData = result.data.data;
    const data: WeatherData = {
      location: {
        city: apiData.location.city,
        province: apiData.location.province,
      },
      current: {
        temperature: apiData.current.temperature,
        humidity: apiData.current.humidity,
        weather: apiData.forecast[0]?.dayWeather || '',
        windDirection: apiData.current.windDirection,
        windScale: apiData.current.windScale,
        icon: apiData.forecast[0]?.dayWeatherIcon || '',
      },
      forecast: apiData.forecast.slice(0, 3),
      updateTime: new Date().toLocaleString('zh-CN'),
    };

    // 缓存结果
    cacheWeather(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

function getCachedWeather(): WeatherData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function cacheWeather(data: WeatherData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // 忽略存储错误
  }
}
