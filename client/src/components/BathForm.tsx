import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBathSchema } from "@shared/schema";
import { type BathInput } from "@shared/routes";
import { useCreateBath, useUpdateBath } from "@/hooks/use-baths";
import { z } from "zod";
import { Star, Thermometer, Clock, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Extend schema to handle string inputs from forms for numbers
const formSchema = insertBathSchema.extend({
  durationMinutes: z.coerce.number().min(1, "Must be at least 1 minute"),
  temperatureCelsius: z.coerce.number().optional(),
  rating: z.coerce.number().min(1).max(5),
});

type FormData = z.infer<typeof formSchema>;

interface BathFormProps {
  initialData?: FormData & { id?: number };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BathForm({ initialData, trigger, open: controlledOpen, onOpenChange }: BathFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  
  const { toast } = useToast();
  const createMutation = useCreateBath();
  const updateMutation = useUpdateBath();
  const isEditing = !!initialData?.id;

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      durationMinutes: 20,
      temperatureCelsius: 38,
      rating: 5,
      notes: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, ...data });
        toast({ title: "Updated", description: "Bath entry updated successfully." });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Recorded", description: "New bath entry added to your history." });
      }
      setOpen(false);
      reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive"
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary">
            {isEditing ? "Edit Bath Entry" : "Record New Bath"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-primary" />
                Duration (min)
              </Label>
              <Input 
                {...register("durationMinutes")} 
                type="number" 
                className="input-field" 
              />
              {errors.durationMinutes && <span className="text-xs text-red-500">{errors.durationMinutes.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-600">
                <Thermometer className="w-4 h-4 text-primary" />
                Temp (°C)
              </Label>
              <Input 
                {...register("temperatureCelsius")} 
                type="number" 
                className="input-field" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 block mb-2">Relaxation Rating</Label>
            <div className="flex gap-2 justify-center p-4 bg-secondary/30 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-600">
              <FileText className="w-4 h-4 text-primary" />
              Notes
            </Label>
            <Textarea 
              {...register("notes")} 
              placeholder="How did you feel? Used any bath bombs?" 
              className="bg-white/50 min-h-[100px] resize-none focus-visible:ring-primary/20"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full btn-primary"
          >
            {isPending ? "Saving..." : (isEditing ? "Update Entry" : "Save Entry")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
