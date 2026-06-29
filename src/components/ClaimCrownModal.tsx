"use client";

import {
  Crown,
  Loader2,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { LivePhotoCapture } from "./LivePhotoCapture";
import { formatCoordinates } from "@/lib/display";
import { validateClaim } from "@/lib/validate-claim";
import type { Location } from "@/lib/types";

interface ClaimCrownModalProps {
  location: Location;
  onClose: () => void;
  onSuccess: (placeName: string, reviewText: string, photoPreview: string) => void;
}

export function ClaimCrownModal({
  location,
  onClose,
  onSuccess,
}: ClaimCrownModalProps) {
  const [placeName, setPlaceName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guardMessage, setGuardMessage] = useState<string | null>(null);

  const handlePhotoCapture = useCallback((file: File, preview: string) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
    setGuardMessage(null);
  }, []);

  const handlePhotoClear = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
  }, []);

  const handleSubmit = async () => {
    if (!placeName.trim()) {
      setGuardMessage(
        "Every kingdom needs a name! What will you call this place?"
      );
      return;
    }

    if (!photoFile || !reviewText.trim()) {
      setGuardMessage(
        "The Royal Guard requires both a live photo and a written review!"
      );
      return;
    }

    setIsSubmitting(true);
    setGuardMessage(null);

    await new Promise((r) => setTimeout(r, 600));

    const result = validateClaim(reviewText, placeName.trim(), photoFile);

    if (result.approved) {
      onSuccess(placeName.trim(), reviewText, photoPreview!);
    } else {
      setGuardMessage(
        result.royal_guard_message ??
          "The Royal Guard has denied your claim. Try again!"
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-surface-elevated rounded-2xl border border-gold/20 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <h2 className="font-semibold">Explore &amp; Name</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-gold/10">
            <MapPin className="h-5 w-5 text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-0.5">
                Unexplored
              </p>
              <p className="font-mono text-xs text-muted/70">
                {formatCoordinates(location.latitude, location.longitude)}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="place-name" className="text-sm text-muted mb-2 block">
              Name This Place
            </label>
            <input
              id="place-name"
              type="text"
              value={placeName}
              onChange={(e) => {
                setPlaceName(e.target.value);
                setGuardMessage(null);
              }}
              placeholder="Give this spot a name for future explorers..."
              maxLength={60}
              className="w-full rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-2 block">Live Photo</label>
            <LivePhotoCapture
              preview={photoPreview}
              onCapture={handlePhotoCapture}
              onClear={handlePhotoClear}
            />
          </div>

          <div>
            <label htmlFor="review" className="text-sm text-muted mb-2 block">
              Your Review
            </label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                setGuardMessage(null);
              }}
              placeholder="Share what you discovered — e.g. Great coffee and cozy patio in the morning."
              rows={4}
              className="w-full rounded-xl bg-surface border border-gold/10 px-4 py-3 text-sm placeholder:text-muted/60 focus:outline-none focus:border-gold/40 resize-none"
            />
          </div>

          {guardMessage && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30">
              <Shield className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">
                  Royal Guard
                </p>
                <p className="text-sm text-red-200">{guardMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gold/10">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-background font-semibold gold-glow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Royal Guard is reviewing...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" />
                Claim Crown
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
