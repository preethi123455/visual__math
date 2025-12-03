import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from 'recharts';

const VisualizationApp = () => {
  const [input, setInput] = useState('');
  const [solution, setSolution] = useState('');
  const [visualization, setVisualization] = useState(null);

  const calculatePercentage = (percent, value) => (percent / 100) * value;

  const handleProblemSubmit = () => {
    let inputLower = input.toLowerCase();

    // Percentages
    if (input.includes('%')) {
      const [percentStr, valueStr] = input.split('of');
      const percent = parseFloat(percentStr.replace('%', '').trim());
      const value = parseFloat(valueStr.trim());
      const result = calculatePercentage(percent, value);
      setSolution(`Solution: ${percent}% of ${value} is ${result}`);

      const data = [
        { name: 'Part', value: result, color: '#00C49F' },
        { name: 'Remaining', value: value - result, color: '#FFBB28' },
      ];

      setVisualization(
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="40%" outerRadius="60%" label dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Algebra
    else if (input.includes('=')) {
      const parts = input.split('=');
      const leftSide = parts[0].trim();
      const rightSide = parseFloat(parts[1].trim());
      const match = leftSide.match(/([+-]?\d*)x\s*([+-]?\d*)?/);
      if (match) {
        const a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
        const b = parseFloat(match[2]) || 0;
        const x = (rightSide - b) / a;
        setSolution(`Solution: x = ${x}`);

        const data = [
          { name: 'ax + b', value: a * x + b, color: '#8884d8' },
          { name: 'Right Side', value: rightSide, color: '#82ca9d' }
        ];

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      } else {
        setSolution('Unable to solve the equation');
        setVisualization(null);
      }
    }

    // Profit and Loss
    else if (inputLower.includes('cp=') && inputLower.includes('sp=')) {
      const cpMatch = inputLower.match(/cp=(\d+(\.\d+)?)/);
      const spMatch = inputLower.match(/sp=(\d+(\.\d+)?)/);
      if (cpMatch && spMatch) {
        const cp = parseFloat(cpMatch[1]);
        const sp = parseFloat(spMatch[1]);
        let result = '';
        let data = [];

        if (sp > cp) {
          const profit = sp - cp;
          const profitPercent = (profit / cp) * 100;
          result = `Profit of ${profit} (Profit% = ${profitPercent.toFixed(2)}%)`;
          data = [
            { name: 'Cost Price', value: cp, color: '#0088FE' },
            { name: 'Profit', value: profit, color: '#00C49F' }
          ];
        } else {
          const loss = cp - sp;
          const lossPercent = (loss / cp) * 100;
          result = `Loss of ${loss} (Loss% = ${lossPercent.toFixed(2)}%)`;
          data = [
            { name: 'Selling Price', value: sp, color: '#FF8042' },
            { name: 'Loss', value: loss, color: '#FFBB28' }
          ];
        }

        setSolution(`Solution: ${result}`);

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }

    // Trigonometry
    else if (inputLower.includes('sin') || inputLower.includes('cos') || inputLower.includes('tan')) {
      const angles = [30, 45, 60];
      const trigData = angles.map(angle => ({
        name: `${angle}°`,
        sin: parseFloat(Math.sin(angle * Math.PI / 180).toFixed(2)),
        cos: parseFloat(Math.cos(angle * Math.PI / 180).toFixed(2)),
        tan: parseFloat(Math.tan(angle * Math.PI / 180).toFixed(2))
      }));
      setSolution('Solution: Standard Trigonometric Values (in degrees)');

      setVisualization(
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trigData}>
            <XAxis dataKey="name" />
            <YAxis domain={[-1, 2]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sin" fill="#8884d8" />
            <Bar dataKey="cos" fill="#82ca9d" />
            <Bar dataKey="tan" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Ratio
    else if (inputLower.includes('ratio')) {
      const match = inputLower.match(/(\d+):(\d+)/);
      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const total = a + b;
        setSolution(`Solution: ${a}:${b} implies ${a}/${total} and ${b}/${total}`);

        const data = [
          { name: 'Part A', value: a, color: '#00C49F' },
          { name: 'Part B', value: b, color: '#FFBB28' }
        ];

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={60} label dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      }
    }

    // Average
    else if (inputLower.includes('average')) {
      const numbers = inputLower.match(/\d+/g)?.map(Number);
      if (numbers?.length) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        setSolution(`Solution: Average is ${avg}`);

        const data = numbers.map((num, i) => ({ name: `Val ${i + 1}`, value: num }));

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }

    // Probability
    else if (inputLower.includes('favorable') && inputLower.includes('total')) {
      const match = inputLower.match(/favorable\s*(\d+).*total\s*(\d+)/);
      if (match) {
        const favorable = parseInt(match[1]);
        const total = parseInt(match[2]);
        const probability = favorable / total;
        setSolution(`Solution: Probability = ${probability}`);

        const data = [
          { name: 'Favorable', value: favorable, color: '#00C49F' },
          { name: 'Unfavorable', value: total - favorable, color: '#FF8042' }
        ];

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={60} label dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      }
    }

    // Number Series
    else if (inputLower.includes('series')) {
      const numbers = inputLower.match(/\d+/g)?.map(Number);
      if (numbers?.length) {
        const diffs = numbers.slice(1).map((n, i) => n - numbers[i]);
        const next = numbers[numbers.length - 1] + diffs[0];
        setSolution(`Solution: Next number in the series is likely: ${next}`);

        const data = numbers.map((num, i) => ({ name: `Term ${i + 1}`, value: num }));

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    }

    // Coding & Decoding
    else if (inputLower.includes('code') && inputLower.includes('of')) {
      const match = inputLower.match(/code\s+of\s+(\w+)/);
      if (match) {
        const word = match[1];
        const coded = word
          .toUpperCase()
          .split('')
          .map(char => char.charCodeAt(0) - 64)
          .join('-');
        setSolution(`Solution: Code of ${word.toUpperCase()} is ${coded}`);

        const data = word.toUpperCase().split('').map((char, i) => ({
          name: char,
          value: char.charCodeAt(0) - 64,
          color: `hsl(${(i * 40) % 360}, 70%, 50%)`
        }));

        setVisualization(
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Smart Math Visualizer</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter math problem"
        style={styles.input}
      />
      <button onClick={handleProblemSubmit} style={styles.button}>Solve & Visualize</button>
      <div style={styles.solution}>{solution}</div>
      <div style={styles.chart}>{visualization}</div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  
  },
  header: {
    marginBottom: '20px',
    color: '#333',
  },
  input: {
    padding: '10px',
    width: '80%',
    fontSize: '16px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  solution: {
    marginTop: '20px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#444',
  },
  chart: {
    marginTop: '20px',
    width: '100%',
    height: '250px'
  }
};

export default VisualizationApp;
