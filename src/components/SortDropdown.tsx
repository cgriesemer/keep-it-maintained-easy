
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'days-asc' | 'days-desc' | 'date-added' | 'date-modified' | 'alphabetical';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortDropdown = ({ sortBy, onSortChange }: SortDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">Sort:</span>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="days-asc">Days remaining (↑)</SelectItem>
          <SelectItem value="days-desc">Days remaining (↓)</SelectItem>
          <SelectItem value="date-added">Date added</SelectItem>
          <SelectItem value="date-modified">Date modified</SelectItem>
          <SelectItem value="alphabetical">Alphabetical</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
