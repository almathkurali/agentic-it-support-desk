# ===============================
# PLACEHOLDER UX
# ===============================
# NOTE: This is a temporary command-line interface.
# Final UI/UX will be built separately.

from agents.orchestrator import orchestrator

def get_user_input():
    return input("Describe your IT issue: ")

if __name__ == "__main__":
    user_input = get_user_input()
    output = orchestrator(user_input)

    print("\n=== FINAL OUTPUT ===")
    print(output)