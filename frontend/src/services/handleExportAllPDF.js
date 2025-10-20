// src/services/handleExportAllPDF.js
import { PDFDocument } from "pdf-lib";

const handleExportAllPDF = async (refs) => {
  try {
    const pdfBuffers = [];

    // Loop through each component ref except DonneesClients
    for (const ref of refs) {
      if (ref?.current?.generatePDFBytes) {
        const pdfBytes = await ref.current.generatePDFBytes();
        if (pdfBytes) pdfBuffers.push(pdfBytes);
      }
    }

    if (pdfBuffers.length === 0) {
      alert("Aucun PDF à fusionner.");
      return;
    }

    // Merge them all into one PDF
    const mergedPdf = await PDFDocument.create();

    for (const bytes of pdfBuffers) {
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Rapport_Complet.pdf";
    link.click();
  } catch (err) {
    console.error("Erreur fusion PDF:", err);
    alert("Erreur lors de l'exportation du PDF combiné.");
  }
};

export default handleExportAllPDF;
