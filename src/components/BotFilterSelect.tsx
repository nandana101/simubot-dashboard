
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BotFilterSelectProps {
  onFilterChange: (value: string) => void;
}

export const BotFilterSelect = ({ onFilterChange }: BotFilterSelectProps) => {
  return (
    <Select onValueChange={onFilterChange} defaultValue="all">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter bot accounts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Accounts</SelectItem>
        <SelectItem value="normal">Normal Bots</SelectItem>
        <SelectItem value="disruptive">Disruptive Bots</SelectItem>
        <SelectItem value="satisfactory">Satisfactory Bots</SelectItem>
        <SelectItem value="problematic">Problematic Bots</SelectItem>
      </SelectContent>
    </Select>
  );
};
