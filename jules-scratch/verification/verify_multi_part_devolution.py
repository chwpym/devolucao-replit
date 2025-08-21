from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # 1. Arrange: Add a client first
        page.goto("http://localhost:5173/pages/cadastro-pessoas.html")
        page.get_by_label("Nome Completo").fill("Test Client")
        page.get_by_label("Tipo").select_option("Cliente")
        page.get_by_role("button", name="Salvar").click()
        # Don't wait for the alert, just give it a moment to process
        page.wait_for_timeout(2000)

        # 2. Arrange: Go to the devolution registration page.
        page.goto("http://localhost:5173/pages/cadastro.html")

        # Wait for the menu to be loaded
        navbar = page.locator("#navbarNav")
        expect(navbar).to_be_visible()

        # 3. Act: Add a second part
        page.get_by_role("button", name="Adicionar Peça").click()

        # Fill in details for the first part
        part1 = page.locator('.part-row[data-part-index="0"]')
        part1.get_by_label("Código da Peça").fill("PART-001")
        part1.get_by_label("Quantidade").fill("1")
        part1.get_by_label("Descrição da Peça").fill("Part 1 Description")

        # Fill in details for the second part
        part2 = page.locator('.part-row[data-part-index="1"]')
        part2.get_by_label("Código da Peça").fill("PART-002")
        part2.get_by_label("Quantidade").fill("2")
        part2.get_by_label("Descrição da Peça").fill("Part 2 Description")

        # Fill in common details
        page.get_by_label("Cliente").select_option("Test Client")
        page.get_by_label("Requisição de Venda").fill("REQ-123")
        page.get_by_label("Ação na Requisição").select_option("Alterada")
        page.get_by_label("Data da Venda").fill("2023-01-01")
        page.get_by_label("Data da Devolução").fill("2023-01-02")

        # 4. Act: Submit the form
        page.get_by_role("button", name="Salvar Devolução").click()

        # 5. Assert: Wait for the success message
        success_alert = page.locator('.alert-success')
        expect(success_alert).to_be_visible()
        expect(success_alert).to_contain_text("Devolução registrada com sucesso!")

        # 6. Screenshot: Capture the final result for visual verification.
        page.screenshot(path="jules-scratch/verification/multi_part_verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
