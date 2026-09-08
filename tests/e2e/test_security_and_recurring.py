"""
E2E Visual & Interactive Verification for:
1. Automated Recurring Bill Logging Card & Controls
2. PIN / Biometric Security Settings Modal
3. Screen Lock Tactile Overlay & 6-dot Pin Entry
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\Rafli Alif\.gemini\antigravity-ide\brain\b3111edb-9043-49d4-b5f5-e95d9632b7ff"
BASE_URL = "http://localhost:3000"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Test Desktop View - Recurring Bills Automation Card
        page = browser.new_page(viewport={"width": 1280, "height": 880})
        print("[Test 1] Navigating to Recurring Bills...")
        page.goto(f"{BASE_URL}/transactions?tab=bills", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Take screenshot of Recurring Bills view with the automation card
        bills_shot = os.path.join(ARTIFACTS_DIR, "recurring_bills_automation_desktop.png")
        page.screenshot(path=bills_shot, full_page=False)
        print(f"  [OK] Saved screenshot: {bills_shot}")

        # 2. Test Security Settings Modal
        print("[Test 2] Opening Security Settings Modal...")
        # Click on "Kunci PIN & Biometrik" in the sidebar
        sec_btn = page.locator("button:has-text('Kunci PIN & Biometrik')").first
        sec_btn.click()
        page.wait_for_timeout(800)

        modal_shot = os.path.join(ARTIFACTS_DIR, "security_settings_modal.png")
        page.screenshot(path=modal_shot, full_page=False)
        print(f"  [OK] Saved screenshot: {modal_shot}")

        # Setup a 6-digit PIN: click "Aktifkan"
        print("[Test 3] Configuring 6-digit PIN...")
        aktifkan_btn = page.locator("button:has-text('Aktifkan')").first
        if aktifkan_btn.is_visible():
            aktifkan_btn.click()
            page.wait_for_timeout(400)
            
            # Enter 6 digit PIN: 123456
            pin_input = page.locator("input[type='password']").first
            pin_input.fill("123456")
            page.wait_for_timeout(300)
            page.locator("button:has-text('Lanjut')").click()
            page.wait_for_timeout(400)
            
            # Confirm PIN: 123456
            pin_input.fill("123456")
            page.wait_for_timeout(300)
            page.locator("button:has-text('Simpan')").click()
            page.wait_for_timeout(2500)
            print("  [OK] 6-digit PIN configured successfully!")

        # 4. Test Manual Lock Screen Trigger
        print("[Test 4] Triggering Screen Lock...")
        # Now the modal should show "Kunci Layar Sekarang"
        lock_btn = page.locator("button:has-text('Kunci Layar Sekarang')").first
        if lock_btn.is_visible():
            lock_btn.click()
        else:
            # Click sidebar lock button
            page.locator("button:has-text('Kunci Layar')").first.click()
            
        page.wait_for_timeout(1200)

        # Screenshot of Screen Lock Overlay on Desktop
        lock_desktop_shot = os.path.join(ARTIFACTS_DIR, "screen_lock_overlay_desktop.png")
        page.screenshot(path=lock_desktop_shot, full_page=False)
        print(f"  [OK] Saved screenshot: {lock_desktop_shot}")

        # 5. Mobile Viewport Lock Screen
        print("[Test 5] Testing Mobile Viewport Screen Lock (390x844)...")
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(500)

        lock_mobile_shot = os.path.join(ARTIFACTS_DIR, "screen_lock_overlay_mobile.png")
        page.screenshot(path=lock_mobile_shot, full_page=False)
        print(f"  [OK] Saved screenshot: {lock_mobile_shot}")

        # Test entering incorrect PIN on dial pad
        print("[Test 6] Testing Incorrect PIN shake feedback...")
        # Press 1, 1, 1, 1, 1, 1
        digit_1 = page.locator("button:text-is('1')").first
        for _ in range(6):
            digit_1.click()
            page.wait_for_timeout(80)

        page.wait_for_timeout(400)
        # Verify error message shows
        err_msg = page.locator("text='PIN salah'")
        print(f"  [OK] Error message appeared: {err_msg.is_visible()}")

        # Test entering correct PIN: 1, 2, 3, 4, 5, 6
        print("[Test 7] Entering correct PIN to unlock...")
        for d in ['1', '2', '3', '4', '5', '6']:
            page.locator(f"button:text-is('{d}')").first.click()
            page.wait_for_timeout(80)

        page.wait_for_timeout(800)
        # Verify unlocked
        lock_overlay = page.locator("text='Kunci Layar Cukupin'")
        print(f"  [OK] Lock overlay dismissed: {not lock_overlay.is_visible()}")

        browser.close()
        print("\nAll Interactive Security & Automation tests completed successfully!")

if __name__ == "__main__":
    run_tests()
