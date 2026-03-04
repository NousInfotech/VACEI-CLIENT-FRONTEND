// app/dashboard/todo-list/page.tsx
import { Suspense } from 'react';
import TodoList from './components/TodoListMain'; 

export default function TodoListPage() {
  return (
    <Suspense fallback={<div></div>}>
      <TodoList />
    </Suspense>
  );
}

