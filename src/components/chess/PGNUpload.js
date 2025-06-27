import React, { useState, useCallback } from 'react';
import { parse } from '@mliebelt/pgn-parser';
import { 
  ArrowUpTrayIcon, 
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ApiService from '../../utils/api';

/**
 * PGN Upload Component
 * Features:
 * - File upload with drag & drop
 * - Text area for direct PGN input
 * - PGN validation and parsing
 * - Multiple games detection
 * - Metadata extraction
 * - Upload to backend
 */
const PGNUpload = ({ 
  onPGNParsed = null,
  onUploadComplete = null,
  className = '',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFormats = ['.pgn', '.txt']
}) => {
  const [pgnText, setPgnText] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'text'
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [statusMessage, setStatusMessage] = useState('');
  const [parsedGames, setParsedGames] = useState([]);
  const [metadata, setMetadata] = useState({
    totalGames: 0,
    gamesWithErrors: 0,
    estimatedSize: 0
  });
  
  // Form fields for upload metadata
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('strategy');
  const [isPublic, setIsPublic] = useState(true);

  /**
   * Improved manual PGN parser with robust game splitting and header extraction
   * Handles complex annotations, variations, and evaluation symbols
   */
  const parseManualPGN = useCallback((content) => {
    const games = [];
    let gameTexts = [];
    
    // First, try to split by Event headers that are followed by other headers
    // This is more reliable than just splitting by [Event
    const eventMatches = [...content.matchAll(/\[Event\s+"[^"]*"\]/g)];
    
    if (eventMatches.length === 0) {
      // No Event headers found, treat as single malformed game
      gameTexts = [content];
    } else if (eventMatches.length === 1) {
      // Single game
      gameTexts = [content];
    } else {
      // Multiple games - split more carefully
      for (let i = 0; i < eventMatches.length; i++) {
        const start = eventMatches[i].index;
        const end = i < eventMatches.length - 1 ? eventMatches[i + 1].index : content.length;
        gameTexts.push(content.substring(start, end));
      }
    }
    
    for (const gameText of gameTexts) {
      if (!gameText.trim()) continue;
      
      // Extract headers - more robust regex that handles spaces and special characters
      const headers = {};
      const headerMatches = gameText.matchAll(/\[([^[\]]+?)\s+"([^"]*)"\]/g);
      for (const match of headerMatches) {
        const key = match[1].trim();
        const value = match[2].trim();
        headers[key] = value;
      }
      
      // Only include if it has an Event header (valid game)
      if (!headers.Event) {
        continue;
      }
      
      // Better move processing - handle complex annotations and variations
      // Remove all headers first
      let moveText = gameText.replace(/\[[^\]]*\]/g, '').trim();
      
      // Clean the move text more thoroughly
      let cleanMoveText = moveText;
      
      // Remove complex comments in braces (can be nested and span multiple lines)
      let braceDepth = 0;
      let result = '';
      for (let i = 0; i < cleanMoveText.length; i++) {
        const char = cleanMoveText[i];
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth = Math.max(0, braceDepth - 1);
        } else if (braceDepth === 0) {
          result += char;
        }
      }
      cleanMoveText = result;
      
      // Remove variations in parentheses (can be deeply nested)
      let parenDepth = 0;
      result = '';
      for (let i = 0; i < cleanMoveText.length; i++) {
        const char = cleanMoveText[i];
        if (char === '(') {
          parenDepth++;
        } else if (char === ')') {
          parenDepth = Math.max(0, parenDepth - 1);
        } else if (parenDepth === 0) {
          result += char;
        }
      }
      cleanMoveText = result;
      
      // Remove evaluation symbols and annotations
      cleanMoveText = cleanMoveText
        .replace(/\$\d+/g, '') // Remove $1, $15, $17, etc.
        .replace(/[!?]+/g, '') // Remove !, ??, !!, etc.
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Count moves more accurately - improved pattern matching
      // Pattern for chess moves with move numbers
      const moveWithNumberPattern = /\d+\.{1,3}\s*([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?|O-O(?:-O)?[+#]?)/g;
      const moveMatches = [...cleanMoveText.matchAll(moveWithNumberPattern)];
      
      // Also count standalone moves (continuation moves without numbers)
      const allWords = cleanMoveText.split(/\s+/);
      let additionalMoves = 0;
      
      for (const word of allWords) {
        const cleanWord = word.replace(/\d+\.{1,3}/, '').trim();
        if (cleanWord && /^([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?|O-O(?:-O)?[+#]?)$/.test(cleanWord)) {
          // Check if this move was already counted in the numbered moves
          const isAlreadyCounted = moveMatches.some(match => match[1] === cleanWord);
          if (!isAlreadyCounted) {
            additionalMoves++;
          }
        }
      }
      
      let moveCount = moveMatches.length + additionalMoves;
      
      // If still no moves found, try counting move numbers as fallback
      if (moveCount === 0) {
        const moveNumberMatches = cleanMoveText.match(/\d+\./g) || [];
        moveCount = moveNumberMatches.length;
      }
      
      // Final fallback - if we have substantive move text but no counted moves,
      // estimate based on text length and chess-like words
      if (moveCount === 0 && cleanMoveText.length > 20) {
        const chessWords = cleanMoveText.match(/\b[a-h][1-8]\b|\bO-O\b|\b[NBRQK][a-h][1-8]\b/g) || [];
        moveCount = Math.max(1, Math.floor(chessWords.length / 2));
      }
      
      games.push({
        tags: [
          { name: 'Event', value: headers.Event || 'Unknown Event' },
          { name: 'White', value: headers.White || 'Unknown' },
          { name: 'Black', value: headers.Black || 'Unknown' },
          { name: 'Date', value: headers.Date || '????.??.??' },
          { name: 'Result', value: headers.Result || '*' },
          { name: 'Site', value: headers.Site || 'Unknown' },
          { name: 'Round', value: headers.Round || '?' }
        ].concat(Object.entries(headers).filter(([key]) => 
          !['Event', 'White', 'Black', 'Date', 'Result', 'Site', 'Round'].includes(key)
        ).map(([key, value]) => ({ name: key, value }))),
        moves: [], // Empty moves array for manual parser - PGNViewer will handle this gracefully
        moveCount: moveCount,
        headerCount: Object.keys(headers).length,
        _rawMoveText: cleanMoveText.substring(0, 100) + '...', // Debug info
        _isManuallyParsed: true // Flag to indicate this came from manual parser
      });
    }
    
    return games;
  }, []);

  /**
   * Validate and parse PGN content with improved fallback handling
   */
  const validateAndParsePGN = useCallback((content) => {
    try {
      if (!content.trim()) {
        throw new Error('PGN content is empty');
      }

      console.log('Parsing PGN content, length:', content.length);

      // Try to parse with @mliebelt/pgn-parser first
      let parsedGames = [];
      let parseErrors = [];
      let usingFallback = false;

      try {
        // Parse with @mliebelt/pgn-parser
        parsedGames = parse(content, { startRule: 'games' });
        console.log('Parser returned games:', parsedGames?.length || 0);
      } catch (parseError) {
        console.warn('PGN parser error, using improved manual parsing:', parseError.message);
        
        // Use improved manual parser as fallback
        parsedGames = parseManualPGN(content);
        parseErrors.push(`Parser error: ${parseError.message} (using improved manual parsing)`);
        usingFallback = true;
      }
      
      if (!parsedGames || parsedGames.length === 0) {
        throw new Error('No valid games found in PGN');
      }

      console.log('Processing', parsedGames.length, 'games' + (usingFallback ? ' (manual parser)' : ''));

      // Extract metadata and validate each game with improved validation
      const gameMetadata = [];
      let gamesWithErrors = 0;

      parsedGames.forEach((game, index) => {
        try {
          const headers = {};
          if (game.tags) {
            // Handle both object format (from @mliebelt/pgn-parser) and array format (from manual parser)
            if (Array.isArray(game.tags)) {
              // Manual parser format: array of {name, value} objects
              game.tags.forEach(tag => {
                headers[tag.name] = tag.value;
              });
            } else if (typeof game.tags === 'object') {
              // @mliebelt/pgn-parser format: object with properties
              // Need to handle special case where Date might be an object
              Object.keys(game.tags).forEach(key => {
                const value = game.tags[key];
                if (key === 'Date' && typeof value === 'object' && value !== null) {
                  // Convert date object to string format
                  if (value.value) {
                    headers[key] = value.value;
                  } else if (value.year && value.month && value.day) {
                    headers[key] = `${value.year}.${String(value.month).padStart(2, '0')}.${String(value.day).padStart(2, '0')}`;
                  } else {
                    headers[key] = '????.??.??';
                  }
                } else if (typeof value === 'object' && value !== null) {
                  // Handle other potential object values by converting to string
                  headers[key] = value.value || value.toString();
                } else {
                  headers[key] = value;
                }
              });
            }
          }

          // Improved validation - check for meaningful content
          const hasEvent = headers.Event && headers.Event.trim() !== '' && headers.Event !== 'Unknown Event';
          const hasWhite = headers.White && headers.White.trim() !== '' && headers.White !== 'Unknown';
          const hasBlack = headers.Black && headers.Black.trim() !== '' && headers.Black !== 'Unknown';
          const hasSomeMoves = game.moves && game.moves.length > 0;
          const moveCount = game.moveCount || (game.moves ? game.moves.length : 0);

          const gameInfo = {
            id: index,
            headers,
            moveCount,
            hasValidPlayers: hasWhite && hasBlack,
            hasMoves: hasSomeMoves || moveCount > 0,
            // More lenient validity check - allow games with valid headers even if move parsing fails
            isValid: hasEvent && (hasWhite || hasBlack) && (hasSomeMoves || moveCount > 0),
            errors: [],
            warnings: []
          };

          if (!hasEvent) gameInfo.errors.push('Missing or invalid Event header');
          if (!hasWhite) gameInfo.warnings.push('Missing or invalid White player');
          if (!hasBlack) gameInfo.warnings.push('Missing or invalid Black player'); 
          if (!hasSomeMoves && moveCount === 0) gameInfo.errors.push('No moves detected');

          // Add fallback parsing warnings if applicable
          if (parseErrors.length > 0 && usingFallback) {
            gameInfo.warnings = gameInfo.warnings.concat(parseErrors);
          }

          if (!gameInfo.isValid) {
            gamesWithErrors++;
          }

          gameMetadata.push(gameInfo);
        } catch (err) {
          console.error('Error processing game', index, ':', err);
          gamesWithErrors++;
          gameMetadata.push({
            id: index,
            headers: {},
            moveCount: 0,
            hasValidPlayers: false,
            hasMoves: false,
            isValid: false,
            errors: [`Parse error: ${err.message}`],
            warnings: []
          });
        }
      });

      const metadata = {
        totalGames: parsedGames.length,
        gamesWithErrors,
        estimatedSize: new Blob([content]).size,
        validGames: parsedGames.length - gamesWithErrors
      };

      setParsedGames(gameMetadata);
      setMetadata(metadata);
      
      if (onPGNParsed) {
        onPGNParsed({
          content,
          games: parsedGames,
          metadata: gameMetadata
        });
      }

      return { success: true, games: parsedGames, metadata: gameMetadata };
    } catch (error) {
      console.error('PGN validation error:', error);
      setUploadStatus('error');
      setStatusMessage(`PGN validation failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, [onPGNParsed, parseManualPGN]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((file) => {
    // Validate file
    if (file.size > maxFileSize) {
      setUploadStatus('error');
      setStatusMessage(`File too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedFormats.includes(fileExtension)) {
      setUploadStatus('error');
      setStatusMessage(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setPgnText(content);
      validateAndParsePGN(content);
    };
    reader.onerror = () => {
      setUploadStatus('error');
      setStatusMessage('Failed to read file');
    };
    reader.readAsText(file);
  }, [maxFileSize, allowedFormats, validateAndParsePGN]);

  /**
   * Handle drag and drop
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  /**
   * Handle text input
   */
  const handleTextChange = useCallback((e) => {
    const content = e.target.value;
    setPgnText(content);
    
    // Reset status when user starts typing
    if (uploadStatus) {
      setUploadStatus(null);
      setStatusMessage('');
    }
  }, [uploadStatus]);

  /**
   * Parse text input
   */
  const handleParseText = useCallback(() => {
    validateAndParsePGN(pgnText);
  }, [pgnText, validateAndParsePGN]);

  /**
   * Upload to backend
   */
  const handleUploadToBackend = useCallback(async () => {
    if (!pgnText.trim() || parsedGames.length === 0) {
      setUploadStatus('error');
      setStatusMessage('No valid PGN content to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setStatusMessage('');

    try {
      // Upload PGN to backend
      const response = await ApiService.request('/chess/upload-pgn.php', 'POST', {
        pgn_content: pgnText,
        title: uploadTitle || `PGN Upload - ${new Date().toLocaleDateString()}`,
        description: uploadDescription,
        category: uploadCategory,
        is_public: isPublic,
        metadata: {
          totalGames: metadata.totalGames,
          validGames: metadata.validGames,
          gamesWithErrors: metadata.gamesWithErrors
        }
      });

      if (response.success) {
        setUploadStatus('success');
        setStatusMessage(`Successfully uploaded ${metadata.validGames} game(s)`);
        
        if (onUploadComplete) {
          onUploadComplete({
            success: true,
            uploadedGames: metadata.validGames,
            pgnId: response.pgn_id
          });
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setStatusMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }, [pgnText, parsedGames, metadata, onUploadComplete, uploadTitle, uploadDescription, uploadCategory, isPublic]);

  /**
   * Clear form
   */
  const handleClear = useCallback(() => {
    setPgnText('');
    setParsedGames([]);
    setMetadata({ totalGames: 0, gamesWithErrors: 0, estimatedSize: 0 });
    setUploadStatus(null);
    setStatusMessage('');
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`pgn-upload p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upload PGN Files
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload chess games in PGN format. Supports multiple games, variations, comments, and annotations.
        </p>
      </div>

      {/* Upload method selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setUploadMethod('file')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMethod === 'file'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setUploadMethod('text')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMethod === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <DocumentPlusIcon className="w-5 h-5 inline mr-2" />
            Paste Text
          </button>
        </div>
      </div>

      {/* File upload */}
      {uploadMethod === 'file' && (
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop your PGN file here
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <input
              type="file"
              accept={allowedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              id="pgn-file-input"
            />
            <label
              htmlFor="pgn-file-input"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
            >
              Choose File
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Max size: {Math.round(maxFileSize / 1024 / 1024)}MB | Formats: {allowedFormats.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Text input */}
      {uploadMethod === 'text' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            PGN Content
          </label>
          <textarea
            value={pgnText}
            onChange={handleTextChange}
            placeholder="Paste your PGN content here..."
            className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {pgnText.length} characters
            </p>
            <button
              onClick={handleParseText}
              disabled={!pgnText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Parse PGN
            </button>
          </div>
        </div>
      )}

      {/* Status messages */}
      {uploadStatus && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          uploadStatus === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          )}
          <span>{statusMessage}</span>
          <button
            onClick={() => setUploadStatus(null)}
            className="ml-auto"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Parsing results */}
      {parsedGames.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Parsing Results
          </h3>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metadata.totalGames}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Games
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metadata.validGames || metadata.totalGames - metadata.gamesWithErrors}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Valid Games
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatFileSize(metadata.estimatedSize)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                File Size
              </div>
            </div>
          </div>

          {/* Game list */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">White</th>
                  <th className="px-4 py-2 text-left">Black</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Moves</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedGames.map((game, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{game.headers.White || 'Unknown'}</td>
                    <td className="px-4 py-2">{game.headers.Black || 'Unknown'}</td>
                    <td className="px-4 py-2">{game.headers.Date || 'Unknown'}</td>
                    <td className="px-4 py-2">{game.moveCount}</td>
                    <td className="px-4 py-2">
                      {game.isValid ? (
                        <span className="text-green-600 dark:text-green-400">✓ Valid</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400" title={game.errors.join(', ')}>
                          ✗ Invalid
                        </span>
                      )}
                      {game.warnings && game.warnings.length > 0 && (
                        <span className="ml-2 text-yellow-600 dark:text-yellow-400" title={game.warnings.join(', ')}>
                          ⚠ Warning
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload metadata form */}
      {parsedGames.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter PGN title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="opening">Opening</option>
                <option value="middlegame">Middlegame</option>
                <option value="endgame">Endgame</option>
                <option value="tactics">Tactics</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Privacy setting */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this PGN public (visible to all users)
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isPublic ? 'Anyone can view this PGN' : 'Only you can view this PGN'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {parsedGames.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleUploadToBackend}
            disabled={isUploading || metadata.validGames === 0}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : `Upload ${metadata.validGames || metadata.totalGames - metadata.gamesWithErrors} Game(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default PGNUpload;
