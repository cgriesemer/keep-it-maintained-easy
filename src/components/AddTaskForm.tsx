
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
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    customCategory: '',
    intervalDays: '',
    description: '',
    lastCompleted: new Date().toISOString().split('T')[0]
  });

  const categories = ['Auto', 'HVAC', 'Plumbing', 'Home', 'Garden', 'Other'];

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: '', customCategory: '' });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category: value, customCategory: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToUse = showCustomCategory ? formData.customCategory : formData.category;
    
    if (formData.name && categoryToUse && formData.intervalDays) {
      onAddTask({
        name: formData.name,
        category: categoryToUse,
        intervalDays: parseInt(formData.intervalDays),
        description: formData.description,
        lastCompleted: formData.lastCompleted
      });
      setFormData({
        name: '',
        category: '',
        customCategory: '',
        intervalDays: '',
        description: '',
        lastCompleted: new Date().toISOString().split('T')[0]
      });
      setShowCustomCategory(false);
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 200) })}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {!showCustomCategory ? (
              <Select value={formData.category} onValueChange={handleCategoryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new" className="text-primary font-medium">
                    <Plus className="w-3 h-3 mr-2" />
                    Add new category
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new category name"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value.slice(0, 100) })}
                  maxLength={100}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setFormData({ ...formData, customCategory: '' });
                  }}
                >
                  Choose from existing categories
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Interval (days)</Label>
            <Input
              id="interval"
              type="number"
              placeholder="e.g., 90"
              min="1"
              max="3650"
              value={formData.intervalDays}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 3650) {
                  setFormData({ ...formData, intervalDays: e.target.value });
                }
              }}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 1000) })}
              maxLength={1000}
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
