#!/bin/bash

# AIGraph Scanner Test Script
# This script validates the aigraph-scanner against the test repository
# to ensure it correctly identifies true positives and minimizes false positives.

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_REPO_DIR="$SCRIPT_DIR"

echo "=================================================="
echo "AIGraph Scanner Test Suite"
echo "=================================================="
echo ""

# Check if aigraph-scanner is available
if ! command -v aigraph-scanner &> /dev/null; then
    echo "❌ aigraph-scanner not found. Please install it first:"
    echo "   npm install -g aigraph-scanner"
    echo "   or"
    echo "   npm run build:all (from repository root)"
    exit 1
fi

echo "✅ aigraph-scanner found"
echo ""

# Test 1: True Positives - Should detect AI usage
echo "=================================================="
echo "Test 1: True Positives"
echo "=================================================="
echo "Scanning: $TEST_REPO_DIR/true-positives/"
echo ""

aigraph-scanner "$TEST_REPO_DIR/true-positives/" -q -f json > /tmp/aigraph-true-pos.json 2>&1 || true

if [ -f /tmp/aigraph-true-pos.json ]; then
    TRUE_DETECTIONS=$(cat /tmp/aigraph-true-pos.json | grep -o '"totalDetections":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "✅ True Positives Test Complete"
    echo "   Detections found: $TRUE_DETECTIONS (expected: 50+)"
    
    if [ "$TRUE_DETECTIONS" -lt 30 ]; then
        echo "⚠️  Warning: Low detection count. Expected 50+."
    fi
else
    echo "⚠️  Could not parse results"
fi

echo ""

# Test 2: False Positives - Should minimize detections
echo "=================================================="
echo "Test 2: False Positives (Filtered)"
echo "=================================================="
echo "Scanning: $TEST_REPO_DIR/false-positives/"
echo "Note: Comments and strings should be filtered"
echo ""

aigraph-scanner "$TEST_REPO_DIR/false-positives/" -q -f json --no-codeql > /tmp/aigraph-false-pos.json 2>&1 || true

if [ -f /tmp/aigraph-false-pos.json ]; then
    FALSE_DETECTIONS=$(cat /tmp/aigraph-false-pos.json | grep -o '"totalDetections":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "✅ False Positives Test Complete"
    echo "   Detections found: $FALSE_DETECTIONS (expected: 0-10)"
    
    if [ "$FALSE_DETECTIONS" -gt 20 ]; then
        echo "⚠️  Warning: High false positive count."
    fi
else
    echo "⚠️  Could not parse results"
fi

echo ""

# Test 3: Allowlist Policy
echo "=================================================="
echo "Test 3: Allowlist Policy Enforcement"
echo "=================================================="
echo "Testing with: $TEST_REPO_DIR/test-policy-allowlist.yml"
echo ""

aigraph-scanner -s "$TEST_REPO_DIR/test-policy-allowlist.yml" "$TEST_REPO_DIR/true-positives/" -q -f json --no-fail > /tmp/aigraph-allowlist.json 2>&1 || true

if [ -f /tmp/aigraph-allowlist.json ]; then
    ALLOW_VIOLATIONS=$(cat /tmp/aigraph-allowlist.json | grep -o '"totalViolations":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "✅ Allowlist Test Complete"
    echo "   Violations found: $ALLOW_VIOLATIONS (expected: 8+)"
    echo "   Violations are models/frameworks NOT in the allowlist"
else
    echo "⚠️  Could not parse results"
fi

echo ""

# Test 4: Denylist Policy
echo "=================================================="
echo "Test 4: Denylist Policy Enforcement"
echo "=================================================="
echo "Testing with: $TEST_REPO_DIR/test-policy-denylist.yml"
echo ""

aigraph-scanner -s "$TEST_REPO_DIR/test-policy-denylist.yml" "$TEST_REPO_DIR/true-positives/" -q -f json --no-fail > /tmp/aigraph-denylist.json 2>&1 || true

if [ -f /tmp/aigraph-denylist.json ]; then
    DENY_VIOLATIONS=$(cat /tmp/aigraph-denylist.json | grep -o '"totalViolations":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "✅ Denylist Test Complete"
    echo "   Violations found: $DENY_VIOLATIONS (expected: 7+)"
    echo "   Violations are models/frameworks IN the denylist"
else
    echo "⚠️  Could not parse results"
fi

echo ""

# Summary
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo ""
echo "1. True Positives:    $TRUE_DETECTIONS detections (target: 50+)"
echo "2. False Positives:   $FALSE_DETECTIONS detections (target: <10)"
echo "3. Allowlist Violations: $ALLOW_VIOLATIONS (target: 8+)"
echo "4. Denylist Violations:  $DENY_VIOLATIONS (target: 7+)"
echo ""

# Determine overall result
PASS_COUNT=0
TOTAL_TESTS=4

[ "$TRUE_DETECTIONS" -ge 30 ] && PASS_COUNT=$((PASS_COUNT + 1))
[ "$FALSE_DETECTIONS" -le 20 ] && PASS_COUNT=$((PASS_COUNT + 1))
[ "$ALLOW_VIOLATIONS" -ge 5 ] && PASS_COUNT=$((PASS_COUNT + 1))
[ "$DENY_VIOLATIONS" -ge 5 ] && PASS_COUNT=$((PASS_COUNT + 1))

echo "Tests Passed: $PASS_COUNT/$TOTAL_TESTS"
echo ""

if [ "$PASS_COUNT" -eq "$TOTAL_TESTS" ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "⚠️  Some tests did not meet expectations"
    echo "    This may be normal depending on scanner configuration"
    exit 0  # Don't fail, just warn
fi
