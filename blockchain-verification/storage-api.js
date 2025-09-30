/**
 * Storage API for cross-origin document access
 * This allows the verification website to access documents stored from the main app
 */

// Configuration
const STORAGE_PREFIX = 'cybernex_doc_';
const MAX_DOCUMENTS = 50; // Maximum documents to store
const STORAGE_EXPIRY_DAYS = 30; // Documents expire after 30 days

/**
 * Store document data for verification
 */
function storeDocument(documentData) {
    try {
        const storageKey = `${STORAGE_PREFIX}${documentData.documentHash}`;
        const dataWithExpiry = {
            ...documentData,
            expiresAt: new Date(Date.now() + (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)).toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(dataWithExpiry));
        
        // Update document index
        updateDocumentIndex(documentData.documentHash);
        
        return { success: true };
    } catch (error) {
        console.error('Error storing document:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Retrieve document by hash
 */
function getDocument(documentHash) {
    try {
        const storageKey = `${STORAGE_PREFIX}${documentHash}`;
        const storedData = localStorage.getItem(storageKey);
        
        if (!storedData) {
            return { success: false, reason: 'not_found' };
        }
        
        const documentData = JSON.parse(storedData);
        
        // Check if document has expired
        if (documentData.expiresAt && new Date(documentData.expiresAt) < new Date()) {
            localStorage.removeItem(storageKey);
            return { success: false, reason: 'expired' };
        }
        
        return { success: true, data: documentData };
    } catch (error) {
        console.error('Error retrieving document:', error);
        return { success: false, reason: 'error', message: error.message };
    }
}

/**
 * Update document index for management
 */
function updateDocumentIndex(documentHash) {
    try {
        const indexKey = 'cybernex_document_index';
        const index = JSON.parse(localStorage.getItem(indexKey) || '[]');
        
        // Add new document hash if not exists
        if (!index.includes(documentHash)) {
            index.push(documentHash);
        }
        
        // Keep only the most recent documents
        if (index.length > MAX_DOCUMENTS) {
            const oldHashes = index.splice(0, index.length - MAX_DOCUMENTS);
            // Clean up old documents
            oldHashes.forEach(hash => {
                localStorage.removeItem(`${STORAGE_PREFIX}${hash}`);
            });
        }
        
        localStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
        console.error('Error updating document index:', error);
    }
}

/**
 * Clean up expired documents
 */
function cleanupExpiredDocuments() {
    try {
        const indexKey = 'cybernex_document_index';
        const index = JSON.parse(localStorage.getItem(indexKey) || '[]');
        const validHashes = [];
        
        index.forEach(hash => {
            const result = getDocument(hash);
            if (result.success) {
                validHashes.push(hash);
            }
        });
        
        localStorage.setItem(indexKey, JSON.stringify(validHashes));
    } catch (error) {
        console.error('Error cleaning up expired documents:', error);
    }
}

/**
 * Initialize storage system
 */
function initializeStorage() {
    // Clean up expired documents on initialization
    cleanupExpiredDocuments();
}

// Export functions for use
window.CyberNexStorage = {
    storeDocument,
    getDocument,
    cleanupExpiredDocuments,
    initializeStorage
};

// Initialize on load
initializeStorage();