"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TABLE_WRAPPER_CLASS, TABLE_HEADER_ROW_CLASS } from "../constants";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className={TABLE_WRAPPER_CLASS}>
      <Table>
        <TableHeader>
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-16 rounded" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, ri) => (
            <TableRow key={ri}>
              {Array.from({ length: columns }).map((_, ci) => (
                <TableCell key={ci}>
                  <Skeleton className="h-4 w-full rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
