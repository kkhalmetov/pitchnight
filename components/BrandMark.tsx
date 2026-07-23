import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      className="brand-mark"
      href="/"
      aria-label="TYNYS Mektep — басты бет"
    >
      <svg
        className="brand-mark__symbol"
        viewBox="0 0 52 52"
        aria-hidden="true"
        focusable="false"
      >
        <path className="brand-mark__frame" d="M1 1h50v50H1z" />
        <circle className="brand-mark__sun" cx="38" cy="14" r="6" />
        <path className="brand-mark__letter" d="M10 15h18M19 15v25" />
        <path
          className="brand-mark__air"
          d="M29 29c5-4 10-4 15 0M29 38c5-4 10-4 15 0"
        />
      </svg>

      <span className="brand-mark__lockup">
        <strong>TYNYS</strong>
        <span>Mektep</span>
      </span>
    </Link>
  );
}
