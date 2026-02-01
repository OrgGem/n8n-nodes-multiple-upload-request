![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n Multiple Upload Request Node

An n8n community node for dynamically uploading multiple binary files with pattern filtering and authentication support.

[Tiếng Việt](README.md) | **English**

## Key Features

✨ **Dynamic Multiple File Upload** - Automatically upload all binary files from input or filter by pattern

🎯 **Pattern-Based File Filtering** - Supports wildcard patterns (`*`, `?`) to selectively upload files

🔐 **Flexible Authentication** - Supports Bearer Token, Custom Header, or no authentication

🔧 **Highly Customizable** - Add form fields, query parameters, custom headers

📡 **HTTP Methods** - Supports POST, PUT, PATCH requests

⚡ **Robust Error Handling** - Continue on fail, timeout configuration, SSL validation options

## Installation

```bash
npm install n8n-nodes-multiple-upload-request
```

## Usage

### 1. Add Node to Workflow
Search for **"Multiple Upload Request"** in the n8n nodes list.

### 2. Basic Configuration

**Authentication**: Select authentication method
- **None**: No authentication required
- **Bearer Token**: Use Bearer token (credential required)
- **Custom Header**: Use custom header authentication (credential required)

**Request Method**: Choose HTTP method (POST/PUT/PATCH)

**URL**: Endpoint URL for file upload

**File Pattern**: Pattern to filter files (default: `*` - all files)
- `*` - Upload all files
- `*.jpg` - Upload only .jpg files
- `image_*` - Upload files starting with "image_"
- `file_?.pdf` - Upload files like file_1.pdf, file_a.pdf

**Binary Property Name**: Name of the property containing binary data (default: `data`)
- Can specify multiple properties, comma-separated: `data, file, attachment`

### 3. Advanced Options

#### Additional Form Fields
Add text fields to form data along with file uploads.

#### Query Parameters
Add query parameters to the URL request.

#### Additional Headers
Add custom headers to the request (e.g., Content-Type, X-Custom-Header).

#### Timeout
Configure request timeout (default: 10000ms).

#### Ignore SSL Issues
Skip SSL certificate validation (useful for development environments).

## Usage Examples

### Example 1: Upload All JPG Images
```
File Pattern: *.jpg
Binary Property Name: data
```

### Example 2: Upload Multiple Files from Multiple Properties
```
File Pattern: *
Binary Property Name: image, document, attachment
```

### Example 3: Upload with Bearer Authentication
```
Authentication: Bearer Token
Request Method: POST
URL: https://api.example.com/upload
File Pattern: *
```

### Example 4: Upload with Additional Form Fields
```
Additional Form Fields:
  - userId: 12345
  - category: documents
  - tags: important,urgent
```

## Pattern Matching

The node supports wildcard patterns for file filtering:

- `*` - Matches any characters (zero or more)
- `?` - Matches exactly one character
- Pattern matching is case-insensitive

**Pattern Examples:**
- `*.pdf` → All PDF files
- `report_*.xlsx` → Excel files starting with "report_"
- `image_?.png` → image_1.png, image_a.png, image_x.png
- `2024-??-*.jpg` → 2024-01-photo.jpg, 2024-12-image.jpg

## Credentials

### Bearer Token Authentication

To use Bearer Token authentication:

1. Create a new credential of type **Bearer Token Auth**
2. Enter your Bearer token
3. Select this credential in the node

### Custom Header Authentication

To use Custom Header authentication:

1. Create a new credential of type **Custom Header Auth**
2. Enter Header Name (e.g., `X-API-Key`, `Authorization`)
3. Enter Header Value (the value of the header)
4. Select this credential in the node

## API Response

The node returns JSON response from the server:

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

## Error Handling

The node supports Continue on Fail mode:
- When enabled: Errors are returned as JSON and the workflow continues
- When disabled: Errors stop the workflow execution

## Development

### Requirements

- **[Node.js](https://nodejs.org/)** (v22 or higher) and npm
- **[git](https://git-scm.com/downloads)**

### Clone and Install

```bash
git clone https://github.com/OrgGem/n8n-nodes-multiple-upload-request.git
cd n8n-nodes-multiple-upload-request
npm install
```

### Development Mode

Run n8n with the node loaded and hot reload enabled:

```bash
npm run dev
```

### Build

Build the node for production:

```bash
npm run build
```

### Lint and Format

```bash
npm run lint
npm run lint:fix
```

## Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for details on test scenarios and node validation.

## Use Cases

### 1. Upload Images from Form Submission
Workflow receives multiple images from webhook form submission and uploads to cloud storage.

### 2. Batch Upload Documents
Upload multiple documents from a folder to a document management system.

### 3. Backup Files
Periodically backup important files to remote storage with authentication.

### 4. Image Processing Pipeline
Upload processed images (resized, watermarked) to CDN.

### 5. Multi-tenant File Upload
Upload files from different users with dynamic authentication headers.

## Technology Stack

- **TypeScript** - Type-safe development
- **n8n-workflow** - n8n SDK and types
- **Node.js** - Runtime environment
- **Multipart form-data** - File upload handling

## Project Structure

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

See [CHANGELOG.md](CHANGELOG.md) for change history.

## Author

**n8n Community**
- Email: community@n8n.io

## Acknowledgments

- n8n team for the excellent workflow automation platform
- n8n community for inspiration and support

---

Made with ❤️ for the n8n community
