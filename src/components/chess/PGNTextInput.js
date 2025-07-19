
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
    <section className="mb-6 w-full max-w-7xl mx-auto bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-6">
      <label htmlFor="pgn-textarea" className="block text-lg font-medium text-primary mb-3">
        PGN Content
      </label>
      <textarea
        id="pgn-textarea"
        value={pgnText}
        onChange={onTextChange}
        placeholder="Paste your PGN content here..."
        aria-label="PGN Content Input"
        aria-required="true"
        className="w-full h-64 p-4 border border-gray-light rounded-lg bg-background-light dark:bg-background-dark text-text-dark font-mono text-sm resize-vertical focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
      />
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-2">
        <p className="text-xs text-gray-dark" aria-live="polite">
          {charCount} characters
        </p>
        <button
          type="button"
          onClick={onParseClick}
          disabled={!pgnText.trim()}
          className="px-5 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
          aria-label="Parse PGN Content"
        >
          Parse PGN
        </button>
      </div>
    </section>
  );
});

export default PGNTextInput;
