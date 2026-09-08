"""
Cukupin™ Publication-Grade Benchmark Chart Generator
Generates high-contrast, aesthetic visual plots representing empirical benchmark results.
Styled according to the "Quiet Ledger" design system palette:
- Canvas: #FAF9F5 (Warm Paper)
- Primary Ink: #1E3249 (Navy Slate)
- Accent Success: #2B7966 (Forest Mint)
- Accent Warning/Critical: #D96B43 (Coral Rust)
- Grid & Borders: #DFDCD2 (Muted Line)
"""

import json
import os
import matplotlib.pyplot as plt
import numpy as np

# Load benchmark results
benchmark_file = os.path.join(os.path.dirname(__file__), 'benchmark_results.json')
with open(benchmark_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Output directories
public_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'benchmarks')
artifact_dir = r"C:\Users\Rafli Alif\.gemini\antigravity-ide\brain\b3111edb-9043-49d4-b5f5-e95d9632b7ff"
os.makedirs(public_dir, exist_ok=True)

# Styling configurations
plt.rcParams['font.sans-serif'] = ['Inter', 'DejaVu Sans', 'Arial']
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.edgecolor'] = '#DFDCD2'
plt.rcParams['axes.linewidth'] = 1.0
plt.rcParams['figure.facecolor'] = '#FAF9F5'
plt.rcParams['axes.facecolor'] = '#FFFFFF'

# ==============================================================================
# CHART 1: Payload Scaling (Unpaginated vs Paginated)
# ==============================================================================
def generate_payload_scaling_chart():
    ps = data['payloadScaling']
    counts = [item['count'] for item in ps]
    unpaginated_kb = [item['unpaginatedRawKB'] for item in ps]
    paginated_kb = [item['paginatedRawKB'] for item in ps]
    savings = [item['savingsPercentage'] for item in ps]

    fig, ax1 = plt.subplots(figsize=(9, 5), dpi=200)

    # Line 1: Unpaginated
    ax1.plot(counts, unpaginated_kb, color='#D96B43', marker='o', linewidth=2.5, label='Unpaginated (Full Table Scan)')
    # Line 2: Paginated
    ax1.plot(counts, paginated_kb, color='#2B7966', marker='s', linewidth=2.5, label='Cukupin™ Paginated (Limit: 25)')

    ax1.set_xlabel('Total Transactions in Database', fontsize=11, fontweight='bold', color='#1E3249')
    ax1.set_ylabel('Query Payload Size (KB)', fontsize=11, fontweight='bold', color='#1E3249')
    ax1.tick_params(colors='#1E3249', labelsize=10)
    ax1.grid(True, linestyle='--', alpha=0.5, color='#DFDCD2')

    # Annotate savings at 2,500 transactions
    ax1.annotate('99% Bandwidth Saved!\n(741 KB vs 7.3 KB)',
                 xy=(2500, 7.35), xytext=(1500, 300),
                 arrowprops=dict(facecolor='#2B7966', shrink=0.08, width=1.5, headwidth=7),
                 fontsize=10, fontweight='bold', color='#2B7966',
                 bbox=dict(boxstyle='round,pad=0.4', facecolor='#EBF5F0', edgecolor='#2B7966', alpha=0.9))

    plt.title('Cukupin™ Payload Scaling: Unpaginated vs Paginated', fontsize=13, fontweight='bold', color='#1E3249', pad=15)
    ax1.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#DFDCD2', fontsize=10)

    plt.tight_layout()
    for out in [public_dir, artifact_dir]:
        plt.savefig(os.path.join(out, 'benchmark_payload_scaling.png'), dpi=200)
    plt.close()
    print("[OK] Saved benchmark_payload_scaling.png")

