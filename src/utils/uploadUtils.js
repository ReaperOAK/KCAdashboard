// UploadUtils: Consistent upload path and URL utilities
// All methods are static; class is for namespacing only

export class UploadUtils {
  static UPLOADS_BASE_PATH = '/uploads/';
  static UPLOAD_TYPES = {
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
    if (!Object.prototype.hasOwnProperty.call(this.UPLOAD_TYPES, type)) {
      throw new Error(`Unknown upload type: ${type}`);
    }
    let path = this.UPLOADS_BASE_PATH + this.UPLOAD_TYPES[type];
    if (filename) path += filename;
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
      const { protocol, host } = window.location;
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
    if (typeof materialUrl !== 'string') return '';
    if (materialUrl.startsWith('http://') || materialUrl.startsWith('https://')) return materialUrl;
    if (materialUrl.startsWith('/uploads/')) return materialUrl;
    return this.getWebPath('CLASSROOM_MATERIALS', materialUrl);
  }

  /**
   * Get assignment file URL
   * @param {string} filename - The assignment filename
   * @param {boolean} absolute - Whether to return absolute URL
   * @returns {string} The assignment file URL
   */
  static getAssignmentUrl(filename, absolute = true) {
    if (!filename) return '';
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
    if (!filename) return '';
    return this.getWebPath('PAYMENTS', filename);
  }
}

export default UploadUtils;
