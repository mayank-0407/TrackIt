"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

type AddCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    icon?: string;
  }) => Promise<void>;
};

export default function AddCategoryModal({
  open,
  onClose,
  onSubmit,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        name: name.trim(),
        icon: icon.trim(),
      });

      setName("");
      setIcon("");

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setIcon("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Add Category
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium">
              Category Name
            </label>

            <Input
              placeholder="Food, Travel, Gym..."
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Icon (Optional)
            </label>

            <Input
              placeholder="🍔 ✈️ 🏋️"
              value={icon}
              onChange={(e) =>
                setIcon(e.target.value)
              }
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Category"}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}