from crewai import Agent, LLM
import os
from dotenv import load_dotenv
from langchain_community.tools import DuckDuckGoSearchRun
from crewai.tools import tool

load_dotenv()

# Initialize LLM
llm = LLM(
    model="gemini/gemini-3-flash-preview",
    api_key=os.getenv("GOOGLE_API_KEY")
)


# Initialize Tools
ddg_search = DuckDuckGoSearchRun()

@tool("EncryptedResearcher")
def encrypted_researcher(location_token: str):
    """
    Research the web for internet providers in the given location token.
    This tool safely handles the location token locally.
    """
    # Local dictionary mapping (In a real app, this might be a secure lookup)
    # The agent ONLY sees [LOC_A], but we map it to a broad, safe region for search
    # ensures "Dhaka" never leaves, but "Bangladesh" (Country level) is used.
    safe_search_map = {
        "[LOC_A]": "Bangladesh"
    }
    
    search_loc = safe_search_map.get(location_token, "Bangladesh")
    query = f"Top Internet Providers in {search_loc}"
    return ddg_search.run(query)

@tool("AskVault")
def ask_vault(enc_val: str, enc_limit: str):
    """
    Asks the Vault to compare the Encrypted Value against the Encrypted Limit.
    Returns a Token.
    """
    return FHEVault.blind_compare(enc_val, enc_limit)

class ProjectAgents:
    def gatekeeper_agent(self):
        return Agent(
            role='The Gatekeeper',
            goal='Ensure no PII leaks into the cloud processing.',
            backstory="""You are the guardian of privacy. You receive raw user input 
            and must strictly ensure that personal details like names, locations, 
            and financial amounts are redacted or replaced before any further processing.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )

    def decision_maker_agent(self):
        return Agent(
            role='Senior Personal Proxy',
            goal='Analyze anonymized user requests and determine the "Contextual Urgency" and "Action Plan".',
            backstory="""You are a fiduciary agent.
            You do NOT know the user's money. You only know if the Vault gives you a "Success Token" or a "Failure Token".
            You deal with Encrypted Blobs (e.g., 0x...) and Tokens.
            Use the Vault to check limits blindly.""",
            llm=llm,
            verbose=False, # Reduced memory footprint as requested
            tools=[encrypted_researcher, ask_vault]
        )

    def global_negotiator_agent(self):
        return Agent(
            role='The Global Negotiator',
            goal='Draft a professional negotiation email using anonymous tokens.',
            backstory="""You are a world-class negotiator. 
            You NEVER see the real names. You only see [PERSON_1] and [LOC_A].
            You use the market data provided to draft a persuasive email to the ISP 
            asking for a better rate or a switch.""",
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
