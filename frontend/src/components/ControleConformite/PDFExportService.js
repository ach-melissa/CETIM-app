// frontend/src/components/ControleConformite/PDFExportService.js
import jsPDF from "jspdf";
import "jspdf-autotable";

class PDFExportService {

static addTableToPDF(doc, tableData, startY, margin, pageWidth) {
  let currentY = startY;
  
  if (!tableData || !tableData.headers || !tableData.rows || tableData.rows.length === 0) {
    this.safeText(doc, "Aucune donnée disponible", margin, currentY);
    return currentY + 6;
  }

  doc.setFontSize(7); // Even smaller font for more columns
  const colCount = tableData.headers.length;
  const availableWidth = pageWidth - 2 * margin;
  const colWidth = availableWidth / colCount;

  // Draw table headers with background
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(margin, currentY - 4, availableWidth, 6, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black text
  tableData.headers.forEach((header, index) => {
    // Truncate long headers
    const truncatedHeader = header.length > 15 ? header.substring(0, 12) + '...' : header;
    this.safeText(doc, truncatedHeader, margin + index * colWidth, currentY);
  });
  
  currentY += 4;
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, currentY, margin + availableWidth, currentY);
  currentY += 3;

  // Draw table rows with colors
  doc.setFont('helvetica', 'normal');
  
  tableData.rows.forEach((row, rowIndex) => {
    // Check if we need a new page
// Check if we need a new page (using page height)
const pageHeight = doc.internal.pageSize.height;
if (currentY > pageHeight - 40) { // 40mm margin from bottom for table rows
  doc.addPage({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 400]
  });
  currentY = 20;
      
      // Redraw headers on new page
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, currentY - 4, availableWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      tableData.headers.forEach((header, index) => {
        const truncatedHeader = header.length > 15 ? header.substring(0, 12) + '...' : header;
        this.safeText(doc, truncatedHeader, margin + index * colWidth, currentY);
      });
      currentY += 4;
      doc.line(margin, currentY, margin + availableWidth, currentY);
      currentY += 3;
      doc.setFont('helvetica', 'normal');
    }

    // Set row background color based on type
    if (row.type === 'class-header') {
      doc.setFillColor(245, 245, 245); // Light gray for class headers
      doc.rect(margin, currentY - 3, availableWidth, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
    } else if (row.type === 'deviation') {
      doc.setFillColor(255, 255, 255); // White background
      doc.setTextColor(0, 0, 0);
    } else if (row.type === 'default') {
      doc.setFillColor(255, 255, 255); // White background
      doc.setTextColor(0, 0, 0);
    } else if (row.type === 'control') {
      doc.setFillColor(255, 255, 255); // White background
      doc.setTextColor(0, 0, 0);
    }

    // Apply cell-specific colors based on content
    row.data.forEach((cell, colIndex) => {
      let cellColor = [0, 0, 0]; // Default black
      
      // Color logic based on cell content
      if (typeof cell === 'string') {
        if (cell === 'OK' || cell === 'Satisfait' || cell === 'Conforme') {
          cellColor = [0, 128, 0]; // Green
        } else if (cell === 'Non Satisfait' || cell === 'Non Conforme') {
          cellColor = [255, 0, 0]; // Red
        } else if (cell.includes('%') && parseFloat(cell) > 5) {
          if (row.type === 'deviation') {
            cellColor = [255, 165, 0]; // Orange/Yellow for deviation > 5%
          } else if (row.type === 'default') {
            cellColor = [255, 0, 0]; // Red for default > 5%
          }
        } else if (cell === 'ND' || cell === '--') {
          cellColor = [128, 128, 128]; // Gray
        }
      }
      
      doc.setTextColor(cellColor[0], cellColor[1], cellColor[2]);
      this.safeText(doc, String(cell), margin + colIndex * colWidth, currentY);
    });

    currentY += 4;

    // Reset font for next row
    if (row.type === 'class-header') {
      doc.setFontSize(7);
    }
    doc.setTextColor(0, 0, 0); // Reset to black
  });

  return currentY;
  
}
// Add this method to PDFExportService.js
static addTableLegend(doc, startY, margin, pageWidth) {
  let currentY = startY;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  // Compact horizontal legend without "LÉGENDE:" title
  const legendItems = [
    { text: "% Déviation/Défaut <= 5%", color: [0, 128, 0] },
    { text: "% Déviation > 5%", color: [255, 165, 0] },
    { text: "% Défaut > 5%", color: [255, 0, 0] },
    { text: "-- Non définie ND/NS Données insuffisantes", color: [128, 128, 128] }
  ];

  const availableWidth = pageWidth - 2 * margin;
  const colWidth = availableWidth / legendItems.length;

  // Draw compact horizontal legend without title
  legendItems.forEach((item, index) => {
    const xPos = margin + index * colWidth;
    
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    this.safeText(doc, "×", xPos, currentY);
    
    doc.setTextColor(0, 0, 0);
    this.safeText(doc, item.text, xPos + 3, currentY);
  });

  return currentY + 5; // Minimal spacing
}

static async generateClassReport(selectedClasses, getClassData, helpers, options = {}) {
  const { getDeviationParameters, checkEquationSatisfaction, generateGeneralConclusion } = helpers;
  
  const { jsPDF } = await import('jspdf');
  
  // Increased page height from 297mm (A4) to 330mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 330] // Wider page to fit more content
  });
  
  let currentY = 20;
  const margin = 14;
  const pageWidth = doc.internal.pageSize.width;

  // Export each selected class in order
  for (let i = 0; i < selectedClasses.length; i++) {
    const classe = selectedClasses[i];
    
    // Add new page for each class (except first)
    if (i > 0) {
      doc.addPage({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 330] // Also set the same height for additional pages
      });
      currentY = 20;
    }

    try {
      // Get the actual class data
      const classData = getClassData(classe);
      
      // ===== HEADER SECTION =====
      currentY = this.addHeaderToPDF(doc, classe, options, currentY, margin, pageWidth);
      
      // ===== DEVIATIONS SECTIONS =====
      currentY = this.addDeviationsToPDF(doc, classe, classData, getDeviationParameters, options, currentY, margin, pageWidth);
      
      // ===== MESURES SECTION =====
      if (classData.mesureParamsWithData && classData.mesureParamsWithData.length > 0) {
        currentY = this.addMesuresToPDF(doc, classData, currentY, margin, pageWidth);
      }

      // ===== ATTRIBUTS SECTION =====
      if (classData.attributParamsWithData && classData.attributParamsWithData.length > 0) {
        currentY = this.addAttributsToPDF(doc, classData, checkEquationSatisfaction, currentY, margin, pageWidth);
      }

      // ===== CONCLUSION SECTION =====
      currentY = this.addConclusionToPDF(doc, classData, generateGeneralConclusion, options, currentY, margin, pageWidth);

    } catch (error) {
      console.error(`Error generating PDF for class ${classe}:`, error);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      this.safeText(doc, `Erreur lors de la generation pour la classe ${classe}`, margin, currentY);
      currentY += 20;
    }
 }

  return doc;
}

  // ✅ COMPLETELY REWRITTEN SAFE TEXT FUNCTION
  static safeText(doc, text, x, y) {
    if (text === null || text === undefined || text === "") {
      text = "-";
    }
    
    // Convert to string and fix ALL problematic characters
    let safeText = String(text)
      // Fix X̄ character and other special math symbols
      .replace(/X̄/g, 'X')                    // Replace X̄ with simple X
      .replace(/[≤⩽]/g, '<=')                // Replace all ≤ variants with <=
      .replace(/[≥⩾]/g, '>=')                // Replace all ≥ variants with >=
      .replace(/[·•]/g, '×')                 // Replace all dot/multiplication symbols with ×
      .replace(/["']/g, '')                  // Remove quotes
      .replace(/\u00A0/g, ' ')               // Replace non-breaking spaces with normal spaces
      .replace(/\s+/g, ' ')                  // Normalize multiple spaces to single space
      .replace(/(\d)\s+(\d)/g, '$1$2')       // Remove spaces between numbers
      
      .trim();
    
    try {
      doc.text(safeText, x, y);
    }  catch (error) {
    console.error('Text error:', error, 'Text:', safeText);
    // Ultimate fallback - only basic characters
    const fallbackText = safeText.replace(/[^\x20-\x7E]/g, '');
    doc.text(fallbackText || 'N/A', x, y);
  }
  }

static addHeaderToPDF(doc, classe, options, startY, margin, pageWidth) {
  let currentY = startY;
  
  // Reduced spacing between header elements
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, options.clientInfo?.nom || "Aucun client", margin, currentY);
  currentY += 6;

  doc.setFontSize(14);
  this.safeText(doc, "Contrôle de conformité / classe de résistance", margin, currentY);
  currentY += 8;

  if (options.produitInfo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    this.safeText(doc, `${options.produitInfo.nom} ( ${options.produitInfo.description} )`, margin, currentY);
    currentY += 5;
    
    // FIX: Handle famille properly (could be string or object)
    const familleText = options.produitInfo.famille?.nom || options.produitInfo.famille?.code || options.produitInfo.famille || "";
    this.safeText(doc, `Famille: ${familleText}`, margin, currentY);
    currentY += 5;
  }

  // FIX: Handle both period formats (object or direct properties)
  const periodStart = options.period?.start || options.periodStart || "";
  const periodEnd = options.period?.end || options.periodEnd || "";
  this.safeText(doc, `Période: ${periodStart} à ${periodEnd}`, margin, currentY);
  currentY += 8;

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, `CLASSE ${classe}`, margin, currentY);
  currentY += 12;

  return currentY;
}

  static addDeviationsToPDF(doc, classe, classData, getDeviationParameters, options, startY, margin, pageWidth) {
    let currentY = startY;
    const sectionTitles = {
      li: "Déviations Limites inférieures",
      ls: "Déviations Limites supérieures", 
      lg: "Défauts Limites garanties"
    };

    const deviationLabels = {
      li: "Déviation",
      ls: "Déviation", 
      lg: "Défaut"
    };

    ['li', 'ls', 'lg'].forEach(sectionType => {
      const params = getDeviationParameters(classe);
      const parametersToShow = params[sectionType].filter(paramKey => 
        classData.hasDataForParameter && classData.hasDataForParameter(paramKey)
      );

      const showAjoutInSection = options.showAjout && 
                                classData.hasDataForParameter("ajout_percent") && 
                                (sectionType === 'li' || sectionType === 'ls');

      if (parametersToShow.length > 0 || showAjoutInSection) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        this.safeText(doc, sectionTitles[sectionType], margin, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        parametersToShow.forEach(paramKey => {
          const compliance = classData.classCompliance[paramKey];
          if (compliance?.stats) {
            const deviationData = this.getDeviationDisplayData(compliance, sectionType, paramKey);
            
            const param = (classData.allParameters || []).find(p => p.key === paramKey) || 
                         (classData.deviationOnlyParams || []).find(p => p.key === paramKey);
            const label = param?.label || paramKey;
            
            this.safeText(doc, label, margin, currentY);
            this.safeText(doc, deviationData.displayText, margin + 80, currentY);
            this.safeText(doc, deviationData.deviationText, margin + 150, currentY);
            currentY += 6;
          }
        });

        if (showAjoutInSection && classData.classCompliance.ajout_percent?.stats?.count > 0) {
          const ajoutCompliance = classData.classCompliance.ajout_percent;
          const ajoutData = this.getDeviationDisplayData(ajoutCompliance, sectionType, 'ajout_percent');
          
          this.safeText(doc, `Ajout ${options.ajoutDescription || ""}`, margin, currentY);
          this.safeText(doc, ajoutData.displayText, margin + 80, currentY);
          this.safeText(doc, ajoutData.deviationText, margin + 150, currentY);
          currentY += 6;
        }

        currentY += 8;
      }
    });

    return currentY;
  }

  static getDeviationDisplayData(compliance, sectionType, paramKey) {
    const percentValue = sectionType === 'li' ? compliance.stats.percentLI : 
                        sectionType === 'ls' ? compliance.stats.percentLS : 
                        compliance.stats.percentLG;
    
    const limitValue = sectionType === 'li' ? compliance.limits.li : 
                      sectionType === 'ls' ? compliance.limits.ls : 
                      compliance.limits.lg;

    const hasLimit = limitValue !== "-" && limitValue !== null && limitValue !== undefined;
    const deviationLabels = { li: "Déviation", ls: "Déviation", lg: "Défaut" };
    
    const safePercent = percentValue !== "-" && percentValue !== null && percentValue !== undefined ? percentValue : "0.00";
    const safeLimit = hasLimit ? limitValue : "-";
    
    let displayText = "0.00% < -";
    if (hasLimit) {
      if (sectionType === 'li') {
        displayText = `${safePercent}% < ${safeLimit}`;
      } else if (sectionType === 'ls') {
        displayText = `${safePercent}% > ${safeLimit}`;
      } else if (sectionType === 'lg') {
        if (['rc2j', 'rc7j', 'rc28j', 'prise', 'ajout_percent'].includes(paramKey)) {
          displayText = `${safePercent}% < ${safeLimit}`;
        } else {
          displayText = `${safePercent}% > ${safeLimit}`;
        }
      }
    }

    return {
      displayText,
      deviationText: `${deviationLabels[sectionType]}=${safePercent}%`
    };
  }

  static addMesuresToPDF(doc, classData, startY, margin, pageWidth) {
    let currentY = startY;
    
    if (!classData.mesureParamsWithData || classData.mesureParamsWithData.length === 0) {
      return currentY;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, "Contrôle par Mesures des résistances mécaniques", margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const isLowClass = ["32.5 L", "32.5 N", "42.5 L"].includes(classData.classe || "");
    
    if (isLowClass) {
      this.addMesureRow(doc, "Résistance courante 7 jrs LI", classData.statisticalCompliance?.rc7j_li, margin, currentY);
      currentY += 6;
      this.addMesureRow(doc, "Résistance courante 28 jrs LI", classData.statisticalCompliance?.rc28j_li, margin, currentY);
      currentY += 6;
      this.addMesureRow(doc, "Résistance courante 28 jrs LS", classData.statisticalCompliance?.rc28j_ls, margin, currentY);
      currentY += 6;
    } else {
      this.addMesureRow(doc, "Résistance courante 2 jrs LI", classData.statisticalCompliance?.rc2j_li, margin, currentY);
      currentY += 6;
      this.addMesureRow(doc, "Résistance courante 28 jrs LI", classData.statisticalCompliance?.rc28j_li, margin, currentY);
      currentY += 6;
      this.addMesureRow(doc, "Résistance courante 28 jrs LS", classData.statisticalCompliance?.rc28j_ls, margin, currentY);
      currentY += 6;
    }

    classData.mesureParamsWithData
      .filter(param => !["rc2j", "rc7j", "rc28j"].includes(param.key))
      .forEach(param => {
        const liCompliance = classData.statisticalCompliance?.[`${param.key}_li`];
        const lsCompliance = classData.statisticalCompliance?.[`${param.key}_ls`];

        if (param.key === "prise" && liCompliance) {
          this.addMesureRow(doc, `${param.label} LI`, liCompliance, margin, currentY);
          currentY += 6;
        } else {
          if (liCompliance) {
            this.addMesureRow(doc, `${param.label} LI`, liCompliance, margin, currentY);
            currentY += 6;
          }
          if (lsCompliance) {
            this.addMesureRow(doc, `${param.label} LS`, lsCompliance, margin, currentY);
            currentY += 6;
          }
        }
      });

    return currentY + 8;
  }

  static addMesureRow(doc, label, compliance, margin, currentY) {
    if (!compliance) return;
    
    this.safeText(doc, label, margin, currentY);
    
    // ✅ COMPLETELY CLEAN EQUATION
    let equation = compliance.displayEquation || compliance.equation || "N/A";
    equation = this.cleanEquation(equation);
    
    this.safeText(doc, equation, margin + 80, currentY);
    
    const statusText = compliance.noLimit ? "Pas de limite définie" :
                     compliance.equation?.includes("insuffisantes") || 
                     compliance.equation?.includes("non disponible") ? 
                     "Données insuffisantes" : 
                     (compliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite");
    
    this.safeText(doc, statusText, margin + 160, currentY);
  }

  // ✅ NEW FUNCTION TO CLEAN EQUATIONS COMPLETELY
  static cleanEquation(equation) {
    return String(equation)
      .replace(/X̄/g, 'X')                    // Replace X̄ with X
      .replace(/[≤⩽]/g, '<=')                // Replace ≤ with <=
      .replace(/[≥⩾]/g, '>=')                // Replace ≥ with >=
      .replace(/[·•]/g, '×')                 // Replace · with ×
      .replace(/["'\u00A0]/g, '')            // Remove quotes and non-breaking spaces
      .replace(/\s+/g, ' ')                  // Normalize spaces
      .replace(/(\d)\s+(\d)/g, '$1$2')       // Remove spaces between numbers (28 . 44 → 28.44)
      .replace(/(\w)\s+([×+\-<=>])/g, '$1$2') // Remove spaces before operators
      .replace(/([×+\-<=>])\s+(\w)/g, '$1$2') // Remove spaces after operators
      .replace(/k\s*·\s*s/g, 'k×s')          // Fix k·s formatting
      .trim();
  }

  static addAttributsToPDF(doc, classData, checkEquationSatisfaction, startY, margin, pageWidth) {
    let currentY = startY;
    
    if (!classData.attributParamsWithData || classData.attributParamsWithData.length === 0) {
      return currentY;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, "Contrôle par Attributs propriétés physiques & chimiques", margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    classData.attributParamsWithData.forEach(param => {
      const attributeResult = checkEquationSatisfaction(
        classData.classCompliance[param.key]?.values || [],
        classData.classCompliance[param.key]?.limits || {},
        classData.conditionsStatistiques || []
      );
      
      this.safeText(doc, param.label, margin, currentY);
      
      let equation = attributeResult.displayText || attributeResult.equation || "N/A";
      equation = this.cleanEquation(equation);
      
      this.safeText(doc, equation, margin + 80, currentY);
      
      const statusText = attributeResult.noLimits ? "Pas de limites définies" :
                       attributeResult.equation?.includes("insuffisantes") || 
                       attributeResult.equation?.includes("manquantes") || 
                       attributeResult.equation?.includes("non chargées") ? 
                       "Données insuffisantes" : 
                       (attributeResult.satisfied ? "Équation satisfaite" : "Équation non satisfaite");
      
      this.safeText(doc, statusText, margin + 140, currentY);
      currentY += 6;
    });

    return currentY + 8;
  }

  static addConclusionToPDF(doc, classData, generateGeneralConclusion, options, startY, margin, pageWidth) {
    let currentY = startY;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, "CONCLUSION :", margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // ✅ FORCE CONCLUSION TO APPEAR
    try {
      const coverageAnalysis = {};
      const conclusionData = generateGeneralConclusion(
        coverageAnalysis, 
        options.phase || 'situation_courante', 
        classData.coverageRequirements || {}, 
        classData.conformiteData || {}, 
        classData.dataToUse || []
      );

      if (conclusionData.mainConclusions && conclusionData.mainConclusions.length > 0) {
        conclusionData.mainConclusions.forEach(conclusion => {
          this.safeText(doc, conclusion, margin, currentY);
          currentY += 6;
        });
      } else {
        this.safeText(doc, "Aucune conclusion disponible", margin, currentY);
        currentY += 6;
      }
    } catch (error) {
      console.error("Error generating conclusion:", error);
      this.safeText(doc, "Conclusion: Analyse terminée", margin, currentY);
      currentY += 6;
    }

    currentY += 10;

    // ✅ FORCE CONFORMITY TO APPEAR
    if (classData.conformityResult) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const conformityText = `CONFORMITÉ: ${classData.conformityResult.isClassConforme ? 'CONFORME' : 'NON CONFORME'}`;
      
      // Simple text without box to ensure it appears
      this.safeText(doc, conformityText, margin, currentY);
      currentY += 15;
    } else {
      this.safeText(doc, "CONFORMITÉ: NON DÉTERMINÉE", margin, currentY);
      currentY += 15;
    }

    return currentY;
  }
static async generateTableReport(tableData, options = {}) {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 400]
  });
  
  let currentY = 20;
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ===== HEADER SECTION =====
  currentY = this.addTableHeaderToPDF(doc, options, currentY, margin, pageWidth);
  
  // Calculate if we have enough space for table + legend
  const estimatedTableHeight = tableData.rows ? tableData.rows.length * 4 + 20 : 100;
  const legendHeight = 50;
  
  if (currentY + estimatedTableHeight + legendHeight > pageHeight - 20) {
    // Not enough space - do table first, then legend on next page
    currentY = this.addTableToPDF(doc, tableData, currentY, margin, pageWidth);
    
    // Add new page for legend
    doc.addPage({
      orientation: 'landscape',
      unit: 'mm',
      format: [350, 450]
    });
    currentY = 20;
    this.addTableLegend(doc, currentY, margin, pageWidth);
  } else {
    // Enough space - do table and legend on same page
    currentY = this.addTableToPDF(doc, tableData, currentY, margin, pageWidth);
    this.addTableLegend(doc, currentY, margin, pageWidth);
  }

  return doc;
}

static addTableHeaderToPDF(doc, options, startY, margin, pageWidth) {
  let currentY = startY;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, options.clientInfo?.nom || "Aucun client", margin, currentY);
  currentY += 6;

  doc.setFontSize(14);
  this.safeText(doc, "Tableau de Conformité", margin, currentY);
  currentY += 8;

  if (options.produitInfo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    this.safeText(doc, `${options.produitInfo.nom} ( ${options.produitInfo.description} )`, margin, currentY);
    currentY += 5;
    
    const familleText = options.produitInfo.famille?.nom || options.produitInfo.famille?.code || options.produitInfo.famille || "";
    this.safeText(doc, `Famille: ${familleText}`, margin, currentY);
    currentY += 5;
  }

  const periodStart = options.periodStart || "";
  const periodEnd = options.periodEnd || "";
  this.safeText(doc, `Période: ${periodStart} à ${periodEnd}`, margin, currentY);
  currentY += 8;

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  return currentY;
}

