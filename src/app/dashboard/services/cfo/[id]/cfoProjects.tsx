export const cfoProjects = [
  {
    id: "business-plan",
    title: "Business plan – bank financing",
    description:
      "Preparation of a full business plan and financial model to support bank financing discussions.",
    status: "In progress", // STRICT
    dueDate: "15 September 2025",
    additionalDetails: {
      scope: "Business plan, 3-year financial projections",
      assignedCFO: "Senior CFO Team",
      billing: "Per project",
    },
    documents: [
      {
        name: "Business Plan v1.pdf",
        type: "pdf",
        status: "Uploaded",
      },
      {
        name: "Financial Model.xlsx",
        type: "excel",
        status: "In progress",
      },
    ],
  },
  {
    id: "grant-projections",
    title: "Grant financial projections",
    description:
      "Grant-specific financial forecasts aligned with funding requirements.",
    status: "Waiting on you",
    dueDate: "05 October 2025",
    additionalDetails: {
      scope: "Grant forecast, cash flow impact",
      assignedCFO: "Grant Specialist",
      billing: "Per project",
    },
    documents: [
      {
        name: "Grant Forecast Template.xlsx",
        type: "excel",
        status: "Awaiting client input",
      },
    ],
  },
  {
    id: "acquisition-review",
    title: "Acquisition financial review",
    description:
      "Financial review and risk assessment for proposed acquisition.",
    status: "Completed",
    dueDate: "Completed",
    additionalDetails: {
      scope: "Transaction review, risk summary",
      assignedCFO: "M&A Advisor",
      billing: "Per project",
    },
    documents: [
      {
        name: "Acquisition Review Report.pdf",
        type: "pdf",
        status: "Final",
      },
    ],
  },
];
