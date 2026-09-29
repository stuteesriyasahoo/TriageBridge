# TriageBridge Secure Model Artifact Deployment Specification

> **CLASSIFICATION STATUS: EXPERIMENTAL OFFLINE RESEARCH MODEL — REJECTED FOR APPLICATION ACTIVATION**  
> *This model was trained in an isolated research environment but is **EXPLICITLY REJECTED** for clinical deployment or application activation pending dataset provenance verification, clinical safety calibration, verified neural multilingual translation, and board-certified clinical review.*  
> 
> *Both shadow feature flags remain strictly disabled:*  
> `TRIAGE_ML_SHADOW_ENABLED=false`  
> `SYMPTOM_PATTERN_SHADOW_ENABLED=false`  

---

## 1. Local Artifact Inventory & Verification Checksums

All binary model artifacts are strictly **excluded from Git** via `.gitignore` (`ml/models/*.joblib`).

| Artifact File | Format | File Size | SHA-256 Checksum | Intended Role | Current Operational Status |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `ml/models/symptom_pattern_model.joblib` | Scikit-Learn (Joblib bundle) | 9,704,887 bytes | `b70f88dfb6543eb6bdb51f6de71984e7dda0f4114f950886525a49de54164a8e` | Auxiliary multi-label pattern research | **REJECTED FOR ACTIVATION (Inference Disabled)** |
| `ml/models/urgency_model.joblib` | Scikit-Learn Pipeline | 23,658 bytes | `cb1c572bb45ca4dd6bf494ec2575cfd9ea52bb4a14f4fb3158c3db9a527cba8b` | Hackathon urgency classifier prototype | **SHADOW MODE ONLY (`TRIAGE_ML_SHADOW_ENABLED=false`)** |

---

## 2. Strictly Prohibited Deployment Practices

Under NO circumstances may any team member, CI pipeline, or deployment script:
1. **Commit Model Binaries to Git**: Joblib, pickle, ONNX, or PyTorch binaries must NEVER be committed to the repository. Repository storage bloats Git history, risks supply-chain tampering, and violates repository hygiene.
2. **Upload Artifacts to Public Storage**: Artifacts must NEVER be placed in publicly accessible cloud buckets (e.g., S3 buckets with public read ACLs, unauthenticated GCP storage, public Hugging Face repositories, or open CDNs).
3. **Bundle Models with Frontend JavaScript**: Models must NEVER be converted to WebAssembly, ONNX.js, or bundled into Next.js client-side assets. Client-side execution exposes proprietary weights, allows client-side tampering, risks reverse engineering, and bypasses server-side deterministic safety gates.
4. **Deploy Without Checksum Verification**: Models must NEVER be loaded dynamically without pre-execution cryptographic integrity verification.

---

## 3. Approved Future Model-Artifact Deployment Architecture

When (and if) an auxiliary ML model achieves full clinical safety validation, dataset provenance verification, and institutional sign-off, the following protocol must be used:

```
[Private KMS-Encrypted Bucket]
      (AWS S3 / GCP GCS)
               │
               ▼  1. Authenticated IAM Role Fetch (Private VPC Endpoint)
[Backend Worker Node (Python)]
               │
               ▼  2. Verify SHA-256 against Signed Manifest
       Checksum Valid?
         ├──► NO  ──► ABORT STARTUP (Security Alert)
         └──► YES ──► Load model into memory (joblib.load)
               │
               ▼  3. Check Feature Flag: SYMPTOM_PATTERN_SHADOW_ENABLED
       Flag Enabled?
         ├──► NO  ──► BYPASS INFERENCE (Zero Predictions)
         └──► YES ──► Execute Shadow Prediction (Log to DB via Service Role)
```

### Protocol Steps:
1. **Private KMS Storage**:
   - Model artifacts must be stored in a dedicated, private, non-public object storage bucket (e.g. AWS S3 with SSE-KMS CMK, or GCP Cloud Storage with customer-managed encryption keys).
   - Bucket access is strictly controlled via IAM roles restricted to backend ML worker compute instances (e.g., AWS ECS Task Role / GCP Service Account).
2. **Pre-Execution Checksum Verification**:
   - During container startup, a bootstrap script fetches the artifact and verifies its SHA-256 checksum against an immutable, signed manifest file (`model_manifest.json.sig`).
   - If the calculated hash does not match `b70f88dfb6543eb6bdb51f6de71984e7dda0f4114f950886525a49de54164a8e`, startup terminates immediately with exit code 1.
3. **Isolated Python Backend Execution**:
   - Models run exclusively within isolated server-side Python containers (e.g. FastAPI/gRPC worker microservice) deployed within a private VPC subnet.
   - Zero direct public internet ingress; requests are routed strictly through trusted internal API gateways with mTLS and shared HMAC authentication (`TRIAGE_ML_SERVICE_SECRET`).
4. **Permanent Human Oversight & Deterministic Override**:
   - Machine learning inference is strictly advisory and silent.
   - Deterministic missing-information gates (GREY) and clinical red-flag rules (RED) precede all ML invocations.
   - Final urgency determination remains exclusively with certified human healthcare personnel.
