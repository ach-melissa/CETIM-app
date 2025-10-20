// src/services/uploadPDF.js
export default async function uploadPDF(pdfBytes, {
  clientTypeCementId,
  pdfType,
  startDate,
  endDate
}) {
  try {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("pdf", blob, `${pdfType}.pdf`);
    formData.append("client_typecement_id", clientTypeCementId);
    formData.append("pdf_type", pdfType);
    formData.append("start_date", startDate || "");
    formData.append("end_date", endDate || "");

    console.log("📦 Sending FormData to backend:", {
      clientTypeCementId,
      pdfType,
      size: pdfBytes?.byteLength
    });

    const response = await fetch("http://localhost:5000/api/save-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Backend error:", text);
      throw new Error("Erreur lors de l'envoi du PDF");
    }

    const result = await response.json();
    console.log("✅ Backend responded:", result);
    return result;

  } catch (err) {
    console.error("❌ uploadPDF failed:", err);
    throw err;
  }
}
