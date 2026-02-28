"use client"

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react"
import {
  type LibraryItem,
  mockLibraryData,
  formatFileSize,
  mimeToFileType,
} from "@/lib/libraryData"
import {
  getRootFolders,
  getFolderContent,
  getFileDownloadUrl,
  collectFilesInFolder,
  type LibraryFolderView,
  type LibraryFileItem,
  type LibraryRootType,
} from "@/api/libraryService"
import JSZip from "jszip"
import { getCompanyById } from "@/api/auditService"

type ViewMode = "list" | "grid"
type SortField = "name" | "type" | "size"
type SortOrder = "asc" | "desc"

interface SortConfig {
  field: SortField
  order: SortOrder
}

interface ContextMenuState {
  x: number
  y: number
  itemId: string
}

interface BreadcrumbItem {
  id: string
  name: string
}

interface LibraryContextType {
  viewMode: ViewMode
  currentFolderId: string | null
  searchQuery: string
  selectedItems: string[]
  sortConfig: SortConfig
  contextMenu: ContextMenuState | null
  filterType: string
  isLoading: boolean
  error: string | null
  breadcrumbs: BreadcrumbItem[]
  currentItems: LibraryItem[]
  rootFolders: LibraryItem[]
  /** Folders shown in sidebar: root folders at root level, or child subfolders when inside a folder */
  sidebarFolders: LibraryItem[]
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setFilterType: (type: string) => void
  handleFolderClick: (id: string | null, opts?: { fromBreadcrumb?: boolean; name?: string }) => void
  handleBack: () => void
  handleDoubleClick: (item: LibraryItem) => void
  handleSelection: (id: string, e: React.MouseEvent) => void
  handleSort: (field: SortField) => void
  handleContextMenu: (e: React.MouseEvent, itemId: string) => void
  closeContextMenu: () => void
  isMobileSidebarOpen: boolean
  setIsMobileSidebarOpen: (open: boolean) => void
  setSelectedItems: (ids: string[]) => void
  handleDownload: (item?: LibraryItem) => void
  handleView: (item: LibraryItem) => void
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

/** Normalize folder - supports id/folder_id, name/folder_name (API doc vs backend) */
function mapApiFolderToItem(f: LibraryFolderView, parentId: string | null): LibraryItem {
  const id = f.id ?? f.folder_id ?? ""
  const name = f.name ?? f.folder_name ?? ""
  return {
    id,
    type: "folder",
    folder_name: name,
    parentId: f.parentId ?? parentId,
    tags: f.tags || [],
    uploaderId: "",
    isDeleted: false,
    createdAt: f.createdAt ?? "",
    updatedAt: f.updatedAt ?? "",
    name,
  } as LibraryItem
}

/** Normalize file - supports id/file_id, filename/file_name, type/file_type, size/file_size, url/file_url */
function mapApiFileToItem(f: LibraryFileItem, folderId: string): LibraryItem {
  const id = f.id ?? f.file_id ?? ""
  const filename = f.filename ?? f.file_name ?? ""
  const type = f.type ?? f.file_type ?? ""
  const size = f.size ?? f.file_size ?? 0
  const url = f.url ?? f.file_url ?? ""
  const fileType = mimeToFileType(type) || type?.split("/")?.pop()?.toUpperCase() || ""
  return {
    id,
    type: "file",
    folderId,
    file_name: filename,
    file_type: fileType,
    url,
    file_size: size,
    version: 1,
    tags: f.tags || [],
    uploaderId: "",
    isDeleted: false,
    createdAt: f.createdAt ?? "",
    name: filename,
  } as LibraryItem
}

const getStoredDecoded = (key: string): string | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(key)
  if (!stored) return null
  try {
    const decoded = atob(stored)
    // Basic UUID/ID check - UUIDs are typically 36 chars or alpha-numeric
    if (decoded.length > 5 && (decoded.includes("-") || /^[a-z0-9]+$/i.test(decoded))) {
      return decoded
    }
    return stored
  } catch (e) {
    return stored
  }
}

