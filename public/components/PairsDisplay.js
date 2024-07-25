import React from 'react';
import './PairsDisplay.css';

function PairsDisplay({ pairs }) {
  return (
    <div className="pairs-container">
      <h2>Generated Pairs</h2>
      <ul>
        {pairs.map((pair, index) => (
          <li key={index} className="pair-item">
            {pair.new ? `${pair.new} & ${pair.old}` : `${pair.first} & ${pair.second}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PairsDisplay;
