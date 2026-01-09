import Link from "next/link";
import DashboardCard from "./DashboardCard";

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
    className?: string;
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
    className,
}: StatCardProps) {
    // Convert change string to numeric value for proper comparison
    const changeValue = parseFloat(change.replace(/,/g, ""));
    const isPositive = changeValue > 0;

    // Use backend-provided icon OR fallback
    const finalIcon = iconClass || "chart-line";

    const cardContent = (
        <DashboardCard className={`p-4 w-full cursor-pointer ${className || ""}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg">
                        <i className={`fr leading-0 fi-rr-${finalIcon} text-lg`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                            {title}
                        </h3>
                        {note && <p className="text-xs text-gray-500 font-medium">{note}</p>}
                        {(param1 || param2) && (
                            <div className="flex flex-col text-gray-400 font-bold mt-1">
                                {param1 && <span className="text-[10px]">{param1}</span>}
                                {param2 && <span className="text-[10px]">{param2}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end">
                <p className={`flex items-center text-[10px] font-bold uppercase tracking-widest ${isPositive ? "text-success" : "text-destructive"}`}>
                    <i className={`fi ${isPositive ? "fi-rr-arrow-trend-up" : "fi-rr-arrow-trend-down"} mr-1`}></i>
                    {change}
                    <span className="ml-1 text-gray-400 font-bold italic">vs last month</span>
                </p>
                <span className="text-3xl font-semibold text-gray-900 block tracking-tight">
                    {amount}
                </span>
            </div>
        </DashboardCard>
    );

    return link ? (
        <Link href={link} className="block">
            {cardContent}
        </Link>
    ) : (
        cardContent
    );
}
