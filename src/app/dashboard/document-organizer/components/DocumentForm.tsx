'use client';
import { useState, useEffect, useRef, ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";
import * as yup from "yup";
import Select from "../../../../components/Select";
import TextArea from "../../../../components/TextArea";
import TextInput from "../../../../components/TextInput";
import { PremiumInput } from "@/components/shared/PremiumInput";
import { useRouter, useSearchParams } from "next/navigation";
import { generateYears, toOptions } from '../../../utils/common';
import { fetchDocumentById, fetchCategories, fetchTags, deleteFile, createOrUpdateDocument, fetchSubCategories } from "@/api/documenService";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { Trash2, AlertCircle, CheckCircle2, FileText, Plus, X, UploadCloud, ChevronRight, Save, Info, File, Upload } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAlert } from "../../../../app/context/AlertContext";

const readFileHeader = async (file: File): Promise<string> => {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
};

const signatures: { [type: string]: string[] } = {
    pdf: ["25 50 44 46"],
    jpeg: ["ff d8 ff"],
    png: ["89 50 4e 47"],
    xlsx: ["50 4b 03 04"],
    xls: ["d0 cf 11 e0"],
};

const isValidFileSignature = async (file: File): Promise<boolean> => {
    const header = await readFileHeader(file);
    return Object.values(signatures).some((sigs) =>
        sigs.some((sig) => header.startsWith(sig))
    );
};

