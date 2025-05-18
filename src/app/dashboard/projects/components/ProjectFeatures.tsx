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
import { ProjectFeatureForm } from "./ProjectFeatureForm";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";

interface ProjectFeature {
  id: string;
  icon: string;
  label: string;
  gradient: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFeaturesProps {
  projectId: string;
}

export function ProjectFeatures({ projectId }: ProjectFeaturesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<ProjectFeature | null>(null);
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ["project-features", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/project-feature?projectId=${projectId}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ProjectFeature, "id" | "createdAt" | "updatedAt">) => {
      const response = await axios.post("/api/project-feature/create-project-feature", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-features", projectId] });
      toast.success("Feature created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create feature");
      console.error("Error creating feature:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; feature: Partial<ProjectFeature> }) => {
      const response = await axios.patch(`/api/project-feature/${data.id}`, data.feature);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-features", projectId] });
      toast.success("Feature updated successfully");
      setIsOpen(false);
      setSelectedFeature(null);
    },
    onError: (error) => {
      toast.error("Failed to update feature");
      console.error("Error updating feature:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/project-feature/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-features", projectId] });
      toast.success("Feature deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete feature");
      console.error("Error deleting feature:", error);
    },
  });

  const handleEdit = (feature: ProjectFeature) => {
    setSelectedFeature(feature);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this feature?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<ProjectFeature, "id" | "createdAt" | "updatedAt">) => {
    if (selectedFeature) {
      updateMutation.mutate({ id: selectedFeature.id, feature: data });
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
        <h3 className="text-lg font-semibold">Project Features</h3>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedFeature(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add Feature</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedFeature ? "Edit Feature" : "Add New Feature"}
              </DialogTitle>
            </DialogHeader>
            <ProjectFeatureForm
              projectId={projectId}
              initialData={selectedFeature || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features?.map((feature: ProjectFeature) => (
          <div
            key={feature.id}
            className="relative rounded-lg border p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-2xl ${feature.gradient}`}>{feature.icon}</span>
                <span className="font-medium">{feature.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(feature)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(feature.id)}
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