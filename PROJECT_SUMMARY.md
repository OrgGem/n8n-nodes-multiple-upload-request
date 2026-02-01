# Tóm tắt Project

## Thông tin chung
- **Tên**: n8n Multiple Upload Request Node
- **Version**: 0.1.0
- **Loại**: n8n community node package
- **Mục đích**: Upload nhiều file nhị phân động với pattern filtering

## Chức năng chính

### 1. Upload nhiều file động
Node này cho phép upload nhiều binary files từ n8n workflow lên server thông qua HTTP requests (POST/PUT/PATCH).

### 2. Lọc file theo pattern
- Hỗ trợ wildcard patterns: `*` (nhiều ký tự), `?` (1 ký tự)
- Ví dụ: `*.jpg`, `image_*`, `file_?.pdf`
- Case-insensitive matching

### 3. Authentication linh hoạt
- **None**: Không authentication
- **Bearer Token**: Sử dụng Bearer token
- **Custom Header**: Custom header authentication động

### 4. Tùy chỉnh request
- **Form Fields**: Thêm các field text vào form data
- **Query Parameters**: Thêm params vào URL
- **Custom Headers**: Thêm headers tùy chỉnh
- **Timeout**: Cấu hình timeout
- **SSL Options**: Ignore SSL validation

### 5. Xử lý binary data
- Hỗ trợ nhiều binary property (comma-separated)
- Tự động tạo multipart/form-data
- Bảo toàn filename và content-type

## Cấu trúc code

### Node Implementation
```
nodes/MultipleUploadRequest/
├── MultipleUploadRequest.node.ts   (236 lines) - Logic chính
├── description.ts                  (192 lines) - UI definitions
├── utils.ts                        (37 lines)  - Pattern matching
└── *.svg                                       - Icons
```

### Credentials
```
credentials/
├── BearerTokenAuthApi.credentials.ts      (41 lines)
└── CustomHeaderAuthApi.credentials.ts     (32 lines)
```

## Technical Highlights

### Pattern Matching Algorithm
```typescript
// Chuyển wildcard pattern sang regex
const escapedPattern = pattern
  .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // Escape special chars
  .replace(/\*/g, '.*')                   // * → .*
  .replace(/\?/g, '.');                   // ? → .

const regex = new RegExp(`^${escapedPattern}$`, 'i');
```

### Authentication Handling
- **None**: Direct `httpRequest()`
- **Bearer**: Dùng `httpRequestWithAuthentication()`
- **Custom Header**: Manual header injection (tránh dynamic key issues)

### Binary Processing
1. Lấy binary data từ input items
2. Lọc theo pattern
3. Convert sang Buffer với `getBinaryDataBuffer()`
4. Tạo form-data với filename + mimeType
5. Upload qua HTTP request

## Use Cases

1. **Form submissions**: Upload ảnh từ webhook forms
2. **Batch operations**: Upload documents hàng loạt
3. **Backups**: Backup files lên cloud storage
4. **Image pipelines**: Upload ảnh đã xử lý
5. **Multi-tenant**: Upload files với dynamic auth

## Công nghệ

- **TypeScript** - Type safety
- **n8n-workflow** - n8n SDK
- **Node.js v22+** - Runtime
- **Multipart form-data** - File upload protocol

## Documentation

- **README.md** (276 lines) - Tiếng Việt
- **README_EN.md** (276 lines) - English
- **TESTING_GUIDE.md** - Test scenarios
- **IMPLEMENTATION_SUMMARY.md** - Technical details

## Commands

```bash
npm run dev          # Development với hot reload
npm run build        # Production build
npm run lint         # Check code
npm run lint:fix     # Auto-fix issues
```

## Status

✅ Hoàn thành implementation
✅ Documentation đầy đủ (VN + EN)
✅ Type-safe với TypeScript
✅ Support 3 authentication methods
✅ Robust error handling
✅ Pattern filtering với wildcards
✅ Multipart upload ready

## Repository

**GitHub**: https://github.com/OrgGem/n8n-nodes-multiple-upload-request
