// Anillo de progreso (0-100).
export default function Anillo({ valor = 0, tamano = 56, grosor = 7, children }) {
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const progreso = Math.max(0, Math.min(100, valor));

  return (
    <div style={{ position: "relative", width: tamano, height: tamano }} className="anillo">
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} aria-hidden="true">
        <circle className="anillo-fondo" cx={tamano / 2} cy={tamano / 2} r={radio} fill="none" strokeWidth={grosor} />
        <circle
          className="anillo-valor"
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - progreso / 100)}
          transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        />
      </svg>
      {children && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
      )}
    </div>
  );
}
