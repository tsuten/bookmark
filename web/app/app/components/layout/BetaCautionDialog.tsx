import { useEffect, useRef, useState } from "react";
import { AlertDialog } from "radix-ui";
import { acceptBetaCaution, isBetaCautionAccepted } from "~/lib/beta-caution";

const SHAKE_DURATION_MS = 400;

export function BetaCautionDialog() {
  const [open, setOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isBetaCautionAccepted()) {
      setOpen(true);
    }
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const triggerShake = () => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setShaking(true);
    shakeTimerRef.current = setTimeout(
      () => setShaking(false),
      SHAKE_DURATION_MS,
    );
  };

  const handleAccept = () => {
    acceptBetaCaution();
    setOpen(false);
  };

  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="beta-caution-overlay"
          onClick={triggerShake}
        />
        <AlertDialog.Content
          className="beta-caution-content"
          onPointerDownOutside={(event: Event) => {
            event.preventDefault();
            triggerShake();
          }}
          onEscapeKeyDown={(event: KeyboardEvent) => {
            event.preventDefault();
          }}
        >
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            We're in beta!
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            We're currently in beta. Features may change without notice, and
            data may be lost. Please use the service at your own discretion.
          </AlertDialog.Description>
          <AlertDialog.Action
            className={`beta-caution-action${shaking ? " beta-caution-action--shake" : ""}`}
            onClick={handleAccept}
          >
            I agree
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
