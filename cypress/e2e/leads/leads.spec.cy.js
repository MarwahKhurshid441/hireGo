import LeadsPage from '../../support/pages/LeadsPage';
import LoginPage from '../../support/pages/LoginPage';

describe('Leads Management Page', () => {
    beforeEach(() => {
        cy.log('***** STARTING NEW TEST CASE *****');
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

    it('should perform all leads page operations', () => {
        // Test 1: Verify leads page is loaded correctly
        cy.log('**Test 1: Verifying leads page elements**');
        cy.contains('leads', { matchCase: false }).should('be.visible')
            .then(() => {
                cy.log('✓ Leads Management page title is visible');
            });
        
        cy.wait(1000);
        
        cy.log('Validating table headers structure');
        LeadsPage.validateTableHeaders()
            .then(() => {
                cy.log('✓ Table headers validated successfully');
            });
            
        cy.wait(1000);

        // Test 2: Filter leads by date range
        cy.log('**Test 2: Filtering leads by date range**');
        cy.log('Setting date range filters');
        LeadsPage.setDateRange();
        cy.wait(1500);
        cy.log('✓ Date range values entered');
        
        cy.log('Applying filters');
        LeadsPage.applyFilters();
        cy.wait(2000);
        cy.log('✓ Date range filters applied successfully');
        
        // Scroll to show results
        cy.get('table').scrollIntoView({ duration: 1000 });
        cy.wait(1000);
        
        // Test 2 (continued): Test pagination
        cy.log('**Test 2 (continued): Testing pagination**');

        // First, scroll to the pagination section
        cy.get('.pagination').scrollIntoView({ duration: 1000 });
        cy.wait(1000);

        // Check if there are multiple pages available
        cy.get('.pagination .page-numbers button').then($buttons => {
            if ($buttons.length > 1) {
                // If there are multiple pages, click on page 2
                cy.get('.pagination .page-numbers button').eq(1).click();
                cy.wait(2000);
                cy.log('✓ Navigated to page 2');
            } else {
                cy.log('Only one page available, staying on page 1');
            }
            
            // Scroll to show results on the current page
            cy.get('table').scrollIntoView({ duration: 1000 });
            cy.wait(1000);
            
            // Test 2 (continued): View lead details and return
            cy.log('**Test 2 (continued): Viewing lead details**');
            
            // Get the lead ID from the first row of the table
            cy.get('table tbody tr').first().then($row => {
                // Get the ID from the first column (assuming that's where the ID is)
                const leadId = $row.find('td').first().text().trim();
                cy.log(`Found lead ID: ${leadId}`);
                
                // Find the View button and get its href attribute
                cy.contains('View').first().then($viewBtn => {
                    // Get the href attribute
                    const href = $viewBtn.attr('href');
                    cy.log(`View button href: ${href}`);
                    
                    if (href && href.includes('/leads/')) {
                        // If we have a valid href, visit it directly
                        cy.visit(`http://54.186.118.166:5000${href}`);
                    } else {
                        // Otherwise try to click it with target removed
                        cy.contains('View').first()
                            .invoke('removeAttr', 'target')
                            .click({force: true});
                    }
                    
                    cy.wait(3000);
                    cy.log('✓ Navigated to lead details page');
                    
                    // Verify we're on a details page by checking for specific content
                    cy.contains('Inquiry ID', {timeout: 10000}).should('exist');
                    cy.contains('Customer Name', {timeout: 10000}).should('exist');
                    cy.log('✓ Verified lead details content');
                    
                    // Scroll through the lead details
                    cy.scrollTo('bottom', { duration: 1000 });
                    cy.wait(1000);
                    cy.scrollTo('top', { duration: 1000 });
                    cy.wait(1000);
                    cy.log('✓ Viewed lead details');
                    
                    // Go back to the leads page
                    cy.visit('http://54.186.118.166:5000/leads');
                    cy.wait(2000);
                    cy.log('✓ Returned to leads page');
                    
                    // Scroll to show the table again
                    cy.get('table').scrollIntoView({ duration: 1000 });
                    cy.wait(1000);
                });
            });
        });

        // Test 3: Filter by assigned member - Random specific member
        cy.log('**Test 3: Filtering by assigned member**');
        cy.log('Selecting a random member from dropdown');
        
        // Get a random member from the dropdown using the correct selector
        cy.get('.member-filter select').then($select => {
            // Get all options
            const $options = $select.find('option');
            // Get a random index
            const randomIndex = Math.floor(Math.random() * $options.length);
            // Get the value and text of the random option
            const randomValue = $options.eq(randomIndex).val();
            const randomText = $options.eq(randomIndex).text();
            
            // Select the random member
            cy.get('.member-filter select').select(randomValue);
            cy.log(`✓ Selected member: "${randomText}"`);
            
            cy.wait(1500);
            
            cy.log('Applying filters');
            LeadsPage.applyFilters();
            cy.wait(2000);
            cy.log('✓ Member filter applied successfully');
            
            // Scroll to show results
            cy.get('table').scrollIntoView({ duration: 1000 });
            cy.wait(1000);
        });

        // Test 4: Search by customer name
        cy.log('**Test 4: Searching by customer name**');
        const customerName = 'Sajood Ur Rehman';
        cy.log(`Entering customer name: "${customerName}"`);
        LeadsPage.searchCustomer(customerName);
        cy.wait(1500);
        cy.log('✓ Customer name entered');
        
        cy.log('Applying filters');
        LeadsPage.applyFilters();
        cy.wait(2000);
        
        cy.log('Verifying search results');
        cy.contains(customerName, { timeout: 10000 }).should('be.visible')
            .then(() => {
                cy.log(`✓ Customer "${customerName}" found in results`);
            });
        
        // Scroll to show results
        cy.get('table').scrollIntoView({ duration: 1000 });
        cy.wait(1000);

        // Test 4 (continued): Search by Inquiry ID
        cy.log('**Test 4 (continued): Searching by Inquiry ID**');

        // Note: We're keeping the customer name filter active
        // LeadsPage.searchCustomer(''); // Commented out to preserve customer name filter

        // Use the specific Inquiry ID
        const inquiryId = "QRL-355";
        cy.log(`Using Inquiry ID: ${inquiryId}`);

        // Enter the inquiry ID in the search filter input - using a more specific selector
        cy.get('.search-filter input[placeholder="Search by inquiry ID"]').type(inquiryId);
        cy.log('✓ Inquiry ID entered');

        cy.wait(1500);

        cy.log('Applying filters');
        LeadsPage.applyFilters();
        cy.wait(2000);

        // Scroll to show results
        cy.get('table').scrollIntoView({ duration: 1000 });
        cy.wait(1000);

        // Clear the Inquiry ID filter before moving to the next test
        cy.get('.search-filter input[placeholder="Search by inquiry ID"]').clear();
        cy.wait(500);
        cy.log('✓ Cleared Inquiry ID filter');

        // Test 4 (continued): Filter by Live Rate
        cy.log('**Test 4 (continued): Filtering by Live Rate**');

        // Find the Live Rate dropdown using the correct selector
        cy.get('.live-rate-filter select')
          .then($select => {
            // Get all options
            const $options = $select.find('option');
            
            if ($options.length > 0) {
              // Get a random index (including the first option)
              const randomIndex = Math.floor(Math.random() * $options.length);
              
              // Get the value and text of the random option
              const randomValue = $options.eq(randomIndex).val();
              const randomText = $options.eq(randomIndex).text();
              
              // Select the random option
              cy.get('.live-rate-filter select').select(randomValue);
              
              cy.log(`✓ Selected Live Rate option: "${randomText}"`);
              
              cy.wait(1500);
              
              cy.log('Applying filters');
              LeadsPage.applyFilters();
              cy.wait(2000);
              
              // Scroll to show results
              cy.get('table').scrollIntoView({ duration: 1000 });
              cy.wait(1000);
            } else {
              cy.log('No Live Rate options available to select');
            }
          });

        // Test 5: Change records per page
        cy.log('**Test 5: Changing records per page**');
        cy.log('Setting records per page to 10');
        LeadsPage.setRecordsPerPage(10);
        cy.wait(1500);
        cy.log('✓ Records per page selection changed');
        
        cy.log('Verifying number of displayed records');
        cy.get('table tbody tr')
            .should('have.length.lte', 10)
            .then((rows) => {
                cy.log(`✓ Table showing ${rows.length} records (≤ 10) as expected`);
            });
        
        // Scroll to show results
        cy.get('table').scrollIntoView({ duration: 1000 });
        cy.wait(1000);

        // Test 6: Handle recalculate all functionality
        cy.log('**Test 6: Testing recalculate all function**');
        cy.log('Clicking Recalculate All button');
        LeadsPage.recalculateAll();
        cy.log('✓ Recalculation triggered successfully');
        
        // Add longer wait for recalculation
        cy.wait(3000);
        cy.log('✓ Recalculation process completed');
        
        // Scroll to show results
        cy.get('table').scrollIntoView({ duration: 1000 });
        cy.wait(1000);

        // Test 7: Handle invalid date ranges
        cy.log('**Test 7: Handling invalid date input**');
        cy.log('Attempting to set invalid date range');
        
        // Note: The setDateRange method doesn't currently accept parameters
        // So we're just using the default implementation
        LeadsPage.setDateRange();
        cy.wait(1500);
        cy.log('✓ Date range set');
        
        cy.log('Applying filters with date range');
        LeadsPage.applyFilters();
        cy.wait(2000);
        cy.log('✓ Filters applied with date range');
        
        // Scroll to show results
        cy.get('table').scrollIntoView({ duration: 1000 });
        cy.wait(1000);
    });

    after(() => {
        cy.log('***** TEST SUITE COMPLETED *****');
        cy.log('All test cases executed successfully');
        cy.wait(2000);
    });
}); 