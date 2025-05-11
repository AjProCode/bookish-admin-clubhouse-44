
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  duration: number; // in months
  price: number;
  booksPerMonth: number;
  description: string;
  features: string[];
  isPopular: boolean;
}

const initialPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Monthly',
    duration: 1,
    price: 1199,
    booksPerMonth: 3,
    description: 'Perfect for trying out our book club',
    features: [
      'Three books delivered monthly',
      'Access to online book discussions',
      'Regular book buddy interactions'
    ],
    isPopular: false
  },
  {
    id: '2',
    name: 'Quarterly',
    duration: 3,
    price: 3000,
    booksPerMonth: 3,
    description: 'Our recommended plan to build a reading habit',
    features: [
      'Three books delivered monthly',
      'Access to online book discussions',
      'Regular book buddy interactions',
      'Monthly reading progress reports'
    ],
    isPopular: true
  },
  {
    id: '3',
    name: 'Biannual',
    duration: 6,
    price: 5500,
    booksPerMonth: 3,
    description: 'Committed to building a strong reading habit',
    features: [
      'Three books delivered monthly',
      'Access to online book discussions',
      'Regular book buddy interactions',
      'Monthly reading progress reports',
      'Personalized book recommendations'
    ],
    isPopular: false
  },
  {
    id: '4',
    name: 'Annual',
    duration: 12,
    price: 10000,
    booksPerMonth: 3,
    description: 'Best value for dedicated readers',
    features: [
      'Three books delivered monthly',
      'Access to online book discussions',
      'Regular book buddy interactions',
      'Monthly reading progress reports',
      'Personalized book recommendations',
      'Free replacement of damaged books'
    ],
    isPopular: false
  }
];

const MembershipPlans: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [currentPlan, setCurrentPlan] = useState<MembershipPlan | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({
    name: '',
    duration: 1,
    price: 0,
    booksPerMonth: 3,
    description: '',
    features: [''],
    isPopular: false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };
  
  const removeFeatureField = (index: number) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  const handleAddPlan = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newPlan: MembershipPlan = {
        ...formData as MembershipPlan,
        id: Date.now().toString(),
        price: Number(formData.price),
        duration: Number(formData.duration),
        booksPerMonth: Number(formData.booksPerMonth)
      };
      
      setPlans([...plans, newPlan]);
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        duration: 1,
        price: 0,
        booksPerMonth: 3,
        description: '',
        features: [''],
        isPopular: false
      });
      setIsLoading(false);
      
      toast({
        title: "Plan Added",
        description: `${newPlan.name} plan has been added.`,
      });
    }, 1000);
  };
  
  const handleEditPlan = (plan: MembershipPlan) => {
    setCurrentPlan(plan);
    setFormData(plan);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdatePlan = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedPlans = plans.map(plan => 
        plan.id === currentPlan?.id ? {
          ...plan,
          ...formData,
          price: Number(formData.price),
          duration: Number(formData.duration),
          booksPerMonth: Number(formData.booksPerMonth)
        } : plan
      );
      
      setPlans(updatedPlans);
      setIsEditDialogOpen(false);
      setCurrentPlan(null);
      setFormData({
        name: '',
        duration: 1,
        price: 0,
        booksPerMonth: 3,
        description: '',
        features: [''],
        isPopular: false
      });
      setIsLoading(false);
      
      toast({
        title: "Plan Updated",
        description: `${formData.name} plan has been updated.`,
      });
    }, 1000);
  };
  
  const handleDeletePlan = (id: string) => {
    const planToDelete = plans.find(plan => plan.id === id);
    if (!planToDelete) return;
    
    const updatedPlans = plans.filter(plan => plan.id !== id);
    setPlans(updatedPlans);
    
    toast({
      title: "Plan Deleted",
      description: `${planToDelete.name} plan has been deleted.`,
    });
  };
  
  const dialogContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (months)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="booksPerMonth">Books Per Month</Label>
          <Input
            id="booksPerMonth"
            name="booksPerMonth"
            type="number"
            min="1"
            value={formData.booksPerMonth}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Features</Label>
          <Button type="button" size="sm" onClick={addFeatureField}>
            <Plus className="h-4 w-4 mr-1" />
            Add Feature
          </Button>
        </div>
        
        {formData.features?.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              placeholder={`Feature ${index + 1}`}
            />
            {formData.features && formData.features.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeFeatureField(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          id="isPopular"
          name="isPopular"
          type="checkbox"
          className="w-4 h-4"
          checked={formData.isPopular}
          onChange={handleInputChange}
        />
        <Label htmlFor="isPopular">Mark as popular/recommended plan</Label>
      </div>
    </div>
  );
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Membership Plans</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.isPopular ? "border-2 border-bookclub-primary" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {plan.name}
                      {plan.isPopular && (
                        <Badge className="ml-2 bg-bookclub-primary">Popular</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {plan.duration} {plan.duration > 1 ? 'months' : 'month'} • ₹{plan.price}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditPlan(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDeletePlan(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-bookclub-primary"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <div className="text-lg font-bold">
                  ₹{plan.price} • {plan.booksPerMonth} books/month
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Add Plan Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Membership Plan</DialogTitle>
            <DialogDescription>
              Create a new membership plan for the book club.
            </DialogDescription>
          </DialogHeader>
          {dialogContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPlan} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Membership Plan</DialogTitle>
            <DialogDescription>
              Update the details of this membership plan.
            </DialogDescription>
          </DialogHeader>
          {dialogContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePlan} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipPlans;
