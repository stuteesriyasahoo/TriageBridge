"""
TriageBridge Protected ML Urgency Model Service
===============================================
Location: ml/service.py
Model: ml/models/urgency_model.joblib

STRICT SECURITY CONTROLS:
- Hardcoded model path: No arbitrary file-path input or model loading.
- Strict schema validation: Rejects unknown fields or PII.
- Request authentication token verification.
- Structured audit logs: Zero patient-identifying data.
- Generic error codes without stack traces in production.
- Health and Model-version endpoints.
- Return format: prediction, model version, uncalibrated model scores,
  processing time, and mandatory non-clinical disclaimer.
- NEVER returns diagnosis or treatment information.
"""

import os
import sys
import json
import time
import uuid
import logging
from typing import Dict, Any, Tuple, Optional

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Setup structured logger (NO PII in logs)
LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, 'service_audit.log')

logger = logging.getLogger("TriageBridgeMLService")
logger.setLevel(logging.INFO)
if not logger.handlers:
    fh = logging.FileHandler(LOG_FILE, encoding='utf-8')
    formatter = logging.Formatter('{"time":"%(asctime)s","level":"%(levelname)s","event":%(message)s}')
    fh.setFormatter(formatter)
    logger.addHandler(fh)

# Fixed Model and Metadata Paths (IMMUTABLE - Arbitrary paths forbidden)
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, 'models', 'urgency_model.joblib'))
METADATA_PATH = os.path.abspath(os.path.join(BASE_DIR, 'models', 'model_metadata.json'))

# Mandatory Safety Warning
MANDATORY_WARNING = "Experimental AI-generated suggestion — synthetic uncalibrated scores — not clinically validated."

# Cached artifacts
_CACHED_MODEL = None
_CACHED_METADATA = None

# Allowed intake schema fields
ALLOWED_FIELDS = {
    'age', 'gender', 'patient_language', 'chief_complaint', 'symptoms',
    'duration_hours', 'pain_score', 'medical_history', 'allergies',
    'pregnancy_status', 'vitals_heart_rate_bpm', 'vitals_systolic_bp',
    'vitals_diastolic_bp', 'vitals_spo2_percent', 'vitals_temperature_c',
    'vitals_respiratory_rate_bpm'
}

# Forbidden PII keys
FORBIDDEN_PII_KEYS = {
    'name', 'patient_name', 'full_name', 'phone', 'phone_number',
    'aadhaar', 'masked_aadhaar', 'address', 'exact_address', 'audio',
    'raw_audio', 'image', 'raw_image', 'document', 'documents',
    'patient_synthetic_id', 'case_id'
}


def log_structured_event(event_type: str, data: Dict[str, Any]):
    """Logs structured JSON audit event without any patient PII."""
    safe_payload = {
        "event_type": event_type,
        **{k: v for k, v in data.items() if k not in FORBIDDEN_PII_KEYS}
    }
    logger.info(json.dumps(safe_payload))


def load_metadata() -> Dict[str, Any]:
    global _CACHED_METADATA
    if _CACHED_METADATA is None:
        if not os.path.exists(METADATA_PATH):
            raise FileNotFoundError("Model metadata not found")
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            _CACHED_METADATA = json.load(f)
    return _CACHED_METADATA


def load_model():
    global _CACHED_MODEL
    if _CACHED_MODEL is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("Urgency model binary not found at fixed path")
        import joblib
        _CACHED_MODEL = joblib.load(MODEL_PATH)
    return _CACHED_MODEL


def get_health() -> Dict[str, Any]:
    """Health check endpoint response."""
    try:
        model = load_model()
        meta = load_metadata()
        return {
            "status": "HEALTHY",
            "model_loaded": model is not None,
            "model_version": meta.get("model_version", "1.0.0-synthetic-prototype"),
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "UNHEALTHY",
            "model_loaded": False,
            "error_code": "ERR_MODEL_UNAVAILABLE",
            "timestamp": time.time()
        }


