import type { ReactNode } from "react";

type InputWithIconProps = {
  icon: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
};

export function InputWithIcon({
  icon,
  placeholder,
  value,
  onChange,
  "aria-label": ariaLabel,
}: InputWithIconProps) {
  return (
    <div className="input-with-icon">
      <span className="input-with-icon-icon">{icon}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </div>
  );
}
