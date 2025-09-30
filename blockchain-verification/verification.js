// Global variables
let documentData = null;
let pdfBlob = null;

// Initialize the verification process when page loads
document.addEventListener("DOMContentLoaded", function () {
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
 * Verify document against stored records
 */
async function verifyDocument(documentHash, transactionId) {
  try {
    showLoading();

    // Verify document by fetching from Firebase Firestore or localStorage
    const verificationResult = await verifyDocumentFromStorage(
      documentHash,
      transactionId
    );

    if (verificationResult.success) {
      showVerifiedDocument(verificationResult.data);
    } else {
      if (verificationResult.reason === "tampered" || verificationResult.reason === "expired") {
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
 * Verify document by fetching from Firebase Firestore
 */
async function verifyDocumentFromStorage(documentHash, transactionId) {
  try {
    // Check if Firebase service is available
    if (!window.FirebaseDocumentService || !window.FirebaseDocumentService.isInitialized()) {
      console.error('Firebase service not available, falling back to localStorage');
      return verifyFromLocalStorage(documentHash, transactionId);
    }

    // Fetch document from Firestore
    const result = await window.FirebaseDocumentService.getDocument(documentHash);
    
    if (result.success) {
      const data = result.data;
      return {
        success: true,
        data: {
          documentHash: data.documentHash,
          transactionId: data.transactionId,
          timestamp: data.timestamp,
          walletAddress: data.walletAddress,
          isVerified: data.isVerified,
          pdfUrl: data.pdfDataUrl, // This contains the actual PDF data URL
          metadata: data.metadata
        },
      };
    } else {
      return {
        success: false,
        reason: result.reason || "not_found",
        message: result.message || "Document not found or has expired",
      };
    }
  } catch (error) {
    console.error('Error verifying document:', error);
    
    // Fallback to localStorage
    console.log('Falling back to localStorage verification');
    return verifyFromLocalStorage(documentHash, transactionId);
  }
}

/**
 * Fallback verification using localStorage
 */
function verifyFromLocalStorage(documentHash, transactionId) {
  try {
    const storedData = localStorage.getItem(`pdf_${documentHash}`);
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return {
        success: true,
        data: {
          documentHash: documentHash,
          transactionId: transactionId || "local-storage-" + Date.now(),
          timestamp: parsedData.timestamp,
          walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          isVerified: true,
          pdfUrl: parsedData.pdfDataUrl,
          metadata: parsedData.financialData
        },
      };
    } else {
      return {
        success: false,
        reason: "not_found",
        message: "Document not found in local storage",
      };
    }
  } catch (error) {
    console.error('Error with localStorage verification:', error);
    return {
      success: false,
      reason: "error",
      message: "Error accessing stored document",
    };
  }
}

/**
 * Convert data URL to blob for PDF handling
 */
function dataURLToBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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
    // Check if pdfUrl is a data URL (base64 encoded PDF)
    if (pdfUrl.startsWith('data:application/pdf')) {
      // Convert data URL to blob for proper PDF handling
      const blob = dataURLToBlob(pdfUrl);
      const blobUrl = URL.createObjectURL(blob);
      
      pdfViewer.src = blobUrl;
      pdfViewer.style.display = "block";
      pdfFallback.style.display = "none";
      
      // Store PDF blob for printing
      pdfBlob = blob;
    } else {
      // Handle regular URL
      pdfViewer.src = pdfUrl;
      pdfViewer.style.display = "block";
      pdfFallback.style.display = "none";

      // Store PDF blob for printing
      fetch(pdfUrl)
        .then((response) => response.blob())
        .then((blob) => {
          pdfBlob = blob;
        })
        .catch((error) => {
          console.warn("Could not fetch PDF for printing:", error);
        });
    }

    // Handle PDF load errors
    pdfViewer.onerror = function () {
      console.error("PDF viewer failed to load PDF");
      pdfViewer.style.display = "none";
      pdfFallback.style.display = "block";
    };

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
