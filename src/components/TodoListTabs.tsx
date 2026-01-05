"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Category = {
  id: number;
  name: string;
  taskCount: number;
};

type TodoListTabsProps = {
  categories: Category[];
  onCategoryClick: (id: number | null) => void;
};

export default function TodoListTabs({ categories }: TodoListTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const categoryFilterId = categoryParam ? parseInt(atob(categoryParam)) : null;

  function handleCategoryClick(id: number | null) {
    if (id === null) {
      router.push(pathname);
    } else {
      const encoded = btoa(`${id}`);
      router.push(`${pathname}?category=${encoded}`);
    }
  }

  return (
    <div className="mb-6 border-b border-border">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-muted-foreground dark:text-muted-foreground">
        {categories.map((cat) => (
          <li className="me-5" key={cat.id} role="presentation">
            <button
              onClick={() => handleCategoryClick(cat.id)}
              className={`inline-flex items-center gap-2 px-2 py-3 border-b-2 text-sm transition-all cursor-pointer
                ${categoryFilterId === cat.id ? "text-brand-body border-brand-primary active font-medium" : "border-transparent text-brand-body font-normal"}`}
            >
              {cat.name}
              {typeof cat.taskCount === "number" && (
                <span
                  className="inline-flex items-center justify-center max-w-[20px] w-[20px] min-h-[20px] text-sidebar-foreground text-xs font-normal rounded-full bg-sidebar-background border border-sidebar-border shadow-md">
                  {cat.taskCount}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
