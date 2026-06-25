interface Props {
  open: boolean;
  onClose: () => void;
}

function PrivacyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="admin-header" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)' }}>
          <i className="fas fa-shield-halved" style={{ color: '#fbbf24' }}></i>
          <h2>Aviso Legal y Privacidad</h2>
          <button className="admin-close" onClick={onClose}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="admin-body">
          <div className="modal-privacy-content">
            <section>
              <h3><i className="fas fa-database"></i> Almacenamiento de datos</h3>
              <ul>
                <li>Los datos de los pedidos se almacenan únicamente durante un máximo de <strong>5 días</strong> desde su creación.</li>
                <li>Transcurrido ese plazo, los datos se eliminan automáticamente de nuestros servidores.</li>
                <li>Las sesiones inactivas durante más de 24 horas también se eliminan automáticamente.</li>
              </ul>
            </section>

            <section>
              <h3><i className="fas fa-hand-peace"></i> Uso de la información</h3>
              <ul>
                <li>Los datos recopilados se utilizan <strong>exclusivamente</strong> para gestionar los pedidos colaborativos dentro de cada sesión.</li>
                <li>No se comparten con terceros ni se utilizan para ninguna actividad económica, comercial o publicitaria.</li>
                <li>No se realiza ningún tipo de perfilado, análisis comercial o venta de datos.</li>
              </ul>
            </section>

            <section>
              <h3><i className="fas fa-user-secret"></i> Información personal</h3>
              <ul>
                <li>El único dato personal solicitado es un nombre elegido libremente por el usuario para identificarse en la sesión.</li>
                <li>No se requieren correos electrónicos, números de teléfono ni ningún otro dato personal.</li>
                <li>No se utilizan cookies de rastreo ni sistemas de analítica externa.</li>
              </ul>
            </section>

            <section>
              <h3><i className="fas fa-chart-simple"></i> Estadísticas de uso</h3>
              <ul>
                <li>Se recogen <strong>estadísticas agregadas y anónimas</strong> sobre el uso de la plataforma: número de sesiones, pedidos, categorías populares y franjas horarias de actividad.</li>
                <li>Estos datos son <strong>totalmente anonimizados</strong>: no incluyen nombres de usuario, IPs, códigos de sesión ni ningún dato que permita identificar a personas concretas.</li>
                <li>Las estadísticas se usan únicamente para entender el funcionamiento del servicio y mejorar la experiencia.</li>
              </ul>
            </section>

            <section>
              <h3><i className="fas fa-gavel"></i> Base legal</h3>
              <p>Este servicio se ofrece como una herramienta interna para facilitar la toma de pedidos en grupo. El tratamiento de datos se limita al mínimo necesario para el funcionamiento del servicio, conforme al principio de minimización de datos del RGPD.</p>
            </section>

            <section>
              <h3><i className="fas fa-shield"></i> Seguridad y protección contra abusos</h3>
              <ul>
                <li>Se implementan sistemas automáticos de <strong>detección y bloqueo</strong> de direcciones IP que superen límites razonables de peticiones.</li>
                <li>Las IPs que excedan el límite de peticiones de forma reiterada son <strong>bloqueadas automáticamente</strong> durante 24 horas.</li>
                <li>Los administradores pueden bloquear manualmente IPs que se comporten de forma maliciosa.</li>
                <li>Cualquier usuario puede verificar si su IP está bloqueada desde el panel de administración.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;
