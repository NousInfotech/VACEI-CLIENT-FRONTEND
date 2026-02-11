import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceFormSkeleton() {
  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500">
      {/* SECTION: Service Details */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg bg-white/50">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-8 border-t">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
  );
}
