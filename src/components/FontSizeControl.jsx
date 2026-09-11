export default function FontSizeControl({ value, onChange, min = 0.6, max = 1.8, step = 0.1 }) {
  const round = (n) => Math.round(n * 100) / 100;
  const decrease = () => onChange(round(Math.max(min, value - step)));
  const increase = () => onChange(round(Math.min(max, value + step)));

  return (
    <div className="font-size-control" role="group" aria-label="Adjust text size">
      <button type="button" onClick={decrease} disabled={value <= min} aria-label="Decrease font size" title="Decrease font size">
        <svg width="18" height="16" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="17" fontSize="14" fontWeight="700" fill="currentColor" fontFamily="inherit">A</text>
          <text x="15" y="9" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="inherit">−</text>
        </svg>
      </button>
      <button type="button" onClick={increase} disabled={value >= max} aria-label="Increase font size" title="Increase font size">
        <svg width="20" height="18" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="19" fontSize="18" fontWeight="700" fill="currentColor" fontFamily="inherit">A</text>
          <text x="18" y="9" fontSize="12" fontWeight="700" fill="currentColor" fontFamily="inherit">+</text>
        </svg>
      </button>
    </div>
  );
}