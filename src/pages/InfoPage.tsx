import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ShieldCheck, Sparkles } from "lucide-react";

const infoPages = {
  "si-funksionon": {
    eyebrow: "Platforma",
    title: "Si funksionon",
    intro:
      "SI Parashikime eshte nje treg mendimi ku lexuesit vendosin kreditet e tyre mbi skenaret qe besojne se kane me shume gjasa te ndodhin.",
    sections: [
      {
        heading: "1. Zgjidh tregun",
        body:
          "Cdo treg paraqet nje pyetje te qarte. Ti mund te hysh ne nje treg, te lexosh kontekstin editorial dhe te shohesh si po pozicionohet komuniteti.",
      },
      {
        heading: "2. Vendos parashikimin",
        body:
          "Kur mendon se nje rezultat ka vlere, vendos nje parashikim ne Po ose Jo. Koeficientet pershtaten sipas volumit dhe levizjeve te tregut.",
      },
      {
        heading: "3. Ndiq rezultatin",
        body:
          "Pas zgjidhjes se tregut, sistemi llogarit rezultatin dhe perditeson bilancin, saktesine dhe historikun e secilit perdorues.",
      },
    ],
    icon: Sparkles,
  },
  "kushtet-e-perdorimit": {
    eyebrow: "Platforma",
    title: "Kushtet e perdorimit",
    intro:
      "Pjesemarrja ne SI Parashikime behet sipas rregullave te platformes dhe standardeve te komunitetit te Gazeta Si.",
    sections: [
      {
        heading: "Perdorimi i krediteve",
        body:
          "Kreditet SI jane nje mekanizem reputacional dhe nuk perfaqesojne vlere monetare. Ato nuk mund te terhiqen ose te konvertohen ne para.",
      },
      {
        heading: "Sjellja ne platforme",
        body:
          "Perdoruesit duhet te veprojne me integritet, pa manipulim, pa mashtrim dhe pa tentativa per te demtuar cilesine e tregut apo komunitetit.",
      },
      {
        heading: "Vendimet editoriale",
        body:
          "Platforma rezervon te drejten te moderoje tregje, te permiresoje formulimet dhe te nderhyje ne rast abuzimesh ose paqartesish faktike.",
      },
    ],
    icon: BookOpen,
  },
  "integriteti-i-tregut": {
    eyebrow: "Platforma",
    title: "Integriteti i tregut",
    intro:
      "Besueshmeria e tregut varet nga pyetje te qarta, transparence ne zgjidhje dhe rregulla te njejta per te gjithe.",
    sections: [
      {
        heading: "Pyetje te qarta",
        body:
          "Cdo treg duhet te kete nje formulim te verifikueshem dhe nje rezultat qe mund te percaktohet pa paqartesi.",
      },
      {
        heading: "Zgjidhje te dokumentuara",
        body:
          "Kur nje treg mbyllet, zgjidhja duhet te bazohet ne burime publike, dokumente zyrtare ose raportim te besueshem.",
      },
      {
        heading: "Mbrojtje ndaj manipulimit",
        body:
          "Aktiviteti i dyshimte, koordinimi i qellimshem dhe sjelljet qe synojne te shtremberojne tregun mund te kufizohen ose te penalizohen.",
      },
    ],
    icon: ShieldCheck,
  },
  "qendra-e-ndihmes": {
    eyebrow: "Burime",
    title: "Qendra e ndihmes",
    intro:
      "Ketu gjen udhezimet baze per llogarine, balancen, tregjet dhe menyren si funksionon pervoja ne platforme.",
    sections: [
      {
        heading: "Llogaria dhe hyrja",
        body:
          "Nese ke probleme me hyrjen ose me krijimin e llogarise, kontrollo email-in e verifikimit dhe ploteso te dhenat baze te kerkuara.",
      },
      {
        heading: "Balanca dhe kreditet",
        body:
          "Balanca e profilit perditesohet sipas krediteve qe ke fituar, humbur ose marre nga mekanizmat e platformes.",
      },
      {
        heading: "Kontakti me redaksine",
        body:
          "Per pyetje mbi tregjet, sugjerime ose raportime problemi, perdor kanalet zyrtare te kontaktit te Gazeta Si.",
      },
    ],
    icon: BookOpen,
  },
  siguria: {
    eyebrow: "Burime",
    title: "Siguria",
    intro:
      "Mbrojtja e llogarive dhe e integritetit te platformes eshte nje pjese thelbesore e pervojes se perdoruesit.",
    sections: [
      {
        heading: "Mbro llogarine tende",
        body:
          "Perdor nje fjalekalim te forte, unik dhe mos e ndaje me persona te tjere. Ndrysho kredencialet nese dyshon per akses te paautorizuar.",
      },
      {
        heading: "Ruajtja e te dhenave",
        body:
          "Platforma synon te minimizoje ekspozimin e te dhenave personale dhe te ruaje vetem informacionin e nevojshem per funksionimin e llogarise.",
      },
      {
        heading: "Raportimi i incidenteve",
        body:
          "Nese veren sjellje te dyshimta, probleme me sigurine ose tentativa abuzimi, raportoji sa me shpejt ne kanalet zyrtare.",
      },
    ],
    icon: ShieldCheck,
  },
  "standardet-editoriale": {
    eyebrow: "Burime",
    title: "Standardet editoriale",
    intro:
      "Tregjet duhet te mbeshteten nga raportim serioz, qartesi ne pyetje dhe standarde te njejta editoriale ne publikim dhe zgjidhje.",
    sections: [
      {
        heading: "Burime te verifikueshme",
        body:
          "Pyetjet dhe zgjidhjet duhet te mbeshteten nga dokumente publike, raportim i besueshem dhe burime qe mund te kontrollohen.",
      },
      {
        heading: "Neutralitet ne formulim",
        body:
          "Formulimet e tregut duhet te shmangin gjuhen e paqarte, sugjestive ose te njeanshme qe mund te ndikojne padrejtesisht pjesemarresit.",
      },
      {
        heading: "Pavaresi editoriale",
        body:
          "Vendimet mbi formulimin, perditesimin dhe zgjidhjen e tregjeve duhet te udhehiqen nga standarde editoriale dhe jo nga preferenca individuale.",
      },
    ],
    icon: Sparkles,
  },
} as const;

export default function InfoPage() {
  const { slug } = useParams<{ slug: keyof typeof infoPages }>();
  const page = slug ? infoPages[slug] : undefined;

  if (!page) {
    return (
      <div className="container py-16">
        <div className="rounded-[32px] border border-zinc-200 bg-white p-10 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Gabim</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Faqja nuk u gjet
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-500">
            Kjo faqe informative nuk ekziston ose eshte zhvendosur.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kthehu ne kryefaqe
          </Link>
        </div>
      </div>
    );
  }

  const Icon = page.icon;

  return (
    <div className="container py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          Kthehu ne kryefaqe
        </Link>

        <section className="mt-6 rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                {page.eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                {page.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-zinc-500">
                {page.intro}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            {page.sections.map((section) => (
              <div key={section.heading} className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-6">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                  {section.heading}
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
