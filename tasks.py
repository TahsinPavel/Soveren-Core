
from crewai import Task

class ProjectTasks:
    def decide_task(self, agent, anonymized_text, blob_bill, blob_limit):
        return Task(
            description=f"""
            Analyze the following request:
            Request: "{anonymized_text}"
            
            Zero-Knowledge Verification:
            - You have an Encrypted Bill Blob: {blob_bill}
            - You have an Encrypted Limit Blob: {blob_limit}
            
            Your Mission:
            1. Call the 'AskVault' tool to check if {blob_bill} is within {blob_limit}.
            2. The Vault will return a TOKEN. 
            3. If the Token indicates success (GRANTED), Approve.
            4. If the Token indicates failure (DENIED), Reject/Alert.
            
            Output strictly in the following format:
            
            Status: [Approved / Rejected]
            Vault Token: [The Token you received]
            Reasoning: [Explanation based on the Token]
            Next Step: [Specific action]
            """,
            agent=agent,
            expected_output="Status, Token, and Next Step report."
        )

    def market_research_task(self, agent, location_val):
        return Task(
            description=f"""
            Market Research for Internet Service Providers (ISPs).
            
            Context:
            - The user lives in [LOC_A]. (Actual Location: {location_val})
            
            Your Mission:
            1. Use the Search Tool to find the top 3 Internet Service Providers in {location_val}.
            2. Find their standard monthly pricing for home internet/fiber.
            
            Output Requirements:
            - A summary table of competitors (Provider, Speed, Price).
            - A general market analysis.
            """,
            agent=agent,
            expected_output="Competitor Table and Switch Recommendation."
        )

    def negotiation_task(self, agent, context_tasks):
        return Task(
            description=f"""
            Draft a Negotiation Email.
            
            Context:
            You have access to the outputs of the previous tasks (Vault Decision and Market Research).
            
            Constraint:
            - You are drafting this for [PERSON_1] living in [LOC_A].
            - DO NOT output real names. Keep the placeholders.
            
            Task:
            1. Check the Vault Token from the context.
            2. If 'DENIED', write a polite email to the user explaining why (Over Limit).
            3. If 'GRANTED', use the Market Research data to write a strong negotiation email to the ISP.
               - Subject: Inquiry regarding internet service for [LOC_A]
               - Body: Mention the competitor rates found. Ask for a match.
            
            Output: The final email text ONLY.
            """,
            agent=agent,
            context=context_tasks,
            expected_output="A professional negotiation email with placeholders."
        )
