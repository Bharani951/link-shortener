import { useEffect, useRef, useState } from "react";

type CopyButtonProps = {
  text: string; // what goes on the clipboard
  label: string; // the button's text — it never changes
  className?: string;
};

/**
 * A button that copies `text`, then shows a small "Copied" bubble above itself for 1.5 s.
 * The button keeps its size and label, so nothing on the page jumps.
 */
export function CopyButton({
  text,
  label,
  className = "btn",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // If the component disappears while the bubble is showing, cancel the timer.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.clearTimeout(timer.current); // clicking twice restarts the 1.5 s
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="copy-wrap">
      <button type="button" className={className} onClick={copy}>
        {label}
      </button>
      {/* Always in the page, so screen readers announce "Copied" when the text appears */}
      <span
        className="copy-tip"
        data-show={copied}
        role="status"
        aria-live="polite"
      >
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}
