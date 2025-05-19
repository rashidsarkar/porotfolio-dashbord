"use client";

import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, ExternalLink, Github } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "./components/ProjectForm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axios";

interface Project {
  id: string;
  title: string;
  image: string;
  overview: string;
  frontendTech: string[];
  backendTech: string[];
  databaseTech: string;
  liveDemoLink?: string;
  clientRepoLink?: string;
  serverRepoLink?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "overview",
      header: "Overview",
    },
    {
      accessorKey: "frontendTech",
      header: "Frontend",
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-1">
            {row.original.frontendTech.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "backendTech",
      header: "Backend",
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-1">
            {row.original.backendTech.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "databaseTech",
      header: "Database",
    },
    
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original;

        return (
          <div className="flex items-center gap-2">
            {project.liveDemoLink && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(project.liveDemoLink, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {project.clientRepoLink && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(project.clientRepoLink, "_blank")}
              >
                <Github className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(project)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(project.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/project");
      return response.data.data;
    },
  });
// console.log(projects.data);
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      const response = await axiosInstance.post("/api/project/create-project", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; project: Partial<Project> }) => {
      const response = await axiosInstance.patch(`/api/project/${data.id}`, data.project);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
      setIsOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error("Failed to update project");
      console.error("Error updating project:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/project/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      console.error("Error deleting project:", error);
    },
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    if (selectedProject) {
      updateMutation.mutate({ id: selectedProject.id, project: data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedProject(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm
              initialData={selectedProject || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={projects || []} searchKey="title" />
    </div>
  );
} 