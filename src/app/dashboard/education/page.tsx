"use client";

import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EducationForm } from "./components/EducationForm";
import { toast } from "sonner";

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  aboutId: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<Education>[] = [
  {
    accessorKey: "degree",
    header: "Degree",
  },
  {
    accessorKey: "institution",
    header: "Institution",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const education = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(education)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(education.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function EducationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
  const queryClient = useQueryClient();

  const { data: educations, isLoading } = useQuery({
    queryKey: ["educations"],
    queryFn: async () => {
      const response = await axios.get("/api/education");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Education, "id" | "createdAt" | "updatedAt">) => {
      const response = await axios.post("/api/education/create-education", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create education");
      console.error("Error creating education:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; education: Partial<Education> }) => {
      const response = await axios.patch(`/api/education/${data.id}`, data.education);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education updated successfully");
      setIsOpen(false);
      setSelectedEducation(null);
    },
    onError: (error) => {
      toast.error("Failed to update education");
      console.error("Error updating education:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/education/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete education");
      console.error("Error deleting education:", error);
    },
  });

  const handleEdit = (education: Education) => {
    setSelectedEducation(education);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this education?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<Education, "id" | "createdAt" | "updatedAt">) => {
    if (selectedEducation) {
      updateMutation.mutate({ id: selectedEducation.id, education: data });
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
        <h2 className="text-3xl font-bold tracking-tight">Education</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedEducation(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Education</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedEducation ? "Edit Education" : "Create New Education"}
              </DialogTitle>
            </DialogHeader>
            <EducationForm
              initialData={selectedEducation || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={educations || []} searchKey="degree" />
    </div>
  );
} 