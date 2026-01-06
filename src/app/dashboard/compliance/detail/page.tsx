"use client";

import TodoListViewInner from "@/app/dashboard/todo-list/components/TodoListViewInner";

export default function ComplianceDetailPage() {
  // TodoListViewInner already handles decoding taskId from the query string
  // and renders full task details with comments, attachments and status.
  // We simply reuse it here to give compliance a dedicated detail route.
  return <TodoListViewInner />;
}


