# LogisticsApp

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

<a id="english"></a>
## 🇬🇧 English

[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Next.js_|_NestJS_|_MongoDB_|_Expo-blue)](https://github.com/your-repo)

**LogisticsApp** is a comprehensive B2B Mini-ERP system tailored for export trading and logistics management. It is designed as a full-stack monorepo featuring multiple interconnected services to handle different user roles including Administrators, Drivers, Warehouse Staff, and End Users.

###  Architecture & Modules

- **Admin (`/Admin`)**: Comprehensive web dashboard and backend services for system administrators and managers.
- **Driver (`/Driver`)**: Mobile application (Expo/React Native) and backend for delivery drivers to track and manage shipments.
- **Staff Warehouse (`/StaffWarehouse`)**: Client and server applications for warehouse operations, inventory tracking, and fulfillment.
- **User / Customer (`/User` & `/UserWeb`)**: Web/Mobile interfaces and backend services for B2B customers, including an integrated AI ChatBox.

###  Tech Stack

- **Frontend**: Next.js (App Router), React, React Native (Expo), Tailwind CSS.
- **Backend**: NestJS, TypeScript, Express (Node.js).
- **Database**: MongoDB (Mongoose).
- **AI Integration**: Custom models (.safetensors, .pack) via ChatBox module.

###  Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/LogisticsApp.git
   cd LogisticsApp
   ```
2. Install dependencies for the specific module you want to run. For example, to run the Admin Dashboard:
   ```bash
   cd Admin/admingiaohang/admin-dashboard
   npm install
   npm run dev
   ```

###  Coding Conventions & Rules (Strict)

1. **Database ID Rule**: All primary keys and references MUST use `_id`. Never map to `id` or `uuid`.
2. **User Identification**: User identification must always use `username` (e.g., `created_by_username`). Never use email or user_id as a primary identifier.
3. **Backend Architecture**: Follow a flat NestJS module structure (`controller`, `service`, `dto`, `schemas`). Do not over-engineer with domain/use-case layers.
4. **Error Handling**: Use NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, etc.).
5. **Strict TypeScript**: Avoid `any`. Define clear types/interfaces for everything.
6. **Frontend Fetching**: Separate API logic into a `services/` folder and use hooks to manage data/loading/error states. Never fetch directly in UI components.
7. **Component Reusability**: Do not duplicate UI components. Always check `components/ui/` or `components/shared/` before creating a new one.

---

<a id="tiếng-việt"></a>
## 🇻🇳 Tiếng Việt

[![Tech Stack](https://img.shields.io/badge/Tech_Stack-Next.js_|_NestJS_|_MongoDB_|_Expo-blue)](https://github.com/your-repo)

**LogisticsApp** là một hệ thống B2B Mini-ERP toàn diện dành riêng cho hoạt động thương mại xuất khẩu và quản lý logistics. Dự án được thiết kế theo dạng hệ sinh thái đa dịch vụ (monorepo) để xử lý các phân quyền người dùng khác nhau.

###  Kiến Trúc & Phân Hệ

- **Admin (`/Admin`)**: Trang web quản trị (Dashboard) và backend phục vụ cho Quản lý hệ thống.
- **Driver (`/Driver`)**: Ứng dụng di động (Expo/React Native) và backend dành cho tài xế giao nhận để theo dõi tiến độ đơn hàng.
- **Staff Warehouse (`/StaffWarehouse`)**: Ứng dụng client và server dành cho hoạt động vận hành kho bãi, kiểm kê.
- **User / Customer (`/User` & `/UserWeb`)**: Giao diện web/mobile và backend dành cho khách hàng B2B, tích hợp module AI ChatBox hỗ trợ khách hàng.

###  Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: Next.js (App Router), React, React Native (Expo), Tailwind CSS.
- **Backend**: NestJS, TypeScript.
- **Database**: MongoDB (Mongoose).
- **AI Integration**: Các mô hình AI nội bộ (.safetensors, .pack) qua module ChatBox.

###  Hướng Dẫn Cài Đặt

1. Clone dự án:
   ```bash
   git clone https://github.com/your-organization/LogisticsApp.git
   cd LogisticsApp
   ```
2. Cài đặt thư viện cho phân hệ bạn muốn chạy. Ví dụ, để chạy Admin Dashboard:
   ```bash
   cd Admin/admingiaohang/admin-dashboard
   npm install
   npm run dev
   ```

###  Tiêu Chuẩn & Quy Tắc Viết Code (Bắt Buộc)

1. **Quy tắc Database ID**: Mọi khóa chính và reference ID bắt buộc dùng `_id`. Không được phép map đổi thành `id` hay `uuid`.
2. **Quy tắc Định danh User**: Định danh người dùng phải dùng `username` (vd: `created_by_username`). Không dùng `email` hoặc `user_id` làm khóa nghiệp vụ.
3. **Kiến trúc Backend (NestJS)**: Giữ cấu trúc module phẳng (`controller`, `service`, `dto`, `schemas`). Tránh over-engineering.
4. **Xử lý Lỗi (Error Handling)**: Bắt buộc dùng NestJS built-in exceptions. Không throw Error tùy tiện.
5. **Strict TypeScript**: Tuyệt đối không dùng `any` và `@ts-ignore`. Định nghĩa rõ ràng type/interface.
6. **Logic API Frontend**: Tách riêng API logic vào thư mục `services/` và sử dụng custom hooks để xử lý loading/error/data. Không gọi API phức tạp trực tiếp trong file UI Component.
7. **Tái Sử Dụng Component**: Bắt buộc kiểm tra và tái sử dụng component trong `components/ui/` hoặc `components/shared/` trước khi tạo mới. DRY (Don't Repeat Yourself) là ưu tiên hàng đầu.
