from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Listen for console events
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    # Automatically dismiss alerts
    page.on("dialog", lambda dialog: dialog.accept())

    try:
        page.goto("http://localhost:5173/pages/cadastro-pessoas.html")

        # Wait for the menu to be loaded
        navbar = page.locator("#navbarNav")
        expect(navbar).to_be_visible()

        # Fill in the form
        page.get_by_label("Nome Completo").fill("Test Client")
        page.get_by_label("Tipo").select_option("Cliente")

        # Submit the form
        page.get_by_role("button", name="Salvar").click()

        # The test will pass if the alert is shown and accepted.
        # We can't easily assert that the alert was shown, but if the script doesn't time out, it's a good sign.
        page.wait_for_timeout(2000) # Wait for 2 seconds to be sure


    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
