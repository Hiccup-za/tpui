/**
 * Stage-specific prompts following Ralph Wiggum best practices
 * Each prompt includes clear completion criteria and self-correction patterns
 */

export const STAGE_PROMPTS = {
  requirementExtraction: `
    Extract all requirements from this PRD document.
    
    Requirements:
    - Identify functional requirements (what the system should do)
    - Identify non-functional requirements (performance, security, usability, scalability, etc.)
    - Each requirement must be clear, testable, and specific
    - Structure as JSON array with: id, type, description, testCases (empty array)
    
    Validation checklist:
    - [ ] At least one functional requirement
    - [ ] At least one non-functional requirement (if applicable)
    - [ ] All requirements have clear, detailed descriptions (min 20 characters)
    - [ ] Requirements are testable and specific
    - [ ] Each requirement has a unique ID
    
    If validation fails:
    1. Identify what's missing or incorrect
    2. Re-read the document carefully
    3. Extract missing requirements or fix existing ones
    4. Re-validate against the checklist
    
    Output format:
    [
      {
        "id": "req-1",
        "type": "functional",
        "description": "...",
        "testCases": []
      }
    ]
    
    Output <promise>All requirements extracted and validated</promise> when complete.
  `,

  testCaseGeneration: `
    Generate test cases for each requirement using the 7 testing principles.
    
    For each requirement:
    1. Create positive test cases (happy path, expected behavior)
    2. Create negative test cases (error cases, edge cases, invalid inputs)
    3. Ensure test cases demonstrate understanding of the 7 testing principles
    
    The 7 Testing Principles:
    1. Testing shows presence of defects - test cases should aim to find bugs
    2. Exhaustive testing is impossible - focus on high-risk areas
    3. Early testing - consider testing at different stages
    4. Defect clustering - test areas more likely to have defects
    5. Pesticide paradox - vary test cases to find new defects
    6. Testing is context dependent - adapt to the system being tested
    7. Absence of errors fallacy - no errors doesn't mean correct behavior
    
    Validation checklist:
    - [ ] Each requirement has at least one positive test case
    - [ ] Each requirement has at least one negative test case
    - [ ] Test cases are specific and actionable
    - [ ] Test cases reference the requirement they test
    - [ ] Test cases cover different scenarios (edge cases, boundary conditions)
    
    If validation fails:
    1. Identify which requirements lack test cases
    2. Generate missing positive or negative test cases
    3. Ensure test cases are specific enough to execute
    4. Re-validate
    
    Output format:
    [
      {
        "id": "tc-1",
        "requirementId": "req-1",
        "description": "Verify that...",
        "isPositive": true,
        "isNegative": false,
        "testTypes": []
      }
    ]
    
    Output <promise>All test cases generated and conform to 7 testing principles</promise> when complete.
  `,

  negativeTestLabeling: `
    Review all test cases and correctly label negative test cases.
    
    Negative test cases are those that:
    - Test error conditions
    - Test invalid inputs
    - Test edge cases that should fail
    - Test boundary conditions that should be rejected
    - Test security vulnerabilities
    - Test system limits
    
    Positive test cases are those that:
    - Test expected, valid behavior
    - Test happy path scenarios
    - Test normal operations
    
    Validation checklist:
    - [ ] All negative test cases have isNegative = true
    - [ ] All positive test cases have isPositive = true
    - [ ] No test case is both positive and negative
    - [ ] Negative test descriptions indicate failure/error scenarios
    - [ ] At least one negative test case exists
    
    If validation fails:
    1. Review each test case description
    2. Determine if it tests success (positive) or failure (negative)
    3. Update the isPositive and isNegative flags accordingly
    4. Re-validate
    
    Output <promise>All negative test cases properly labeled</promise> when complete.
  `,

  testTypeClassification: `
    Classify all test cases by their testing types.
    
    Valid test types include:
    - unit: Tests individual components in isolation
    - integration: Tests interaction between components
    - system: Tests the complete system
    - acceptance: Tests user acceptance criteria
    - performance: Tests speed, load, stress
    - security: Tests security vulnerabilities
    - usability: Tests user experience
    - compatibility: Tests across platforms/browsers
    - regression: Tests to ensure no regressions
    - smoke: Quick tests to verify basic functionality
    - sanity: Tests to verify recent changes work
    
    Each test case can have multiple test types.
    
    Validation checklist:
    - [ ] Every test case has at least one test type
    - [ ] Test types are valid (from the list above)
    - [ ] Test types match the test case description
    - [ ] Test types are appropriate for the requirement being tested
    
    If validation fails:
    1. Review each test case description
    2. Determine appropriate test types based on what it tests
    3. Assign at least one test type to each test case
    4. Re-validate
    
    Output <promise>All test cases classified by type</promise> when complete.
  `,

  finalReview: `
    Review all requirements and test cases to ensure they conform to the 7 testing principles.
    
    Review checklist:
    - [ ] All requirements are clear and testable
    - [ ] Each requirement has associated test cases
    - [ ] Test cases cover both positive and negative scenarios
    - [ ] Test cases demonstrate understanding of the 7 testing principles:
        1. Testing shows presence of defects
        2. Exhaustive testing is impossible
        3. Early testing
        4. Defect clustering
        5. Pesticide paradox
        6. Testing is context dependent
        7. Absence of errors fallacy
    - [ ] Test cases are properly labeled (positive/negative)
    - [ ] Test cases have appropriate test types
    - [ ] No requirements are missing test cases
    - [ ] Test cases are specific and actionable
    
    If validation fails:
    1. Identify which requirements or test cases need improvement
    2. Add missing test cases or fix existing ones
    3. Ensure all test cases properly reference the 7 principles
    4. Re-validate
    
    Output <promise>Final review complete - all requirements and test cases validated</promise> when complete.
  `,
};
