"use client"
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ISelectProps {
  values: {key: string; value: string}[];
  placeholder?: string;
  label?: string;
  defaultValues?: string[];
  onChange?: (selected: string[]) => void;
  className?: string;
}

export const MultiSelect = ({ 
    values,
    placeholder = "Select Values",
    label,
    defaultValues = [],
    onChange,
    className = ""
 }: ISelectProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (onChange) {
      onChange(Array.from(selectedItems));
    }
  }, [selectedItems, onChange]);


  const handleSelectChange = (value: string) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(value)) {
        newSelection.delete(value);
      } else {
        newSelection.add(value);
      }
      return Array.from(newSelection);
    });
  };


    return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex gap-2 font-bold">
            {selectedItems.length > 0
              ? `${selectedItems.length} Selected`
              : placeholder}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuLabel>Choose Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {values.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.key}
              onSelect={(e) => e.preventDefault()}
              checked={selectedItems.includes(item.key)}
              onCheckedChange={() => handleSelectChange(item.key)}
            >
              {item.value}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    );

};

export default MultiSelect;