import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-white text-gray-900 border border-black/10 shadow-lg",
          description: "text-gray-500",
          actionButton: "bg-blue-500 text-white",
          cancelButton: "bg-gray-100 text-gray-700",
        },
      }}
    />
  );
}
