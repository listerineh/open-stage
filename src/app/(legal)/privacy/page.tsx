import type { Metadata } from 'next';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';

export const metadata: Metadata = {
  title: 'Política de Privacidad | OpenStage',
  description: 'Política de privacidad y protección de datos de OpenStage.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <BackButton />

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
          <p className="text-zinc-400">Última actualización: 13 de julio de 2026</p>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">1. Introducción</h2>
            <p className="text-zinc-300">
              En OpenStage (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la plataforma&quot;),
              nos comprometemos a proteger tu privacidad. Esta política describe cómo recopilamos,
              usamos y protegemos tu información personal cuando utilizas nuestros servicios.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">2. Información que Recopilamos</h2>

            <h3 className="text-lg font-medium text-zinc-200">2.1 Información de cuenta</h3>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Foto de perfil (si usas autenticación con Google)</li>
            </ul>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">2.2 Información de uso</h3>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Videos que procesas a través de la plataforma</li>
              <li>Clips generados y sus configuraciones</li>
              <li>Preferencias de la aplicación</li>
              <li>Datos de navegación y uso de funcionalidades</li>
            </ul>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">2.3 Información técnica</h3>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Sistema operativo</li>
              <li>Cookies y tecnologías similares</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">3. Cómo Usamos tu Información</h2>
            <p className="text-zinc-300">Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Procesar y generar clips de video</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
              <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
              <li>Detectar y prevenir fraudes o abusos</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">4. Integración con Google Drive</h2>
            <p className="text-zinc-300">
              OpenStage se integra con Google Drive para acceder a tus videos y almacenar los clips
              generados. Cuando conectas tu cuenta de Google Drive:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Solo accedemos a los archivos que tú específicamente compartes o seleccionas</li>
              <li>No almacenamos tus videos en nuestros servidores de forma permanente</li>
              <li>Los clips generados se guardan en tu propia cuenta de Google Drive</li>
              <li>
                Puedes revocar el acceso en cualquier momento desde la configuración de tu cuenta de
                Google
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">
              5. Integración con Redes Sociales (Analytics)
            </h2>
            <p className="text-zinc-300">
              OpenStage ofrece un módulo opcional de Analytics que te permite conectar tus cuentas
              de redes sociales para visualizar métricas unificadas. Esta integración es
              completamente voluntaria.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">5.1 YouTube (Google API)</h3>
            <p className="text-zinc-300">
              Cuando conectas tu cuenta de YouTube, accedemos a los siguientes datos mediante la
              Google API:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Información pública de tu canal (nombre, foto, descripción)</li>
              <li>Estadísticas del canal (suscriptores, vistas totales, número de videos)</li>
              <li>Lista de tus videos recientes y sus métricas (vistas, likes)</li>
              <li>Datos de YouTube Analytics (solo lectura)</li>
            </ul>
            <p className="mt-3 text-zinc-300">
              El uso de los datos obtenidos de las APIs de Google se rige por la{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300"
              >
                Política de Datos de Usuario de los Servicios de API de Google
              </a>
              , incluyendo los requisitos de Uso Limitado.
            </p>
            <ul className="mt-2 list-disc pl-6 text-zinc-300">
              <li>No compartimos tus datos de YouTube con terceros</li>
              <li>No usamos estos datos para publicidad</li>
              <li>
                Los tokens de acceso se almacenan de forma segura y cifrada en nuestra base de datos
              </li>
              <li>
                Puedes desconectar tu cuenta de YouTube en cualquier momento desde el Analytics
                Dashboard, o revocando el acceso desde{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  myaccount.google.com/permissions
                </a>
              </li>
            </ul>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">5.2 Spotify</h3>
            <p className="text-zinc-300">
              Al conectar Spotify accedemos a: información de tu perfil de artista, estadísticas de
              oyentes y top tracks (solo lectura). Los tokens se almacenan cifrados y puedes
              desconectarlo desde el dashboard.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">
              5.3 Instagram y TikTok (Beta)
            </h3>
            <p className="text-zinc-300">
              Estas integraciones están en beta y requieren cuentas Business/Creator. Accedemos
              únicamente a métricas públicas de tu perfil (seguidores, alcance). No publicamos
              contenido en tu nombre.
            </p>

            <p className="mt-4 text-zinc-300">
              En todos los casos: los datos de redes sociales se usan exclusivamente para mostrar
              métricas dentro de la plataforma, se almacenan en snapshots de 30 días y se eliminan
              al desconectar la cuenta.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">6. Compartir Información</h2>
            <p className="text-zinc-300">
              No vendemos ni compartimos tu información personal con terceros, excepto en los
              siguientes casos:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>
                <strong>Proveedores de servicios:</strong> Utilizamos servicios de terceros como
                Supabase (base de datos), Vercel (hosting) y Google Cloud (procesamiento) que pueden
                acceder a cierta información para proporcionar sus servicios.
              </li>
              <li>
                <strong>Requisitos legales:</strong> Podemos divulgar información si es requerido
                por ley o para proteger nuestros derechos.
              </li>
              <li>
                <strong>Con tu consentimiento:</strong> Compartiremos información cuando nos des
                permiso explícito.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">7. Seguridad de los Datos</h2>
            <p className="text-zinc-300">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu
              información, incluyendo:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
              <li>Autenticación segura mediante OAuth 2.0</li>
              <li>Acceso restringido a datos personales</li>
              <li>Monitoreo continuo de seguridad</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">8. Tus Derechos</h2>
            <p className="text-zinc-300">Tienes derecho a:</p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>
                <strong>Acceso:</strong> Solicitar una copia de tus datos personales
              </li>
              <li>
                <strong>Rectificación:</strong> Corregir datos inexactos o incompletos
              </li>
              <li>
                <strong>Eliminación:</strong> Solicitar la eliminación de tus datos
              </li>
              <li>
                <strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado
              </li>
              <li>
                <strong>Oposición:</strong> Oponerte al procesamiento de tus datos
              </li>
            </ul>
            <p className="mt-4 text-zinc-300">
              Para ejercer estos derechos, contáctanos en{' '}
              <a
                href="mailto:privacy@openstage.app"
                className="text-violet-400 hover:text-violet-300"
              >
                privacy@openstage.app
              </a>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">9. Retención de Datos</h2>
            <p className="text-zinc-300">
              Conservamos tu información mientras mantengas una cuenta activa. Si eliminas tu
              cuenta, borraremos tus datos personales en un plazo de 30 días, excepto cuando sea
              necesario conservarlos por obligaciones legales.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">10. Cookies</h2>
            <p className="text-zinc-300">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Para más
              información, consulta nuestra{' '}
              <Link href="/cookies" className="text-violet-400 hover:text-violet-300">
                Política de Cookies
              </Link>
              .
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">11. Cambios a esta Política</h2>
            <p className="text-zinc-300">
              Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios
              significativos mediante un aviso en la plataforma o por correo electrónico.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">12. Contacto</h2>
            <p className="text-zinc-300">
              Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
            </p>
            <ul className="list-none pl-0 text-zinc-300">
              <li>
                Email:{' '}
                <a
                  href="mailto:privacy@openstage.app"
                  className="text-violet-400 hover:text-violet-300"
                >
                  privacy@openstage.app
                </a>
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
