# Hướng Dẫn Triển Khai Game Trắc Nghiệm Trực Tuyến

Dự án mã nguồn mở mini giúp tổ chức các trò chơi trắc nghiệm loại trừ theo thời gian thực (Battle Royale style), lý tưởng cho các sự kiện trường học hoặc sinh hoạt câu lạc bộ. Được xây dựng bằng **Node.js, Express và Socket.IO**.

## Bước 1: Chạy thử nghiệm trên máy tính cá nhân (Local)
1. Cài đặt [Node.js](https://nodejs.org/) (chọn bản LTS).
2. Mở Terminal hoặc Command Prompt tại thư mục chứa mã nguồn này.
3. Chạy lệnh cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
4. Khởi động máy chủ:
   ```bash
   npm start
   ```
5. Mở trình duyệt web để kiểm tra:
   - Giao diện người chơi: `http://localhost:3000`
   - Giao diện Admin: `http://localhost:3000/admin.html`

## Bước 2: Đẩy mã nguồn lên GitHub
1. Đăng nhập GitHub và tạo một Repository mới (ví dụ: `cva-trivia-game`).
2. Mở Terminal tại thư mục dự án và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "Khởi tạo dự án game trắc nghiệm"
   git branch -M main
   git remote add origin <ĐƯỜNG_LINK_GITHUB_CỦA_BẠN>
   git push -u origin main
   ```

## Bước 3: Triển khai lên Render hoặc Railway (Miễn phí)
1. Truy cập Render.com và đăng nhập bằng GitHub.
2. Chọn **New** -> **Web Service**.
3. Kết nối với Repository `cva-trivia-game`.
4. Cấu hình: Runtime: `Node`, Build Command: `npm install`, Start Command: `npm start`.
5. Chọn gói **Free** và bấm **Create Web Service**.
