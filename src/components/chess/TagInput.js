
import React, { useState, useMemo, useCallback } from 'react';

// Tag chip component for clarity and accessibility
const TagChip = React.memo(function TagChip({ tag, onRemove }) {
  return (
    <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs flex items-center mr-1 mb-1" tabIndex={0} aria-label={`Tag: ${tag}`}>
      {tag}
      <button
        type="button"
        className="ml-1 text-accent hover:text-highlight focus:outline-none focus:ring-2 focus:ring-accent rounded-full px-1"
        onClick={onRemove}
        aria-label={`Remove tag ${tag}`}
        tabIndex={0}
      >
        <span aria-hidden="true">×</span>
      </button>
    </span>
  );
});

const SuggestionList = React.memo(function SuggestionList({ suggestions, onSelect }) {
  return (
    <ul className="absolute z-10 bg-white border border-gray-light rounded shadow mt-1 w-full max-h-32 overflow-auto" role="listbox">
      {suggestions.map(tag => (
        <li
          key={tag}
          className="px-3 py-2 hover:bg-accent hover:text-white cursor-pointer text-sm"
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
        className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-text-dark placeholder:text-gray-dark"
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
