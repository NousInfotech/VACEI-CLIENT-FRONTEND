// services/api.ts (or wherever your existing API functions are)

// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------- Individual API functions ---------------------

export async function fetchDocumentById(docId: string) {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock document
  return {
    id: docId,
    name: "Sample Document",
    category: "Financial",
    tags: ["important", "2024"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchCategories() {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock categories
  return {
    data: [
      { id: "1", name: "Financial", parentId: null },
      { id: "2", name: "Tax", parentId: null },
      { id: "3", name: "Legal", parentId: null },
      { id: "4", name: "Compliance", parentId: null },
    ],
  };
}

export async function fetchTags() {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock tags
  return {
    data: [
      { id: "1", name: "important" },
      { id: "2", name: "2024" },
      { id: "3", name: "reviewed" },
      { id: "4", name: "pending" },
    ],
  };
}

export async function fetchSubCategories(parentId: string) {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock subcategories
  return {
    data: [
      { id: "1", name: "Subcategory 1", parentId },
      { id: "2", name: "Subcategory 2", parentId },
    ],
  };
}

export async function deleteFile(fileId: any) {
  // Simulate API delay
  await simulateDelay(200);
  // Mock - no action needed
}

export async function createOrUpdateDocument(formData: FormData, docId: string | undefined) {
  // Simulate API delay
  await simulateDelay(500);
  
  // Mock response
  return {
    id: docId || `doc-${Date.now()}`,
    name: formData.get("name") as string || "New Document",
    message: docId ? "Document updated successfully" : "Document created successfully",
  };
}

type FetchDocumentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  year?: string | number;
  month?: string | number;
  tags?: string[];
};

export async function fetchDocuments({
  page = 1,
  limit = 10,
  search,
  category,
  year,
  month,
  tags,
}: FetchDocumentsParams) {
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock documents
  const mockDocuments = Array.from({ length: 25 }, (_, i) => ({
    id: `doc-${i + 1}`,
    name: `Document ${i + 1}`,
    category: category || "Financial",
    tags: tags || ["important"],
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  // Apply search filter if provided
  let filtered = mockDocuments;
  if (search) {
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);
  
  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function deleteDocument(docId: any) {
  // Simulate API delay
  await simulateDelay(200);
  // Mock - no action needed
  return { message: "Document deleted successfully" };
}

/**
 * Fetches the upload status summary (Documents Uploaded, Processed, Pending).
 * @returns {Promise<{ documentsUploaded: number, documentsProcessed: number, documentsPending: number }>}
 */
export async function fetchUploadStatusSummary() {
  // Mock data - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock upload status summary
  return {
    documentsUploaded: 45,
    documentsProcessed: 38,
    documentsPending: 7,
  };
}