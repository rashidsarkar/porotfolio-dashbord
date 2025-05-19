"use client";

import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SkillForm } from "./components/SkillForm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Skill {
  id: string;
  name: string;
  category: "FRONTEND" | "BACKEND" | "DATABASE" | "TOOLS";
  createdAt: string;
  updatedAt: string;
}

export default function SkillsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const queryClient = useQueryClient();

  const columns: ColumnDef<Skill>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">
            {row.original.category}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const skill = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(skill)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(skill.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/skill/");
      return response.data.data;
    },
  });
console.log(skills);
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: "FRONTEND" | "BACKEND" | "DATABASE" | "TOOLS" }) => {
      const response = await axiosInstance.post("/api/skill/create-skill", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create skill");
      console.error("Error creating skill:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; skill: Partial<Skill> }) => {
      const response = await axiosInstance.patch(`/api/skill/${data.id}`, data.skill);
      console.log(response.data);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill updated successfully");
      setIsOpen(false);
      setSelectedSkill(null);
    },
    onError: (error) => {
      toast.error("Failed to update skill");
      console.error("Error updating skill:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/skill/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete skill");
      console.error("Error deleting skill:", error);
    },
  });


  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: { name: string; category: "FRONTEND" | "BACKEND" | "DATABASE" | "TOOLS" }) => {
    if (selectedSkill) {
      updateMutation.mutate({ id: selectedSkill.id, skill: { name: data.name, category: data.category } });
    } else {
      createMutation.mutate({ name: data.name, category: data.category });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedSkill(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Skill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSkill ? "Edit Skill" : "Create New Skill"}
              </DialogTitle>
            </DialogHeader>
            <SkillForm
              initialData={selectedSkill ? {
                name: selectedSkill.name,
                category: selectedSkill.category
              } : undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={skills || []} searchKey="name" />
    </div>
  );
} 