// Custom command to wait for table loading
Cypress.Commands.add('waitForTable', () => {
    cy.get('table').should('be.visible');
    // Add any additional waiting conditions if there's a loading indicator
});

// Custom command to verify sorting
Cypress.Commands.add('verifySorting', (columnHeader, order = 'asc') => {
    cy.get(`th:contains("${columnHeader}")`).click();
    // Add verification logic for sorting order
}); 