// frontend/src/components/ControleConformite/WordExportService.js
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel, TextRun, AlignmentType, PageBreak } from 'docx';

class WordExportService {

  // ============================================================
  // DONNEES STATISTIQUES EXPORT
  // ============================================================

  static async generateStatsReport(data) {
    const sections = [];

    // ===== HEADER SECTION =====
    sections.push(...this.addStatsHeaderToWord(data));
    
    // ===== GLOBAL STATS TABLE =====
    if (data.globalStats && data.parameters) {
      sections.push(this.createGlobalStatsTable(data));
    }
    
    // ===== CLASS LIMITS SECTION =====
    if (data.classes && data.classes.length > 0 && data.parameters && data.getLimitsByClass && data.evaluateLimits) {
      sections.push(...this.addClassLimitsToWord(data));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    return doc;
  }

  static addStatsHeaderToWord(data) {
    const paragraphs = [];

    // Main title - Client name
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: data.clientInfo?.nom || "Aucun client", bold: true, size: 32 })],
        spacing: { after: 100 }
      })
    );

    // Product info
    if (data.produitInfo) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `${data.produitInfo.nom} (${data.produitInfo.description})`, size: 24 })],
          spacing: { after: 100 }
        })
      );
    }

    // Period
    const periodStart = data.period?.start || "";
    const periodEnd = data.period?.end || "";
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `Période: ${periodStart} à ${periodEnd}`, size: 24 })],
        spacing: { after: 200 }
      })
    );

    // "Données Statistiques" title
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Données Statistiques", bold: true, size: 28 })],
        spacing: { after: 100 }
      })
    );

    return paragraphs;
  }

  static createGlobalStatsTable(data) {
    const tableRows = [];

    // Header row
    const headerCells = [
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: "Statistique", bold: true })],
          alignment: AlignmentType.CENTER 
        })],
        shading: { fill: "DFEBF7" }, // Light blue background
        width: { size: 20, type: WidthType.PERCENTAGE } // Wider first column
      }),
      ...data.parameters.map(param => 
        new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ text: param.label, bold: true })],
            alignment: AlignmentType.CENTER 
          })],
          shading: { fill: "DFEBF7" }, // Light blue background
          width: { size: 80 / data.parameters.length, type: WidthType.PERCENTAGE } // Distribute remaining width
        })
      )
    ];
    tableRows.push(new TableRow({ children: headerCells }));

    // Data rows with alternating colors
    const statRows = [
      { key: "count", label: "Nombre", bgColor: "FFFFFF" },
      { key: "min", label: "Min", bgColor: "F2F2F2" },
      { key: "max", label: "Max", bgColor: "FFFFFF" },
      { key: "mean", label: "Moyenne", bgColor: "F2F2F2" },
      { key: "std", label: "Écart type", bgColor: "FFFFFF" },
    ];

    statRows.forEach(statRow => {
      const rowCells = [
        new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ text: statRow.label, bold: true })],
            alignment: AlignmentType.CENTER 
          })],
          shading: { fill: statRow.bgColor },
          width: { size: 20, type: WidthType.PERCENTAGE }
        }),
        ...data.parameters.map(param => {
          const value = data.globalStats[param.key]?.[statRow.key] || "-";
          let displayValue = "-";
          
          if (value !== undefined && value !== null && value !== "-") {
            if (typeof value === 'number') {
              // Format numbers with comma as decimal separator
              displayValue = value.toFixed(3).replace('.', ',');
            } else {
              displayValue = String(value);
            }
          }
          
          return new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: displayValue })],
              alignment: AlignmentType.CENTER 
            })],
            shading: { fill: statRow.bgColor },
            width: { size: 80 / data.parameters.length, type: WidthType.PERCENTAGE }
          });
        })
      ];
      tableRows.push(new TableRow({ children: rowCells }));
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [20, ...data.parameters.map(() => 80 / data.parameters.length)], // Explicit column widths
      rows: tableRows,
      layout: WidthType.PERCENTAGE
    });
  }

  static addClassLimitsToWord(data) {
    const paragraphs = [];

    data.classes.forEach((classe, classIndex) => {
      // Class header with orange background
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `CLASSE ${classe}`, bold: true, size: 24 })],
          shading: { fill: "FFCC99" }, // Orange background
          spacing: { after: 100 }
        })
      );

      // Create class limits table
      const tableRows = [];

      // Calculate column widths
      const firstColWidth = 25; // Wider first column for parameter descriptions
      const paramColWidth = (75 / data.parameters.length); // Distribute remaining width

      // Table headers
      const headerCells = [
        new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ text: "Paramètre", bold: true })],
            alignment: AlignmentType.CENTER 
          })],
          shading: { fill: "DFEBF7" }, // Light blue background
          width: { size: firstColWidth, type: WidthType.PERCENTAGE }
        }),
        ...data.parameters.map(param => 
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: param.label, bold: true })],
              alignment: AlignmentType.CENTER 
            })],
            shading: { fill: "DFEBF7" }, // Light blue background
            width: { size: paramColWidth, type: WidthType.PERCENTAGE }
          })
        )
      ];
      tableRows.push(new TableRow({ children: headerCells }));

      // Define all the limit rows with alternating colors
      const limitRows = [
        { 
          label: "Limite inférieure (LI)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            return limits?.li || "-";
          },
          bgColor: "F2F2F2"
        },
        { 
          label: "N < LI(RC+DP)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            const evaluation = data.evaluateLimits(data.dataToUse, param.key, limits?.li, limits?.ls, limits?.lg);
            return evaluation.belowLI;
          },
          bgColor: "FFFFFF"
        },
        { 
          label: "% < LI(RC+DP)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            const evaluation = data.evaluateLimits(data.dataToUse, param.key, limits?.li, limits?.ls, limits?.lg);
            const value = evaluation.percentLI;
            return typeof value === 'number' ? value.toFixed(2).replace('.', ',') + '%' : value;
          },
          bgColor: "F2F2F2"
        },
        { 
          label: "Limite supérieure (LS)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            return limits?.ls || "-";
          },
          bgColor: "FFFFFF"
        },
        { 
          label: "N < LS(RC+DP)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            const evaluation = data.evaluateLimits(data.dataToUse, param.key, limits?.li, limits?.ls, limits?.lg);
            return evaluation.aboveLS;
          },
          bgColor: "F2F2F2"
        },
        { 
          label: "% < LS(RC+DP)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            const evaluation = data.evaluateLimits(data.dataToUse, param.key, limits?.li, limits?.ls, limits?.lg);
            const value = evaluation.percentLS;
            return typeof value === 'number' ? value.toFixed(2).replace('.', ',') + '%' : value;
          },
          bgColor: "FFFFFF"
        },
        { 
          label: "Limite garantie (LG)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            return limits?.lg || "-";
          },
          bgColor: "F2F2F2"
        },
        { 
          label: "N < LG(RC+DP)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            const evaluation = data.evaluateLimits(data.dataToUse, param.key, limits?.li, limits?.ls, limits?.lg);
            return evaluation.belowLG;
          },
          bgColor: "FFFFFF"
        },
        { 
          label: "% < LG(RC+DP)", 
          getValue: (param) => {
            const limits = data.getLimitsByClass(classe, param.key);
            const evaluation = data.evaluateLimits(data.dataToUse, param.key, limits?.li, limits?.ls, limits?.lg);
            const value = evaluation.percentLG;
            return typeof value === 'number' ? value.toFixed(2).replace('.', ',') + '%' : value;
          },
          bgColor: "F2F2F2"
        }
      ];

      // Add each limit row to the table
      limitRows.forEach(limitRow => {
        const rowCells = [
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: limitRow.label })],
              alignment: AlignmentType.CENTER 
            })],
            shading: { fill: limitRow.bgColor },
            width: { size: firstColWidth, type: WidthType.PERCENTAGE }
          }),
          ...data.parameters.map(param => {
            const value = limitRow.getValue(param);
            
            return new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: String(value) })],
                alignment: AlignmentType.CENTER 
              })],
              shading: { fill: limitRow.bgColor },
              width: { size: paramColWidth, type: WidthType.PERCENTAGE }
            });
          })
        ];
        tableRows.push(new TableRow({ children: rowCells }));
      });

      // Add the table to the document
      paragraphs.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [firstColWidth, ...data.parameters.map(() => paramColWidth)],
          rows: tableRows,
          layout: WidthType.PERCENTAGE,
          // Prevent table from breaking across pages
          preventOverflow: true
        })
      );

      // Only add minimal spacing between classes
      if (classIndex < data.classes.length - 1) {
        paragraphs.push(new Paragraph({ spacing: { after: 50 } }));
      }
    });

    return paragraphs;
  }

  // ============================================================
  // TABLE CONFORMITE EXPORT
  // ============================================================
