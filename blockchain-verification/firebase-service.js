// Firebase configuration for the verification website
// This is a standalone implementation that doesn't require Angular

// Firebase configuration - use the same as your Ionic app
const firebaseConfig = {
    apiKey: "AIzaSyARBa39DFIW6_QKyWMdvGNK9OS_LROy-dA",
    authDomain: "cybernex-d2ca7.firebaseapp.com",
    projectId: "cybernex-d2ca7",
    storageBucket: "cybernex-d2ca7.appspot.com",
    messagingSenderId: "150967057111",
    appId: "1:150967057111:web:02f51643e259beb4288e92"
};

// Initialize Firebase (will be loaded from CDN)
let db = null;

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebase();
});

/**
 * Initialize Firebase and Firestore
 */
function initializeFirebase() {
    try {
        // Initialize Firebase app
        const app = firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        db = firebase.firestore();
        
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
    }
}

/**
 * Get document from Firestore by hash
 */
async function getDocumentFromFirestore(documentHash) {
    if (!db) {
        throw new Error('Firebase not initialized');
    }
    
    try {
        const docRef = db.collection('verification_documents').doc(documentHash);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            const data = docSnap.data();
            
            // Check if document has expired
            const expiresAt = new Date(data.expiresAt);
            const now = new Date();
            
            if (expiresAt < now) {
                // Document has expired
                return {
                    success: false,
                    reason: 'expired',
                    message: 'Document has expired. Documents are kept for 30 days.'
                };
            }
            
            return {
                success: true,
                data: data
            };
        } else {
            return {
                success: false,
                reason: 'not_found',
                message: 'Document not found in database'
            };
        }
    } catch (error) {
        console.error('Error fetching document from Firestore:', error);
        return {
            success: false,
            reason: 'error',
            message: 'Error retrieving document: ' + error.message
        };
    }
}

/**
 * Check if document exists and is valid
 */
async function checkDocumentStatus(documentHash) {
    if (!db) {
        return {
            success: false,
            reason: 'firebase_error',
            message: 'Database connection not available'
        };
    }
    
    try {
        const result = await getDocumentFromFirestore(documentHash);
        return result;
    } catch (error) {
        console.error('Error checking document status:', error);
        return {
            success: false,
            reason: 'error',
            message: 'Failed to check document status'
        };
    }
}

// Export functions for use in verification.js
window.FirebaseDocumentService = {
    getDocument: getDocumentFromFirestore,
    checkStatus: checkDocumentStatus,
    isInitialized: () => db !== null
};