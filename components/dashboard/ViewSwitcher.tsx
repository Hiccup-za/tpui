"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ViewSwitcherProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  emptyLabel?: string;
  populatedLabel?: string;
}

export function ViewSwitcher({
  checked,
  onCheckedChange,
  emptyLabel = "Empty View",
  populatedLabel = "Populated View",
}: ViewSwitcherProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="view-switch" className="text-sm font-medium">
        {emptyLabel}
      </Label>
      <Switch
        id="view-switch"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="view-switch" className="text-sm font-medium">
        {populatedLabel}
      </Label>
    </div>
  );
}
