import { useState } from "react";
import { cn } from "@/lib/utils";

interface DeleteConfirmModalProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({ open, itemName, onClose, onConfirm }: DeleteConfirmModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirm();
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-6 transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative w-full max-w-sm rounded-2xl bg-card p-6 transition-transform duration-300",
        open ? "scale-100" : "scale-95"
      )}>
        <h3 className="text-lg font-bold text-foreground">Delete Item?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{itemName}</span> will be removed from your menu.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground active:scale-95 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="mx-auto h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
