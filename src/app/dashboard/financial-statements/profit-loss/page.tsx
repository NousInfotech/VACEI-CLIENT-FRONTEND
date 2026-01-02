import React, { Suspense } from "react";
import ReportTabs from "../components/Tabs";
import ReportTable from "../components/ReportTable";

export default function FinancialStatements() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
        <h1 className="text-xl leading-normal text-black capitalize font-medium">
          Financial Statements
        </h1>
        <ReportTabs />

        <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto ransition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl leading-normal text-black capitalize font-medium">
              Profit & Loss
            </h2>
            {/* <button className="bg-primary text-white px-3 py-1.5 hover:bg-dark-primary">Apply Now</button> */}
          </div>
          <hr className="my-3 border-t border-gray-100" />

          <Suspense fallback={<div>Loading report...</div>}>
            <ReportTable reportType="ProfitAndLoss" />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
