# backend/rules.py
"""
Simple rule-based response module for the hybrid chatbot.
Return a string response when a rule matches, otherwise return None
so the caller can forward the message to the AI engine.
"""

import re
from typing import Optional, List, Tuple, Pattern

# list of (compiled_regex_pattern, response_text)
_RULES: List[Tuple[Pattern, str]] = [
    # Greetings
    (re.compile(r'\b(hi|hello|hey|yo|good morning|good afternoon|good evening)\b', re.I),
     "Hello! How can I help you today?"),

    # Farewells
    (re.compile(r'\b(bye|goodbye|see you|see ya|talk later|take care)\b', re.I),
     "Goodbye! Have a great day!"),

    # Thanks / appreciation
    (re.compile(r'\b(thanks|thank you|thx|much appreciated)\b', re.I),
     "You're welcome! 😊"),

    # Asking for help / capabilities
    (re.compile(r'\b(help|assist|support|what can you do|what are your capabilities)\b', re.I),
     ("I'm a personal assistant bot. I can answer general questions, help with small tasks, "
      "and guide you. Try asking me anything or say 'give me an example'.")),

    # Identity / bot name
    (re.compile(r'\b(who (are|r) you|what is your name|your name)\b', re.I),
     "I'm your personal assistant bot. You can call me Furhi Bot."),

    # Very short empty / unclear messages
    (re.compile(r'^\s*$'), "Please type something so I can help."),
]

def get_rule_response(message: str) -> Optional[str]:
    """
    Check rules in order and return the first matching response.
    If no rule matches, return None.
    """
    if message is None:
        return None

    # quick normalize - keep original text for regex (regex is case-insensitive)
    text = message.strip()
    # check rules in order (put specific rules earlier)
    for pattern, response in _RULES:
        if pattern.search(text):
            return response
    return None


# Quick manual test when running this file directly
if __name__ == "__main__":
    tests = [
        "Hi",
        "hello there",
        "Can you help me?",
        "thank you so much",
        "bye!",
        "",
        "What is your name?"
    ]
    for t in tests:
        print(f"> {t!r} -> {get_rule_response(t)!r}")
