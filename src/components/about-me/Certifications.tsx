type Certification = {
  name: string;
  issuer: string;
  url?: string;
};

//lista de certificaciones. Se edita a mano al ir sumando cursos.
//Fuentes previstas: Coursera y bootcamp Full Stack React de Desafio Latam.
const CERTIFICATIONS: Certification[] = [
  // { name: "Full Stack JavaScript React", issuer: "Desafio Latam", url: "..." },
];

export default function Certifications() {
  const hayCertificaciones = CERTIFICATIONS.length > 0;

  return (
    <div className="rounded-xl border border-fuchsia-500/50 bg-zinc-950/60 p-5">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-fuchsia-400">
        &gt; certificaciones
      </h2>

      {!hayCertificaciones ? (
        <p className="font-mono text-xs text-zinc-500 italic">
          — para rellenar pronto: Coursera + bootcamp Full Stack React (Desafío
          Latam)
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {CERTIFICATIONS.map((cert) => (
            <li key={cert.name} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full border border-fuchsia-500 bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.9)]"
              />
              <div className="flex flex-col">
                {cert.url ? (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-zinc-200 transition hover:text-fuchsia-300 hover:underline"
                  >
                    {cert.name}
                  </a>
                ) : (
                  <span className="font-mono text-sm text-zinc-200">
                    {cert.name}
                  </span>
                )}
                <span className="font-mono text-xs text-zinc-500">
                  {cert.issuer}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
