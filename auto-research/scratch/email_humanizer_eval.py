import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

"""
Email Humanizer Evaluation Harness
===================================
Scores email text on how "human" it sounds using the following criteria:

1. Sentence Length Burstiness (0-10): Measures variance in sentence length.
   Higher variance = more human-sounding cadence.
2. AI-Tell Word Avoidance (0-10): Penalizes usage of known AI-flagged words
   like "delve", "leverage", "furthermore", "moreover", "tapestry", etc.
3. Contraction Usage (0-10): Rewards natural contractions (don't, it's, we're).
4. Transition Variety (0-10): Penalizes overuse of robotic transitions like
   "Additionally", "Furthermore", "Moreover", "In conclusion".
5. Structural Naturalness (0-10): Checks for sentence fragment usage, 
   rhetorical questions, and varied paragraph lengths.
6. Vocabulary Naturalness (0-10): Penalizes over-reliance on "elevated" 
   adjectives that AI tends to cluster (magnificent, extraordinary, etc.)

Final Score = average of all 6 axes (0-10).
"""

import re
import statistics
import sys
import json


# --- Known AI-Tell Words (heavily penalized) ---
AI_TELL_WORDS = [
    "delve", "leverage", "foster", "unlock", "tapestry", "testament",
    "furthermore", "moreover", "in today's fast-paced world", "robust",
    "meticulous", "elevate", "utilize", "facilitate", "synergy",
    "paradigm", "holistic", "seamless", "innovative", "cutting-edge",
    "navigate", "landscape", "realm", "pivotal", "crucial",
    "it is important to note", "it's worth noting",
]

# --- Overused AI Adjectives ---
AI_ADJECTIVES = [
    "magnificent", "extraordinary", "exceptional", "remarkable",
    "phenomenal", "outstanding", "unparalleled", "exemplary",
    "distinguished", "illustrious", "groundbreaking", "transformative",
    "revolutionary", "state-of-the-art", "world-class", "premier",
    "exquisite", "impeccable", "unmatched", "stellar",
]

# --- Robotic Transitions ---
ROBOTIC_TRANSITIONS = [
    "additionally", "furthermore", "moreover", "in conclusion",
    "in summary", "it is worth noting", "it should be noted",
    "with that being said", "having said that", "that being said",
    "in light of", "on the other hand", "as such", "to that end",
    "notwithstanding", "consequently", "subsequently",
]

# --- Contractions that signal human writing ---
HUMAN_CONTRACTIONS = [
    "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't",
    "couldn't", "can't", "isn't", "aren't", "wasn't", "weren't",
    "it's", "that's", "there's", "here's", "what's", "who's",
    "we're", "they're", "you're", "I'm", "he's", "she's",
    "we've", "they've", "you've", "I've", "we'll", "they'll",
    "you'll", "I'll", "he'll", "she'll", "let's",
]


