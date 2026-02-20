This chatbot project was developed by Farhan Fahad purely for learning and educational purposes. It is a hands-on project to explore AI integration, web development, and API usage.

#  Personal AI Chatbot System

An intelligent, interactive AI-powered chatbot built using **FastAPI**, **Groq LLM API**, **Replicate API**, and a custom **HTML/CSS/JavaScript** frontend. The system combines rule-based responses with advanced Large Language Model (LLM) capabilities, along with speech and image generation features to deliver a modern conversational AI experience.

# Project Overview

This chatbot project is developed in multiple phases, gradually enhancing functionality, performance, and user experience.

The system supports:

* Rule-based conversational responses
* AI-powered dynamic responses using Groq's LLM
* Speech-to-Text (STT)
* Text-to-Speech (TTS)
* AI Image Generation via **Replicate API**
* Modern, responsive UI/UX design

---

#  Development Phases

---

## Frontend & Backend Integration

###  Backend

* Built using **FastAPI**
* Integrated with **Groq LLM API**
* Handles API requests and AI response generation

###  Frontend

* Custom-built using:

  * HTML
  * CSS
  * JavaScript

###  Features Implemented

* Rule-based responses for:

  * Greetings
  * Farewells
  * Thank you messages
  * Help commands
* AI-generated responses using Groq’s Large Language Model
* Real-time communication between frontend and backend

This phase established the core chatbot functionality.

---

## UI/UX Enhancement

Phase 3 focused on improving the visual design and user experience.

###  Interface Improvements

* Modern chat layout
* Styled chat bubbles (user & bot)
* Smooth animations
* Avatar support
* Typing indicators
* Sound effects
* Light/Dark theme support
* Fully responsive design

This phase significantly improved user interaction and made the chatbot visually appealing and engaging.

---

## Speech & Image Generation Integration

Phase 4 introduced advanced AI-powered interaction features.

### 🎙 Speech Integration

To improve accessibility and interactivity, speech-based features were added:

#### 🔊 Text-to-Speech (TTS)

* Converts chatbot text responses into natural-sounding audio.
* Enhances user engagement and accessibility.

#### 🎤 Speech-to-Text (STT)

* Converts user voice input into text.
* Allows hands-free interaction with the chatbot.

---

###  AI Image Generation Module

An AI-powered image generation module was integrated using **Replicate API**.

####  Objective

To allow users to:

* Generate AI images through text prompts using Replicate
* View generated images instantly
* Download images directly from the interface

####  Key Features

* Prompt-based AI image generation via Replicate
* Interactive image display
* Download option
* Seamless UI integration into the chatbot

This module expands the chatbot from text-based AI to multimodal AI interaction.

---

#  Tech Stack

### Backend

* Python
* FastAPI
* Groq LLM API (for text responses)
* **Replicate API** (for AI image generation)

### Frontend

* HTML5
* CSS3
* JavaScript

### AI Capabilities

* Large Language Model (LLM)
* Text-to-Speech (TTS)
* Speech-to-Text (STT)
* AI Image Generation via Replicate

---

#  Current Project Status

The chatbot system is under continuous development. Core features are functional; however, some improvements and optimizations are still in progress. Future updates will focus on performance enhancement, better chat management, and feature refinement.

---

# ⚡ How to Run the Chatbot

Follow these steps to set up and run the chatbot locally.

---

### 1. Create Accounts & Obtain API Keys

You need accounts for both **Groq LLM** and **Replicate API**:

* **Groq LLM (for text responses):** https://www.groq.com
* **Replicate (for AI image generation):** https://replicate.com

After signing up and logging in to each platform:

1. Generate your **API key** for Groq.
2. Generate your **API key** for Replicate.

Keep these keys safe; they will be used in the backend configuration.

---

### 2. Configure Environment Variables

1. Go to the **backend folder** of your project.
2. Create a `.env` file inside the backend folder.
3. Add your API keys in the `.env` file as follows:

```env
GROQ_API_KEY=your_groq_api_key
REPLICATE_API_KEY=your_replicate_api_key
```

Make sure to replace the placeholders with your actual API keys.

---

### 3. Install Dependencies

1. Make sure you have Python installed.
2. Navigate to the backend folder and download `requirements.txt` if not already present.
3. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
```

4. Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

5. Install all dependencies:

```bash
pip install -r requirements.txt
```

---

### 4. Run the Backend

1. In the backend folder, run the `main.py` file using:

```bash
uvicorn main:app --reload
```

2. Once running, the backend API will be loaded and accessible via **localhost** (default: `http://127.0.0.1:8000`).

---

### 5. Run the Frontend

1. Open the **frontend folder**.
2. Open `index.html` using a **live server** (e.g., VS Code Live Server extension) to ensure the frontend can communicate with the backend.
3. Start interacting with the chatbot in your browser.

---

### ✅ Notes

* Make sure both the backend (`uvicorn main:app --reload`) and the live server for the frontend are running simultaneously.
* The chatbot uses your **Groq API** for text responses and **Replicate API** for image generation, so valid API keys are required.

---

# 📄 Future Improvements

* Fix chat separation between multiple projects
* Improve Markdown support for older chats
* Optimize real-time response performance
* Add more AI capabilities and custom plugins

---

# 📝 License

This project is currently under development and not yet fully completed. Use for educational purposes only.
