export const typeColors = {
  "Messy Play": { bg: "#F3E5F5", color: "#7B68EE", pin: "#7B68EE" },
  "Soft Play": { bg: "#E0F7FA", color: "#00897B", pin: "#2EC4B6" },
  "Playgroup": { bg: "#FFF3E0", color: "#E65100", pin: "#FF9800" },
  "Story Time": { bg: "#FCE4EC", color: "#C62828", pin: "#F48FB1" },
  "Outdoor": { bg: "#E8F5E9", color: "#2E7D32", pin: "#66BB6A" },
  "Music": { bg: "#FFF9C4", color: "#F57F17", pin: "#FFD54F" },
  "Performing Arts": { bg: "#EDE7F6", color: "#4527A0", pin: "#B39DDB" },
  "Sport": { bg: "#E3F2FD", color: "#1565C0", pin: "#42A5F5" },
  "Baking": { bg: "#FBE9E7", color: "#BF360C", pin: "#FF8A65" },
  "Arts & Crafts": { bg: "#F3E5F5", color: "#6A1B9A", pin: "#CE93D8" },
  "Swimming": { bg: "#E0F7FA", color: "#0277BD", pin: "#4FC3F7" },
};

const parkingLabels = { free: "🅿️ Free parking", "free-3hrs": "🅿️ Free (3hrs)", paid: "🅿️ Paid parking", street: "🅿️ Street parking", varies: "🅿️ Parking varies", none: "🚫 No parking" };

export const dayMap = { "Mondays": [1], "Tuesdays": [2], "Wednesdays": [3], "Thursdays": [4], "Fridays": [5], "Saturdays": [6], "Sundays": [0],
  "Tuesdays & Thursdays": [2,4], "Tuesdays & Fridays": [2,5], "Mondays & Wednesdays": [1,3], "Thursdays & Sundays": [4,0],
  "Mon–Fri": [1,2,3,4,5], "Mon–Fri (term time)": [1,2,3,4,5], "Mon–Sat": [1,2,3,4,5,6], "Mon–Sat (closed Wed)": [1,2,4,5,6],
  "Daily": [0,1,2,3,4,5,6], "Fridays (term time)": [5], "Weekends & school holidays": [0,6],
  "Various": [0,1,2,3,4,5,6], "Various + holidays": [0,1,2,3,4,5,6], "Seasonal (May–Sep)": [0,1,2,3,4,5,6],
  "Last Friday of month": [5],
};

const popularityScore = (l) => {
  let s = 0;
  if (l.type === "Soft Play") s += 8;
  if (l.type === "Outdoor") s += 7;
  if (l.type === "Messy Play") s += 6;
  if (l.type === "Playgroup") s += 5;
  if (l.type === "Swimming") s += 5;
  if (l.type === "Sport") s += 4;
  if (l.type === "Music") s += 4;
  if (l.type === "Arts & Crafts") s += 4;
  if (l.type === "Story Time") s += 3;
  if (l.type === "Performing Arts") s += 3;
  if (l.type === "Baking") s += 3;
  if (l.free) s += 3;
  if (l.verified) s += 2;
  if (l.sen) s += 1;
  return s;
};
