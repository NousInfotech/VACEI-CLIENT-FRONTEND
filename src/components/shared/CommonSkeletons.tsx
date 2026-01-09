import { Skeleton } from "@/components/ui/skeleton"
import { DashboardCard } from "../DashboardCard"

export const CardSkeleton = () => (
  <DashboardCard className="p-6 h-48 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </DashboardCard>
)

export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full space-y-4">
    <div className="flex space-x-4 pb-2 border-b border-white/20">
      <Skeleton className="h-6 flex-1" />
      <Skeleton className="h-6 flex-1" />
      <Skeleton className="h-6 flex-1" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    ))}
  </div>
)

export const DetailsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="h-12 w-40 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  </div>
)

export const DashboardSkeleton = () => (
    <div className="space-y-8 p-6">
        <div className="flex justify-between items-center">
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[500px] lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-[500px] rounded-3xl" />
        </div>
    </div>
)
