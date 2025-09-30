# Testing Guide for Tamper-Proof PDF System

## 🧪 How to Test the Complete System

### 1. Generate a Financial Report in Your Ionic App
1. Open your Ionic app
2. Navigate to the Financial Summary page
3. Click "Generate Tamper-Proof Report"
4. The PDF will be generated and stored in browser storage

### 2. Scan the QR Code
1. Use any QR scanner on your mobile device
2. Scan the QR code in the generated PDF
3. Your browser will open the verification website
4. You should see "ORIGINAL - TAMPER-PROOF FINANCIAL REPORT"
5. The actual PDF from your report should be displayed

## 🔍 What You Should See

### ✅ Success Case (Original Document):
- Green banner: "ORIGINAL - TAMPER-PROOF FINANCIAL REPORT"
- Document hash displayed
- Transaction ID displayed
- Timestamp shown
- **Your actual PDF displayed** (not a mock)
- Print button works
- Link to Solana Explorer

### ❌ Error Cases:

**Document Not Found:**
- Red error message
- Helpful suggestions for resolution
- Common reasons why document might not be found

**Document Expired:**
- Special error message for expired documents (30-day limit)

**Tampered Document:**
- Warning that document has been modified
- Security alert

## 🛠️ Troubleshooting

### If You See "Mock Financial Report":
This means the storage system isn't working. Check:
1. Are you using the same browser for both generating and viewing?
2. Is localStorage enabled in your browser?
3. Check browser console for any errors

### If QR Code Doesn't Work:
1. Make sure you've updated the verification URL in the environment files
2. Deploy the verification website first
3. Update the URL in both `environment.ts` and `environment.prod.ts`

### If PDF Doesn't Display:
1. Check if the PDF data is properly stored (check localStorage)
2. Verify the data URL format is correct
3. Try different browsers

## 🚀 Production Deployment Checklist

### 1. Deploy Verification Website
```bash
cd blockchain-verification-web
npx vercel --prod
```

### 2. Update Environment URLs
Replace in both environment files:
```typescript
verificationUrl: 'https://your-actual-deployed-url.vercel.app'
```

### 3. Rebuild Ionic App
```bash
ionic build
```

### 4. Test End-to-End
1. Generate PDF in Ionic app
2. Scan QR code with mobile device
3. Verify original document displays
4. Test print functionality

## 📊 Storage Information

- **Storage Location**: Browser localStorage
- **Storage Duration**: 30 days
- **Storage Format**: Base64 encoded PDF data URLs
- **Cross-Browser**: Only works in the same browser where PDF was generated
- **Storage Limit**: ~5-10MB per document (browser dependent)

## 🔄 Upgrade Path to Backend Storage

For production use, consider implementing:
1. **Cloud Storage**: AWS S3, Google Cloud Storage
2. **Database**: PostgreSQL with encrypted PDF storage
3. **API**: RESTful API for document storage/retrieval
4. **CDN**: Global content delivery for fast access
5. **Authentication**: API keys for secure access

The current localStorage solution is perfect for:
- Development and testing
- Proof of concept demonstrations
- Single-user scenarios
- Temporary document verification