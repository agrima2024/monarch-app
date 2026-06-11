import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import type { ValidationResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const reviewText = formData.get("review_text") as string | null;
    const placeName = formData.get("place_name") as string | null;
    const photo = formData.get("photo") as File | null;

    if (!placeName?.trim()) {
      return NextResponse.json(
        {
          approved: false,
          image_passed: false,
          text_passed: false,
          rejection_reason: "Missing place name",
          royal_guard_message:
            "Every kingdom needs a name! What will you call this place?",
        } satisfies ValidationResult,
        { status: 400 }
      );
    }

    if (!reviewText?.trim()) {
      return NextResponse.json(
        {
          approved: false,
          image_passed: false,
          text_passed: false,
          rejection_reason: "Missing review text",
          royal_guard_message:
            "A Monarch must speak! Your review cannot be empty.",
        } satisfies ValidationResult,
        { status: 400 }
      );
    }

    if (!photo) {
      return NextResponse.json(
        {
          approved: false,
          image_passed: false,
          text_passed: false,
          rejection_reason: "Missing photo",
          royal_guard_message:
            "The Royal Guard requires proof of your visit — submit a live photo!",
        } satisfies ValidationResult,
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        fallbackValidation(reviewText, placeName.trim())
      );
    }

    const photoBytes = await photo.arrayBuffer();
    const base64Photo = Buffer.from(photoBytes).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            approved: { type: SchemaType.BOOLEAN },
            image_passed: { type: SchemaType.BOOLEAN },
            text_passed: { type: SchemaType.BOOLEAN },
            rejection_reason: { type: SchemaType.STRING, nullable: true },
            royal_guard_message: { type: SchemaType.STRING, nullable: true },
          },
          required: [
            "approved",
            "image_passed",
            "text_passed",
            "rejection_reason",
            "royal_guard_message",
          ],
        },
      },
    });

    const prompt = `You are the Royal Guard of Monarch, a location-based social discovery app. A user is exploring an unnamed location and wants to name it "${placeName}".

NAME CHECK — reject if:
- Empty, single character, or gibberish
- Offensive, profane, or hateful
- Generic to the point of useless ("Place", "Spot", "Here")

IMAGE CHECK — reject if:
- Blurry, out of focus, or too dark/pitch black
- Obviously not a photo of a real place (blank wall, ceiling, screenshot, meme)
- Duplicate/low-effort (solid color, finger over lens)

TEXT CHECK — reject if:
- Fewer than 1–2 substantive sentences
- Generic filler ("nice place", "good", "cool spot") without helpful insight
- Contains profanity or hate speech
- Not related to visiting or experiencing the location

If rejecting, write a creative medieval "Royal Guard" message explaining why.

Place name: "${placeName}"
Review text: "${reviewText}"`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: photo.type || "image/jpeg",
          data: base64Photo,
        },
      },
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text) as ValidationResult;

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      {
        approved: false,
        image_passed: false,
        text_passed: false,
        rejection_reason: "Validation service error",
        royal_guard_message:
          "The Royal Guard is temporarily unavailable. Please try again shortly.",
      } satisfies ValidationResult,
      { status: 500 }
    );
  }
}

function fallbackValidation(
  reviewText: string,
  placeName: string
): ValidationResult {
  const sentences = reviewText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const wordCount = reviewText.trim().split(/\s+/).length;
  const profanityPattern = /\b(damn|hell|shit|fuck|ass|bitch|crap)\b/i;

  if (placeName.length < 2) {
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
      royal_guard_message: `The review is too brief for a Monarch! Share genuine insight about "${placeName}".`,
    };
  }

  if (profanityPattern.test(reviewText) || profanityPattern.test(placeName)) {
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
