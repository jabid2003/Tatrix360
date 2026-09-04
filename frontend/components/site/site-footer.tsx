'use client';

import Link from 'next/link';
import { Twitter, Github, Zap, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      {/* Footer Links */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </span>
              <span className="text-base font-bold text-foreground">
                <span>Tatrix</span>
                <span className="text-primary">360</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Sharp, independent tech reporting on AI, systems, devices, and the apps that shape our digital lives.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Link href="https://twitter.com" aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-3.5 w-3.5" />
              </Link>
              <Link href="https://github.com" aria-label="GitHub" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
                <Github className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Sections</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/ai-news" className="transition-colors hover:text-foreground">AI News</Link></li>
              <li><Link href="/category/os-news" className="transition-colors hover:text-foreground">OS News</Link></li>
              <li><Link href="/category/top-devices" className="transition-colors hover:text-foreground">Top Mobiles & Laptops</Link></li>
              <li><Link href="/category/apps-update" className="transition-colors hover:text-foreground">Apps Update</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
              <li><Link href="/latest" className="transition-colors hover:text-foreground">Latest</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Subscribe</h4>
            <p className="mt-3 text-sm text-muted-foreground">Weekly tech briefing, no spam.</p>
            <Link
              href="/subscribe"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Join free
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Tatrix360. Tech, decoded.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with care for readers who care about tech.
          </p>
        </div>
      </div>
    </footer>
  );
}