static async generateStatsReport(data, options = {}) {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  let currentY = 15;
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ===== HEADER SECTION =====
  currentY = this.addStatsHeaderToPDF(doc, data, currentY, margin, pageWidth);
  
  // ===== GLOBAL STATS TABLE =====
  currentY = this.addGlobalStatsTableToPDF(doc, data, currentY, margin, pageWidth);
  
  // ===== CLASS LIMITS SECTION =====
  if (data.classes && data.classes.length > 0) {
    currentY = this.addClassLimitsToPDF(doc, data, currentY, margin, pageWidth);
  }

  return doc;
}

static addStatsHeaderToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  // Header with better organization
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, "DONNÉES STATISTIQUES", pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  doc.setFontSize(12);
  this.safeText(doc, data.clientInfo?.nom || "Aucun client", pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  if (data.produitInfo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    this.safeText(doc, `${data.produitInfo.nom} (${data.produitInfo.description})`, margin, currentY);
    currentY += 4;
    
    this.safeText(doc, `Famille: ${data.produitInfo.famille || ""}`, margin, currentY);
    currentY += 4;
  }

  const periodStart = data.period?.start || "";
  const periodEnd = data.period?.end || "";
  this.safeText(doc, `Période: ${periodStart} à ${periodEnd}`, margin, currentY);
  currentY += 4;
  
  this.safeText(doc, `Nombre d'échantillons: ${data.dataToUse?.length || 0}`, margin, currentY);
  currentY += 6;

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  return currentY;
}

static addGlobalStatsTableToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  if (!data.globalStats || !data.parameters) {
    this.safeText(doc, "Aucune donnée statistique disponible", margin, currentY);
    return currentY + 6;
  }

  // Use the exact same styling as your browser table
  doc.setFontSize(8);
  const colCount = data.parameters.length + 1;
  const availableWidth = pageWidth - 2 * margin;
  const colWidth = availableWidth / colCount;

  // Table headers with light blue background (like your screenshot)
  doc.setFillColor(223, 235, 247); // Light blue from your screenshot
  doc.rect(margin, currentY - 4, availableWidth, 6, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // Headers row
  this.safeText(doc, "Statistique", margin, currentY);
  data.parameters.forEach((param, index) => {
    this.safeText(doc, param.label, margin + (index + 1) * colWidth, currentY);
  });
  
  currentY += 4;
  
  // Data rows with alternating colors
  doc.setFont('helvetica', 'normal');
  
  const statRows = [
    { key: "count", label: "Nombre", bgColor: [255, 255, 255] }, // White
    { key: "min", label: "Min", bgColor: [242, 242, 242] }, // Light gray
    { key: "max", label: "Max", bgColor: [255, 255, 255] }, // White
    { key: "mean", label: "Moyenne", bgColor: [242, 242, 242] }, // Light gray
    { key: "std", label: "Écart type", bgColor: [255, 255, 255] }, // White
  ];

  statRows.forEach((row, rowIndex) => {
    // Row background
    doc.setFillColor(row.bgColor[0], row.bgColor[1], row.bgColor[2]);
    doc.rect(margin, currentY - 3, availableWidth, 4, 'F');
    
    // First column (stat label) - bold
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, row.label, margin, currentY);
    
    // Data columns - normal font
    doc.setFont('helvetica', 'normal');
    data.parameters.forEach((param, index) => {
      const value = data.globalStats[param.key]?.[row.key];
      let displayValue = "-";
      
      if (value !== undefined && value !== null) {
        if (typeof value === 'number') {
          // Format numbers with comma as decimal separator like your screenshot
          displayValue = value.toFixed(3).replace('.', ',');
        } else {
          displayValue = String(value);
        }
      }
      
      this.safeText(doc, displayValue, margin + (index + 1) * colWidth, currentY);
    });
    
    currentY += 4;
  });

  // Add bottom border
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, margin + availableWidth, currentY);
  currentY += 8;

  return currentY;
}

static addStatsHeaderToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  // Main title - exactly like your screenshot
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, data.clientInfo?.nom || "Gravel Construction", margin, currentY);
  currentY += 6;

  // Subtitle
  doc.setFontSize(14);
  this.safeText(doc, "Donnees Statistiques", margin, currentY);
  currentY += 8;

  // Product info - exactly like your screenshot format
  if (data.produitInfo) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    this.safeText(doc, `${data.produitInfo.nom} (${data.produitInfo.description})`, margin, currentY);
    currentY += 5;
    
    const familleText = data.produitInfo.famille?.nom || data.produitInfo.famille || "";
    this.safeText(doc, `Familie-${familleText}`, margin, currentY);
    currentY += 5;
  }

  // Period and sample info - exactly like your screenshot
  doc.setFontSize(10);
  const periodStart = data.period?.start || "";
  const periodEnd = data.period?.end || "";
  this.safeText(doc, `Période: ${periodStart}`, margin, currentY);
  currentY += 4;


  return currentY;
}

static addClassLimitsToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  const pageHeight = doc.internal.pageSize.height;

  if (!data.classes || !data.parameters) {
    return currentY;
  }

  // Process each class
  data.classes.forEach((classe, classIndex) => {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage({
        orientation: 'landscape', 
        unit: 'mm',
        format: 'a4'
      });
      currentY = 20;
    }

    // Class header with COLOR - like your screenshot
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(255, 204, 153); // Orange color for class header like your screenshot
    doc.rect(margin, currentY - 3, pageWidth - 2 * margin, 5, 'F');
    doc.setTextColor(0, 0, 0);
    this.safeText(doc, `CLASS: ${classe}`, margin + 5, currentY);
    currentY += 8;

    // Create limits table for this class with colors
    const limitsData = [
      { 
        label: "Limite intérieure (LI)", 
        type: "li",
        bgColor: [242, 242, 242] // Light gray
      },
      { 
        label: "N < LI", 
        type: "count-li",
        bgColor: [255, 255, 255] // White
      },
      { 
        label: "% < LI", 
        type: "percent-li", 
        bgColor: [242, 242, 242] // Light gray
      },
      { 
        label: "Limite supérieure (LS)", 
        type: "ls",
        bgColor: [255, 255, 255] // White
      },
      { 
        label: "N > LS", 
        type: "count-ls",
        bgColor: [242, 242, 242] // Light gray
      },
      { 
        label: "% > LS", 
        type: "percent-ls",
        bgColor: [255, 255, 255] // White
      },
      { 
        label: "Limite garantie (LG)", 
        type: "lg",
        bgColor: [242, 242, 242] // Light gray
      },
      { 
        label: "N > LG", 
        type: "count-lg",
        bgColor: [255, 255, 255] // White
      },
      { 
        label: "% > LG", 
        type: "percent-lg",
        bgColor: [242, 242, 242] // Light gray
      }
    ];

    // Draw each limit row with alternating colors
    doc.setFontSize(8);
    
    limitsData.forEach((limitRow, rowIndex) => {
      doc.setFillColor(limitRow.bgColor[0], limitRow.bgColor[1], limitRow.bgColor[2]);
      doc.rect(margin, currentY - 2, pageWidth - 2 * margin, 4, 'F');
      
      // Limit label
      doc.setFont('helvetica', 'normal');
      this.safeText(doc, limitRow.label, margin + 2, currentY);
      
      // For now, just show placeholder values - you'll need to replace with actual data
      this.safeText(doc, "-", margin + 80, currentY);
      
      currentY += 4;
    });

    currentY += 8; // Space between classes
  });

  return currentY;
}

static addStatsHeaderToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  // Compact header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, data.clientInfo?.nom || "Aucun client", margin, currentY);
  currentY += 4;

  doc.setFontSize(12);
  this.safeText(doc, "Données Statistiques", margin, currentY);
  currentY += 5;

  if (data.produitInfo) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Combine product info into one line
    const productLine = `${data.produitInfo.nom} (${data.produitInfo.description}) `;
    this.safeText(doc, productLine, margin, currentY);
    currentY += 4;
  }

  const periodStart = data.period?.start || "";
  const periodEnd = data.period?.end || "";
  this.safeText(doc, `Période: ${periodStart} à ${periodEnd} `, margin, currentY);
  currentY += 4;

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  return currentY;
}

static addGlobalStatsTableToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  if (!data.globalStats || !data.parameters) {
    this.safeText(doc, "Aucune donnée statistique disponible", margin, currentY);
    return currentY + 6;
  }

  // Create table data structure matching your screenshot
  const tableData = {
    headers: ["Statistique", ...data.parameters.map(p => p.label)],
    rows: [
      {
        type: 'default',
        data: ["Nombre", ...data.parameters.map(p => data.globalStats[p.key]?.count || "-")]
      },
      {
        type: 'default', 
        data: ["Min", ...data.parameters.map(p => data.globalStats[p.key]?.min || "-")]
      },
      {
        type: 'default',
        data: ["Max", ...data.parameters.map(p => data.globalStats[p.key]?.max || "-")]
      },
      {
        type: 'default',
        data: ["Moyenne", ...data.parameters.map(p => data.globalStats[p.key]?.mean || "-")]
      },
      {
        type: 'default',
        data: ["Écart type", ...data.parameters.map(p => data.globalStats[p.key]?.std || "-")]
      }
    ]
  };



  // Generate the table using your existing table function
  return this.addTableToPDF(doc, tableData, currentY, margin, pageWidth);
}

static addClassLimitsToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  const pageHeight = doc.internal.pageSize.height;

  if (!data.classes || !data.parameters) {
    return currentY;
  }

  doc.setFontSize(5);

  data.classes.forEach((classe, classIndex) => {
    // Check if we need a new page
    if (currentY > pageHeight - 50) {
      doc.addPage({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 400]
      });
      currentY = 20;
    }

    // Class header
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, `CLASSE ${classe}`, margin, currentY);
    currentY += 3;

    // Limits table
    doc.setFontSize(5);
    const colCount = data.parameters.length + 1;
    const availableWidth = pageWidth - 2 * margin;
    const colWidth = availableWidth / colCount;

    // Table rows for this class
    const limitRows = [
      { label: "Limite inférieure (LI)", getValue: (param) => data.getLimitsByClass(classe, param.key)?.li || "-" },
      { label: "N < LI", getValue: (param) => {
        const limits = data.getLimitsByClass(classe, param.key);
        const evalData = data.evaluateLimits(data.dataToUse, param.key, limits.li, limits.ls, limits.lg);
        return evalData.belowLI;
      }},
      { label: "% < LI", getValue: (param) => {
        const limits = data.getLimitsByClass(classe, param.key);
        const evalData = data.evaluateLimits(data.dataToUse, param.key, limits.li, limits.ls, limits.lg);
        return evalData.percentLI;
      }},
      { label: "Limite supérieure (LS)", getValue: (param) => data.getLimitsByClass(classe, param.key)?.ls || "-" },
      { label: "N > LS", getValue: (param) => {
        const limits = data.getLimitsByClass(classe, param.key);
        const evalData = data.evaluateLimits(data.dataToUse, param.key, limits.li, limits.ls, limits.lg);
        return evalData.aboveLS;
      }},
      { label: "% > LS", getValue: (param) => {
        const limits = data.getLimitsByClass(classe, param.key);
        const evalData = data.evaluateLimits(data.dataToUse, param.key, limits.li, limits.ls, limits.lg);
        return evalData.percentLS;
      }},
      { label: "Limite garantie (LG)", getValue: (param) => data.getLimitsByClass(classe, param.key)?.lg || "-" },
      { label: "N > LG", getValue: (param) => {
        const limits = data.getLimitsByClass(classe, param.key);
        const evalData = data.evaluateLimits(data.dataToUse, param.key, limits.li, limits.ls, limits.lg);
        return evalData.belowLG;
      }},
      { label: "% > LG", getValue: (param) => {
        const limits = data.getLimitsByClass(classe, param.key);
        const evalData = data.evaluateLimits(data.dataToUse, param.key, limits.li, limits.ls, limits.lg);
        return evalData.percentLG;
      }},
    ];

    // Draw table for this class
    limitRows.forEach(row => {
      this.safeText(doc, row.label, margin, currentY);
      data.parameters.forEach((param, index) => {
        const value = row.getValue(param);
        const displayValue = String(value).length > 6 ? String(value).substring(0, 5) : String(value);
        this.safeText(doc, displayValue, margin + (index + 1) * colWidth, currentY);
      });
      currentY += 2;
    });

    currentY += 2; // Space between classes
  });

  return currentY;
}
static async generateGraphicalReport(graphicalData, options = {}) {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  let currentY = 15;
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ===== HEADER SECTION =====
  currentY = this.addGraphicalHeaderToPDF(doc, graphicalData, currentY, margin, pageWidth);
  
  // ===== MAIN CONTENT - Two columns layout =====
  currentY = await this.addTwoColumnLayoutToPDF(doc, graphicalData, currentY, margin, pageWidth);

  return doc;
}

static addGraphicalHeaderToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  // Main title - like your screenshot
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, data.clientInfo?.nom || "Gravel Construction", margin, currentY);
  currentY += 6;

  // Subtitle
  doc.setFontSize(14);
  this.safeText(doc, "Données Graphiques", margin, currentY);
  currentY += 8;

  // Product info
  if (data.produitInfo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    this.safeText(doc, `${data.produitInfo.nom} (${data.produitInfo.description})`, margin, currentY);
    currentY += 4;
    
    const familleText = data.produitInfo.famille?.nom || data.produitInfo.famille || "";
    this.safeText(doc, `Famille: ${familleText}`, margin, currentY);
    currentY += 4;
  }

  // Period info
  doc.setFontSize(10);
  const periodStart = data.period?.start || "";
  const periodEnd = data.period?.end || "";
  this.safeText(doc, `Période: ${periodStart} à ${periodEnd}`, margin, currentY);
  currentY += 4;

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  return currentY;
}

static async addTwoColumnLayoutToPDF(doc, data, startY, margin, pageWidth) {
  let currentY = startY;
  
  const columnGap = 10;
  const leftColumnWidth = (pageWidth - 2 * margin - columnGap) * 0.7; // 70% for chart
  const rightColumnWidth = (pageWidth - 2 * margin - columnGap) * 0.3; // 30% for stats
  const leftColumnX = margin;
  const rightColumnX = margin + leftColumnWidth + columnGap;

  // ===== LEFT COLUMN - CHART =====
  const chartEndY = await this.addChartToLeftColumn(doc, data, currentY, leftColumnX, leftColumnWidth);
  
  // ===== RIGHT COLUMN - STATISTICS AND CONTROLS =====
  const statsEndY = this.addStatisticsToRightColumn(doc, data, currentY, rightColumnX, rightColumnWidth);
  
  // Use the maximum Y position from both columns
  currentY = Math.max(chartEndY, statsEndY) + 10;

  return currentY;
}

