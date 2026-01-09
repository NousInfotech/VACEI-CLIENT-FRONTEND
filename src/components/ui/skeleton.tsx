import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-0 bg-gray-300", className)}
      {...props}
    />
  )
}

export { Skeleton }