function DocumentFormContent() {
    type ExistingFile = {
        id: string | number;
        fileName: string;
        fileUrl: string;
    };

    // Define FileWithProgress type
    type FileWithProgress = File & { progress: number };

    const router = useRouter();
    const searchParams = useSearchParams();
    const docIdEncoded = searchParams?.get("doc");
    const docId = docIdEncoded ? docIdEncoded : null;
    const isUpdate = !!docId;
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const { setAlert } = useAlert();
    // Use FileWithProgress for files state
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
    const [form, setForm] = useState({
        year: "", month: "", document_title: "", category: "", subCategory: "", notes: "", selectedTags: [] as string[],
    });
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([]);
    const [loadingSubCategories, setLoadingSubCategories] = useState(false);
    const [tags, setTags] = useState<{ id: number; name: string; color: string }[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: ReactNode }>({});
    const [initialLoading, setInitialLoading] = useState(true);
    const dropRef = useRef<HTMLDivElement>(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const backendUploadPath = process.env.NEXT_PUBLIC_UPLOAD_PATH;

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const monthNumber = (i + 1).toString();
        const monthName = new Date(0, i).toLocaleString("default", { month: "long" });
        return { value: monthNumber, label: monthName };
    });
    const currentYear = new Date().getFullYear();
    const years = generateYears(currentYear);
    const yearOptions = toOptions(years);
    const categoryOptions = categories.map(cat => ({ value: cat.id.toString(), label: cat.name }));

    const getSchema = (isUpdate: boolean, hasExistingFiles: boolean) => {
        return yup.object().shape({
            year: yup.string().required("Year is required."),
            month: yup.string().required("Month is required."),
            document_title: yup.string().required("Upload Title / Batch Description is required."),
            category: yup.string().required("Category is required."),
            files: yup.array()
                .test("file-required", "At least one file is required.", function (files) {
                    if (isUpdate) {
                        if (!files || files.length === 0) {
                            return hasExistingFiles;
                        }
                        return true;
                    } else {
                        if (!files || files.length === 0) return false;
                        return true;
                    }
                })
                .test("fileType", "Unsupported file format", (files) => {
                    if (!files || files.length === 0) return true;
                    const supportedTypes = [
                        "application/pdf",
                        "image/jpeg",
                        "image/png",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "application/vnd.ms-excel",
                    ];
                    return files.every((file) => supportedTypes.includes(file.type));
                })
                .test("fileSignature", "Invalid or spoofed file format", async function (files) {
                    if (!files || files.length === 0) return true;
                    const validations = await Promise.all(files.map(isValidFileSignature));
                    return validations.every(Boolean);
                }),
        });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [catData, tagData] = await Promise.all([
                    fetchCategories(),
                    fetchTags()
                ]);
                setCategories(catData);
                setTags(tagData);

                if (docId) {
                    const document = await fetchDocumentById(docId);
                    setExistingFiles(document.files || []);
                    setForm({
                        year: document.year || "",
                        month: document.month || "",
                        document_title: document.document_title || "",
                        category: document.categories?.[0]?.id?.toString() || "",
                        subCategory: document.subCategories?.[0]?.id?.toString() || "",
                        notes: document.notes || "",
                        selectedTags: document.tags?.map((tag: { id: any }) => tag.id.toString()) || [],
                    });

                    if (document.categories?.[0]?.id) {
                        setLoadingSubCategories(true);
                        const subCats = await fetchSubCategories(document.categories[0].id);
                        setSubCategories(subCats);
                        setLoadingSubCategories(false);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, [docId]);

    useEffect(() => {
        const loadSubCategories = async () => {
            if (!form.category) {
                setSubCategories([]);
                setForm((f) => ({ ...f, subCategory: "" }));
                return;
            }
            setLoadingSubCategories(true);
            try {
                const subCats = await fetchSubCategories(form.category);
                setSubCategories(subCats);
            } catch (err) {
                setSubCategories([]);
            } finally {
                setLoadingSubCategories(false);
            }
        };
        loadSubCategories();
    }, [form.category]);

    const setField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
                .filter(file => file instanceof File && file.name)
                .map(file => Object.assign(file, { progress: 0 })) as FileWithProgress[];
            setFiles((currentFiles) => {
                const combinedFiles = [...currentFiles];
                for (const newFile of newFiles) {
                    const existingIndex = combinedFiles.findIndex(
                        (file) => file.name === newFile.name && file.size === newFile.size
                    );
                    if (existingIndex !== -1) {
                        combinedFiles[existingIndex] = newFile;
                    } else {
                        combinedFiles.push(newFile);
                    }
                }
                console.log('Updated files:', combinedFiles);
                return combinedFiles;
            });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files)
                .filter(file => file instanceof File && file.name)
                .map(file => Object.assign(file, { progress: 0 })) as FileWithProgress[];
            setFiles((currentFiles) => {
                const combined = [...currentFiles];
                for (const droppedFile of droppedFiles) {
                    const existingIndex = combined.findIndex(
                        (file) => file.name === droppedFile.name && file.size === droppedFile.size
                    );
                    if (existingIndex !== -1) {
                        combined[existingIndex] = droppedFile;
                    } else {
                        combined.push(droppedFile);
                    }
                }
                console.log('Updated files:', combined);
                return combined;
            });
        }
    };

    const handleRemoveFile = async (file: ExistingFile) => {
        if (existingFiles.length === 1 && files.length === 0) {
            setAlert({ message: "At least one file must remain.", variant: "danger" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (window.confirm(`Are you sure you want to remove the file "${file.fileName}"?`)) {
            try {
                await deleteFile(file.id);
                setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
                setAlert({ message: "Document file deleted successfully.", variant: "success" });
            } catch (e) {
                console.error(e);
                setAlert({ message: "Error deleting document", variant: "danger" });
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles((files) => files.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const schema = getSchema(isUpdate, existingFiles.length > 0);
            await schema.validate({ ...form, files }, { abortEarly: false });
            setErrors({});
        } catch (validationError: any) {
            const newErrors: typeof errors = {};
            if (validationError.inner) {
                validationError.inner.forEach((err: any) => {
                    if (err.path) newErrors[err.path] = err.message;
                });
            } else {
                newErrors[validationError.path] = validationError.message;
            }
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        formData.append("document_title", form.document_title);
        formData.append("year", form.year);
        formData.append("month", form.month);
        formData.append("category", form.category);
        if (form.subCategory) formData.append("subCategory", form.subCategory);
        formData.append("tagIds", JSON.stringify(form.selectedTags));
        if (form.notes) formData.append("notes", form.notes);

        try {
            // Simulate per-file progress
            ///  setFiles((prev) => prev.map((f) => ({ ...f, progress: 0 })));
            const totalFiles = files.length;
            await createOrUpdateDocument(formData, docId ?? undefined, (percent) => {
                console.log(`Overall upload progress: ${percent}%`);
                // Simulate per-file progress by staggering
                const baseProgress = percent / totalFiles;
                console.log('Base progress per file:', baseProgress);
                /*  setFiles((prev) =>
                     prev.map((f, index) => ({
                         ...f,
                         progress: Math.min(100, baseProgress * (index + 1)),
                     }))
                 ); */
            });

            if (docId) {
                setAlert({ message: "Documents updated successfully!", variant: "success" });
            } else {
                setUploadSuccess(true);
            }

            //  setFiles([]);
            setForm({
                year: "",
                month: "",
                document_title: "",
                category: "",
                subCategory: "",
                notes: "",
                selectedTags: [],
            });
            setErrors({});
            setSubCategories([]);

            setTimeout(() => router.push("/dashboard/document-organizer/document-listing"), 3000);
        } catch (err) {
            console.error(err);
            setAlert({ message: "Error uploading documents.", variant: "danger" });
        } finally {
            setSaving(false);
        }
    };

    if (initialLoading || saving) {
        return (
            <div className="relative space-y-5 p-4 mx-auto bg-card">
                <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
        );
    }

    return (
        <>
            {uploadSuccess && (
                <div className="mb-4 p-4 rounded-lg bg-sidebar-background text-green-800 border border-green-200 shadow-md flex items-center justify-between">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 text-green-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">
                            The documents have been uploaded to the server successfully and extraction will be processed with intelligence.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setUploadSuccess(false)}
                        className="ml-4 p-1 rounded-full hover:bg-sidebar-background text-green-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PremiumInput 
                        containerClassName="md:col-span-2 lg:col-span-1" 
                        label="Document Title" 
                        value={form.document_title || ""} 
                        onChange={(e) => setField("document_title", e.target.value)}
                        placeholder="e.g., March Invoices – Client" 
                        error={typeof errors.document_title === "string" ? errors.document_title : undefined}
                        leftIcon={FileText}
                    />
                    <Select 
                        label="Period - Year" 
                        value={form.year} 
                        onChange={(val) => setField("year", val)} 
                        options={yearOptions} 
                        error={typeof errors.year === "string" ? errors.year : undefined}
                        placeholder="Select Year"
                    />
                    <Select 
                        label="Period - Month" 
                        value={form.month} 
                        onChange={(val) => setField("month", val)} 
                        placeholder="Select Month" 
                        options={monthOptions}
                        error={typeof errors.month === "string" ? errors.month : undefined}
                    />
                    <Select 
                        label="Document Category" 
                        value={form.category} 
                        onChange={val => setField("category", val)} 
                        options={categoryOptions}
                        error={typeof errors.category === "string" ? errors.category : undefined} 
                        placeholder="Select Category"
                    />
                    {loadingSubCategories ? (
                        <div className="h-[74px] flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                    ) : (
                        subCategories.length > 0 && (
                            <Select 
                                label="Sub-Category" 
                                value={form.subCategory} 
                                onChange={(val) => setField("subCategory", val)} 
                                options={subCategories.map(sub => ({ value: sub.id.toString(), label: sub.name }))}
                                placeholder="Select Subcategory"
                            />
                        )
                    )}
                </div>
                <div style={{ display: "none" }}>
                    <label className="block text-sm mb-1">Tags</label>
                    <div className="border border-border p-2 bg-card max-h-48 overflow-x-auto flex flex-wrap gap-2">
                        {tags.map((tag) => {
                            const isSelected = form.selectedTags.includes(String(tag.id));
                            return (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-2 cursor-pointer select-none w-full mb-1"
                                    onClick={() =>
                                        setField(
                                            "selectedTags",
                                            isSelected
                                                ? form.selectedTags.filter((id) => id !== String(tag.id))
                                                : [...form.selectedTags, String(tag.id)]
                                        )
                                    }
                                >
                                    <label className="relative flex items-center w-5 h-5">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none w-4 h-4 border border-border rounded-none checked:border-[#00799c] checked:bg-[#00799c]"
                                            checked={isSelected}
                                            readOnly
                                        />
                                        <svg
                                            className="absolute w-3 h-3 text-card-foreground hidden peer-checked:block pointer-events-none left-0.5 top-1"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </label>
                                    <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-800">
                                        <span
                                            className="w-2 h-2 rounded-full inline-block"
                                            style={{ backgroundColor: tag.color }}
                                        ></span>
                                        {tag.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <TextArea label="Additional Notes" value={form.notes} onChange={(val) => setField("notes", val)}
                    placeholder="Provide any additional context or details about these documents..."
                    error={typeof errors.notes === "string" ? errors.notes : undefined}
                    className="md:col-span-2 lg:col-span-3"
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[15px] font-medium uppercase tracking-[0.2em] text-black">
                            File Upload
                        </label>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                            PDF, JPEG, PNG, EXCEL
                        </span>
                    </div>
                    
                    <div
                        ref={dropRef}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className={cn(
                            "group/drop relative w-full border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden",
                            errors.files 
                                ? "border-destructive bg-destructive/5" 
                                : "border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-900 hover:shadow-2xl hover:shadow-gray-200/50"
                        )}
                        onClick={() => {
                            const input = dropRef.current?.querySelector('input[type="file"]') as HTMLInputElement | null;
                            if (input) input.click();
                        }}
                    >
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,image/jpeg,image/png,.xlsx,.xls"
                        />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6 group-hover/drop:scale-110 group-hover/drop:rotate-6 transition-all duration-500">
                                <Upload className="w-8 h-8 text-gray-900" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-gray-900">
                                    Drop files here or click to browse
                                </p>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                                    Support for multiple files. High-resolution documents recommended for faster processing.
                                </p>
                            </div>
                        </div>

                        {/* Decorative background element */}
                        <div className="absolute inset-0 opacity-0 group-hover/drop:opacity-100 transition-opacity duration-700 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0,transparent_70%)]" />
                        </div>
                    </div>
                    {errors.files && (
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">
                            {errors.files}
                        </p>
                    )}
                </div>

                {files.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-black">
                                Selected Files
                            </label>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {files.map((file, i) => {
                                if (!file || !file.name) return null;
                                const progress = uploadSuccess ? 100 : ('progress' in file ? file.progress : 0);
                                
                                return (
                                    <div
                                        key={i}
                                        className="relative group/item flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover/item:bg-gray-900 group-hover/item:text-white transition-colors">
                                            <File className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate pr-6">
                                                {file.name}
                                            </p>
                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                                                {formatFileSize(file.size)} • {progress}%
                                            </p>
                                            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gray-900 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(i);
                                            }}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-destructive transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {existingFiles.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 px-1">
                            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-black">
                                Previously Uploaded
                            </label>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {existingFiles.map((existingFile) => (
                                <div
                                    key={existingFile.id}
                                    className="relative group/item flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all hover:bg-white"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={`${backendUploadPath}/${existingFile.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-bold text-gray-900 truncate block hover:underline pr-6"
                                        >
                                            {existingFile.fileName}
                                        </a>
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                                            Stored in Vault
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile(existingFile);
                                        }}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-destructive transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-8 flex justify-end">
                    <Button
                        variant="default"
                        type="submit"
                        disabled={saving}
                        className="h-14 px-12 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-xs shadow-xl shadow-gray-200/50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {saving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            isUpdate ? "Update Document" : "Start Upload"
                        )}
                    </Button>
                </div>
            </form>
        </>
    );
}

export default function DocumentForm() {
    return (
        <Suspense fallback={<div>Loading document form...</div>}>
            <DocumentFormContent />
        </Suspense>
    );
}