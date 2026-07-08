const STORAGE_KEY = 'speed-dial-data';
const CHUNK_PREFIX = 'speed-dial-chunk-';
const CHUNK_SIZE = 1024 * 1024; // 1MB per chunk

/**
 * 加载数据：兼容旧格式（单key）和新格式（分片）
 */
export function loadData<T>(): T | null {
  try {
    // 尝试分片格式
    const chunkCount = parseInt(localStorage.getItem('speed-dial-chunks') || '0', 10);
    if (chunkCount > 0) {
      let raw = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = localStorage.getItem(CHUNK_PREFIX + i);
        if (chunk === null) {
          console.warn('[Storage] 分片缺失:', i);
          // 尝试降级到单key格式
          return loadLegacy<T>();
        }
        raw += chunk;
      }
      return JSON.parse(raw) as T;
    }
    // 兼容旧格式
    return loadLegacy<T>();
  } catch (e) {
    console.warn('[Storage] 数据解析失败', e);
    return null;
  }
}

function loadLegacy<T>(): T | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

/**
 * 保存数据：小数据单key，大数据自动分片
 */
export function saveData<T>(data: T): boolean {
  try {
    const serialized = JSON.stringify(data);
    const totalSize = new Blob([serialized]).size;

    // 清除旧数据
    localStorage.removeItem(STORAGE_KEY);
    clearChunks();

    if (totalSize <= CHUNK_SIZE) {
      // 小数据：单key存储
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.removeItem('speed-dial-chunks');
    } else {
      // 大数据：分片存储
      const chunkCount = Math.ceil(totalSize / CHUNK_SIZE);
      for (let i = 0; i < chunkCount; i++) {
        const chunk = serialized.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        localStorage.setItem(CHUNK_PREFIX + i, chunk);
      }
      localStorage.setItem('speed-dial-chunks', String(chunkCount));
    }
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      alert('存储空间不足！请减少自定义壁纸或清理数据后重试。');
    } else {
      console.error('[Storage] 保存失败', e);
    }
    return false;
  }
}

function clearChunks() {
  const count = parseInt(localStorage.getItem('speed-dial-chunks') || '0', 10);
  for (let i = 0; i < count; i++) {
    localStorage.removeItem(CHUNK_PREFIX + i);
  }
  localStorage.removeItem('speed-dial-chunks');
}

export function removeData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    clearChunks();
  } catch (e) {
    console.error('[Storage] 清除失败', e);
  }
}

export function checkStorageSupport(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as T;
        resolve(data);
      } catch {
        reject(new Error('JSON 格式错误'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
