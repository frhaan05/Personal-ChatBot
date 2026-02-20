from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import requests
import replicate
import os
import base64
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

# API Endpoints
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# FastAPI app
app = FastAPI()

# Mount static folder (still here if you want future use)
# os.makedirs("static", exist_ok=True)
# app.mount("/static", StaticFiles(directory="static"), name="static")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Replicate (Image Generation) ==========
def generate_image_base64(prompt: str):
    """Generate image(s) using Replicate and return as base64 strings."""
    try:
        output = replicate.run(
            "black-forest-labs/flux-dev",  # Replicate model
            input={
                "prompt": prompt,
                "width": 512,
                "height": 512
            }
        )
    except Exception as e:
        print("Replicate error:", e)
        return []

    urls = [str(item) for item in output]
    base64_images = []

    for url in urls:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                # Convert to base64
                img_base64 = base64.b64encode(response.content).decode("utf-8")
                base64_images.append(f"data:image/png;base64,{img_base64}")
        except Exception as e:
            print("Error downloading image:", e)

    return base64_images


# ========== API Routes ==========
@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    # ---------- Image generation ----------
    if "generate image" in user_message.lower() or "regenerate image" in user_message.lower():
        # If it's a regenerate request, get the prompt
        if "regenerate image" in user_message.lower():
            prompt = data.get("prompt", "")  # frontend should send original prompt
        else:
            prompt = user_message.replace("generate image", "").strip()

        images = generate_image_base64(prompt)

        if images:
            return {
                "type": "multimodal",
                "content": {
                    "text": f"Here’s the image for: {prompt}",
                    "images": images,
                    "prompt": prompt  # send prompt back to frontend for future regenerate
                }
            }
        else:
            return {"type": "text", "content": "Failed to generate image."}

    # ---------- Text only (Groq API) ----------
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": user_message}]
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        if response.status_code == 200:
            bot_reply = response.json()['choices'][0]['message']['content']
        else:
            bot_reply = f"Error: Groq API returned {response.status_code}"
    except Exception as e:
        bot_reply = f"Error calling Groq API: {str(e)}"

    return {"type": "text", "content": bot_reply}


@app.get("/test")
def test():
    """Quick test endpoint for image generation."""
    prompt = "sunset back in mountains"
    images = generate_image_base64(prompt)
    return {"prompt": prompt, "images": images}
