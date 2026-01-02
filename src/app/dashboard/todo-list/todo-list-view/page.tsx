// app/dashboard/todo-list/todo-list-view/page.tsx or wherever this is used
'use client';

import { Suspense } from 'react';
import TodoListView from '../components/TodoListViewInner';

export default function TodoListViewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TodoListView />
    </Suspense>
  );
}
