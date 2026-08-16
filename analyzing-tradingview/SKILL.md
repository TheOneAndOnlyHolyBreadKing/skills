---
name: analyzing-tradingview
description: Provides advanced market analysis using TradingView indicators, Yahoo Finance data, Reddit sentiment, and backtesting strategies. Use for stock/crypto screening, technical analysis, and strategy verification.
---

# Analyzing TradingView

This skill provides institutional-grade trading intelligence by combining technical indicators, real-time market data, and social sentiment.

## When to use this skill
- Analyzes stocks, crypto, ETFs, or forex pairs.
- Screens markets for specific patterns (Bollinger Squeeze, Top Gainers).
- Runs backtests on various strategies (RSI, Supertrend, MACD).
- Gathers market sentiment from Reddit and financial news.
- Performs **StarTrading SMC Analysis** (Liquidity Sweeps, FVGs, and Negative RR profiles).
- Generates "Combined Analysis" confluence reports.

## Workflow
1.  **Identify Asset**: Select the symbol (e.g., AAPL, BTC-USD) and exchange (e.g., NASDAQ, KUCOIN).
2.  **Select Tool**: Use the appropriate CLI command via `uv run python scripts/analyze.py`.
3.  **Choose Strategy Model**: Standard (indicators) or **StarTrading (SMC/Negative RR)**.
4.  **Synthesize**: Combine technical signals with sentiment for a high-confidence recommendation.

## Instructions

### 1. Market Snapshot
Get a global overview of indices, crypto, and FX.
`uv run python scripts/analyze.py snapshot`

### 2. Technical Analysis
Deep dive into a specific symbol.
`uv run python scripts/analyze.py analyze <symbol> --exchange <exchange> --timeframe <tf>`
*Example:* `uv run python scripts/analyze.py analyze BTCUSDT --exchange BINANCE --timeframe 1h`

### 3. Backtesting
Verify a strategy's performance.
`uv run python scripts/analyze.py backtest <symbol> <strategy> --period <period>`
*Strategies:* `rsi`, `bollinger`, `macd`, `ema_cross`, `supertrend`, `donchian`

### 4. StarTrading SMC Analysis
High-winrate analysis based on Erik Stolz's methodology (REQX, 4H Protection, 8AM Killzone).
`uv run python scripts/analyze.py startrading <symbol>`
`uv run python scripts/analyze.py scan_favorites` (Scans your custom watchlist)
*Note:* Primary strategy for high-probability setups using Internal Liquidity targets and Negative RR.
*Example:* `uv run python scripts/analyze.py startrading EURUSD=X`

### 5. Sentiment & News
Check Reddit and live news.
`uv run python scripts/analyze.py sentiment <symbol>`
`uv run python scripts/analyze.py news <symbol>`

### 5. Multi-Agent Debate
Run a 3-agent debate (Technical, Sentiment, Risk) for a final decision.
`uv run python scripts/analyze.py debate <symbol> --exchange <exchange>`

### 6. Combined Analysis (Confluence)
Power tool for unified technical + sentiment analysis.
`uv run python scripts/analyze.py combined <symbol> --exchange <exchange>`

## Directory Structure
- `src/`: Core logic and service modules.
- `scripts/analyze.py`: Main CLI entry point.
- `src/tradingview_mcp/coinlist/`: List of supported symbols per exchange.

## Resources
- [tradingview-mcp Repo](https://github.com/atilaahmettaner/tradingview-mcp)
- [scripts/analyze.py](scripts/analyze.py)
