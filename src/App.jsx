import React, { useState } from 'react';
import './App.css';

// Funciones para detectar simetrías
const detectSymmetry = (matrix) => {
  const rows = matrix.split('\n').map(row => row.trim());
  const numRows = rows.length;
  const numCols = rows[0]?.length || 0;

  const isSymmetricVertical = rows.every((row, i) => row === row.split('').reverse().join(''));
  const isSymmetricHorizontal = rows.slice(0, Math.floor(numRows / 2)).every((row, i) => row === rows[numRows - 1 - i]);
  const isSymmetricDiagonal = rows.every((row, i) => row === rows[i].split('').reverse().join(''));

  return { isSymmetricVertical, isSymmetricHorizontal, isSymmetricDiagonal };
};

// Implementación de Huffman
class Node {
  constructor(symbol, frequency) {
    this.symbol = symbol;
    this.frequency = frequency;
    this.left = null;
    this.right = null;
  }
}

const buildHuffmanTree = (frequencies) => {
  const nodes = Object.entries(frequencies).map(([symbol, freq]) => new Node(symbol, freq));
  
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency);
    
    const left = nodes.shift();
    const right = nodes.shift();
    
    const newNode = new Node(null, left.frequency + right.frequency);
    newNode.left = left;
    newNode.right = right;
    
    nodes.push(newNode);
  }
  
  return nodes[0];
};

const buildHuffmanCodes = (root, prefix = '', codes = {}) => {
  if (root) {
    if (root.symbol !== null) {
      codes[root.symbol] = prefix;
    }
    buildHuffmanCodes(root.left, prefix + '0', codes);
    buildHuffmanCodes(root.right, prefix + '1', codes);
  }
  return codes;
};

const huffmanCompress = (input, symmetry) => {
  const frequencies = {};
  
  for (const char of input) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  const tree = buildHuffmanTree(frequencies);
  const codes = buildHuffmanCodes(tree);
  
  const encoded = input.split('').map(char => codes[char]).join('');
  
  // Agregar indicador de simetría
  const symmetryFlag = symmetry.isSymmetricVertical ? '1' : symmetry.isSymmetricHorizontal ? '2' : symmetry.isSymmetricDiagonal ? '3' : '0';
  return {
    encoded: symmetryFlag + encoded,
    codes
  };
};

const huffmanDecompress = (encoded, codes) => {
  const reversedCodes = Object.fromEntries(Object.entries(codes).map(([k, v]) => [v, k]));
  let decoded = '';
  let buffer = '';
  
  const symmetryFlag = encoded[0];
  const encodedData = encoded.slice(1);
  
  for (const bit of encodedData) {
    buffer += bit;
    if (reversedCodes[buffer]) {
      decoded += reversedCodes[buffer];
      buffer = '';
    }
  }
  
  return { decoded, symmetryFlag };
};

const applySymmetry = (matrix, symmetryFlag) => {
  const rows = matrix.split('\n').map(row => row.trim());
  const numRows = rows.length;
  const numCols = rows[0]?.length || 0;

  let expandedMatrix = '';

  if (symmetryFlag === '1') {
    // Simetría vertical
    expandedMatrix = rows.map(row => row + row.split('').reverse().join('')).join('\n');
  } else if (symmetryFlag === '2') {
    // Simetría horizontal
    expandedMatrix = rows.join('\n') + '\n' + rows.slice().reverse().join('\n');
  } else if (symmetryFlag === '3') {
    // Simetría diagonal
    expandedMatrix = rows.map((row, i) => row.split('').reverse().join('')).join('\n');
  } else {
    expandedMatrix = matrix;
  }

  return expandedMatrix;
};

function App() {
  const [inputMatrix, setInputMatrix] = useState('');
  const [encodedData, setEncodedData] = useState('');
  const [decodedMatrix, setDecodedMatrix] = useState('');
  const [codes, setCodes] = useState({});
  const [symmetry, setSymmetry] = useState({});
  const [symmetryFlag, setSymmetryFlag] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^01\n]/g, '');
    setInputMatrix(value);

    const matrixArray = value.split('\n').map(row => row.trim()).join('');
    
    // Detectar simetrías
    const symmetries = detectSymmetry(value);
    setSymmetry(symmetries);

    let matrixToCompress = matrixArray;

    if (symmetries.isSymmetricVertical) {
      const rows = value.split('\n').map(row => row.trim());
      matrixToCompress = rows.map(row => row.slice(0, Math.ceil(row.length / 2))).join('\n'); // Solo la mitad de cada fila
    } else if (symmetries.isSymmetricHorizontal) {
      matrixToCompress = value.split('\n').slice(0, Math.floor(value.split('\n').length / 2)).join('\n'); // Solo la mitad de las filas
    } else if (symmetries.isSymmetricDiagonal) {
      matrixToCompress = matrixArray; // En el caso de la simetría diagonal no se reduce la matriz
    }

    const { encoded, codes: huffmanCodes } = huffmanCompress(matrixToCompress, symmetries);
    setEncodedData(encoded);
    setCodes(huffmanCodes);

    // Decodificar
    const { decoded, symmetryFlag } = huffmanDecompress(encoded, huffmanCodes);
    setSymmetryFlag(symmetryFlag);

    const fullMatrix = applySymmetry(decoded, symmetryFlag);
    setDecodedMatrix(fullMatrix);
  };

  const renderMatrix = (matrix) => {
    return matrix.split('\n').map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.split('').map((cell, cellIndex) => (
          <div
            key={cellIndex}
            className={`cell ${cell === '1' ? 'black' : 'white'}`}
          />
        ))}
      </div>
    ));
  };

  const characterCount = (text) => text.length;

  return (
    <div className="App">
      <h1>Matrix Encoder/Decoder with Huffman Compression and Symmetry Detection</h1>
      
      <h2>Input Matrix</h2>
      <textarea
        value={inputMatrix}
        onChange={handleInputChange}
        placeholder="Enter binary matrix, e.g.:\n00111100\n01111110\n11011011"
        rows="10"
        cols="30"
      />
      <div>Character Count: {characterCount(inputMatrix)}</div>
      <div className="matrix">
        {renderMatrix(inputMatrix)}
      </div>

      <h2>Encoded Data (Huffman)</h2>
      <textarea
        value={encodedData}
        readOnly
        rows="10"
        cols="30"
      />
      <div>Character Count: {characterCount(encodedData)}</div>

      <h2>Decoded Matrix</h2>
      <textarea
        value={decodedMatrix}
        readOnly
        rows="10"
        cols="30"
      />
      <div>Character Count: {characterCount(decodedMatrix)}</div>
      <div className="matrix">
        {renderMatrix(decodedMatrix)}
      </div>

      <h2>Symmetries Detected</h2>
      <pre>{JSON.stringify(symmetry, null, 2)}</pre>

      <h2>Symmetry Flag</h2>
      <pre>{symmetryFlag}</pre>

      <h2>Huffman Codes</h2>
      <pre>{JSON.stringify(codes, null, 2)}</pre>
    </div>
  );
}

export default App;
