import jsPDF from "jspdf";
import "jspdf-autotable";

const exportCombinedPDF = (echantillonsData, donneesStatData) => {
  const doc = new jsPDF();

  // --- Echantillons Table ---
  doc.setFontSize(16);
  doc.text("Échantillons filtrés", 14, 15);
  const echantillonsHeaders = [
    "Ech", "Date", "RC2J", "RC7J", "RC28J", "Prise", "Stabilité",
    "Hydratation", "P. Feu", "R. Insoluble", "SO3", "Chlorure"
  ];
  const echantillonsBody = echantillonsData.map(row => [
    row.num_ech, row.date_test, row.rc2j, row.rc7j, row.rc28j,
    row.prise, row.stabilite, row.hydratation, row.pfeu,
    row.r_insoluble, row.so3, row.chlorure
  ]);
  doc.autoTable({ head: [echantillonsHeaders], body: echantillonsBody, startY: 22, styles: { fontSize: 8 }, theme: "grid" });

  // --- Donnees Statistiques Table ---
  doc.setFontSize(16);
  doc.text("Données Statistiques", 14, doc.lastAutoTable.finalY + 10);
  const donneesHeaders = ["Paramètre", "Valeur"];
  const donneesBody = donneesStatData.map(row => [row.param, row.valeur]);
  doc.autoTable({ head: [donneesHeaders], body: donneesBody, startY: doc.lastAutoTable.finalY + 15, styles: { fontSize: 8 }, theme: "grid" });

  doc.save("combined_report.pdf");
};
