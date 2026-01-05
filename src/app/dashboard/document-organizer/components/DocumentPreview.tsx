import React, { useState, useEffect } from 'react';

type DocumentPreviewProps = {
  fileUrl: string;
  fileType: string;
  fileName?: string;
};

const supportedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export default function DocumentPreview({ fileUrl, fileType, fileName }: DocumentPreviewProps) {
  const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fullUrl = `${backendUrl.replace(/\/$/, '')}/${fileUrl.replace(/^\//, '')}`;

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [fileUrl]);

  if (!fileUrl) {
    return <p>No file URL provided.</p>;
  }

  if (!supportedTypes.includes(fileType)) {
    return <p>File type not supported for preview.</p>;
  }

  const Skeleton = () => (
    <div className="animate-pulse w-full h-[600px] bg-gray-200 border border-border rounded-md mb-2"></div>
  );

  const DownloadLink = () => (
    <div className="mb-6 flex flex-wrap justify-between items-center text-center">
      <h3 className="mb-2 text-lg font-semibold">Download</h3>
      <a
        href={fullUrl}
        download={fileName || 'download'}
        className="flex items-center gap-2 text-green-800 hover:underline font-semibold"
        target="_blank"
        rel="noopener noreferrer"
      >
        {fileName || 'File'}
       
        <i className="fi fi-rr-download text-xl"></i>
      </a>
    </div>
  );

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* Download section always on top */}
      <DownloadLink />

      {/* Preview or messages below */}
      {fileType === 'application/pdf' && (
        <>
          {hasError && <p>Unable to load PDF preview.</p>}
          {isLoading && !hasError && <Skeleton />}
          <iframe
            src={fullUrl}
            title={fileName || "PDF Preview"}
            width="100%"
            height="1100px"
            style={{
              border: 'none',
              display: hasError || isLoading ? 'none' : 'block',
              overflow: 'hidden',
            }}
            scrolling="no"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </>
      )}

      {(fileType === 'image/jpeg' || fileType === 'image/png') && (
        <>
          {hasError ? (
            <p>Unable to load image preview.</p>
          ) : (
            <>
              {isLoading && <Skeleton />}
              <img
                src={fullUrl}
                alt={fileName || 'Preview Image'}
                className="mx-auto"
                style={{
                  maxWidth: '100%',
                  maxHeight: '350px',
                  border: '1px solid #ccc',
                  display: isLoading ? 'none' : 'block',
                }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setHasError(true);
                  setIsLoading(false);
                }}
              />
            </>
          )}
        </>
      )}

      {(fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileType === "application/vnd.ms-excel") && (
        <p className="text-center text-brand-body">
      Excel file preview is not supported. Please download the file above.
    </p>
      )}
    </div>
  );
}
