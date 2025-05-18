"use client";

import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Plus } from "lucide-react";
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
import { SkillCategoryForm } from "./components/SkillCategoryForm";
import { toast } from "sonner";

interface SkillCategory {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<SkillCategory>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(category)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(category.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function SkillCategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["skill-categories"],
    queryFn: async () => {
      const response = await axios.get("/api/skill-category");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<SkillCategory, "id" | "createdAt" | "updatedAt">) => {
      const response = await axios.post("/api/skill-category/create-skill-category", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success("Category created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create category");
      console.error("Error creating category:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; category: Partial<SkillCategory> }) => {
      const response = await axios.patch(`/api/skill-category/${data.id}`, data.category);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success("Category updated successfully");
      setIsOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error("Failed to update category");
      console.error("Error updating category:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/skill-category/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete category");
      console.error("Error deleting category:", error);
    },
  });

  const handleEdit = (category: SkillCategory) => {
    setSelectedCategory(category);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<SkillCategory, "id" | "createdAt" | "updatedAt">) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, category: data });
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
        <h2 className="text-3xl font-bold tracking-tight">Skill Categories</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedCategory(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
            </DialogHeader>
            <SkillCategoryForm
              initialData={selectedCategory || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={categories || []} searchKey="title" />
    </div>
  );
} 