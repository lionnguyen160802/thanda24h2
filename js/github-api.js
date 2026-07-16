// ============================================
// GITHUB API - Commit content.json to repo
// ============================================

const GitHubAPI = (() => {
  const STORAGE_KEY = 'thanda_github_settings';

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function clearSettings() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isConfigured() {
    const s = getSettings();
    return !!(s.token && s.owner && s.repo);
  }

  // Get file SHA (required for updating existing files)
  async function getFileSHA(settings, path) {
    const res = await fetch(
      `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${path}?ref=${settings.branch || 'main'}`,
      {
        headers: {
          'Authorization': `Bearer ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
    if (res.status === 404) return null; // File doesn't exist yet
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  // Commit a file to the repo
  async function commitFile(path, content, message) {
    const settings = getSettings();
    if (!settings.token || !settings.owner || !settings.repo) {
      throw new Error('Chưa cấu hình GitHub. Vào Cài đặt GitHub để thiết lập.');
    }

    const branch = settings.branch || 'main';

    // Get existing file SHA if it exists
    const sha = await getFileSHA(settings, path);

    // Base64 encode the content
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    const base64 = btoa(
      Array.from(bytes).map(b => String.fromCharCode(b)).join('')
    );

    const body = {
      message: message || `Cập nhật ${path} từ Admin Panel`,
      content: base64,
      branch: branch
    };

    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `GitHub API error: ${res.status}`);
    }

    return await res.json();
  }

  // Upload an image file (from File input)
  async function uploadImage(file, destPath) {
    const settings = getSettings();
    if (!settings.token || !settings.owner || !settings.repo) {
      throw new Error('Chưa cấu hình GitHub.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1]; // Remove data:... prefix
          const branch = settings.branch || 'main';
          const sha = await getFileSHA(settings, destPath);

          const body = {
            message: `Upload ảnh: ${destPath}`,
            content: base64,
            branch: branch
          };
          if (sha) body.sha = sha;

          const res = await fetch(
            `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${destPath}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${settings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            }
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            reject(new Error(err.message || `Upload failed: ${res.status}`));
          } else {
            resolve(await res.json());
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Test connection
  async function testConnection() {
    const settings = getSettings();
    if (!settings.token || !settings.owner || !settings.repo) {
      throw new Error('Chưa nhập đầy đủ thông tin.');
    }

    const res = await fetch(
      `https://api.github.com/repos/${settings.owner}/${settings.repo}`,
      {
        headers: {
          'Authorization': `Bearer ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!res.ok) {
      if (res.status === 401) throw new Error('Token không hợp lệ hoặc hết hạn.');
      if (res.status === 404) throw new Error('Repository không tồn tại hoặc token không có quyền truy cập.');
      throw new Error(`Lỗi kết nối: ${res.status}`);
    }

    const repo = await res.json();
    return {
      name: repo.full_name,
      private: repo.private,
      defaultBranch: repo.default_branch,
      url: repo.html_url
    };
  }

  return { getSettings, saveSettings, clearSettings, isConfigured, commitFile, uploadImage, testConnection };
})();
