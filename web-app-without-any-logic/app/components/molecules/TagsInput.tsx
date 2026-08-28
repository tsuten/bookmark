import { useState } from "react";
import { X } from "lucide-react";

type TagsInputProps = {
  value?: string[];
  onChange: (tags: string[]) => void;
};

export function TagsInput({ value = [], onChange }: TagsInputProps) {
  const [input, setInput] = useState("");

  const addTag = (rawTag: string) => {
    const tag = rawTag.trim();
    if (!tag || value.includes(tag)) {
      return;
    }
    onChange([...value, tag]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    addTag(input);
    setInput("");
  };

  const handleBlur = () => {
    addTag(input);
    setInput("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="tags-input">
      {value.map((tag) => (
        <span key={tag} className="tag-chip">
          <span className="tag-chip-label">{tag}</span>
          <button
            type="button"
            tabIndex={-1}
            className="tag-chip-remove"
            aria-label={`Remove tag ${tag}`}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              removeTag(tag);
            }}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="tags-input-field"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Add tag and press Enter"
      />
    </div>
  );
}
