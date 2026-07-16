// ============================================
// DATA LOADER - Fetch & Cache content.json
// ============================================

const DataLoader = (() => {
  let cachedData = null;
  let loadPromise = null;

  async function load() {
    if (cachedData) return cachedData;
    if (loadPromise) return loadPromise;

    // Try loading draft from localStorage first
    const localContent = localStorage.getItem('siteContent');
    if (localContent) {
      try {
        cachedData = JSON.parse(localContent);
        return cachedData;
      } catch (e) {
        console.error('Error parsing localStorage siteContent:', e);
      }
    }

    loadPromise = fetch('data/content.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load content.json');
        return res.json();
      })
      .then(data => {
        cachedData = data;
        loadPromise = null;
        return data;
      })
      .catch(err => {
        console.error('DataLoader error:', err);
        loadPromise = null;
        throw err;
      });

    return loadPromise;
  }

  function getData() {
    return cachedData;
  }

  function clearCache() {
    cachedData = null;
    loadPromise = null;
  }

  return { load, getData, clearCache };
})();
