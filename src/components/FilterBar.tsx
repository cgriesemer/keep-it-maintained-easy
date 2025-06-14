
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, LayoutGrid, List } from 'lucide-react';
import { MaintenanceTask } from '@/components/MaintenanceCard';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
  tasks: MaintenanceTask[];
}

export const FilterBar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  viewMode, 
  onViewModeChange,
  tasks 
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      {/* View Toggle */}
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
  );
};
