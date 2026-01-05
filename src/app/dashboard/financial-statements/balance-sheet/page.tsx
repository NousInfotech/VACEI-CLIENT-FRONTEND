import React, { Suspense } from "react";
import ReportTabs from "../components/Tabs";
import ReportTable from "../components/ReportTable";

export default function FinancialStatements() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <div className="bg-card border border-border rounded-[10px] px-5 py-6 overflow-hidden">
        <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">
          Financial Statements
        </h1>
        <ReportTabs />

        <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">
              Balance Sheet
            </h2>
          </div>
          <hr className="my-3 border-t border-gray-100" />

          <Suspense fallback={<div>Loading Balance Sheet report...</div>}>
            <ReportTable reportType="BalanceSheet" />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
