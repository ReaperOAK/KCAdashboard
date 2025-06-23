/**
 * Upload utilities for consistent path handling
 */

export class UploadUtils {
    // Base upload path for web access
    static UPLOADS_BASE_PATH = '/uploads/';
    
    // Upload subdirectories
    static UPLOAD_TYPES = {
        PGN: 'pgn/',
        RESOURCES: 'resources/',
        CLASSROOM_MATERIALS: 'classroom_materials/',
        ASSIGNMENTS: 'assignments/',
        QUIZ_IMAGES: 'quiz_images/',
        PAYMENTS: 'payments/',
        PROFILES: 'profiles/',
        CHESS: 'chess/',
        CHESS_THUMBNAILS: 'chess/thumbnails/'
    };
    
    /**
     * Get the web path for a specific upload type
     * @param {string} type - The upload type from UPLOAD_TYPES
     * @param {string} filename - Optional filename to append
     * @returns {string} The web path
     */
    static getWebPath(type, filename = '') {
        if (!this.UPLOAD_TYPES[type]) {
            throw new Error(`Unknown upload type: ${type}`);
        }
        
        let path = this.UPLOADS_BASE_PATH + this.UPLOAD_TYPES[type];
        
        if (filename) {
            path += filename;
        }
        
        return path;
    }
    
    /**
     * Get the full URL for a file
     * @param {string} type - The upload type
     * @param {string} filename - The filename
     * @param {boolean} absolute - Whether to return absolute URL
     * @returns {string} The full URL
     */
    static getFileUrl(type, filename, absolute = false) {
        const path = this.getWebPath(type, filename);
        
        if (absolute) {
            const protocol = window.location.protocol;
            const host = window.location.host;
            return `${protocol}//${host}${path}`;
        }
        
        return path;
    }
    
    /**
     * Get the upload path for materials based on ApiService configuration
     * @param {string} materialUrl - The material URL from the database
     * @returns {string} The full URL for opening the material
     */
    static getMaterialUrl(materialUrl) {
        // If it's already a full URL, return as is
        if (materialUrl.startsWith('http://') || materialUrl.startsWith('https://')) {
            return materialUrl;
        }
        
        // Check if it's a direct path starting with /uploads/
        if (materialUrl.startsWith('/uploads/')) {
            return materialUrl;
        }
        
        // If it's just a filename, assume it's in classroom_materials
        return this.getWebPath('CLASSROOM_MATERIALS', materialUrl);
    }
    
    /**
     * Get assignment file URL
     * @param {string} filename - The assignment filename
     * @param {boolean} absolute - Whether to return absolute URL
     * @returns {string} The assignment file URL
     */
    static getAssignmentUrl(filename, absolute = true) {
        if (absolute) {
            return `https://dashboard.kolkatachessacademy.in${this.getWebPath('ASSIGNMENTS', filename)}`;
        }
        return this.getWebPath('ASSIGNMENTS', filename);
    }
    
    /**
     * Get payment screenshot URL
     * @param {string} filename - The payment screenshot filename
     * @returns {string} The payment screenshot URL
     */
    static getPaymentUrl(filename) {
        return this.getWebPath('PAYMENTS', filename);
    }
}

export default UploadUtils;
