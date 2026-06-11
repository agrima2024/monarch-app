import type { ValidationResult } from "./types";

export function validateClaim(
  reviewText: string,
  placeName: string,
  photoFile: File | null
): ValidationResult {
  if (!placeName.trim()) {
    return {
      approved: false,
      image_passed: false,
      text_passed: false,
      rejection_reason: "Missing place name",
      royal_guard_message:
        "Every kingdom needs a name! What will you call this place?",
    };
  }

  if (!reviewText.trim()) {
    return {
      approved: false,
      image_passed: false,
      text_passed: false,
      rejection_reason: "Missing review text",
      royal_guard_message:
        "A Monarch must speak! Your review cannot be empty.",
    };
  }

  if (!photoFile) {
    return {
      approved: false,
      image_passed: false,
      text_passed: false,
      rejection_reason: "Missing photo",
      royal_guard_message:
        "The Royal Guard requires proof of your visit — submit a live photo!",
    };
  }

  const trimmedName = placeName.trim();
  const wordCount = reviewText.trim().split(/\s+/).filter(Boolean).length;
  const profanityPattern = /\b(damn|hell|shit|fuck|ass|bitch|crap)\b/i;

  if (trimmedName.length < 2) {
    return {
      approved: false,
      image_passed: true,
      text_passed: false,
      rejection_reason: "Place name too short",
      royal_guard_message:
        "A kingdom's name must be worthy of a crown — choose something more descriptive!",
    };
  }

  if (wordCount < 3) {
    return {
      approved: false,
      image_passed: true,
      text_passed: false,
      rejection_reason: "Review too brief",
      royal_guard_message: `Write at least 3 words about "${trimmedName}" — e.g. "Great coffee and cozy patio."`,
    };
  }

  if (profanityPattern.test(reviewText) || profanityPattern.test(trimmedName)) {
    return {
      approved: false,
      image_passed: true,
      text_passed: false,
      rejection_reason: "Profanity detected",
      royal_guard_message:
        "Mind your tongue in the Royal Court! Keep your name and review respectful.",
    };
  }

  return {
    approved: true,
    image_passed: true,
    text_passed: true,
    rejection_reason: null,
    royal_guard_message: null,
  };
}
