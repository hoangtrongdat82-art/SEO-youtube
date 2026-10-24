# SEO YouTube – bản sửa lỗi cài đặt Vercel

## Lỗi đã khắc phục

Vercel dừng ở `npm install` với `ERESOLVE` vì dự án sử dụng `vite@^8.3.0`, trong khi khai báo trực tiếp `esbuild@^0.25.0`. Vite 8.3.5 yêu cầu `esbuild@^0.27.0 || ^0.28.0` ở dạng optional peer dependency.

- `package.json`: nâng `devDependencies.esbuild` thành `^0.28.2` để tương thích Vite 8.
- `vercel.json`: dùng đường dẫn đích API rõ ràng `/api/index` cho hàm `api/index.ts`.
- Toàn bộ thành phần giao diện, API và tập tin dự án khác được giữ nguyên.

## Cách cập nhật dự án liên kết GitHub

1. Giải nén ZIP. Mở thư mục `SEO-youtube-main` bên trong.
2. Tải **nội dung của thư mục** lên gốc repository `SEO-youtube` trên nhánh `main` ở GitHub, thay thế các file trùng tên (tối thiểu `package.json` và `vercel.json`).
3. Nhấn **Commit changes** trên GitHub. Vercel sẽ tự chạy một lần triển khai mới nếu đã bật kết nối GitHub.
4. Kiểm tra cài đặt Vercel: Framework Preset = **Vite**, Build Command = `npm run build`, Output Directory = `dist`, Root Directory là thư mục chứa `package.json`.
5. Nếu sử dụng Gemini API Key mặc định phía máy chủ, thiết lập biến môi trường `GEMINI_API_KEY` trong Settings > Environment Variables và triển khai lại.

Với bản ZIP này, chưa tạo `package-lock.json` vì môi trường sửa file không truy cập được npm registry để cài và khoá phiên bản. Vercel sẽ tự chạy `npm install`.

## Lưu ý quan trọng trước khi mở thanh toán thật

Ứng dụng hiện lưu thông tin đơn hàng và cấu hình SePay trong file `data/sepay_store.json`. Hệ thống tập tin của Vercel Functions không dùng được làm cơ sở dữ liệu lâu dài, nên đơn hàng/cấu hình có thể không được ghi hoặc bị mất. Ngoài ra, mã nguồn gốc đang có API quản trị và API mô phỏng thanh toán chưa được bảo vệ xác thực đầy đủ. **Không dùng chức năng thanh toán thật hoặc dữ liệu khách hàng thật trên Vercel cho đến khi chuyển sang một cơ sở dữ liệu bền vững và bổ sung xác thực, phân quyền bảo mật.**

Bản sửa này tập trung vào lỗi xung đột thư viện gây dừng `npm install`; chưa thể xác minh toàn bộ quá trình build vì môi trường kiểm tra không kết nối được npm registry.
