// context/DataContext.js
import { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [selectedType, setSelectedType] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState({ start: '', end: '' });

  // Fonction pour mettre à jour les données filtrées et la période
  const updateFilteredData = (data, start, end) => {
    setFilteredTableData(data);
    setFilterPeriod({ start, end });
  };

  return (
    <DataContext.Provider value={{ 
      filteredTableData, 
      setFilteredTableData,
      selectedType, 
      setSelectedType,
      filterPeriod,
      updateFilteredData // Ajoutez cette fonction
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
