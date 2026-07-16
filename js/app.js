// ============================================
// THAN ĐÁ THÁI BÌNH - MAIN APPLICATION
// SPA with hash-based routing
// ============================================

const App = (() => {
  let data = null;
  let currentPage = 'trang-chu';
  let currentCategory = 'all';

  // ============================================
  // INITIALIZATION
  // ============================================
  async function init() {
    try {
      data = await DataLoader.load();
      setupRouting();
      setupScrollEffects();
      setupBackToTop();
      hideLoader();
      handleRoute();
    } catch (err) {
      console.error('App init error:', err);
      document.getElementById('app').innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#ccc;flex-direction:column;gap:16px;">
          <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#E8A019;"></i>
          <h2>Không thể tải dữ liệu</h2>
          <p>Vui lòng chạy qua local server (npx serve .)</p>
        </div>`;
      hideLoader();
    }
  }

  function hideLoader() {
    setTimeout(() => {
      const loader = document.getElementById('page-loader');
      if (loader) loader.classList.add('hidden');
      setTimeout(() => loader && loader.remove(), 500);
    }, 300);
  }

  // ============================================
  // ROUTING
  // ============================================
  function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
  }

  function handleRoute() {
    const hash = window.location.hash.slice(1) || 'trang-chu';
    const parts = hash.split('/');
    currentPage = parts[0];

    const app = document.getElementById('app');

    // Render header + page + footer
    let html = renderHeader();

    switch (currentPage) {
      case 'trang-chu':
        html += renderHomePage();
        break;
      case 'gioi-thieu':
        html += renderAboutPage();
        break;
      case 'san-pham':
        if (parts[1]) {
          html += renderCategoryPage(parts[1]);
        } else {
          html += renderProductsPage();
        }
        break;
      case 'dich-vu':
        if (parts[1]) {
          html += renderServiceDetail(parts[1]);
        } else {
          html += renderServicesPage();
        }
        break;
      case 'tin-tuc':
        if (parts[1]) {
          html += renderNewsDetail(parts[1]);
        } else {
          html += renderNewsPage();
        }
        break;
      case 'lien-he':
        html += renderContactPage();
        break;
      case 'san-pham-detail':
        html += renderProductDetail(parts[1]);
        break;
      default:
        html += renderHomePage();
    }

    html += renderFooter();
    html += renderFloatingButtons();
    html += renderModal();

    app.innerHTML = html;

    // Post-render
    setupEventListeners();
    setupRevealAnimations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(page) {
    window.location.hash = page;
  }

  // ============================================
  // HEADER
  // ============================================
  function renderHeader() {
    const nav = data.navigation;
    return `
    <header class="header" id="main-header">
      <div class="header-inner">
        <a href="#trang-chu" class="logo">
          <div class="logo-icon"><i class="fas fa-fire"></i></div>
          <span>${data.siteInfo.shortName}</span>
        </a>

        <nav class="nav-desktop" id="nav-desktop">
          ${nav.map(item => {
            if (item.children) {
              return `
              <div class="nav-item">
                <a href="#san-pham" class="nav-link ${currentPage === item.id ? 'active' : ''}">
                  ${item.label} <i class="fas fa-chevron-down"></i>
                </a>
                <div class="nav-dropdown">
                  ${item.children.map(child => `
                    <a href="#san-pham/${child.id}">${child.label}</a>
                  `).join('')}
                </div>
              </div>`;
            }
            return `
            <div class="nav-item">
              <a href="#${item.id}" class="nav-link ${currentPage === item.id ? 'active' : ''}">${item.label}</a>
            </div>`;
          }).join('')}
        </nav>

        <a href="tel:${data.siteInfo.hotline}" class="header-hotline">
          <i class="fas fa-phone-alt"></i>
          ${data.siteInfo.hotline}
        </a>

        <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    <nav class="nav-mobile" id="nav-mobile">
      ${nav.map(item => {
        if (item.children) {
          return `
          <div class="nav-item">
            <a href="#san-pham" class="nav-link">${item.label}</a>
            <div class="nav-dropdown">
              ${item.children.map(child => `
                <a href="#san-pham/${child.id}">${child.label}</a>
              `).join('')}
            </div>
          </div>`;
        }
        return `<a href="#${item.id}" class="nav-link">${item.label}</a>`;
      }).join('')}
      <a href="tel:${data.siteInfo.hotline}" class="header-hotline mobile-hotline" style="margin-top:24px;">
        <i class="fas fa-phone-alt"></i>
        ${data.siteInfo.hotline} (${data.siteInfo.contactPerson})
      </a>
    </nav>`;
  }

  // ============================================
  // HOME PAGE
  // ============================================
  function renderHomePage() {
    return renderHero() + renderHighlights() + renderAboutSection() + renderProductSection() + renderNewsSection() + renderCTA();
  }

  function renderHero() {
    const hero = data.heroSection;
    // Generate particles
    let particles = '';
    for (let i = 0; i < 20; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const size = 2 + Math.random() * 4;
      particles += `<div class="particle" style="left:${left}%;animation-delay:${delay}s;width:${size}px;height:${size}px;"></div>`;
    }

    return `
    <section class="hero" id="hero-section">
      <div class="hero-bg">
        <img src="${hero.backgroundImage}" alt="Than đá" onerror="this.style.display='none'">
      </div>
      <div class="hero-particles">${particles}</div>
      <div class="hero-content">
        <div class="hero-badge"><i class="fas fa-gem"></i> ${data.siteInfo.shortName}</div>
        <h1>${hero.title}</h1>
        <div class="hero-slogan">"${data.siteInfo.slogan}"</div>
        <p class="hero-description">${hero.description}</p>
        <div class="hero-actions">
          <a href="#san-pham" class="btn btn-primary btn-lg">
            <i class="fas fa-cubes"></i> Xem sản phẩm
          </a>
          <a href="tel:${data.siteInfo.hotline}" class="btn btn-outline btn-lg">
            <i class="fas fa-phone-alt"></i> Liên hệ ngay
          </a>
        </div>
      </div>
    </section>`;
  }

  function renderHighlights() {
    const items = data.aboutContent.highlights;
    return `
    <section class="section section-dark">
      <div class="container">
        <div class="highlights-grid">
          ${items.map((item, i) => `
          <div class="highlight-card reveal reveal-delay-${i + 1}">
            <div class="highlight-icon"><i class="fas ${item.icon}"></i></div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function renderAboutSection() {
    const about = data.aboutContent;
    return `
    <section class="section" id="about-section">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-label">Về chúng tôi</div>
          <h2 class="section-title">${data.siteInfo.companyName}</h2>
          <p class="section-subtitle">${data.siteInfo.description}</p>
        </div>
        <div class="about-content">
          <div class="about-text reveal">
            <div class="about-slogan">"${data.siteInfo.slogan}"</div>
            <p>${about.intro}</p>
            <p>${about.experience}</p>
            <p>${about.products}</p>
            <div class="about-stats">
              <div class="stat-item">
                <span class="stat-number">10+</span>
                <span class="stat-label">Năm kinh nghiệm</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">500+</span>
                <span class="stat-label">Khách hàng</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">30+</span>
                <span class="stat-label">Sản phẩm</span>
              </div>
            </div>
          </div>
          <div class="about-image reveal">
            <img src="images/about.jpg" alt="Về Than Đá Thái Bình" onerror="this.parentElement.style.background='linear-gradient(135deg, #1E1E1E, #2A2A2A)';this.style.display='none'">
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderProductSection() {
    const categories = data.productCategories;
    const allProducts = categories.flatMap(cat => cat.products.map(p => ({ ...p, categoryName: cat.name })));

    return `
    <section class="section section-gradient" id="product-section">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-label">Sản phẩm</div>
          <h2 class="section-title">Sản phẩm <span class="highlight">than đá</span> của chúng tôi</h2>
          <p class="section-subtitle">Đa dạng các loại than đá chất lượng cao từ Việt Nam và nhập khẩu</p>
        </div>

        <div class="product-tabs reveal" id="product-tabs">
          <button class="product-tab active" data-category="all">Tất cả</button>
          ${categories.map(cat => `
            <button class="product-tab" data-category="${cat.id}">${cat.name}</button>
          `).join('')}
        </div>

        <div class="products-grid" id="products-grid">
          ${renderProductCards(allProducts.slice(0, 8))}
        </div>

        <div style="text-align:center;margin-top:var(--space-xl);" class="reveal">
          <a href="#san-pham" class="btn btn-outline">
            Xem tất cả sản phẩm <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>`;
  }

  function renderProductCards(products) {
    return products.map((p, i) => `
    <div class="product-card reveal reveal-delay-${(i % 4) + 1}" data-product-id="${p.id}">
      <div class="product-card-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%231E1E1E%22 width=%22400%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23555%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>Than đá</text></svg>'">
        <span class="product-card-badge">${p.categoryName || getCategoryName(p.category)}</span>
      </div>
      <div class="product-card-body">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="product-card-footer">
          <a href="tel:${data.siteInfo.hotline}" class="product-card-link">
            Liên hệ báo giá <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
    `).join('');
  }

  function getCategoryName(catId) {
    const cat = data.productCategories.find(c => c.id === catId);
    return cat ? cat.name : '';
  }

  function renderNewsSection() {
    const news = data.news.slice(0, 3);
    return `
    <section class="section section-dark" id="news-section">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-label">Tin tức</div>
          <h2 class="section-title">Tin tức <span class="highlight">ngành than</span></h2>
          <p class="section-subtitle">Cập nhật thông tin mới nhất về thị trường than đá</p>
        </div>
        <div class="news-grid">
          ${news.map((article, i) => `
          <div class="news-card reveal reveal-delay-${i + 1}">
            <a href="#tin-tuc/${article.id}">
              <div class="news-card-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy"
                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22><rect fill=%22%231E1E1E%22 width=%22400%22 height=%22200%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23555%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>Tin tức</text></svg>'">
              </div>
              <div class="news-card-body">
                <div class="news-card-date"><i class="fas fa-calendar-alt"></i> ${formatDate(article.date)}</div>
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
              </div>
            </a>
          </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin-top:var(--space-xl);" class="reveal">
          <a href="#tin-tuc" class="btn btn-outline">
            Xem tất cả tin tức <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>`;
  }

  function renderCTA() {
    return `
    <section class="cta-section">
      <div class="cta-bg"></div>
      <div class="container">
        <div class="cta-content reveal">
          <h2>Đăng ký nhận báo giá</h2>
          <p>Hãy đăng ký nhận báo giá ưu đãi nhất từ chúng tôi</p>
          <div class="cta-form">
            <input type="tel" placeholder="Số điện thoại của bạn" id="cta-phone">
            <button class="btn btn-primary" id="cta-submit">
              <i class="fas fa-paper-plane"></i> Gửi
            </button>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================
  // ABOUT PAGE
  // ============================================
  function renderAboutPage() {
    const about = data.aboutContent;
    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <span class="current">Giới thiệu</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="article-detail">
          <h1>Giới thiệu ${data.siteInfo.companyName}</h1>
          <div class="article-image">
            <img src="images/about.jpg" alt="Giới thiệu" onerror="this.parentElement.style.background='linear-gradient(135deg, #1E1E1E, #2A2A2A)';this.style.display='none'">
          </div>
          <div class="article-content">
            <p><strong>"${data.siteInfo.slogan}"</strong></p>
            <p>${about.intro}</p>
            <p>${about.experience}</p>
            <p>${about.products}</p>
            <p>${about.cta}</p>
            <p>Hotline/Zalo: <a href="tel:${data.siteInfo.hotline}" style="color:var(--primary);font-weight:600;">${data.siteInfo.hotline}</a> (${data.siteInfo.contactPerson})</p>
            <p><em>${about.closing}</em></p>
            <h3 style="margin-top:32px;margin-bottom:16px;color:var(--white);">Thông tin liên hệ</h3>
            <p><strong>Trụ sở chính:</strong> ${data.siteInfo.address.office}</p>
            <p><strong>Kho than:</strong> ${data.siteInfo.address.warehouse}</p>
            <p><strong>Email:</strong> ${data.siteInfo.email}</p>
            <p><strong>Website:</strong> <a href="http://${data.siteInfo.website}" style="color:var(--primary);">${data.siteInfo.website}</a></p>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================
  // PRODUCTS PAGE
  // ============================================
  function renderProductsPage() {
    const categories = data.productCategories;
    const allProducts = categories.flatMap(cat => cat.products.map(p => ({ ...p, categoryName: cat.name })));

    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <span class="current">Sản phẩm</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">Danh sách sản phẩm</div>
          <h2 class="section-title">Tất cả <span class="highlight">sản phẩm</span></h2>
        </div>

        <div class="product-tabs" id="product-tabs">
          <button class="product-tab active" data-category="all">Tất cả (${allProducts.length})</button>
          ${categories.map(cat => `
            <button class="product-tab" data-category="${cat.id}">${cat.name} (${cat.products.length})</button>
          `).join('')}
        </div>

        <div class="products-grid" id="products-grid">
          ${renderProductCards(allProducts)}
        </div>
      </div>
    </section>`;
  }

  function renderCategoryPage(catId) {
    const category = data.productCategories.find(c => c.id === catId);
    if (!category) return renderProductsPage();

    const products = category.products.map(p => ({ ...p, categoryName: category.name }));

    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <a href="#san-pham">Sản phẩm</a>
          <span class="separator">/</span>
          <span class="current">${category.name}</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">${category.name}</div>
          <h2 class="section-title">${category.name}</h2>
          <p class="section-subtitle">${category.description}</p>
        </div>
        <div class="products-grid" id="products-grid">
          ${renderProductCards(products)}
        </div>
      </div>
    </section>`;
  }

  function renderProductDetail(productId) {
    let product = null;
    let categoryName = '';
    for (const cat of data.productCategories) {
      const found = cat.products.find(p => p.id === productId);
      if (found) {
        product = found;
        categoryName = cat.name;
        break;
      }
    }
    if (!product) return '<div class="section"><div class="container"><p>Sản phẩm không tìm thấy.</p></div></div>';

    const specLabels = { kichCo: 'Kích cỡ', xuatXu: 'Xuất xứ', nhietTri: 'Nhiệt trị', loai: 'Loại', dongGoi: 'Đóng gói', gar: 'GAR', mau: 'Màu sắc', giaoHang: 'Giao hàng' };

    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <a href="#san-pham">Sản phẩm</a>
          <span class="separator">/</span>
          <a href="#san-pham/${product.category}">${categoryName}</a>
          <span class="separator">/</span>
          <span class="current">${product.name}</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="article-detail">
          <h1>${product.name}</h1>
          <div class="article-image">
            <img src="${product.image}" alt="${product.name}"
              onerror="this.parentElement.style.background='linear-gradient(135deg, #1E1E1E, #2A2A2A)';this.style.display='none'">
          </div>
          <div class="article-content">
            <p>${product.description}</p>
            ${product.specs ? `
            <h3 style="margin-top:24px;margin-bottom:16px;color:var(--white);">Thông số kỹ thuật</h3>
            <table class="specs-table">
              ${Object.entries(product.specs).map(([key, val]) => `
              <tr><td>${specLabels[key] || key}</td><td>${val}</td></tr>
              `).join('')}
            </table>
            ` : ''}
            <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;">
              <a href="tel:${data.siteInfo.hotline}" class="btn btn-primary">
                <i class="fas fa-phone-alt"></i> Gọi báo giá: ${data.siteInfo.hotline}
              </a>
              <a href="https://zalo.me/${data.siteInfo.hotline.replace(/\s/g, '')}" target="_blank" class="btn btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" fill="currentColor" style="vertical-align:middle;"><path d="M24 4C12.95 4 4 12.07 4 22c0 5.52 2.63 10.43 6.74 13.77-.17 2.08-.93 5.14-2.74 7.23 0 0 5.17-.87 9.06-3.47A22.18 22.18 0 0 0 24 40c11.05 0 20-8.07 20-18S35.05 4 24 4z"/></svg> Nhắn Zalo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================
  // SERVICES PAGE
  // ============================================
  function renderServicesPage() {
    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <span class="current">Dịch vụ</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">Dịch vụ</div>
          <h2 class="section-title">Dịch vụ <span class="highlight">cung cấp than</span></h2>
          <p class="section-subtitle">Chuyên cung cấp than đá các loại cho nhà máy và doanh nghiệp</p>
        </div>
        <div class="services-grid">
          ${data.services.map((svc, i) => `
          <a href="#dich-vu/${svc.id}" class="service-card reveal reveal-delay-${(i % 4) + 1}">
            <div class="service-card-icon"><i class="fas fa-cogs"></i></div>
            <div>
              <h3>${svc.title}</h3>
              <p>${svc.summary}</p>
            </div>
          </a>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function renderServiceDetail(serviceId) {
    const service = data.services.find(s => s.id === serviceId);
    if (!service) return '<div class="section"><div class="container"><p>Dịch vụ không tìm thấy.</p></div></div>';

    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <a href="#dich-vu">Dịch vụ</a>
          <span class="separator">/</span>
          <span class="current">${service.title}</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="article-detail">
          <h1>${service.title}</h1>
          <div class="article-image">
            <img src="${service.image}" alt="${service.title}"
              onerror="this.parentElement.style.background='linear-gradient(135deg, #1E1E1E, #2A2A2A)';this.style.display='none'">
          </div>
          <div class="article-content">
            <p>${service.content}</p>
            <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;">
              <a href="tel:${data.siteInfo.hotline}" class="btn btn-primary">
                <i class="fas fa-phone-alt"></i> Liên hệ: ${data.siteInfo.hotline}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================
  // NEWS PAGE
  // ============================================
  function renderNewsPage() {
    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <span class="current">Tin tức</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">Tin tức</div>
          <h2 class="section-title">Tin tức <span class="highlight">ngành than</span></h2>
        </div>
        <div class="news-grid">
          ${data.news.map((article, i) => `
          <div class="news-card reveal reveal-delay-${(i % 3) + 1}">
            <a href="#tin-tuc/${article.id}">
              <div class="news-card-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy"
                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22><rect fill=%22%231E1E1E%22 width=%22400%22 height=%22200%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23555%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>Tin tức</text></svg>'">
              </div>
              <div class="news-card-body">
                <div class="news-card-date"><i class="fas fa-calendar-alt"></i> ${formatDate(article.date)}</div>
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
              </div>
            </a>
          </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function renderNewsDetail(articleId) {
    const article = data.news.find(n => n.id === articleId);
    if (!article) return '<div class="section"><div class="container"><p>Bài viết không tìm thấy.</p></div></div>';

    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <a href="#tin-tuc">Tin tức</a>
          <span class="separator">/</span>
          <span class="current">${article.title}</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="article-detail">
          <h1>${article.title}</h1>
          <div class="article-meta">
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(article.date)}</span>
          </div>
          <div class="article-image">
            <img src="${article.image}" alt="${article.title}"
              onerror="this.parentElement.style.background='linear-gradient(135deg, #1E1E1E, #2A2A2A)';this.style.display='none'">
          </div>
          <div class="article-content">
            <p>${article.content}</p>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================
  // CONTACT PAGE
  // ============================================
  function renderContactPage() {
    const info = data.siteInfo;
    return `
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <a href="#trang-chu"><i class="fas fa-home"></i> Trang chủ</a>
          <span class="separator">/</span>
          <span class="current">Liên hệ</span>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">Liên hệ</div>
          <h2 class="section-title"><span class="highlight">${info.companyName}</span></h2>
        </div>
        <div class="contact-grid">
          <div class="contact-info-list">
            <div class="contact-info-item">
              <div class="contact-info-icon"><i class="fas fa-map-marker-alt"></i></div>
              <div>
                <h4>Trụ sở chính</h4>
                <p>${info.address.office}</p>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon"><i class="fas fa-warehouse"></i></div>
              <div>
                <h4>Kho than</h4>
                <p>${info.address.warehouse}</p>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon"><i class="fas fa-phone-alt"></i></div>
              <div>
                <h4>Hotline/Zalo</h4>
                <p><a href="tel:${info.hotline}">${info.hotline}</a> (${info.contactPerson})</p>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon"><i class="fas fa-envelope"></i></div>
              <div>
                <h4>Email</h4>
                <p><a href="mailto:${info.email}">${info.email}</a></p>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon"><i class="fas fa-globe"></i></div>
              <div>
                <h4>Website</h4>
                <p><a href="http://${info.website}" target="_blank">${info.website}</a></p>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon"><i class="fab fa-facebook-f"></i></div>
              <div>
                <h4>Facebook</h4>
                <p><a href="${info.facebook}" target="_blank">Fanpage Facebook</a></p>
              </div>
            </div>
          </div>

          <div class="contact-form">
            <h3 style="color:var(--white);margin-bottom:var(--space-md);">Gửi yêu cầu báo giá</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="contact-name">Họ và tên</label>
                <input type="text" id="contact-name" placeholder="Nhập họ tên">
              </div>
              <div class="form-group">
                <label for="contact-phone">Số điện thoại</label>
                <input type="tel" id="contact-phone" placeholder="Nhập SĐT">
              </div>
            </div>
            <div class="form-group">
              <label for="contact-email">Email</label>
              <input type="email" id="contact-email" placeholder="Nhập email">
            </div>
            <div class="form-group">
              <label for="contact-message">Nội dung</label>
              <textarea id="contact-message" rows="5" placeholder="Nhập yêu cầu của bạn..."></textarea>
            </div>
            <button class="btn btn-primary" id="contact-submit" style="align-self:flex-start;">
              <i class="fas fa-paper-plane"></i> Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ============================================
  // FOOTER
  // ============================================
  function renderFooter() {
    const info = data.siteInfo;
    const categories = data.productCategories;

    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="#trang-chu" class="logo">
              <div class="logo-icon"><i class="fas fa-fire"></i></div>
              <span>${info.shortName}</span>
            </a>
            <p>${info.description}</p>
            <div class="footer-social">
              <a href="${info.facebook}" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="https://zalo.me/${info.hotline.replace(/\s/g, '')}" target="_blank" aria-label="Zalo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16" fill="currentColor"><path d="M24 4C12.95 4 4 12.07 4 22c0 5.52 2.63 10.43 6.74 13.77-.17 2.08-.93 5.14-2.74 7.23 0 0 5.17-.87 9.06-3.47A22.18 22.18 0 0 0 24 40c11.05 0 20-8.07 20-18S35.05 4 24 4z"/></svg></a>
              <a href="tel:${info.hotline}" aria-label="Phone"><i class="fas fa-phone-alt"></i></a>
            </div>
          </div>

          <div class="footer-column">
            <h4>Trang</h4>
            <div class="footer-links">
              <a href="#trang-chu"><i class="fas fa-angle-right"></i> Trang chủ</a>
              <a href="#gioi-thieu"><i class="fas fa-angle-right"></i> Giới thiệu</a>
              <a href="#san-pham"><i class="fas fa-angle-right"></i> Sản phẩm</a>
              <a href="#dich-vu"><i class="fas fa-angle-right"></i> Dịch vụ</a>
              <a href="#tin-tuc"><i class="fas fa-angle-right"></i> Tin tức</a>
              <a href="#lien-he"><i class="fas fa-angle-right"></i> Liên hệ</a>
            </div>
          </div>

          <div class="footer-column">
            <h4>Sản phẩm</h4>
            <div class="footer-links">
              ${categories.map(cat => `
                <a href="#san-pham/${cat.id}"><i class="fas fa-angle-right"></i> ${cat.name}</a>
              `).join('')}
            </div>
          </div>

          <div class="footer-column">
            <h4>Liên hệ</h4>
            <div class="footer-contact-item"><i class="fas fa-map-marker-alt"></i> ${info.address.office}</div>
            <div class="footer-contact-item"><i class="fas fa-warehouse"></i> ${info.address.warehouse}</div>
            <div class="footer-contact-item"><i class="fas fa-phone-alt"></i> ${info.hotline} (${info.contactPerson})</div>
            <div class="footer-contact-item"><i class="fas fa-envelope"></i> ${info.email}</div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} ${info.companyName}. All rights reserved.</p>
          <p>Website: ${info.website}</p>
        </div>
      </div>
    </footer>`;
  }

  // ============================================
  // FLOATING BUTTONS
  // ============================================
  function renderFloatingButtons() {
    const info = data.siteInfo;
    // Merge: localStorage overrides > content.json
    const jsonIcons = data.contactIcons || {};
    let lsIcons = {};
    try { lsIcons = JSON.parse(localStorage.getItem('contactIcons') || '{}'); } catch(e) {}
    const icons = { ...jsonIcons, ...lsIcons };

    const fbIcon = icons.facebook
      ? `<img src="${icons.facebook}" alt="Facebook" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
      : `<i class="fab fa-facebook-messenger"></i>`;

    const zaloIcon = icons.zalo
      ? `<img src="${icons.zalo}" alt="Zalo" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="26" height="26" fill="currentColor"><path d="M24 4C12.95 4 4 12.07 4 22c0 5.52 2.63 10.43 6.74 13.77-.17 2.08-.93 5.14-2.74 7.23 0 0 5.17-.87 9.06-3.47A22.18 22.18 0 0 0 24 40c11.05 0 20-8.07 20-18S35.05 4 24 4z"/></svg>`;

    const phoneIcon = icons.phone
      ? `<img src="${icons.phone}" alt="Phone" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
      : `<i class="fas fa-phone-alt"></i>`;

    return `
    <div class="floating-phone">
      <a href="${info.facebook}" target="_blank" class="floating-btn floating-fb-btn" title="Facebook">
        ${fbIcon}
      </a>
      <a href="https://zalo.me/${info.hotline.replace(/\s/g, '')}" target="_blank" class="floating-btn floating-zalo-btn" title="Zalo">
        ${zaloIcon}
      </a>
      <a href="tel:${info.hotline}" class="floating-btn floating-phone-btn" title="Gọi ngay">
        ${phoneIcon}
      </a>
    </div>
    <button class="back-to-top" id="back-to-top" title="Lên đầu trang">
      <i class="fas fa-chevron-up"></i>
    </button>`;
  }

  // ============================================
  // MODAL (for product quick view)
  // ============================================
  function renderModal() {
    return `
    <div class="modal-overlay" id="product-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 id="modal-title" style="color:var(--white);font-weight:700;"></h3>
          <button class="modal-close" id="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-cta" id="modal-cta"></div>
      </div>
    </div>`;
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMobile = document.getElementById('nav-mobile');
    if (menuToggle && navMobile) {
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMobile.classList.toggle('active');
      });
      // Close mobile menu on link click
      navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menuToggle.classList.remove('active');
          navMobile.classList.remove('active');
        });
      });
    }

    // Product tabs
    const tabs = document.querySelectorAll('#product-tabs .product-tab');
    const grid = document.getElementById('products-grid');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const catId = tab.dataset.category;
        filterProducts(catId, grid);
      });
    });

    // Product card click → navigate to detail
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const productId = card.dataset.productId;
        if (productId) navigate('san-pham-detail/' + productId);
      });
    });

    // Modal close
    const modalOverlay = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Back to top
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // CTA form
    const ctaSubmit = document.getElementById('cta-submit');
    if (ctaSubmit) {
      ctaSubmit.addEventListener('click', () => {
        const phone = document.getElementById('cta-phone')?.value;
        if (phone) {
          alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại số ' + phone + ' sớm nhất.');
          document.getElementById('cta-phone').value = '';
        } else {
          alert('Vui lòng nhập số điện thoại.');
        }
      });
    }

    // Contact form
    const contactSubmit = document.getElementById('contact-submit');
    if (contactSubmit) {
      contactSubmit.addEventListener('click', () => {
        const name = document.getElementById('contact-name')?.value;
        const phone = document.getElementById('contact-phone')?.value;
        if (name && phone) {
          alert('Cảm ơn ' + name + '! Chúng tôi sẽ liên hệ lại bạn sớm nhất.');
        } else {
          alert('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
        }
      });
    }
  }

  // ============================================
  // PRODUCT FILTERING
  // ============================================
  function filterProducts(catId, gridEl) {
    if (!gridEl) return;

    let products;
    if (catId === 'all') {
      products = data.productCategories.flatMap(cat => cat.products.map(p => ({ ...p, categoryName: cat.name })));
    } else {
      const cat = data.productCategories.find(c => c.id === catId);
      products = cat ? cat.products.map(p => ({ ...p, categoryName: cat.name })) : [];
    }

    // Check if on home page (limit to 8)
    const isHome = currentPage === 'trang-chu';
    const displayProducts = isHome ? products.slice(0, 8) : products;

    gridEl.style.opacity = '0';
    gridEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      gridEl.innerHTML = renderProductCards(displayProducts);
      gridEl.style.transition = 'all 0.3s ease';
      gridEl.style.opacity = '1';
      gridEl.style.transform = 'translateY(0)';

      // Re-setup click events
      gridEl.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
          const productId = card.dataset.productId;
          if (productId) navigate('san-pham-detail/' + productId);
        });
      });
    }, 150);
  }

  // ============================================
  // MODAL
  // ============================================
  function openModal(productId) {
    let product = null;
    for (const cat of data.productCategories) {
      const found = cat.products.find(p => p.id === productId);
      if (found) { product = found; break; }
    }
    if (!product) return;

    const specLabels = { kichCo: 'Kích cỡ', xuatXu: 'Xuất xứ', nhietTri: 'Nhiệt trị', loai: 'Loại', dongGoi: 'Đóng gói', gar: 'GAR', mau: 'Màu sắc', giaoHang: 'Giao hàng' };

    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-body').innerHTML = `
      <div class="modal-image">
        <img src="${product.image}" alt="${product.name}"
          onerror="this.parentElement.style.background='linear-gradient(135deg, #1E1E1E, #2A2A2A)';this.style.display='none'">
      </div>
      <p>${product.description}</p>
      ${product.specs ? `
      <table class="specs-table">
        ${Object.entries(product.specs).map(([key, val]) => `<tr><td>${specLabels[key] || key}</td><td>${val}</td></tr>`).join('')}
      </table>` : ''}
    `;
    document.getElementById('modal-cta').innerHTML = `
      <a href="tel:${data.siteInfo.hotline}" class="btn btn-primary">
        <i class="fas fa-phone-alt"></i> Gọi: ${data.siteInfo.hotline}
      </a>
      <a href="https://zalo.me/${data.siteInfo.hotline.replace(/\s/g, '')}" target="_blank" class="btn btn-outline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" fill="currentColor" style="vertical-align:middle;"><path d="M24 4C12.95 4 4 12.07 4 22c0 5.52 2.63 10.43 6.74 13.77-.17 2.08-.93 5.14-2.74 7.23 0 0 5.17-.87 9.06-3.47A22.18 22.18 0 0 0 24 40c11.05 0 20-8.07 20-18S35.05 4 24 4z"/></svg> Zalo
      </a>
    `;

    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('product-modal')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============================================
  // SCROLL EFFECTS
  // ============================================
  function setupScrollEffects() {
    window.addEventListener('scroll', () => {
      const header = document.getElementById('main-header');
      const backToTop = document.getElementById('back-to-top');

      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }

      if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 500);
      }
    });
  }

  function setupBackToTop() {
    // Already handled in scroll effects
  }

  // ============================================
  // REVEAL ANIMATIONS (Intersection Observer)
  // ============================================
  function setupRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ============================================
  // UTILITIES
  // ============================================
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return { init, navigate, openModal, closeModal };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
