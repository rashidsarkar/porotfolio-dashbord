import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const projectFeatureSchema = z.object({
  icon: z.string().min(1, "Icon is required"),
  label: z.string().min(1, "Label is required"),
  gradient: z.string().min(1, "Gradient is required"),
  projectId: z.string().uuid("Invalid project ID"),
});

type ProjectFeatureFormValues = z.infer<typeof projectFeatureSchema>;

interface ProjectFeatureFormProps {
  projectId: string;
  initialData?: {
    icon: string;
    label: string;
    gradient: string;
  };
  onSubmit: (data: ProjectFeatureFormValues) => void;
}

export function ProjectFeatureForm({
  projectId,
  initialData,
  onSubmit,
}: ProjectFeatureFormProps) {
  const form = useForm<ProjectFeatureFormValues>({
    resolver: zodResolver(projectFeatureSchema),
    defaultValues: {
      ...initialData,
      projectId,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input placeholder="Enter icon name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="Enter feature label" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gradient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gradient</FormLabel>
              <FormControl>
                <Input placeholder="Enter gradient class" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Feature" : "Add Feature"}
        </Button>
      </form>
    </Form>
  );
} 