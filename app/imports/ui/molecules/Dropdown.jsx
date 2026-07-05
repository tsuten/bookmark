import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

export const Dropdown = ({ options, value, onValueChange }) => {
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
              <DropdownMenu.RadioItem key={optionValue} value={optionValue}>
                <OptionIcon aria-hidden className="w-4 h-4" />
                {optionLabel}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
