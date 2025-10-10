// frontend/src/services/CentralExportService.js
// frontend/src/services/CentralExportService.js
// frontend/src/services/CentralExportService.js

class CentralExportService {
  static collectedData = {
    echantillonsTable: null,
    tableauConformite: null,
    controleDetail: null,
    donneesGraphiques: null,
    donneesStatistiques: null
  };

  // Méthodes pour collecter les données
  static addEchantillonsTable(data, options = {}) {
    try {
      this.collectedData.echantillonsTable = {
        data: data,
        title: "Échantillons et Données Traitées",
        type: 'echantillons',
        options: options,
        timestamp: new Date().toISOString()
      };
      console.log("✅ Échantillons Table ajoutée à l'export global", {
        headers: data.headers?.length,
        rows: data.rows?.length
      });
    } catch (error) {
      console.error("❌ Erreur addEchantillonsTable:", error);
    }
  }

  static addTableauConformite(data, options = {}) {
    try {
      this.collectedData.tableauConformite = {
        data: data,
        title: "Tableau de Conformité",
        type: 'table',
        options: options,
        timestamp: new Date().toISOString()
      };
      console.log("✅ Tableau de Conformité ajouté à l'export global");
    } catch (error) {
      console.error("❌ Erreur addTableauConformite:", error);
    }
  }

  static addDonneesStatistiques(data, options = {}) {
    try {
      this.collectedData.donneesStatistiques = {
        data: data,
        title: "Données Statistiques", 
        type: 'stats',
        options: options,
        timestamp: new Date().toISOString()
      };
      console.log("✅ Données Statistiques ajoutées à l'export global");
    } catch (error) {
      console.error("❌ Erreur addDonneesStatistiques:", error);
    }
  }

