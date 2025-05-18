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
import { Textarea } from "@/components/ui/textarea";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().min(1, "Image URL is required"),
  overview: z.string().min(1, "Overview is required"),
  frontendTech: z.array(z.string()).min(1, "At least one frontend technology is required"),
  backendTech: z.array(z.string()).min(1, "At least one backend technology is required"),
  databaseTech: z.string().min(1, "Database technology is required"),
  liveDemoLink: z.string().optional(),
  clientRepoLink: z.string().optional(),
  serverRepoLink: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: {
    title: string;
    image: string;
    overview: string;
    frontendTech: string[];
    backendTech: string[];
    databaseTech: string;
    liveDemoLink?: string;
    clientRepoLink?: string;
    serverRepoLink?: string;
  };
  onSubmit: (data: ProjectFormValues) => void;
}

export function ProjectForm({ initialData, onSubmit }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      title: "",
      image: "",
      overview: "",
      frontendTech: [],
      backendTech: [],
      databaseTech: "",
      liveDemoLink: "",
      clientRepoLink: "",
      serverRepoLink: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter project title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overview"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overview</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter project overview"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frontendTech"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frontend Technologies</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter frontend technologies (comma-separated)"
                  value={field.value.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value
                      .split(",")
                      .map((tech) => tech.trim())
                      .filter(Boolean);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backendTech"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backend Technologies</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter backend technologies (comma-separated)"
                  value={field.value.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value
                      .split(",")
                      .map((tech) => tech.trim())
                      .filter(Boolean);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="databaseTech"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Technology</FormLabel>
              <FormControl>
                <Input placeholder="Enter database technology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="liveDemoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Live Demo Link</FormLabel>
              <FormControl>
                <Input placeholder="Enter live demo link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientRepoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Repository Link</FormLabel>
              <FormControl>
                <Input placeholder="Enter client repository link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serverRepoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Repository Link</FormLabel>
              <FormControl>
                <Input placeholder="Enter server repository link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Project" : "Create Project"}
        </Button>
      </form>
    </Form>
  );
} 