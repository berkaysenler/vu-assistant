import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