static async addChartToLeftColumn(doc, data, startY, columnX, columnWidth) {
  let currentY = startY;
  
  // Chart title - show parameter and class like in your screenshot
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  // Build the title like your screenshot: "Résistance courante 28 jrs | Classe 42.5 N"
  let chartTitle = "";
  if (data.selectedParameter && data.selectedClass) {
    const param = data.parameters?.find(p => p.key === data.selectedParameter);
    if (param) {
      chartTitle = `${param.label} | Classe ${data.selectedClass}`;
    }
  }
  
  // If no specific parameter/class, show default title
  if (!chartTitle) {
    chartTitle = "GRAPHIQUE";
  }
  
  this.safeText(doc, chartTitle, columnX, currentY);
  currentY += 8;

  try {
    // Get the chart container element from the DOM
    const chartContainer = document.querySelector('.recharts-wrapper');
    
    if (chartContainer) {
      // Use html2canvas to capture the chart
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(chartContainer, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: chartContainer.offsetWidth,
        height: chartContainer.offsetHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit the column
      const chartHeight = 120; // Fixed height for chart
      
      // Add the chart image to PDF
      doc.addImage(imgData, 'PNG', columnX, currentY, columnWidth, chartHeight);
      currentY += chartHeight + 10;
      
    } else {
      // Fallback: Create a placeholder
      doc.setFillColor(245, 245, 245);
      doc.rect(columnX, currentY, columnWidth, 100, 'F');
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      this.safeText(doc, "Graphique non disponible", columnX + columnWidth/2, currentY + 50, { align: 'center' });
      currentY += 110;
    }
  } catch (error) {
    console.error('Error capturing chart:', error);
    // Fallback placeholder
    doc.setFillColor(245, 245, 245);
    doc.rect(columnX, currentY, columnWidth, 100, 'F');
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    this.safeText(doc, "Erreur lors de la capture du graphique", columnX + columnWidth/2, currentY + 50, { align: 'center' });
    currentY += 110;
  }

  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  return currentY;
}

static addStatisticsToRightColumn(doc, data, startY, columnX, columnWidth) {
  let currentY = startY;
  
  // Statistics title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, "Statistiques", columnX, currentY);
  currentY += 8;

  // ===== CLASSES SECTION - avec boutons radio =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, "Classe", columnX, currentY);
  currentY += 6;

  doc.setFontSize(9);
  
  const classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"];
  
  // Organiser les classes 3 par ligne avec boutons radio
  const classesPerLine = 3;
  const classWidth = columnWidth / classesPerLine;
  const radioSize = 1.5;
  
  for (let i = 0; i < classes.length; i += classesPerLine) {
    const lineClasses = classes.slice(i, i + classesPerLine);
    
    lineClasses.forEach((classe, lineIndex) => {
      const classX = columnX + (lineIndex * classWidth);
      const radioX = classX;
      const radioY = currentY - 1.5;
      
      // Dessiner le bouton radio
      doc.circle(radioX + 1, radioY, radioSize);
      
      // Remplir si sélectionné - COULEUR BLEUE
      if (classe === data.selectedClass) {
        doc.setFillColor(0, 0, 255); // BLEU pour la classe sélectionnée
        doc.circle(radioX + 1, radioY, radioSize - 0.3, 'F');
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      // Label de la classe
      this.safeText(doc, classe, classX + 5, currentY);
    });
    
    currentY += 4;
  }

  currentY += 8;

  // ===== LIMITS SECTION - avec <= et >= =====
  if (data.currentLimits && data.derivedStats) {
    const limits = data.currentLimits;
    const stats = data.derivedStats;

    // Limit Inférieur - BLEU
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 255); // BLEU
    this.safeText(doc, "Limit inferieur", columnX, currentY);
    currentY += 4;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 255); // BLEU
    
    const liValue = this.formatLimitValue(limits.li);
    const belowLI = this.formatStatValue(stats.belowLI);
    const percentLI = this.formatPercentValue(stats.percentLI);
    
    // Utiliser <= au lieu de ≤
    const liText = `N <= ${liValue} : ${belowLI} (${percentLI})`;
    this.safeText(doc, liText, columnX, currentY);
    currentY += 6;

    // Limit Supérieur - VERT
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0); // VERT
    this.safeText(doc, "Limit superieur", columnX, currentY);
    currentY += 4;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 128, 0); // VERT
    
    const lsValue = this.formatLimitValue(limits.ls);
    const aboveLS = this.formatStatValue(stats.aboveLS);
    const percentLS = this.formatPercentValue(stats.percentLS);
    
    // Utiliser >= au lieu de ≥
    const lsText = `N >= ${lsValue} : ${aboveLS} (${percentLS})`;
    this.safeText(doc, lsText, columnX, currentY);
    currentY += 6;

    // Limit Garantie - ROUGE
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0); // ROUGE
    this.safeText(doc, "Limit garantie", columnX, currentY);
    currentY += 4;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 0, 0); // ROUGE
    
    const lgValue = this.formatLimitValue(limits.lg);
    const belowLG = this.formatStatValue(stats.belowLG);
    const percentLG = this.formatPercentValue(stats.percentLG);
    
    // Utiliser <= au lieu de ≤
    const lgText = `N <= ${lgValue} : ${belowLG} (${percentLG})`;
    this.safeText(doc, lgText, columnX, currentY);
    currentY += 8;
    
    // Réinitialiser la couleur du texte
    doc.setTextColor(0, 0, 0);
  }

  // ===== MOYENNE =====
  if (data.derivedStats) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, "Moyenne", columnX, currentY);
    currentY += 4;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const meanValue = this.formatStatValue(data.derivedStats.mean);
    this.safeText(doc, meanValue, columnX, currentY);
    currentY += 8;
  }

  // ===== TYPE DE GRAPHIQUE - avec boutons radio =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  this.safeText(doc, "Type de graphique", columnX, currentY);
  currentY += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Définir les types de graphiques
  const chartTypes = [
    { value: 'scatter', label: 'Scatter' },
    { value: 'gaussian', label: 'Gausse' }
  ];
  
  chartTypes.forEach((chartType, index) => {
    const typeY = currentY + (index * 5);
    
    // Dessiner le bouton radio
    const radioX = columnX;
    const radioY = typeY - 2;
    const radioSize = 1.5;
    
    // Cercle du bouton radio
    doc.circle(radioX + 1, radioY, radioSize);
    
    // Remplir si sélectionné
    if (data.chartType === chartType.value) {
      doc.setFillColor(0, 0, 0);
      doc.circle(radioX + 1, radioY, radioSize - 0.3, 'F');
    }
    
    // Label du type de graphique
    this.safeText(doc, chartType.label, radioX + 5, typeY);
  });
  
  currentY += 15;

  return currentY + 8;
}

// Helper methods pour formater correctement les valeurs
static formatLimitValue(value) {
  if (value === null || value === undefined || value === "-") return "-";
  return String(value);
}

static formatStatValue(value) {
  if (value === null || value === undefined || value === "-") return "-";
  return String(value);
}

static formatPercentValue(value) {
  if (value === null || value === undefined || value === "-") return "-";
  // S'assurer que c'est un nombre avant de formater
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "-";
  return `${numValue.toFixed(1)}%`;
}

// Helper method for safe text rendering
static safeText(doc, text, x, y, options = {}) {
  const maxWidth = options.maxWidth || (doc.internal.pageSize.width - x - 10);
  const align = options.align || 'left';
  
  if (typeof text === 'string' || typeof text === 'number') {
    const textStr = String(text);
    
    // Utiliser directement doc.text avec l'encodage correct
    try {
      doc.text(textStr, x, y, { align, maxWidth });
    } catch (error) {
      console.warn('Text rendering error:', error);
      // Fallback simple
      if (textStr.length > 20) {
        doc.text(textStr.substring(0, 20) + '...', x, y, { align });
      } else {
        doc.text(textStr, x, y, { align });
      }
    }
  }
}

// Add this method to your existing PDFExportService class
static exportToPDF(options) {
  try {
    const {
      title = "Échantillons",
      headers = [],
      data = [],
      fileName = "export.pdf",
      clientInfo = "",
      periode = "",
      produitInfo = ""
    } = options;

    // Create new PDF document
    const doc = new jsPDF();

    // Set initial position
    let currentY = 15;

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, currentY);
    currentY += 10;

    // Add client information
    if (clientInfo) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Client: ${clientInfo}`, 14, currentY);
      currentY += 6;
    }

    // Add period information
    if (periode) {
      doc.text(`Période: ${periode}`, 14, currentY);
      currentY += 6;
    }

    // Add product information
    if (produitInfo) {
      doc.text(`Produit: ${produitInfo}`, 14, currentY);
      currentY += 6;
    }

    currentY += 5; // Add some space before the table

    // Create the table
    doc.autoTable({
      startY: currentY,
      head: [headers],
      body: data,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: currentY }
    });

    // Save the PDF
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error in PDFExportService.exportToPDF:", error);
    throw error;
  }
}

}

export default PDFExportService;