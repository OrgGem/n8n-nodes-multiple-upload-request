# Testing Guide for Multiple Upload Request Node

This guide provides test scenarios to validate the functionality of the Multiple Upload Request node.

## Prerequisites

1. Install the node in your n8n instance
2. Have a test endpoint that accepts file uploads (or use a service like httpbin.org, postman-echo.com, or requestbin)
3. Have binary files in your workflow (you can use the HTTP Request node or Read Binary Files node to get test files)

## Test Scenarios

### Test 1: Basic File Upload (No Authentication)

**Setup:**
1. Add a "Read Binary Files" node or similar to provide binary data
2. Add the "Multiple Upload Request" node
3. Configure:
   - Authentication: None
   - Request Method: POST
   - URL: https://httpbin.org/post
   - File Pattern: *
   - Binary Property Name: data

**Expected Result:**
- All binary files should be uploaded
- Response should show the uploaded files in the response

### Test 2: Upload with Bearer Token Authentication

**Setup:**
1. Create a Bearer Token Auth API credential with a test token
2. Configure the node:
   - Authentication: Bearer Token
   - Request Method: POST
   - URL: https://httpbin.org/post (or your authenticated endpoint)
   - File Pattern: *
   - Binary Property Name: data

**Expected Result:**
- Files uploaded with Authorization header containing "Bearer {token}"
- Response should show the Authorization header was sent

### Test 3: Upload with Custom Header Authentication

**Setup:**
1. Create a Custom Header Auth API credential:
   - Header Name: X-API-Key
   - Header Value: your-test-api-key
2. Configure the node:
   - Authentication: Custom Header
   - Request Method: POST
   - URL: https://httpbin.org/post
   - File Pattern: *

**Expected Result:**
- Files uploaded with custom header X-API-Key
- Response should show the custom header was sent

### Test 4: Pattern-Based File Filtering

**Setup:**
1. Prepare multiple binary files with different extensions (e.g., image.jpg, document.pdf, report.txt)
2. Configure the node with different patterns:

**Test 4a: Upload only JPG files**
- File Pattern: *.jpg
- Expected: Only JPG files uploaded

**Test 4b: Upload files starting with "report"**
- File Pattern: report*
- Expected: Only files starting with "report" uploaded

**Test 4c: Upload files with single character extension**
- File Pattern: *.?
- Expected: Files with single character extensions uploaded

### Test 5: Additional Form Fields

**Setup:**
1. Configure the node:
   - Authentication: None
   - Request Method: POST
   - URL: https://httpbin.org/post
   - File Pattern: *
   - Options → Additional Form Fields:
     - Add field: name = "description", value = "Test upload"
     - Add field: name = "user_id", value = "123"

**Expected Result:**
- Files uploaded along with form fields
- Response should show both files and form fields in the multipart data

### Test 6: Query Parameters

**Setup:**
1. Configure the node:
   - Options → Query Parameters:
     - Add parameter: name = "api_version", value = "v1"
     - Add parameter: name = "format", value = "json"

**Expected Result:**
- URL should include query parameters: ?api_version=v1&format=json
- Response should confirm query parameters were received

### Test 7: Additional Headers

**Setup:**
1. Configure the node:
   - Options → Additional Headers:
     - Add header: name = "X-Custom-Header", value = "custom-value"
     - Add header: name = "X-Request-ID", value = "12345"

**Expected Result:**
- Request should include custom headers
- Response should show headers were sent

### Test 8: Multiple Binary Properties

**Setup:**
1. Prepare workflow with multiple binary properties (e.g., "image", "document")
2. Configure the node:
   - Binary Property Name: image,document
   - File Pattern: *

**Expected Result:**
- All files from both binary properties should be uploaded

### Test 9: PUT and PATCH Methods

**Setup:**
1. Test with Request Method: PUT
2. Test with Request Method: PATCH
3. URL: https://httpbin.org/put (or /patch)

**Expected Result:**
- Files uploaded using the specified HTTP method
- Response should confirm the correct method was used

### Test 10: Error Handling

**Test 10a: No Binary Data**
- Configure node without connecting a binary data source
- Expected: Error message "No binary data found in input"

**Test 10b: No Matching Files**
- File Pattern: nonexistent*.xyz
- Expected: Error message "No binary files match the pattern"

**Test 10c: Invalid URL**
- URL: invalid-url
- Expected: Network error with proper error handling

**Test 10d: Continue On Fail**
- Enable "Continue On Fail" in node settings
- Configure with invalid URL
- Expected: Workflow continues, error in output

### Test 11: Timeout Configuration

**Setup:**
1. Configure the node:
   - Options → Timeout: 5000 (5 seconds)
   - URL: endpoint that takes longer than 5 seconds

**Expected Result:**
- Request should timeout after 5 seconds
- Error message should indicate timeout

### Test 12: SSL Certificate Handling

**Setup:**
1. Configure the node:
   - Options → Ignore SSL Issues: true
   - URL: endpoint with self-signed certificate

**Expected Result:**
- Request should proceed despite SSL certificate issues

## Test Endpoint Recommendations

### For Quick Testing:
- **httpbin.org**: https://httpbin.org/post - Returns full request details
- **postman-echo.com**: https://postman-echo.com/post - Returns request data

### For Local Testing:
Create a simple Express.js server:

```javascript
const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.any(), (req, res) => {
  console.log('Files:', req.files);
  console.log('Fields:', req.body);
  console.log('Headers:', req.headers);
  res.json({
    files: req.files,
    fields: req.body,
    headers: req.headers
  });
});

app.listen(3000, () => console.log('Test server on port 3000'));
```

## Validation Checklist

- [ ] Node appears in n8n nodes panel
- [ ] All authentication methods work correctly
- [ ] Pattern filtering matches expected files
- [ ] Additional form fields are included
- [ ] Query parameters are appended to URL
- [ ] Custom headers are sent
- [ ] All HTTP methods (POST, PUT, PATCH) work
- [ ] Error handling works correctly
- [ ] Timeout configuration is respected
- [ ] SSL options work as expected
- [ ] Multiple binary properties are handled
- [ ] Response data is returned correctly
- [ ] Continue on fail mode works

## Troubleshooting

**Issue: Files not uploading**
- Check that binary data is present in the input
- Verify the File Pattern matches your file names
- Check the Binary Property Name is correct

**Issue: Authentication not working**
- Verify credentials are correctly configured
- Check that the credential type matches the authentication method selected
- Review the endpoint's authentication requirements

**Issue: Pattern matching not working**
- Remember patterns are case-insensitive
- Use * for multiple characters, ? for single character
- Test with * first to ensure files are present

**Issue: Timeout errors**
- Increase the timeout value in Options
- Check network connectivity to the endpoint
- Verify the endpoint is responding
