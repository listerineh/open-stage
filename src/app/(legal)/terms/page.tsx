import type { Metadata } from 'next';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';

export const metadata: Metadata = {
  title: 'Condiciones del Servicio | OpenStage',
  description: 'Condiciones del servicio y términos de uso de OpenStage.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <BackButton />

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-3xl font-bold text-white">Condiciones del Servicio</h1>
          <p className="text-zinc-400">Última actualización: 13 de julio de 2026</p>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">1. Aceptación de las Condiciones</h2>
            <p className="text-zinc-300">
              Al acceder y utilizar OpenStage (&quot;el Servicio&quot;), aceptas quedar vinculado
              por estas Condiciones del Servicio. Si no estás de acuerdo con alguna parte de estas
              condiciones, no podrás acceder al Servicio.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">2. Descripción del Servicio</h2>
            <p className="text-zinc-300">
              OpenStage es una plataforma web de código abierto diseñada para músicos y bandas que
              ofrece herramientas para:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Generación automática de clips de video optimizados para redes sociales</li>
              <li>Gestión colaborativa de bandas con roles y permisos</li>
              <li>
                Visualización unificada de métricas de plataformas sociales (Analytics Dashboard)
              </li>
              <li>Integración con Google Drive, Spotify, YouTube, Instagram y TikTok</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">3. Cuentas de Usuario</h2>

            <h3 className="text-lg font-medium text-zinc-200">3.1 Registro</h3>
            <p className="text-zinc-300">
              Para usar el Servicio debes crear una cuenta con información veraz y actualizada. Eres
              responsable de mantener la confidencialidad de tu contraseña y de todas las
              actividades realizadas bajo tu cuenta.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">3.2 Edad mínima</h3>
            <p className="text-zinc-300">
              Debes tener al menos 13 años para usar el Servicio. Si eres menor de 18 años, debes
              contar con el consentimiento de un tutor legal.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">3.3 Cancelación</h3>
            <p className="text-zinc-300">
              Puedes cancelar tu cuenta en cualquier momento desde la configuración. Nos reservamos
              el derecho de suspender o cancelar cuentas que violen estas condiciones.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">4. Uso Aceptable</h2>
            <p className="text-zinc-300">Te comprometes a no usar el Servicio para:</p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Subir o procesar contenido que infrinja derechos de autor de terceros</li>
              <li>Distribuir malware, virus u otro software dañino</li>
              <li>Realizar actividades ilegales o que violen derechos de terceros</li>
              <li>Hacer scraping masivo o sobrecargar intencionalmente la infraestructura</li>
              <li>Suplantar a otras personas o entidades</li>
              <li>Usar el Servicio de forma que perjudique a otros usuarios</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">5. Contenido del Usuario</h2>

            <h3 className="text-lg font-medium text-zinc-200">5.1 Propiedad</h3>
            <p className="text-zinc-300">
              Conservas todos los derechos de propiedad intelectual sobre el contenido que subes o
              generas con el Servicio. Al usar OpenStage, nos otorgas una licencia limitada, no
              exclusiva, para procesar ese contenido con el único fin de prestar el Servicio.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">5.2 Responsabilidad</h3>
            <p className="text-zinc-300">
              Eres el único responsable del contenido que procesas. Debes asegurarte de tener los
              derechos necesarios sobre los videos, audios e imágenes que utilices.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">5.3 Procesamiento local</h3>
            <p className="text-zinc-300">
              El Generador de Clips procesa video directamente en tu navegador usando tecnología
              WebAssembly. Los archivos de video no se envían a nuestros servidores.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">
              6. Integraciones con Terceros (APIs)
            </h2>
            <p className="text-zinc-300">
              El Servicio se integra con plataformas de terceros (Google/YouTube, Spotify,
              Instagram, TikTok). Al conectar estas cuentas:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Aceptas también los Términos de Servicio de cada plataforma respectiva</li>
              <li>
                Para YouTube: el uso está sujeto a los{' '}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Términos de Servicio de YouTube
                </a>
              </li>
              <li>OpenStage solo accede a datos de lectura; nunca publicamos en tu nombre</li>
              <li>
                Puedes revocar el acceso en cualquier momento desde el Analytics Dashboard o desde
                la configuración de cada plataforma
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">7. Disponibilidad del Servicio</h2>
            <p className="text-zinc-300">
              Nos esforzamos por mantener el Servicio disponible de forma continua, pero no
              garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimientos
              programados o sufrir interrupciones no previstas. No somos responsables por pérdidas
              derivadas de la no disponibilidad temporal del Servicio.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">8. Código Abierto</h2>
            <p className="text-zinc-300">
              OpenStage es software de código abierto publicado bajo la{' '}
              <a
                href="https://github.com/listerineh/open-stage/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300"
              >
                Licencia MIT
              </a>
              . Puedes revisar, bifurcar y contribuir al código fuente en GitHub. Sin embargo, el
              uso del servicio alojado en openstage.online está sujeto a estas condiciones.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">9. Limitación de Responsabilidad</h2>
            <p className="text-zinc-300">
              El Servicio se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;,
              sin garantías de ningún tipo. En ningún caso OpenStage será responsable por daños
              indirectos, incidentales, especiales o consecuentes derivados del uso o la
              imposibilidad de uso del Servicio.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">10. Cambios en las Condiciones</h2>
            <p className="text-zinc-300">
              Podemos modificar estas condiciones en cualquier momento. Te notificaremos sobre
              cambios significativos mediante un aviso en la plataforma o por correo electrónico. El
              uso continuado del Servicio tras los cambios implica la aceptación de las nuevas
              condiciones.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">11. Privacidad</h2>
            <p className="text-zinc-300">
              El uso del Servicio está también sujeto a nuestra{' '}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
                Política de Privacidad
              </Link>
              , que se incorpora por referencia a estas condiciones.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">12. Contacto</h2>
            <p className="text-zinc-300">
              Para cualquier pregunta sobre estas condiciones, contáctanos en:
            </p>
            <ul className="list-none pl-0 text-zinc-300">
              <li>
                Email:{' '}
                <a
                  href="mailto:hello@openstage.online"
                  className="text-violet-400 hover:text-violet-300"
                >
                  hello@openstage.online
                </a>
              </li>
              <li>
                GitHub:{' '}
                <a
                  href="https://github.com/listerineh/open-stage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  github.com/listerineh/open-stage
                </a>
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
