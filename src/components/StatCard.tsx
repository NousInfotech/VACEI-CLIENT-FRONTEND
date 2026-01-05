import Link from "next/link";

interface StatCardProps {
    title: string;
    amount: string;
    change: string;
    note: string;
    param1: string;
    param2: string;
    bgColor: string; // still included for flexibility
    iconClass?: string;
    link?: string | null;
}

export default function StatCard({
    title,
    link,
    amount,
    change,
    note,
    param1,
    param2,
    bgColor,
    iconClass,
}: StatCardProps) {
    // Convert change string to numeric value for proper comparison
    const changeValue = parseFloat(change.replace(/,/g, ""));
    const isPositive = changeValue > 0;

    // Use backend-provided icon OR fallback
    const finalIcon = iconClass || "chart-line";

    const cardContent = (
        <div className="rounded-xl p-3 w-full bg-card shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-border card-hover">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-sidebar-background text-sidebar-foreground rounded-full w-9 h-9 flex items-center justify-center shadow-md">
                        <i className={`fr leading-0 fi-rr-${finalIcon} text-base`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-brand-body">
                            {title}
                        </h3>
                        {note && <p className="text-xs text-brand-primary">{note}</p>}
                        {(param1 || param2) && (
                            <div className="flex flex-col text-muted-foreground">
                                {param1 && <span className="text-[11px]">{param1}</span>}
                                {param2 && <span className="text-[11px]">{param2}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end">
                <p className={`flex items-center text-[11px] font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                    <i className={`fi ${isPositive ? "fi-rr-arrow-trend-up" : "fi-rr-arrow-trend-down"} mr-1 text-[11px]`}></i>
                    {change}
                    <span className="ml-1 text-brand-body font-normal">vs last month</span>
                </p>
                <span className="text-2xl font-semibold text-brand-body block">
                    {amount}
                </span>
            </div>
        </div>
    );

    return link ? (
        <Link href={link} className="block">
            {cardContent}
        </Link>
    ) : (
        cardContent
    );
}
