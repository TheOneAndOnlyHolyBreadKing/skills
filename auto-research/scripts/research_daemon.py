import subprocess
import time
import argparse
import sys
import os
import signal

def run_experiment(target, duration):
    print(f"Starting experiment on {target} for {duration} seconds...")
    
    # Start the process
    process = subprocess.Popen([sys.executable, target])
    
    start_time = time.time()
    try:
        # Wait for the duration or until the process finishes
        while time.time() - start_time < duration:
            if process.poll() is not None:
                # Process finished early
                break
            time.sleep(1)
        
        if process.poll() is None:
            print(f"Time limit reached ({duration}s). Terminating process...")
            # On Windows, taskkill is more reliable for sub-processes
            if os.name == 'nt':
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(process.pid)])
            else:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            
    except Exception as e:
        print(f"Error during experiment: {e}")
    finally:
        process.wait()
        print(f"Experiment on {target} finished.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Research Daemon for fixed-time experiments.")
    parser.add_argument("--target", required=True, help="The python script to run.")
    parser.add_argument("--time", type=int, default=300, help="Duration in seconds (default: 300).")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.target):
        print(f"Error: Target file {args.target} not found.")
        sys.exit(1)
        
    run_experiment(args.target, args.time)
