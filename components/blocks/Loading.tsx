import { Skeleton } from "../ui/skeleton";

export function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-48">Loading...</Skeleton>
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
