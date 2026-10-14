import { useState, useEffect } from 'react';
import { useDebounce } from './hooks/useDebounce';
// Swapped mockCheckCompliance for checkComplianceWithBackend
import { checkComplianceWithBackend, mockFetchHistory } from './services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import styles from './App.module.css'; 

function App() {
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('Engineering');
  
  const [documentName, setDocumentName] = useState('');
  const [documentText, setDocumentText] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await mockFetchHistory();
        setScanHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch history.", error);
      }
    };
    
    loadHistory();
  }, []); 

  // Function calls our running FastAPI backend
  const checkCompliance = async (currentText) => {
    setIsScanning(true);
    try {
      const data = await checkComplianceWithBackend(currentText);
      setScanResult(data);
      if (data.is_violation) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error communicating with FastAPI backend:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const debouncedCheck = useDebounce(checkCompliance, 1000);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setDocumentText(newText);
    if (!newText.trim()) {
      setScanResult(null);
      setIsScanning(false);
    } else {
      debouncedCheck(newText);
    }
  };

  const isCurrentlyViolating = scanResult?.is_violation;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!documentText.trim() || isCurrentlyViolating) return;

    const newEntry = {
      id: Date.now(), 
      detected_date: new Date().toISOString().split('T')[0], 
      source: documentName.trim() ? documentName : "Untitled Document",
      rule: "Standard Compliance Passed",
      match_count: 0,
      risk_score: scanResult ? scanResult.risk_score : 0.0,
      is_violation: false
    };

    setScanHistory((prevHistory) => [newEntry, ...prevHistory]);

    setDocumentText('');
    setDocumentName('');
    setScanResult(null);
  };

  const textareaStyle = {
    border: isCurrentlyViolating ? '3px solid #ff4d4f' : '1px solid #ccc',
    width: '100%', height: '150px', padding: '10px', marginTop: '10px',
    outline: 'none', borderRadius: '4px', fontSize: '16px',
  };

  // Metrics for the snapshot cards
  const totalScans = scanHistory.length;
  const activeViolations = scanHistory.filter((item) => item.is_violation).length;
  const passRate = totalScans > 0 
    ? Math.round(((totalScans - activeViolations) / totalScans) * 100) 
    : 100;

  // History for Trend Chart
  const chartData = [...scanHistory].reverse().map(row => ({
    name: row.detected_date.substring(5),
    Risk: Math.round(row.risk_score * 100),
    Status: row.is_violation ? "Blocked" : "Safe"
  }));

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', 
          alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '400px' }}>
            <h2 style={{ color: '#ff4d4f', marginTop: 0 }}>⚠️ Compliance Violation</h2>
            <p>Your input contains sensitive information.</p>
            <p><strong>Detected Risk:</strong> {scanResult?.message}</p>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
              I understand. Let me correct it.
            </button>
          </div>
        </div>
      )}

      <h2>New Document</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Document Name / Source:
        </label>
        <input
          type="text" 
          placeholder="e.g., Q3_Financial_Report.pdf" 
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
        />
      </div>

      <label>
        <strong>Document Text: </strong>
        {isScanning && <span style={{ color: '#888', fontSize: '0.9em' }}>(Scanning...)</span>}
      </label>

      <textarea
        value={documentText}
        onChange={handleTextChange} 
        placeholder="Type here. Try adding an email, phone number, or EMP-2026-1234..."
        style={textareaStyle}
      />

      {scanResult && (
        <div style={{
          marginTop: '10px', padding: '10px', borderRadius: '4px',
          backgroundColor: isCurrentlyViolating ? '#fff1f0' : '#f6ffed',
          color: isCurrentlyViolating ? '#ff4d4f' : '#52c41a'
        }}>
          <strong>Real-Time Risk Assessment Score: </strong>
          {(scanResult.risk_score * 100).toFixed(0)}%
          {isCurrentlyViolating ? " (Submission Blocked)" : " (Safe)"}
          {scanResult.details?.length > 0 && (
            <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
              Detected: {scanResult.details.map(d => d.entity_type).join(', ')}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isCurrentlyViolating || isScanning || !documentText}
        style={{
          marginTop: '20px', padding: '12px 24px', fontSize: '16px', border: 'none',
          backgroundColor: (isCurrentlyViolating || !documentText) ? '#ccc' : '#007bff',
          color: '#fff', cursor: (isCurrentlyViolating || !documentText) ? 'not-allowed' : 'pointer',
          borderRadius: '4px'
        }}
      >
        Submit Document
      </button>

      <hr style={{ marginTop: '40px', marginBottom: '20px', border: '0', borderTop: '1px solid #eee' }} />

      <div className={styles.dashboardTopRow}>
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Risk Assessment Trend (30 Days)</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Risk" 
                  stroke="#007bff" 
                  strokeWidth={3}
                  fill="#cce5ff" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.realTimeCards}>
          <div className={`${styles.snapshotCard} ${styles.alert}`}>
            <span className={styles.snapshotValue}>{activeViolations}</span>
            <span className={styles.snapshotLabel}>Active Violations Blocked</span>
          </div>
          <div className={`${styles.snapshotCard} ${styles.success}`}>
            <span className={styles.snapshotValue}>{passRate}%</span>
            <span className={styles.snapshotLabel}>Real-Time Pass Rate</span>
          </div>
        </div>
      </div>

      <h2>Recent Scan History</h2>
      
      {scanHistory.length === 0 ? (
        <p style={{ color: '#888' }}>Loading history from server...</p>
      ) : (
        <table className={styles.enterpriseTable}>
          <thead>
            <tr>
              <th className={styles.enterpriseTh}>Detected Date</th>
              <th className={styles.enterpriseTh}>Source / Location</th>
              <th className={styles.enterpriseTh}>Triggered Rule</th>
              <th className={styles.enterpriseTh}>Match Count</th>
              <th className={styles.enterpriseTh}>Risk</th>
              <th className={styles.enterpriseTh}>Status</th>
            </tr>
          </thead>
          <tbody>
            {scanHistory.map((row) => (
              <tr key={row.id}>
                <td className={styles.enterpriseTd}>{row.detected_date}</td>
                <td className={styles.enterpriseTd}>{row.source}</td>
                <td className={styles.enterpriseTd}>{row.rule}</td>
                <td className={styles.enterpriseTd}>{row.match_count}</td>
                <td className={styles.enterpriseTd}>{(row.risk_score * 100).toFixed(0)}%</td>
                <td className={styles.enterpriseTd}>
                  <span style={{ 
                    color: row.is_violation ? '#ff4d4f' : '#52c41a',
                    fontWeight: '600',
                    backgroundColor: row.is_violation ? '#fff1f0' : '#f6ffed',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {row.is_violation ? 'Blocked' : 'Safe'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;