# Deployment Guide

## Quick Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Navigate to the verification folder**:

   ```bash
   cd blockchain-verification-web
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Follow the prompts**:

   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N (for first deployment)
   - Project name: cybernex-document-verification
   - Directory: ./
   - Override settings: N

5. **Your site will be live at**: `https://cybernex-document-verification.vercel.app`

## Alternative: Deploy to Netlify

1. **Zip the verification folder**
2. **Go to**: https://app.netlify.com/drop
3. **Drag and drop** the zip file
4. **Your site will be live immediately**

## Alternative: Deploy to GitHub Pages

1. **Create a new repository** on GitHub
2. **Upload all files** from `blockchain-verification-web` folder
3. **Go to Settings > Pages**
4. **Select source**: Deploy from a branch
5. **Select branch**: main
6. **Your site will be live at**: `https://username.github.io/repository-name`

## Custom Domain Setup (Optional)

### For Vercel:

1. Go to your project dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Recommended Domain Names:

- `verify.cybernex.com`
- `documents.cybernex.com`
- `blockchain-verify.cybernex.com`

## Testing the Deployment

1. **Generate a test URL**:

   ```
   https://your-domain.com/?hash=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef&tx=test123
   ```

2. **Create a test QR code** pointing to this URL

3. **Scan with any QR scanner** and verify the page loads correctly

## Security Considerations

- The verification website runs entirely client-side
- No sensitive data is stored on the server
- Documents are never uploaded to the verification site
- All verification happens against blockchain records

## Maintenance

- The site is static and requires minimal maintenance
- Update the blockchain API endpoints if needed
- Monitor for any changes in Solana Explorer URLs
