"use client";

import { trackEvent } from "@/lib/track";

type TrackedLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  eventParams?: Record<string, string>;
};

/** A plain anchor that records a conversion event when clicked (WhatsApp, booking, email). */
export default function TrackedLink({ event, eventParams, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent(event, eventParams);
        onClick?.(e);
      }}
    />
  );
}
