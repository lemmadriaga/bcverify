// Global variables
let documentData = null;
let pdfBlob = null;

// Initialize the verification process when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeVerification();
});

/**
 * Initialize the document verification process
 */
function initializeVerification() {
  // Get document hash from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const documentHash = urlParams.get("hash");
  const transactionId = urlParams.get("tx");

  if (!documentHash) {
    showError("No document hash provided");
    return;
  }

  // Start verification process
  verifyDocument(documentHash, transactionId);
}

/**
 * Verify document against blockchain records
 */
async function verifyDocument(documentHash, transactionId) {
  try {
    showLoading();

    // Simulate API call to verify document
    // In a real implementation, this would call your backend API
    const verificationResult = await verifyDocumentFromStorage(
      documentHash,
      transactionId
    );

    if (verificationResult.success) {
      showVerifiedDocument(verificationResult.data);
    } else {
      if (verificationResult.reason === "tampered") {
        showTamperedDocument();
      } else {
        showError(verificationResult.message);
      }
    }
  } catch (error) {
    console.error("Verification error:", error);
    showError("Verification failed. Please try again.");
  }
}

/**
 * Verify document against stored records and retrieve actual PDF
 */
async function verifyDocumentFromStorage(documentHash, transactionId) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Use the storage API to retrieve document
    const result = window.CyberNexStorage.getDocument(documentHash);
    
    if (result.success) {
      const documentData = result.data;
      
      return {
        success: true,
        data: {
          documentHash: documentHash,
          transactionId: documentData.transactionId || transactionId,
          timestamp: documentData.timestamp,
          walletAddress: documentData.walletAddress || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          isVerified: true,
          pdfUrl: documentData.pdfDataUrl, // This is the actual PDF stored as data URL
          metadata: documentData.metadata
        },
      };
    } else {
      // Handle different failure reasons
      let message = "Document not found";
      if (result.reason === 'expired') {
        message = "Document has expired. Please generate a new report.";
      } else if (result.reason === 'not_found') {
        message = "Document not found. Please ensure you're using the same browser where the report was generated.";
      }
      
      return {
        success: false,
        reason: result.reason,
        message: message
      };
    }
  } catch (error) {
    console.error('Error retrieving document:', error);
    return {
      success: false,
      reason: "error",
      message: "Error retrieving document data"
    };
  }
}

/**
 * Generate a mock PDF for demonstration
 */
function generateMockPDF(documentHash) {
  // Create a simple PDF content using data URL
  // In production, this would fetch the actual PDF from secure storage
  const pdfContent = `
        <html>
        <head><title>Financial Report - ${documentHash.substr(
          0,
          8
        )}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>CyberNex Innovate - Financial Report</h1>
            <h2>Document Hash: ${documentHash}</h2>
            <p><strong>VERIFIED ORIGINAL DOCUMENT</strong></p>
            <p>This is a mock financial report for demonstration purposes.</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <div style="margin-top: 40px; padding: 20px; border: 2px solid #000;">
                <h3>Financial Summary</h3>
                <p>Total Income: ₱150,000</p>
                <p>Total Expenses: ₱100,000</p>
                <p>Net Income: ₱50,000</p>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
                <p>This document is cryptographically secured and verified on the Solana blockchain.</p>
                <p>Document Hash: ${documentHash}</p>
                <p>Any tampering would be immediately detectable.</p>
            </div>
        </body>
        </html>
    `;

  // Convert HTML to blob (mock PDF)
  const blob = new Blob([pdfContent], { type: "text/html" });
  return URL.createObjectURL(blob);
}

/**
 * Show loading state
 */
function showLoading() {
  hideAllStates();
  document.getElementById("loading").style.display = "block";
}

/**
 * Show error state
 */
function showError(message, title = 'Document Not Found') {
  hideAllStates();
  const errorElement = document.getElementById('error');
  const titleElement = document.getElementById('errorTitle');
  const messageElement = document.getElementById('errorMessage');
  
  errorElement.style.display = 'block';
  titleElement.textContent = title;
  messageElement.textContent = message;
}

/**
 * Show error state
 */
