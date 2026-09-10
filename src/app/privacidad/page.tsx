import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/features/layout/site-footer"

export const metadata: Metadata = {
  title: "Política de privacidad — Hunt Hispano",
  description:
    "Política de privacidad de Hunt Hispano: no guardamos información personal, los datos provienen de tu sesión de Discord.",
}

export default function PrivacidadPage() {
  return (
    <div className="hunt-legal-page">
      <main className="hunt-legal-main">
        <Link className="hunt-legal-back" href="/">
          ‹ Volver
        </Link>
        <p className="hunt-legal-kicker">HUNT HISPANO · FANS, NO OFICIAL</p>
        <h1 className="hunt-legal-title">Política de privacidad</h1>
        <p className="hunt-legal-updated">Última actualización: 2026</p>

        <section className="hunt-legal-card">
          <h2>1. Quiénes somos</h2>
          <p>
            Hunt Hispano es un proyecto de fans en español, sin afiliación con
            Crytek GmbH. HUNT: Showdown pertenece a Crytek:{" "}
            <a
              href="https://www.huntshowdown.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              huntshowdown.com
            </a>{" "}
            ·{" "}
            <a
              href="https://www.crytek.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              crytek.com
            </a>
            .
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>2. No guardamos información personal</h2>
          <p>
            No guardamos información personal en nuestros servidores. Los datos
            que ves en pantalla provienen de tu sesión de Discord y solo se
            usan en ese momento para mostrarte el contenido. Al cerrar sesión,
            dejan de mostrarse.
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>3. Cookies técnicas</h2>
          <p>
            Solo usamos las cookies técnicas necesarias para mantener tu sesión
            (por ejemplo, recordar que has iniciado sesión o que entraste como
            invitado). No usamos cookies de publicidad ni de seguimiento.
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>4. Enlaces a terceros</h2>
          <p>
            Enlazamos a sitios oficiales de Crytek, Hunt: Showdown y Steam.
            Esos sitios tienen sus propias políticas de privacidad, que te
            recomendamos revisar.
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>5. Tus derechos</h2>
          <p>
            Como no almacenamos datos personales, no hay nada que rectificar ni
            suprimir en nuestros sistemas. Si tienes cualquier duda, contáctanos
            desde el Discord de la comunidad Hunt Hispano.
          </p>
        </section>

        <p className="hunt-legal-note">
          Texto informativo, no constituye asesoramiento legal.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
