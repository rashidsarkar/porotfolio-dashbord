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
import { AboutForm } from "./components/AboutForm";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface About {
  id: string;
  name: string;
  role: string;
  bio: string;
  experience: string;
  location: string;
  email: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AboutPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAbout, setSelectedAbout] = useState<About | null>(null);
  const queryClient = useQueryClient();

  const columns: ColumnDef<About>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "interests",
      header: "Interests",
      cell: ({ row }) => {
        return row.original.interests.join(", ");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const about = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(about)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(about.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const { data: abouts, isLoading } = useQuery({
    queryKey: ["abouts"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/about");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<About, "id" | "createdAt" | "updatedAt">) => {
      const response = await axiosInstance.post("/api/about/create-about", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abouts"] });
      toast.success("About information created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create about information");
      console.error("Error creating about:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; about: Partial<About> }) => {
      const response = await axiosInstance.patch(`/api/about/${data.id}`, data.about);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abouts"] });
      toast.success("About information updated successfully");
      setIsOpen(false);
      setSelectedAbout(null);
    },
    onError: (error) => {
      toast.error("Failed to update about information");
      console.error("Error updating about:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/about/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abouts"] });
      toast.success("About information deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete about information");
      console.error("Error deleting about:", error);
    },
  });

  const handleEdit = (about: About) => {
    setSelectedAbout(about);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this about information?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<About, "id" | "createdAt" | "updatedAt">) => {
    if (selectedAbout) {
      updateMutation.mutate({ id: selectedAbout.id, about: data });
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
        <h2 className="text-3xl font-bold tracking-tight">About</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedAbout(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New About</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAbout ? "Edit About" : "Create New About"}
              </DialogTitle>
            </DialogHeader>
            <AboutForm
              initialData={selectedAbout || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={abouts || []} searchKey="name" />
    </div>
  );
} 