#!/usr/bin/env python3
import sys
import json
import argparse
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from tradingview_mcp.core.services.yahoo_finance_service import get_price, get_market_snapshot
from tradingview_mcp.core.services.backtest_service import run_backtest, compare_strategies, walk_forward_backtest
from tradingview_mcp.core.services.sentiment_service import analyze_sentiment
from tradingview_mcp.core.services.news_service import fetch_news_summary
from tradingview_mcp.core.services.screener_service import (
    analyze_coin,
    fetch_trending_analysis,
    fetch_bollinger_analysis,
    run_multi_timeframe_analysis
)
from tradingview_mcp.core.services.multi_agent_service import run_multi_agent_analysis
from tradingview_mcp.core.services.star_trading_service import get_star_trading_analysis
from tradingview_mcp.core.services.scanner_service import volume_breakout_scan

def main():
    parser = argparse.ArgumentParser(description="TradingView Intelligence CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Snapshot
    subparsers.add_parser("snapshot", help="Global market snapshot")

    # Price
    price_parser = subparsers.add_parser("price", help="Get real-time price")
    price_parser.add_argument("symbol", help="Ticker symbol (e.g. AAPL, BTC-USD)")

    # Analyze
    analyze_parser = subparsers.add_parser("analyze", help="Detailed technical analysis")
    analyze_parser.add_argument("symbol", help="Ticker symbol")
    analyze_parser.add_argument("--exchange", default="KUCOIN", help="Exchange name")
    analyze_parser.add_argument("--timeframe", default="15m", help="Timeframe (5m, 15m, 1h, 4h, 1D)")

    # Backtest
    bt_parser = subparsers.add_parser("backtest", help="Run strategy backtest")
    bt_parser.add_argument("symbol", help="Ticker symbol")
    bt_parser.add_argument("strategy", choices=["rsi", "bollinger", "macd", "ema_cross", "supertrend", "donchian"])
    bt_parser.add_argument("--period", default="1y", help="Period (1mo, 6mo, 1y, 2y)")
    bt_parser.add_argument("--interval", default="1d", help="Interval (1d, 1h)")

    # Sentiment
    sent_parser = subparsers.add_parser("sentiment", help="Social sentiment analysis")
    sent_parser.add_argument("symbol", help="Ticker symbol")
    sent_parser.add_argument("--category", default="all", choices=["stocks", "crypto", "all"])

    # News
    news_parser = subparsers.add_parser("news", help="Financial news summary")
    news_parser.add_argument("symbol", help="Ticker symbol")
    news_parser.add_argument("--limit", type=int, default=5)

    # Debate
    debate_parser = subparsers.add_parser("debate", help="Multi-agent debate analysis")
    debate_parser.add_argument("symbol", help="Ticker symbol")
    debate_parser.add_argument("--exchange", default="KUCOIN")

    # Combined
    comb_parser = subparsers.add_parser("combined", help="Technical + Sentiment confluence")
    comb_parser.add_argument("symbol", help="Ticker symbol")
    comb_parser.add_argument("--exchange", default="NASDAQ")

    # StarTrading
    star_parser = subparsers.add_parser("startrading", help="StarTrading Negative RR SMC analysis")
    star_parser.add_argument("symbol", help="Ticker symbol (Yahoo symbol, e.g. EURUSD=X)")

    # Favorites
    subparsers.add_parser("scan_favorites", help="Scan all favorite pairs for StarTrading setups")

    # Screeners
    top_parser = subparsers.add_parser("top", help="Top gainers/losers")
    top_parser.add_argument("type", choices=["gainers", "losers"])
    top_parser.add_argument("--exchange", default="KUCOIN")
    top_parser.add_argument("--limit", type=int, default=10)

    args = parser.parse_args()

    try:
        if args.command == "snapshot":
            print(json.dumps(get_market_snapshot(), indent=2))
        elif args.command == "price":
            print(json.dumps(get_price(args.symbol), indent=2))
        elif args.command == "analyze":
            print(json.dumps(analyze_coin(args.symbol, args.exchange, args.timeframe), indent=2))
        elif args.command == "backtest":
            print(json.dumps(run_backtest(args.symbol, args.strategy, args.period, interval=args.interval), indent=2))
        elif args.command == "sentiment":
            print(json.dumps(analyze_sentiment(args.symbol, args.category), indent=2))
        elif args.command == "news":
            print(json.dumps(fetch_news_summary(args.symbol, limit=args.limit), indent=2))
        elif args.command == "debate":
            full_symbol = args.symbol.upper() if ":" in args.symbol else f"{args.exchange.upper()}:{args.symbol.upper()}"
            print(json.dumps(run_multi_agent_analysis(full_symbol, args.exchange), indent=2))
        elif args.command == "combined":
            # Simple combined implementation
            tech = analyze_coin(args.symbol, args.exchange, timeframe="1h")
            sent = analyze_sentiment(args.symbol)
            news = fetch_news_summary(args.symbol, limit=3)
            print(json.dumps({
                "symbol": args.symbol,
                "technical": tech,
                "sentiment": sent,
                "news": news
            }, indent=2))
        elif args.command == "startrading":
            print(json.dumps(get_star_trading_analysis(args.symbol), indent=2))
        elif args.command == "scan_favorites":
            fav_path = os.path.join(os.path.dirname(__file__), "..", "resources", "favorites.json")
            if not os.path.exists(fav_path):
                print(json.dumps({"error": "Favorites file not found"}))
            else:
                with open(fav_path, "r") as f:
                    favorites = json.load(f)
                results = []
                for sym in favorites:
                    try:
                        results.append(get_star_trading_analysis(sym))
                    except Exception as e:
                        results.append({"symbol": sym, "error": str(e)})
                print(json.dumps(results, indent=2))
        elif args.command == "top":
            rows = fetch_trending_analysis(args.exchange, limit=args.limit)
            if args.type == "losers":
                rows.sort(key=lambda x: x["changePercent"])
            print(json.dumps(rows[:args.limit], indent=2))
        else:
            parser.print_help()
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