  static addDonneesGraphiques(data, options = {}) {
    try {
      this.collectedData.donneesGraphiques = {
        data: data,
        title: "Données Graphiques",
        type: 'graphical',
        options: options,
        timestamp: new Date().toISOString()
      };
      console.log("✅ Données Graphiques ajoutées à l'export global");
    } catch (error) {
      console.error("❌ Erreur addDonneesGraphiques:", error);
    }
  }

// Dans CentralExportService.js - ajoutez cette méthode

// ⭐⭐ MÉTHODE SPÉCIALE POUR LES GRAPHIQUES
static async generateGraphicalPDF(pageData) {
  try {
    console.log("🔄 Génération PDF graphique avec capture...");
    
    const PDFExportService = await import('../components/ControleConformite/PDFExportService.js').then(module => module.default);
    
    // Utiliser la méthode existante de PDFExportService qui capture le graphique
    const doc = await PDFExportService.generateGraphicalReport(pageData.data, pageData.options);
    
    console.log("✅ PDF graphique généré avec succès");
    return doc;
    
  } catch (error) {
    console.error("❌ Erreur génération PDF graphique:", error);
    
    // Fallback: créer un PDF simple sans graphique
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Données Graphiques", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Erreur lors de la génération du graphique", 14, 35);
    doc.text(`Erreur: ${error.message}`, 14, 45);
    
    return doc;
  }
}
  static addControleDetail(data, options = {}) {
    try {
      this.collectedData.controleDetail = {
        data: data,
        title: "Contrôle Détail",
        type: 'class',
        options: options,
        timestamp: new Date().toISOString()
      };
      console.log("✅ Contrôle Détail ajouté à l'export global");
    } catch (error) {
      console.error("❌ Erreur addControleDetail:", error);
    }
  }

  // Vérifier si on a des données
  static hasData() {
    return Object.values(this.collectedData).some(page => page !== null);
  }

  // Obtenir le nombre de pages avec données
  static getPagesCount() {
    return Object.values(this.collectedData).filter(page => page !== null).length;
  }

  // Obtenir le statut de chaque page
  static getExportStatus() {
    const status = {};
    Object.entries(this.collectedData).forEach(([key, page]) => {
      status[key] = page !== null ? "✅ Prête" : "❌ Manquante";
    });
    return status;
  }

  // Effacer toutes les données
  static clearAllData() {
    this.collectedData = {
      echantillonsTable: null,
      tableauConformite: null,
      donneesStatistiques: null,
      donneesGraphiques: null,
      controleDetail: null
    };
    console.log("🗑️ Toutes les données exportées ont été effacées");
  }

  // Obtenir le message de statut
  static getStatusMessage() {
    try {
      const count = this.getPagesCount();
      const total = Object.keys(this.collectedData).length;
      
      if (count === 0) {
        return "❌ Aucune donnée collectée";
      } else if (count === total) {
        return `✅ Toutes les ${total} pages sont prêtes`;
      } else {
        return `📊 ${count}/${total} pages collectées`;
      }
    } catch (error) {
      return "❌ Erreur de statut";
    }
  }

  // ⭐⭐ MÉTHODE PRINCIPALE - PDF COMBINÉ AVEC pdf-lib
  static async exportAllToPDF() {
    try {
      if (!this.hasData()) {
        alert("❌ Aucune donnée collectée pour l'export global !");
        return false;
      }

      console.log("🔄 Début de la création du PDF combiné avec pdf-lib...");

      const { PDFDocument } = await import('pdf-lib');
      const PDFExportService = await import('../components/ControleConformite/PDFExportService.js').then(module => module.default);

      // Créer un document principal
      const mainPdf = await PDFDocument.create();

      // ===== AJOUTER CHAQUE PAGE DANS L'ORDRE =====
      const pageOrder = [
        { key: 'echantillonsTable', name: 'Échantillons' },
        { key: 'tableauConformite', name: 'Tableau de Conformité' },
        { key: 'controleDetail', name: 'Contrôle Détail' },
        { key: 'donneesGraphiques', name: 'Données Graphiques' },
        { key: 'donneesStatistiques', name: 'Données Statistiques' }
      ];

      let totalPages = 0;

      for (const page of pageOrder) {
        const pageData = this.collectedData[page.key];
        if (pageData) {
          console.log(`📄 Génération de: ${page.name}`);
          
          try {
            // Générer le PDF individuel
            const individualDoc = await this.generateIndividualPDF(pageData, PDFExportService);
            
            if (individualDoc) {
              console.log(`✅ ${page.name} généré, conversion en PDF...`);
              
              // Convertir jsPDF en array buffer
              const pdfBytes = individualDoc.output('arraybuffer');
              
              // Charger le PDF dans pdf-lib
              const individualPdf = await PDFDocument.load(pdfBytes);
              
              // Copier toutes les pages
              const pageIndices = individualPdf.getPageIndices();
              const pages = await mainPdf.copyPages(individualPdf, pageIndices);
              
              // Ajouter chaque page au document principal
              pages.forEach(page => {
                mainPdf.addPage(page);
                totalPages++;
              });
              
              console.log(`✅ ${page.name} ajouté (${pages.length} pages)`);
            } else {
              console.error(`❌ ${page.name} - Document non généré`);
            }
          } catch (pageError) {
            console.error(`❌ Erreur avec ${page.name}:`, pageError);
            // Ajouter une page d'erreur
            const errorPage = mainPdf.addPage();
            this.addErrorPageToPdfLib(mainPdf, errorPage, page.name, pageError);
            totalPages++;
          }
        }
      }

      if (totalPages === 0) {
        alert("❌ Aucune page n'a pu être générée !");
        return false;
      }

      // Sauvegarder le PDF combiné
      const pdfBytes = await mainPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_complet_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);

      console.log(`📊 PDF combiné généré avec ${totalPages} pages`);
      alert(`✅ Rapport complet exporté !\n\n📁 Fichier: ${link.download}\n📄 ${totalPages} pages combinées`);
      return true;

    } catch (error) {
      console.error("❌ Erreur export avec pdf-lib:", error);
      alert("Erreur lors de l'export combiné: " + error.message);
      return false;
    }
  }

  // ⭐⭐ GÉNÉRER CHAQUE PDF INDIVIDUEL
// Dans CentralExportService.js - modifiez la méthode generateIndividualPDF
static async generateIndividualPDF(pageData, PDFExportService) {
  try {
    console.log(`🔄 Génération PDF pour: ${pageData.title}`, pageData.type);
    
    switch (pageData.type) {
      case 'echantillonsTable':
        console.log("🔄 Appel de generateEchantillonsPDF...");
        return await this.generateEchantillonsPDF(pageData);
        
      case 'table':
        console.log("🔄 Appel de generateTableReport...");
        return await PDFExportService.generateTableReport(pageData.data, pageData.options);
        
      case 'class':
        console.log("🔄 Appel de generateClassReport...");
        return await PDFExportService.generateClassReport(
          pageData.data.selectedClasses,
          pageData.data.getClassData,
          pageData.data.helpers,
          pageData.options
        );
        
      case 'graphical':
        console.log("🔄 Appel de generateGraphicalPDF (méthode spéciale)...");
        return await this.generateGraphicalPDF(pageData);
        
      case 'stats':
        console.log("🔄 Appel de generateStatsReport...");
        return await PDFExportService.generateStatsReport(pageData.data, pageData.options);
        
      default:
        console.warn(`❌ Type de page non géré: ${pageData.type}`);
        return null;
    }
  } catch (error) {
    console.error(`❌ Erreur génération PDF ${pageData.title}:`, error);
    return null;
  }
}

  // ⭐⭐ GÉNÉRER PDF ÉCHANTILLONS - VERSION CORRIGÉE
  static async generateEchantillonsPDF(pageData) {
    try {
      console.log("🔄 Début generateEchantillonsPDF", {
        data: pageData.data ? {
          headers: pageData.data.headers?.length,
          rows: pageData.data.rows?.length
        } : 'no data'
      });

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Titre
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(pageData.title, 14, 15);
      
      // Informations
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      if (pageData.options.clientInfo) {
        doc.text(`Client: ${pageData.options.clientInfo.nom}`, 14, 25);
      }
      
      if (pageData.options.periodStart && pageData.options.periodEnd) {
        doc.text(`Période: ${pageData.options.periodStart} à ${pageData.options.periodEnd}`, 14, 32);
      }
      
      if (pageData.options.produitInfo) {
        const produitText = pageData.options.produitInfo.description || pageData.options.produitInfo.nom || '';
        doc.text(`Produit: ${produitText}`, 14, 39);
      }

      currentY += 10;

      // Tableau des échantillons
      if (pageData.data && pageData.data.headers && pageData.data.rows) {
        console.log("✅ Données échantillons disponibles:", {
          headers: pageData.data.headers.length,
          rows: pageData.data.rows.length
        });

        const startY = 50;
        const margin = 14;
        const pageWidth = doc.internal.pageSize.width;
        const availableWidth = pageWidth - 2 * margin;
        const colCount = pageData.data.headers.length;
        const colWidth = availableWidth / colCount;
        
        let currentY = startY;
        
        // En-tête du tableau
        doc.setFillColor(41, 128, 185);
        doc.rect(margin, currentY - 5, availableWidth, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        
        pageData.data.headers.forEach((header, index) => {
          const x = margin + (index * colWidth);
          const displayHeader = header.length > 8 ? header.substring(0, 6) + '...' : header;
          doc.text(displayHeader, x + 2, currentY);
        });
        
        currentY += 4;
        
        // Lignes du tableau
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        
        pageData.data.rows.forEach((row, rowIndex) => {
          // Vérifier si on besoin d'une nouvelle page
          if (currentY > doc.internal.pageSize.height - 20) {
            doc.addPage();
            currentY = 20;
            
            // Redessiner l'en-tête
            doc.setFillColor(41, 128, 185);
            doc.rect(margin, currentY - 5, availableWidth, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            
            pageData.data.headers.forEach((header, index) => {
              const x = margin + (index * colWidth);
              const displayHeader = header.length > 8 ? header.substring(0, 6) + '...' : header;
              doc.text(displayHeader, x + 2, currentY);
            });
            
            currentY += 4;
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
          }
          
          // Fond alterné
          if (rowIndex % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, currentY - 3, availableWidth, 4, 'F');
          }
          
          // Données
          row.forEach((cell, cellIndex) => {
            const x = margin + (cellIndex * colWidth);
            const displayValue = String(cell || "").length > 10 ? 
              String(cell || "").substring(0, 8) + '...' : 
              String(cell || "");
            doc.text(displayValue, x + 1, currentY);
          });
          
          currentY += 4;
        });

        console.log("✅ PDF échantillons généré avec succès");
      } else {
        console.error("❌ Données échantillons manquantes");
        doc.setFontSize(12);
        doc.text("Aucune donnée d'échantillon disponible", 14, 60);
      }

      return doc;

    } catch (error) {
      console.error("❌ Erreur génération PDF échantillons:", error);
      
      // PDF d'erreur de secours
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Erreur lors de la génération des échantillons", 14, 50);
      doc.setFontSize(10);
      doc.text(`Erreur: ${error.message}`, 14, 65);
      
      return doc;
    }
  }

  // ⭐⭐ PAGE D'ERREUR POUR PDF-LIB
  static addErrorPageToPdfLib(pdfDoc, page, pageTitle, error) {
    // Cette méthode nécessiterait plus de travail pour écrire du texte avec pdf-lib
    // Pour l'instant, on laisse la page vide
    console.error(`Page d'erreur pour: ${pageTitle}`, error);
  }

  // ⭐⭐ MÉTHODE ALTERNATIVE SIMPLE - PDFs SÉPARÉS
  static async exportAllSeparatePDFs() {
    try {
      if (!this.hasData()) {
        alert("❌ Aucune donnée collectée !");
        return false;
      }

      console.log("🔄 Début de l'export séparé...");

      const PDFExportService = await import('../components/ControleConformite/PDFExportService.js').then(module => module.default);

      const pageOrder = [
        { key: 'echantillonsTable', name: 'Échantillons' },
        { key: 'tableauConformite', name: 'Tableau de Conformité' },
        { key: 'controleDetail', name: 'Contrôle Détail' },
        { key: 'donneesGraphiques', name: 'Données Graphiques' },
        { key: 'donneesStatistiques', name: 'Données Statistiques' }
      ];

      let exportedCount = 0;

      for (const page of pageOrder) {
        const pageData = this.collectedData[page.key];
        if (pageData) {
          console.log(`📄 Export de: ${page.name}`);
          
          try {
            let doc;
            switch (page.key) {
              case 'echantillonsTable':
                doc = await this.generateEchantillonsPDF(pageData);
                break;
              case 'tableauConformite':
                doc = await PDFExportService.generateTableReport(pageData.data, pageData.options);
                break;
              case 'controleDetail':
                doc = await PDFExportService.generateClassReport(
                  pageData.data.selectedClasses,
                  pageData.data.getClassData,
                  pageData.data.helpers,
                  pageData.options
                );
                break;
              case 'donneesGraphiques':
                doc = await PDFExportService.generateGraphicalReport(pageData.data, pageData.options);
                break;
              case 'donneesStatistiques':
                doc = await PDFExportService.generateStatsReport(pageData.data, pageData.options);
                break;
            }

            if (doc) {
              const timestamp = new Date().toISOString().split('T')[0];
              const fileName = `export_${page.key}_${timestamp}.pdf`;
              doc.save(fileName);
              exportedCount++;
              
              console.log(`✅ ${page.name} exporté: ${fileName}`);
              
              // Petite pause entre les exports
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`❌ Erreur export ${page.name}:`, error);
          }
        }
      }

      alert(`✅ ${exportedCount} pages exportées individuellement !`);
      return true;

    } catch (error) {
      console.error("❌ Erreur export séparé:", error);
      alert("Erreur: " + error.message);
      return false;
    }
  }
}

export default CentralExportService;