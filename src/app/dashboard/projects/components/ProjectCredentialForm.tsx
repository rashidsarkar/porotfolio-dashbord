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

const projectCredentialSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  projectId: z.string().uuid("Invalid project ID"),
});

type ProjectCredentialFormValues = z.infer<typeof projectCredentialSchema>;

interface ProjectCredentialFormProps {
  projectId: string;
  initialData?: {
    email: string;
    password: string;
  };
  onSubmit: (data: ProjectCredentialFormValues) => void;
}

export function ProjectCredentialForm({
  projectId,
  initialData,
  onSubmit,
}: ProjectCredentialFormProps) {
  const form = useForm<ProjectCredentialFormValues>({
    resolver: zodResolver(projectCredentialSchema),
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Credential" : "Add Credential"}
        </Button>
      </form>
    </Form>
  );
} 