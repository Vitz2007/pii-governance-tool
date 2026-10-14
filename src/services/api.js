// src/services/api.js

// For simulating Python backend, save for later*

// Real-time text scanner function
export const checkComplianceWithBackend = async (currentText) => {
  const response = await fetch('http://127.0.0.1:8000/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: currentText,
    }),
  });
  if (!response.ok) {
    throw new Error('Server returned error status: ${response.status}');
  }
  return await response.json();
};

// History table data function
export const mockFetchHistory = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { 
          id: 1, 
          detected_date: "2026-08-30", 
          source: "/engineering/project_alpha.txt", 
          rule: "Confidentiality Classification",
          match_count: 1,
          risk_score: 0.10, 
          is_violation: false 
        },
        { 
          id: 2, 
          detected_date: "2026-08-31", 
          source: "Direct User Input (UI)", 
          rule: "SSN Pattern Match",
          match_count: 3,
          risk_score: 0.95, 
          is_violation: true 
        },
        { 
          id: 3, 
          detected_date: "2026-09-01", 
          source: "/hr/onboarding/notes.docx", 
          rule: "Data Density: Low",
          match_count: 0,
          risk_score: 0.05, 
          is_violation: false 
        }
      ]);
    }, 600); 
  });
};