// ============================================================
// TABLE CONFORMITE EXPORT
// ============================================================

static async generateTableReport(tableData, options = {}) {
  const sections = [];

  // ===== HEADER SECTION =====
  sections.push(...this.addTableHeaderToWord(options));
  
  // ===== TABLE SECTION =====
  if (tableData && tableData.headers && tableData.rows) {
    sections.push(this.createConformityTable(tableData));
  }

  // ===== LEGEND SECTION =====
  sections.push(...this.addTableLegend());

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  return doc;
}

static addTableHeaderToWord(options) {
  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: options.clientInfo?.nom || "Aucun client", bold: true, size: 32 })],
      spacing: { after: 100 }
    })
  );

  // Product info
  if (options.produitInfo) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${options.produitInfo.nom} (${options.produitInfo.description})`, size: 24 })],
        spacing: { after: 100 }
      })
    );
  }

  // Period
  const periodStart = options.periodStart || "";
  const periodEnd = options.periodEnd || "";
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: `Période: ${periodStart} à ${periodEnd}`, size: 24 })],
      spacing: { after: 200 }
    })
  );

  // "Tableau de Conformité" title
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "Tableau de Conformité", bold: true, size: 28 })],
      spacing: { after: 200 }
    })
  );

  return paragraphs;
}

static createConformityTable(tableData) {
  const tableRows = [];

  // Calculate column widths - much wider first column for "Classe" and adequate width for others
  const numCols = tableData.headers.length;
  const firstColWidth = 35; // 35% for first column (Classe)
  const otherColsWidth = (65 / (numCols - 1)); // Remaining 65% distributed among other columns

  // Header row
  const headerCells = tableData.headers.map((header, index) => 
    new TableCell({
      children: [new Paragraph({ 
        children: [new TextRun({ text: header, bold: true })],
        alignment: AlignmentType.CENTER
      })],
      shading: { fill: "DFEBF7" }, // Light blue background
      width: { 
        size: index === 0 ? firstColWidth : otherColsWidth, 
        type: WidthType.PERCENTAGE 
      }
    })
  );
  tableRows.push(new TableRow({ children: headerCells }));

  // Data rows with colors based on type and content
  // Filter out the "Contrôle Statistique" separator rows
  const filteredRows = tableData.rows.filter(row => {
    // Remove rows that are empty separators between "Contrôle Statistique" and classe rows
    const isSeparatorRow = row.type === 'separator' || 
                          (row.data.length > 0 && row.data.every(cell => 
                            cell === '' || cell === null || cell === undefined));
    return !isSeparatorRow;
  });

  filteredRows.forEach(row => {
    const rowCells = row.data.map((cell, cellIndex) => {
      let cellColor = "000000"; // Default black
      
      // Color logic based on cell content and row type
      if (typeof cell === 'string') {
        if (cell === 'OK' || cell === 'Satisfait' || cell === 'Conforme') {
          cellColor = "008000"; // Green
        } else if (cell === 'Non Satisfait' || cell === 'Non Conforme') {
          cellColor = "FF0000"; // Red
        } else if (cell.includes('%') && parseFloat(cell) > 5) {
          if (row.type === 'deviation') {
            cellColor = "FFA500"; // Orange/Yellow for deviation > 5%
          } else if (row.type === 'default') {
            cellColor = "FF0000"; // Red for default > 5%
          }
        } else if (cell === 'ND' || cell === '--') {
          cellColor = "808080"; // Gray
        }
      }

      // Set background color based on row type
      let bgColor = "FFFFFF"; // Default white
      if (row.type === 'class-header') {
        bgColor = "F5F5F5"; // Light gray for class headers
      }

      return new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: String(cell), color: cellColor, bold: row.type === 'class-header' })],
          alignment: AlignmentType.CENTER
        })],
        shading: { fill: bgColor },
        width: { 
          size: cellIndex === 0 ? firstColWidth : otherColsWidth, 
          type: WidthType.PERCENTAGE 
        }
      });
    });
    
    tableRows.push(new TableRow({ children: rowCells }));
  });

  // Create column widths array
  const columnWidths = tableData.headers.map((header, index) => 
    index === 0 ? firstColWidth : otherColsWidth
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: columnWidths,
    rows: tableRows,
    layout: WidthType.PERCENTAGE,
    // Allow table to break across pages to prevent word division
    preventOverflow: false
  });
}

static addTableLegend() {
  const paragraphs = [];

  // Create all legend items in one line
  const legendItems = [
    { text: "% Déviation/Défaut ≤ 5%", color: "008000" },
    { text: "% Déviation > 5%", color: "FFA500" },
    { text: "% Défaut > 5%", color: "FF0000" },
    { text: "-- Non définie ND/NS Données insuffisantes", color: "808080" }
  ];

  // Create one paragraph with all legend items
  const legendTextRuns = [];
  
  legendItems.forEach((item, index) => {
    // Add bullet point
    legendTextRuns.push(new TextRun({ text: "• ", color: item.color, bold: true }));
    // Add text
    legendTextRuns.push(new TextRun({ text: item.text, size: 18 }));
    // Add separator (except for last item)
    if (index < legendItems.length - 1) {
      legendTextRuns.push(new TextRun({ text: " | ", size: 18 }));
    }
  });

  paragraphs.push(
    new Paragraph({
      children: legendTextRuns,
      spacing: { after: 100 }
    })
  );

  return paragraphs;
}




















  // ============================================================
  // MAIN EXPORT FUNCTION
  // ============================================================

  static async exportToWord(doc, fileName = "export.docx") {
    try {
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw error;
    }
  }
}

export default WordExportService;