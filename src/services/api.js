// src/services/api.js

// For simulating Python backend, save for later*

export const mockCheckCompliance = async (currentText) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const textLower = currentText.toLowerCase();

            if (textLower.includes('confidential') || textLower.includes('123-45-6789')) {
                resolve({
                    is_violation: true,
                    risk_score: 0.85,
                    message: "Mock Violation: Highly sensitive PII detected."
                });
            } else {
                resolve({
                    is_violation: false,
                    risk_score: 0.10,
                    message: "Passed mock sca n."
                });
            }
        }, 800); //Artificial delay to simulate API response
    });
};