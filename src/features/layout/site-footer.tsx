"use client"

import Link from "next/link"

const OFFICIAL_LINKS = [
  { href: "https://www.huntshowdown.com/", label: "Hunt: Showdown oficial" },
  { href: "https://www.crytek.com/", label: "Crytek" },
  {
    href: "https://store.steampowered.com/app/594650/Hunt_Showdown_1896/",
    label: "Hunt en Steam",
  },
] as const

export function SiteFooter() {
  return (
    <footer className="hunt-footer" aria-label="Pie de página">
      <div className="hunt-footer-inner">
        <div className="hunt-footer-grid">
          <div className="hunt-footer-col">
            <p className="hunt-footer-brand">HUNT HISPANO</p>
            <p className="hunt-footer-disclaimer">
              Proyecto de fans no oficial. No está afiliado, respaldado ni
              aprobado por Crytek. HUNT: Showdown es una marca registrada de
              Crytek GmbH.
            </p>
            <p className="hunt-footer-disclaimer">
              No guardamos información personal. Los datos mostrados provienen
              de tu sesión de Discord.
            </p>
          </div>

          <nav className="hunt-footer-col" aria-label="Legal">
            <p className="hunt-footer-title">Legal</p>
            <Link className="hunt-footer-link" href="/terminos">
              Términos y condiciones
            </Link>
            <Link className="hunt-footer-link" href="/privacidad">
              Política de privacidad
            </Link>
          </nav>

          <nav className="hunt-footer-col" aria-label="Enlaces oficiales">
            <p className="hunt-footer-title">Oficial</p>
            {OFFICIAL_LINKS.map((l) => (
              <a
                key={l.href}
                className="hunt-footer-link"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hunt-footer-bottom">
          <span>© {new Date().getFullYear()} Hunt Hispano · Fans, no oficial</span>
          <span className="hunt-footer-sep" aria-hidden="true">
            ·
          </span>
          <span>
            Todo el contenido de Hunt: Showdown pertenece a{" "}
            <a
              href="https://www.crytek.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hunt-footer-link hunt-footer-link--inline"
            >
              Crytek
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