export const LibraryProvider: React.FC<{
  children: React.ReactNode
  initialItems?: any[]
  useApi?: boolean
  rootType?: LibraryRootType
  /** When set, library shows only this company's folder (strict per-company). Fetches company.folderId and uses it as the single root. */
  companyId?: string | null
  /** When set, library is scoped to this specific root folder (e.g. engagement library root). */
  rootFolderId?: string | null
}> = ({ children, initialItems, useApi = true, rootType = "CLIENT", companyId, rootFolderId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  // Initialize from localStorage only when NOT in company-scoped or folder-scoped mode
  useEffect(() => {
    if (useApi && !companyId && !rootFolderId) {
      const stored = getStoredDecoded("client_folder_id")
      if (stored) {
        setCurrentFolderId(stored)
      }
    }
  }, [useApi, companyId, rootFolderId])
  const [folderPath, setFolderPath] = useState<BreadcrumbItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "name", order: "asc" })
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [filterType, setFilterType] = useState("all")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API mode state
  const [apiRootFolders, setApiRootFolders] = useState<LibraryItem[]>([])
  const [apiCurrentContent, setApiCurrentContent] = useState<LibraryItem[]>([])

  const libraryData = useMemo(() => initialItems || mockLibraryData, [initialItems])

  // Mock mode: simulate loading on folder change
  useEffect(() => {
    if (useApi) return
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(t)
  }, [useApi, currentFolderId, filterType])

  // Engagement-scoped: use explicit rootFolderId as the only root
  useEffect(() => {
    if (!useApi || !rootFolderId) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      setApiRootFolders([])
      setFolderPath([])
      try {
        const rootItem: LibraryItem = {
          id: rootFolderId!,
          type: "folder",
          folder_name: "Engagement Library",
          parentId: null,
          name: "Engagement Library",
        } as LibraryItem
        setApiRootFolders([rootItem])
        setCurrentFolderId(rootFolderId)
        setFolderPath([{ id: String(rootFolderId), name: rootItem.name || "Engagement Library" }])
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load engagement library")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [useApi, rootFolderId])

  // Per-company: load company and use its folderId as the only root
  useEffect(() => {
    if (!useApi || !companyId || rootFolderId) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      setApiRootFolders([])
      setCurrentFolderId(null)
      setFolderPath([])
      try {
        const company = await getCompanyById(companyId)
        if (cancelled) return
        const folderId = company.folderId ?? (company as any).folderId
        if (!folderId) {
          setApiRootFolders([])
          setError("This company does not have a library folder yet.")
          return
        }
        const rootItem: LibraryItem = {
          id: folderId,
          type: "folder",
          folder_name: company.name || "Company Library",
          parentId: null,
          name: company.name || "Company Library",
        } as LibraryItem
        setApiRootFolders([rootItem])
        setCurrentFolderId(folderId)
        setFolderPath([{ id: folderId, name: company.name || "Company Library" }])
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load company library")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [useApi, companyId])

  // Load roots when using API and NOT company-scoped (global/client library)
  useEffect(() => {
    if (!useApi || companyId || rootFolderId) return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const roots = await getRootFolders()
        if (cancelled) return
        const storedClientFolderId = getStoredDecoded("client_folder_id")
        let filtered = roots
        if (rootType && roots.some((r) => (r as any).rootType)) {
          filtered = roots.filter((f) => (f as any).rootType === rootType)
        }
        if (rootType === "CLIENT" && storedClientFolderId) {
          filtered = filtered.filter((f) => (f.id === storedClientFolderId || f.folder_id === storedClientFolderId))
        }
        const mapped = filtered.map((f) => mapApiFolderToItem(f as LibraryFolderView, null))
        setApiRootFolders(mapped)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load library")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [useApi, rootType, companyId])

  // Load folder content when currentFolderId changes (API mode)
  useEffect(() => {
    if (!useApi || !currentFolderId) {
      setApiCurrentContent([])
      return
    }
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const content = await getFolderContent(currentFolderId)
        if (cancelled) return
        const parentId = content.folder?.id ?? content.folder?.folder_id ?? currentFolderId
        const foldersRaw = content.folders ?? content.childFolders ?? []
        const childFolders = foldersRaw.map((f) => mapApiFolderToItem(f, parentId))
        const files = (content.files ?? []).map((f) => mapApiFileToItem(f, parentId))
        setApiCurrentContent([...childFolders, ...files])

        // Auto-initialize folderPath if we jumped directly into a folder (initial load)
        if (folderPath.length === 0 && currentFolderId) {
          const folderName = content.folder?.name ?? content.folder?.folder_name ?? "Folder"
          setFolderPath([{ id: currentFolderId, name: folderName }])
        }
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load folder")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [useApi, currentFolderId])

  useEffect(() => {
    window.addEventListener("click", () => setContextMenu(null))
    return () => window.removeEventListener("click", () => setContextMenu(null))
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  // Breadcrumbs: from folderPath in API mode
  const breadcrumbs = useMemo(() => {
    if (useApi) return folderPath
    const path: BreadcrumbItem[] = []
    let currentId = currentFolderId
    while (currentId) {
      const folder = libraryData.find((item) => item.id === currentId && item.type === "folder")
      if (folder && folder.type === "folder") {
        path.unshift({ id: folder.id, name: (folder as any).folder_name || folder.name || "Folder" })
        currentId = (folder as any).parentId
      } else break
    }
    return path
  }, [useApi, folderPath, currentFolderId, libraryData])

  // Current items: from API or mock
  const rawCurrentItems = useMemo(() => {
    if (useApi) {
      if (!currentFolderId) return apiRootFolders
      return apiCurrentContent
    }
    return libraryData.filter((item) => {
      const itemParentId = item.type === "folder" ? (item as any).parentId : (item as any).folderId
      return itemParentId === currentFolderId
    })
  }, [useApi, currentFolderId, apiRootFolders, apiCurrentContent, libraryData])

  const currentItems = useMemo(() => {
    const filtered = rawCurrentItems.filter((item) => {
      const itemName = item.type === "folder" ? (item as any).folder_name : (item as any).file_name
      const n = (item as any).name || itemName
      const matchesSearch =
        searchQuery === "" || String(n || "").toLowerCase().includes(searchQuery.toLowerCase())
      let matchesFilter = true
      if (filterType === "pdf")
        matchesFilter = item.type === "file" && ((item as any).file_type?.toUpperCase() || "").includes("PDF")
      else if (filterType === "spreadsheet")
        matchesFilter =
          item.type === "file" &&
          ["XLSX", "CSV"].includes((item as any).file_type?.toUpperCase() || "")
      else if (filterType === "document")
        matchesFilter =
          item.type === "file" &&
          ["DOCX", "DOC"].includes((item as any).file_type?.toUpperCase() || "")
      return matchesSearch && matchesFilter
    })

    const normalized = filtered.map((item) => {
      const name = item.type === "folder" ? (item as any).folder_name : (item as any).file_name
      const fileType = item.type === "file" ? (item as any).file_type : "Folder"
      const size = item.type === "file" ? formatFileSize((item as any).file_size || 0) : ""
      const updatedAtStr = item.type === "folder" ? (item as any).updatedAt : (item as any).createdAt
      return {
        ...item,
        name: (item as any).name || name,
        fileType,
        size,
        updatedAt: updatedAtStr ? new Date(updatedAtStr).toLocaleDateString() : "",
        parentId: item.type === "folder" ? (item as any).parentId : (item as any).folderId,
      }
    })

    normalized.sort((a, b) => {
      let comparison = 0
      if (sortConfig.field === "name") comparison = (a.name || "").localeCompare(b.name || "")
      else if (sortConfig.field === "type") comparison = (a.fileType || "").localeCompare(b.fileType || "")
      else if (sortConfig.field === "size") comparison = (a.size || "").localeCompare(b.size || "")
      return sortConfig.order === "asc" ? comparison : -comparison
    })
    return normalized
  }, [rawCurrentItems, searchQuery, filterType, sortConfig])

  const rootFolders = useMemo(() => {
    if (useApi) return apiRootFolders.map((f) => ({ ...f, name: (f as any).folder_name || f.name }))
    return libraryData
      .filter((item) => item.type === "folder" && (item as any).parentId === null)
      .map((folder) => ({ ...folder, name: (folder as any).folder_name || "" }))
  }, [useApi, apiRootFolders, libraryData])

  /** Sidebar: at root shows root folders; inside a folder shows its child subfolders */
  const sidebarFolders = useMemo(() => {
    const items = rawCurrentItems.filter((i) => i.type === "folder")
    return items.map((f) => ({ ...f, name: (f as any).folder_name || (f as any).name || "Folder" }))
  }, [rawCurrentItems])

  const handleFolderClick = useCallback(
    (id: string | null, opts?: { fromBreadcrumb?: boolean; name?: string }) => {
      setSelectedItems([])
      setContextMenu(null)
      if (id === null) {
        setCurrentFolderId(null)
        setFolderPath([])
        return
      }
      if (opts?.fromBreadcrumb && folderPath.length > 0) {
        const idx = folderPath.findIndex((p) => p.id === id)
        if (idx >= 0) {
          setFolderPath(folderPath.slice(0, idx + 1))
          setCurrentFolderId(id)
          return
        }
      }
      if (useApi) {
        setCurrentFolderId(id)
        const name = opts?.name ?? currentItems.find((i) => i.id === id)?.name ?? rootFolders.find((r) => r.id === id)?.name ?? "Folder"
        setFolderPath((prev) => [...prev, { id, name }])
      } else {
        setCurrentFolderId(id)
      }
    },
    [useApi, folderPath, currentItems, rootFolders]
  )

  const handleBack = useCallback(() => {
    if (!currentFolderId) return
    setSelectedItems([])
    setContextMenu(null)
    if (useApi && folderPath.length > 1) {
      const prev = folderPath[folderPath.length - 2]
      setFolderPath(folderPath.slice(0, -1))
      setCurrentFolderId(prev.id)
    } else if (useApi) {
      setFolderPath([])
      setCurrentFolderId(null)
    } else {
      const current = libraryData.find((item) => item.id === currentFolderId)
      setCurrentFolderId((current as any)?.parentId || null)
    }
  }, [currentFolderId, useApi, folderPath, libraryData])

  const handleView = useCallback(
    async (item: LibraryItem) => {
      if (item.type !== "file") return
      let url = (item as any).url as string | undefined
      let fileName = ((item as any).file_name || (item as any).name || "file") as string

      try {
        if (!url && useApi) {
          const res = await getFileDownloadUrl(item.id)
          url = res.url
          fileName = res.fileName || fileName
        }
      } catch (e) {
        console.error("Failed to get file download URL", e)
        return
      }

      if (!url) {
        console.error("No URL available for this file")
        return
      }

      // For view we just open the URL; browser handles file type
      window.open(url, "_blank", "noopener,noreferrer")
    },
    [useApi]
  )

  const handleDoubleClick = useCallback(
    (item: LibraryItem) => {
      if (item.type === "folder") {
        const name = (item as any).folder_name || (item as any).name
        handleFolderClick(item.id, { name })
      } else {
        handleView(item)
      }
    },
    [handleFolderClick, handleView]
  )

  const handleDownload = useCallback(
    async (item?: LibraryItem) => {
      const folders: LibraryItem[] = []
      const files: LibraryItem[] = []
      if (item) {
        if (item.type === "folder") {
          folders.push(item)
        } else {
          files.push(item)
        }
      } else if (selectedItems.length > 0) {
        const selected = currentItems.filter((i) => selectedItems.includes(i.id))
        selected.forEach((i) => (i.type === "folder" ? folders.push(i) : files.push(i)))
      } else {
        currentItems.forEach((i) => {
          if (i.type === "folder") folders.push(i)
          else if (i.type === "file") files.push(i)
        })
      }

      if (folders.length > 0 && useApi) {
        for (const folder of folders) {
          try {
            const folderName = (folder as any).folder_name || (folder as any).name || "folder"
            const { files: fileList, emptyFolders: emptyFolderPaths } = await collectFilesInFolder(folder.id, "")
            const zip = new JSZip()
            for (const { fileId, fileName, zipPath } of fileList) {
              const res = await getFileDownloadUrl(fileId)
              const blob = await fetch(res.url).then((r) => r.blob())
              zip.file(zipPath, blob)
            }
            for (const zipPath of emptyFolderPaths) {
              zip.file(`${zipPath}/.keep`, new Blob([]))
            }
            const content = await zip.generateAsync({ type: "blob" })
            const link = document.createElement("a")
            link.href = URL.createObjectURL(content)
            link.download = `${folderName}.zip`
            link.click()
            URL.revokeObjectURL(link.href)
          } catch (e) {
            console.error("Failed to download folder as zip", e)
          }
        }
      }

      const fileItems = files.filter((i) => i.type === "file")
      for (const i of fileItems) {
        let fileName = (i as any).file_name || (i as any).name || "file"
        let url = (i as any).url as string | undefined

        try {
          if (!url && useApi) {
            const res = await getFileDownloadUrl(i.id)
            url = res.url
            fileName = res.fileName || fileName
          }
        } catch (e) {
          console.error("Failed to get file download URL for download", e)
          continue
        }

        if (!url) continue

        // Fetch as blob and trigger download so the file downloads instead of opening in browser
        try {
          const resp = await fetch(url, { credentials: "omit" })
          if (!resp.ok) throw new Error("Download failed")
          const blob = await resp.blob()
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = blobUrl
          link.download = fileName || "file"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(blobUrl)
        } catch (e) {
          console.error("Failed to download file", e)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName || "file"
          link.target = "_blank"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    },
    [useApi, selectedItems, currentItems]
  )

  const handleSelection = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setContextMenu(null)
    setSelectedItems((prev) => {
      if (e.ctrlKey || e.metaKey) {
        return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      }
      return prev.length === 1 && prev[0] === id ? [] : [id]
    })
  }, [])

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }))
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, itemId })
    setSelectedItems((prev) => (prev.includes(itemId) ? prev : [itemId]))
  }, [])

  const breadcrumbItems: BreadcrumbItem[] = breadcrumbs

  const value: LibraryContextType = {
    viewMode,
    setViewMode,
    currentFolderId,
    searchQuery,
    setSearchQuery,
    selectedItems,
    setSelectedItems,
    sortConfig,
    contextMenu,
    filterType,
    setFilterType,
    isLoading,
    error,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    breadcrumbs: breadcrumbItems,
    currentItems,
    rootFolders,
    sidebarFolders,
    handleFolderClick: (id, opts) => handleFolderClick(id, opts),
    handleBack,
    handleDoubleClick,
    handleSelection,
    handleSort,
    handleContextMenu,
    closeContextMenu,
    handleDownload,
    handleView,
  }

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export const useLibrary = () => {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider")
  }
  return context
}
