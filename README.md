<div align="center">

# 🛡️ Soveren Core

### *The Sovereign Intelligence Layer*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![CrewAI](https://img.shields.io/badge/CrewAI-Agents-FF6B6B?style=for-the-badge)](https://crewai.com)
[![Gemini](https://img.shields.io/badge/Gemini_3-Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

**Intelligence without Exposure. Privacy without Compromise.**

[Getting Started](#-quick-start) • [Architecture](#-architecture) • [Technology](#-technology-stack) • [How It Works](#-how-it-works)

</div>

---

## 🌟 Vision

**AI that works for you, not on you.** We're building a **decentralized, privacy-first agentic infrastructure** designed to return data sovereignty to the individual.

Built on the principles of **Fully Homomorphic Encryption (FHE)** — the "Holy Grail" of cryptography — Soveren enables AI agents to reason, negotiate, and execute complex tasks on behalf of users **without ever seeing their raw data**.

> **Soveren is not just a tool; it is a fiduciary proxy that acts as a "Blind Pilot" for your digital life.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER DEVICE (Local)                            │
│  ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐ │
│  │   Raw Input │───▶│  Privacy Filter  │───▶│  Anonymized + Encrypted     │ │
│  │  (With PII) │    │  (Local Scrub)   │    │  Blobs Ready for Cloud      │ │
│  └─────────────┘    └──────────────────┘    └──────────────┬──────────────┘ │
│                                                            │                │
│  ┌─────────────────────────────────────────────────────────┼──────────────┐ │
│  │                    Encrypted Memory Store               │              │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │              │ │
│  │  │ Local Embed │──▶│   Rotate    │──▶│  Supabase   │◀──┘              │ │
│  │  │  (Xenova)   │   │ (Mock-FHE)  │   │  (pgvector) │                  │ │
│  │  └─────────────┘   └─────────────┘   └─────────────┘                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┬──────────────┘
                                                               │
                              ════════════════════════════════▼═══════════════
                                           CLOUD (Zero-Knowledge)
                              ═══════════════════════════════════════════════
                                                               │
┌──────────────────────────────────────────────────────────────▼──────────────┐
│                           SOVEREN PROXY SERVER                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      FastAPI Gateway (port 8000)                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│       ┌────────────────────────────┼────────────────────────────┐          │
│       ▼                            ▼                            ▼          │
│  ┌─────────┐              ┌──────────────┐              ┌─────────────┐    │
│  │Gatekeeper│              │Decision Maker│              │ Negotiator  │    │
│  │  Agent   │              │    Agent     │              │   Agent     │    │
│  │ (Guard)  │              │   (Proxy)    │              │  (Action)   │    │
│  └─────────┘              └──────────────┘              └─────────────┘    │
│       │                            │                            │          │
│       └────────────────────────────┼────────────────────────────┘          │
│                                    ▼                                        │
│                         ┌──────────────────┐                               │
│                         │    FHE Vault     │                               │
│                         │ (Blind Compare)  │                               │
│                         └──────────────────┘                               │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌──────────────────┐                               │
│                         │   Gemini 3 LLM   │                               │
│                         │ (Only sees tokens)│                               │
│                         └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Zero-Knowledge Infrastructure

### The Problem

Traditional AI assistants require you to expose your raw data — names, locations, financial details — to cloud servers. Even with encryption at rest and in transit, **the AI still sees your plaintext data** during inference.

### Our Solution: The Blind Pilot

Soveren implements a **Zero-Knowledge Agentic Architecture** where:

| Layer | What Happens | What the Cloud Sees |
|-------|--------------|---------------------|
| **Privacy Filter** | Local regex-based PII scrubbing | `[PERSON_1]`, `[LOC_A]`, `[AMOUNT_1]` |
| **FHE Vault** | Encrypted blob comparison | `0x873526f...` (opaque blobs) |
| **Vector Memory** | Rotation-matrix encrypted embeddings | Rotated vectors (distance preserved) |
| **LLM Inference** | Agents reason on tokens | "User [PERSON_1] in [LOC_A] wants..." |

### How FHE-Style Encryption Works

```
┌─────────────────────────────────────────────────────────────┐
│                    MOCK-FHE PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. USER INPUT                                             │
│      "My name is Shuvo, I live in Dhaka, my bill is 2000"  │
│                           │                                 │
│                           ▼                                 │
│   2. LOCAL PRIVACY FILTER (Regex + Heuristics)             │
│      "My name is [PERSON_1], I live in [LOC_A],            │
│       my bill is [AMOUNT_1]"                               │
│                           │                                 │
│                           ▼                                 │
│   3. ENCRYPTED BLOBS (AES + Mock-FHE)                      │
│      {                                                      │
│        "[PERSON_1]": "0x4a7f2b...",                        │
│        "[LOC_A]": "0x9c3e8d...",                           │
│        "[AMOUNT_1]": "0x873526..."                         │
│      }                                                      │
│                           │                                 │
│                           ▼                                 │
│   4. CLOUD RECEIVES: Tokens + Opaque Blobs                 │
│      - Can classify category (FINANCIAL, MEDICAL, etc.)    │
│      - Can compare blobs via Vault (without decrypting)    │
│      - CANNOT recover: Shuvo, Dhaka, 2000                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Encrypted Vector Memory (Semantic Search on Encrypted Data)

We use **rotation-matrix encryption** for vector embeddings — a technique that preserves cosine similarity while making raw vectors unrecoverable without the secret key:

```typescript
// 1. Generate embedding locally (never leaves device unencrypted)
const rawVector = await generateEmbedding("My financial details...");

// 2. Apply rotation matrix (deterministic from user's secret key)
const encryptedVector = rotateVector(rawVector, secretKey);
// Result: [0.23, -0.45, ...] → [0.51, 0.12, ...] (transformed)

// 3. Store in Supabase (cloud never sees original embedding)
await supabase.from('encrypted_memories').insert({ encrypted_embedding });

// 4. Search works! Rotation preserves distances
// cos(rotate(A), rotate(B)) === cos(A, B)
```

---

## 💻 Technology Stack

### Backend (Python)

| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async API gateway |
| **CrewAI** | Multi-agent orchestration framework |
| **Gemini 3 Flash** | LLM backbone for agent reasoning |
| **DuckDuckGo Search** | Privacy-respecting web research |
| **Custom FHE Vault** | Mock-FHE blind comparison engine |
| **Regex Privacy Filter** | Local PII anonymization |

### Frontend (TypeScript)

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI component library |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Xenova Transformers** | Local browser-based embeddings |
| **Supabase (pgvector)** | Encrypted vector storage |
| **mathjs** | Matrix operations for FHE rotation |

### Infrastructure

| Component | Technology |
|-----------|------------|
| **Database** | Supabase PostgreSQL + pgvector |
| **Encryption** | AES-GCM (blobs) + Rotation Matrix (vectors) |
| **Deployment** | Local-first (production: Vercel + Railway) |

---

## 🤖 Agentic Crew

Soveren uses a **multi-agent architecture** where specialized agents collaborate:

### 🛡️ The Gatekeeper
> *"I am the guardian of privacy."*

Ensures no PII leaks into cloud processing. Validates that all personal details are properly tokenized before delegation.

### 🧠 The Decision Maker (Senior Personal Proxy)
> *"I deal with encrypted blobs and tokens. I use the Vault to check limits blindly."*

Analyzes anonymized requests, determines contextual urgency, and creates action plans — all without seeing real values.

### 🌐 The Global Negotiator
> *"I only see [PERSON_1] and [LOC_A]. I draft persuasive communications using market data."*

Drafts professional emails, negotiation scripts, and communications using only anonymized tokens.

---

## 📁 Project Structure

```
soveren-core/
├── 📁 backend/                 # Python backend
│   ├── agents.py               # CrewAI agent definitions
│   ├── tasks.py                # Agent task configurations
│   ├── privacy_filter.py       # Local PII anonymization
│   ├── vault_service.py        # Mock-FHE comparison engine
│   ├── proxy_server.py         # FastAPI server (main entry)
│   ├── main.py                 # Standalone agent demo
│   ├── supabase_schema.sql     # Database schema
│   └── .env                    # API keys (GOOGLE_API_KEY)
│
├── 📁 frontend/                # Next.js frontend
│   ├── app/                    # App Router pages
│   ├── components/             # React components
│   │   ├── ChatInterface.tsx   # Main chat UI
│   │   └── MemoryVisualizer.tsx# Memory debug panel
│   ├── lib/                    # Utilities
│   │   ├── privacy.ts          # Client-side PII filter
│   │   ├── memory.ts           # Encrypted memory service
│   │   └── supabase.ts         # Database client
│   └── .env.local              # Supabase credentials
│
├── 📁 venv/                    # Python virtual environment
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Supabase account** (for encrypted memory)
- **Google AI API Key** (for Gemini 3)

### 1. Clone & Setup Backend

```bash
# Clone repository
git clone https://github.com/yourusername/soveren-core.git
cd soveren-core

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### 2. Setup Frontend

```bash
cd frontend
npm install

# Configure Supabase
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 3. Setup Supabase

Run the SQL in `backend/supabase_schema.sql` in your Supabase SQL Editor to create:
- `encrypted_memories` table with pgvector
- `match_memories` RPC function for semantic search

### 4. Run the Application

```bash
# Terminal 1: Backend (from project root)
.\venv\Scripts\activate
cd backend
python proxy_server.py
# Server runs on http://localhost:8000

# Terminal 2: Frontend (from project root)
cd frontend
npm run dev
# App runs on http://localhost:3000
```

---

## 🔮 Roadmap

- [ ] **Zama TFHE Integration** — Replace Mock-FHE with real fully homomorphic encryption
- [ ] **Multi-tenant Vault** — Secure key per user
- [ ] **Agent Memory** — Long-term encrypted context
- [ ] **Action Bridge** — Execute real-world actions (payments, emails)
- [ ] **Mobile SDK** — iOS/Android privacy layer

---

## 📜 License

MIT License — See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 🛡️ for a privacy-first future**

*"Your data. Your intelligence. Your sovereignty."*

</div>