
from privacy_filter import PrivacyFilter

def test_privacy_filter():
    pf = PrivacyFilter()
    text = "My name is Shuvo, I live in Bangladesh, and my internet bill is 2000 BDT."
    print(f"Original: {text}")
    anonymized = pf.anonymize(text)
    print(f"Anonymized: {anonymized}")
    
    # Assertions
    assert "Shuvo" not in anonymized
    assert "Bangladesh" not in anonymized
    assert "2000 BDT" not in anonymized
    assert "[PERSON_" in anonymized
    assert "[LOC_" in anonymized
    assert "[AMOUNT_" in anonymized
    print("\nTest Passed!")

if __name__ == "__main__":
    test_privacy_filter()
