
import os
import json
import re
from dotenv import load_dotenv
from crewai import Crew, Process
from agents import ProjectAgents
from tasks import ProjectTasks
from privacy_filter import PrivacyFilter
from vault_service import FHEVault

# Load environment variables
load_dotenv()

def main():
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not found in .env file.")
        return

    # Load User Profile
    with open('user_profile.json', 'r') as f:
        user_profile = json.load(f)

    # 1. Get Input
    user_input = os.getenv("TEST_INPUT", "My name is Shuvo, I live in Bangladesh, and my internet bill is 2000 BDT.")
    print(f"Processing Input: {user_input}\n")

    # 2. Local Privacy Filter (PII Redaction)
    pf = PrivacyFilter()
    clean_text = pf.anonymize(user_input)
    print(f"--- [Privacy Layer] Anonymized Input: ---\n{clean_text}\n-----------------------------------------")

    # 3. Extract Logic Values for Encryption
    pmap = pf.get_map()
    amount_val = "0"
    location_val = "Bangladesh"
    
    for original, placeholder in pmap.items():
        if placeholder == "[AMOUNT_1]":
            # Extract digits [0-9.]
            nums = re.findall(r'\d+', original)
            if nums:
                amount_val = nums[0]
            else:
                amount_val = 0
        elif placeholder == "[LOC_A]":
            location_val = original
            
    # 4. The Encryption Layer (Zero-Knowledge Setup)
    # The Client (main.py) encrypts the data before giving it to the Agent.
    limit_val = user_profile.get('spend_limit', 5000)
    
    blob_bill = FHEVault.encrypt(amount_val)
    blob_limit = FHEVault.encrypt(limit_val)
    
    print(f"--- [FHE Vault Layer] ---\nEncrypting Bill ({amount_val}) -> {blob_bill}\nEncrypting Limit ({limit_val}) -> {blob_limit}\nGiving BLIND blobs to Agent.\n-------------------------")
            
    # 5. Agentic Core
    agents = ProjectAgents()
    tasks = ProjectTasks()

    decision_maker = agents.decision_maker_agent()
    # Negotiator Agent
    negotiator = agents.global_negotiator_agent()
    
    # Task 1: Blind Decision (Zero Knowledge)
    task1_decision = tasks.decide_task(decision_maker, clean_text, blob_bill, blob_limit)
    
    # Task 2: Market Research (Agent sees [LOC_A], tool handles it secure locally)
    # Passing "[LOC_A]" so agent doesn't see "Bangladesh" or "Dhaka"
    task2_research = tasks.market_research_task(decision_maker, "[LOC_A]")
    
    # Task 3: Negotiation
    # Needs context from previous tasks.
    task3_negotiation = tasks.negotiation_task(negotiator, [task1_decision, task2_research])

    crew = Crew(
        agents=[decision_maker, negotiator],
        tasks=[task1_decision, task2_research, task3_negotiation],
        verbose=True,
        process=Process.sequential
    )

    result = crew.kickoff()
    
    # 6. Client-Side Re-Assembler
    # Swap placeholders back to real values
    final_email = str(result)
    final_email = final_email.replace("[PERSON_1]", "Shuvo")
    final_email = final_email.replace("[LOC_A]", "Dhaka")
    
    print("\n\n########################")
    print("## Final Re-Assembled Email ##")
    print("########################\n")
    print(final_email)

if __name__ == "__main__":
    main()
