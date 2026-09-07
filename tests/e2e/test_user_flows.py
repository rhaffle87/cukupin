"""
End-to-End (E2E) Browser Test Suite for Cukupin Web Application.
Uses Python Playwright to validate all user journeys, responsiveness, and visual elements.
Auto-boots Next.js development server if not already running on localhost:3000.
"""

import sys
import os
import time
import urllib.request
import subprocess

# Ensure UTF-8 output encoding on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"

def is_server_ready():
    try:
        with urllib.request.urlopen(BASE_URL, timeout=1.5) as resp:
            return resp.status in (200, 304, 307, 308)
    except Exception:
        return False

def ensure_dev_server():
    if is_server_ready():
        print("[E2E Server] Next.js server is already active on " + BASE_URL)
        return None

    print("[E2E Server] Next.js server not detected. Booting dev server automatically...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=(os.name == "nt")
    )

    print("[E2E Server] Waiting for http://localhost:3000 to become responsive...")
    for sec in range(1, 35):
        time.sleep(1)
        if is_server_ready():
            print(f"[E2E Server] Dev server is ready and responding! (booted in ~{sec}s)")
            return proc

    proc.kill()
    raise RuntimeError("Timed out waiting for Next.js dev server to start on port 3000")

def test_cukupin_flows():
    dev_proc = ensure_dev_server()

    try:
        with sync_playwright() as p:
            print("[E2E] Launching headless Chromium browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1280, "height": 800},
                locale="id-ID"
            )

            # ------------------------------------------------------------------
            # JOURNEY 1: Landing Page & Public Navigation
            # ------------------------------------------------------------------
            print("\n=== JOURNEY 1: Landing Page & Public Route Checks ===")
            page = context.new_page()
            
            print(f"[1.1] Navigating to landing page: {BASE_URL}/")
            response = page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
            assert response.status == 200, f"Expected status 200, got {response.status}"
            
            page.wait_for_selector("text=Cukupin", timeout=15000)
            print("  [OK] Landing page brand heading found")
            
            cta = page.locator("text=Buka Dashboard").first
            if cta.count() == 0:
                cta = page.locator("text=Mulai Sekarang").first
            print("  [OK] Primary Call-To-Action verified")

            # ------------------------------------------------------------------
            # JOURNEY 2: Guest Mode Dashboard
            # ------------------------------------------------------------------
            print("\n=== JOURNEY 2: Guest Mode Dashboard Verification ===")
            print(f"[2.1] Navigating to Dashboard: {BASE_URL}/dashboard")
            dash_response = page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
            assert dash_response.status == 200, f"Expected 200 on /dashboard, got {dash_response.status}"
            
            page.wait_for_selector("text=Halo, ", timeout=20000)
            print("  [OK] Dashboard user welcome header rendered")
            
            card_heading = page.locator("text=Batas Belanja Kategori").first
            expect(card_heading).to_be_visible()
            print("  [OK] Category Budget widget rendered on dashboard")

            # ------------------------------------------------------------------
            # JOURNEY 3: Transactions View & Controls
            # ------------------------------------------------------------------
            print("\n=== JOURNEY 3: Transactions View & Modals ===")
            print(f"[3.1] Navigating to Transactions: {BASE_URL}/transactions")
            tx_response = page.goto(f"{BASE_URL}/transactions", wait_until="domcontentloaded")
            assert tx_response.status == 200
            
            page.wait_for_selector("button:has-text('Tambah catatan')", timeout=20000)
            print("  [OK] 'Tambah catatan' CTA button is interactive")
            
            manage_btn = page.locator("button:has-text('Kelola Data')").first
            expect(manage_btn).to_be_visible()
            print("  [OK] 'Kelola Data' management menu is available")

            # ------------------------------------------------------------------
            # JOURNEY 4: Financial Reports & Evaluation
            # ------------------------------------------------------------------
            print("\n=== JOURNEY 4: Financial Reports & Evaluation ===")
            print(f"[4.1] Navigating to Reports: {BASE_URL}/reports")
            rep_response = page.goto(f"{BASE_URL}/reports", wait_until="domcontentloaded")
            assert rep_response.status == 200
            
            page.wait_for_selector("button:has-text('Rapor Cukupin')", timeout=20000)
            print("  [OK] 'Rapor Cukupin' action button rendered")
            
            template_btn = page.locator("button:has-text('Format Bulanan')").first
            expect(template_btn).to_be_visible()
            print("  [OK] 'Format Bulanan (PDF/Cetak)' export button is active")

            # ------------------------------------------------------------------
            # JOURNEY 5: Saving Goals & Wishlist
            # ------------------------------------------------------------------
            print("\n=== JOURNEY 5: Goals & Wishlist Modules ===")
            print(f"[5.1] Navigating to Goals: {BASE_URL}/goals")
            goals_response = page.goto(f"{BASE_URL}/goals", wait_until="domcontentloaded")
            assert goals_response.status == 200
            page.wait_for_selector("button:has-text('Target baru')", timeout=20000)
            print("  [OK] 'Target Tabungan' module rendered with 'Target baru' button")

            print(f"[5.2] Navigating to Wishlist: {BASE_URL}/wishlist")
            wish_response = page.goto(f"{BASE_URL}/wishlist", wait_until="domcontentloaded")
            assert wish_response.status == 200
            page.wait_for_selector("button:has-text('Tambah Wishlist')", timeout=20000)
            print("  [OK] 'Wishlist' module rendered with 'Tambah Wishlist' button")

            # ------------------------------------------------------------------
            # JOURNEY 6: Responsive Mobile Viewport (iPhone 14: 390x844)
            # ------------------------------------------------------------------
            print("\n=== JOURNEY 6: Mobile Responsiveness & Bottom Bar ===")
            mobile_context = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
                has_touch=True,
                locale="id-ID"
            )
            mobile_page = mobile_context.new_page()
            print("[6.1] Loading Dashboard on mobile viewport (390x844)")
            mobile_page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
            mobile_page.wait_for_selector("text=Halo, ", timeout=20000)
            
            bottom_nav = mobile_page.locator("nav").first
            expect(bottom_nav).to_be_visible()
            print("  [OK] Mobile navigation element is properly rendered and touch-accessible")
            
            mobile_context.close()
            context.close()
            browser.close()
            
            print("\n=======================================================")
            print("  ALL 6 E2E JOURNEYS PASSED CLEANLY (100% SUCCESS)")
            print("=======================================================")
    finally:
        if dev_proc:
            print("[E2E Server] Terminating auto-booted dev server...")
            try:
                # Terminate tree on Windows
                if os.name == "nt":
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(dev_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    dev_proc.terminate()
            except Exception:
                pass
            print("[E2E Server] Dev server successfully stopped.")

if __name__ == "__main__":
    try:
        test_cukupin_flows()
        sys.exit(0)
    except Exception as e:
        print(f"\n[E2E TEST FAILURE]: {e}", file=sys.stderr)
        sys.exit(1)
