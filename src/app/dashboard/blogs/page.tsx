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
import { BlogForm } from "./components/BlogForm";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Blog {
  id: string;
  title: string;
  image: string;
  excerpt: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const queryClient = useQueryClient();

  const columns: ColumnDef<Blog>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "excerpt",
      header: "Excerpt",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const blog = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(blog)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(blog.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/blog");
      return response.data.data;
    },
  });
// console.log(blogs.data);
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Blog, "id" | "createdAt" | "updatedAt">) => {
      const response = await axiosInstance.post("/api/blog/create-blog", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog created successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create blog");
      console.error("Error creating blog:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; blog: Partial<Blog> }) => {
      const response = await axiosInstance.patch(`/api/blog/${data.id}`, data.blog);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog updated successfully");
      setIsOpen(false);
      setSelectedBlog(null);
    },
    onError: (error) => {
      toast.error("Failed to update blog");
      console.error("Error updating blog:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/blog/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete blog");
      console.error("Error deleting blog:", error);
    },
  });

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = async (data: Omit<Blog, "id" | "createdAt" | "updatedAt">) => {
    if (selectedBlog) {
      updateMutation.mutate({ id: selectedBlog.id, blog: data });
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
        <h2 className="text-3xl font-bold tracking-tight">Blogs</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedBlog(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Blog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedBlog ? "Edit Blog" : "Create New Blog"}
              </DialogTitle>
            </DialogHeader>
            <BlogForm
              initialData={selectedBlog || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={blogs || []} searchKey="title" />
    </div>
  );
} 