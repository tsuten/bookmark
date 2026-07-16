import React, { useState } from 'react';
import { X } from 'lucide-react';

export const TagsInput = ({ value = [], onChange }) => {
  const [input, setInput] = useState('');

  const addTag = (rawTag) => {
    const tag = rawTag.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addTag(input);
    setInput('');
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="tags-input">
      {value.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            className="tag-chip-remove"
            aria-label={`Remove tag ${tag}`}
            onClick={() => removeTag(tag)}
          >
            <X className="w-3 h-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="tags-input-field"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag and press Enter"
      />
    </div>
  );
};
