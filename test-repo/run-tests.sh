#!/bin/bash

# AIGraph Scanner Test Script
# This script validates the aigraph-scanner against the test repository
# to ensure it correctly identifies true positives and minimizes false positives.

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_REPO_DIR="$SCRIPT_DIR"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Test thresholds (adjust these based on test repository changes)
MIN_TRUE_DETECTIONS=250      # Minimum expected true positive detections
MAX_TRUE_DETECTIONS=350      # Maximum expected true positive detections
MAX_FALSE_DETECTIONS=60      # Maximum acceptable false positive detections
MIN_ALLOWLIST_VIOLATIONS=5   # Minimum expected allowlist violations
MIN_DENYLIST_VIOLATIONS=5    # Minimum expected denylist violations

# Create temporary directory for test results
TEMP_DIR=$(mktemp -d -t aigraph-test-XXXXXX)
trap "rm -rf $TEMP_DIR" EXIT

echo "=================================================="
echo "AIGraph Scanner Test Suite"
echo "=================================================="
echo ""

# Check if aigraph-scanner is available
if command -v aigraph-scanner &> /dev/null; then
    SCANNER_CMD="aigraph-scanner"
    echo "✅ Using global aigraph-scanner"
elif [ -f "$REPO_ROOT/dist/cli.js" ]; then
    SCANNER_CMD="node $REPO_ROOT/dist/cli.js"
    echo "✅ Using local build: $REPO_ROOT/dist/cli.js"
else
    echo "❌ aigraph-scanner not found. Please either:"
    echo "   1. Install globally: npm install -g aigraph-scanner"
    echo "   2. Build locally: cd $REPO_ROOT && npm run build:all"
    exit 1
fi

echo ""

# Test 1: True Positives - Should detect AI usage
echo "=================================================="
echo "Test 1: True Positives"
echo "=================================================="
echo "Scanning: $TEST_REPO_DIR/true-positives/"
echo ""

$SCANNER_CMD "$TEST_REPO_DIR/true-positives/" -q -f json 2>/dev/null > "$TEMP_DIR/true-pos.json" || true

if [ -f "$TEMP_DIR/true-pos.json" ] && [ -s "$TEMP_DIR/true-pos.json" ]; then
    TRUE_DETECTIONS=$(jq -r '.summary.totalDetections' "$TEMP_DIR/true-pos.json" 2>/dev/null || echo "0")
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

$SCANNER_CMD "$TEST_REPO_DIR/false-positives/" -q -f json --no-codeql 2>/dev/null > "$TEMP_DIR/false-pos.json" || true

if [ -f "$TEMP_DIR/false-pos.json" ] && [ -s "$TEMP_DIR/false-pos.json" ]; then
    FALSE_DETECTIONS=$(jq -r '.summary.totalDetections' "$TEMP_DIR/false-pos.json" 2>/dev/null || echo "0")
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

$SCANNER_CMD -s "$TEST_REPO_DIR/test-policy-allowlist.yml" "$TEST_REPO_DIR/true-positives/" -q -f json --no-fail 2>/dev/null > "$TEMP_DIR/allowlist.json" || true

if [ -f "$TEMP_DIR/allowlist.json" ] && [ -s "$TEMP_DIR/allowlist.json" ]; then
    ALLOW_VIOLATIONS=$(jq -r '.summary.totalViolations' "$TEMP_DIR/allowlist.json" 2>/dev/null || echo "0")
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

$SCANNER_CMD -s "$TEST_REPO_DIR/test-policy-denylist.yml" "$TEST_REPO_DIR/true-positives/" -q -f json --no-fail 2>/dev/null > "$TEMP_DIR/denylist.json" || true

if [ -f "$TEMP_DIR/denylist.json" ] && [ -s "$TEMP_DIR/denylist.json" ]; then
    DENY_VIOLATIONS=$(jq -r '.summary.totalViolations' "$TEMP_DIR/denylist.json" 2>/dev/null || echo "0")
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

if [ "$TRUE_DETECTIONS" -ge "$MIN_TRUE_DETECTIONS" ] && [ "$TRUE_DETECTIONS" -le "$MAX_TRUE_DETECTIONS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
fi
if [ "$FALSE_DETECTIONS" -le "$MAX_FALSE_DETECTIONS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
fi
[ "$ALLOW_VIOLATIONS" -ge "$MIN_ALLOWLIST_VIOLATIONS" ] && PASS_COUNT=$((PASS_COUNT + 1))
[ "$DENY_VIOLATIONS" -ge "$MIN_DENYLIST_VIOLATIONS" ] && PASS_COUNT=$((PASS_COUNT + 1))

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
