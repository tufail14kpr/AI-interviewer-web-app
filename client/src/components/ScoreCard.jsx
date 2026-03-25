export const ScoreCard = ({ label, value, accent = 'gold' }) => (
  <article className={`score-card score-card-${accent}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
)

