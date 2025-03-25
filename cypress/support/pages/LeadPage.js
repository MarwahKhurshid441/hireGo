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

    // Test 4 (continued): Search by Inquiry ID
    searchByInquiryId() {
        cy.log('**Test 4 (continued): Searching by Inquiry ID**');

        // Get an Inquiry ID directly from the table
        cy.get('table tbody tr').first().then($row => {
            // Assuming Inquiry ID is in the second column (index 1)
            const inquiryIdCell = $row.find('td').eq(1);
            if (inquiryIdCell.length > 0) {
                const inquiryId = inquiryIdCell.text().trim();
                
                if (inquiryId) {
                    cy.log(`Using Inquiry ID from table: ${inquiryId}`);
                    
                    // Clear previous filters
                    cy.get('.search-filter input').clear();
                    LeadsPage.searchCustomer('');
                    
                    // Enter the inquiry ID
                    cy.get('.search-filter input').type(inquiryId);
                    cy.log('✓ Inquiry ID entered');
                    
                    cy.wait(1500);
                    
                    cy.log('Applying filters');
                    LeadsPage.applyFilters();
                    cy.wait(2000);
                    
                    // Verify results contain the inquiry ID
                    cy.contains(inquiryId, { timeout: 10000 }).should('be.visible')
                        .then(() => {
                            cy.log(`✓ Inquiry ID "${inquiryId}" found in results`);
                        });
                    
                    // Scroll to show results
                    cy.get('table').scrollIntoView({ duration: 1000 });
                    cy.wait(1000);
                }
            }
        });
    }
}

export default new LeadPage(); 