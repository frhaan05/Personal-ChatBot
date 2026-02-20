import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Chat history file
HISTORY_FILE = "chat_history.txt"

# Initialize chat history with system role
chat_history = [
    {"role": "system", "content": "You are a helpful personal assistant."}
]

def load_history():
    """Load past conversation from file"""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            lines = f.read().strip().split("\n")
            for line in lines:
                if line.startswith("You: "):
                    chat_history.append({"role": "user", "content": line[5:]})
                elif line.startswith("Bot: "):
                    chat_history.append({"role": "assistant", "content": line[5:]})

def save_history(user_input, bot_reply):
    """Save new messages into file"""
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(f"You: {user_input}\n")
        f.write(f"Bot: {bot_reply}\n")

def clear_history():
    """Clear chat history file and reset memory"""
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
    global chat_history
    chat_history = [
        {"role": "system", "content": "You are a helpful personal assistant."}
    ]
    print("🧹Chat history cleared!\n")

def chat():
    print("\n")
    print("🤖 Personal Assistant Bot with Memory (Type 'bye' to exit, '/clear_chat_history' to reset)")

    # Load past history
    load_history()
    if len(chat_history) > 1:
        print(" ")

    while True:
        user_input = input("You: ").strip()

        # ---- Special command ----
        if user_input.lower() == "/clear_chat_history":
            clear_history()
            continue

        # ---- Rule-based replies ----
        if user_input.lower() in ["hello", "hi", "hey"]:
            reply = "Hello! How can I help you today? 🤗"
            print(f"Bot: {reply}\n")
            save_history(user_input, reply)
            chat_history.append({"role": "assistant", "content": reply})
            continue
        elif user_input.lower() in ["bye", "exit", "quit"]:
            reply = "Have a nice day! 👋"
            print(f"Bot: {reply}")
            save_history(user_input, reply)
            chat_history.append({"role": "assistant", "content": reply})
            break

        # ---- Add user message ----
        chat_history.append({"role": "user", "content": user_input})

        # ---- AI-powered reply with memory ----
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=chat_history,
            max_tokens=200
        )

        bot_reply = response.choices[0].message.content
        print(f"Bot: {bot_reply}\n")

        # ---- Save & update memory ----
        chat_history.append({"role": "assistant", "content": bot_reply})
        save_history(user_input, bot_reply)

if __name__ == "__main__":
    chat()
