// frontend/src/components/ControleConformite/WordExportService.js
import { Document, Packer, BorderStyle  , Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel, TextRun, AlignmentType, PageBreak, ImageRun , TabStopType } from 'docx';

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
    
    // Number of samples
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `Nombre d'échantillons: ${data.dataToUse?.length || 0}`, size: 24 })],
        spacing: { after: 200 }
      })
    );

    // Separator line
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "―".repeat(100) })], // Longer separator
        spacing: { after: 200 }
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
    // Filter out separator rows between "Contrôle Statistique" and classe rows
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
// DONNEES GRAPHIQUES EXPORT - VERSION CORRIGÉE
// ============================================================

// ============================================================
// DONNEES GRAPHIQUES EXPORT - VERSION COMPLÈTE CORRIGÉE
// ============================================================

static async generateGraphicalReport(graphicalData = {}) {
  const {
    chartImage = null,
    selectedClass = "42.5 N",
    classes = ["32.5 L", "32.5 N", "32.5 R", "42.5 L", "42.5 N", "42.5 R", "52.5 L", "52.5 N", "52.5 R"],
    derivedStats = {},
    chartType = "scatter",
    selectedParameter = "rc28j",
    parameterMapping = {},
    formattedLimits = {},
    clientInfo = {},
    produitInfo = {},
    period = {}
  } = graphicalData;

  // ✅ CORRECTION: Déplacer la fonction getClientName AVANT son utilisation
  const getClientName = () => {
    // Si clientInfo est un string
    if (typeof clientInfo === 'string') {
      return clientInfo;
    }
    // Si clientInfo est un objet avec propriété 'nom'
    if (clientInfo && typeof clientInfo === 'object' && clientInfo.nom) {
      return clientInfo.nom;
    }
    // Si clientInfo est un objet avec propriété 'nom_raison_sociale'
    if (clientInfo && typeof clientInfo === 'object' && clientInfo.nom_raison_sociale) {
      return clientInfo.nom_raison_sociale;
    }
    // Fallback
    return "Client non spécifié";
  };

  const clientName = getClientName(); // ✅ Maintenant initialisée AVANT utilisation

  // ✅ FONCTION POUR OBTENIR LA DESCRIPTION DU PARAMÈTRE
  const getParameterDescription = (paramKey) => {
    // Mapping des clés vers les descriptions
    const defaultParameterDescriptions = {
      "rc2j": "Résistance courante 2 jrs",
      "rc7j": "Résistance courante 7 jrs", 
      "rc28j": "Résistance courante 28 jrs",
      "prise": "Temp debut de prise",
      "stabilite": "Stabilité",
      "so3": "Teneur en sulfate",
      "chlorure": "Chlorure",
      "hydratation": "Chaleur d'Hydratation",
      "pfeu": "Perte au Feu",
      "r_insoluble": "Résidu Insoluble",
      "c3a": "C3A",
      "pouzzolanicite": "Pouzzolanicité",
      "ajt": "Ajout"
    };

    // Utiliser le mapping fourni ou le mapping par défaut
    const mapping = parameterMapping || defaultParameterDescriptions;
    
    // Si c'est déjà une description, la retourner telle quelle
    if (Object.values(mapping).includes(paramKey)) {
      return paramKey;
    }
    
    // Sinon, chercher la description correspondante à la clé
    return mapping[paramKey] || paramKey; // Fallback à la clé si non trouvé
  };

  // ✅ OBTENIR LA DESCRIPTION DU PARAMÈTRE SÉLECTIONNÉ
  const parameterDescription = getParameterDescription(selectedParameter);

  // --- Header principal ---
  const mainHeader = new Paragraph({
    children: [
      new TextRun({
        text: clientName, // ✅ MAINTENANT clientName est correctement initialisé
        bold: true,
        size: 28,
      }),
    ],
    spacing: { after: 100 }
  });

  // --- Informations produit ---
  const productParagraphs = [];
  if (produitInfo) {
    productParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${produitInfo.nom || ''} (${produitInfo.description || ''})`,
            size: 24,
          }),
        ],
        spacing: { after: 50 }
      })
    );
  }

  // --- Période ---
  const periodStart = period?.start || "";
  const periodEnd = period?.end || "";
  const periodParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Période: ${periodStart} à ${periodEnd}`,
        size: 24,
      }),
    ],
    spacing: { after: 200 }
  });

  // --- Header du graphique ---
  const chartHeader = new Paragraph({
    children: [
      new TextRun({
        text: `${parameterDescription} / ${selectedClass}`,
        bold: true,
        size: 32,
      }),
    ],
    spacing: { after: 400 },
    alignment: AlignmentType.CENTER,
  });

  // --- Graph image ---
  const graphParagraphs = [];
  if (chartImage) {
    try {
      const imageBytes = this.dataURLToUint8Array(chartImage);
      if (imageBytes) {
        graphParagraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: { width: 600, height: 400 },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors du traitement de l'image:", error);
      graphParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "❌ Impossible de charger l'image du graphique",
              color: "FF0000",
              italics: true
            })
          ],
          alignment: AlignmentType.CENTER
        })
      );
    }
  } else {
    graphParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "⚠️ Aucun graphique disponible",
            color: "FFA500",
            italics: true
          })
        ],
        alignment: AlignmentType.CENTER
      })
    );
  }

  // --- Titre Statistiques ---
  const statsTitle = new Paragraph({
    children: [
      new TextRun({
        text: "Statistiques",
        bold: true,
        size: 28,
        underline: {},
      }),
    ],
    spacing: { before: 400, after: 200 },
  });

  // --- Section Classe ---
  const classParagraph = new Paragraph({
    children: [
      new TextRun({ text: "Classe : ", bold: true }),
      ...classes.map((cls, i) => {
        const isSelected = cls === selectedClass;
        return new TextRun({
          text: (i > 0 ? " | " : "") + cls,
          color: isSelected ? "0070C0" : "000000",
          bold: isSelected,
        });
      }),
    ],
    spacing: { after: 100 }
  });

  // ✅ CORRECTION: Utiliser formattedLimits pour l'affichage exact
  const limitsParagraphs = [];

  // Moyenne
  if (formattedLimits.moy) {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Moyenne", bold: true, color: "242424" })],
      }),
      new Paragraph({
        children: [new TextRun({ text: formattedLimits.moy })],
        spacing: { after: 50 }
      })
    );
  }

  // Limite inférieure
  if (formattedLimits.inf && formattedLimits.inf !== "Limite inférieure non définie") {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Limite inférieure", bold: true, color: "0070C0" })],
      }),
      new Paragraph({
        children: [new TextRun({ text: formattedLimits.inf })],
        spacing: { after: 50 }
      })
    );
  } else {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Limite inférieure : Non définie", color: "666666", italics: true })],
        spacing: { after: 50 }
      })
    );
  }

  // Limite supérieure
  if (formattedLimits.sup && formattedLimits.sup !== "Limite supérieure non définie") {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Limite supérieure", bold: true, color: "00B050" })],
      }),
      new Paragraph({
        children: [new TextRun({ text: formattedLimits.sup })],
        spacing: { after: 50 }
      })
    );
  } else {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Limite supérieure : Non définie", color: "666666", italics: true })],
        spacing: { after: 50 }
      })
    );
  }

  // Limite garantie
  if (formattedLimits.gar && formattedLimits.gar !== "Limite garantie non définie") {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Limite garantie", bold: true, color: "FF0000" })],
      }),
      new Paragraph({
        children: [new TextRun({ text: formattedLimits.gar })],
        spacing: { after: 50 }
      })
    );
  } else {
    limitsParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Limite garantie : Non définie", color: "666666", italics: true })],
        spacing: { after: 50 }
      })
    );
  }

  // --- Section Type de graphique ---
  const graphTypeParagraph = new Paragraph({
    children: [
      new TextRun({ text: "Type de graphique : ", bold: true }),
      new TextRun({
        text: "Scatter",
        color: chartType === "scatter" ? "0070C0" : "000000",
        bold: chartType === "scatter",
      }),
      new TextRun({ text: " / " }),
      new TextRun({
        text: "Gausse",
        color: chartType === "gausse" ? "0070C0" : "000000",
        bold: chartType === "gausse",
      }),
    ],
    spacing: { before: 100, after: 200 }
  });

  // --- Informations supplémentaires ---
  const additionalInfo = new Paragraph({
    children: [
      new TextRun({ 
        text: `Paramètre analysé: ${parameterDescription}`,
        size: 20,
        color: "444444"
      })
    ],
    spacing: { before: 100, after: 50 }
  });

  const classInfo = new Paragraph({
    children: [
      new TextRun({ 
        text: `Classe sélectionnée: ${selectedClass}`,
        size: 20,
        color: "444444"
      })
    ],
    spacing: { after: 100 }
  });

  // --- Footer avec date de génération ---
  const footer = new Paragraph({
    children: [
      new TextRun({
        text: `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        size: 16,
        color: "888888",
        italics: true
      })
    ],
    spacing: { before: 200 },
    alignment: AlignmentType.RIGHT
  });

  // --- Assemblage du document ---
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // En-tête
          mainHeader,
          ...productParagraphs,
          periodParagraph,
          
          // Graphique
          chartHeader,
          ...graphParagraphs,
          
          // Statistiques
          statsTitle,
          classParagraph,
          ...limitsParagraphs,
          graphTypeParagraph,
          
          // Informations supplémentaires
          additionalInfo,
          classInfo,
          
          // Footer
          footer
        ],
      },
    ],
  });

  console.log("✅ Document graphique généré avec succès");
  console.log("📊 Données utilisées:", {
    parameter: parameterDescription,
    classe: selectedClass,
    limites: formattedLimits,
    typeGraphique: chartType
  });

  return doc;
}
// Helper: Convert dataURL → Uint8Array

static dataURLToUint8Array(dataURL) {
  if (!dataURL) return null;
  
  try {
    const matches = dataURL.match(/^data:(.+);base64,(.*)$/);
    if (!matches) {
      console.error("❌ Format dataURL invalide");
      return null;
    }
    
    const b64 = matches[2];
    const binaryString = atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log(`✅ Image convertie: ${bytes.length} bytes`);
    return bytes;
  } catch (error) {
    console.error("❌ Erreur conversion dataURL:", error);
    return null;
  }
}





// ============================================================
// RAPPORT CONFORMITE EXPORT - TABLES POUR TOUTES LES SECTIONS
// ============================================================
// ============================================================
// RAPPORT CONFORMITE EXPORT - FONCTION MANQUANTE
// ============================================================

static async generateClassReport(selectedClasses, getClassData, helpers, options = {}) {
  try {
    console.log("🔄 Début de génération du rapport Word...");
    
    const sections = [];

    // ===== HEADER SECTION =====
    sections.push(...this.addConformityHeaderToWord(options));

    // ===== CLASS SECTIONS =====
    selectedClasses.forEach((classe, index) => {
      const classData = getClassData(classe);
      sections.push(...this.addClassSectionToWord(classe, classData, helpers, options));
      
      // Add page break between classes except for the last one
      if (index < selectedClasses.length - 1) {
        sections.push(new PageBreak());
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    console.log("✅ Rapport Word généré avec succès");
    return doc;
    
  } catch (error) {
    console.error("❌ Erreur dans generateClassReport:", error);
    throw error;
  }
}

static addConformityHeaderToWord(options) {
  const paragraphs = [];

  // Client name
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: options.clientInfo?.nom || "Aucun client", 
          bold: true
        })
      ],
      spacing: { after: 100 }
    })
  );

  // Main title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: "Contrôle de conformité / classe de résistance", 
          bold: true,
          size: 32
        })
      ],
      spacing: { after: 200 }
    })
  );

  // Product info
  if (options.produitInfo) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: `${options.produitInfo.nom} ( ${options.produitInfo.description} )`, 
            bold: true
          })
        ],
        spacing: { after: 100 }
      })
    );
  }

  // Period
  const periodStart = options.period?.start || "";
  const periodEnd = options.period?.end || "";
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: `Période: ${periodStart} à ${periodEnd}`
        })
      ],
      spacing: { after: 200 }
    })
  );

  return paragraphs;
}

static addClassSectionToWord(classe, classData, helpers, options) {
  const paragraphs = [];

  // Class header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: `CLASSE ${classe}`, 
          bold: true, 
          size: 28 
        })
      ],
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER
    })
  );

  // Deviations sections
  paragraphs.push(...this.addDeviationsToWord(classe, classData, helpers, options));
  
  // Mesures section
  paragraphs.push(...this.addMesuresToWord(classData, helpers));
  
  // Attributs section  
  paragraphs.push(...this.addAttributsToWord(classData, helpers));
  
  // Conclusion
  paragraphs.push(...this.addConclusionToWord(classData, options, helpers));

  return paragraphs;
}



static addDeviationsToWord(classe, classData, helpers, options) {
  const paragraphs = [];

  const deviationTypes = ['li', 'ls', 'lg'];
  const sectionTitles = {
    li: "Déviations Limites inférieures",
    ls: "Déviations Limites supérieures", 
    lg: "Défauts Limites garanties"
  };

  deviationTypes.forEach(type => {
    const deviationParams = helpers.getDeviationParameters(classe)[type];
    const hasDataForSection = deviationParams.some(param => classData.hasDataForParameter(param)) || 
                            (options.showAjout && type !== 'lg' && classData.hasDataForParameter("ajout_percent"));

    if (hasDataForSection) {
      // Titre de section
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ 
              text: sectionTitles[type], 
              bold: true,
              size: 24
            })
          ],
          spacing: { after: 50 }
        })
      );

      // ✅ TABLE POUR DÉVIATIONS
      const tableRows = [];

      // Collecter tous les paramètres
      const allItems = [];
      
      deviationParams.forEach(paramKey => {
        if (!classData.hasDataForParameter(paramKey)) return;

        const compliance = classData.classCompliance[paramKey];
        if (!compliance) return;

        const { stats, limits } = compliance;
        if (!stats || stats.count === 0) return;

        const percentValue = type === 'li' ? stats.percentLI : 
                           type === 'ls' ? stats.percentLS : 
                           stats.percentLG;
        
        const limitValue = type === 'li' ? limits.li : 
                         type === 'ls' ? limits.ls : 
                         limits.lg;

        const hasLimit = limitValue !== "-" && limitValue !== null && limitValue !== undefined;
        
        let displayText = "0.00% < -";
        let deviationText = `${type === 'lg' ? 'Défaut' : 'Déviation'}=0.00%`;
        
        if (hasLimit) {
          const hasDeviation = percentValue !== "-" && parseFloat(percentValue) > 0;
          
          if (hasDeviation) {
            if (type === 'li') {
              displayText = `${percentValue}% < ${limitValue}`;
            } else if (type === 'ls') {
              displayText = `${percentValue}% > ${limitValue}`;
            } else if (type === 'lg') {
              if (['rc2j', 'rc7j', 'rc28j', 'prise'].includes(paramKey)) {
                displayText = `${percentValue}% < ${limitValue}`;
              } else {
                displayText = `${percentValue}% > ${limitValue}`;
              }
            }
            deviationText = `${type === 'lg' ? 'Défaut' : 'Déviation'}=${percentValue}%`;
          } else {
            if (type === 'li') {
              displayText = `0.00% < ${limitValue}`;
            } else if (type === 'ls') {
              displayText = `0.00% > ${limitValue}`;
            } else if (type === 'lg') {
              if (['rc2j', 'rc7j', 'rc28j', 'prise'].includes(paramKey)) {
                displayText = `0.00% < ${limitValue}`;
              } else {
                displayText = `0.00% > ${limitValue}`;
              }
            }
            deviationText = `${type === 'lg' ? 'Défaut' : 'Déviation'}=0.00%`;
          }
        }

        const param = classData.allParameters.find(p => p.key === paramKey) || 
                     classData.deviationOnlyParams.find(p => p.key === paramKey);

        if (param) {
          allItems.push({
            label: param.label,
            displayText: displayText,
            deviationText: deviationText
          });
        }
      });

      // ✅ Ajout spécial pour Ajout
      if (options.showAjout && type !== 'lg' && classData.hasDataForParameter("ajout_percent")) {
        const ajoutCompliance = classData.classCompliance["ajout_percent"];
        if (ajoutCompliance && ajoutCompliance.stats.count > 0) {
          const displayText = type === 'li' ? 
            (ajoutCompliance.stats.percentLI !== "-" && ajoutCompliance.limits.li !== "-" ? 
              `${ajoutCompliance.stats.percentLI}% < ${ajoutCompliance.limits.li}` : "0.00% < -") :
            (ajoutCompliance.stats.percentLS !== "-" && ajoutCompliance.limits.ls !== "-" ? 
              `${ajoutCompliance.stats.percentLS}% > ${ajoutCompliance.limits.ls}` : "0.00% > -");

          const deviationText = `${type === 'lg' ? 'Défaut' : 'Déviation'}=${
            type === 'li' ? (ajoutCompliance.stats.percentLI !== "-" ? ajoutCompliance.stats.percentLI : "0.00") :
            (ajoutCompliance.stats.percentLS !== "-" ? ajoutCompliance.stats.percentLS : "0.00")
          }%`;

          allItems.push({
            label: "Ajout",
            displayText: displayText,
            deviationText: deviationText
          });
        }
      }

      // ✅ CRÉER LA TABLE POUR DÉVIATIONS
      allItems.forEach(item => {
        tableRows.push(
          new TableRow({
            children: [
              // Colonne 1: Label
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: item.label, bold: true })] 
                })],
                width: { size: 5000, type: WidthType.DXA }
              }),
              // Colonne 2: Display Text
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: item.displayText, size: 20 })] 
                })],
                width: { size: 4000, type: WidthType.DXA }
              }),
              // Colonne 3: Deviation Text
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: item.deviationText, size: 20 })] 
                })],
                width: { size: 4000, type: WidthType.DXA }
              })
            ]
          })
        );
      });

      // Ajouter la table au document
      paragraphs.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
          },
          rows: tableRows
        })
      );

      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
    }
  });

  return paragraphs;
}

static addMesuresToWord(classData, helpers) {
  const paragraphs = [];

  if (classData.mesureParamsWithData && classData.mesureParamsWithData.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: "Contrôle par Mesures des résistances mécaniques", 
            bold: true,
            size: 24
          })
        ],
        spacing: { after: 50 }
      })
    );

    // ✅ TABLE POUR MESURES
    const tableRows = [];

    // Fonction pour déterminer le type de limites
    const getParameterLimitType = (paramKey) => {
      const lsOnlyParams = ["so3", "chlorure", "stabilite", "pfeu", "r_insoluble", "c3a", "pouzzolanicite", "hydratation"];
      const liOnlyParams = ["prise"];
      const liAndLsParams = ["rc2j", "rc7j", "rc28j"];

      if (lsOnlyParams.includes(paramKey)) return "LS_ONLY";
      if (liOnlyParams.includes(paramKey)) return "LI_ONLY";
      if (liAndLsParams.includes(paramKey)) return "LI_AND_LS";
      return "LS_ONLY";
    };

    classData.mesureParamsWithData.forEach(param => {
      const liCompliance = classData.statisticalCompliance[`${param.key}_li`];
      const lsCompliance = classData.statisticalCompliance[`${param.key}_ls`];
      const limitType = getParameterLimitType(param.key);

      // ✅ AFFICHAGE DIFFÉRENCIÉ selon le type de limites
      if (limitType === "LS_ONLY") {
        // Paramètres avec seulement LS (Chlorure, SO3, etc.)
        if (lsCompliance) {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: `${param.label} LS`, bold: true })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: lsCompliance.displayEquation || lsCompliance.equation, size: 20 })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: lsCompliance.noLimit ? "Pas de limite définie" :
                           lsCompliance.equation.includes("insuffisantes") || lsCompliance.equation.includes("non disponible") ? 
                           "Données insuffisantes" : 
                           (lsCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"),
                      size: 20 
                    })] 
                  })],
                  width: { size: 4000, type: WidthType.DXA }
                })
              ]
            })
          );
        }
      } else if (limitType === "LI_ONLY") {
        // Paramètres avec seulement LI (prise)
        if (liCompliance) {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: `${param.label} LI`, bold: true })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: liCompliance.displayEquation || liCompliance.equation, size: 20 })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: liCompliance.noLimit ? "Pas de limite définie" :
                           liCompliance.equation.includes("insuffisantes") || liCompliance.equation.includes("non disponible") ? 
                           "Données insuffisantes" : 
                           (liCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"),
                      size: 20 
                    })] 
                  })],
                  width: { size: 4000, type: WidthType.DXA }
                })
              ]
            })
          );
        }
      } else {
        // Paramètres avec LI et LS (résistances)
        if (liCompliance) {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: `${param.label} LI`, bold: true })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: liCompliance.displayEquation || liCompliance.equation, size: 20 })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: liCompliance.noLimit ? "Pas de limite définie" :
                           liCompliance.equation.includes("insuffisantes") || liCompliance.equation.includes("non disponible") ? 
                           "Données insuffisantes" : 
                           (liCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"),
                      size: 20 
                    })] 
                  })],
                  width: { size: 4000, type: WidthType.DXA }
                })
              ]
            })
          );
        }

        if (lsCompliance) {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: `${param.label} LS`, bold: true })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: lsCompliance.displayEquation || lsCompliance.equation, size: 20 })] 
                  })],
                  width: { size: 5000, type: WidthType.DXA }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: lsCompliance.noLimit ? "Pas de limite définie" :
                           lsCompliance.equation.includes("insuffisantes") || lsCompliance.equation.includes("non disponible") ? 
                           "Données insuffisantes" : 
                           (lsCompliance.satisfied ? "Équation satisfaite" : "Équation non satisfaite"),
                      size: 20 
                    })] 
                  })],
                  width: { size: 4000, type: WidthType.DXA }
                })
              ]
            })
          );
        }
      }
    });

    // Ajouter la table au document
    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
        },
        rows: tableRows
      })
    );

    paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
  }

  return paragraphs;
}

static addAttributsToWord(classData, helpers) {
  const paragraphs = [];

  if (classData.attributParamsWithData && classData.attributParamsWithData.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: "Contrôle par Attributs propriétés physiques & chimiques", 
            bold: true,
            size: 24
          })
        ],
        spacing: { after: 50 }
      })
    );

    // ✅ TABLE POUR ATTRIBUTS
    const tableRows = [];

    classData.attributParamsWithData.forEach(param => {
      const attributeResult = helpers.checkEquationSatisfaction(
        classData.classCompliance[param.key]?.values || [],
        classData.classCompliance[param.key]?.limits || {},
        classData.conditionsStatistiques
      );

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: param.label, bold: true })] 
              })],
              width: { size: 5000, type: WidthType.DXA }
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: attributeResult.displayText, size: 20 })] 
              })],
              width: { size: 4000, type: WidthType.DXA }
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ 
                  text: attributeResult.noLimits ? "Pas de limites définies" :
                       attributeResult.equation.includes("insuffisantes") || 
                       attributeResult.equation.includes("manquantes") || 
                       attributeResult.equation.includes("non chargées") ? 
                       "Données insuffisantes" : 
                       (attributeResult.satisfied ? "Équation satisfaite" : "Équation non satisfaite"),
                  size: 20 
                })] 
              })],
              width: { size: 4000, type: WidthType.DXA }
            })
          ]
        })
      );
    });

    // Ajouter la table au document
    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
        },
        rows: tableRows
      })
    );

    paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
  }

  return paragraphs;
}

static addConclusionToWord(classData, options, helpers) {
  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: "CONCLUSION :", 
          bold: true,
          size: 24
        })
      ],
      spacing: { after: 50 }
    })
  );

  let conclusionData = { mainConclusions: [], detailedPeriods: [] };
  
  try {
    if (helpers && helpers.generateGeneralConclusion) {
      conclusionData = helpers.generateGeneralConclusion(
        {},
        options.phase,
        classData.coverageRequirements || {},
        classData.conformiteData || {},
        classData.dataToUse || []
      );
    } else {
      conclusionData.mainConclusions = ["Conclusion générée sans analyse de couverture détaillée"];
    }
  } catch (error) {
    console.error("Erreur dans generateGeneralConclusion:", error);
    conclusionData.mainConclusions = ["Erreur lors de la génération de la conclusion"];
  }

  // Affichez seulement les conclusions principales
  conclusionData.mainConclusions.forEach(conclusion => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: conclusion,
            bold: true
          })
        ],
        spacing: { after: 20 }
      })
    );
  });

  // Final conformity box
  const conformityColor = "000000";
  const conformityText = classData.conformityResult?.isClassConforme ? "CONFORME" : "NON CONFORME";

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: `CONFORMITÉ: ${conformityText}`, 
          bold: true,
          size: 24
        })
      ],
      spacing: { after: 50 },
      alignment: AlignmentType.CENTER,
      border: {
        top: { style: "single", size: 6, color: conformityColor },
        bottom: { style: "single", size: 6, color: conformityColor },
        left: { style: "single", size: 6, color: conformityColor },
        right: { style: "single", size: 6, color: conformityColor }
      },
      shading: {
        fill: "FFFFFF"
      }
    })
  );

  return paragraphs;
}
  // MAIN EXPORT FUNCTION (EXISTANT - NE PAS MODIFIER)
  // ============================================================

  static async exportToWord(doc, fileName = "export.docx") {
  try {
    // 1️⃣ Create Blob from Word document
    const blob = await Packer.toBlob(doc);

    // 2️⃣ Convert Blob → ArrayBuffer → Base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64File = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // 3️⃣ Trigger download in browser
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 4️⃣ Return Base64 so ControleConformite.jsx can save it
    return base64File;
  } catch (error) {
    console.error("❌ Error exporting to Word:", error);
    throw error;
  }
}

}

export default WordExportService;