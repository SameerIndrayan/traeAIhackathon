# Requirements Document - Tone Improver App

## 1. Overview
A simple one-page web application that allows users to input text, select a desired tone, and receive a rewritten version of the text using MiniMax AI.

## 2. User Stories
- As a user, I want to paste a message into a text area.
- As a user, I want to select a tone from a dropdown list (Confident, Professional, Persuasive, Polite).
- As a user, I want to click an "Improve" button to process the text.
- As a user, I want to see the original and improved text side-by-side.
- As a user, I want the improved text to be returned without any conversational filler or explanations.

## 3. Functional Requirements
- **Input**:
  - Textarea for source message.
  - Dropdown for Tone selection:
    - Confident
    - Professional
    - Persuasive
    - Polite
- **Processing**:
  - Send source text and selected tone to MiniMax API.
  - Prompt should instruct AI to return ONLY the rewritten text.
- **Output**:
  - Display Original Text and Improved Text in a side-by-side layout.
- **Constraints**:
  - Single page application.
  - No authentication.
  - No database.
  - Minimal, clean UI.

## 4. Non-Functional Requirements
- Performance: Quick response time (dependent on API).
- Usability: Intuitive interface, clear visual separation between input and output.
