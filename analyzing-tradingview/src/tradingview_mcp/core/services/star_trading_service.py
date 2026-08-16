"""
StarTrading Strategy Service — Implementation of the Erik Stolz / StarTrading Methodology.
Focused on REQX (Relative Equal Highs/Lows), Internal Liquidity Targets, and Negative RR.
"""
from __future__ import annotations
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, time
import pytz

def detect_reqx(df: pd.DataFrame, threshold_percent: float = 0.05) -> list[float]:
    """Detect Relative Equal Highs/Lows (REQX)."""
    highs = df['High'].tolist()
    lows = df['Low'].tolist()
    reqx_levels = []
    
    # Simple proximity check for equal highs
    for i in range(len(highs)-1):
        for j in range(i+1, len(highs)):
            diff = abs(highs[i] - highs[j]) / highs[i]
            if diff < threshold_percent:
                reqx_levels.append((highs[i] + highs[j]) / 2)
    
    # Simple proximity check for equal lows
    for i in range(len(lows)-1):
        for j in range(i+1, len(lows)):
            diff = abs(lows[i] - lows[j]) / lows[i]
            if diff < threshold_percent:
                reqx_levels.append((lows[i] + lows[j]) / 2)
                
    return sorted(list(set(reqx_levels)))

def find_fvgs(df: pd.DataFrame) -> list[dict]:
    """Find Fair Value Gaps (FVGs) in the provided dataframe."""
    fvgs = []
    for i in range(1, len(df)-1):
        # Bullish FVG
        if df['Low'].iloc[i+1] > df['High'].iloc[i-1]:
            fvgs.append({
                "type": "Bullish",
                "top": df['Low'].iloc[i+1],
                "bottom": df['High'].iloc[i-1],
                "time": df.index[i]
            })
        # Bearish FVG
        elif df['High'].iloc[i+1] < df['Low'].iloc[i-1]:
            fvgs.append({
                "type": "Bearish",
                "top": df['Low'].iloc[i-1],
                "bottom": df['High'].iloc[i+1],
                "time": df.index[i]
            })
    return fvgs

def get_star_trading_analysis(symbol: str) -> dict:
    """
    Advanced StarTrading Analysis:
    1. Daily Bias (Wicks/Close)
    2. 4H Liquidity & FVGs (Protection)
    3. 1H Entry & Internal REQX Targets
    4. 8 AM Execution Window Check
    """
    ticker = yf.Ticker(symbol)
    
    # 1. Daily Analysis (Bias)
    df_daily = ticker.history(period="10d", interval="1d")
    if df_daily.empty or len(df_daily) < 2:
        return {"error": "Insufficient daily data"}
    
    last_daily = df_daily.iloc[-1]
    prev_daily = df_daily.iloc[-2]
    
    # Check for long Daily wicks (rejections)
    upper_wick = last_daily['High'] - max(last_daily['Open'], last_daily['Close'])
    lower_wick = min(last_daily['Open'], last_daily['Close']) - last_daily['Low']
    body_size = abs(last_daily['Close'] - last_daily['Open'])
    
    daily_bias = "Neutral"
    if upper_wick > body_size * 1.5: daily_bias = "Bearish (Daily Rejection)"
    elif lower_wick > body_size * 1.5: daily_bias = "Bullish (Daily Rejection)"
    elif last_daily['Close'] > prev_daily['High']: daily_bias = "Bullish (Trend Expansion)"
    elif last_daily['Close'] < prev_daily['Low']: daily_bias = "Bearish (Trend Expansion)"

    # 2. 4H Analysis (Structure/FVGs)
    df_4h = ticker.history(period="1mo", interval="1h") # 4H proxy
    # Group to 4h
    df_4h = df_4h.resample('4H').agg({'Open': 'first', 'High': 'max', 'Low': 'min', 'Close': 'last'})
    fvgs_4h = find_fvgs(df_4h)
    
    # 3. 1H Analysis (Execution & REQX)
    df_1h = ticker.history(period="5d", interval="1h")
    reqx_levels = detect_reqx(df_1h)
    fvgs_1h = find_fvgs(df_1h)
    
    # 4. Entry Window Check (8:00 Local/Exchange Time)
    now = datetime.now()
    is_execution_window = 7 <= now.hour <= 9 # Around 8 AM
    
    current_price = df_1h['Close'].iloc[-1]
    
    # Identify Targets (Internal REQX)
    # Internal = levels between current price and recent major swing?
    internal_targets = [r for r in reqx_levels if abs(r - current_price) / current_price < 0.02]
    
    # Identify Protection (Nearest FVG)
    protection_fvg = None
    if daily_bias.startswith("Bullish"):
        bull_fvgs = [f for f in fvgs_4h if f['type'] == "Bullish" and f['bottom'] < current_price]
        if bull_fvgs: protection_fvg = bull_fvgs[-1] # Nearest below
    else:
        bear_fvgs = [f for f in fvgs_4h if f['type'] == "Bearish" and f['top'] > current_price]
        if bear_fvgs: protection_fvg = bear_fvgs[-1] # Nearest above

    # Setup Logic
    setup = "Neutral"
    if daily_bias.startswith("Bullish") and protection_fvg and internal_targets:
        if any(t > current_price for t in internal_targets):
            setup = "A+ Long (Daily Rejected + 4H FVG Protection + Internal REQX Target)"
    elif daily_bias.startswith("Bearish") and protection_fvg and internal_targets:
        if any(t < current_price for t in internal_targets):
            setup = "A+ Short (Daily Rejected + 4H FVG Protection + Internal REQX Target)"

    return {
        "symbol": symbol,
        "daily_bias": daily_bias,
        "current_price": round(current_price, 5),
        "execution_window_8am": "ACTIVE" if is_execution_window else "Inactive",
        "reqx_levels_detected": len(reqx_levels),
        "internal_reqx_targets": [round(t, 5) for t in internal_targets],
        "protection_points": {
            "type": protection_fvg['type'] if protection_fvg else "None",
            "fvg_top": round(protection_fvg['top'], 5) if protection_fvg else None,
            "fvg_bottom": round(protection_fvg['bottom'], 5) if protection_fvg else None
        },
        "star_trading_setup": setup,
        "trade_execution": {
            "risk": "3% Fixed",
            "entry": "Market @ 8 AM Killzone" if is_execution_window else "Wait for 8 AM Window",
            "take_profit": "Nearest Internal REQX",
            "stop_loss": "Behind 4H FVG protection point",
            "rr_profile": "Negative (Probability over Ratio)"
        },
        "coaching_note": "Target Internal REQX (Intraday efficiency). Don't aim for the absolute high/low (External)."
    }
