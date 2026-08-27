import Link from 'next/link';
import { Twitter, Github, Rss, Zap, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
                <Zap className="h-4 w-4 text-white" fill="currentColor" />
              </span>
              <span>
                <span className="text-lg font-bold text-foreground">Tatrix</span>
                <span className="text-lg font-bold text-primary">360</span>
              </span>
            </Link>
            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Tech, decoded
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Independent tech reporting on AI, gadgets, and the platforms that shape our digital lives.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="https://twitter.com" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/40 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="https://github.com" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/40 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="/rss.xml" aria-label="RSS" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/40 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary">
                <Rss className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Sections</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/ai" className="transition-colors hover:text-primary">AI</Link></li>
              <li><Link href="/category/android" className="transition-colors hover:text-primary">Android</Link></li>
              <li><Link href="/category/ios" className="transition-colors hover:text-primary">iOS</Link></li>
              <li><Link href="/category/gadgets" className="transition-colors hover:text-primary">Gadgets</Link></li>
              <li><Link href="/category/deals" className="transition-colors hover:text-primary">Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="transition-colors hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
              <li><Link href="/subscribe" className="transition-colors hover:text-primary">Newsletter</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Subscribe</h4>
            <p className="mt-3 text-sm text-muted-foreground">Weekly tech briefing, no spam.</p>
            <Link
              href="/subscribe"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Mail className="h-4 w-4" />
              Join free
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
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
