# CyberNex Document Verification System

A blockchain-based document verification system that ensures the authenticity and integrity of financial reports through cryptographic hashing and Solana blockchain storage.

## Features

- **Tamper-Proof Verification**: Documents are cryptographically hashed and stored on the Solana blockchain
- **QR Code Scanning**: Any mobile device can scan QR codes to verify document authenticity
- **Universal Access**: No app installation required - works with any QR scanner
- **Print-Only Access**: Documents can only be printed, preventing unauthorized modifications
- **Real-time Verification**: Instant verification against blockchain records

## Deployment

### Free Hosting Options

1. **Vercel (Recommended)**
   - Automatic deployments from Git
   - Free SSL certificates
   - Global CDN
   - Custom domains

2. **Netlify**
   - Easy drag-and-drop deployment
   - Form handling capabilities
   - Branch deployments

3. **GitHub Pages**
   - Direct integration with GitHub repositories
   - Automatic deployments on push

### Deployment Steps (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure custom domain (optional):
   - Add domain in Vercel dashboard
   - Update DNS records

## Usage

1. Generate a financial report with QR code
2. User scans QR code with any mobile device
3. Browser opens verification page showing:
   - "ORIGINAL - TAMPER-PROOF FINANCIAL REPORT" status
   - Blockchain verification details
   - Print-only document viewer
   - Security information

## Security Features

- **SHA-256 Hashing**: Documents are cryptographically hashed
- **Blockchain Storage**: Hashes stored immutably on Solana
- **Tamper Detection**: Any modification results in hash mismatch
- **View-Only Access**: Documents cannot be edited or downloaded
- **Print Functionality**: Secure printing for physical records

## API Integration

The verification page expects URL parameters:
- `hash`: Document SHA-256 hash
- `tx`: Solana transaction ID (optional)

Example: `https://your-domain.com/verify?hash=abc123...&tx=def456...`

## Development

```bash
# Serve locally
python -m http.server 8000
# or
npx serve .
```

## License

© 2025 CyberNex Innovate - All rights reserved