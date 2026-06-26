const fs = require('fs');
const path = require('path');

const deitiesList = [
  { file: 'default_vinayagar.svg', tamil: 'விநாயகர்', english: 'Vinayagar' },
  { file: 'default_murugan.svg', tamil: 'முருகன்', english: 'Murugan' },
  { file: 'default_shivan.svg', tamil: 'சிவன்', english: 'Shivan' },
  { file: 'default_perumal.svg', tamil: 'பெருமாள் / விஷ்ணு', english: 'Perumal / Vishnu' },
  { file: 'default_amman.svg', tamil: 'அம்மன்', english: 'Amman' },
  { file: 'default_durga.svg', tamil: 'துர்க்கை', english: 'Durga' },
  { file: 'default_dakshinamurthy.svg', tamil: 'தட்சிணாமூர்த்தி', english: 'Dakshinamurthy' },
  { file: 'default_bhairavar.svg', tamil: 'பைரவர்', english: 'Bhairavar' },
  { file: 'default_chandikeswarar.svg', tamil: 'சண்டிகேஸ்வரர்', english: 'Chandikeswarar' },
  { file: 'default_navagrahangal.svg', tamil: 'நவகிரகங்கள்', english: 'Navagrahangal' },
  { file: 'default_anjaneyar.svg', tamil: 'ஆஞ்சநேயர்', english: 'Anjaneyar' },
  { file: 'default_karuppasamy.svg', tamil: 'கருப்பசாமி', english: 'Karuppasamy' },
  { file: 'default_anumar.svg', tamil: 'அனுமார்', english: 'Anumar' },
  { file: 'default_saraswati.svg', tamil: 'சரஸ்வதி', english: 'Saraswati' },
  { file: 'default_lakshmi.svg', tamil: 'லட்சுமி', english: 'Lakshmi' },
  { file: 'default_god.svg', tamil: 'தெய்வம்', english: 'Deity' }
];

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

deitiesList.forEach(d => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="100%" stop-color="#fef3c7" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#b45309" flood-opacity="0.15" />
    </filter>
  </defs>
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" rx="24" />
  <!-- Inner Frame -->
  <rect x="8" y="8" width="184" height="184" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="4 2" rx="16" />
  <!-- Central Circle -->
  <circle cx="100" cy="100" r="50" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3" filter="url(#shadow)" />
  <!-- Symbolic Icon representation (Lotus petals style) -->
  <path d="M 100,60 C 90,80 80,90 100,115 C 120,90 110,80 100,60 Z" fill="url(#goldGrad)" opacity="0.8" />
  <circle cx="100" cy="85" r="5" fill="#ef4444" />
  <!-- Tamil & English Names -->
  <text x="100" y="145" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#78350f" text-anchor="middle">${d.tamil}</text>
  <text x="100" y="162" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#92400e" text-anchor="middle">${d.english}</text>
</svg>`;

  fs.writeFileSync(path.join(uploadsDir, d.file), svgContent, 'utf8');
  console.log(`Generated default image: ${d.file}`);
});

console.log("All default images generated successfully!");
