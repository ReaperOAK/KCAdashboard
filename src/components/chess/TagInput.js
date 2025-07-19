
import React, { useState, useMemo, useCallback } from 'react';

// Tag chip component for clarity and accessibility
const TagChip = React.memo(function TagChip({ tag, onRemove }) {
  return (
    <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs flex items-center mr-1 mb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200" tabIndex={0} aria-label={`Tag: ${tag}`}>
      {tag}
      <button
        type="button"
        className="ml-1 text-accent hover:text-highlight focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full px-1 flex items-center"
        onClick={onRemove}
        aria-label={`Remove tag ${tag}`}
        tabIndex={0}
      >
        {/* Lucide icon: XCircle */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" /><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" /></svg>
      </button>
    </span>
  );
});

const SuggestionList = React.memo(function SuggestionList({ suggestions, onSelect }) {
  return (
    <ul className="absolute z-10 bg-background-light dark:bg-background-dark border border-gray-light rounded-lg shadow mt-1 w-full max-h-40 overflow-auto transition-all duration-200" role="listbox">
      {suggestions.map(tag => (
        <li
          key={tag}
          className="px-3 py-2 flex items-center gap-2 hover:bg-accent hover:text-white cursor-pointer text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          role="option"
          tabIndex={0}
          onMouseDown={() => onSelect(tag)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(tag);
            }
          }}
          aria-selected={false}
        >
          {/* Lucide icon: Tag */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.59 13.41l-8.59-8.59a2 2 0 00-2.83 0l-5.59 5.59a2 2 0 000 2.83l8.59 8.59a2 2 0 002.83 0l5.59-5.59a2 2 0 000-2.83z" /></svg>
          {tag}
        </li>
      ))}
    </ul>
  );
});

export const TagInput = React.memo(function TagInput({ value, onChange, suggestions }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Memoize filtered suggestions for performance
  const filteredSuggestions = useMemo(
    () => suggestions.filter(
      tag => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag)
    ),
    [input, suggestions, value]
  );

  // Handler to add a tag
  const handleAddTag = useCallback(tag => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
    setShowSuggestions(false);
  }, [onChange, value]);

  // Handler to remove a tag
  const handleRemoveTag = useCallback(tag => {
    onChange(value.filter(t => t !== tag));
  }, [onChange, value]);

  // Handler for input change
  const handleInputChange = useCallback(e => {
    setInput(e.target.value);
    setShowSuggestions(true);
  }, []);

  // Handler for input focus
  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  // Handler for input blur
  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 100);
  }, []);

  // Handler for input keydown
  const handleInputKeyDown = useCallback(e => {
    if (e.key === 'Enter' && input.trim()) {
      handleAddTag(input.trim());
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      // Remove last tag on backspace if input is empty
      handleRemoveTag(value[value.length - 1]);
    }
  }, [input, value, handleAddTag, handleRemoveTag]);

  return (
    <div className="relative" aria-label="Tag input">
      <div className="flex flex-wrap gap-1 mb-1">
        {value.map(tag => (
          <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
        ))}
      </div>
      <input
        type="text"
        className="w-full p-2 sm:p-3 border border-gray-light rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:border-transparent bg-background-light dark:bg-background-dark text-text-dark placeholder:text-gray-dark transition-all duration-200"
        placeholder="Add tag..."
        value={input}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        aria-label="Add tag"
        aria-autocomplete="list"
        aria-controls="tag-suggestion-list"
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <SuggestionList suggestions={filteredSuggestions} onSelect={handleAddTag} />
      )}
    </div>
  );
});

export default TagInput;
