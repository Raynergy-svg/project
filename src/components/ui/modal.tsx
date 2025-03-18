"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModalProps {
  title?: string;
  description?: string;
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
}

export function Modal({
  title,
  description,
  isOpen = true,
  onClose,
  children,
  className,
  showCloseButton = true,
  closeOnClickOutside = true,
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && closeOnClickOutside) {
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn(
          "border-border bg-card text-card-foreground shadow-lg",
          "data-[state=open]:duration-300",
          className
        )}
      >
        {title && (
          <DialogHeader className="border-b border-border pb-4 mb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
              {showCloseButton && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-muted rounded-full"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </DialogHeader>
        )}
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
