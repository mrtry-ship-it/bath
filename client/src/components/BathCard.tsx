import { type Bath } from "@shared/schema";
import { format } from "date-fns";
import { Droplets, Clock, Thermometer, Star, MoreVertical, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDeleteBath } from "@/hooks/use-baths";
import { useState } from "react";
import { BathForm } from "./BathForm";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function BathCard({ bath }: { bath: Bath }) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteMutation = useDeleteBath();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(bath.id);
      toast({ title: "Deleted", description: "Entry removed from history." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card rounded-2xl p-6 group transition-all hover:shadow-2xl hover:shadow-primary/10"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary rounded-xl text-primary">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-slate-800">
                {format(new Date(bath.date), "EEEE, MMMM do")}
              </h3>
              <p className="text-sm text-slate-500">
                {format(new Date(bath.date), "h:mm a")}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-primary/70" />
            <span className="text-sm font-medium">{bath.durationMinutes} min</span>
          </div>
          {bath.temperatureCelsius && (
            <div className="flex items-center gap-2 text-slate-600">
              <Thermometer className="w-4 h-4 text-primary/70" />
              <span className="text-sm font-medium">{bath.temperatureCelsius}°C</span>
            </div>
          )}
        </div>

        {bath.notes && (
          <div className="bg-slate-50/80 p-3 rounded-lg mb-4 text-sm text-slate-600 italic">
            "{bath.notes}"
          </div>
        )}

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              className={`w-4 h-4 ${star <= bath.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
            />
          ))}
        </div>
      </motion.div>

      <BathForm 
        open={isEditing} 
        onOpenChange={setIsEditing} 
        initialData={bath} 
      />
    </>
  );
}