def split_sentences(text):
    """Split text into sentences (rough heuristic)."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s for s in sentences if len(s.strip()) > 0]


def score_burstiness(text):
    """Score 0-10 based on variance in sentence length (word count)."""
    sentences = split_sentences(text)
    if len(sentences) < 3:
        return 5.0  # Not enough data

    lengths = [len(s.split()) for s in sentences]
    mean_len = statistics.mean(lengths)
    if mean_len == 0:
        return 0.0

    stdev = statistics.stdev(lengths)
    cv = stdev / mean_len  # Coefficient of variation

    # Human writing typically has CV of 0.4-0.8
    # AI writing typically has CV of 0.1-0.3
    if cv >= 0.6:
        return 10.0
    elif cv >= 0.5:
        return 9.0
    elif cv >= 0.4:
        return 8.0
    elif cv >= 0.3:
        return 6.0
    elif cv >= 0.2:
        return 4.0
    else:
        return 2.0


def score_ai_tell_avoidance(text):
    """Score 0-10, penalizing AI-tell words. Fewer = better."""
    text_lower = text.lower()
    count = 0
    for word in AI_TELL_WORDS:
        count += text_lower.count(word)

    # 0 occurrences = 10, each occurrence -1.5 points, floor at 0
    score = max(0.0, 10.0 - (count * 1.5))
    return score


def score_contraction_usage(text):
    """Score 0-10 based on whether contractions are used naturally."""
    text_lower = text.lower()
    total_words = len(text.split())
    if total_words == 0:
        return 0.0

    contraction_count = 0
    for contraction in HUMAN_CONTRACTIONS:
        contraction_count += text_lower.count(contraction)

    # Good human writing has ~1-3 contractions per 100 words
    ratio = (contraction_count / total_words) * 100

    if 1.0 <= ratio <= 4.0:
        return 10.0
    elif 0.5 <= ratio < 1.0 or 4.0 < ratio <= 5.0:
        return 7.0
    elif 0.1 <= ratio < 0.5:
        return 4.0
    elif ratio == 0:
        return 1.0  # No contractions at all = very robotic
    else:
        return 5.0


def score_transition_variety(text):
    """Score 0-10, penalizing overuse of robotic transitions."""
    text_lower = text.lower()
    count = 0
    for transition in ROBOTIC_TRANSITIONS:
        count += text_lower.count(transition)

    score = max(0.0, 10.0 - (count * 2.0))
    return score


def score_structural_naturalness(text):
    """Score 0-10 based on structural variety."""
    sentences = split_sentences(text)
    score = 5.0  # baseline

    # Check for rhetorical questions
    questions = [s for s in sentences if s.strip().endswith('?')]
    if len(questions) >= 1:
        score += 1.5

    # Check for sentence fragments (sentences under 5 words)
    fragments = [s for s in sentences if len(s.split()) <= 4]
    if 0 < len(fragments) <= 3:
        score += 1.5

    # Check paragraph length variety
    paragraphs = [p for p in text.split('\n\n') if p.strip()]
    if len(paragraphs) >= 2:
        para_lengths = [len(p.split()) for p in paragraphs]
        if len(para_lengths) >= 2:
            para_cv = statistics.stdev(para_lengths) / max(statistics.mean(para_lengths), 1)
            if para_cv >= 0.3:
                score += 2.0

    return min(10.0, score)


def score_vocabulary_naturalness(text):
    """Score 0-10, penalizing over-reliance on AI-typical elevated adjectives."""
    text_lower = text.lower()
    count = 0
    for adj in AI_ADJECTIVES:
        count += text_lower.count(adj)

    # Allow 1-2 before penalizing; they're fine in moderation
    if count <= 1:
        return 10.0
    elif count == 2:
        return 8.0
    elif count == 3:
        return 6.0
    elif count == 4:
        return 4.0
    else:
        return max(0.0, 10.0 - (count * 1.5))


def evaluate_email(text):
    """Return a dict of all scores + composite."""
    scores = {
        "burstiness": score_burstiness(text),
        "ai_tell_avoidance": score_ai_tell_avoidance(text),
        "contraction_usage": score_contraction_usage(text),
        "transition_variety": score_transition_variety(text),
        "structural_naturalness": score_structural_naturalness(text),
        "vocabulary_naturalness": score_vocabulary_naturalness(text),
    }
    scores["composite"] = round(statistics.mean(scores.values()), 2)
    return scores


# --- Sample test emails to benchmark the SKILL ---

BASELINE_EMAIL = """Dear Mr. Thompson,

Good day. I hope this message finds you well.

I am delighted to reach out to you regarding the extraordinary opportunity we have identified for your organization. At Micro Rocket IT, we are thrilled to present a magnificent solution that will leverage our cutting-edge technology stack to elevate your digital presence to unprecedented heights.

Furthermore, our team has meticulously crafted a robust framework that seamlessly integrates with your existing infrastructure. Additionally, this innovative approach will foster a holistic transformation of your operational landscape.

Moreover, it is important to note that our exceptional track record speaks volumes about the quality of service we deliver. We are confident that this transformative partnership will yield remarkable results.

In conclusion, I would be delighted to schedule a meeting at your earliest convenience to discuss this further.

Sincerely,
Sandugan Bullard
Micro Rocket IT
"""


def main():
    print("=" * 60)
    print("EMAIL HUMANIZER EVALUATION")
    print("=" * 60)

    # If a file path is provided, read that; otherwise use baseline
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            email_text = f.read()
        print(f"\nEvaluating: {sys.argv[1]}")
    else:
        email_text = BASELINE_EMAIL
        print("\nEvaluating: BASELINE (built-in sample)")

    print("-" * 60)
    scores = evaluate_email(email_text)

    for key, value in scores.items():
        label = key.replace("_", " ").title()
        bar = "█" * int(value) + "░" * (10 - int(value))
        print(f"  {label:.<30} {bar} {value:.1f}/10")

    print("-" * 60)
    print(f"  {'COMPOSITE SCORE':.<30} {'█' * int(scores['composite'])}{'░' * (10 - int(scores['composite']))} {scores['composite']:.2f}/10")
    print("=" * 60)

    # Output JSON for programmatic use
    print(f"\n[JSON] {json.dumps(scores)}")
    return scores


if __name__ == "__main__":
    main()
