'use client';
import { useState, useEffect, useRef, ReactNode, Suspense } from "react";
import * as yup from "yup";
import Select from "../../../../components/Select";
import TextArea from "../../../../components/TextArea";
import TextInput from "../../../../components/TextInput";
import { useAlert } from "../../../../app/context/AlertContext";
import { useRouter, useSearchParams } from "next/navigation";
import { generateYears, toOptions } from '../../../utils/common';
import { fetchDocumentById, fetchCategories, fetchTags, deleteFile, createOrUpdateDocument, fetchSubCategories } from "@/api/documenService";
import { Button } from "@/components/ui/button";

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

    const skeletonClass = "animate-pulse bg-gray-300 rounded-0";

    if (initialLoading || saving) {
        return (
            <div className="relative space-y-5 p-4 mx-auto bg-card">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className={`${skeletonClass} h-10 w-full`} />
                    <div className={`${skeletonClass} h-10 w-full`} />
                    <div className={`${skeletonClass} h-10 w-full`} />
                    <div className={`${skeletonClass} h-10 w-full`} />
                    <div className={`${skeletonClass} h-10 w-full`} />
                </div>
                <div className={`${skeletonClass} h-24 w-full`} />
                <div className={`${skeletonClass} h-32 w-full`} />
                <div className="space-y-2">
                    <div className={`${skeletonClass} h-8 w-full`} />
                    <div className={`${skeletonClass} h-8 w-full`} />
                </div>
                <div className={`${skeletonClass} h-10 w-32`} />
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
                <div className="grid md:grid-cols-3 gap-6">
                    <TextInput className="" label="Upload Title / Batch Description" value={form.document_title || ""} onChange={(val) => setField("document_title", val)}
                        placeholder="e.g., March Invoices – Client" error={typeof errors.document_title === "string" ? errors.document_title : undefined}
                    />
                    <Select label="Year" value={form.year} onChange={(val) => setField("year", val)} options={yearOptions} error={typeof errors.year === "string" ? errors.year : undefined}
                        placeholder="Select Year"
                    />
                    <Select label="Month" value={form.month} onChange={(val) => setField("month", val)} placeholder="Select Month" options={monthOptions}
                        error={typeof errors.month === "string" ? errors.month : undefined}
                    />
                    <Select label="Category" value={form.category} onChange={val => setField("category", val)} options={categoryOptions}
                        error={typeof errors.category === "string" ? errors.category : undefined} placeholder="Select Category"
                    />
                    {loadingSubCategories ? (
                        <div className="py-2 italic text-muted-foreground"></div>
                    ) : (
                        subCategories.length > 0 && (
                            <div>
                                <label className="block text-sm mb-1">Subcategory</label>
                                <select
                                    value={form.subCategory}
                                    onChange={(e) => setField("subCategory", e.target.value)}
                                    className="w-full border p-2 text-sm focus:outline-none border-border"
                                >
                                    <option value="">Select Subcategory (optional)</option>
                                    {subCategories.map((sub) => (
                                        <option key={sub.id} value={sub.id.toString()}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                <TextArea label="Notes" value={form.notes} onChange={(val) => setField("notes", val)}
                    placeholder="Optional notes"
                    error={typeof errors.notes === "string" ? errors.notes : undefined}
                />
                <div
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={`w-full border-1 bg-card backdrop-blur[10px] border-dashed border-border rounded-lg block py-15 px-8 text-center text-sm text-muted-foreground ${errors.files ? "border-red-500" : "border-border"}`}
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
                    <>
                        <div className="bg-card rounded-lg w-12 h-12 border-1 items-center justify-center mx-auto flex shadow-sm mb-4">
                            <img src="/upload_doc.svg" alt="Upload Doc" className="w-7 h-7 opacity-25" />
                        </div>
                        <p className="font-[300]"><span className="text-brand-primary900 font-medium pe-1.25">Choose a file</span> Or <span className="ps-1.25 text-brand-body/70 font-medium">Drag and Drop</span></p>
                        <span className="cursor-pointer text-brand-body/40 block mt-2.5">PDF, JPEG, PNG, and Excel (XLSX, XLS) formats</span>
                    </>
                    {errors.files && <p className="text-red-500 text-xs mt-1">{errors.files}</p>}
                </div>

                {files.length > 0 && (
                    <ul className="text-left text-brand-body mt-2 max-h-48 overflow-auto list-none">
                        {files.map((file, i) => {
                            if (!file || !file.name) {
                                console.warn(`Invalid file at index ${i}`, file);
                                return null;
                            }

                            const ext = file.name.split('.').pop()?.toLowerCase() || '';
                            let icon = "/doc.svg";
                            switch (ext) {
                                case "xls":
                                case "xlsx":
                                    icon = "/xlsx.svg";
                                    break;
                                case "pdf":
                                    icon = "/pdf.svg";
                                    break;
                                case "png":
                                    icon = "/png.svg";
                                    break;
                                case "jpeg":
                                case "jpg":
                                    icon = "/jpeg.svg";
                                    break;
                                case "doc":
                                case "docx":
                                    icon = "/doc.svg";
                                    break;
                            }

                            // Determine progress and label based on uploadSuccess
                            const progress = uploadSuccess ? 100 : ('progress' in file ? file.progress : 0);
                            const statusLabel = uploadSuccess || progress === 100 ? "Completed" : "Uploading...";

                            return (
                                <li
                                    key={i}
                                    className="text-sm p-3 bg-card backdrop-blur[10px] border mb-3 rounded-lg border-blue-200"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex gap-1.5 items-center">
                                            <div>
                                                <img src={icon} alt={ext || "file"} className="w-12 h-10" />
                                            </div>
                                            <div>
                                                <span className="font-normal block">{file.name}</span>
                                                <p className="block mt-0.5 text-brand-body/40 font-medium">
                                                    {formatFileSize(file.size)}{" "}
                                                    <span className={statusLabel === "Completed" ? "text-green-600" : "text-brand-primary"} font-normal text-xs>
                                                        {statusLabel}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(i);
                                            }}
                                            className="text-red-600 hover:text-red-800 ml-2 text-lg leading-0 cursor-pointer"
                                            aria-label={`Remove file ${file.name}`}
                                        >
                                            <i className="fi fi-rr-trash"></i>
                                        </button>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-13 block"></div>
                                        <div className="bg-gray-200 rounded-full h-2.5 w-full flex-1 mr-2">
                                            <div
                                                className="bg-sidebar-background h-2.5 rounded-full transition-all duration-300 ease-in-out flex items-center justify-end pr-2 text-xs text-card-foreground"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="font-semibold text-xs">{progress}%</p>
                                    </div>
                                </li>
                            );
                        }).filter(item => item !== null)}
                    </ul>
                )}

                {(existingFiles.length > 0 || files.length > 0) && (
                    <ul className="text-left text-brand-body mt-4">
                        {existingFiles.length > 0 && (
                            <li className="text-sm mb-2">
                                Previously Uploaded Files
                            </li>
                        )}
                        {existingFiles.map((existingFile) => (
                            <li
                                key={`existing-${existingFile.id}`}
                                className="flex items-center justify-between text-sm px-4 py-2 border border-border cursor-pointer mb-2"
                            >
                                <a
                                    href={`${backendUploadPath}/${existingFile.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 truncate text-brand-body"
                                    title={existingFile.fileName}
                                >
                                    <i className="fi fi-sr-document leading-0 mr-1 text-primary text-base"></i> {existingFile.fileName}
                                </a>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile(existingFile);
                                    }}
                                    className="ml-2 text-red-700 text-2xl leading-0 cursor-pointer"
                                    aria-label={`Remove file ${existingFile.fileName}`}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <Button
                    variant="default"
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer !font-normal shadow-sm hover:shadow-md transition-shadow text-primary-foreground"
                >
                    {saving ? "Uploading..." : "Submit"}
                </Button>
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