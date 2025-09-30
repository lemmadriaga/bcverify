# Backend API Specification

## Overview

This document outlines the backend API needed to support the document verification system. The backend should store PDF documents securely and provide verification endpoints.

## API Endpoints

### 1. Store Document

**POST** `/api/documents`

**Purpose**: Store a PDF document with its blockchain hash

**Request**:

```json
{
  "documentHash": "1234567890abcdef...",
  "transactionId": "5KJ7G3H4K2L1M9N8...",
  "walletAddress": "7xKXtg2CW87d97TXJ...",
  "pdfBase64": "JVBERi0xLjQKMSAwIG9ia...",
  "metadata": {
    "businessName": "CyberNex Innovate",
    "ownerName": "Lemuel C. Madriaga",
    "generatedAt": "2025-01-01T00:00:00Z",
    "reportPeriod": "2024-12"
  }
}
```

**Response**:

```json
{
  "success": true,
  "documentId": "doc_abc123",
  "verificationUrl": "https://verify.cybernex.com/?hash=1234567890abcdef..."
}
```

### 2. Verify Document

**GET** `/api/verify/{documentHash}`

**Purpose**: Verify a document exists and retrieve its details

**Response**:

```json
{
  "success": true,
  "data": {
    "documentHash": "1234567890abcdef...",
    "transactionId": "5KJ7G3H4K2L1M9N8...",
    "timestamp": "2025-01-01T00:00:00Z",
    "walletAddress": "7xKXtg2CW87d97TXJ...",
    "isVerified": true,
    "pdfUrl": "https://secure-storage.cybernex.com/pdf/doc_abc123",
    "metadata": {
      "businessName": "CyberNex Innovate",
      "ownerName": "Lemuel C. Madriaga"
    }
  }
}
```

### 3. Get Document PDF

**GET** `/api/documents/{documentHash}/pdf`

**Purpose**: Retrieve the original PDF document

**Response**: PDF file stream with proper headers

```
Content-Type: application/pdf
Content-Disposition: inline; filename="financial-report-{hash}.pdf"
X-Document-Verified: true
X-Blockchain-Hash: {documentHash}
```

## Security Requirements

### 1. PDF Storage

- Store PDFs in encrypted form
- Use document hash as the encryption key
- Implement access logging
- Set up automatic backups

### 2. Blockchain Verification

- Verify transaction signatures against Solana blockchain
- Check transaction status and confirmations
- Validate wallet addresses
- Implement rate limiting

### 3. API Security

- Use HTTPS only
- Implement API key authentication
- Add request rate limiting
- Log all verification attempts
- Implement CORS properly

## Database Schema

### Documents Table

```sql
CREATE TABLE documents (
    id VARCHAR(255) PRIMARY KEY,
    document_hash VARCHAR(64) UNIQUE NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    pdf_encrypted LONGBLOB NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    access_count INT DEFAULT 0,
    INDEX idx_document_hash (document_hash),
    INDEX idx_transaction_id (transaction_id)
);
```

### Access Logs Table

```sql
CREATE TABLE access_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_result ENUM('verified', 'tampered', 'not_found'),
    INDEX idx_document_hash (document_hash),
    INDEX idx_accessed_at (accessed_at)
);
```

## Implementation Technologies

### Recommended Stack:

- **Backend**: Node.js with Express or Python with FastAPI
- **Database**: PostgreSQL or MySQL
- **Storage**: AWS S3 or Google Cloud Storage (encrypted)
- **Hosting**: Vercel Functions, AWS Lambda, or Google Cloud Run
- **CDN**: CloudFlare for global distribution

### Free Hosting Options:

1. **Vercel Functions** (Recommended)

   - 100GB bandwidth/month
   - Serverless functions
   - Automatic scaling

2. **Railway**

   - PostgreSQL database included
   - $5/month credit
   - Easy deployment

3. **Supabase**
   - PostgreSQL database
   - Built-in authentication
   - Free tier available

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ENCRYPTION_KEY=your-32-character-encryption-key
SOLANA_RPC_URL=https://api.devnet.solana.com
API_KEY_SECRET=your-api-key-secret
ALLOWED_ORIGINS=https://your-frontend-domain.com
MAX_FILE_SIZE_MB=10
RATE_LIMIT_PER_MINUTE=60
```

## Security Best Practices

1. **Never log sensitive data** (hashes, transaction IDs)
2. **Encrypt PDFs at rest** using document hash as key
3. **Validate all inputs** and sanitize data
4. **Implement proper error handling** without exposing internal details
5. **Use prepared statements** to prevent SQL injection
6. **Set up monitoring** and alerting for unusual activity
7. **Implement backup and disaster recovery**

## API Usage Examples

### Store Document (cURL)

```bash
curl -X POST https://api.cybernex.com/api/documents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "documentHash": "1234567890abcdef...",
    "transactionId": "5KJ7G3H4K2L1M9N8...",
    "pdfBase64": "JVBERi0xLjQK..."
  }'
```

### Verify Document (JavaScript)

```javascript
const response = await fetch(`https://api.cybernex.com/api/verify/${documentHash}`);
const verification = await response.json();

if (verification.success && verification.data.isVerified) {
  // Document is verified
  displayOriginalDocument(verification.data.pdfUrl);
} else {
  // Document is tampered or not found
  showTamperedWarning();
}
```
