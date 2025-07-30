import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export default function ImportExcelPage() {
  const fileInputRef = useRef();
  const [filesData, setFilesData] = useState([]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const allowedExtensions = ['.xls', '.xlsx'];

    const validFiles = files.filter(file =>
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      alert('❌ Seuls les fichiers Excel (.xls, .xlsx) sont autorisés.');
      return;
    }

    // Read all valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        setFilesData(prev => [
          ...prev,
          { name: file.name, data: jsonData, visible: false }
        ]);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const toggleVisibility = (index) => {
    setFilesData(prev =>
      prev.map((file, i) =>
        i === index ? { ...file, visible: !file.visible } : file
      )
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Importer des fichiers Excel</h1>
      <p style={styles.description}>
        Vous pouvez importer plusieurs fichiers Excel. Cliquez sur un nom pour afficher son contenu.
      </p>

      <button onClick={handleButtonClick} style={styles.button}>
        Sélectionner des fichiers Excel
      </button>

      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <p style={styles.uploadCount}>
        ✅ Fichiers importés : {filesData.length}
      </p>

      {filesData.map((file, index) => (
        <div key={index}>
          <h2
            style={styles.fileTitle}
            onClick={() => toggleVisibility(index)}
            title="Cliquez pour afficher ou masquer le contenu"
          >
            📄 {file.name}
          </h2>

          {file.visible && file.data.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <tbody>
                  {file.data.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={styles.cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    marginBottom: '15px',
    color: '#333',
  },
  description: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#666',
  },
  button: {
    backgroundColor: '#f26722',
    color: '#fff',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  uploadCount: {
    fontSize: '16px',
    marginTop: '20px',
    color: '#444',
  },
  fileTitle: {
    marginTop: '30px',
    fontSize: '20px',
    color: '#2b6cb0',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '10px',
    marginBottom: '30px',
    border: '1px solid #ccc',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '6px',
  },
  table: {
    margin: '0 auto',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },
  cell: {
    border: '1px solid #ddd',
    padding: '8px 12px',
    textAlign: 'left',
  },
};
