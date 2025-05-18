"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectCredentialForm } from "./ProjectCredentialForm";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";

interface ProjectCredential {
  id: string;
  email: string;
  password: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCredentialsProps {
  projectId: string;
}

export function ProjectCredentials({ projectId }: ProjectCredentialsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<ProjectCredential | null>(null);
  const queryClient = useQueryClient();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ["project-credentials", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/project-credential?projectId=${projectId}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ProjectCredential, "id" | "createdAt" | "updatedAt">) => {
      const response = await axios.post("/api/project-credential/create-project-credential", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-credentials", projectId] });
      toast.success("Credential created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create credential");
      console.error("Error creating credential:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; credential: Partial<ProjectCredential> }) => {
      const response = await axios.patch(`/api/project-credential/${data.id}`, data.credential);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-credentials", projectId] });
      toast.success("Credential updated successfully");
      setIsOpen(false);
      setSelectedCredential(null);
    },
    onError: (error) => {
      toast.error("Failed to update credential");
      console.error("Error updating credential:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/project-credential/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-credentials", projectId] });
      toast.success("Credential deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete credential");
      console.error("Error deleting credential:", error);
    },
  });

  const handleEdit = (credential: ProjectCredential) => {
    setSelectedCredential(credential);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this credential?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<ProjectCredential, "id" | "createdAt" | "updatedAt">) => {
    if (selectedCredential) {
      updateMutation.mutate({ id: selectedCredential.id, credential: data });
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
        <h3 className="text-lg font-semibold">Project Credentials</h3>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedCredential(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add Credential</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCredential ? "Edit Credential" : "Add New Credential"}
              </DialogTitle>
            </DialogHeader>
            <ProjectCredentialForm
              projectId={projectId}
              initialData={selectedCredential || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {credentials?.map((credential: ProjectCredential) => (
          <div
            key={credential.id}
            className="relative rounded-lg border p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{credential.email}</p>
                <p className="text-sm text-muted-foreground">
                  {credential.password}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(credential)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(credential.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 