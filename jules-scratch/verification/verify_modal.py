
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8788")
    page.fill("#url-input", "https://www.google.com")
    page.click("button[type=submit]")
    page.click("#show-debug-btn")
    page.wait_for_selector("#debug-modal")
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
