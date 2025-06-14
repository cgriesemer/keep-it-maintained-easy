import { BarChart3 } from 'lucide-react';

interface StatsCardProps {
  overdue: number;
  dueSoon: number;
  total: number;
}

export const StatsCard = ({ overdue, dueSoon, total }: StatsCardProps) => {
  return (
    <div className="bg-card p-3 rounded-lg border">
      {/* Mobile compact layout */}
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-bold">{total}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-destructive rounded-full" />
            <span className="text-lg font-bold text-destructive">{overdue}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-lg font-bold text-yellow-600">{dueSoon}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          <div>Total</div>
          <div>Overdue</div>
          <div>Due Soon</div>
        </div>
      </div>

      {/* Desktop layout - unchanged */}
      <div className="hidden sm:grid grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{total}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full" />
            <span className="text-2xl font-bold text-destructive">{overdue}</span>
          </div>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-2xl font-bold text-yellow-600">{dueSoon}</span>
          </div>
          <p className="text-sm text-muted-foreground">Due Soon</p>
        </div>
      </div>
    </div>
  );
};
