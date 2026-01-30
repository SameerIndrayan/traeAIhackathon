# Technical Design Document - Tone Improver App

## 1. Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS.
- **Backend**: Express.js (serving as an API proxy to protect keys and handle CORS if needed).
- **AI Integration**: MiniMax API (via standard HTTP requests).

## 2. Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React `useState` (Simple local state is sufficient, but will use `zustand` if complexity grows, though template includes it).
- **Backend**: Node.js + Express
- **HTTP Client**: Axios or Fetch

## 3. API Structure
### Endpoint: `POST /api/improve`
- **Request Body**:
  ```json
  {
    "message": "string",
    "tone": "confident | professional | persuasive | polite"
  }
  ```
- **Response Body**:
  ```json
  {
    "improvedMessage": "string"
  }
  ```

## 4. Data Flow
1. User enters text and selects tone.
2. User clicks "Improve".
3. Frontend sends POST request to `/api/improve`.
4. Backend constructs prompt: "Rewrite the following text to be more [tone]. Return ONLY the rewritten text, no explanations. Text: [message]"
5. Backend calls MiniMax API.
6. Backend extracts response text and sends back to Frontend.
7. Frontend updates state and displays result.

## 5. Environment Variables
- `MINIMAX_API_KEY`: API Key for MiniMax service.
- `MINIMAX_GROUP_ID`: (If required by specific MiniMax endpoint).
