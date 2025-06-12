
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { MaintenanceTask } from './MaintenanceCard';

interface AddTaskFormProps {
  onAddTask: (task: Omit<MaintenanceTask, 'id'>) => void;
}

export const AddTaskForm = ({ onAddTask }: AddTaskFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    intervalDays: '',
    description: '',
    lastCompleted: new Date().toISOString().split('T')[0]
  });

  const categories = ['Auto', 'HVAC', 'Plumbing', 'Home', 'Garden', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.category && formData.intervalDays) {
      onAddTask({
        name: formData.name,
        category: formData.category,
        intervalDays: parseInt(formData.intervalDays),
        description: formData.description,
        lastCompleted: formData.lastCompleted
      });
      setFormData({
        name: '',
        category: '',
        intervalDays: '',
        description: '',
        lastCompleted: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Maintenance Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              placeholder="e.g., Change HVAC Filter"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Interval (days)</Label>
            <Input
              id="interval"
              type="number"
              placeholder="e.g., 90"
              value={formData.intervalDays}
              onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastCompleted">Last Completed</Label>
            <Input
              id="lastCompleted"
              type="date"
              value={formData.lastCompleted}
              onChange={(e) => setFormData({ ...formData, lastCompleted: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
