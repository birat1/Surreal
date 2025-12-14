import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

import { VisibilityToggleProps } from "@/types/types";

const VisibilityToggle = ({ label, checked, onChange }: VisibilityToggleProps) => {
  return (
    <div className="flex items-center justify-between py-1">
      <Label className="text-sm font-medium">{label}</Label>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};


export default VisibilityToggle