# ==============================================================================
# CHART 2: Monthly Database Egress vs 5 GB Supabase Free Tier Ceiling
# ==============================================================================
def generate_egress_comparison_chart():
    scenarios = data['egressScenarios']
    names = [s['name'] for s in scenarios]
    unpaginated_gb = [s['unpaginatedGB'] for s in scenarios]
    paginated_gb = [s['paginatedGB'] for s in scenarios]

    x = np.arange(len(names))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=200)

    # Bars
    bars1 = ax.bar(x - width/2, unpaginated_gb, width, label='Unpaginated Queries', color='#D96B43', alpha=0.9, edgecolor='#B54E28')
    bars2 = ax.bar(x + width/2, paginated_gb, width, label='Cukupin™ Paginated Queries', color='#2B7966', alpha=0.9, edgecolor='#1E5A4C')

    # Red dashed quota ceiling line at 5.0 GB
    ax.axhline(y=5.0, color='#C53030', linestyle='--', linewidth=2, label='Supabase Free Tier Ceiling (5.0 GB)')

    ax.set_ylabel('Monthly Database Egress (GB)', fontsize=11, fontweight='bold', color='#1E3249')
    ax.set_title('Monthly Database Egress Simulation Across User Scales (Supabase 5 GB Quota)', fontsize=13, fontweight='bold', color='#1E3249', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels([f"{s['name']}\n({s['users']} users)" for s in scenarios], fontsize=9.5, fontweight='medium', color='#1E3249')
    ax.tick_params(colors='#1E3249', labelsize=10)
    ax.grid(axis='y', linestyle='--', alpha=0.5, color='#DFDCD2')

    # Add text labels on top of bars
    for bar in bars1:
        yval = bar.get_height()
        if yval > 0.05:
            ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.3, f"{yval:.1f} GB", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#D96B43')

    for bar in bars2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.3, f"{yval:.2f} GB", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#2B7966')

    # Quota breach annotation
    ax.annotate('QUOTA BREACH!\n143% of 5GB Ceiling',
                 xy=(3 - width/2, 7.18), xytext=(2.2, 12),
                 arrowprops=dict(facecolor='#C53030', shrink=0.08, width=1.5, headwidth=6),
                 fontsize=9.5, fontweight='bold', color='#C53030',
                 bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFF5F5', edgecolor='#C53030', alpha=0.9))

    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#DFDCD2', fontsize=9.5, loc='upper left')
    ax.set_ylim(0, 24)

    plt.tight_layout()
    for out in [public_dir, artifact_dir]:
        plt.savefig(os.path.join(out, 'benchmark_egress_comparison.png'), dpi=200)
    plt.close()
    print("[OK] Saved benchmark_egress_comparison.png")

# ==============================================================================
# CHART 3: Vercel 10-Second Serverless Execution Latency Breakdown
# ==============================================================================
def generate_latency_breakdown_chart():
    benchmarks = data['timeoutBenchmarks']
    operations = [b['operation'] for b in benchmarks][::-1]
    durations = [b['durationMs'] for b in benchmarks][::-1]
    colors = ['#2B7966', '#2B7966', '#2B7966', '#2B7966', '#2B7966']

    fig, ax = plt.subplots(figsize=(9, 4.5), dpi=200)

    y_pos = np.arange(len(operations))
    bars = ax.barh(y_pos, durations, height=0.55, color=colors, alpha=0.85, edgecolor='#1E5A4C')

    # 10,000ms limit line (represented on log or note)
    ax.set_xscale('log')
    ax.set_xlim(0.01, 20000)

    ax.axvline(x=10000, color='#C53030', linestyle='--', linewidth=2, label='Vercel 10-Second Timeout Cap (10,000 ms)')

    ax.set_yticks(y_pos)
    ax.set_yticklabels(operations, fontsize=10, fontweight='medium', color='#1E3249')
    ax.set_xlabel('Execution Duration in Milliseconds (Logarithmic Scale)', fontsize=10, fontweight='bold', color='#1E3249')
    ax.set_title('Operation Latency vs Vercel Hobby 10-Second Ceiling', fontsize=12, fontweight='bold', color='#1E3249', pad=15)
    ax.grid(axis='x', linestyle='--', alpha=0.5, color='#DFDCD2')

    # Add label values
    for i, bar in enumerate(bars):
        val = durations[i]
        label = f"{val} ms" if val > 0 else "0 ms (Client DOM)"
        ax.text(max(val * 1.3, 0.05), bar.get_y() + bar.get_height()/2.0, label, ha='left', va='center', fontsize=9, fontweight='bold', color='#1E3249')

    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#DFDCD2', fontsize=9.5, loc='lower right')

    plt.tight_layout()
    for out in [public_dir, artifact_dir]:
        plt.savefig(os.path.join(out, 'benchmark_latency_breakdown.png'), dpi=200)
    plt.close()
    print("[OK] Saved benchmark_latency_breakdown.png")

if __name__ == '__main__':
    generate_payload_scaling_chart()
    generate_egress_comparison_chart()
    generate_latency_breakdown_chart()
    print("All benchmark visual graphs generated successfully!")
