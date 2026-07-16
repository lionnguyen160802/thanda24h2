# Than Đá Thái Bình - Website tĩnh

Website giới thiệu Công ty TNHH Than Đá Thái Bình - chuyên cung cấp than đá các loại.

## Cấu trúc thư mục

```
thanda24h/
├── index.html              # Trang chính (SPA)
├── admin.html              # Trang quản lý nội dung
├── css/
│   ├── style.css           # Style trang public
│   └── admin.css           # Style trang admin
├── js/
│   ├── app.js              # Logic SPA, routing, render
│   ├── data-loader.js      # Load & cache content.json
│   └── admin.js            # Logic trang admin (CRUD)
├── data/
│   └── content.json        # Toàn bộ nội dung website
├── images/                 # Hình ảnh
│   ├── hero-banner.jpg
│   ├── about.jpg
│   ├── products/           # Ảnh sản phẩm
│   └── news/               # Ảnh tin tức
└── README.md
```

## Chạy local

Website cần chạy qua local server (do fetch JSON):

```bash
# Cách 1: dùng npx serve
npx serve .

# Cách 2: dùng Python
python -m http.server 8080

# Cách 3: dùng VS Code Live Server extension
```

Sau đó mở trình duyệt:
- **Trang chính**: http://localhost:3000 (hoặc port tương ứng)
- **Trang admin**: http://localhost:3000/admin.html

## Deploy lên GitHub Pages

1. Tạo repository trên GitHub (ví dụ đặt tên là `thanda24h`)
2. Push code lên repo bằng Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TÊN_TÀI_KHOẢN_GITHUB/thanda24h.git
   git push -u origin main
   ```
3. Truy cập vào repo của bạn trên **GitHub > Settings > Pages**:
   - Ở mục **Build and deployment**, phần **Source** chọn `Deploy from a branch`.
   - Phần **Branch** chọn `main` và thư mục `/ (root)`. Nhấn **Save**.
4. Chờ 1-2 phút, GitHub sẽ xuất bản trang web tĩnh của bạn tại địa chỉ: `https://TÊN_TÀI_KHOẢN_GITHUB.github.io/thanda24h/`

## Kết nối Admin trực tiếp với GitHub (Tự động cập nhật online)

Thay vì phải xuất file JSON rồi copy thủ công, bạn có thể thiết lập để trang Admin tự động lưu và đẩy code lên GitHub mỗi khi bạn ấn nút Lưu.

### Bước 1: Tạo GitHub Personal Access Token (PAT)
1. Đăng nhập GitHub, nhấn vào ảnh đại diện ở góc trên bên phải > chọn **Settings**.
2. Kéo xuống cuối cột bên trái chọn **Developer settings**.
3. Chọn **Personal access tokens** > **Tokens (classic)**.
4. Nhấn nút **Generate new token** > chọn **Generate new token (classic)**.
5. Điền thông tin:
   - **Note**: `admin-thanda` (tên gợi nhớ)
   - **Expiration**: Chọn số ngày hết hạn (ví dụ 90 days hoặc No expiration để dùng lâu dài).
   - **Select scopes**: Tích chọn duy nhất ô **`repo`** (đây là quyền đọc/ghi mã nguồn).
6. Cuộn xuống cuối trang nhấn **Generate token**.
7. **Copy đoạn mã bắt đầu bằng `ghp_...`** vừa hiện ra và lưu lại (mã này chỉ hiện 1 lần duy nhất).

### Bước 2: Cấu hình trên trang Admin
1. Mở trang quản trị (đang chạy local hoặc link online của bạn: `https://.../admin.html`).
2. Vào mục **Cài đặt GitHub** ở cột menu bên trái.
3. Điền các thông tin:
   - **Personal Access Token**: Dán mã `ghp_...` vừa copy ở Bước 1 vào (nhấn icon mắt để kiểm tra).
   - **Owner**: Tên tài khoản GitHub của bạn (ví dụ: `nguyen1608`).
   - **Repository name**: Tên repo bạn đã tạo ở trên (ví dụ: `thanda24h`).
   - **Branch**: `main`.
4. Nhấn **Lưu cài đặt** > Sau đó nhấn nút **Kiểm tra kết nối** bên cạnh. Nếu hiện *"Kết nối thành công!"* màu xanh lá là đã hoàn tất!

### Bước 3: Cách cập nhật Website online
1. Từ bây giờ, mỗi khi bạn vào Admin thêm/sửa sản phẩm, sửa bài viết hay đổi ảnh...
2. Các thay đổi sẽ tự động lưu nháp để bạn xem trước trên máy.
3. Khi bạn muốn đưa lên trực tuyến cho khách xem, bạn chỉ cần nhấn nút **"Đẩy lên GitHub"** ở thanh trên cùng (Topbar).
4. Hệ thống sẽ tự động commit file dữ liệu mới và đẩy lên GitHub. Website online của bạn sẽ được GitHub Pages build và cập nhật tự động sau **1 đến 2 phút**!

## Quản lý nội dung

### Quy trình chỉnh sửa:

1. Mở `admin.html` trên trình duyệt (qua local server)
2. Chọn mục cần chỉnh sửa ở sidebar:
   - **Thông tin chung**: tên công ty, hotline, email, địa chỉ...
   - **Hero Banner**: tiêu đề, mô tả trang chủ
   - **Giới thiệu**: nội dung trang giới thiệu
   - **Sản phẩm**: thêm/sửa/xóa sản phẩm (30 sản phẩm)
   - **Dịch vụ**: thêm/sửa/xóa bài viết dịch vụ
   - **Tin tức**: thêm/sửa/xóa bài viết tin tức
3. Nhấn **"Xuất JSON"** để tải file `content.json` mới
4. Copy file JSON vào thư mục `data/` (thay thế file cũ)
5. Commit & push lên GitHub

### Thêm hình ảnh:

1. Copy ảnh vào thư mục `images/products/` hoặc `images/news/`
2. Trong admin, nhập đường dẫn ảnh (VD: `images/products/ten-anh.jpg`)
3. Xuất JSON và push lên Git

## Tính năng

- ✅ SPA (Single Page Application) với hash routing
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark theme với hiệu ứng glassmorphism
- ✅ Micro-animations & scroll reveal
- ✅ Trang admin quản lý nội dung
- ✅ CRUD sản phẩm, dịch vụ, tin tức
- ✅ Export/Import JSON
- ✅ SEO meta tags
- ✅ Tối ưu cho GitHub Pages

## Liên hệ

- **Hotline/Zalo**: 0932 087 568 (Mr. Sơn)
- **Email**: congtythannamson@gmail.com
- **Website**: www.thanda.vn
