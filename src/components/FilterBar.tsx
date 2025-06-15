
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, LayoutGrid, List } from 'lucide-react';
import { MaintenanceTask } from '@/components/MaintenanceCard';
import { SortDropdown, SortOption } from '@/components/SortDropdown';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
  tasks: MaintenanceTask[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const FilterBar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  viewMode, 
  onViewModeChange,
  tasks,
  sortBy,
  onSortChange
}: FilterBarProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by category:</span>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="capitalize"
          >
            {category}
            {category !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {tasks.filter(t => t.category === category).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Sort and View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View:</span>
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              className="rounded-r-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
