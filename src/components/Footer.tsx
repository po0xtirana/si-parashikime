import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  platform: [
    { label: "Si funksionon", href: "/info/si-funksionon" },
    { label: "Kushtet e perdorimit", href: "/info/kushtet-e-perdorimit" },
    { label: "Integriteti i tregut", href: "/info/integriteti-i-tregut" },
  ],
  resources: [
    { label: "Qendra e ndihmes", href: "/info/qendra-e-ndihmes" },
    { label: "Siguria", href: "/info/siguria" },
    { label: "Standardet editoriale", href: "/info/standardet-editoriale" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900 text-zinc-400">
      <div className="container grid gap-8 py-14 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-4">
          <div>
            <p className="font-serif text-2xl font-semibold text-white">SI Parashikime</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
              Treg parashikimi per lexues qe kerkojne me shume sinjal dhe me pak zhurme.
            </p>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="rounded-full border border-zinc-800 p-2 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-200">Platforma</p>
          <div className="mt-4 space-y-3 text-sm">
            {footerLinks.platform.map((item) => (
              <Link key={item.href} to={item.href} className="block transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-200">Burime</p>
          <div className="mt-4 space-y-3 text-sm">
            {footerLinks.resources.map((item) => (
              <Link key={item.href} to={item.href} className="block transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-200">Newsletter</p>
          <p className="mt-4 text-sm leading-6">
            Analiza javore, zhvillime editoriale dhe perditesime mbi integritetin direkt ne email.
          </p>
          <div className="mt-5 space-y-3">
            <Input
              type="email"
              placeholder="Adresa e email-it"
              className="h-11 rounded-full border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
            />
            <Button className="h-11 w-full rounded-full bg-white text-zinc-900 hover:bg-zinc-200">
              Abonohu
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
