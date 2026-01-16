import { ValidationResult } from "./base-agent";
import { Requirement, TestCase } from "@/types";

export class Validators {
  /**
   * Validates extracted requirements
   */
  validateRequirements(output: Requirement[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(output)) {
      return {
        valid: false,
        errors: ["Output must be an array of requirements"],
      };
    }

    if (output.length === 0) {
      errors.push("No requirements extracted");
    }

    // Check for both types
    const functional = output.filter((r) => r.type === "functional");
    const nonFunctional = output.filter((r) => r.type === "non-functional");

    if (functional.length === 0) {
      errors.push("No functional requirements found");
    }
    if (nonFunctional.length === 0) {
      warnings.push("No non-functional requirements found (may be acceptable)");
    }

    // Validate each requirement
    output.forEach((req, i) => {
      if (!req.id) {
        errors.push(`Requirement ${i + 1} missing ID`);
      }
      if (!req.description || req.description.trim().length < 20) {
        errors.push(`Requirement ${i + 1} description too short or missing`);
      }
      if (!req.type || !["functional", "non-functional"].includes(req.type)) {
        errors.push(`Requirement ${i + 1} has invalid type`);
      }
      if (!req.testCases || !Array.isArray(req.testCases)) {
        errors.push(`Requirement ${i + 1} missing testCases array`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates generated test cases
   */
  validateTestCases(output: TestCase[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(output)) {
      return {
        valid: false,
        errors: ["Output must be an array of test cases"],
      };
    }

    if (output.length === 0) {
      errors.push("No test cases generated");
    }

    // Must have both positive and negative
    const positive = output.filter((tc) => tc.isPositive);
    const negative = output.filter((tc) => tc.isNegative);

    if (positive.length === 0) {
      errors.push("No positive test cases found");
    }
    if (negative.length === 0) {
      errors.push("No negative test cases found");
    }

    // Validate each test case
    output.forEach((tc, i) => {
      if (!tc.id) {
        errors.push(`Test case ${i + 1} missing ID`);
      }
      if (!tc.requirementId) {
        errors.push(`Test case ${i + 1} missing requirementId`);
      }
      if (!tc.description || tc.description.trim().length < 10) {
        errors.push(`Test case ${i + 1} description too short or missing`);
      }
      if (typeof tc.isPositive !== "boolean") {
        errors.push(`Test case ${i + 1} missing isPositive flag`);
      }
      if (typeof tc.isNegative !== "boolean") {
        errors.push(`Test case ${i + 1} missing isNegative flag`);
      }
      if (!tc.testTypes || !Array.isArray(tc.testTypes)) {
        errors.push(`Test case ${i + 1} missing testTypes array`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates negative test labeling
   */
  validateNegativeLabels(output: TestCase[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(output)) {
      return {
        valid: false,
        errors: ["Output must be an array of test cases"],
      };
    }

    // Check that negative tests are properly labeled
    const negativeTests = output.filter((tc) => tc.isNegative);
    const positiveTests = output.filter((tc) => tc.isPositive);

    if (negativeTests.length === 0) {
      errors.push("No negative test cases found after labeling");
    }

    // Ensure negative tests don't have isPositive = true
    const incorrectlyLabeled = output.filter(
      (tc) => tc.isNegative && tc.isPositive
    );
    if (incorrectlyLabeled.length > 0) {
      errors.push(
        `${incorrectlyLabeled.length} test cases incorrectly labeled as both positive and negative`
      );
    }

    // Check that negative tests have appropriate descriptions
    negativeTests.forEach((tc, i) => {
      const desc = tc.description.toLowerCase();
      const negativeKeywords = [
        "fail",
        "error",
        "invalid",
        "reject",
        "deny",
        "exception",
        "negative",
      ];
      const hasNegativeKeyword = negativeKeywords.some((keyword) =>
        desc.includes(keyword)
      );
      if (!hasNegativeKeyword && desc.length > 20) {
        // Only warn if description is substantial but lacks negative keywords
        // This is a soft check
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates test type classification
   */
  validateTestTypes(output: TestCase[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(output)) {
      return {
        valid: false,
        errors: ["Output must be an array of test cases"],
      };
    }

    const validTestTypes = [
      "unit",
      "integration",
      "system",
      "acceptance",
      "performance",
      "security",
      "usability",
      "compatibility",
      "regression",
      "smoke",
      "sanity",
    ];

    output.forEach((tc, i) => {
      if (!tc.testTypes || tc.testTypes.length === 0) {
        errors.push(`Test case ${i + 1} has no test types assigned`);
      } else {
        const invalidTypes = tc.testTypes.filter(
          (type: string) => !validTestTypes.includes(type.toLowerCase())
        );
        if (invalidTypes.length > 0) {
          warnings.push(
            `Test case ${i + 1} has potentially invalid test types: ${invalidTypes.join(", ")}`
          );
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates final review
   */
  validateFinalReview(output: {
    requirements: Requirement[];
    testCases: TestCase[];
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!output.requirements || !Array.isArray(output.requirements)) {
      errors.push("Requirements missing or invalid");
    }
    if (!output.testCases || !Array.isArray(output.testCases)) {
      errors.push("Test cases missing or invalid");
    }

    // Check 7 testing principles compliance
    const principles = [
      "Testing shows presence of defects",
      "Exhaustive testing is impossible",
      "Early testing",
      "Defect clustering",
      "Pesticide paradox",
      "Testing is context dependent",
      "Absence of errors fallacy",
    ];

    // Ensure test cases cover different aspects
    const testTypes = new Set<string>();
    output.testCases?.forEach((tc) => {
      tc.testTypes?.forEach((type: string) => testTypes.add(type));
    });

    if (testTypes.size < 3) {
      warnings.push(
        "Limited test type diversity - consider more varied test types"
      );
    }

    // Check requirement-test case mapping
    if (output.requirements && output.testCases) {
      output.requirements.forEach((req) => {
        const relatedTests = output.testCases.filter(
          (tc) => tc.requirementId === req.id
        );
        if (relatedTests.length === 0) {
          errors.push(`Requirement ${req.id} has no associated test cases`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
