"use client";

const dummyData = [
  {
    name: "invoice_april.pdf",
    category: "Invoices",
    tags: ["Urgent"],
    status: "Reviewed",
    feedback: "All clear",
  },
  {
    name: "tax_docs.zip",
    category: "Tax",
    tags: ["Pending"],
    status: "Pending",
    feedback: "Missing Form 16",
  },
  {
    name: "gst_report.pdf",
    category: "Tax",
    tags: ["Info"],
    status: "Rejected",
    feedback: "Incorrect values",
  },
];

const tagColors: Record<string, string> = {
  Urgent: "bg-red-600",
  Pending: "bg-yellow-400",
  Info: "bg-blue-500",
};

const statusStyles: Record<string, string> = {
  Reviewed: "bg-green-100 text-green-800 border border-green-300 rounded",
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-300 rounded",
  Rejected: "bg-red-100 text-red-800 border border-red-300 rounded",
};

export default function DocumentTable() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h2>
      <div className="w-full overflow-x-auto">
        <div className="lg:max-w-[1400px]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-300 bg-gray-50">
              <tr>
                <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">File</th>
                <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Category</th>
                <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Tags</th>
                <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Status</th>
                <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Feedback</th>
                <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((doc, i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="p-3 px-8 border-gray-300 text-gray-700">{doc.name}</td>
                  <td className="p-3 px-8 border-gray-300 text-gray-700">{doc.category}</td>

                  {/* Tags with dots */}
                  <td className="p-3 px-8 border-gray-300 text-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 text-xs font-medium text-gray-800"
                        >
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${tagColors[tag] || "bg-gray-400"}`}
                          ></span>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status as flat badge */}
                  <td className="p-3 px-8 border-gray-300 text-gray-700">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 ${statusStyles[doc.status] || "bg-gray-200 text-gray-800 border border-gray-300"}`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td className="p-3 px-8 border-gray-300 text-gray-700">{doc.feedback}</td>

                  <td className="p-3 px-8 border-gray-300 text-gray-700">
                    <i className="fi fi-rr-trash text-red-800 text-lg cursor-pointer hover:text-red-900"></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
