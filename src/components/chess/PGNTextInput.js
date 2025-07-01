
import React, { useCallback, useMemo } from 'react';

/**
 * PGNTextInput - Accessible, memoized PGN textarea input with parse action
 * @param {string} pgnText
 * @param {function} handleTextChange
 * @param {function} handleParseText
 */
export const PGNTextInput = React.memo(function PGNTextInput({
  pgnText,
  handleTextChange,
  handleParseText
}) {
  // Memoize character count for performance
  const charCount = useMemo(() => pgnText.length, [pgnText]);

  // Memoize event handlers for performance and accessibility
  const onTextChange = useCallback((e) => {
    handleTextChange(e);
  }, [handleTextChange]);

  const onParseClick = useCallback((e) => {
    e.preventDefault();
    handleParseText();
  }, [handleParseText]);

  return (
    <div className="mb-6">
      <label htmlFor="pgn-textarea" className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">
        PGN Content
      </label>
      <textarea
        id="pgn-textarea"
        value={pgnText}
        onChange={onTextChange}
        placeholder="Paste your PGN content here..."
        aria-label="PGN Content Input"
        aria-required="true"
        className="w-full h-64 p-3 border border-gray-light dark:border-gray-dark rounded-lg bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light font-mono text-sm resize-vertical focus:ring-2 focus:ring-accent focus:border-accent"
      />
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-dark dark:text-gray-light" aria-live="polite">
          {charCount} characters
        </p>
        <button
          type="button"
          onClick={onParseClick}
          disabled={!pgnText.trim()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Parse PGN Content"
        >
          Parse PGN
        </button>
      </div>
    </div>
  );
});

export default PGNTextInput;
