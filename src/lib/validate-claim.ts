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

  if (photoFile.size < 5000) {
    return {
      approved: false,
      image_passed: false,
      text_passed: true,
      rejection_reason: "Image too small or low quality",
      royal_guard_message:
        "The Royal Guard suspects trickery — submit a clear live photo of the place!",
    };
  }

  const trimmedName = placeName.trim();
  const sentences = reviewText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const wordCount = reviewText.trim().split(/\s+/).length;
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

  if (wordCount < 8 || sentences.length < 1) {
    return {
      approved: false,
      image_passed: true,
      text_passed: false,
      rejection_reason: "Review too brief",
      royal_guard_message: `The review is too brief for a Monarch! Share genuine insight about "${trimmedName}".`,
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
