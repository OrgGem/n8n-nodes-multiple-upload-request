![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n Multiple Upload Request Node

Một n8n community node chuyên dụng để upload nhiều file nhị phân (binary files) động với khả năng lọc theo pattern và hỗ trợ authentication.

**Tiếng Việt** | [English](README_EN.md)

## Tính năng chính

✨ **Upload nhiều file động** - Tự động upload tất cả các file nhị phân từ input hoặc lọc theo pattern

🎯 **Lọc file theo pattern** - Hỗ trợ wildcard patterns (`*`, `?`) để chọn lọc file cần upload

🔐 **Authentication linh hoạt** - Hỗ trợ Bearer Token, Custom Header, hoặc không authentication

🔧 **Tùy chỉnh linh hoạt** - Thêm form fields, query parameters, custom headers

📡 **HTTP Methods** - Hỗ trợ POST, PUT, PATCH requests

⚡ **Xử lý lỗi mạnh mẽ** - Continue on fail, timeout configuration, SSL validation options

## Cài đặt

```bash
npm install n8n-nodes-multiple-upload-request
```

## Cách sử dụng

### 1. Thêm node vào workflow
Tìm kiếm **"Multiple Upload Request"** trong danh sách nodes của n8n.

### 2. Cấu hình cơ bản

**Authentication**: Chọn phương thức xác thực
- **None**: Không cần xác thực
- **Bearer Token**: Sử dụng Bearer token (cần credential)
- **Custom Header**: Sử dụng custom header authentication (cần credential)

**Request Method**: Chọn HTTP method (POST/PUT/PATCH)

**URL**: URL endpoint để upload file

**File Pattern**: Pattern để lọc file (mặc định: `*` - tất cả file)
- `*` - Upload tất cả file
- `*.jpg` - Chỉ upload file .jpg
- `image_*` - Upload file bắt đầu bằng "image_"
- `file_?.pdf` - Upload file như file_1.pdf, file_a.pdf

**Binary Property Name**: Tên property chứa binary data (mặc định: `data`)
- Có thể nhập nhiều property, phân cách bằng dấu phẩy: `data, file, attachment`

### 3. Tùy chọn nâng cao

#### Additional Form Fields
Thêm các field text vào form data cùng với file upload.

#### Query Parameters
Thêm query parameters vào URL request.

#### Additional Headers
Thêm custom headers vào request (ví dụ: Content-Type, X-Custom-Header).

#### Timeout
Cấu hình thời gian timeout cho request (mặc định: 10000ms).

#### Ignore SSL Issues
Bỏ qua lỗi SSL certificate validation (hữu ích cho môi trường development).

## Ví dụ sử dụng

### Ví dụ 1: Upload tất cả ảnh JPG
```
File Pattern: *.jpg
Binary Property Name: data
```

### Ví dụ 2: Upload nhiều file từ nhiều property
```
File Pattern: *
Binary Property Name: image, document, attachment
```

### Ví dụ 3: Upload với Bearer authentication
```
Authentication: Bearer Token
Request Method: POST
URL: https://api.example.com/upload
File Pattern: *
```

### Ví dụ 4: Upload với form fields bổ sung
```
Additional Form Fields:
  - userId: 12345
  - category: documents
  - tags: important,urgent
```

## Pattern Matching

Node hỗ trợ wildcard patterns để lọc file:

- `*` - Khớp với bất kỳ ký tự nào (0 hoặc nhiều)
- `?` - Khớp với đúng 1 ký tự
- Pattern không phân biệt hoa thường

**Ví dụ patterns:**
- `*.pdf` → Tất cả file PDF
- `report_*.xlsx` → Các file Excel bắt đầu bằng "report_"
- `image_?.png` → image_1.png, image_a.png, image_x.png
- `2024-??-*.jpg` → 2024-01-photo.jpg, 2024-12-image.jpg

## Credentials

### Bearer Token Authentication

Để sử dụng Bearer Token authentication:

1. Tạo credential mới loại **Bearer Token Auth**
2. Nhập Bearer token của bạn
3. Chọn credential này trong node

### Custom Header Authentication

Để sử dụng Custom Header authentication:

1. Tạo credential mới loại **Custom Header Auth**
2. Nhập Header Name (ví dụ: `X-API-Key`, `Authorization`)
3. Nhập Header Value (giá trị của header)
4. Chọn credential này trong node

## API Response

Node trả về response JSON từ server:

```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "files": [
    {
      "filename": "image1.jpg",
      "size": 102400,
      "url": "https://example.com/uploads/image1.jpg"
    }
  ]
}
```

## Xử lý lỗi

Node hỗ trợ Continue on Fail mode:
- Khi bật: Lỗi sẽ được trả về dưới dạng JSON và workflow tiếp tục
- Khi tắt: Lỗi sẽ dừng workflow

## Development

### Yêu cầu

- **[Node.js](https://nodejs.org/)** (v22 trở lên) và npm
- **[git](https://git-scm.com/downloads)**

### Clone và cài đặt

```bash
git clone https://github.com/OrgGem/n8n-nodes-multiple-upload-request.git
cd n8n-nodes-multiple-upload-request
npm install
```

### Development mode

Chạy n8n với node được load và hot reload enabled:

```bash
npm run dev
```

### Build

Build node cho production:

```bash
npm run build
```

### Lint và format

```bash
npm run lint
npm run lint:fix
```

## Testing

Xem [TESTING_GUIDE.md](TESTING_GUIDE.md) để biết chi tiết về các test scenarios và cách validate node.

## Use Cases

### 1. Upload ảnh từ form submission
Workflow nhận nhiều ảnh từ webhook form submission và upload lên cloud storage.

### 2. Batch upload documents
Upload hàng loạt documents từ một folder vào document management system.

### 3. Backup files
Định kỳ backup các file quan trọng lên remote storage với authentication.

### 4. Image processing pipeline
Upload ảnh đã xử lý (resize, watermark) lên CDN.

### 5. Multi-tenant file upload
Upload file của nhiều users khác nhau với dynamic authentication headers.

## Công nghệ sử dụng

- **TypeScript** - Type-safe development
- **n8n-workflow** - n8n SDK và types
- **Node.js** - Runtime environment
- **Multipart form-data** - File upload handling

## Cấu trúc thư mục

```
nodes/MultipleUploadRequest/
├── MultipleUploadRequest.node.ts  # Main node implementation
├── MultipleUploadRequest.node.json # Node metadata
├── description.ts                  # UI property definitions
├── utils.ts                        # Wildcard pattern matching
├── upload.svg                      # Light mode icon
└── upload.dark.svg                 # Dark mode icon

credentials/
├── BearerTokenAuthApi.credentials.ts      # Bearer token auth
└── CustomHeaderAuthApi.credentials.ts     # Custom header auth
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

- **Documentation**: [n8n docs](https://docs.n8n.io/)
- **Community**: [n8n community forum](https://community.n8n.io/)
- **Issues**: [GitHub Issues](https://github.com/OrgGem/n8n-nodes-multiple-upload-request/issues)

## Changelog

Xem [CHANGELOG.md](CHANGELOG.md) để biết lịch sử thay đổi.

## Author

**n8n Community**
- Email: community@n8n.io

## Acknowledgments

- n8n team for the excellent workflow automation platform
- n8n community for inspiration and support

---

Made with ❤️ for the n8n community
