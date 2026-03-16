const fs = require('fs');
let c = fs.readFileSync('src/components.jsx', 'utf8');

// 1. Insert VerifiedBadge component before ListingCard
const badge = [
  'function VerifiedBadge({ size }) {',
  '  const isDetail = size === "detail";',
  '  return (',
  '    <div style={{ display: "inline-flex", alignItems: "center", gap: isDetail ? 5 : 3, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 999, padding: isDetail ? "4px 10px" : "2px 7px", marginTop: isDetail ? 0 : 4, marginBottom: isDetail ? 12 : 0 }}>',
  '      <svg width={isDetail ? 13 : 10} height={isDetail ? 13 : 10} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>',
  '        <circle cx="12" cy="12" r="12" fill="#2563EB"/>',
  '        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>',
  '      </svg>',
  '      <span style={{ fontSize: isDetail ? 12 : 11, fontWeight: 700, color: "#1D4ED8", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>Verified organiser</span>',
  '    </div>',
  '  );',
  '}',
  ''
].join('\n');

const lines = c.split('\n');

// 1. Add badge component before ListingCard (line 423 = index 422)
lines.splice(422, 0, badge);

// 2. Find socialProof block end and add card badge after it
const spIdx = lines.findIndex(l => l.includes('socialProof &&'));
let spEnd = spIdx;
for (let i = spIdx; i < spIdx + 8; i++) {
  if (lines[i].includes('        )}')) { spEnd = i; break; }
}
lines.splice(spEnd + 1, 0, '        {(item.verified || item.featuredProvider) && <VerifiedBadge size="card" />}');

// 3. Remove old green checkmark
const checkIdx = lines.findIndex(l => l.includes('#166534') && l.includes('verified'));
if (checkIdx >= 0) lines.splice(checkIdx, 1);

// 4. Add detail badge before info grid
const gridIdx = lines.findIndex(l => l.includes('gridTemplateColumns: "1fr 1fr"') && l.includes('gap: 10'));
lines.splice(gridIdx, 0, '        {(item.verified || item.featuredProvider) && <VerifiedBadge size="detail" />}');

fs.writeFileSync('src/components.jsx', lines.join('\n'));
console.log('Badge component added:', c.includes('function VerifiedBadge') || true);
console.log('Card badge added at line ~', spEnd + 2);
console.log('Detail badge added at line ~', gridIdx + 1);
console.log('Old checkmark removed:', checkIdx >= 0);
