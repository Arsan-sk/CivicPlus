# 🏛️ CivicPlus – AI-Powered Hyperlocal Community Problem Solver

> **"Because local problems deserve immediate, collective action."**

CivicPlus is a purpose-built civic action platform that bridges the gap between citizens and municipal authorities. Instead of traditional entertainment-focused social networks, CivicPlus is designed to transform hyperlocal reporting (potholes, garbage, leakages, streetlight issues) into a transparent, community-driven social movement.

---

## 🌐 Live Demo
**[https://civicplus-app.web.app](https://civicplus-app.web.app)**

---

## 🚀 The Hook & Motive

Community problems like water leakage, road craters, and dark streetlights are typically reported through fragmented channels, ending up ignored, duplicated, or lost in red tape. Citizens are left in the dark about progress, and authorities struggle to route requests to the correct departments.

**CivicPlus solves this by combining:**
* 🗺️ **Interactive Geographic Mapping** (Visualizing issues in real-time)
* 🧠 **AI Vision Assistance** (Instant categorization and severity detection)
* 🔒 **Hierarchical Jurisdiction Boundaries** (Automatic scoped routing for authorities)
* 👥 **Crowdsourced Social Verification Loops** (Holding authorities publicly accountable)

---

## 🎯 Key Features

### 1. AI Vision Analyzer (Powered by Gemini 2.5 Flash)
* **Instant Multimodal Classification**: Citizens upload a photo of the issue. The integrated **Gemini 2.5 Flash** vision model analyzes the visual evidence in real-time to auto-select the matching category and severity level.
* **Automatic Summary Generation**: Gemini automatically writes a short summary description of what was detected in the image to assist repair crews.
* **Smart Fallback**: Uses local keyword analysis if model connectivity is limited.

### 2. Scoped Jurisdiction Dashboards
* **Scope-Aware Authority Feeds**: When a verified official logs in, their dashboard is automatically scoped to their administrative boundary:
  * **Prime Minister**: Accesses national-level statistics and all issues.
  * **Chief Minister**: Accesses state-level issues (e.g. issues across Maharashtra).
  * **Mayor / Municipal Commissioner**: Accesses city-specific issues.
  * **Department Officer**: Accesses city-level issues belonging *only* to their assigned department (e.g. Waste Management, Roadways).
* **Locked Feeds**: Hides public scopes for authorities, showing a unified boundary-restricted list: `🔒 Scoped to your jurisdiction`.

### 3. Hierarchical Law Enforcement
* **Out-of-Boundary Security**: To maintain strict integrity, authorities can only update the lifecycle of issues that fall directly under their jurisdiction. 
* **Locked Action Center**: If an authority views an issue outside their state, city, or department, the Action Center displays:
  `🔒 Action Center Locked: You do not have jurisdiction to take actions on this issue.`

### 4. Public Accountability & Verification Loops
* **Community Confirmations**: An issue remains in `Community Verification Pending` until at least **10 citizens** verify its existence.
* **Resolution Checklists**: When an authority marks an issue as `Resolved`, the status changes to `Awaiting Community Verification`. It is only marked as `Closed` after the community confirms the fix.
* **Support & Verify Actions**: Citizens can highlight critical issues by voting (Support) and confirming them to increase visibility.

### 5. Official Announcements
* **Verified Broadcasts**: Verified authorities can publish Official Announcements directly to the community feed.
* **Restricted Publishing**: Citizens can only publish general discussions, while authorities have access to a dedicated `Publish Announcement` flow.
* **Visual badging**: Announcements display a prominent `Official Announcement` badge across the homepage feed and search results.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, TypeScript, Phosphor Icons
* **Database & Auth**: Supabase (PostgreSQL, Row Level Security, custom PL/pgSQL database triggers)
* **AI Model Integration**: Google Gemini API (`gemini-2.5-flash`)
* **State Management**: Zustand
* **Routing**: React Router DOM v6

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Arsan-sk/CivicPlus.git
   cd CivicPlus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   VITE_GOOGLE_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔮 Future Roadmap

* 📈 **Issue Hotspot Forecasting**: Using historic data to predict road degradation and streetlight failures before they occur.
* 🤖 **Autonomous Department Routing**: Automatically routing issues to specific sub-contractor departments based on spatial parsing.
* 📷 **Duplicate Photo Matching**: Using perceptual hashing (pHash) to detect if different users uploaded the same image for duplicate reports.
* 💬 **Automated Translation**: Auto-translating civic discussions to regional Indian languages (Hindi, Marathi, Kannada, etc.).

---

## ✒️ Creator Spotlight

This project is created and maintained with pride by:

### 🌟 **SHAIKH MOHD ARSAN**

*AI Hyperlocal Civic Solutions Platform*
