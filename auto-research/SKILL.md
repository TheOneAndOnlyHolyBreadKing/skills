---
name: auto-research
description: Performs autonomous optimization of code and logic within other skills using a fixed-budget experimentation loop. Use when the user wants to self-improve, optimize, or benchmark scripts.
---

# Auto Research (Generalized Optimizer)

This skill implements the "Karpathy Autoresearch" pattern: autonomous, fixed-time experimentation to optimize a specific metric.

## When to use this skill
- When you want to optimize a Python script's performance or accuracy.
- When you want to "train" or improve another skill's logic.
- When you need to run dozens of experiments overnight to find the best configuration.

## Core Workflow

1.  **Scan & Sync**: Always perform a deep scan of the target repository and relevant skills. Verify existing logic, recent logs, and current script state to ensure you are building on the latest "Champion" version.
2.  **Define the Baseline**: Identify the target file (the "Research Lab") and the success metric (the "Loss").
3.  **The Lab Instructions**: Consult `resources/program.md` (Research Org Code). This file tells you *how* to experiment.
4.  **Experiment Loop**:
    *   **Modify**: Edit the target script based on your hypothesis.
    *   **Run**: Use `scripts/research_daemon.py` to execute the script for a fixed duration (e.g., 5 mins).
    *   **Evaluate**: Compare the results. 
    *   **Update**: If improved, keep the changes. If not, revert.
5.  **Log**: Update `research_logs.md` with every run's parameters and results.

## Instructions

### 1. Contextual Awareness
Before starting any research iteration, you MUST scan the repository. This includes reading `research_logs.md` and the current state of the target script. You cannot assume previous state; you must verify it.

### 2. The Fixed-Budget Rule
All experiments MUST run for a fixed wall-clock time. This ensures that:
- Structural changes (e.g., smaller models vs larger models) are compared fairly.
- The agent finds the most optimal code for the specific hardware/environment within that time limit.

### 2. The "Loss" Metric
Always define a clear, numerical metric to minimize (loss, latency, bits-per-byte) or maximize (accuracy, throughput). 

### 3. The "Researcher" Role
When this skill is active, you are an **Autonomous Research Org**. You act as the PI (Principal Investigator) and the Lab Tech. You have full permission to:
- Overwrite existing code in the target script.
- Install new dependencies if they are likely to improve the result.
- Run multiple iterations without stopping for permission.

## Tools & Commands
- `python scripts/research_daemon.py --target <script.py> --time 300`: Runs the target script for exactly 300 seconds (5 mins).
- `agent-browser`: Use to research new techniques or libraries to inject into the experiments.

## Best Practices
- **Single File Focus**: The research should target one file at a time to keep diffs manageable.
- **Auto-Commit**: If a run is successful, immediately update the "champion" version of the file.
- **Log Everything**: Even failed experiments are data. Log the hypothesis, the change, and the result.

## Resources
- `resources/program.md` — The default instructions for the autonomous agent.
- `scripts/research_daemon.py` — The execution engine.
