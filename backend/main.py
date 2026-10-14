from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer

# Clarify custom regex pattern for an internal employee ID (e.g., "EMP-2026-56789")
employee_id_pattern = Pattern(
    name="employee_id_regex",
    regex=r"\bEMP-\d{4}-\d{4}\b",
    score=0.80
)

# Register the custom recognizer with the Presidio's AnalyzerEngine
employee_id_recognizer = PatternRecognizer(
    supported_entity="CUSTOM_EMPLOYEE_ID",
    patterns=[employee_id_pattern],
    context=["employee", "id", "staff"]
)

# Initialize the Presidio AnalyzerEngine and add the custom rule
analyzer = AnalyzerEngine()
analyzer.registry.add_recognizer(employee_id_recognizer)
app = FastAPI(title="PII Governance API")

# Config CORS settings to Vite React frontend can speak to this backend
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentRequest(BaseModel):
    text: str
    
@app.post("/scan")
async def scan_document(request: DocumentRequest):
    if not request.text.strip():
        return {"is_violation": False, "risk_score": 0.0, "message": "Empty document."}
    # Run the Presidio analyzer and our custom employee ID rule
    results = analyzer.analyze(text=request.text, language='en')
    
    match_count = len(results)
    is_violation = match_count > 0
    
    # Calculate a propotional risk score based on the number of matches found
    risk_score = min(match_count * 0.25, 1.0)
    message = f"Found {match_count} PII entities." if is_violation else "No PII detected."
    
    return {
        "is_violation": is_violation,
        "risk_score": risk_score,
        "match_count": match_count,
        "message": message,
        "details": [{"entity_type": r.entity_type, "score": r.score} for r in results]
    }