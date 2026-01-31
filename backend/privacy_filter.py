
import re

class PrivacyFilter:
    """
    A specific privacy filter that detects Names, Locations, and Amounts
    using regex and heuristic patterns to replacing them with placeholders.
    """
    
    def __init__(self):
        self.counters = {
            "PERSON": 1,
            "LOC": 1,
            "AMOUNT": 1
        }
        self.map = {}

    def _get_placeholder(self, original_text, p_type):
        if original_text in self.map:
            return self.map[original_text]
        
        # Create new placeholder
        if p_type == "PERSON":
            ph = f"[PERSON_{self.counters['PERSON']}]"
            self.counters['PERSON'] += 1
        elif p_type == "LOC":
            ph = f"[LOC_{chr(64 + self.counters['LOC'])}]" # LOC_A, LOC_B...
            self.counters['LOC'] += 1
        elif p_type == "AMOUNT":
            ph = f"[AMOUNT_{self.counters['AMOUNT']}]"
            self.counters['AMOUNT'] += 1
        else:
            ph = "[REDACTED]"
            
        self.map[original_text] = ph
        return ph

    def anonymize(self, text):
        """
        Scrub PII from text.
        """
        cleaned_text = text

        # 1. Amounts (e.g., 2000 BDT, $500, 100 USD)
        # Regex: Number followed by optional space and common currency tickers or standard symbols
        amount_pattern = r'\b\d+(?:,\d{3})*(?:\.\d+)?\s?(?:BDT|USD|EUR|GBP|tk|taka|\$|€|£)\b'
        
        def replace_amount(match):
            return self._get_placeholder(match.group(0), "AMOUNT")
            
        cleaned_text = re.sub(amount_pattern, replace_amount, cleaned_text, flags=re.IGNORECASE)

        # 2. Locations (Contextual: "live in X", "from X")
        # Regex lookbehind for context. Matches Capitalized words after "in" or "from"
        loc_pattern = r'(?<=\blive in\s)([A-Z][a-z]+(?: [A-Z][a-z]+)*)|(?<=\bfrom\s)([A-Z][a-z]+(?: [A-Z][a-z]+)*)'
        
        def replace_loc(match):
            # match.group(0) might be empty if we have capturing groups?
            # group(1) or group(2) will have the value
            val = match.group(1) or match.group(2)
            if val:
                return self._get_placeholder(val, "LOC")
            return match.group(0)

        cleaned_text = re.sub(loc_pattern, replace_loc, cleaned_text)

        # 3. Names (Contextual: "name is X", "I am X")
        # Regex: Capitalized words after "name is" or "I am"
        name_pattern = r'(?<=\bname is\s)([A-Z][a-z]+(?: [A-Z][a-z]+)*)|(?<=\bI am\s)([A-Z][a-z]+(?: [A-Z][a-z]+)*)'
        
        def replace_name(match):
            val = match.group(1) or match.group(2)
            if val:
                return self._get_placeholder(val, "PERSON")
            return match.group(0)
            
        cleaned_text = re.sub(name_pattern, replace_name, cleaned_text)

        # 4. Fallback for general Capitalized words that might be names (middle of sentence)
        # This is risky as it might catch common nouns, but requested "Names"
        # We can implement a stricter version if needed. 
        # For now, let's stick to the specific context given in the example: "My name is Shuvo"
        
        return cleaned_text

    def get_map(self):
        """Returns the dictionary of redacted values for logic processing."""
        return self.map