def get_version() -> Dict[str, Any]:
    """Model version endpoint response."""
    try:
        meta = load_metadata()
        return {
            "model_name": meta.get("model_name", "TriageBridge Experimental Urgency Classifier"),
            "model_version": meta.get("model_version", "1.0.0-synthetic-prototype"),
            "dataset_hash": meta.get("dataset_sha256", "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f"),
            "is_validated": False,
            "synthetic_notice": "Trained on synthetic clinical scenarios. Evaluation only."
        }
    except Exception:
        return {
            "model_version": "1.0.0-synthetic-prototype",
            "dataset_hash": "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f",
            "is_validated": False,
            "error_code": "ERR_METADATA_UNAVAILABLE"
        }


def validate_input_schema(payload: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Strictly validates input schema: rejects unexpected fields or any PII."""
    if not isinstance(payload, dict):
        return False, "ERR_INVALID_BODY: Payload must be a JSON object"

    # Check for forbidden PII fields
    for k in payload.keys():
        if k.lower() in FORBIDDEN_PII_KEYS:
            return False, f"ERR_PII_PROHIBITED: Field '{k}' is prohibited in model service"

    # Check for unsupported fields
    unrecognized = set(payload.keys()) - ALLOWED_FIELDS
    if unrecognized:
        return False, f"ERR_UNSUPPORTED_FIELDS: Fields {list(unrecognized)} not allowed in intake schema"

    # Validate types / ranges if present
    if 'age' in payload and payload['age'] is not None:
        try:
            val = float(payload['age'])
            if val < 0 or val > 130:
                return False, "ERR_INVALID_VALUE: Age must be between 0 and 130"
        except (ValueError, TypeError):
            return False, "ERR_INVALID_TYPE: Age must be numeric"

    if 'pain_score' in payload and payload['pain_score'] is not None:
        try:
            val = float(payload['pain_score'])
            if val < 0 or val > 10:
                return False, "ERR_INVALID_VALUE: Pain score must be between 0 and 10"
        except (ValueError, TypeError):
            return False, "ERR_INVALID_TYPE: Pain score must be numeric"

    if 'patient_language' in payload and payload['patient_language'] is not None:
        if str(payload['patient_language']).lower() not in ['en', 'hi', 'or']:
            return False, "ERR_INVALID_VALUE: Language must be 'en', 'hi', or 'or'"

    return True, None


def run_prediction(payload: Dict[str, Any], auth_token: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes prediction with strict validation, timing, and error handling.
    """
    start_time = time.time()
    req_id = str(uuid.uuid4())[:8]

    # Verify secret token if TRIAGE_ML_SERVICE_SECRET is configured
    expected_secret = os.environ.get("TRIAGE_ML_SERVICE_SECRET", "")
    if expected_secret and auth_token != expected_secret:
        log_structured_event("AUTH_FAILURE", {"request_id": req_id, "error": "Invalid auth token"})
        return {
            "success": False,
            "prediction": None,
            "model_version": "1.0.0-synthetic-prototype",
            "dataset_hash": "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f",
            "uncalibrated_model_scores": None,
            "processing_time_ms": 0.0,
            "warning": MANDATORY_WARNING,
            "error_code": "ERR_UNAUTHORIZED"
        }

    # Validate Schema
    is_valid, err_msg = validate_input_schema(payload)
    if not is_valid:
        log_structured_event("VALIDATION_FAILURE", {"request_id": req_id, "error_code": err_msg})
        return {
            "success": False,
            "prediction": None,
            "model_version": "1.0.0-synthetic-prototype",
            "dataset_hash": "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f",
            "uncalibrated_model_scores": None,
            "processing_time_ms": round((time.time() - start_time) * 1000, 2),
            "warning": MANDATORY_WARNING,
            "error_code": err_msg
        }

    try:
        model = load_model()
        meta = load_metadata()
        model_version = meta.get("model_version", "1.0.0-synthetic-prototype")
        dataset_hash = meta.get("dataset_sha256", "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f")

        import pandas as pd

        cc = str(payload.get('chief_complaint', '')).strip()
        sym = str(payload.get('symptoms', '')).strip()
        combined_text = f"{cc} {sym}".strip()

        row_data = {
            'combined_text': [combined_text],
            'age': [pd.to_numeric(payload.get('age'), errors='coerce')],
            'duration_hours': [pd.to_numeric(payload.get('duration_hours'), errors='coerce')],
            'pain_score': [pd.to_numeric(payload.get('pain_score'), errors='coerce')],
            'vitals_heart_rate_bpm': [pd.to_numeric(payload.get('vitals_heart_rate_bpm'), errors='coerce')],
            'vitals_systolic_bp': [pd.to_numeric(payload.get('vitals_systolic_bp'), errors='coerce')],
            'vitals_diastolic_bp': [pd.to_numeric(payload.get('vitals_diastolic_bp'), errors='coerce')],
            'vitals_spo2_percent': [pd.to_numeric(payload.get('vitals_spo2_percent'), errors='coerce')],
            'vitals_temperature_c': [pd.to_numeric(payload.get('vitals_temperature_c'), errors='coerce')],
            'vitals_respiratory_rate_bpm': [pd.to_numeric(payload.get('vitals_respiratory_rate_bpm'), errors='coerce')],
            'gender': [str(payload.get('gender', 'OTHER'))],
            'patient_language': [str(payload.get('patient_language', 'en'))],
            'medical_history': [str(payload.get('medical_history', 'none_reported'))],
            'allergies': [str(payload.get('allergies', 'none_known'))],
            'pregnancy_status': [str(payload.get('pregnancy_status', 'not_applicable'))],
        }
        df_input = pd.DataFrame(row_data)

        # Inference
        ml_pred = str(model.predict(df_input)[0])
        classes = list(model.classes_)
        raw_probs = model.predict_proba(df_input)[0]

        scores = {cls: round(float(raw_probs[i]), 4) for i, cls in enumerate(classes)}
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        log_structured_event("INFERENCE_SUCCESS", {
            "request_id": req_id,
            "predicted_class": ml_pred,
            "processing_time_ms": elapsed_ms
        })

        return {
            "success": True,
            "prediction": ml_pred,
            "model_version": model_version,
            "dataset_hash": dataset_hash,
            "uncalibrated_model_scores": scores,
            "processing_time_ms": elapsed_ms,
            "warning": MANDATORY_WARNING,
            "error_code": None
        }

    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        # Structured log error without leaking stack trace to caller
        log_structured_event("INFERENCE_ERROR", {
            "request_id": req_id,
            "error_type": type(e).__name__,
            "processing_time_ms": elapsed_ms
        })
        return {
            "success": False,
            "prediction": None,
            "model_version": "1.0.0-synthetic-prototype",
            "dataset_hash": "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f",
            "uncalibrated_model_scores": None,
            "processing_time_ms": elapsed_ms,
            "warning": MANDATORY_WARNING,
            "error_code": "ERR_INFERENCE_FAILED"
        }


class SimpleRateLimiter:
    """In-memory sliding window rate limiter (requests per minute)."""
    def __init__(self, max_requests: int = 120, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.client_timestamps: Dict[str, list] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        timestamps = self.client_timestamps.get(client_ip, [])
        # filter out old timestamps
        timestamps = [t for t in timestamps if t > cutoff]
        if len(timestamps) >= self.max_requests:
            self.client_timestamps[client_ip] = timestamps
            return False
        timestamps.append(now)
        self.client_timestamps[client_ip] = timestamps
        return True


rate_limiter = SimpleRateLimiter(max_requests=120, window_seconds=60)


def run_http_server(port: int = 8001):
    """Runs protected HTTP prediction microservice for containerized deployment."""
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class MLServiceHandler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            # Suppress default noisy access logs to stderr
            pass

        def _send_json(self, status_code: int, data: Dict[str, Any]):
            body = json.dumps(data).encode('utf-8')
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            client_ip = self.client_address[0]
            if not rate_limiter.is_allowed(client_ip):
                self._send_json(429, {"error": "Too Many Requests", "error_code": "ERR_RATE_LIMITED"})
                return

            expected_secret = os.environ.get("TRIAGE_ML_SERVICE_SECRET", "")
            auth_header = self.headers.get("Authorization", "")
            token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""
            is_authenticated = bool(expected_secret and token == expected_secret)

            if self.path == '/health':
                health = get_health()
                if is_authenticated:
                    self._send_json(200 if health["status"] == "HEALTHY" else 503, health)
                else:
                    status_str = "available" if health["status"] == "HEALTHY" else "unavailable"
                    self._send_json(200 if status_str == "available" else 503, {"status": status_str})
            elif self.path == '/version':
                if not is_authenticated:
                    self._send_json(401, {"error": "Unauthorized", "error_code": "ERR_UNAUTHORIZED"})
                    return
                self._send_json(200, get_version())
            else:
                self._send_json(404, {"error": "Not Found", "error_code": "ERR_NOT_FOUND"})

        def do_POST(self):
            client_ip = self.client_address[0]
            if not rate_limiter.is_allowed(client_ip):
                self._send_json(429, {"error": "Too Many Requests", "error_code": "ERR_RATE_LIMITED"})
                return

            if self.path != '/predict':
                self._send_json(404, {"error": "Not Found", "error_code": "ERR_NOT_FOUND"})
                return

            # Request authentication
            expected_secret = os.environ.get("TRIAGE_ML_SERVICE_SECRET", "")
            auth_header = self.headers.get("Authorization", "")
            token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""

            if expected_secret and token != expected_secret:
                self._send_json(401, {
                    "success": False,
                    "prediction": None,
                    "error_code": "ERR_UNAUTHORIZED",
                    "warning": MANDATORY_WARNING
                })
                return

            # Length guard (max 64KB payload)
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                if content_len > 65536:
                    self._send_json(413, {"error": "Payload Too Large", "error_code": "ERR_PAYLOAD_TOO_LARGE"})
                    return
                post_body = self.rfile.read(content_len).decode('utf-8')
                data = json.loads(post_body) if post_body.strip() else {}
            except Exception:
                self._send_json(400, {
                    "success": False,
                    "prediction": None,
                    "error_code": "ERR_INVALID_JSON",
                    "warning": MANDATORY_WARNING
                })
                return

            result = run_prediction(data, auth_token=token)
            status_code = 200 if result.get("success") else 422
            self._send_json(status_code, result)

    server_address = ('', port)
    httpd = HTTPServer(server_address, MLServiceHandler)
    print(f"TriageBridge ML Microservice listening on port {port} (Rate limiting: 120 req/min)...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down ML microservice...")
        httpd.server_close()


def main():
    """CLI, HTTP server, and pipeline interface."""
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ['--health', '-h', 'health']:
            print(json.dumps(get_health(), indent=2))
            return
        elif arg in ['--version', '-v', 'version']:
            print(json.dumps(get_version(), indent=2))
            return
        elif arg in ['--predict', '-p', 'predict']:
            # Read JSON payload from stdin
            try:
                raw_input = sys.stdin.read()
                data = json.loads(raw_input) if raw_input.strip() else {}
            except Exception:
                print(json.dumps({
                    "success": False,
                    "prediction": None,
                    "model_version": "1.0.0-synthetic-prototype",
                    "dataset_hash": "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f",
                    "uncalibrated_model_scores": None,
                    "processing_time_ms": 0.0,
                    "warning": MANDATORY_WARNING,
                    "error_code": "ERR_INVALID_JSON"
                }))
                return

            auth_token = os.environ.get("TRIAGE_ML_AUTH_TOKEN") or os.environ.get("TRIAGE_ML_SERVICE_SECRET")
            result = run_prediction(data, auth_token=auth_token)
            print(json.dumps(result))
            return
        elif arg in ['--serve', '-s', 'serve']:
            port = 8001
            if len(sys.argv) > 2 and sys.argv[2].isdigit():
                port = int(sys.argv[2])
            elif '--port' in sys.argv:
                p_idx = sys.argv.index('--port')
                if p_idx + 1 < len(sys.argv) and sys.argv[p_idx + 1].isdigit():
                    port = int(sys.argv[p_idx + 1])
            run_http_server(port=port)
            return

    # Default: Show usage
    print(json.dumps({
        "service": "TriageBridge ML Urgency Model Service",
        "usage": "python ml/service.py [--health | --version | --predict | --serve --port 8001]",
        "health": get_health()
    }, indent=2))


if __name__ == '__main__':
    main()

