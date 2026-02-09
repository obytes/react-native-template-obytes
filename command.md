# Lệnh chạy căn bản

Dùng **pnpm** (không dùng `npx expo`). Chạy trong thư mục gốc project.

## Cài đặt

| Lệnh | Mô tả |
|------|--------|
| `brew install pnpm` | Cài pnpm (macOS) |
| `pnpm install` | Cài dependency |

## Chạy app

### Expo Go (preview nhanh, không cần build native)

| Lệnh | Mô tả |
|------|--------|
| `pnpm start:go` | Chạy dev server, mở bằng Expo Go (quét QR / bấm i, a, w) |
| `pnpm ios:go` | Chạy + mở luôn iOS Simulator (Expo Go) |
| `pnpm android:go` | Chạy + mở Android / quét QR (Expo Go) |

### Development build (đủ tính năng)

| Lệnh | Mô tả |
|------|--------|
| `pnpm start` | Chạy dev server |
| `pnpm ios` | Mở iOS Simulator (lần đầu: `pnpm prebuild` rồi `pnpm ios`) |
| `pnpm android` | Mở Android emulator |
| `pnpm web` | Chạy trên web |

### Theo môi trường

| Lệnh | Mô tả |
|------|--------|
| `pnpm start:preview` / `pnpm ios:preview` / `pnpm android:preview` | Môi trường preview |
| `pnpm start:production` / `pnpm ios:production` / `pnpm android:production` | Môi trường production |

## Build native & EAS

| Lệnh | Mô tả |
|------|--------|
| `pnpm prebuild` | Tạo thư mục ios/ android |
| `pnpm xcode` | Mở Xcode |
| `pnpm build:production:ios` | EAS build production iOS |
| `pnpm build:production:android` | EAS build production Android |

## Chất lượng code

| Lệnh | Mô tả |
|------|--------|
| `pnpm lint` | Chạy ESLint |
| `pnpm lint:fix` | ESLint + tự sửa |
| `pnpm type-check` | Kiểm tra TypeScript |
| `pnpm test` | Chạy Jest |
| `pnpm check-all` | Lint + type-check + lint translations + test |

## Khác

| Lệnh | Mô tả |
|------|--------|
| `pnpm doctor` | Kiểm tra môi trường Expo |

---

**Trong terminal khi đang chạy `pnpm start` hoặc `pnpm start:go`:** bấm `i` (iOS), `a` (Android), `w` (web), `s` (đổi sang Expo Go / dev build).
