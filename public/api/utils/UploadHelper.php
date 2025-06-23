<?php
/**
 * Upload Helper Utility Class
 * Provides centralized upload path management
 */
class UploadHelper {
    // Base uploads directory (relative to the project root)
    const UPLOADS_BASE_DIR = '../../../uploads/';
    const UPLOADS_WEB_PATH = '/uploads/';
    
    // Subdirectories for different types of uploads
    const UPLOAD_DIRS = [
        'pgn' => 'pgn/',
        'resources' => 'resources/',
        'classroom_materials' => 'classroom_materials/',
        'assignments' => 'assignments/',
        'quiz_images' => 'quiz_images/',
        'payments' => 'payments/',
        'profiles' => 'profiles/',
        'chess' => 'chess/',
        'chess_thumbnails' => 'chess/thumbnails/'
    ];
    
    /**
     * Get the server file path for a specific upload type
     * 
     * @param string $type The upload type (key from UPLOAD_DIRS)
     * @return string The full server path
     */
    public static function getServerPath($type) {
        if (!isset(self::UPLOAD_DIRS[$type])) {
            throw new InvalidArgumentException("Unknown upload type: $type");
        }
        
        $path = __DIR__ . '/' . self::UPLOADS_BASE_DIR . self::UPLOAD_DIRS[$type];
        
        // Ensure directory exists
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        return $path;
    }
    
    /**
     * Get the web-accessible URL path for a specific upload type
     * 
     * @param string $type The upload type (key from UPLOAD_DIRS)
     * @param string $filename Optional filename to append
     * @return string The web URL path
     */
    public static function getWebPath($type, $filename = '') {
        if (!isset(self::UPLOAD_DIRS[$type])) {
            throw new InvalidArgumentException("Unknown upload type: $type");
        }
        
        $path = self::UPLOADS_WEB_PATH . self::UPLOAD_DIRS[$type];
        
        if ($filename) {
            $path .= $filename;
        }
        
        return $path;
    }
    
    /**
     * Get the full web URL for a file
     * 
     * @param string $type The upload type
     * @param string $filename The filename
     * @param bool $absolute Whether to return absolute URL
     * @return string The full URL
     */
    public static function getFileUrl($type, $filename, $absolute = false) {
        $path = self::getWebPath($type, $filename);
        
        if ($absolute) {
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'];
            return $protocol . $host . $path;
        }
        
        return $path;
    }
    
    /**
     * Generate a unique filename for uploads
     * 
     * @param string $originalName The original filename
     * @param int $userId Optional user ID to include
     * @return string The unique filename
     */
    public static function generateUniqueFilename($originalName, $userId = null) {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitize the basename
        $basename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $basename);
        $basename = substr($basename, 0, 50); // Limit length
        
        $uniqueId = uniqid();
        $userPart = $userId ? "_{$userId}" : '';
        
        return "{$basename}_{$uniqueId}{$userPart}.{$extension}";
    }
    
    /**
     * Validate uploaded file
     * 
     * @param array $file The $_FILES array element
     * @param array $allowedTypes Array of allowed MIME types
     * @param int $maxSize Maximum file size in bytes
     * @return bool|string True if valid, error message if not
     */
    public static function validateFile($file, $allowedTypes = [], $maxSize = 10485760) { // 10MB default
        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            return 'File upload error occurred';
        }
        
        if ($file['size'] > $maxSize) {
            return 'File size exceeds maximum allowed size';
        }
        
        if (!empty($allowedTypes)) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            if (!in_array($mimeType, $allowedTypes)) {
                return 'File type not allowed';
            }
        }
        
        return true;
    }
}
?>
