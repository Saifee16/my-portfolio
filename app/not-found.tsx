import Link from "next/link";

export default function NotFound() {
  return <main className="section flex min-h-[70vh] items-center"><div className="max-w-2xl"><p className="eyebrow">404 / Not found</p><h1 className="mt-6 text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[.9] tracking-[-.07em]">That route is not part of the system.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[var(--copy)]">The page may be private, unpublished, or no longer available.</p><Link className="button button-primary mt-8" href="/">Return home</Link></div></main>;
}
