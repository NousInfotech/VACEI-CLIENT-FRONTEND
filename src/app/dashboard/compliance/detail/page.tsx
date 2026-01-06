"use client";

import { Suspense } from "react";
import TodoListViewInner from "@/app/dashboard/todo-list/components/TodoListViewInner";

function ComplianceDetailContent() {
  // TodoListViewInner already handles decoding taskId from the query string
  // and renders full task details with comments, attachments and status.
  // We simply reuse it here to give compliance a dedicated detail route.
  return <TodoListViewInner />;
}

export default function ComplianceDetailPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading compliance details...</div>}>
      <ComplianceDetailContent />
    </Suspense>
  );
}


