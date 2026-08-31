import { useState } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { mockCheckCompliance } from './services/api';

function App() {
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [documentText, setDocumentText] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const checkCompliance = async (currentText) => {
    setIsScanning(true);
    try {
      const data = await mockCheckCompliance(currentText);
      setScanResult(data);
      if (data.is_violation) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error checking mock compliance.", error);
    } finally {
      setIsScanning(false);
    }
  };

  const debouncedCheck = useDebounce(checkCompliance, 1000);

// Deleted useEffect that was throwing an error and replaced it with handleTextChange as the user presses a key
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

  const textareaStyle = {
    border: isCurrentlyViolating ? '3px solid #ff4d4f' : '1px solid #ccc',
    width: '100%', height: '150px', padding: '10px', marginTop: '10px',
    outline: 'none', borderRadius: '4px', fontSize: '16px',
  };

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
              style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
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
          style={{ padding: '8px', flex: 1 }}
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      <label>
        <strong>Document Text: </strong>
        {isScanning && <span style={{ color: '#888', fontSize: '0.9em' }}>(Scanning...)</span>}
      </label>

      <textarea
        value={documentText}
        onChange={handleTextChange} 
        placeholder="Type here. Try adding the word 'confidential'..."
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
        </div>
      )}

      <button
        disabled={isCurrentlyViolating || isScanning || !documentText}
        style={{
          marginTop: '20px', padding: '12px 24px', fontSize: '16px', border: 'none',
          backgroundColor: (isCurrentlyViolating || !documentText) ? '#ccc' : '#007bff',
          color: '#fff', cursor: (isCurrentlyViolating || !documentText) ? 'not-allowed' : 'pointer'
        }}
      >
        Submit Document
      </button>

    </div>
  );
}

export default App;