import { calculateNextReview, formatInterval } from "./sm2";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log("Testing SM-2 Algorithm...");

const now = 1700000000000;

// Test 1: New card rated "Tekrar" (1)
const r1 = calculateNextReview(1, 0, 2.5, 0, now);
assert(r1.interval === 1, "Rating 1 should set interval to 1");
assert(r1.repetition === 0, "Rating 1 should reset repetition to 0");
assert(r1.easinessFactor < 2.5, "Rating 1 should decrease EF");

// Test 2: New card rated "İyi" (3)
const r2 = calculateNextReview(3, 0, 2.5, 0, now);
assert(r2.interval === 1, "First good review gives interval 1");
assert(r2.repetition === 1, "Repetition count should be 1");

// Test 3: Second review rated "İyi" (3)
const r3 = calculateNextReview(3, 1, 2.5, 1, now);
assert(r3.interval === 6, "Second good review gives interval 6");
assert(r3.repetition === 2, "Repetition count should be 2");

// Test 4: Third review rated "İyi" (3)
const r4 = calculateNextReview(3, 6, 2.5, 2, now);
assert(r4.interval === Math.round(6 * 2.5), "Third good review multiplies by EF");
assert(r4.repetition === 3, "Repetition count should be 3");

// Test 5: "Kolay" (4) should give higher intervals
const rEasy = calculateNextReview(4, 0, 2.5, 0, now);
assert(rEasy.interval === 2, "First easy review should give 2 days");
assert(rEasy.easinessFactor > 2.5, "Easy review should increase EF");

// Test 6: EF minimum bound
let lowEF = 1.3;
const rLow = calculateNextReview(1, 5, lowEF, 3, now);
assert(rLow.easinessFactor >= 1.3, "EF should never drop below 1.3");

// Test 7: Formatting
assert(formatInterval(1) === "1 gün", "1 day formatting");
assert(formatInterval(7) === "1 hafta", "7 days formatting");
assert(formatInterval(30) === "1 ay", "30 days formatting");

console.log("✓ All SM-2 tests passed successfully!");

