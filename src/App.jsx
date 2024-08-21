import { useState } from 'react';
import './App.css';

function App() {
  const [inputMatrix, setInputMatrix] = useState('');
  const [encodedData, setEncodedData] = useState('');
  const [decodedMatrix, setDecodedMatrix] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^01\n]/g, '');
    setInputMatrix(value);

    // Generar frecuencias y codificar
    const matrixArray = value.split('\n').map(row => row.trim());
    const huffmanTree = buildHuffmanTree(matrixArray.join(''));
    const huffmanCodes = generateHuffmanCodes(huffmanTree);
    const encoded = encodeMatrix(matrixArray.join(''), huffmanCodes);
    setEncodedData(encoded);

    // Decodificar
    const decoded = decodeMatrix(encoded, huffmanTree);
    const rows = [];
    let i = 0;
    for (let row of matrixArray) {
      rows.push(decoded.slice(i, i + row.length));
      i += row.length;
    }
    setDecodedMatrix(rows.join('\n'));
  };

  // Función para construir el árbol de Huffman
  const buildHuffmanTree = (data) => {
    const freqMap = {};
    for (let char of data) {
      freqMap[char] = (freqMap[char] || 0) + 1;
    }

    const heap = Object.entries(freqMap).map(([char, freq]) => ({ char, freq }));
    heap.sort((a, b) => a.freq - b.freq);

    while (heap.length > 1) {
      const left = heap.shift();
      const right = heap.shift();
      const newNode = {
        char: null,
        freq: left.freq + right.freq,
        left,
        right
      };
      heap.push(newNode);
      heap.sort((a, b) => a.freq - b.freq);
    }

    return heap[0];
  };

  // Función para generar códigos de Huffman a partir del árbol
  const generateHuffmanCodes = (tree) => {
    const codes = {};
    const traverse = (node, code) => {
      if (node.char !== null) {
        codes[node.char] = code;
      } else {
        traverse(node.left, code + '0');
        traverse(node.right, code + '1');
      }
    };
    traverse(tree, '');
    return codes;
  };

  // Función para codificar la matriz utilizando Huffman Coding
  const encodeMatrix = (data, codes) => {
    return data.split('').map(char => codes[char]).join('');
  };

  // Función para decodificar la matriz utilizando Huffman Coding
  const decodeMatrix = (encodedData, tree) => {
    let result = '';
    let node = tree;

    for (let bit of encodedData) {
      node = bit === '0' ? node.left : node.right;
      if (node.char !== null) {
        result += node.char;
        node = tree;
      }
    }

    return result;
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
      <h1>Matrix Encoder/Decoder with Huffman Coding</h1>
      
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
    </div>
  );
}

export default App;
