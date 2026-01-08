"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface UsePDFExportOptions {
  fileName?: string;
  orientation?: "portrait" | "landscape";
}

export const usePDFExport = (
  ref: React.RefObject<HTMLDivElement | null>
) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const exportPDF = async (options: UsePDFExportOptions = {}) => {
    if (!ref.current) return;

    const {
      fileName = "document.pdf",
      orientation = "portrait",
    } = options;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,

        // 🔴 CRITICAL FLAGS
        foreignObjectRendering: false,
        removeContainer: true,

        onclone: (doc) => {
          // 🔥 HARD RESET — prevents computedStyle oklab crash
          const all = doc.querySelectorAll("*");

          all.forEach((el) => {
            const element = el as HTMLElement;

            element.style.setProperty("color", "rgb(0,0,0)", "important");
            element.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
            element.style.setProperty(
              "border-color",
              "rgb(0,0,0)",
              "important"
            );
            element.style.setProperty(
              "outline-color",
              "rgb(0,0,0)",
              "important"
            );
            element.style.setProperty(
              "text-decoration-color",
              "rgb(0,0,0)",
              "important"
            );
            element.style.setProperty(
              "box-shadow",
              "none",
              "important"
            );
          });

          // Remove all <style> tags completely
          doc.querySelectorAll("style").forEach((s) => s.remove());
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });

      const pageWidth = orientation === "portrait" ? 210 : 297;
      const pageHeight = orientation === "portrait" ? 297 : 210;

      const imgHeight =
        (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pageWidth,
        imgHeight
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          pageWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed due to CSS color parsing.");
    } finally {
      setIsGenerating(false);
    }
  };

  return { exportPDF, isGenerating };
};