function showError(message) {
  hideAllStates();
  const errorElement = document.getElementById("error");
  errorElement.style.display = "block";
  errorElement.querySelector("p").textContent = message;
}

/**
 * Show verified document
 */
function showVerifiedDocument(data) {
  hideAllStates();
  documentData = data;

  const verifiedElement = document.getElementById("verified");
  verifiedElement.style.display = "block";

  // Populate verification details
  document.getElementById("documentHash").textContent = data.documentHash;
  document.getElementById("transactionId").textContent = data.transactionId;
  document.getElementById("timestamp").textContent = new Date(
    data.timestamp
  ).toLocaleString();

  // Set up Solana explorer link
  const explorerBtn = document.getElementById("solanaExplorerBtn");
  explorerBtn.href = `https://explorer.solana.com/tx/${data.transactionId}?cluster=devnet`;

  // Load PDF if available
  if (data.pdfUrl) {
    loadPDF(data.pdfUrl);
  }

  // Set up print button
  document.getElementById("printBtn").addEventListener("click", printDocument);
}

/**
 * Show tampered document state
 */
function showTamperedDocument() {
  hideAllStates();
  document.getElementById("tampered").style.display = "block";
}

/**
 * Hide all state elements
 */
function hideAllStates() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("error").style.display = "none";
  document.getElementById("verified").style.display = "none";
  document.getElementById("tampered").style.display = "none";
}

/**
 * Load PDF into viewer
 */
function loadPDF(pdfUrl) {
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfFallback = document.getElementById("pdfFallback");

  try {
    // Try to load PDF
    pdfViewer.src = pdfUrl;
    pdfViewer.style.display = "block";
    pdfFallback.style.display = "none";

    // Handle PDF load errors
    pdfViewer.onerror = function () {
      pdfViewer.style.display = "none";
      pdfFallback.style.display = "block";
    };

    // Store PDF blob for printing
    fetch(pdfUrl)
      .then((response) => response.blob())
      .then((blob) => {
        pdfBlob = blob;
      });
  } catch (error) {
    console.error("Error loading PDF:", error);
    pdfViewer.style.display = "none";
    pdfFallback.style.display = "block";
  }
}

/**
 * Print the document
 */
function printDocument() {
  if (pdfBlob) {
    // Create a new window for printing the PDF
    const printWindow = window.open();
    const pdfUrl = URL.createObjectURL(pdfBlob);

    printWindow.document.write(`
            <html>
            <head>
                <title>Print Financial Report</title>
                <style>
                    body { margin: 0; padding: 0; }
                    embed { width: 100vw; height: 100vh; }
                </style>
            </head>
            <body>
                <embed src="${pdfUrl}" type="application/pdf" width="100%" height="100%">
            </body>
            </html>
        `);

    printWindow.document.close();

    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  } else {
    // Fallback: print the current page
    window.print();
  }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(function () {
      // Show success message
      console.log("Copied to clipboard");
    })
    .catch(function (err) {
      console.error("Could not copy text: ", err);
    });
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate hash for display
 */
function truncateHash(hash, length = 16) {
  if (hash.length <= length) return hash;
  return hash.substr(0, length / 2) + "..." + hash.substr(-length / 2);
}

// Add click handlers for hash values to copy to clipboard
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const hashElements = document.querySelectorAll(
      ".hash-value, .transaction-value"
    );
    hashElements.forEach((element) => {
      element.style.cursor = "pointer";
      element.title = "Click to copy";
      element.addEventListener("click", function () {
        copyToClipboard(this.textContent);
      });
    });
  }, 100);
});

// Handle mobile responsiveness for PDF viewer
window.addEventListener("resize", function () {
  const pdfViewer = document.getElementById("pdfViewer");
  if (pdfViewer && window.innerWidth < 768) {
    pdfViewer.style.height = "400px";
  } else if (pdfViewer) {
    pdfViewer.style.height = "600px";
  }
});

// Prevent right-click context menu to discourage tampering attempts
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Disable certain keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  if (
    e.keyCode === 123 ||
    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
    (e.ctrlKey && e.keyCode === 85)
  ) {
    e.preventDefault();
    return false;
  }
});
