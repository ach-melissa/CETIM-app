import React, { useState } from 'react';
import './ClassSelector.css';

const ClassSelector = ({ classes, onSelectionChange }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);

  const toggleClass = (classe) => {
    setSelectedClasses(prev => {
      let newSelection;
      if (prev.includes(classe)) {
        newSelection = prev.filter(c => c !== classe);
      } else {
        newSelection = [...prev, classe];
      }
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setSelectedClasses(prev => {
      const newSelection = [...prev];
      [newSelection[index - 1], newSelection[index]] = [newSelection[index], newSelection[index - 1]];
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const moveDown = (index) => {
    if (index === selectedClasses.length - 1) return;
    setSelectedClasses(prev => {
      const newSelection = [...prev];
      [newSelection[index], newSelection[index + 1]] = [newSelection[index + 1], newSelection[index]];
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const removeClass = (index) => {
    setSelectedClasses(prev => {
      const newSelection = prev.filter((_, i) => i !== index);
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="class-selector-container">
      <div className="available-classes">
        <h4>Classes Disponibles</h4>
        <div className="class-buttons">
          {classes.map(classe => (
            <button
              key={classe}
              className={`class-btn ${selectedClasses.includes(classe) ? 'selected' : ''}`}
              onClick={() => toggleClass(classe)}
            >
              {classe}
            </button>
          ))}
        </div>
      </div>

      {selectedClasses.length > 0 && (
        <div className="selected-classes">
          <h4>Ordre d'Export ({selectedClasses.length} sélectionnée(s))</h4>
          <div className="selected-list">
            {selectedClasses.map((classe, index) => (
              <div key={classe} className="selected-item">
                <span className="order-number">{index + 1}</span>
                <span className="class-name">{classe}</span>
                <div className="item-actions">
                  <button 
                    className="move-btn" 
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    title="Déplacer vers le haut"
                  >
                    ↑
                  </button>
                  <button 
                    className="move-btn" 
                    onClick={() => moveDown(index)}
                    disabled={index === selectedClasses.length - 1}
                    title="Déplacer vers le bas"
                  >
                    ↓
                  </button>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeClass(index)}
                    title="Retirer"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSelector;