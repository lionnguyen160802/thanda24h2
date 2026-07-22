// ============================================
// ADMIN PANEL - Content Management
// ============================================

const Admin = (() => {
  let data = null;
  let currentSection = 'dashboard';
  let editingItem = null;
  let editingType = null;
  let selectedProductImageFile = null;
  let selectedCategoryImageFile = null;
  let selectedArticleImageFile = null;
  let selectedAboutImageFile = null;

  // ============================================
  // INITIALIZATION
  // ============================================
  async function init() {
    if (!checkLogin()) return;
    try {
      data = await DataLoader.load();
      renderSidebar();
      renderContent();
      setupSidebarEvents();
    } catch (err) {
      console.error('Admin init error:', err);
      document.getElementById('admin-content').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Không thể tải dữ liệu</h3>
          <p>Vui lòng chạy qua local server: <code>npx serve .</code></p>
        </div>`;
    }
  }

  // ============================================
  // AUTHENTICATION
  // ============================================
  function checkLogin() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
      return true;
    }
    showLoginScreen();
    return false;
  }

  function showLoginScreen() {
    document.body.classList.add('logged-out');
    let overlay = document.getElementById('admin-login-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'admin-login-overlay';
      overlay.className = 'login-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo"><i class="fas fa-fire"></i></div>
          <h2>Than Đá Thái Bình</h2>
          <p>Trang quản trị nội dung website</p>
        </div>
        <form class="login-form" id="login-form" onsubmit="event.preventDefault(); Admin.handleLogin();">
          <div class="login-input-group">
            <i class="fas fa-user"></i>
            <input type="text" class="login-input" id="login-username" placeholder="Tên đăng nhập" required autocomplete="username">
          </div>
          <div class="login-input-group">
            <i class="fas fa-lock"></i>
            <input type="password" class="login-input" id="login-password" placeholder="Mật khẩu" style="padding-right: 40px;" required autocomplete="current-password">
            <i class="fas fa-eye toggle-password" onclick="Admin.togglePasswordVisibility('login-password', this)"></i>
          </div>
          <div class="login-error" id="login-error">Tên đăng nhập hoặc mật khẩu không đúng!</div>
          <button type="submit" class="btn-login">
            Đăng nhập <i class="fas fa-sign-in-alt"></i>
          </button>
        </form>
      </div>
    `;
  }

  function handleLogin() {
    const user = getVal('login-username');
    const pass = getVal('login-password');
    const savedPass = localStorage.getItem('adminPassword') || 'admin123';

    // If user has set a custom password, only accept that password.
    // If not, allow the default passwords ('admin123' or 'admin').
    const hasCustomPassword = localStorage.getItem('adminPassword') !== null;
    const isPasswordValid = hasCustomPassword 
      ? (pass === savedPass) 
      : (pass === 'admin123' || pass === 'admin');

    if (user === 'admin' && isPasswordValid) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      document.body.classList.remove('logged-out');
      const overlay = document.getElementById('admin-login-overlay');
      if (overlay) overlay.remove();
      init();
    } else {
      const err = document.getElementById('login-error');
      if (err) err.style.display = 'block';
    }
  }

  function openChangePasswordModal() {
    editingType = 'change-password';
    showModal('Thay đổi mật khẩu mặc định', `
      <div style="color:var(--warning);font-size:0.85rem;margin-bottom:16px;line-height:1.6;display:flex;gap:8px;align-items:flex-start;">
        <i class="fas fa-exclamation-triangle" style="margin-top:2px;"></i>
        <span>Bạn đang sử dụng mật khẩu mặc định. Vui lòng đổi mật khẩu mới để bảo vệ an toàn cho trang quản trị!</span>
      </div>
      <div class="form-group">
        <label class="form-label">Mật khẩu hiện tại</label>
        <div style="position:relative;">
          <input class="form-input" id="modal-pw-old" type="password" placeholder="Nhập mật khẩu hiện tại (mặc định: admin123)" style="padding-right:40px; width:100%;">
          <i class="fas fa-eye" onclick="Admin.togglePasswordVisibility('modal-pw-old', this)" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); cursor:pointer;"></i>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Mật khẩu mới</label>
        <div style="position:relative;">
          <input class="form-input" id="modal-pw-new" type="password" placeholder="Nhập mật khẩu mới" style="padding-right:40px; width:100%;">
          <i class="fas fa-eye" onclick="Admin.togglePasswordVisibility('modal-pw-new', this)" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); cursor:pointer;"></i>
        </div>
      </div>
    `);
  }

  function savePasswordFromModal() {
    const oldPass = getVal('modal-pw-old');
    const newPass = getVal('modal-pw-new');
    const savedPass = localStorage.getItem('adminPassword') || 'admin123';

    if (!oldPass || !newPass) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }

    if (oldPass !== savedPass && oldPass !== 'admin') {
      showToast('Mật khẩu cũ không chính xác!', 'error');
      return;
    }

    localStorage.setItem('adminPassword', newPass);
    showToast('Đổi mật khẩu thành công!', 'success');
    closeModal();
  }

  function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
  }

  function changePassword() {
    const oldPass = getVal('pw-old');
    const newPass = getVal('pw-new');
    const savedPass = localStorage.getItem('adminPassword') || 'admin123';

    if (!oldPass || !newPass) {
      showToast('Vui lòng nhập đầy đủ mật khẩu!', 'error');
      return;
    }

    if (oldPass !== savedPass && oldPass !== 'admin') {
      showToast('Mật khẩu cũ không chính xác!', 'error');
      return;
    }

    localStorage.setItem('adminPassword', newPass);
    showToast('Đổi mật khẩu thành công!', 'success');
    document.getElementById('pw-old').value = '';
    document.getElementById('pw-new').value = '';
  }

  // ============================================
  // SIDEBAR
  // ============================================
  function renderSidebar() {
    const totalProducts = data.productCategories.reduce((sum, cat) => sum + cat.products.length, 0);

    document.getElementById('admin-sidebar-nav').innerHTML = `
      <div class="sidebar-section-label">Tổng quan</div>
      <a href="#" class="sidebar-link active" data-section="dashboard">
        <i class="fas fa-th-large"></i> Dashboard
      </a>

      <div class="sidebar-section-label">Nội dung</div>
      <a href="#" class="sidebar-link" data-section="site-info">
        <i class="fas fa-cog"></i> Thông tin chung
      </a>
      <a href="#" class="sidebar-link" data-section="hero">
        <i class="fas fa-image"></i> Hero Banner
      </a>
      <a href="#" class="sidebar-link" data-section="about">
        <i class="fas fa-building"></i> Giới thiệu
      </a>
      <a href="#" class="sidebar-link" data-section="contact">
        <i class="fas fa-address-book"></i> Liên hệ
      </a>
      <a href="#" class="sidebar-link" data-section="media">
        <i class="fas fa-images"></i> Ảnh & Icon
      </a>

      <div class="sidebar-section-label">Sản phẩm</div>
      <a href="#" class="sidebar-link" data-section="products">
        <i class="fas fa-cubes"></i> Tất cả sản phẩm
        <span class="count">${totalProducts}</span>
      </a>
      ${data.productCategories.map(cat => `
        <a href="#" class="sidebar-link" data-section="category-${cat.id}" style="padding-left:36px;font-size:0.85rem;">
          <i class="fas fa-angle-right"></i> ${cat.name}
          <span class="count">${cat.products.length}</span>
        </a>
      `).join('')}

      <div class="sidebar-section-label">Bài viết</div>
      <a href="#" class="sidebar-link" data-section="services">
        <i class="fas fa-cogs"></i> Dịch vụ
        <span class="count">${data.services.length}</span>
      </a>
      <a href="#" class="sidebar-link" data-section="news">
        <i class="fas fa-newspaper"></i> Tin tức
        <span class="count">${data.news.length}</span>
      </a>

      <div class="sidebar-section-label">Hệ thống</div>
      <a href="#" class="sidebar-link" data-section="github-settings">
        <i class="fab fa-github"></i> Cài đặt GitHub
        ${GitHubAPI.isConfigured() ? '<span class="count" style="background:var(--success);color:#fff;">✓</span>' : '<span class="count" style="background:var(--error);color:#fff;">!</span>'}
      </a>
    `;
  }

  function setupSidebarEvents() {
    const menuToggle = document.getElementById('admin-menu-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });
      
      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
          sidebar.classList.remove('open');
        }
      });
    }

    document.getElementById('admin-sidebar-nav').addEventListener('click', (e) => {
      const link = e.target.closest('.sidebar-link');
      if (!link) return;
      e.preventDefault();

      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      currentSection = link.dataset.section;
      renderContent();
      
      if (sidebar) {
        sidebar.classList.remove('open');
      }
    });
  }

  // ============================================
  // CONTENT RENDERING
  // ============================================
  function renderContent() {
    const content = document.getElementById('admin-content');
    const topbarTitle = document.getElementById('topbar-title');

    const sectionMap = {
      'dashboard': { title: '<i class="fas fa-th-large"></i> Dashboard', render: renderDashboard },
      'site-info': { title: '<i class="fas fa-cog"></i> Thông tin chung', render: renderSiteInfo },
      'hero': { title: '<i class="fas fa-image"></i> Hero Banner', render: renderHero },
      'about': { title: '<i class="fas fa-building"></i> Giới thiệu', render: renderAbout },
      'products': { title: '<i class="fas fa-cubes"></i> Tất cả sản phẩm', render: renderProducts },
      'services': { title: '<i class="fas fa-cogs"></i> Dịch vụ', render: renderServices },
      'news': { title: '<i class="fas fa-newspaper"></i> Tin tức', render: renderNews },
      'contact': { title: '<i class="fas fa-address-book"></i> Liên hệ', render: renderContact },
      'media': { title: '<i class="fas fa-images"></i> Ảnh & Icon', render: renderMedia },
      'github-settings': { title: '<i class="fab fa-github"></i> Cài đặt GitHub', render: renderGitHubSettings },
    };

    // Check for category sections
    if (currentSection.startsWith('category-')) {
      const catId = currentSection.replace('category-', '');
      const cat = data.productCategories.find(c => c.id === catId);
      if (cat) {
        topbarTitle.innerHTML = `<i class="fas fa-cubes"></i> ${cat.name}`;
        content.innerHTML = renderCategoryProducts(cat);
        setupContentEvents();
        return;
      }
    }

    const section = sectionMap[currentSection] || sectionMap['dashboard'];
    topbarTitle.innerHTML = section.title;
    content.innerHTML = section.render();
    setupContentEvents();
  }

  // ============================================
  // DASHBOARD
  // ============================================
  function renderDashboard() {
    const totalProducts = data.productCategories.reduce((sum, cat) => sum + cat.products.length, 0);

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-icon products"><i class="fas fa-cubes"></i></div>
          <div class="stat-card-info">
            <h3>${totalProducts}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon categories"><i class="fas fa-layer-group"></i></div>
          <div class="stat-card-info">
            <h3>${data.productCategories.length}</h3>
            <p>Danh mục</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon services"><i class="fas fa-cogs"></i></div>
          <div class="stat-card-info">
            <h3>${data.services.length}</h3>
            <p>Dịch vụ</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon news"><i class="fas fa-newspaper"></i></div>
          <div class="stat-card-info">
            <h3>${data.news.length}</h3>
            <p>Tin tức</p>
          </div>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-info-circle"></i> Thông tin hệ thống</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div>
            <p style="color:var(--text-muted);font-size:0.85rem;">Công ty</p>
            <p style="font-weight:600;">${data.siteInfo.companyName}</p>
          </div>
          <div>
            <p style="color:var(--text-muted);font-size:0.85rem;">Hotline</p>
            <p style="font-weight:600;color:var(--primary);">${data.siteInfo.hotline}</p>
          </div>
          <div>
            <p style="color:var(--text-muted);font-size:0.85rem;">Email</p>
            <p style="font-weight:600;">${data.siteInfo.email}</p>
          </div>
          <div>
            <p style="color:var(--text-muted);font-size:0.85rem;">Website</p>
            <p style="font-weight:600;">${data.siteInfo.website}</p>
          </div>
          <div style="grid-column: 1 / -1; margin-top: 12px; border-top: 1px solid var(--admin-border); padding-top: 16px;">
            <button class="btn btn-outline btn-sm" onclick="Admin.resetDraft()" style="color:var(--error);border-color:var(--error);padding: 8px 16px;">
              <i class="fas fa-trash-alt"></i> Reset dữ liệu nháp về mặc định
            </button>
          </div>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-question-circle"></i> Hướng dẫn sử dụng</div>
        </div>
        <div style="color:var(--text-secondary);line-height:1.8;font-size:0.9rem;">
          <p><strong>Cách 1 — Online (khuyên dùng):</strong></p>
          <p style="padding-left:16px;">1. Vào <strong>Cài đặt GitHub</strong> ở sidebar → nhập Token, Owner, Repo</p>
          <p style="padding-left:16px;">2. Chỉnh sửa nội dung bình thường</p>
          <p style="padding-left:16px;">3. Nhấn <strong>"Đẩy lên GitHub"</strong> → website tự cập nhật!</p>
          <p style="margin-top:12px;"><strong>Cách 2 — Thủ công:</strong></p>
          <p style="padding-left:16px;">1. Chỉnh sửa nội dung → nhấn <strong>"Xuất JSON"</strong></p>
          <p style="padding-left:16px;">2. Copy file JSON vào thư mục <code>data/</code> → git push</p>
        </div>
      </div>

      ${GitHubAPI.isConfigured() ? `
      <div class="admin-card" style="border-color:rgba(34,197,94,0.3);">
        <div style="display:flex;align-items:center;gap:10px;color:var(--success);">
          <i class="fas fa-check-circle" style="font-size:1.2rem;"></i>
          <div>
            <p style="font-weight:600;">GitHub đã kết nối</p>
            <p style="font-size:0.8rem;color:var(--text-muted);">Bạn có thể đẩy thay đổi trực tiếp lên GitHub từ thanh trên cùng.</p>
          </div>
        </div>
      </div>` : `
      <div class="admin-card" style="border-color:rgba(245,158,11,0.3);">
        <div style="display:flex;align-items:center;gap:10px;color:var(--warning);">
          <i class="fas fa-exclamation-triangle" style="font-size:1.2rem;"></i>
          <div>
            <p style="font-weight:600;">Chưa kết nối GitHub</p>
            <p style="font-size:0.8rem;color:var(--text-muted);">Vào <a href="#" onclick="document.querySelector('[data-section=github-settings]').click();return false;" style="color:var(--primary);">Cài đặt GitHub</a> để cấu hình đẩy nội dung online.</p>
          </div>
        </div>
      </div>`}
    `;
  }

  // ============================================
  // SITE INFO
  // ============================================
  function renderSiteInfo() {
    const info = data.siteInfo;
    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-building"></i> Thông tin công ty</div>
          <button class="btn btn-primary" onclick="Admin.saveSiteInfo()">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tên công ty</label>
            <input class="form-input" id="si-companyName" value="${escHtml(info.companyName)}">
          </div>
          <div class="form-group">
            <label class="form-label">Tên ngắn</label>
            <input class="form-input" id="si-shortName" value="${escHtml(info.shortName)}">
          </div>
          <div class="form-group form-grid-full">
            <label class="form-label">Slogan</label>
            <input class="form-input" id="si-slogan" value="${escHtml(info.slogan)}">
          </div>
          <div class="form-group form-grid-full">
            <label class="form-label">Mô tả</label>
            <textarea class="form-textarea" id="si-description" rows="3">${escHtml(info.description)}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Hotline</label>
            <input class="form-input" id="si-hotline" value="${escHtml(info.hotline)}">
          </div>
          <div class="form-group">
            <label class="form-label">Người liên hệ</label>
            <input class="form-input" id="si-contactPerson" value="${escHtml(info.contactPerson)}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" id="si-email" value="${escHtml(info.email)}">
          </div>
          <div class="form-group">
            <label class="form-label">Website</label>
            <input class="form-input" id="si-website" value="${escHtml(info.website)}">
          </div>
          <div class="form-group form-grid-full">
            <label class="form-label">Trụ sở chính</label>
            <input class="form-input" id="si-office" value="${escHtml(info.address.office)}">
          </div>
          <div class="form-group form-grid-full">
            <label class="form-label">Kho than</label>
            <input class="form-input" id="si-warehouse" value="${escHtml(info.address.warehouse)}">
          </div>
          <div class="form-group">
            <label class="form-label">Facebook URL</label>
            <input class="form-input" id="si-facebook" value="${escHtml(info.facebook)}">
          </div>
        </div>
      </div>
    `;
  }

  function saveSiteInfo() {
    data.siteInfo.companyName = getVal('si-companyName');
    data.siteInfo.shortName = getVal('si-shortName');
    data.siteInfo.slogan = getVal('si-slogan');
    data.siteInfo.description = getVal('si-description');
    data.siteInfo.hotline = getVal('si-hotline');
    data.siteInfo.contactPerson = getVal('si-contactPerson');
    data.siteInfo.email = getVal('si-email');
    data.siteInfo.website = getVal('si-website');
    data.siteInfo.address.office = getVal('si-office');
    data.siteInfo.address.warehouse = getVal('si-warehouse');
    data.siteInfo.facebook = getVal('si-facebook');
    persistData();
    showToast('Đã lưu thông tin công ty!', 'success');
    renderSidebar();
  }

  // ============================================
  // HERO
  // ============================================
  function renderHero() {
    const hero = data.heroSection;
    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-image"></i> Hero Banner</div>
          <button class="btn btn-primary" onclick="Admin.saveHero()">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Tiêu đề chính</label>
          <input class="form-input" id="hero-title" value="${escHtml(hero.title)}">
        </div>
        <div class="form-group">
          <label class="form-label">Phụ đề</label>
          <input class="form-input" id="hero-subtitle" value="${escHtml(hero.subtitle)}">
        </div>
        <div class="form-group">
          <label class="form-label">Mô tả</label>
          <textarea class="form-textarea" id="hero-description" rows="3">${escHtml(hero.description)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Ảnh nền (đường dẫn)</label>
          <input class="form-input" id="hero-bg" value="${escHtml(hero.backgroundImage)}">
          <span class="form-hint">Ví dụ: images/hero-banner.jpg</span>
        </div>
      </div>
    `;
  }

  function saveHero() {
    data.heroSection.title = getVal('hero-title');
    data.heroSection.subtitle = getVal('hero-subtitle');
    data.heroSection.description = getVal('hero-description');
    data.heroSection.backgroundImage = getVal('hero-bg');
    persistData();
    showToast('Đã lưu Hero Banner!', 'success');
  }

  // ============================================
  // ABOUT
  // ============================================
  function renderAbout() {
    const about = data.aboutContent;
    const aboutImage = about.image || 'images/about.jpg';
    selectedAboutImageFile = null;

    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-building"></i> Nội dung giới thiệu</div>
          <button class="btn btn-primary" onclick="Admin.saveAbout()">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Ảnh giới thiệu</label>
          <div class="image-upload-wrapper">
            <div class="image-upload-preview" id="about-image-preview">
              <img src="${escHtml(aboutImage)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-image\'></i>';">
            </div>
            <div class="image-upload-actions">
              <input type="file" id="about-image-file" accept="image/*" style="display:none;" onchange="Admin.handleAboutImageChange(this)">
              <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('about-image-file').click()">
                <i class="fas fa-upload"></i> Chọn file ảnh
              </button>
              <input type="hidden" id="about-image" value="${escHtml(aboutImage)}">
              <span class="image-upload-hint" id="about-image-name">${escHtml(aboutImage)}</span>
            </div>
          </div>
          <span class="form-hint">Ảnh hiển thị ở trang Giới thiệu. Khuyên dùng: 800×600px, JPG/PNG.</span>
        </div>
        <div class="form-group">
          <label class="form-label">Giới thiệu</label>
          <textarea class="form-textarea" id="about-intro" rows="4">${escHtml(about.intro)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Kinh nghiệm</label>
          <textarea class="form-textarea" id="about-experience" rows="4">${escHtml(about.experience)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Sản phẩm</label>
          <textarea class="form-textarea" id="about-products" rows="3">${escHtml(about.products)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Lời kêu gọi</label>
          <textarea class="form-textarea" id="about-cta" rows="2">${escHtml(about.cta)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Lời kết</label>
          <input class="form-input" id="about-closing" value="${escHtml(about.closing)}">
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-star"></i> Điểm nổi bật</div>
        </div>
        ${about.highlights.map((h, i) => `
        <div style="display:grid;grid-template-columns:100px 1fr 1fr;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--admin-border);">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Icon</label>
            <input class="form-input" id="hl-icon-${i}" value="${escHtml(h.icon)}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Tiêu đề</label>
            <input class="form-input" id="hl-title-${i}" value="${escHtml(h.title)}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Mô tả</label>
            <input class="form-input" id="hl-desc-${i}" value="${escHtml(h.description)}">
          </div>
        </div>
        `).join('')}
      </div>
    `;
  }

  async function saveAbout() {
    const saveBtn = document.querySelector('.admin-card button[onclick="Admin.saveAbout()"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    try {
      let imagePath = getVal('about-image');

      if (selectedAboutImageFile) {
        // Always save base64 for immediate local preview
        imagePath = await readFileAsDataURL(selectedAboutImageFile);

        // Also upload to GitHub if configured (in background)
        if (GitHubAPI.isConfigured()) {
          const ext = selectedAboutImageFile.name.split('.').pop();
          const filename = 'about.' + ext;
          const destPath = 'images/' + filename;
          try {
            await GitHubAPI.uploadImage(selectedAboutImageFile, destPath);
            showToast('Đã upload ảnh lên GitHub!', 'success');
          } catch (err) {
            showToast('Lỗi upload ảnh lên GitHub: ' + err.message, 'error');
          }
        }
      }

      data.aboutContent.image = imagePath;
      data.aboutContent.intro = getVal('about-intro');
      data.aboutContent.experience = getVal('about-experience');
      data.aboutContent.products = getVal('about-products');
      data.aboutContent.cta = getVal('about-cta');
      data.aboutContent.closing = getVal('about-closing');

      data.aboutContent.highlights.forEach((h, i) => {
        h.icon = getVal(`hl-icon-${i}`);
        h.title = getVal(`hl-title-${i}`);
        h.description = getVal(`hl-desc-${i}`);
      });

      persistData();
      showToast('Đã lưu nội dung giới thiệu!', 'success');
      renderContent();
    } catch (err) {
      console.error(err);
      showToast('Lỗi lưu: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
      }
    }
  }

  // ============================================
  // PRODUCTS
  // ============================================
  function renderProducts() {
    const allProducts = data.productCategories.flatMap(cat =>
      cat.products.map(p => ({ ...p, categoryName: cat.name }))
    );

    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-cubes"></i> Tất cả sản phẩm (${allProducts.length})</div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline" onclick="Admin.openCategoryModal()">
              <i class="fas fa-folder-plus"></i> Thêm danh mục
            </button>
            <button class="btn btn-primary" onclick="Admin.openProductModal()">
              <i class="fas fa-plus"></i> Thêm sản phẩm
            </button>
          </div>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Ảnh</th>
              <th style="width:120px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${allProducts.map(p => `
            <tr>
              <td>
                <div class="item-name">${escHtml(p.name)}</div>
                <div class="item-desc">${escHtml(p.description || '')}</div>
              </td>
              <td><span class="badge badge-category">${escHtml(p.categoryName)}</span></td>
              <td style="color:var(--text-muted);font-size:0.8rem;">${escHtml(p.image || '')}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline" onclick="Admin.editProduct('${p.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="Admin.deleteProduct('${p.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderCategoryProducts(category) {
    selectedCategoryImageFile = null;

    return `
      <div class="admin-card">
        <div class="admin-card-header" style="flex-wrap:wrap;gap:12px;">
          <div class="admin-card-title"><i class="fas fa-cubes"></i> ${category.name} (${category.products.length})</div>
          <button class="btn btn-primary" onclick="Admin.openProductModal('${category.id}')">
            <i class="fas fa-plus"></i> Thêm sản phẩm
          </button>
        </div>

        <div class="form-grid" style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--admin-border);">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Tên danh mục</label>
            <input class="form-input" id="cat-name" value="${escHtml(category.name)}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Ảnh danh mục</label>
            <div class="image-upload-wrapper" style="padding: 4px 10px; min-height: 38px; display: flex; align-items: center;">
              <div class="image-upload-preview" id="cat-image-preview" style="width: 40px; height: 30px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                ${category.image ? `<img src="${escHtml(category.image)}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-image" style="font-size:1rem;color:var(--text-muted);"></i>'}
              </div>
              <div class="image-upload-actions" style="flex:1; display:flex; flex-direction:row; align-items:center; gap:8px; margin-left:8px;">
                <input type="file" id="cat-image-file" accept="image/*" style="display:none;" onchange="Admin.handleCategoryImageChange(this)">
                <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('cat-image-file').click()" style="padding: 4px 8px; font-size: 0.75rem; white-space:nowrap;">
                  <i class="fas fa-upload"></i> Chọn file
                </button>
                <input type="hidden" id="cat-image" value="${escHtml(category.image || '')}">
                <span class="image-upload-hint" id="cat-image-name" style="font-size:0.75rem; color:var(--text-muted); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${category.image ? escHtml(category.image) : 'Chưa chọn ảnh'}</span>
              </div>
            </div>
          </div>
          <div class="form-group form-grid-full" style="margin:0;">
            <label class="form-label">Mô tả</label>
            <input class="form-input" id="cat-desc" value="${escHtml(category.description || '')}">
          </div>
          <div style="grid-column:1/-1; display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="Admin.saveCategory('${category.id}')">
              <i class="fas fa-save"></i> Lưu danh mục
            </button>
            <button class="btn btn-danger btn-sm" onclick="Admin.deleteCategory('${category.id}')">
              <i class="fas fa-trash-alt"></i> Xóa danh mục
            </button>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Danh sách sản phẩm</div>
          <button class="btn btn-primary btn-sm" onclick="Admin.openProductModal('${category.id}')">
            <i class="fas fa-plus"></i> Thêm sản phẩm
          </button>
        </div>

        ${category.products.length === 0 ? `
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h3>Chưa có sản phẩm nào</h3>
            <p>Nhấn "Thêm sản phẩm" để bắt đầu thêm sản phẩm vào danh mục này.</p>
          </div>
        ` : category.products.map(p => `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--admin-border);transition:background 0.2s;" onmouseover="this.style.background='var(--admin-hover)'" onmouseout="this.style.background='transparent'">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;color:var(--text-primary);font-size:0.9rem;">${escHtml(p.name)}</div>
              <div style="color:var(--text-secondary);font-size:0.8rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(p.description || 'Chưa có mô tả')}</div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <button class="btn btn-sm btn-outline" onclick="Admin.editProduct('${p.id}')" title="Sửa sản phẩm">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button class="btn btn-sm btn-danger" onclick="Admin.deleteProduct('${p.id}')" title="Xóa sản phẩm">
                <i class="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function saveCategory(catId) {
    const cat = data.productCategories.find(c => c.id === catId);
    if (!cat) return;

    const saveBtn = document.querySelector('.admin-card button[onclick^="Admin.saveCategory"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    try {
      const name = getVal('cat-name');
      if (!name) { showToast('Vui lòng nhập tên danh mục!', 'error'); return; }

      let imagePath = getVal('cat-image');

      if (selectedCategoryImageFile) {
        imagePath = await readFileAsDataURL(selectedCategoryImageFile);

        if (GitHubAPI.isConfigured()) {
          const ext = selectedCategoryImageFile.name.split('.').pop();
          const filename = slugify(name) + '.' + ext;
          const destPath = 'images/products/' + filename;
          try {
            await GitHubAPI.uploadImage(selectedCategoryImageFile, destPath);
            showToast('Đã upload ảnh lên GitHub!', 'success');
          } catch (err) {
            showToast('Lỗi upload ảnh lên GitHub: ' + err.message, 'error');
          }
        }
      }

      cat.name = name;
      cat.image = imagePath;
      cat.description = getVal('cat-desc');

      syncNavigationCategories();
      persistData();
      showToast('Đã lưu danh mục!', 'success');
      renderSidebar();
      renderContent();
    } catch (err) {
      console.error(err);
      showToast('Lỗi lưu danh mục: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu danh mục';
      }
    }
  }

  function deleteCategory(catId) {
    const cat = data.productCategories.find(c => c.id === catId);
    if (!cat) return;

    let confirmMsg = `Bạn có chắc muốn xóa danh mục "${cat.name}"?`;
    if (cat.products.length > 0) {
      confirmMsg = `CẢNH BÁO: Danh mục "${cat.name}" đang chứa ${cat.products.length} sản phẩm. Xóa danh mục sẽ xóa toàn bộ sản phẩm bên trong. Bạn có chắc chắn muốn xóa?`;
    }

    if (!confirm(confirmMsg)) return;

    data.productCategories = data.productCategories.filter(c => c.id !== catId);
    syncNavigationCategories();
    persistData();
    showToast('Đã xóa danh mục!', 'success');
    currentSection = 'products'; // Redirect to all products page
    renderSidebar();
    renderContent();
  }

  function openCategoryModal() {
    editingItem = null;
    editingType = 'category-new';
    selectedCategoryImageFile = null;

    showModal('Thêm danh mục mới', `
      <div class="form-group">
        <label class="form-label">Tên danh mục *</label>
        <input class="form-input" id="modal-cat-name" placeholder="VD: Than đá nhập khẩu">
      </div>
      <div class="form-group">
        <label class="form-label">Ảnh danh mục</label>
        <div class="image-upload-wrapper">
          <div class="image-upload-preview" id="cat-image-preview">
            <i class="fas fa-image"></i>
          </div>
          <div class="image-upload-actions">
            <input type="file" id="cat-image-file" accept="image/*" style="display:none;" onchange="Admin.handleCategoryImageChange(this)">
            <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('cat-image-file').click()">
              <i class="fas fa-upload"></i> Chọn file ảnh
            </button>
            <input type="hidden" id="modal-cat-image" value="">
            <span class="image-upload-hint" id="cat-image-name">Chưa chọn ảnh</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả</label>
        <input class="form-input" id="modal-cat-desc" placeholder="Mô tả ngắn về danh mục...">
      </div>
    `);
  }

  async function saveCategoryNew() {
    const name = getVal('modal-cat-name');
    if (!name) { showToast('Vui lòng nhập tên danh mục!', 'error'); return; }

    const id = slugify(name);
    if (data.productCategories.some(c => c.id === id)) {
      showToast('Danh mục này đã tồn tại!', 'error');
      return;
    }

    let imagePath = '';
    if (selectedCategoryImageFile) {
      imagePath = await readFileAsDataURL(selectedCategoryImageFile);

      if (GitHubAPI.isConfigured()) {
        const ext = selectedCategoryImageFile.name.split('.').pop();
        const filename = id + '.' + ext;
        const destPath = 'images/products/' + filename;
        try {
          await GitHubAPI.uploadImage(selectedCategoryImageFile, destPath);
          showToast('Đã upload ảnh lên GitHub!', 'success');
        } catch (err) {
          showToast('Lỗi upload ảnh lên GitHub: ' + err.message, 'error');
        }
      }
    }

    const newCat = {
      id: id,
      name: name,
      description: getVal('modal-cat-desc') || '',
      image: imagePath || 'images/products/default-category.jpg',
      products: []
    };

    data.productCategories.push(newCat);
    syncNavigationCategories();
    showToast('Đã thêm danh mục mới!', 'success');
  }

  function openProductModal(defaultCatId) {
    editingItem = null;
    editingType = 'product';
    selectedProductImageFile = null;

    const categoryOptions = data.productCategories.map(cat =>
      `<option value="${cat.id}" ${cat.id === defaultCatId ? 'selected' : ''}>${cat.name}</option>`
    ).join('');

    showModal('Thêm sản phẩm mới', `
      <div class="form-group">
        <label class="form-label">Tên sản phẩm *</label>
        <input class="form-input" id="modal-name" placeholder="VD: Than cục Quảng Ninh">
      </div>
      <div class="form-group">
        <label class="form-label">Danh mục *</label>
        <select class="form-select" id="modal-category">${categoryOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả</label>
        <textarea class="form-textarea" id="modal-desc" rows="3" placeholder="Mô tả sản phẩm..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Ảnh sản phẩm</label>
        <div class="image-upload-wrapper">
          <div class="image-upload-preview" id="product-image-preview">
            <i class="fas fa-image"></i>
          </div>
          <div class="image-upload-actions">
            <input type="file" id="product-image-file" accept="image/*" style="display:none;" onchange="Admin.handleProductImageChange(this)">
            <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('product-image-file').click()">
              <i class="fas fa-upload"></i> Chọn file ảnh
            </button>
            <input type="hidden" id="modal-image" value="">
            <span class="image-upload-hint" id="product-image-name">Chưa chọn ảnh</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Thông số (JSON)</label>
        <textarea class="form-textarea" id="modal-specs" rows="3" placeholder='{"kichCo": "0-15mm", "xuatXu": "Quảng Ninh"}'></textarea>
        <span class="form-hint">Các key: kichCo, xuatXu, nhietTri, loai, dongGoi, gar, mau, giaoHang</span>
      </div>
    `);
  }

  function editProduct(productId) {
    let product = null;
    let catId = '';
    for (const cat of data.productCategories) {
      const found = cat.products.find(p => p.id === productId);
      if (found) { product = found; catId = cat.id; break; }
    }
    if (!product) return;

    editingItem = product;
    editingType = 'product';
    selectedProductImageFile = null;

    const categoryOptions = data.productCategories.map(cat =>
      `<option value="${cat.id}" ${cat.id === catId ? 'selected' : ''}>${cat.name}</option>`
    ).join('');

    const hasImage = !!product.image;
    const previewContent = hasImage ? `<img src="${escHtml(product.image)}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fas fa-image"></i>`;

    showModal('Sửa sản phẩm', `
      <div class="form-group">
        <label class="form-label">Tên sản phẩm *</label>
        <input class="form-input" id="modal-name" value="${escHtml(product.name)}">
      </div>
      <div class="form-group">
        <label class="form-label">Danh mục *</label>
        <select class="form-select" id="modal-category">${categoryOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả</label>
        <textarea class="form-textarea" id="modal-desc" rows="3">${escHtml(product.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Ảnh sản phẩm</label>
        <div class="image-upload-wrapper">
          <div class="image-upload-preview" id="product-image-preview">
            ${previewContent}
          </div>
          <div class="image-upload-actions">
            <input type="file" id="product-image-file" accept="image/*" style="display:none;" onchange="Admin.handleProductImageChange(this)">
            <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('product-image-file').click()">
              <i class="fas fa-upload"></i> Chọn file ảnh
            </button>
            <input type="hidden" id="modal-image" value="${escHtml(product.image || '')}">
            <span class="image-upload-hint" id="product-image-name">${product.image ? escHtml(product.image) : 'Chưa chọn ảnh'}</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Thông số (JSON)</label>
        <textarea class="form-textarea" id="modal-specs" rows="3">${product.specs ? JSON.stringify(product.specs, null, 2) : ''}</textarea>
      </div>
    `);
  }

  function deleteProduct(productId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    for (const cat of data.productCategories) {
      const idx = cat.products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        cat.products.splice(idx, 1);
        break;
      }
    }

    persistData();
    showToast('Đã xóa sản phẩm!', 'success');
    renderSidebar();
    renderContent();
  }

  // ============================================
  // SERVICES
  // ============================================
  function renderServices() {
    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-cogs"></i> Dịch vụ (${data.services.length})</div>
          <button class="btn btn-primary" onclick="Admin.openServiceModal()">
            <i class="fas fa-plus"></i> Thêm dịch vụ
          </button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Tóm tắt</th>
              <th style="width:120px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${data.services.map(svc => `
            <tr>
              <td><div class="item-name">${escHtml(svc.title)}</div></td>
              <td style="color:var(--text-secondary);font-size:0.85rem;">${escHtml(svc.summary).substring(0, 80)}...</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline" onclick="Admin.editService('${svc.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="Admin.deleteService('${svc.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function openServiceModal() {
    editingItem = null;
    editingType = 'service';
    showModal('Thêm dịch vụ mới', renderArticleForm());
  }

  function editService(serviceId) {
    const svc = data.services.find(s => s.id === serviceId);
    if (!svc) return;
    editingItem = svc;
    editingType = 'service';
    showModal('Sửa dịch vụ', renderArticleForm(svc));
  }

  function deleteService(serviceId) {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    data.services = data.services.filter(s => s.id !== serviceId);
    persistData();
    showToast('Đã xóa dịch vụ!', 'success');
    renderSidebar();
    renderContent();
  }

  // ============================================
  // NEWS
  // ============================================
  function renderNews() {
    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-newspaper"></i> Tin tức (${data.news.length})</div>
          <button class="btn btn-primary" onclick="Admin.openNewsModal()">
            <i class="fas fa-plus"></i> Thêm tin tức
          </button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Ngày</th>
              <th>Tóm tắt</th>
              <th style="width:120px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${data.news.map(article => `
            <tr>
              <td><div class="item-name">${escHtml(article.title)}</div></td>
              <td style="color:var(--text-muted);font-size:0.85rem;white-space:nowrap;">${article.date || ''}</td>
              <td style="color:var(--text-secondary);font-size:0.85rem;">${escHtml(article.summary).substring(0, 60)}...</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline" onclick="Admin.editNews('${article.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="Admin.deleteNews('${article.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function openNewsModal() {
    editingItem = null;
    editingType = 'news';
    showModal('Thêm tin tức mới', renderArticleForm(null, true));
  }

  function editNews(articleId) {
    const article = data.news.find(n => n.id === articleId);
    if (!article) return;
    editingItem = article;
    editingType = 'news';
    showModal('Sửa tin tức', renderArticleForm(article, true));
  }

  function deleteNews(articleId) {
    if (!confirm('Bạn có chắc muốn xóa tin tức này?')) return;
    data.news = data.news.filter(n => n.id !== articleId);
    persistData();
    showToast('Đã xóa tin tức!', 'success');
    renderSidebar();
    renderContent();
  }

  // ============================================
  // SHARED ARTICLE FORM
  // ============================================
  function renderArticleForm(item, showDate) {
    selectedArticleImageFile = null;
    const hasImage = !!item?.image;
    const previewContent = hasImage ? `<img src="${escHtml(item.image)}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fas fa-image"></i>`;

    return `
      <div class="form-group">
        <label class="form-label">Tiêu đề *</label>
        <input class="form-input" id="modal-title" value="${escHtml(item?.title || '')}">
      </div>
      ${showDate ? `
      <div class="form-group">
        <label class="form-label">Ngày (YYYY-MM-DD)</label>
        <input class="form-input" type="date" id="modal-date" value="${item?.date || new Date().toISOString().split('T')[0]}">
      </div>` : ''}
      <div class="form-group">
        <label class="form-label">Tóm tắt</label>
        <textarea class="form-textarea" id="modal-summary" rows="2">${escHtml(item?.summary || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Nội dung</label>
        <textarea class="form-textarea" id="modal-content" rows="5">${escHtml(item?.content || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Ảnh bài viết</label>
        <div class="image-upload-wrapper">
          <div class="image-upload-preview" id="article-image-preview">
            ${previewContent}
          </div>
          <div class="image-upload-actions">
            <input type="file" id="article-image-file" accept="image/*" style="display:none;" onchange="Admin.handleArticleImageChange(this)">
            <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('article-image-file').click()">
              <i class="fas fa-upload"></i> Chọn file ảnh
            </button>
            <input type="hidden" id="modal-image" value="${escHtml(item?.image || '')}">
            <span class="image-upload-hint" id="article-image-name">${item?.image ? escHtml(item.image) : 'Chưa chọn ảnh'}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // MODAL
  // ============================================
  function showModal(title, bodyHtml) {
    document.getElementById('modal-header-title').textContent = title;
    document.getElementById('admin-modal-body').innerHTML = bodyHtml;
    document.getElementById('admin-modal-overlay').classList.add('active');
  }

  function closeModal() {
    document.getElementById('admin-modal-overlay').classList.remove('active');
    editingItem = null;
    editingType = null;
  }

  async function saveModal() {
    const saveBtn = document.querySelector('.admin-modal-footer .btn-primary');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    try {
      if (editingType === 'product') {
        await saveProduct();
      } else if (editingType === 'service') {
        await saveArticle(data.services, 'service');
      } else if (editingType === 'news') {
        await saveArticle(data.news, 'news');
      } else if (editingType === 'change-password') {
        savePasswordFromModal();
        return;
      } else if (editingType === 'category-new') {
        await saveCategoryNew();
      }
      persistData();
      closeModal();
      renderSidebar();
      renderContent();
    } catch (err) {
      console.error('Error saving modal:', err);
      showToast('Lỗi lưu dữ liệu: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu';
      }
    }
  }

  async function saveProduct() {
    const name = getVal('modal-name');
    if (!name) { showToast('Vui lòng nhập tên sản phẩm!', 'error'); return; }

    const catId = getVal('modal-category');
    const category = data.productCategories.find(c => c.id === catId);
    if (!category) return;

    let specs = {};
    try {
      const specsStr = getVal('modal-specs');
      if (specsStr) specs = JSON.parse(specsStr);
    } catch (e) {
      showToast('Thông số JSON không hợp lệ!', 'error');
      return;
    }

    let imagePath = getVal('modal-image');
    console.log('[saveProduct] selectedProductImageFile:', selectedProductImageFile);
    console.log('[saveProduct] initial imagePath:', imagePath);

    if (selectedProductImageFile) {
      imagePath = await readFileAsDataURL(selectedProductImageFile);
      console.log('[saveProduct] base64 imagePath length:', imagePath.length);

      if (GitHubAPI.isConfigured()) {
        const ext = selectedProductImageFile.name.split('.').pop();
        const filename = slugify(name) + '.' + ext;
        const destPath = 'images/products/' + filename;
        try {
          await GitHubAPI.uploadImage(selectedProductImageFile, destPath);
          showToast('Đã upload ảnh lên GitHub!', 'success');
        } catch (err) {
          showToast('Lỗi upload ảnh lên GitHub: ' + err.message, 'error');
        }
      }
    }
    console.log('[saveProduct] final imagePath:', imagePath ? imagePath.substring(0, 80) + '...' : 'EMPTY');

    if (editingItem) {
      // Remove from old category if changed
      for (const cat of data.productCategories) {
        const idx = cat.products.findIndex(p => p.id === editingItem.id);
        if (idx !== -1) { cat.products.splice(idx, 1); break; }
      }

      editingItem.name = name;
      editingItem.category = catId;
      editingItem.description = getVal('modal-desc');
      editingItem.image = imagePath;
      editingItem.specs = specs;
      category.products.push(editingItem);
      showToast('Đã cập nhật sản phẩm!', 'success');
    } else {
      const id = slugify(name);
      category.products.push({
        id,
        name,
        category: catId,
        description: getVal('modal-desc'),
        image: imagePath || category.image,
        specs
      });
      showToast('Đã thêm sản phẩm mới!', 'success');
    }
  }

  async function saveArticle(collection, type) {
    const title = getVal('modal-title');
    if (!title) { showToast('Vui lòng nhập tiêu đề!', 'error'); return; }

    let imagePath = getVal('modal-image');

    if (selectedArticleImageFile) {
      imagePath = await readFileAsDataURL(selectedArticleImageFile);

      if (GitHubAPI.isConfigured()) {
        const ext = selectedArticleImageFile.name.split('.').pop();
        const filename = slugify(title) + '.' + ext;
        const destPath = 'images/news/' + filename;
        try {
          await GitHubAPI.uploadImage(selectedArticleImageFile, destPath);
          showToast('Đã upload ảnh lên GitHub!', 'success');
        } catch (err) {
          showToast('Lỗi upload ảnh lên GitHub: ' + err.message, 'error');
        }
      }
    }

    const articleData = {
      title,
      summary: getVal('modal-summary'),
      content: getVal('modal-content'),
      image: imagePath,
    };

    const dateEl = document.getElementById('modal-date');
    if (dateEl) articleData.date = dateEl.value;

    if (editingItem) {
      Object.assign(editingItem, articleData);
      showToast('Đã cập nhật!', 'success');
    } else {
      articleData.id = slugify(title);
      collection.push(articleData);
      showToast('Đã thêm mới!', 'success');
    }
  }

  // ============================================
  // EXPORT JSON
  // ============================================
  function exportJSON() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã xuất file content.json!', 'success');
  }

  // ============================================
  // PUSH TO GITHUB
  // ============================================
  async function pushToGitHub() {
    if (!GitHubAPI.isConfigured()) {
      showToast('Chưa cấu hình GitHub! Vào Cài đặt GitHub để thiết lập.', 'error');
      return;
    }

    const pushBtn = document.getElementById('btn-push-github');
    if (pushBtn) {
      pushBtn.disabled = true;
      pushBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đẩy...';
    }

    try {
      const json = JSON.stringify(data, null, 2);
      const now = new Date().toLocaleString('vi-VN');
      await GitHubAPI.commitFile(
        'data/content.json',
        json,
        `Cập nhật nội dung từ Admin Panel — ${now}`
      );
      showToast('Đã đẩy lên GitHub thành công! Website sẽ cập nhật trong 1-2 phút.', 'success');
    } catch (err) {
      console.error('Push error:', err);
      showToast('Lỗi đẩy lên GitHub: ' + err.message, 'error');
    } finally {
      if (pushBtn) {
        pushBtn.disabled = false;
        pushBtn.innerHTML = '<i class="fab fa-github"></i> Đẩy lên GitHub';
      }
    }
  }

  // ============================================
  // GITHUB SETTINGS PAGE
  // ============================================
  function renderGitHubSettings() {
    const settings = GitHubAPI.getSettings();
    const isConfigured = GitHubAPI.isConfigured();

    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fab fa-github"></i> Kết nối GitHub</div>
        </div>
        <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;margin-bottom:20px;">
          <p>Kết nối GitHub để đẩy nội dung trực tiếp lên repository mà không cần download JSON thủ công.</p>
          <p style="margin-top:8px;">Trang admin sẽ hoạt động cả khi deploy online trên GitHub Pages.</p>
        </div>

        <div class="form-group">
          <label class="form-label">Personal Access Token *</label>
          <div style="position:relative;">
            <input class="form-input" id="gh-token" type="password" value="${escHtml(settings.token || '')}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="padding-right:40px; width:100%;">
            <i class="fas fa-eye" onclick="Admin.togglePasswordVisibility('gh-token', this)" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); cursor:pointer;"></i>
          </div>
          <span class="form-hint">Tạo token tại: <a href="https://github.com/settings/tokens/new" target="_blank" style="color:var(--primary);">github.com/settings/tokens</a> — chọn quyền <strong>repo</strong></span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Owner (username hoặc org) *</label>
            <input class="form-input" id="gh-owner" value="${escHtml(settings.owner || '')}" placeholder="VD: nguyen1608">
          </div>
          <div class="form-group">
            <label class="form-label">Repository name *</label>
            <input class="form-input" id="gh-repo" value="${escHtml(settings.repo || '')}" placeholder="VD: thanda24h">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Branch</label>
          <input class="form-input" id="gh-branch" value="${escHtml(settings.branch || 'main')}" placeholder="main">
          <span class="form-hint">Mặc định: main</span>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="Admin.saveGitHubSettings()">
            <i class="fas fa-save"></i> Lưu cài đặt
          </button>
          <button class="btn btn-outline" id="btn-test-github" onclick="Admin.testGitHubConnection()">
            <i class="fas fa-plug"></i> Kiểm tra kết nối
          </button>
          ${isConfigured ? `
          <button class="btn btn-danger" onclick="Admin.clearGitHubSettings()">
            <i class="fas fa-trash"></i> Xóa cài đặt
          </button>` : ''}
        </div>
      </div>

      ${isConfigured ? `
      <div class="admin-card" style="border-color:rgba(34,197,94,0.2);">
        <div class="admin-card-header">
          <div class="admin-card-title" style="color:var(--success);"><i class="fas fa-check-circle"></i> Đã kết nối</div>
        </div>
        <p style="color:var(--text-secondary);font-size:0.9rem;">Repository: <strong style="color:var(--text-primary);">${escHtml(settings.owner)}/${escHtml(settings.repo)}</strong> (branch: ${escHtml(settings.branch || 'main')})</p>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:8px;">Bạn có thể nhấn <strong>"Đẩy lên GitHub"</strong> ở thanh trên cùng để cập nhật website.</p>
      </div>` : ''}

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-shield-alt"></i> Bảo mật</div>
        </div>
        <div style="color:var(--text-secondary);font-size:0.85rem;line-height:1.7;">
          <p>⚠️ Token được lưu trong <strong>localStorage</strong> của trình duyệt, chỉ tồn tại trên thiết bị này.</p>
          <p>⚠️ Chỉ cấp quyền <strong>repo</strong> cho token (không cần quyền khác).</p>
          <p>⚠️ Nếu dùng máy chung, hãy nhấn "Xóa cài đặt" khi xong.</p>
          <p>⚠️ Dùng Fine-grained token chỉ cho 1 repo nếu muốn an toàn hơn.</p>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-key"></i> Đổi mật khẩu Admin</div>
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu hiện tại</label>
          <div style="position:relative;">
            <input class="form-input" id="pw-old" type="password" placeholder="Nhập mật khẩu hiện tại (mặc định: admin123)" style="padding-right:40px; width:100%;">
            <i class="fas fa-eye" onclick="Admin.togglePasswordVisibility('pw-old', this)" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); cursor:pointer;"></i>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu mới</label>
          <div style="position:relative;">
            <input class="form-input" id="pw-new" type="password" placeholder="Nhập mật khẩu mới" style="padding-right:40px; width:100%;">
            <i class="fas fa-eye" onclick="Admin.togglePasswordVisibility('pw-new', this)" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); cursor:pointer;"></i>
          </div>
        </div>
        <button class="btn btn-primary" onclick="Admin.changePassword()" style="margin-top:8px;">
          <i class="fas fa-save"></i> Đổi mật khẩu
        </button>
      </div>
    `;
  }

  function saveGitHubSettings() {
    const settings = {
      token: getVal('gh-token'),
      owner: getVal('gh-owner'),
      repo: getVal('gh-repo'),
      branch: getVal('gh-branch') || 'main'
    };

    if (!settings.token || !settings.owner || !settings.repo) {
      showToast('Vui lòng nhập đầy đủ Token, Owner và Repo!', 'error');
      return;
    }

    GitHubAPI.saveSettings(settings);
    showToast('Đã lưu cài đặt GitHub!', 'success');
    renderSidebar();
    renderContent();
    updateTopbarButtons();
  }

  function clearGitHubSettings() {
    if (!confirm('Xóa cài đặt GitHub? Token sẽ bị xóa khỏi trình duyệt.')) return;
    GitHubAPI.clearSettings();
    showToast('Đã xóa cài đặt GitHub.', 'info');
    renderSidebar();
    renderContent();
    updateTopbarButtons();
  }

  async function testGitHubConnection() {
    const btn = document.getElementById('btn-test-github');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...';
    }

    // Save current form values first
    const settings = {
      token: getVal('gh-token'),
      owner: getVal('gh-owner'),
      repo: getVal('gh-repo'),
      branch: getVal('gh-branch') || 'main'
    };
    GitHubAPI.saveSettings(settings);

    try {
      const repo = await GitHubAPI.testConnection();
      showToast(`Kết nối thành công! Repo: ${repo.name} (${repo.private ? 'Private' : 'Public'})`, 'success');
      renderSidebar();
      updateTopbarButtons();
    } catch (err) {
      showToast('Lỗi kết nối: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plug"></i> Kiểm tra kết nối';
      }
    }
  }

  function updateTopbarButtons() {
    const pushBtn = document.getElementById('btn-push-github');
    if (pushBtn) {
      pushBtn.style.display = GitHubAPI.isConfigured() ? '' : 'none';
    }
  }

  // ============================================
  // TOAST
  // ============================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ============================================
  // UTILITIES
  // ============================================
  function persistData() {
    try {
      localStorage.setItem('siteContent', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving siteContent to localStorage:', e);
    }
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  function syncNavigationCategories() {
    if (!data || !data.navigation) return;
    const productsNav = data.navigation.find(item => item.id === 'san-pham');
    if (productsNav) {
      productsNav.children = data.productCategories.map(cat => ({
        id: cat.id,
        label: cat.name
      }));
    }
  }

  function handleProductImageChange(input) {
    const file = input.files[0];
    if (!file) return;
    selectedProductImageFile = file;
    const nameEl = document.getElementById('product-image-name');
    if (nameEl) nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewEl = document.getElementById('product-image-preview');
      if (previewEl) previewEl.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  }

  function handleCategoryImageChange(input) {
    const file = input.files[0];
    if (!file) return;
    selectedCategoryImageFile = file;
    const nameEl = document.getElementById('cat-image-name');
    if (nameEl) nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewEl = document.getElementById('cat-image-preview');
      if (previewEl) previewEl.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  }

  function handleArticleImageChange(input) {
    const file = input.files[0];
    if (!file) return;
    selectedArticleImageFile = file;
    const nameEl = document.getElementById('article-image-name');
    if (nameEl) nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewEl = document.getElementById('article-image-preview');
      if (previewEl) previewEl.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  }

  function handleAboutImageChange(input) {
    const file = input.files[0];
    if (!file) return;
    selectedAboutImageFile = file;
    const nameEl = document.getElementById('about-image-name');
    if (nameEl) nameEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewEl = document.getElementById('about-image-preview');
      if (previewEl) previewEl.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  }

  function setupContentEvents() {
    // Any additional event wiring after content render
  }

  // ============================================
  // PUBLIC API
  // ============================================
  // ============================================
  // CONTACT PAGE
  // ============================================
  function renderContact() {
    const info = data.siteInfo;
    const mapUrl = data.contactMap || '';
    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-map-marker-alt"></i> Địa chỉ</div>
          <button class="btn btn-primary" onclick="Admin.saveContact()">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Trụ sở chính</label>
          <input class="form-input" id="ct-office" value="${escHtml(info.address.office)}">
        </div>
        <div class="form-group">
          <label class="form-label">Kho than</label>
          <input class="form-input" id="ct-warehouse" value="${escHtml(info.address.warehouse)}">
        </div>
        <div class="form-group">
          <label class="form-label">Google Maps Embed URL (không bắt buộc)</label>
          <input class="form-input" id="ct-map" value="${escHtml(mapUrl)}" placeholder="https://www.google.com/maps/embed?pb=...">
          <span class="form-hint">Vào Google Maps → Chia sẻ → Nhúng bản đồ → copy URL trong src</span>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-phone-alt"></i> Thông tin liên hệ</div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Hotline / Zalo</label>
            <input class="form-input" id="ct-hotline" value="${escHtml(info.hotline)}">
          </div>
          <div class="form-group">
            <label class="form-label">Người liên hệ</label>
            <input class="form-input" id="ct-person" value="${escHtml(info.contactPerson)}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" id="ct-email" value="${escHtml(info.email)}">
          </div>
          <div class="form-group">
            <label class="form-label">Website</label>
            <input class="form-input" id="ct-website" value="${escHtml(info.website)}">
          </div>
          <div class="form-group form-grid-full">
            <label class="form-label">Facebook URL</label>
            <input class="form-input" id="ct-facebook" value="${escHtml(info.facebook)}">
          </div>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-icons"></i> Ảnh nút liên hệ (floating buttons)</div>
        </div>
        <div style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px;">
          <p>Đặt ảnh riêng cho các nút liên hệ nổi góc phải. Để trống nếu muốn dùng icon mặc định.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">

          <div style="text-align:center;">
            <div id="ci-fb-preview" style="width:56px;height:56px;border-radius:50%;background:#0084FF;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;overflow:hidden;cursor:pointer;" onclick="document.getElementById('ci-fb-file').click();" title="Click để chọn ảnh">
              ${(data.contactIcons?.facebook) ? `<img src="${escHtml(data.contactIcons.facebook)}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fab fa-facebook-messenger" style="color:#fff;font-size:1.4rem;"></i>'}
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Facebook</label>
              <input class="form-input" id="ci-facebook" value="${escHtml(data.contactIcons?.facebook || '')}" placeholder="images/icons/fb.png" style="font-size:0.8rem;">
            </div>
            <input type="file" id="ci-fb-file" accept="image/*" style="display:none;" onchange="Admin.uploadContactIcon('facebook', this)">
            <button class="btn btn-sm btn-outline" style="margin-top:6px;width:100%;font-size:0.75rem;" onclick="document.getElementById('ci-fb-file').click();">
              <i class="fas fa-upload"></i> Upload ảnh
            </button>
            ${(data.contactIcons?.facebook) ? `<button class="btn btn-sm btn-outline" style="margin-top:4px;width:100%;font-size:0.75rem;color:var(--error);border-color:var(--error);" onclick="Admin.clearContactIcon('facebook')"><i class="fas fa-times"></i> Xóa ảnh</button>` : ''}
          </div>

          <div style="text-align:center;">
            <div id="ci-zalo-preview" style="width:56px;height:56px;border-radius:50%;background:#0068FF;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;overflow:hidden;cursor:pointer;" onclick="document.getElementById('ci-zalo-file').click();" title="Click để chọn ảnh">
              ${(data.contactIcons?.zalo) ? `<img src="${escHtml(data.contactIcons.zalo)}" style="width:100%;height:100%;object-fit:cover;">` : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="26" height="26" fill="#fff"><path d="M24 4C12.95 4 4 12.07 4 22c0 5.52 2.63 10.43 6.74 13.77-.17 2.08-.93 5.14-2.74 7.23 0 0 5.17-.87 9.06-3.47A22.18 22.18 0 0 0 24 40c11.05 0 20-8.07 20-18S35.05 4 24 4z"/></svg>'}
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Zalo</label>
              <input class="form-input" id="ci-zalo" value="${escHtml(data.contactIcons?.zalo || '')}" placeholder="images/icons/zalo.png" style="font-size:0.8rem;">
            </div>
            <input type="file" id="ci-zalo-file" accept="image/*" style="display:none;" onchange="Admin.uploadContactIcon('zalo', this)">
            <button class="btn btn-sm btn-outline" style="margin-top:6px;width:100%;font-size:0.75rem;" onclick="document.getElementById('ci-zalo-file').click();">
              <i class="fas fa-upload"></i> Upload ảnh
            </button>
            ${(data.contactIcons?.zalo) ? `<button class="btn btn-sm btn-outline" style="margin-top:4px;width:100%;font-size:0.75rem;color:var(--error);border-color:var(--error);" onclick="Admin.clearContactIcon('zalo')"><i class="fas fa-times"></i> Xóa ảnh</button>` : ''}
          </div>

          <div style="text-align:center;">
            <div id="ci-phone-preview" style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#E8A019,#FF6B2C);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;overflow:hidden;cursor:pointer;" onclick="document.getElementById('ci-phone-file').click();" title="Click để chọn ảnh">
              ${(data.contactIcons?.phone) ? `<img src="${escHtml(data.contactIcons.phone)}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-phone-alt" style="color:#fff;font-size:1.2rem;"></i>'}
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Điện thoại</label>
              <input class="form-input" id="ci-phone" value="${escHtml(data.contactIcons?.phone || '')}" placeholder="images/icons/phone.png">
            </div>
          </div>
        </div>
        <span class="form-hint" style="display:block;margin-top:12px;">Upload ảnh tại mục "Ảnh & Icon" hoặc nhập đường dẫn ảnh có sẵn. Khuyên dùng: ảnh vuông, trong suốt (PNG), 64×64px.</span>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-eye"></i> Xem trước</div>
        </div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:12px 16px;font-size:0.9rem;">
          ${info.address.office ? `
          <div style="color:var(--text-muted);"><i class="fas fa-map-marker-alt" style="color:var(--primary);width:16px;"></i> Trụ sở:</div>
          <div style="color:var(--text-primary);">${escHtml(info.address.office)}</div>` : ''}
          ${info.address.warehouse ? `
          <div style="color:var(--text-muted);"><i class="fas fa-warehouse" style="color:var(--primary);width:16px;"></i> Kho:</div>
          <div style="color:var(--text-primary);">${escHtml(info.address.warehouse)}</div>` : ''}
          ${info.hotline ? `
          <div style="color:var(--text-muted);"><i class="fas fa-phone-alt" style="color:var(--primary);width:16px;"></i> Hotline:</div>
          <div style="color:var(--primary);font-weight:600;">${escHtml(info.hotline)}${info.contactPerson ? ` (${escHtml(info.contactPerson)})` : ''}</div>` : ''}
          ${info.email ? `
          <div style="color:var(--text-muted);"><i class="fas fa-envelope" style="color:var(--primary);width:16px;"></i> Email:</div>
          <div style="color:var(--text-primary);">${escHtml(info.email)}</div>` : ''}
          ${info.website ? `
          <div style="color:var(--text-muted);"><i class="fas fa-globe" style="color:var(--primary);width:16px;"></i> Web:</div>
          <div style="color:var(--text-primary);">${escHtml(info.website)}</div>` : ''}
          ${info.facebook ? `
          <div style="color:var(--text-muted);"><i class="fab fa-facebook" style="color:var(--primary);width:16px;"></i> FB:</div>
          <div style="color:var(--text-primary);">${escHtml(info.facebook)}</div>` : ''}
        </div>
      </div>
    `;
  }

  function saveContact() {
    data.siteInfo.address.office = getVal('ct-office');
    data.siteInfo.address.warehouse = getVal('ct-warehouse');
    data.siteInfo.hotline = getVal('ct-hotline');
    data.siteInfo.contactPerson = getVal('ct-person');
    data.siteInfo.email = getVal('ct-email');
    data.siteInfo.website = getVal('ct-website');
    data.siteInfo.facebook = getVal('ct-facebook');
    data.contactMap = getVal('ct-map');

    // Save contact icons
    if (!data.contactIcons) data.contactIcons = {};
    data.contactIcons.facebook = getVal('ci-facebook');
    data.contactIcons.zalo = getVal('ci-zalo');
    data.contactIcons.phone = getVal('ci-phone');

    persistData();
    showToast('Đã lưu thông tin liên hệ!', 'success');
    renderContent();
  }

  // Upload icon for a specific contact button
  async function uploadContactIcon(type, fileInput) {
    const file = fileInput?.files[0];
    if (!file) return;

    // Instant local preview + save as base64 data URL
    const previewIds = { facebook: 'ci-fb-preview', zalo: 'ci-zalo-preview', phone: 'ci-phone-preview' };
    const inputIds = { facebook: 'ci-facebook', zalo: 'ci-zalo', phone: 'ci-phone' };
    const previewEl = document.getElementById(previewIds[type]);
    const inputEl = document.getElementById(inputIds[type]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;

      // Show preview
      if (previewEl) previewEl.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;

      // Save base64 directly into data
      if (!data.contactIcons) data.contactIcons = {};
      data.contactIcons[type] = dataUrl;
      if (inputEl) inputEl.value = '(ảnh đã nhúng)';

      // Sync to localStorage so public site picks it up immediately
      try {
        localStorage.setItem('contactIcons', JSON.stringify(data.contactIcons));
      } catch(e) {}

      showToast(`Đã cập nhật ảnh ${type}! Refresh trang chính để thấy thay đổi.`, 'success');

      // Auto-push to GitHub if configured
      if (GitHubAPI.isConfigured()) {
        try {
          const json = JSON.stringify(data, null, 2);
          await GitHubAPI.commitFile('data/content.json', json, `Cập nhật icon ${type}`);
          showToast('Đã đẩy lên GitHub!', 'success');
        } catch (err) {
          showToast('Lỗi đẩy GitHub: ' + err.message, 'error');
        }
      }
    };
    reader.readAsDataURL(file);
  }

  function clearContactIcon(type) {
    if (!data.contactIcons) data.contactIcons = {};
    data.contactIcons[type] = '';
    const inputIds = { facebook: 'ci-facebook', zalo: 'ci-zalo', phone: 'ci-phone' };
    const inputEl = document.getElementById(inputIds[type]);
    if (inputEl) inputEl.value = '';

    // Sync to localStorage
    try {
      localStorage.setItem('contactIcons', JSON.stringify(data.contactIcons));
    } catch(e) {}

    showToast(`Đã xóa ảnh ${type}`, 'info');
    renderContent();

    // Auto-push if GitHub configured
    if (GitHubAPI.isConfigured()) {
      const json = JSON.stringify(data, null, 2);
      GitHubAPI.commitFile('data/content.json', json, `Xóa icon ${type}`)
        .then(() => showToast('Đã cập nhật website!', 'success'))
        .catch(err => showToast('Lỗi: ' + err.message, 'error'));
    }
  }

  // ============================================
  // MEDIA / IMAGE MANAGEMENT
  // ============================================
  function collectAllImages() {
    const images = [];
    // Hero
    if (data.heroSection.backgroundImage) {
      images.push({ path: data.heroSection.backgroundImage, label: 'Hero Banner', source: 'hero' });
    }
    // About (convention)
    images.push({ path: data.aboutContent.image || 'images/about.jpg', label: 'Ảnh giới thiệu', source: 'about' });
    // Product categories
    data.productCategories.forEach(cat => {
      if (cat.image) {
        images.push({ path: cat.image, label: `DM: ${cat.name}`, source: 'category' });
      }
      cat.products.forEach(p => {
        if (p.image && !images.find(i => i.path === p.image)) {
          images.push({ path: p.image, label: p.name, source: 'product' });
        }
      });
    });
    // Services
    data.services.forEach(s => {
      if (s.image && !images.find(i => i.path === s.image)) {
        images.push({ path: s.image, label: s.title, source: 'service' });
      }
    });
    // News
    data.news.forEach(n => {
      if (n.image && !images.find(i => i.path === n.image)) {
        images.push({ path: n.image, label: n.title, source: 'news' });
      }
    });
    return images;
  }

  function renderMedia() {
    const images = collectAllImages();
    const sourceLabels = { hero: 'Hero', about: 'Giới thiệu', category: 'Danh mục', product: 'Sản phẩm', service: 'Dịch vụ', news: 'Tin tức' };
    const sourceColors = { hero: '#E8A019', about: '#3B82F6', category: '#FF6B2C', product: '#22C55E', service: '#8B5CF6', news: '#EC4899' };

    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-upload"></i> Upload ảnh mới</div>
        </div>
        ${GitHubAPI.isConfigured() ? `
        <div style="margin-bottom:16px;color:var(--text-secondary);font-size:0.85rem;">
          <p>Chọn ảnh từ máy tính → tự động upload lên GitHub repository.</p>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Chọn ảnh</label>
            <input type="file" class="form-input" id="media-file" accept="image/*" style="padding:8px;">
          </div>
          <div class="form-group">
            <label class="form-label">Thư mục lưu</label>
            <select class="form-select" id="media-folder">
              <option value="images/products/">images/products/</option>
              <option value="images/news/">images/news/</option>
              <option value="images/">images/ (gốc)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Tên file (để trống = giữ tên gốc)</label>
          <input class="form-input" id="media-filename" placeholder="VD: than-cuc-moi.jpg">
          <span class="form-hint">Tên file không dấu, dùng dấu gạch ngang. Đuôi file sẽ tự động thêm.</span>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <button class="btn btn-primary" id="btn-upload-img" onclick="Admin.uploadImage()">
            <i class="fas fa-cloud-upload-alt"></i> Upload lên GitHub
          </button>
          <span id="upload-status" style="font-size:0.85rem;color:var(--text-muted);"></span>
        </div>
        <div id="upload-preview" style="margin-top:16px;"></div>
        ` : `
        <div style="color:var(--warning);display:flex;align-items:center;gap:10px;">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <p style="font-weight:600;">Cần kết nối GitHub để upload ảnh</p>
            <p style="font-size:0.8rem;color:var(--text-muted);">Vào <a href="#" onclick="document.querySelector('[data-section=github-settings]').click();return false;" style="color:var(--primary);">Cài đặt GitHub</a> để thiết lập.</p>
          </div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--admin-border);color:var(--text-secondary);font-size:0.85rem;">
          <p><strong>Cách thủ công:</strong> Copy ảnh vào thư mục <code>images/products/</code> hoặc <code>images/news/</code> rồi nhập đường dẫn khi sửa sản phẩm/tin tức.</p>
        </div>
        `}
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-th"></i> Tất cả ảnh đang dùng (${images.length})</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
          ${images.map(img => `
          <div style="background:var(--admin-bg);border:1px solid var(--admin-border);border-radius:8px;overflow:hidden;">
            <div style="height:120px;overflow:hidden;background:#111;display:flex;align-items:center;justify-content:center;">
              <img src="${escHtml(img.path)}" alt="${escHtml(img.label)}"
                style="width:100%;height:100%;object-fit:cover;"
                onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-image\' style=\'font-size:2rem;color:#333;\'></i>';">
            </div>
            <div style="padding:10px;">
              <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escHtml(img.label)}">${escHtml(img.label)}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escHtml(img.path)}">${escHtml(img.path)}</div>
              <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.65rem;padding:2px 8px;border-radius:10px;background:${sourceColors[img.source]}22;color:${sourceColors[img.source]};font-weight:600;">${sourceLabels[img.source]}</span>
                <button class="btn btn-sm btn-outline" style="padding:4px 8px;font-size:0.7rem;" onclick="navigator.clipboard.writeText('${escHtml(img.path)}');Admin.showCopyToast();" title="Copy đường dẫn">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title"><i class="fas fa-info-circle"></i> Hướng dẫn</div>
        </div>
        <div style="color:var(--text-secondary);font-size:0.85rem;line-height:1.8;">
          <p><strong>Cấu trúc thư mục ảnh:</strong></p>
          <div style="font-family:monospace;font-size:0.8rem;background:var(--admin-bg);padding:12px;border-radius:6px;margin:8px 0;">
            images/<br>
            ├── hero-banner.jpg &nbsp;&nbsp;<span style="color:var(--primary);">(Ảnh banner trang chủ)</span><br>
            ├── about.jpg &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:var(--primary);">(Ảnh giới thiệu)</span><br>
            ├── products/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:var(--primary);">(Ảnh sản phẩm)</span><br>
            └── news/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:var(--primary);">(Ảnh tin tức / dịch vụ)</span>
          </div>
          <p><strong>Kích thước khuyên dùng:</strong></p>
          <p>• Hero banner: 1920×1080px</p>
          <p>• Ảnh sản phẩm: 800×600px</p>
          <p>• Ảnh tin tức: 800×450px</p>
          <p>• Định dạng: JPG hoặc PNG, dưới 1MB</p>
        </div>
      </div>
    `;
  }

  async function uploadImage() {
    const fileInput = document.getElementById('media-file');
    const file = fileInput?.files[0];
    if (!file) {
      showToast('Vui lòng chọn file ảnh!', 'error');
      return;
    }

    const folder = getVal('media-folder');
    let filename = getVal('media-filename');
    if (!filename) {
      filename = file.name.toLowerCase().replace(/\s+/g, '-');
    } else {
      // Add extension if missing
      const ext = file.name.split('.').pop();
      if (!filename.includes('.')) filename += '.' + ext;
    }
    const destPath = folder + filename;

    // Preview
    const preview = document.getElementById('upload-preview');
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;max-height:150px;border-radius:8px;border:1px solid var(--admin-border);">`;
    };
    reader.readAsDataURL(file);

    const btn = document.getElementById('btn-upload-img');
    const status = document.getElementById('upload-status');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang upload...'; }
    if (status) status.textContent = 'Uploading ' + destPath + '...';

    try {
      await GitHubAPI.uploadImage(file, destPath);
      showToast(`Upload thành công: ${destPath}`, 'success');
      if (status) status.innerHTML = `<span style="color:var(--success);"><i class="fas fa-check"></i> ${destPath}</span>`;
      // Clear input
      fileInput.value = '';
      document.getElementById('media-filename').value = '';
    } catch (err) {
      showToast('Lỗi upload: ' + err.message, 'error');
      if (status) status.innerHTML = `<span style="color:var(--error);"><i class="fas fa-times"></i> Lỗi: ${err.message}</span>`;
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload lên GitHub'; }
    }
  }

  function showCopyToast() {
    showToast('Đã copy đường dẫn ảnh!', 'info');
  }

  function resetDraft() {
    if (!confirm('Bạn có chắc muốn xóa bản nháp hiện tại và reset về dữ liệu gốc từ content.json? Mọi thay đổi chưa được đẩy lên GitHub hoặc xuất JSON sẽ bị mất.')) return;
    localStorage.removeItem('siteContent');
    showToast('Đã reset dữ liệu nháp!', 'info');
    setTimeout(() => {
      location.reload();
    }, 500);
  }

  function togglePasswordVisibility(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      iconEl.classList.remove('fa-eye');
      iconEl.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      iconEl.classList.remove('fa-eye-slash');
      iconEl.classList.add('fa-eye');
    }
  }

  return {
    init,
    saveSiteInfo,
    saveHero,
    saveAbout,
    saveContact,
    saveCategory,
    openProductModal,
    editProduct,
    deleteProduct,
    openServiceModal,
    editService,
    deleteService,
    openNewsModal,
    editNews,
    deleteNews,
    exportJSON,
    pushToGitHub,
    uploadImage,
    uploadContactIcon,
    clearContactIcon,
    showCopyToast,
    resetDraft,
    handleLogin,
    handleLogout,
    changePassword,
    openChangePasswordModal,
    togglePasswordVisibility,
    saveGitHubSettings,
    clearGitHubSettings,
    testGitHubConnection,
    closeModal,
    saveModal,
    handleProductImageChange,
    handleCategoryImageChange,
    handleArticleImageChange,
    handleAboutImageChange,
    openCategoryModal,
    deleteCategory,
  };
})();

document.addEventListener('DOMContentLoaded', () => Admin.init());
