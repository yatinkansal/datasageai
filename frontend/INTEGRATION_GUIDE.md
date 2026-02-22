# DataSage AI - Backend Integration Guide

## 🎯 Integration Complete!

Your DataSage AI project for **HacFest 2.0** is now fully integrated! The frontend and backend are connected and ready to communicate.

## 📁 What Has Been Set Up

### 1. **Environment Configuration** (`.env`)
- Located in: `d:\enhanced data dictionary\.env`
- Backend API URL: `http://localhost:5001`

### 2. **Vite Proxy Configuration** (`vite.config.ts`)
- Proxy route: `/api/*` → `http://localhost:5001/*`
- This handles CORS automatically
- No code changes needed in frontend or backend!

### 3. **API Service Layer** (`src/services/api.ts`)
- Centralized API functions for all backend endpoints
- Type-safe TypeScript definitions
- Error handling built-in

### 4. **Type Definitions** (`src/vite-env.d.ts`)
- TypeScript support for Vite environment variables
- Ensures type safety for API configuration

---

## 🚀 How to Run Both Services

### **Step 1: Start the Backend**
```bash
cd d:\backend
python app.py
```
✅ Backend will run on: `http://localhost:5001`

### **Step 2: Start the Frontend**
```bash
cd "d:\enhanced data dictionary"
npm run dev
```
✅ Frontend will run on: `http://localhost:5173`

---

## 🔌 Available API Functions

Import the API functions in your React components:

```typescript
import { 
  extractMetadata, 
  profileTable, 
  generateDocumentation,
  chatWithAI,
  generateSQL,
  healthCheck
} from '@/services/api';
```

### API Function Reference

| Function | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| `extractMetadata()` | `/extract` | GET | Get all database metadata |
| `profileTable(tableName)` | `/profile/:table` | GET | Profile specific table |
| `generateDocumentation(tableName)` | `/generate-doc/:table` | GET | Generate AI docs for table |
| `chatWithAI(question)` | `/chat` | POST | Chat with AI about data |
| `generateSQL(question)` | `/generate-sql` | POST | Generate SQL from text |
| `healthCheck()` | `/` | GET | Check backend status |

---

## 💡 Example Usage in React Components

### Example 1: Fetch Metadata
```typescript
import { useState, useEffect } from 'react';
import { extractMetadata } from '@/services/api';

function MetadataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const metadata = await extractMetadata();
        setData(metadata);
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render your data */}</div>;
}
```

### Example 2: Chat Interface
```typescript
import { chatWithAI } from '@/services/api';

async function handleSendMessage(question: string) {
  try {
    const response = await chatWithAI(question);
    console.log('AI Response:', response);
    // Update your chat UI with the response
  } catch (error) {
    console.error('Chat failed:', error);
  }
}
```

### Example 3: Generate SQL
```typescript
import { generateSQL } from '@/services/api';

async function handleGenerateQuery(naturalLanguageQuery: string) {
  try {
    const result = await generateSQL(naturalLanguageQuery);
    console.log('Generated SQL:', result.sql);
    // Display the SQL in your UI
  } catch (error) {
    console.error('SQL generation failed:', error);
  }
}
```

---

## 🛠️ Integration Architecture

```
Frontend (React + Vite)          Backend (Flask)
Port: 5173                       Port: 5001
       │                              │
       │  HTTP Request to /api/*      │
       ├──────────────────────────────>│
       │  (Vite proxy forwards to      │
       │   http://localhost:5001)      │
       │                               │
       │  JSON Response                │
       │<──────────────────────────────┤
       │                               │
```

---

## ✅ Benefits of This Integration

1. **No Code Changes**: Both frontend and backend remain unchanged
2. **CORS Handled**: Vite proxy eliminates CORS issues
3. **Type Safety**: TypeScript definitions for all API calls
4. **Error Handling**: Built-in error handling in API layer
5. **Environment Config**: Easy to change backend URL via `.env`
6. **Clean Architecture**: Separation of concerns with service layer

---

## 🎉 Ready for HacFest 2.0!

Your DataSage AI project is now fully functional with:
- ✅ Frontend and Backend connected
- ✅ API service layer ready to use
- ✅ No CORS issues
- ✅ Type-safe API calls
- ✅ Easy to maintain and extend

### Quick Test:
1. Start both servers (backend on 5001, frontend on 5173)
2. Open browser to `http://localhost:5173`
3. Import and use API functions in any page
4. Start building your demo! 🚀

---

## 📝 Notes for Development

- **API calls use the proxy**: When you call `/api/extract`, it automatically goes to `http://localhost:5001/extract`
- **Environment variables**: Can be accessed via `import.meta.env.VITE_API_BASE_URL`
- **No authentication**: Currently open access (add auth if needed for hackathon)

Good luck with HacFest 2.0! 🎊
