"use client";

import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

type Category = {
  _id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  refreshCategories: () => void;
  onAddClick: () => void;
};

export default function ManageCategoryModal({
  open,
  onClose,
  categories,
  refreshCategories,
  onAddClick,
}: Props) {
  
  const deleteCategory = async (
    categoryId: string
  ) => {
    try {
      await axios.delete(
        `/api/categories/${categoryId}`
      );

      toast.success(
        "Category deleted"
      );

      refreshCategories();

    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
        "Delete failed"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Manage Categories
          </DialogTitle>
        </DialogHeader>

        <Button
          onClick={onAddClick}
          className="w-full"
        >
          + Add Category
        </Button>

        <div className="space-y-3 mt-4">

          {categories.map((cat) => (
            <div
              key={cat._id}
              className="flex justify-between items-center border rounded p-3"
            >
              <span>
                {cat.name}
              </span>

              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  deleteCategory(cat._id)
                }
              >
                <X className="w-4 h-4" />
              </Button>

            </div>
          ))}

        </div>

      </DialogContent>
    </Dialog>
  );
}