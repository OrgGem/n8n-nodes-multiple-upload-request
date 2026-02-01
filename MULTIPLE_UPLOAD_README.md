# n8n-nodes-multiple-upload-request

This is an n8n community node for uploading multiple binary files dynamically with pattern filtering and authentication support.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **Upload Multiple Binary Files**: Dynamically upload multiple binary files from your workflow
- **Pattern-Based Filtering**: Filter files using wildcards (* and ?) to select specific files to upload
- **Authentication Support**: 
  - Bearer Token authentication
  - Custom Header authentication
  - No authentication (public endpoints)
- **Additional Form Fields**: Add custom form fields alongside file uploads
- **Query Parameters**: Add URL query parameters to your request
- **Multiple HTTP Methods**: Support for POST, PUT, and PATCH requests
- **Error Handling**: Comprehensive error handling and validation
- **SSL Options**: Option to ignore SSL certificate errors for testing

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Upload Multiple Files

Upload multiple binary files to an endpoint with optional filtering and authentication.

#### Parameters

- **Authentication**: Choose authentication method (None, Bearer Token, Custom Header)
- **Request Method**: HTTP method to use (POST, PUT, PATCH)
- **URL**: The endpoint URL to send files to
- **File Pattern**: Pattern to filter binary files (e.g., `*.jpg`, `image_*.png`, `*`)
- **Binary Property Name**: Name of the binary property containing files (comma-separated for multiple properties)

#### Options

- **Query Parameters**: Add URL query parameters
- **Additional Form Fields**: Add custom form fields
- **Additional Headers**: Add custom HTTP headers
- **Timeout**: Request timeout in milliseconds (default: 10000)
- **Ignore SSL Issues**: Skip SSL certificate validation

## Usage Examples

### Example 1: Upload All Images

Upload all PNG and JPG files from the workflow:

1. Add the Multiple Upload Request node
2. Set Authentication to "None" or your preferred method
3. Set Request Method to "POST"
4. Enter your upload URL
5. Set File Pattern to `*.{jpg,png}` or use `*` for all files

### Example 2: Upload with Bearer Token

Upload files with Bearer token authentication:

1. Create Bearer Token Auth API credential
2. Add your token
3. Select "Bearer Token" in Authentication dropdown
4. Configure the rest of the parameters

### Example 3: Filter Specific Files

Upload only files matching a pattern:

1. Set File Pattern to `report_*.pdf` to upload only report PDFs
2. Or use `image_*` to upload files starting with "image_"

### Example 4: Add Form Fields

Upload files with additional form data:

1. Under Options, add "Additional Form Fields"
2. Add field name and value pairs
3. Files and form fields will be sent together

## Credentials

### Bearer Token Auth API

- **Token**: Your bearer token for authentication

### Custom Header Auth API

- **Header Name**: Name of your custom header (e.g., `X-API-Key`)
- **Header Value**: Value of the header

## Pattern Matching

The node supports wildcard patterns for file filtering:

- `*` - Matches any number of characters
- `?` - Matches a single character

Examples:
- `*.jpg` - All JPG files
- `image_*` - Files starting with "image_"
- `report_?.pdf` - Files like "report_1.pdf", "report_A.pdf"
- `*` - All files (default)

## Compatibility

Tested with n8n version 1.0.0 and above.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [n8n workflow automation](https://n8n.io)

## License

[MIT](https://github.com/OrgGem/n8n-nodes-multiple-upload-request/blob/master/LICENSE.md)
