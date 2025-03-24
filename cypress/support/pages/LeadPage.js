import LoginPage from './LoginPage';

class LeadPage {
    // ... other code remains the same ...

    // Validations
    validateTableHeaders() {
        const expectedHeaders = [
            'ID', 'Customer Name', 'Created Date', 'Pickup', 'PAX',
            'Pickup Time', 'Return Time', 'Trip Type', 'Distance',
            'Assigned Member', 'Trip Quote', 'Customer Estimate',
            'Supplier Estimate', 'Supplier Factor Rate', 'Nearby Cities',
            'Actions'
        ];
        
        return cy.get('table thead tr th')
            .should('have.length.at.least', 1)
            .then($headers => {
                // Get all header texts and log them for debugging
                const actualHeaders = Array.from($headers).map(el => 
                    el.textContent.trim()
                );
                
                cy.log('Actual Headers:', actualHeaders.join(', '));
                cy.log('Expected Headers:', expectedHeaders.join(', '));

                // Find the scrollable container and scroll horizontally
                cy.get('table')
                    .parent()
                    .scrollIntoView({ duration: 2000 })
                    .then($container => {
                        // Force scroll to the end using JavaScript
                        cy.wrap($container)
                            .scrollTo('100%', 0, { ensureScrollable: false });
                    });

                // Case-insensitive comparison with flexible matching
                expectedHeaders.forEach(expectedHeader => {
                    const headerExists = actualHeaders.some(actualHeader => {
                        const actual = actualHeader.toLowerCase().trim();
                        const expected = expectedHeader.toLowerCase().trim();
                        return actual === expected || actual.includes(expected);
                    });
                    
                    // After scrolling, verify the header exists
                    expect(headerExists, `Header "${expectedHeader}" should exist`).to.be.true;
                });
            });
    }
}

export default new LeadPage(); 