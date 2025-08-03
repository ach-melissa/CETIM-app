import React, { useState } from 'react';
import Header from '../../header/Header';
import './parametre_norm.css';

export default function ParametreNorm() {
  const [selectedOption, setSelectedOption] = useState('tous');

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Header />
      <h1>Paramètre Norm</h1>

      <h2> type d'analyse :</h2>
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="radio"
            name="analyse"
            value="mecanique"
            checked={selectedOption === 'mecanique'}
            onChange={handleOptionChange}
          />{' '}
          Mécanique
        </label>{' '}
        <label>
          <input
            type="radio"
            name="analyse"
            value="physique"
            checked={selectedOption === 'physique'}
            onChange={handleOptionChange}
          />{' '}
          Physique
        </label>{' '}
        <label>
          <input
            type="radio"
            name="analyse"
            value="chimique"
            checked={selectedOption === 'chimique'}
            onChange={handleOptionChange}
          />{' '}
          Chimique
        </label>{' '}
        <label>
          <input
            type="radio"
            name="analyse"
            value="tous"
            checked={selectedOption === 'tous'}
            onChange={handleOptionChange}
          />{' '}
          Tous
        </label>
      </div>



      <h2> Poprieté:</h2>
{/* ✅ Multiple labeled input fields */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
  <div>
    <label htmlFor="propriete1">Propriété 1 :</label><br />
    <input type="text" id="propriete1" />
  </div>

  <div>
    <label htmlFor="propriete2">Propriété 2 :</label><br />
    <input type="text" id="propriete2" />
  </div>

  <div>
    <label htmlFor="propriete3">Propriété 3 :</label><br />
    <input type="text" id="propriete3" />
  </div>

  <div>
    <label htmlFor="propriete4">Propriété 4 :</label><br />
    <input type="text" id="propriete4" />
  </div>

  <div>
    <label htmlFor="propriete5">Propriété 5 :</label><br />
    <input type="text" id="propriete5" />
  </div>

  <div>
    <label htmlFor="propriete6">Propriété 6 :</label><br />
    <input type="text" id="propriete6" />
  </div>

  <div>
    <label htmlFor="affichage">Affichage :</label><br />
    <input type="text" id="affichage" />
  </div>
</div>





      <h3>Tableau des Limites ({selectedOption})</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>Cas</th>
            <th>Limite Inf</th>
            <th>Limite Sup</th>
            <th>Limite Garantie</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="text"  /></td>
            <td><input type="number" /></td>
            <td><input type="number"  /></td>
            <td><input type="number"  /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


