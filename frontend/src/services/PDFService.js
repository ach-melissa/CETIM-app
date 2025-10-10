import axios from 'axios';

class PDFService {
  static async generateConformiteReport(selectedClasses, reportData, options = {}) {
    try {
      const response = await axios.post('http://localhost:5000/api/generate-pdf', {
        selectedClasses,
        reportData,
        options
      }, {
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set file name
      const fileName = options.fileName || `rapport_conformite_${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Alternative: Open in new tab instead of download
  static async generateAndOpenPDF(selectedClasses, reportData, options = {}) {
    try {
      const response = await axios.post('http://localhost:5000/api/generate-pdf', {
        selectedClasses,
        reportData,
        options
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export default PDFService;
