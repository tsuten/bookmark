import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";

export type DropdownOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

type DropdownProps = {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
};

export function Dropdown({ options, value, onValueChange }: DropdownProps) {
  const selectedOption = options.find((o) => o.value === value) ?? options[0];
  const { label, Icon } = selectedOption;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Icon aria-hidden />
        {label}
        <ChevronDown aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={4}>
          <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
            {options.map(({ value: optionValue, label: optionLabel, Icon: OptionIcon }) => (
              <DropdownMenu.RadioItem key={optionValue} value={optionValue} className="hover:cursor-pointer">
                <OptionIcon aria-hidden className="h-4 w-4" />
                {optionLabel}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
