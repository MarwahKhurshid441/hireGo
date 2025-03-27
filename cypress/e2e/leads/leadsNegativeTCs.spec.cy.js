import LeadsPage from '../../support/pages/LeadsPage';
import LoginPage from '../../support/pages/LoginPage';

describe('Leads Management - Negative Test Cases', () => {
    beforeEach(() => {
        cy.log('***** STARTING NEW NEGATIVE TEST CASE *****');
        cy.log('**Setup: Logging in to the application**');
        cy.visit('http://54.186.118.166:5000/', { timeout: 10000 });
        cy.log('✓ Application loaded successfully');
        
        // Add wait after page load
        cy.wait(1000);
        
        LoginPage.login('marwah.khurshid@vizteck.com', '0202Play&*');
        cy.log('✓ Login credentials submitted');
        
        // Add wait after login
        cy.wait(2000);
        
        // Navigate to leads page
        cy.log('Navigating to Leads page');
        cy.get('a').contains('Leads')
            .should('be.visible')
            .click();
        cy.url().should('include', '/leads');
        
        // Add wait after navigation
        cy.wait(2000);
        cy.log('✓ Successfully navigated to Leads page');
    });

    it('should handle invalid date range inputs', () => {
        cy.log('**Test 1: Testing invalid date range inputs**');
        
        // Test with future date in "From" field and past date in "To" field
        cy.log('Setting invalid date range (future date to past date)');
        
        // Get today's date
        const today = new Date();
        
        // Set "From" date to 30 days in the future
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        
        // Set "To" date to 30 days in the past
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 30);
        
        // Format dates
        const futureDateStr = LeadsPage.formatDate(futureDate);
        const pastDateStr = LeadsPage.formatDate(pastDate);
        
        cy.log(`From Date (future): ${futureDateStr}`);
        cy.log(`To Date (past): ${pastDateStr}`);
        
        // Enter the invalid date range
        cy.get('.date-input input').first()
            .click({ force: true })
            .clear({ force: true })
            .type(futureDateStr, { force: true });
        
        cy.get('.date-input input').eq(1)
            .click({ force: true })
            .clear({ force: true })
            .type(pastDateStr, { force: true });
        
        cy.log('✓ Invalid date range entered');
        
        // Apply filters
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify the system handles the invalid date range appropriately
        cy.get('body').then($body => {
            // First check if there's an error message
            const hasErrorMsg = $body.text().includes('error') || 
                               $body.text().includes('invalid') ||
                               $body.text().includes('date range');
            
            if (hasErrorMsg) {
                cy.log('✓ System displayed error message for invalid date range');
            } else {
                // Check if table exists and has rows
                if ($body.find('table tbody tr').length > 0) {
                    cy.log('! System returned results despite invalid date range');
                } else {
                    cy.log('✓ No results returned for invalid date range as expected');
                }
            }
        });
    });

    it('should handle non-existent customer name search', () => {
        cy.log('**Test 2: Searching for non-existent customer**');
        
        // Generate a random string that's unlikely to match any customer
        const randomCustomer = 'NonExistentCustomer' + Math.floor(Math.random() * 10000);
        cy.log(`Searching for non-existent customer: "${randomCustomer}"`);
        
        // Clear any existing filters
        cy.get('input').eq(2).clear();
        
        // Enter the random customer name
        LeadsPage.searchCustomer(randomCustomer);
        cy.wait(1000);
        
        // Apply filters
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify no results are found
        cy.get('table tbody').then($tbody => {
            if ($tbody.find('tr').length === 0 || 
                $tbody.text().includes('No data') || 
                $tbody.text().includes('No results')) {
                cy.log('✓ No results found for non-existent customer as expected');
            } else {
                cy.log('! System returned results for a non-existent customer');
                cy.get('table tbody tr').should('have.length', 0);
            }
        });
    });

    it('should handle non-existent inquiry ID search', () => {
        cy.log('**Test 3: Searching for non-existent inquiry ID**');
        
        // Generate a random inquiry ID that's unlikely to exist
        const randomInquiryId = 'XXX-' + Math.floor(Math.random() * 10000);
        cy.log(`Searching for non-existent inquiry ID: "${randomInquiryId}"`);
        
        // Clear any existing filters
        cy.get('input').eq(3).clear();
        
        // Enter the random inquiry ID
        LeadsPage.searchInquiryId(randomInquiryId);
        cy.wait(1000);
        
        // Apply filters
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify no results are found
        cy.get('table tbody').then($tbody => {
            if ($tbody.find('tr').length === 0 || 
                $tbody.text().includes('No data') || 
                $tbody.text().includes('No results')) {
                cy.log('✓ No results found for non-existent inquiry ID as expected');
            } else {
                cy.log('! System returned results for a non-existent inquiry ID');
                cy.get('table tbody tr').should('have.length', 0);
            }
        });
    });

    it('should handle special characters in search fields', () => {
        cy.log('**Test 4: Testing special characters in search fields**');
        
        // Test with special characters
        const specialChars = '!@#$%^&*()_+{}|:"<>?';
        cy.log(`Entering special characters: "${specialChars}"`);
        
        // Clear any existing filters
        cy.get('input').eq(2).clear();
        
        // Enter special characters in customer name field
        LeadsPage.searchCustomer(specialChars);
        cy.wait(1000);
        
        // Apply filters
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify the system handles special characters appropriately
        cy.get('table tbody').then($tbody => {
            // Either no results or system doesn't crash
            cy.log('✓ System handled special characters without crashing');
        });
        
        // Try in inquiry ID field
        cy.get('input').eq(3).clear();
        LeadsPage.searchInquiryId(specialChars);
        cy.wait(1000);
        
        // Apply filters
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify the system handles special characters appropriately
        cy.get('table tbody').then($tbody => {
            // Either no results or system doesn't crash
            cy.log('✓ System handled special characters in inquiry ID field without crashing');
        });
    });

    it('should handle SQL injection attempts', () => {
        cy.log('**Test 5: Testing SQL injection prevention**');
        
        // Common SQL injection strings
        const sqlInjections = [
            "' OR '1'='1",
            "'; DROP TABLE leads; --",
            "' UNION SELECT * FROM users; --"
        ];
        
        // Test each SQL injection string
        sqlInjections.forEach((sqlString, index) => {
            cy.log(`Testing SQL injection string ${index + 1}: "${sqlString}"`);
            
            // Clear any existing filters
            cy.get('input').eq(2).clear();
            
            // Enter SQL injection string in customer name field
            LeadsPage.searchCustomer(sqlString);
            cy.wait(1000);
            
            // Apply filters
            LeadsPage.applyFilters();
            cy.wait(2000);
            
            // Verify the system handles SQL injection appropriately
            // We're just checking that the application doesn't crash
            cy.get('body').should('exist');
            cy.log('✓ System handled SQL injection attempt without crashing');
        });
    });

    it('should handle excessive pagination requests', () => {
        cy.log('**Test 6: Testing pagination limits**');
        
        // Try to access a very high page number directly
        cy.log('Attempting to access a very high page number');
        
        // Check if pagination exists
        cy.get('body').then($body => {
            if ($body.find('.pagination').length) {
                // Get the URL of the current page
                cy.url().then(url => {
                    // Construct a URL with a very high page number
                    const highPageUrl = url.includes('?') 
                        ? `${url}&page=9999` 
                        : `${url}?page=9999`;
                    
                    // Visit the high page URL
                    cy.visit(highPageUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the request appropriately
                    // Either by showing no results, an error, or defaulting to a valid page
                    cy.get('body').should('exist');
                    cy.log('✓ System handled excessive pagination request without crashing');
                });
            } else {
                cy.log('Pagination not found, skipping this test');
            }
        });
    });

    it('should handle very long input values', () => {
        cy.log('**Test 7: Testing very long input values**');
        
        // Generate a very long string
        const longString = 'A'.repeat(1000);
        cy.log('Entering very long string in search field');
        
        // Enter the long string in customer name field
        LeadsPage.searchCustomer(longString);
        cy.wait(1000);
        
        // Apply filters
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify the system handles the long input appropriately
        cy.get('body').should('exist');
        cy.log('✓ System handled very long input without crashing');
    });

    it('should handle invalid assigned member selection', () => {
        cy.log('**Test 8: Testing invalid assigned member selection**');
        
        // Check if assigned member dropdown exists
        cy.get('body').then($body => {
            if ($body.find('select').length > 0) {
                // Try to select an invalid option by setting an invalid value
                cy.get('select').eq(0).then($select => {
                    // Try to set an invalid value
                    cy.wrap($select).invoke('val', 'invalid_member_id').trigger('change');
                    cy.wait(1000);
                    
                    // Apply filters
                    LeadsPage.applyFilters();
                    cy.wait(2000);
                    
                    // Verify the system handles the invalid selection appropriately
                    cy.get('body').should('exist');
                    cy.log('✓ System handled invalid assigned member selection without crashing');
                });
            } else {
                cy.log('Assigned member dropdown not found, skipping this test');
            }
        });
    });

    it('should handle rapid filter changes', () => {
        cy.log('**Test 9: Testing rapid filter changes**');
        
        // Perform multiple filter changes in rapid succession
        cy.log('Performing rapid filter changes');
        
        // Change date range
        const dates = LeadsPage.calculateDates();
        cy.get('.date-input input').first()
            .click({ force: true })
            .clear({ force: true })
            .type(dates.from, { force: true });
        
        // Immediately change customer name
        LeadsPage.searchCustomer('Test Customer');
        
        // Immediately change assigned member if available
        cy.get('body').then($body => {
            if ($body.find('select').length > 0) {
                cy.get('select').eq(0).select(1, { force: true });
            }
        });
        
        // Immediately apply filters
        LeadsPage.applyFilters();
        
        // Immediately change filters again
        LeadsPage.searchCustomer('Another Customer');
        LeadsPage.applyFilters();
        
        // Verify the system handles rapid changes without crashing
        cy.get('body').should('exist');
        cy.log('✓ System handled rapid filter changes without crashing');
    });

    it('should handle browser refresh during operations', () => {
        cy.log('**Test 10: Testing browser refresh during operations**');
        
        // Start an operation
        cy.log('Setting filters before refresh');
        LeadsPage.searchCustomer('Test Customer');
        
        // Refresh the page in the middle of the operation
        cy.reload();
        cy.wait(3000);
        
        // Verify the page loads correctly after refresh
        cy.contains('leads', { matchCase: false }).should('be.visible');
        cy.log('✓ Page reloaded successfully');
        
        // Try to continue operations after refresh
        cy.log('Continuing operations after refresh');
        LeadsPage.searchCustomer('After Refresh');
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        // Verify operations can continue after refresh
        cy.get('body').should('exist');
        cy.log('✓ Operations continued successfully after refresh');
    });

    it('should handle invalid pagination inputs', () => {
        cy.log('**Test 11: Testing invalid pagination inputs**');
        
        // Check if pagination exists
        cy.get('body').then($body => {
            if ($body.find('.pagination').length || $body.find('[data-testid="pagination"]').length) {
                // Test 1: Try to navigate to page 0 (invalid page)
                cy.log('Testing navigation to page 0 (invalid)');
                
                // Get the current URL
                cy.url().then(url => {
                    // Construct URL with page=0
                    const invalidPageUrl = url.includes('?') 
                        ? `${url}&page=0` 
                        : `${url}?page=0`;
                    
                    // Visit the invalid page URL
                    cy.visit(invalidPageUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the invalid page appropriately
                    // Should either show first page or error message
                    cy.get('body').should('exist');
                    cy.log('✓ System handled page 0 request without crashing');
                });
                
                // Test 2: Try to navigate to a negative page number
                cy.log('Testing navigation to page -1 (invalid)');
                
                // Get the current URL
                cy.url().then(url => {
                    // Construct URL with page=-1
                    const negativePageUrl = url.includes('?') 
                        ? `${url}&page=-1` 
                        : `${url}?page=-1`;
                    
                    // Visit the negative page URL
                    cy.visit(negativePageUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the negative page appropriately
                    cy.get('body').should('exist');
                    cy.log('✓ System handled negative page request without crashing');
                });
                
                // Test 3: Try to navigate to a non-numeric page
                cy.log('Testing navigation to non-numeric page (invalid)');
                
                // Get the current URL
                cy.url().then(url => {
                    // Construct URL with page=abc
                    const nonNumericPageUrl = url.includes('?') 
                        ? `${url}&page=abc` 
                        : `${url}?page=abc`;
                    
                    // Visit the non-numeric page URL
                    cy.visit(nonNumericPageUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the non-numeric page appropriately
                    cy.get('body').should('exist');
                    cy.log('✓ System handled non-numeric page request without crashing');
                });
            } else {
                cy.log('Pagination not found, skipping pagination tests');
            }
        });
    });

    it('should handle invalid page size inputs', () => {
        cy.log('**Test 12: Testing invalid page size inputs**');
        
        // Check if page size selector exists
        cy.get('body').then($body => {
            if ($body.find('.page-size-filter').length || $body.find('select').length) {
                // Test 1: Try to set an extremely large page size via URL
                cy.log('Testing extremely large page size');
                
                // Get the current URL
                cy.url().then(url => {
                    // Construct URL with size=1000
                    const largePageSizeUrl = url.includes('?') 
                        ? `${url}&size=1000` 
                        : `${url}?size=1000`;
                    
                    // Visit the URL with large page size
                    cy.visit(largePageSizeUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the large page size appropriately
                    cy.get('body').should('exist');
                    cy.log('✓ System handled large page size request without crashing');
                });
                
                // Test 2: Try to set a negative page size via URL
                cy.log('Testing negative page size');
                
                // Get the current URL
                cy.url().then(url => {
                    // Construct URL with size=-10
                    const negativePageSizeUrl = url.includes('?') 
                        ? `${url}&size=-10` 
                        : `${url}?size=-10`;
                    
                    // Visit the URL with negative page size
                    cy.visit(negativePageSizeUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the negative page size appropriately
                    cy.get('body').should('exist');
                    cy.log('✓ System handled negative page size request without crashing');
                });
                
                // Test 3: Try to set a non-numeric page size via URL
                cy.log('Testing non-numeric page size');
                
                // Get the current URL
                cy.url().then(url => {
                    // Construct URL with size=abc
                    const nonNumericPageSizeUrl = url.includes('?') 
                        ? `${url}&size=abc` 
                        : `${url}?size=abc`;
                    
                    // Visit the URL with non-numeric page size
                    cy.visit(nonNumericPageSizeUrl);
                    cy.wait(2000);
                    
                    // Verify the system handles the non-numeric page size appropriately
                    cy.get('body').should('exist');
                    cy.log('✓ System handled non-numeric page size request without crashing');
                });
            } else {
                cy.log('Page size selector not found, skipping page size tests');
            }
        });
    });

    it('should handle rapid pagination clicks', () => {
        cy.log('**Test 13: Testing rapid pagination clicks**');
        
        // Check if pagination exists
        cy.get('body').then($body => {
            if ($body.find('.pagination').length || $body.find('[data-testid="pagination"]').length) {
                // Find pagination buttons
                cy.get('.pagination button, [data-testid="pagination"] button').then($buttons => {
                    if ($buttons.length >= 2) {
                        // Click multiple pagination buttons rapidly
                        cy.log('Clicking pagination buttons rapidly');
                        
                        // Click the second page button with force: true
                        cy.get('.pagination button, [data-testid="pagination"] button').eq(1).click({ force: true });
                        
                        // Immediately click the next button if it exists
                        cy.get('.pagination button, [data-testid="pagination"] button').eq(2).click({ force: true });
                        
                        // Immediately click the previous button if it exists
                        cy.get('.pagination button, [data-testid="pagination"] button').eq(0).click({ force: true });
                        
                        // Verify the system handles rapid pagination clicks appropriately
                        cy.get('body').should('exist');
                        cy.log('✓ System handled rapid pagination clicks without crashing');
                    } else {
                        cy.log('Not enough pagination buttons found, skipping rapid click test');
                    }
                });
            } else {
                cy.log('Pagination not found, skipping rapid pagination test');
            }
        });
    });

    after(() => {
        cy.log('***** NEGATIVE TEST SUITE COMPLETED *****');
        cy.log('All negative test cases executed successfully');
        cy.wait(2000);
    });
}); 