def intake_agent(user_input):
    print("\n[INTAKE AGENT] Processing request...")

    text = user_input.lower()

    if "wifi" in text:
        intent = "wifi_issue"
        priority = "medium"
        confidence = 0.85
    elif "vpn" in text:
        intent = "vpn_issue"
        priority = "high"
        confidence = 0.9
    elif "password" in text or "login" in text:
        intent = "password_reset"
        priority = "high"
        confidence = 0.88
    else:
        intent = "unknown"
        priority = "low"
        confidence = 0.45

    return {
        "user_input": user_input,
        "intent": intent,
        "priority": priority,
        "confidence": confidence
    }