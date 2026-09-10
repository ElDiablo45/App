import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/features/layout/site-footer"

export const metadata: Metadata = {
  title: "Términos y condiciones — Hunt Hispano",
  description:
    "Términos y condiciones de Hunt Hispano, proyecto de fans no oficial de Hunt: Showdown.",
}

export default function TerminosPage() {
  return (
    <div className="hunt-legal-page">
      <main className="hunt-legal-main">
        <Link className="hunt-legal-back" href="/">
          ‹ Volver
        </Link>
        <p className="hunt-legal-kicker">HUNT HISPANO · FANS, NO OFICIAL</p>
        <h1 className="hunt-legal-title">Términos y condiciones</h1>
        <p className="hunt-legal-updated">Última actualización: 2026</p>

        <section className="hunt-legal-card">
          <h2>1. Proyecto de fans, sin afiliación</h2>
          <p>
            Hunt Hispano es un proyecto de fans sin ánimo de lucro. No está
            afiliado, respaldado, patrocinado ni aprobado por Crytek GmbH.
            HUNT: Showdown y todos sus contenidos, marcas, imágenes y
            materiales pertenecen a Crytek.
          </p>
          <p>
            Web oficial del juego:{" "}
            <a
              href="https://www.huntshowdown.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              huntshowdown.com
            </a>{" "}
            · Web del titular de los derechos:{" "}
            <a
              href="https://www.crytek.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              crytek.com
            </a>{" "}
            · Página en Steam:{" "}
            <a
              href="https://store.steampowered.com/app/594650/Hunt_Showdown_1896/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hunt: Showdown 1896
            </a>
            .
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>2. Qué ofrece esta app</h2>
          <p>
            Espacio comunitario en español para organizarse, ver actividad y
            gestionar dotaciones. El acceso con Discord es opcional y la
            entrada como invitado solo permite ver el inicio.
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>3. Sin almacenamiento personal</h2>
          <p>
            No guardamos información personal en nuestros servidores. Los datos
            mostrados provienen de tu sesión de Discord y solo se usan en ese
            momento para mostrarte el contenido.
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>4. Uso aceptable</h2>
          <ul>
            <li>No suplantar a otros usuarios ni al equipo de Hunt Hispano.</li>
            <li>No publicar contenido ilegal, ofensivo o que infrinja derechos de terceros.</li>
            <li>No intentar vulnerar, saturar ni automatizar accesos abusivos a la app.</li>
            <li>No usar marcas de Crytek como si fueran propias ni sugerir oficialidad.</li>
          </ul>
        </section>

        <section className="hunt-legal-card">
          <h2>5. Propiedad intelectual</h2>
          <p>
            Todo el contenido de Hunt: Showdown pertenece a Crytek. Si eres
            titular de derechos y consideras que algún contenido debe
            retirarse, escríbenos desde el Discord de la comunidad y lo
            revisaremos.
          </p>
        </section>

        <section className="hunt-legal-card">
          <h2>6. Disponibilidad y cambios</h2>
          <p>
            La app se ofrece &quot;tal cual&quot;, puede fallar o cambiar sin
            aviso. Podemos suspender cuentas o accesos que incumplan estos
            términos.
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
