import type { ReactNode } from "react";

type InputWithIconProps = {
  icon: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InputWithIcon({
  icon,
  placeholder,
  value,
  onChange,
}: InputWithIconProps) {
  return (
    <div className="flex w-full min-w-0 flex-row items-center gap-2">
      <div className="w-full min-w-0">
        <div className="flex w-full min-w-0 items-center rounded-sm bg-gray-100 pl-3 has-[input:focus-within]:outline-1 has-[input:focus-within]:-outline-offset-1 has-[input:focus-within]:outline-gray-500">
          <span className="inline-flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0">
            {icon}
          </span>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
          />
        </div>
      </div>
    </div>
  );
}
