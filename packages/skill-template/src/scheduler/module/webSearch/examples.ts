export const buildWebSearchExamples = () => {
  return `
  ## Examples (DO NOT USE THESE DIRECTLY - FOR FORMAT REFERENCE ONLY)

Question: "What is quantum computing?"
Context:
<Context>
  <WebSearchContext>
    <ContextItem citationIndex='[[citation:1]]' type='webSearchSource' url='quantum-basics.com' title='Introduction to Quantum Computing'>
      Quantum computing uses quantum phenomena like superposition and entanglement for calculations
    </ContextItem>
    <ContextItem citationIndex='[[citation:2]]' type='webSearchSource' url='quantum-apps.com' title='Quantum Computing Applications'>
      Applications in cryptography and drug discovery
    </ContextItem>
    <ContextItem citationIndex='[[citation:3]]' type='webSearchSource' url='quantum-bits.com' title='Understanding Qubits'>
      Quantum bits can exist in multiple states simultaneously, unlike classical bits
    </ContextItem>
  </WebSearchContext>
</Context>

Good Response:
Quantum computing is a type of computing that uses quantum phenomena like superposition and entanglement to perform calculations [citation:1]. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or qubits that can exist in multiple states simultaneously [citation:1][citation:3]. This technology has the potential to revolutionize fields like cryptography and drug discovery [citation:2].

Question: "What are the benefits of exercise?"
Context:
<Context>
  <WebSearchContext>
    <ContextItem citationIndex='[[citation:1]]' type='webSearchSource' url='health-org.com' title='Exercise Benefits'>
      No relevant content for this query
    </ContextItem>
  </WebSearchContext>
</Context>

Good Response:
Regular exercise provides numerous health benefits, including improved cardiovascular health, better mental well-being, and weight management. (NO CITATIONS - Context not relevant to query)
  `;
};

export const buildWebSearchChatHistoryExamples = () => {
  return `
  ## Examples with Chat History
  
  1. Direct Query (No Chat History Relevance):
  <ChatHistory>
  <ChatHistoryItem type={human}>What's the best way to optimize database queries?</ChatHistoryItem>
  <ChatHistoryItem type={ai}>Here are several techniques for query optimization...</ChatHistoryItem>
  <ChatHistoryItem type={human}>What is our company's security policy?</ChatHistoryItem>
  </ChatHistory>
  <Context>
  <WebSearchContext>
  <ContextItem citationIndex='[[citation:1]]' type='webSearchSource' url='security-docs.com' title='Company Security Guidelines'>
  All external access requires VPN. Two-factor authentication is mandatory for all systems.
  </ContextItem>
  </WebSearchContext>
  </Context>
  
  Good Response:
  According to our security guidelines, we require VPN for all external access and two-factor authentication is mandatory for all systems [citation:1]. (Note: Previous discussion about database optimization is irrelevant to current query)
  
  2. Follow-up Question with Context:
  <ChatHistory>
  <ChatHistoryItem type={human}>What deployment environments do we have?</ChatHistoryItem>
  <ChatHistoryItem type={ai}>We have development, staging, and production environments [citation:1].</ChatHistoryItem>
  <ChatHistoryItem type={human}>How do we deploy to staging?</ChatHistoryItem>
  </ChatHistory>
  <Context>
  <WebSearchContext>
  <ContextItem citationIndex='[[citation:1]]' type='webSearchSource' url='devops.company.com/environments' title='Environment Overview'>
  We maintain three environments: development, staging, and production.
  </ContextItem>
  <ContextItem citationIndex='[[citation:2]]' type='webSearchSource' url='devops.company.com/staging' title='Staging Deployment'>
  Staging deployment requires: 1) Passing all tests 2) Code review approval 3) QA sign-off
  </ContextItem>
  </WebSearchContext>
  </Context>
  
  Good Response:
  For staging deployment, our process requires three key steps [citation:2]:
  1. All tests must pass
  2. Code review approval is needed
  3. QA must sign off on the changes
  
  3. Ambiguous Follow-up with Multiple Contexts:
  <ChatHistory>
  <ChatHistoryItem type={human}>What testing frameworks do we use?</ChatHistoryItem>
  <ChatHistoryItem type={ai}>We use Jest for unit testing and Cypress for E2E testing [citation:1].</ChatHistoryItem>
  <ChatHistoryItem type={human}>how do we use it?</ChatHistoryItem>
  </ChatHistory>
  <Context>
  <WebSearchContext>
  <ContextItem citationIndex='[[citation:1]]' type='webSearchSource' url='docs.company.com/testing' title='Testing Overview'>
  Our testing stack includes Jest (unit) and Cypress (E2E).
  </ContextItem>
  <ContextItem citationIndex='[[citation:2]]' type='webSearchSource' url='docs.company.com/jest' title='Jest Guide'>
  Jest tests are written in __tests__ directories. Run with 'npm test'.
  </ContextItem>
  <ContextItem citationIndex='[[citation:3]]' type='webSearchSource' url='docs.company.com/cypress' title='Cypress Guide'>
  Cypress tests are in cypress/integration. Run with 'npm run e2e'.
  </ContextItem>
  </WebSearchContext>
  </Context>
  
  Good Response:
  Based on our previous discussion about testing frameworks, I'll explain how we use both:
  
  Jest (Unit Testing) [citation:2]:
  - Tests are located in __tests__ directories
  - Run tests using 'npm test'
  
  Cypress (E2E Testing) [citation:3]:
  - Tests are in cypress/integration directory
  - Execute with 'npm run e2e'
  
  4. Generic Follow-up with Specific Context:
  <ChatHistory>
  <ChatHistoryItem type={human}>What's our API rate limiting policy?</ChatHistoryItem>
  <ChatHistoryItem type={ai}>Our APIs are limited to 1000 requests per minute per client [citation:1].</ChatHistoryItem>
  <ChatHistoryItem type={human}>tell me more</ChatHistoryItem>
  </ChatHistory>
  <Context>
  <WebSearchContext>
  <ContextItem citationIndex='[[citation:1]]' type='webSearchSource' url='api.company.com/limits' title='API Limits'>
  Standard rate limit: 1000 requests/minute/client
  </ContextItem>
  <ContextItem citationIndex='[[citation:2]]' type='webSearchSource' url='api.company.com/details' title='API Details'>
  Rate limiting includes:
  - Burst protection
  - IP-based tracking
  - Custom limits for premium clients
  </ContextItem>
  </WebSearchContext>
  </Context>
  
  Good Response:
  Expanding on our API rate limiting policy, we implement several additional features [citation:2]:
  - Burst protection to prevent sudden spikes
  - IP-based tracking for better security
  - Custom rate limits available for premium clients
  `;
};
