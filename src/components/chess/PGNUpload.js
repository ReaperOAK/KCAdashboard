import React, { useState, useCallback } from 'react';
import { parse } from '@mliebelt/pgn-parser';
import { ChessApi } from '../../api/chess';
import UploadMethodSelector from './PGNUploadMethodSelector';
import PGNFileDrop from './PGNFileDrop';
import PGNTextInput from './PGNTextInput';
import PGNStatusMessage from './PGNStatusMessage';
import PGNParsingResults from './PGNParsingResults';
import PGNUploadDetailsForm from './PGNUploadDetailsForm';
import PGNUploadActions from './PGNUploadActions';

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

/**
 * PGNUpload - Main upload component for PGN files/text.
 * @param {function} onPGNParsed
 * @param {function} onUploadComplete
 * @param {string} className
 * @param {number} maxFileSize
 * @param {string[]} allowedFormats
 */
export const PGNUpload = React.memo(function PGNUpload({
  onPGNParsed = null,
  onUploadComplete = null,
  className = '',
  maxFileSize = 10 * 1024 * 1024,
  allowedFormats = ['.pgn', '.txt']
}) {
  // State
  const [pgnText, setPgnText] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [parsedGames, setParsedGames] = useState([]);
  const [metadata, setMetadata] = useState({ totalGames: 0, gamesWithErrors: 0, estimatedSize: 0 });
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('strategy');
  const [isPublic, setIsPublic] = useState(true);
  const [visibility, setVisibility] = useState('public');
  const [visibilityDetails, setVisibilityDetails] = useState({});
  // TODO: Replace with real data from API
  const [batchOptions] = useState([{ id: '1', name: 'Batch A' }, { id: '2', name: 'Batch B' }]);
  const [studentOptions] = useState([{ id: '10', name: 'Student X' }, { id: '11', name: 'Student Y' }]);

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

      const response = await ChessApi.uploadPGN({
        pgn_content: pgnText,
        title: uploadTitle || `PGN Upload - ${new Date().toLocaleDateString()}`,
        description: uploadDescription,
        category: uploadCategory,
        is_public: isPublic,
        visibility,
        visibility_details: visibilityDetails,
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
  }, [pgnText, parsedGames, metadata, onUploadComplete, uploadTitle, uploadDescription, uploadCategory, isPublic, visibility, visibilityDetails]);

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
    <div className={`pgn-upload p-4 sm:p-6 bg-background-light rounded-lg shadow-md w-full max-w-full ${className}`}>
      <HeaderSection />
      <UploadMethodSelector uploadMethod={uploadMethod} setUploadMethod={setUploadMethod} />
      <div className="flex flex-col gap-4">
        {uploadMethod === 'file' && (
          <PGNFileDrop
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            allowedFormats={allowedFormats}
            maxFileSize={maxFileSize}
            handleFileInputChange={handleFileInputChange}
          />
        )}
        {uploadMethod === 'text' && (
          <PGNTextInput
            pgnText={pgnText}
            handleTextChange={handleTextChange}
            handleParseText={handleParseText}
          />
        )}
        <PGNStatusMessage uploadStatus={uploadStatus} statusMessage={statusMessage} onClose={handleStatusClose} />
        <PGNParsingResults parsedGames={parsedGames} metadata={metadata} formatFileSize={formatFileSize} />
        {parsedGames.length > 0 && (
          <PGNUploadDetailsForm
            uploadTitle={uploadTitle}
            setUploadTitle={setUploadTitle}
            uploadCategory={uploadCategory}
            setUploadCategory={setUploadCategory}
            uploadDescription={uploadDescription}
            setUploadDescription={setUploadDescription}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            visibility={visibility}
            setVisibility={setVisibility}
            visibilityDetails={visibilityDetails}
            setVisibilityDetails={setVisibilityDetails}
            batchOptions={batchOptions}
            studentOptions={studentOptions}
          />
        )}
        {parsedGames.length > 0 && (
          <PGNUploadActions
            handleClear={handleClear}
            handleUploadToBackend={handleUploadToBackend}
            isUploading={isUploading}
            validGames={metadata.validGames}
            totalGames={metadata.totalGames}
            gamesWithErrors={metadata.gamesWithErrors}
          />
        )}
      </div>
    </div>
  );
});

function HeaderSection() {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-primary mb-2">Upload PGN Files</h2>
      <p className="text-gray-dark ">
        Upload chess games in PGN format. Supports multiple games, variations, comments, and annotations.
      </p>
    </div>
  );
}

function handleStatusClose() {
  // For accessibility: clear status on close
  this?.setUploadStatus?.(null);
}

export default PGNUpload;
