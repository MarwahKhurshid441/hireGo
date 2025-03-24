class LoginPage {
    elements = {
        emailInput: () => cy.get('input[type="email"]'),
        passwordInput: () => cy.get('input[type="password"]'),
        loginButton: () => cy.get('button[type="submit"]'),
        // 2FA elements
        code1Input: () => cy.get('input[name="code1"]'),
        code2Input: () => cy.get('input[name="code2"]'),
        code3Input: () => cy.get('input[name="code3"]'),
        code4Input: () => cy.get('input[name="code4"]'),
        verifyButton: () => cy.get('button[type="submit"]').contains('Verify & Login')
    }

    login(email, password) {
        this.elements.emailInput().type(email);
        this.elements.passwordInput().type(password);
        this.elements.loginButton().click();
        
        // Wait for 2FA form and handle it
        this.handle2FA();
    }

    handle2FA() {
        // Wait for the 2FA form to be visible
        cy.contains('Enter Verification Code').should('be.visible');

        // Get the 2FA code from the development mode notice
        cy.get('.dev-mode-notice')
            .invoke('text')
            .then((text) => {
                // Extract the code using regex
                const code = text.match(/\d{4}/)[0];
                
                // Type each digit into respective input
                this.elements.code1Input().type(code[0]);
                this.elements.code2Input().type(code[1]);
                this.elements.code3Input().type(code[2]);
                this.elements.code4Input().type(code[3]);
                
                // Click verify button once it's enabled
                this.elements.verifyButton()
                    .should('not.be.disabled')
                    .click();
            });

        // Wait for successful verification and redirect
        cy.url().should('include', '/dashboard');
    }
}

export default new LoginPage(); 