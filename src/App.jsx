import { useState, useEffect } from "react";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbw7l96mCpHhGgcv7xPV3U6R_q5MOudoM1CAoPeEzs1V60ywBebleJodDB-zp9Xahskq/exec";

const COLORS = {
  bg: "#1C1410", card: "#2A1F17", cardHover: "#321F14",
  accent: "#C8622A", accentLight: "#E07840", cream: "#F5EDD8",
  muted: "#9A8570", border: "#3D2B1F", tag: "#3D2415",
  green: "#4CAF50", yellow: "#F5A623",
};


const UNITS = ["kilo","g","lb","oz","cup","tbsp","tsp","ml","L","piece","head","clove","can","pack"];

// Unit conversion map: { from: { to: factor } }
const UNIT_CONVERSIONS = {
  kilo: { g: 1000, lb: 2.20462, oz: 35.274 },
  g:    { kilo: 0.001, lb: 0.00220462, oz: 0.035274 },
  lb:   { kilo: 0.453592, g: 453.592, oz: 16 },
  oz:   { kilo: 0.0283495, g: 28.3495, lb: 0.0625 },
  cup:  { tbsp: 16, tsp: 48, ml: 236.588, L: 0.236588 },
  tbsp: { cup: 0.0625, tsp: 3, ml: 14.7868 },
  tsp:  { cup: 0.020833, tbsp: 0.333333, ml: 4.92892 },
  ml:   { L: 0.001, cup: 0.00422675, tbsp: 0.067628, tsp: 0.202884 },
  L:    { ml: 1000, cup: 4.22675, tbsp: 67.628, tsp: 202.884 },
};

function convertUnit(amount, from, to) {
  if (from === to) return { amount, unit: to };
  if (UNIT_CONVERSIONS[from]?.[to]) {
    return { amount: amount * UNIT_CONVERSIONS[from][to], unit: to };
  }
  return { amount, unit: from }; // can't convert
}

function getCompatibleUnits(unit) {
  const groups = [
    ["kilo","g","lb","oz"],
    ["cup","tbsp","tsp","ml","L"],
    ["piece","head","clove","can","pack"],
  ];
  return groups.find(g => g.includes(unit)) || [unit];
}

const DEFAULT_RECIPES = [
  {
    id: "1", name: "Filipino Pork BBQ", category: "Grilled", favourite: false,
    mainIngredient: "pork shoulder", mainIngredientUnit: "kilo", baseAmount: 1, servings: 4,
    ingredients: [
      { id: "i1", name: "pork shoulder", amount: 1, unit: "kilo", isMain: true },
      { id: "i2", name: "garlic (whole head)", amount: 1, unit: "head", isMain: false },
      { id: "i3", name: "brown sugar", amount: 1, unit: "cup", isMain: false },
      { id: "i4", name: "banana ketchup", amount: 0.5, unit: "cup", isMain: false },
      { id: "i5", name: "pineapple juice", amount: 0.75, unit: "cup", isMain: false },
      { id: "i6", name: "vinegar", amount: 0.25, unit: "cup", isMain: false },
      { id: "i7", name: "kalamansi juice", amount: 0.25, unit: "cup", isMain: false },
      { id: "i8", name: "liquid seasoning", amount: 3, unit: "tbsp", isMain: false },
      { id: "i9", name: "oyster sauce", amount: 1, unit: "tbsp", isMain: false },
      { id: "i10", name: "salt", amount: 1, unit: "tsp", isMain: false },
      { id: "i11", name: "black pepper", amount: 1, unit: "tsp", isMain: false },
      { id: "i12", name: "sprite", amount: 0.5, unit: "cup", isMain: false },
    ],
    steps: "Combine all marinade ingredients. Add pork and marinate overnight. Grill on skewers, basting with leftover marinade, until cooked through.",
  },
  {
    id: "2", name: "Lumpia Shanghai", category: "Fried", favourite: false,
    mainIngredient: "ground pork", mainIngredientUnit: "kilo", baseAmount: 5, servings: 20,
    ingredients: [
      { id: "j1", name: "ground pork", amount: 5, unit: "kilo", isMain: true },
      { id: "j2", name: "medium carrots", amount: 4, unit: "piece", isMain: false },
      { id: "j3", name: "big onion", amount: 2, unit: "piece", isMain: false },
      { id: "j4", name: "garlic", amount: 3, unit: "head", isMain: false },
      { id: "j5", name: "spring onions", amount: 2, unit: "cup", isMain: false },
      { id: "j6", name: "red bell pepper", amount: 1, unit: "cup", isMain: false },
      { id: "j7", name: "brown sugar", amount: 1, unit: "cup", isMain: false },
      { id: "j8", name: "soy sauce", amount: 1, unit: "cup", isMain: false },
      { id: "j9", name: "oyster sauce", amount: 0.5, unit: "cup", isMain: false },
      { id: "j10", name: "liquid seasoning", amount: 1, unit: "cup", isMain: false },
      { id: "j11", name: "mix salt & pepper powder", amount: 4, unit: "tbsp", isMain: false },
      { id: "j12", name: "flour", amount: 2.5, unit: "cup", isMain: false },
      { id: "j13", name: "cornstarch", amount: 1, unit: "cup", isMain: false },
      { id: "j14", name: "large eggs", amount: 5, unit: "piece", isMain: false },
      { id: "j15", name: "lumpia wrappers", amount: 550, unit: "piece", isMain: false },
    ],
    steps: "Finely chop carrots, onion, garlic, spring onions, and bell pepper. Mix with ground pork, soy sauce, oyster sauce, liquid seasoning, sugar, salt & pepper, flour, cornstarch, and eggs until well combined. Place a spoonful of filling on each wrapper and roll tightly. Deep fry in batches until golden brown and cooked through. Serve with sweet chili sauce.",
  },
  {
    id: "4", name: "Humba", category: "Stewed", favourite: false,
    mainIngredient: "pork belly", mainIngredientUnit: "kilo", baseAmount: 1.5, servings: 6,
    ingredients: [
      { id: "h1",  name: "tender pork belly (pre-cooked)", amount: 1.5, unit: "kilo", isMain: true },
      { id: "h2",  name: "large onion, sliced", amount: 1, unit: "piece", isMain: false },
      { id: "h3",  name: "garlic cloves, crushed", amount: 9, unit: "clove", isMain: false },
      { id: "h4",  name: "soy sauce", amount: 0.75, unit: "cup", isMain: false },
      { id: "h5",  name: "vinegar", amount: 0.33, unit: "cup", isMain: false },
      { id: "h6",  name: "brown sugar", amount: 3, unit: "tbsp", isMain: false },
      { id: "h7",  name: "tausi / black bean paste (optional)", amount: 1, unit: "tbsp", isMain: false },
      { id: "h8",  name: "bay leaves", amount: 4, unit: "piece", isMain: false },
      { id: "h9",  name: "whole peppercorns", amount: 1, unit: "tsp", isMain: false },
      { id: "h10", name: "pork broth (from Instant Pot)", amount: 1.25, unit: "cup", isMain: false },
      { id: "h11", name: "salt", amount: 1, unit: "tsp", isMain: false },
    ],
    steps: "1. SAUT\u00C9 BASE: Heat a large pan or wok. Saut\u00E9 the garlic until lightly golden. Add onions and cook until softened.\n\n2. BROWN THE PORK: Add the tender pork belly and allow it to brown slightly on all sides.\n\n3. ADD FLAVOUR: Add soy sauce, tausi, bay leaves, and whole peppercorns. Pour in 1 cup of the reserved pork broth.\n\n4. FIRST SIMMER: Simmer for 10 minutes.\n\n5. ADD VINEGAR: Pour in the vinegar and do not stir for 2-3 minutes. This prevents the vinegar from turning bitter.\n\n6. SWEETEN AND REDUCE: Add brown sugar. Simmer uncovered for 15-20 minutes until the sauce becomes thick, glossy, and coats the pork.\n\n7. TASTE ADJUSTMENTS: For a more Bisaya flavour - add another tbsp of brown sugar. For a darker richer humba - add 1 tbsp oyster sauce. For a slight kick - add 2-3 bird's eye chillies. If sauce is too thick - add a splash more pork broth.",
  },
  {
    id: "5", name: "Cebu-Style Lechon Belly", category: "Oven-Roasted", favourite: false,
    mainIngredient: "boneless pork belly, skin on", mainIngredientUnit: "kilo", baseAmount: 4.5, servings: 15,
    ingredients: [
      { id: "l1", name: "boneless pork belly, skin on", amount: 4.5, unit: "kilo", isMain: true },
      { id: "l2", name: "coarse sea salt", amount: 3, unit: "tbsp", isMain: false },
      { id: "l3", name: "freshly ground black pepper", amount: 2, unit: "tsp", isMain: false },
      { id: "l4", name: "MSG / Ajinomoto (optional)", amount: 1, unit: "tsp", isMain: false },
      { id: "l5", name: "large white onions, thinly sliced", amount: 2, unit: "piece", isMain: false },
      { id: "l6", name: "garlic bulbs, thinly sliced", amount: 2, unit: "head", isMain: false },
      { id: "l7", name: "lemongrass stalks, bruised & cut into 10 cm lengths", amount: 5, unit: "piece", isMain: false },
      { id: "l8", name: "dried bay leaves", amount: 8, unit: "piece", isMain: false },
      { id: "l9", name: "whole black peppercorns, lightly crushed", amount: 2, unit: "tbsp", isMain: false },
      { id: "l10", name: "white vinegar (for skin)", amount: 2, unit: "tbsp", isMain: false },
      { id: "l11", name: "neutral cooking oil or melted pork fat (for skin)", amount: 1, unit: "tbsp", isMain: false },
      { id: "l12", name: "cane vinegar or white vinegar (dipping sauce)", amount: 0.5, unit: "cup", isMain: false },
      { id: "l13", name: "soy sauce (dipping sauce)", amount: 2, unit: "tbsp", isMain: false },
      { id: "l14", name: "garlic cloves, minced (dipping sauce)", amount: 2, unit: "clove", isMain: false },
      { id: "l15", name: "bird's eye chillies, chopped (dipping sauce)", amount: 2, unit: "piece", isMain: false },
    ],
    steps: "1. PREPARE: Lay pork belly skin-side down. Pat dry. Lightly score the meat side in a crosshatch (do not cut through skin).\n\n2. SEASON: Rub the meat side with sea salt, black pepper, and MSG. Massage in well.\n\n3. STUFF: Spread sliced onions, garlic, lemongrass, bay leaves, and crushed peppercorns over the meat. Leave a 2-3 cm border around the edges.\n\n4. ROLL: Roll tightly from one long edge into a log, compressing firmly. Tie with butcher's twine every 2-3 cm.\n\n5. DRY OVERNIGHT: Place on a wire rack over a tray. Leave uncovered in the fridge for 12-24 hours to dry the skin.\n\n6. BEFORE ROASTING: Remove from fridge 45-60 min before cooking. Wipe skin with white vinegar, pat completely dry, then brush with a very thin layer of oil or pork fat. Do not salt the skin.\n\n7. FIRST ROAST: Preheat oven to 180C. Place on a wire/V-rack in a roasting tray. Roast for 3.5-4 hours, turning onto the next side every 30-40 minutes. Rotate tray if oven has hot spots. Dab away excess fat and season as needed.\n\n8. FINAL BLAST: Increase to 210-215C. Roast a further 15-20 minutes until skin is deep golden brown and crisp. Do not exceed 220C.\n\n9. REST: Transfer to a chopping board. Leave uncovered 20-30 minutes. Do not cover - steam will soften the skin.\n\n10. DIPPING SAUCE: Mix cane vinegar, soy sauce, minced garlic, chillies, and black pepper. Let sit 15 minutes before serving.",
  },
  {
    id: "6", name: "Atsarang Sayote (Chayote Pickles)", category: "Pickled", favourite: false,
    mainIngredient: "chayote", mainIngredientUnit: "piece", baseAmount: 4, servings: 8,
    ingredients: [
      { id: "a1", name: "medium chayote, peeled and julienned", amount: 4, unit: "piece", isMain: true },
      { id: "a2", name: "medium carrots, julienned", amount: 2, unit: "piece", isMain: false },
      { id: "a3", name: "large onion, thinly sliced", amount: 1, unit: "piece", isMain: false },
      { id: "a4", name: "garlic cloves, thinly sliced", amount: 9, unit: "clove", isMain: false },
      { id: "a5", name: "ginger, thumb-sized and julienned", amount: 1, unit: "piece", isMain: false },
      { id: "a6", name: "red bell pepper, thinly sliced", amount: 0.5, unit: "piece", isMain: false },
      { id: "a7", name: "raisins (optional)", amount: 0.5, unit: "cup", isMain: false },
      { id: "a8", name: "whole peppercorns", amount: 2, unit: "tbsp", isMain: false },
      { id: "a9", name: "salt (for drawing out moisture)", amount: 0.25, unit: "cup", isMain: false },
      { id: "a10", name: "white vinegar", amount: 2, unit: "cup", isMain: false },
      { id: "a11", name: "sugar", amount: 1, unit: "cup", isMain: false },
      { id: "a12", name: "salt (for pickling syrup)", amount: 1.5, unit: "tsp", isMain: false },
    ],
    steps: "1. Peel and julienne the chayote.\n\n2. Toss with ¼ cup salt and leave for 1 hour (overnight is unnecessary because chayote contains less latex than papaya).\n\n3. Rinse thoroughly.\n\n4. Squeeze out as much water as possible using a clean tea towel or cheesecloth.\n\n5. Combine the chayote with the carrots, onion, garlic, ginger, bell pepper, raisins and peppercorns.\n\n6. Bring the vinegar to a boil.\n\n7. Stir in the sugar and 1½ tsp salt until dissolved.\n\n8. Allow the syrup to cool until warm.\n\n9. Pack the vegetables tightly into sterilised jars.\n\n10. Pour over the syrup until everything is submerged.\n\n11. Refrigerate for 3–5 days before serving (it’s even better after a week).",
  },
];

function formatAmt(amount) {
  if (!amount && amount !== 0) return "0";
  const rounded = Math.round(amount * 10) / 10;
  if (rounded === Math.floor(rounded)) return Math.floor(rounded).toString();
  return rounded.toFixed(1);
}

// ── API helpers ──────────────────────────────────────────────────────────────
async function apiGet() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${SHEET_URL}?action=getAll`, { signal: controller.signal });
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}
async function apiPost(body) {
  const res = await fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Shared input style ───────────────────────────────────────────────────────
const inp = (extra = {}) => ({
  background: "#1C1410", border: `1px solid ${COLORS.border}`, color: COLORS.cream,
  borderRadius: 8, padding: "10px 12px", fontSize: 14, width: "100%",
  boxSizing: "border-box", outline: "none", fontFamily: "inherit", ...extra,
});

// ── RecipeForm (Add + Edit) ──────────────────────────────────────────────────
function RecipeForm({ initial, onSave, onCancel, title, saving }) {
  const [name, setName]       = useState(initial?.name || "");
  const [cat, setCat]         = useState(initial?.category || "");
  const [steps, setSteps]     = useState(initial?.steps || "");
  const [ings, setIngs]       = useState(
    initial?.ingredients?.length
      ? initial.ingredients
      : [{ id: "new0", name: "", amount: 1, unit: "kilo", isMain: true }]
  );

  const addIng  = () => setIngs(p => [...p, { id: `n${Date.now()}`, name: "", amount: 1, unit: "cup", isMain: false }]);
  const delIng  = id => setIngs(p => p.filter(i => i.id !== id));
  const setMain = id => setIngs(p => p.map(i => ({ ...i, isMain: i.id === id })));
  const updIng  = (id, f, v) => setIngs(p => p.map(i => i.id === id ? { ...i, [f]: f === "amount" ? parseFloat(v) || 0 : v } : i));

  const handleSave = () => {
    if (!name.trim()) return alert("Recipe name is required");
    const mainIng = ings.find(i => i.isMain) || ings[0];
    onSave({
      ...(initial || {}),
      id: initial?.id || Date.now().toString(),
      name: name.trim(), category: cat.trim(),
      mainIngredient: mainIng?.name || "",
      mainIngredientUnit: mainIng?.unit || "kilo",
      baseAmount: mainIng?.amount || 1,
      servings: initial?.servings || 4,
      favourite: initial?.favourite || false,
      ingredients: ings, steps,
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: COLORS.cream, fontFamily: "Georgia,serif", fontSize: 22, margin: 0 }}>{title}</h2>
        <button onClick={onCancel} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={{ color: COLORS.muted, fontSize: 12, display: "block", marginBottom: 6, fontWeight: 600 }}>RECIPE NAME *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken Adobo" style={inp()} />
        </div>
        <div>
          <label style={{ color: COLORS.muted, fontSize: 12, display: "block", marginBottom: 6, fontWeight: 600 }}>CATEGORY</label>
          <input value={cat} onChange={e => setCat(e.target.value)} placeholder="e.g. Stewed, Grilled, Fried" style={inp()} />
        </div>
        <div>
          <label style={{ color: COLORS.muted, fontSize: 12, display: "block", marginBottom: 8, fontWeight: 600 }}>
            INGREDIENTS — tap ★ to set slider ingredient
          </label>
          <div style={{ display: "grid", gap: 8 }}>
            {ings.map(ing => (
              <div key={ing.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setMain(ing.id)} title="Set as main"
                  style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", cursor: "pointer", fontSize: 13,
                    background: ing.isMain ? COLORS.accent : COLORS.border, border: "none", color: COLORS.cream }}>★</button>
                <input value={ing.name} onChange={e => updIng(ing.id, "name", e.target.value)} placeholder="Name" style={inp({ flex: 2 })} />
                <input type="number" value={ing.amount} onChange={e => updIng(ing.id, "amount", e.target.value)} style={inp({ width: 68, flex: "none" })} />
                <select value={ing.unit} onChange={e => updIng(ing.id, "unit", e.target.value)} style={inp({ width: 76, flex: "none" })}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {ings.length > 1 && (
                  <button onClick={() => delIng(ing.id)} style={{ background: "none", border: "none", color: "#C05050", cursor: "pointer", fontSize: 20, padding: "0 2px" }}>×</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addIng} style={{ marginTop: 10, background: "none", border: `1px dashed ${COLORS.border}`, color: COLORS.accent, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, width: "100%" }}>
            + Add Ingredient
          </button>
        </div>
        <div>
          <label style={{ color: COLORS.muted, fontSize: 12, display: "block", marginBottom: 6, fontWeight: 600 }}>COOKING METHOD (optional)</label>
          <textarea value={steps} onChange={e => setSteps(e.target.value)} placeholder="Describe steps…" rows={4} style={inp({ resize: "vertical" })} />
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ background: saving ? COLORS.muted : COLORS.accent, color: "#fff", border: "none", padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving…" : "Save Recipe"}
        </button>
      </div>
    </div>
  );
}

// ── RecipeCard ───────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onClick, onFav }) {
  return (
    <div onClick={() => onClick(recipe)}
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.background = COLORS.cardHover; e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = COLORS.card; e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ background: COLORS.tag, color: COLORS.accent, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, letterSpacing: 1 }}>
          {recipe.category?.toUpperCase() || "RECIPE"}
        </span>
        <button onClick={e => { e.stopPropagation(); onFav(recipe.id); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}
          title={recipe.favourite ? "Remove favourite" : "Add favourite"}>
          {recipe.favourite ? "❤️" : "🤍"}
        </button>
      </div>
      <h3 style={{ color: COLORS.cream, fontFamily: "Georgia,serif", fontSize: 19, margin: "6px 0 5px" }}>{recipe.name}</h3>
      <p style={{ color: COLORS.muted, fontSize: 13, margin: 0 }}>
        Main: <span style={{ color: COLORS.accentLight }}>{recipe.mainIngredient}</span>
        <span style={{ marginLeft: 12 }}>· {recipe.ingredients.length} ingredients</span>
      </p>
    </div>
  );
}


// ── Global price list key: "name|unit" → price per unit in £
// Pre-seeded from Lechon Belly data
const GLOBAL_PRICE_DEFAULTS = {
  "boneless pork belly, skin on|kilo": "8.00",
  "coarse sea salt|tbsp": "0.0167",
  "freshly ground black pepper|tsp": "0.075",
  "msg / ajinomoto (optional)|tsp": "0.05",
  "large white onions, thinly sliced|piece": "0.40",
  "garlic bulbs, thinly sliced|head": "0.50",
  "lemongrass stalks, bruised & cut into 10 cm lengths|piece": "0.24",
  "dried bay leaves|piece": "0.025",
  "whole black peppercorns, lightly crushed|tbsp": "0.175",
  "white vinegar (for skin)|tbsp": "0.025",
  "neutral cooking oil or melted pork fat (for skin)|tbsp": "0.05",
  "cane vinegar or white vinegar (dipping sauce)|cup": "0.30",
  "soy sauce (dipping sauce)|tbsp": "0.04",
  "garlic cloves, minced (dipping sauce)|clove": "0.05",
  "bird's eye chillies, chopped (dipping sauce)|piece": "0.10",
  // Common shared ingredients across recipes
  "brown sugar|cup": "0.30",
  "soy sauce|cup": "0.60",
  "oyster sauce|cup": "1.20",
  "oyster sauce|tbsp": "0.08",
  "liquid seasoning|cup": "1.00",
  "liquid seasoning|tbsp": "0.065",
  "garlic|head": "0.50",
  "black pepper|tsp": "0.075",
  "salt|tsp": "0.01",
  "vinegar|cup": "0.20",
  // Atsarang Sayote starter prices (editable from the recipe cost section)
  "medium chayote, peeled and julienned|piece": "0.85",
  "medium carrots, julienned|piece": "0.15",
  "large onion, thinly sliced|piece": "0.35",
  "garlic cloves, thinly sliced|clove": "0.05",
  "ginger, thumb-sized and julienned|piece": "0.20",
  "red bell pepper, thinly sliced|piece": "0.80",
  "raisins (optional)|cup": "1.20",
  "whole peppercorns|tbsp": "0.175",
  "salt (for drawing out moisture)|cup": "0.04",
  "white vinegar|cup": "0.20",
  "sugar|cup": "0.30",
  "salt (for pickling syrup)|tsp": "0.01",
  // Other recipe estimates (UK £ per listed unit; editable in the app)
  "pork shoulder|kilo": "7.50",
  "garlic (whole head)|head": "0.50",
  "banana ketchup|cup": "1.50",
  "pineapple juice|cup": "0.30",
  "kalamansi juice|cup": "1.20",
  "sprite|cup": "0.20",
  "ground pork|kilo": "6.50",
  "medium carrots|piece": "0.15",
  "big onion|piece": "0.25",
  "spring onions|cup": "0.80",
  "red bell pepper|cup": "0.50",
  "mix salt & pepper powder|tbsp": "0.10",
  "flour|cup": "0.10",
  "cornstarch|cup": "0.20",
  "large eggs|piece": "0.30",
  "lumpia wrappers|piece": "0.01",
  "tender pork belly (pre-cooked)|kilo": "8.00",
  "large onion, sliced|piece": "0.30",
  "garlic cloves, crushed|clove": "0.05",
  "brown sugar|tbsp": "0.02",
  "tausi / black bean paste (optional)|tbsp": "0.15",
  "bay leaves|piece": "0.03",
  "whole peppercorns|tsp": "0.06",
  "pork broth (from instant pot)|cup": "0.20",
};

const GLOBAL_PRICES_KEY = "global-ingredient-prices";

async function loadGlobalPrices() {
  try {
    const res = window.storage?.get
      ? await window.storage.get(GLOBAL_PRICES_KEY)
      : { value: window.localStorage.getItem(GLOBAL_PRICES_KEY) };
    const saved = res?.value ? JSON.parse(res.value) : {};
    // Merge: defaults fill gaps, saved values override
    return { ...GLOBAL_PRICE_DEFAULTS, ...saved };
  } catch {
    return { ...GLOBAL_PRICE_DEFAULTS };
  }
}

async function saveGlobalPrices(prices) {
  try {
    const serialized = JSON.stringify(prices);
    if (window.storage?.set) await window.storage.set(GLOBAL_PRICES_KEY, serialized);
    else window.localStorage.setItem(GLOBAL_PRICES_KEY, serialized);
  } catch {}
}

function priceKey(name, unit) {
  return `${name.toLowerCase().trim()}|${unit}`;
}

// Fallback estimates ensure recipes added through Google Sheets still show a cost.
const ESTIMATED_UNIT_PRICES = {
  kilo: 6.00, g: 0.01, lb: 3.00, oz: 0.40,
  cup: 0.30, tbsp: 0.05, tsp: 0.02, ml: 0.01, L: 1.00,
  piece: 0.25, head: 0.50, clove: 0.05, can: 1.00, pack: 1.00,
};

function getIngredientPrice(globalPrices, name, unit) {
  const specific = parseFloat(globalPrices[priceKey(name, unit)]);
  return Number.isFinite(specific) && specific > 0 ? specific : (ESTIMATED_UNIT_PRICES[unit] || 0.25);
}

// ── CostingSection ───────────────────────────────────────────────────────────
function CostingSection({ recipe, scaledIngredients }) {
  const [globalPrices, setGlobalPrices] = useState({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const prices = await loadGlobalPrices();
      setGlobalPrices(prices);
      setLoaded(true);
    })();
  }, []);

  const startEdit = () => {
    // Draft keyed by ingredient id for this recipe, pre-filled from global prices
    const d = {};
    scaledIngredients.forEach(ing => {
      const key = priceKey(ing.name, ing.unit);
      d[ing.id] = globalPrices[key] || getIngredientPrice(globalPrices, ing.name, ing.unit).toFixed(2);
    });
    setDraft(d);
    setEditing(true);
  };

  const confirmEdit = async () => {
    // Merge updated prices back into global store
    const updated = { ...globalPrices };
    scaledIngredients.forEach(ing => {
      const key = priceKey(ing.name, ing.unit);
      const val = draft[ing.id];
      if (val !== "" && val !== undefined) updated[key] = val;
    });
    setGlobalPrices(updated);
    await saveGlobalPrices(updated);
    setEditing(false);
  };

  // Calculate totals using scaled amounts + global price lookup
  const rows = scaledIngredients.map(ing => {
    const unitCost = getIngredientPrice(globalPrices, ing.name, ing.unit);
    const total = unitCost > 0 ? unitCost * ing.scaledAmount : 0;
    return { ...ing, unitCost, total };
  });

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const costedCount = rows.filter(r => r.unitCost > 0).length;

  if (!loaded) return null;

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h4 style={{ color: COLORS.cream, fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0 }}>💷 COST ESTIMATE</h4>
          <p style={{ color: COLORS.muted, fontSize: 11, margin: "3px 0 0" }}>
            {costedCount}/{scaledIngredients.length} priced · estimates used where needed · scales with slider
          </p>
        </div>
        {!editing ? (
          <button onClick={startEdit} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.accentLight, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
            ✏️ Edit Prices
          </button>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setEditing(false)} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
            <button onClick={confirmEdit} style={{ background: COLORS.accent, border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Save</button>
          </div>
        )}
      </div>

      {editing && (
        <div style={{ background: "#1a1008", border: `1px solid ${COLORS.accent}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
          <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 10px" }}>
            Price per unit in £. These are shared — updating here updates all recipes using the same ingredient.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {scaledIngredients.map(ing => (
              <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ color: COLORS.cream, fontSize: 13, flex: 1 }}>{ing.name}</span>
                <span style={{ color: COLORS.muted, fontSize: 12, flexShrink: 0 }}>£ / {ing.unit}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: COLORS.muted, fontSize: 13 }}>£</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={draft[ing.id] ?? ""}
                    onChange={e => setDraft(p => ({ ...p, [ing.id]: e.target.value }))}
                    placeholder="0.00"
                    style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.cream, borderRadius: 6, padding: "5px 8px", fontSize: 13, width: 72, outline: "none" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
        {rows.map((ing, i) => (
          <div key={ing.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px",
            borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : "none",
            background: ing.isMain ? COLORS.tag : "transparent",
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: COLORS.cream, fontSize: 13 }}>{ing.name}</span>
              {ing.unitCost > 0 && (
                <span style={{ color: COLORS.muted, fontSize: 11, marginLeft: 8 }}>
                  £{ing.unitCost.toFixed(2)} / {ing.unit} × {formatAmt(ing.scaledAmount)}
                </span>
              )}
            </div>
            <span style={{ color: ing.total > 0 ? COLORS.accentLight : COLORS.muted, fontWeight: ing.total > 0 ? 700 : 400, fontSize: 14, minWidth: 60, textAlign: "right" }}>
              {ing.total > 0 ? `£${ing.total.toFixed(2)}` : "—"}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: grandTotal > 0 ? "#1a1008" : COLORS.card, borderTop: `1px solid ${COLORS.accent}` }}>
          <div>
            <span style={{ color: COLORS.cream, fontWeight: 700, fontSize: 15 }}>Total Estimated Cost</span>
            {grandTotal > 0 && costedCount < scaledIngredients.length && (
              <span style={{ color: COLORS.muted, fontSize: 11, display: "block" }}>Partial — {scaledIngredients.length - costedCount} ingredient{scaledIngredients.length - costedCount !== 1 ? "s" : ""} not priced</span>
            )}
          </div>
          <span style={{ color: grandTotal > 0 ? COLORS.accentLight : COLORS.muted, fontWeight: 700, fontSize: 20 }}>
            {grandTotal > 0 ? `£${grandTotal.toFixed(2)}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── RecipeView ───────────────────────────────────────────────────────────────
function RecipeView({ recipe, onClose, onDelete, onEdit, onFav, saving }) {
  const mainIng = recipe.ingredients.find(i => i.isMain) || recipe.ingredients[0];
  const [sliderValue, setSliderValue] = useState(mainIng?.amount || 1);
  // unitOverrides: { ingredientId: chosenUnit }
  const [unitOverrides, setUnitOverrides] = useState({});
  const [ingChecked, setIngChecked] = useState({});
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [pwdAction, setPwdAction] = useState(null);

  const requestAuth = (action) => {
    setPwdAction(action);
    setPwdInput("");
    setPwdError(false);
    setShowPwdModal(true);
  };

  const handlePwdSubmit = () => {
    if (pwdInput === "20165") {
      setShowPwdModal(false);
      if (pwdAction === "edit") onEdit();
      if (pwdAction === "delete") onDelete(recipe.id);
    } else {
      setPwdError(true);
      setPwdInput("");
    }
  };
  const ratio = sliderValue / (mainIng?.amount || 1);

  const maxSlider = (mainIng?.amount || 1) * 5;
  const minSlider = recipe.id === "2" ? 0.5 : Math.max(0.1, (mainIng?.amount || 1) * 0.25);
  const step      = 0.1;

  const scaledIngredients = recipe.ingredients.map(ing => {
    const rawAmount = ing.isMain ? sliderValue : ing.amount * ratio;
    const targetUnit = unitOverrides[ing.id];
    if (targetUnit && targetUnit !== ing.unit) {
      const converted = convertUnit(rawAmount, ing.unit, targetUnit);
      return { ...ing, scaledAmount: converted.amount, displayUnit: converted.unit };
    }
    return { ...ing, scaledAmount: rawAmount, displayUnit: ing.unit };
  });

  return (
    <div style={{ animation: "slideIn 0.2s ease" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onFav(recipe.id)} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
            {recipe.favourite ? "❤️ Unfav" : "🤍 Fav"}
          </button>
          <button onClick={() => requestAuth("edit")} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.accentLight, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>✏️ Edit</button>
          <button onClick={() => requestAuth("delete")} style={{ background: "none", border: `1px solid #5A2020`, color: "#C05050", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>🗑 Delete</button>
        </div>
      </div>

      <span style={{ background: COLORS.tag, color: COLORS.accent, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, letterSpacing: 1 }}>{recipe.category?.toUpperCase() || "RECIPE"}</span>
      <h2 style={{ color: COLORS.cream, fontFamily: "Georgia,serif", fontSize: 26, margin: "10px 0 20px" }}>{recipe.name}</h2>

      {/* Slider */}
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: COLORS.muted, fontSize: 13, fontWeight: 600 }}>Adjust {recipe.mainIngredient}</span>
          <span style={{ color: COLORS.accentLight, fontWeight: 700, fontSize: 18 }}>{formatAmt(sliderValue)} {mainIng?.unit}</span>
        </div>
        <input type="range" min={minSlider} max={maxSlider} step={step} value={sliderValue}
          onChange={e => setSliderValue(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.muted, fontSize: 11, marginTop: 4 }}>
          <span>{formatAmt(minSlider)} {mainIng?.unit}</span>
          {ratio !== 1 && <span style={{ color: COLORS.accent }}>× {ratio.toFixed(2)}</span>}
          <span>{formatAmt(maxSlider)} {mainIng?.unit}</span>
        </div>
      </div>

      {/* Ingredients */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h4 style={{ color: COLORS.cream, fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0 }}>INGREDIENTS</h4>
        {Object.values(ingChecked).some(Boolean) && (
          <button onClick={() => setIngChecked({})}
            style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
            ✕ Clear ticks
          </button>
        )}
      </div>
      <div style={{ display: "grid", gap: 7, marginBottom: 22 }}>
        {scaledIngredients.map(ing => {
          const compatible = getCompatibleUnits(ing.unit);
          const hasOptions = compatible.length > 1;
          const ticked = !!ingChecked[ing.id];
          return (
            <div key={ing.id} onClick={() => setIngChecked(prev => ({ ...prev, [ing.id]: !prev[ing.id] }))}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                background: ticked ? "#1a2a18" : ing.isMain ? COLORS.tag : "transparent",
                border: `1px solid ${ticked ? "#4a7a40" : ing.isMain ? COLORS.accent : COLORS.border}`,
                opacity: ticked ? 0.65 : 1,
                transition: "all 0.15s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Inline checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${ticked ? "#5a9a50" : COLORS.border}`,
                  background: ticked ? "#4a7a40" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {ticked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ color: ticked ? "#8ab885" : COLORS.cream, fontSize: 14, textDecoration: ticked ? "line-through" : "none" }}>{ing.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={e => e.stopPropagation()}>
                <span style={{ color: ing.isMain ? COLORS.accentLight : COLORS.muted, fontWeight: 700, fontSize: 14 }}>
                  {formatAmt(ing.scaledAmount)}
                </span>
                {hasOptions ? (
                  <select
                    value={unitOverrides[ing.id] || ing.unit}
                    onChange={e => setUnitOverrides(prev => ({ ...prev, [ing.id]: e.target.value }))}
                    style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 6, padding: "3px 6px", fontSize: 12, cursor: "pointer" }}>
                    {compatible.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                ) : (
                  <span style={{ color: COLORS.muted, fontSize: 13 }}>{ing.displayUnit}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Method */}
      {recipe.steps && (() => {
        // Split on double newlines or numbered steps like "1. " / "1) "
        const rawSteps = recipe.steps.split(/\n\n+/);
        const steps = rawSteps.flatMap(s => {
          // Further split if multiple numbered steps got joined on single newlines
          const parts = s.split(/\n(?=\d+[\.\)]\s)/);
          return parts.map(p => p.trim()).filter(Boolean);
        });
        const isSingleBlock = steps.length <= 1;
        return (
          <>
            <h4 style={{ color: COLORS.cream, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>METHOD</h4>
            {isSingleBlock ? (
              <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.75, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
                {recipe.steps}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {steps.map((step, i) => {
                  // Check if step starts with a number label like "1." or "1)"
                  const match = step.match(/^(\d+[\.\)]\s*)(.*)/s);
                  const num   = match ? match[1].replace(/[\.\)\s]/g, "") : String(i + 1);
                  const text  = match ? match[2].trim() : step;
                  // First line may be a heading (ALL CAPS or short phrase before colon)
                  const headingMatch = text.match(/^([A-Z][A-Z\s&-]{2,}|[^:]{1,30}):\s*([\s\S]*)/);
                  const heading = headingMatch ? headingMatch[1] : null;
                  const body    = headingMatch ? headingMatch[2] : text;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: COLORS.accent, color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {num}
                      </div>
                      <div style={{ flex: 1 }}>
                        {heading && <div style={{ color: COLORS.cream, fontWeight: 700, fontSize: 13, marginBottom: 4, letterSpacing: 0.5 }}>{heading}</div>}
                        <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line" }}>{body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}

      {/* Costing Section */}
      <CostingSection recipe={recipe} scaledIngredients={scaledIngredients} />

      {showPwdModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28, width: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <h3 style={{ color: COLORS.cream, fontFamily: "Georgia,serif", fontSize: 18, margin: "0 0 6px" }}>🔒 Owner password</h3>
            <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 18px" }}>Enter the password to {pwdAction === "delete" ? "delete" : "edit"} this recipe.</p>
            <input type="password" value={pwdInput} onChange={e => { setPwdInput(e.target.value); setPwdError(false); }} onKeyDown={e => e.key === "Enter" && handlePwdSubmit()} placeholder="Enter password" autoFocus style={{ background: "#1C1410", border: `1px solid ${pwdError ? "#C05050" : COLORS.border}`, color: COLORS.cream, borderRadius: 8, padding: "10px 12px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none", marginBottom: 8 }} />
            {pwdError && <p style={{ color: "#C05050", fontSize: 12, margin: "0 0 12px" }}>Incorrect password.</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowPwdModal(false)} style={{ flex: 1, background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={handlePwdSubmit} style={{ flex: 1, background: COLORS.accent, border: "none", color: "#fff", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [recipes, setRecipes]   = useState([]);
  const [view, setView]         = useState("list"); // list | recipe | add | edit
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all | fav
  const [loaded, setLoaded]     = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [syncMsg, setSyncMsg]   = useState("");
  const [sheetOk, setSheetOk]   = useState(null); // null=unknown, true, false

  const showMsg = (msg, ok = true) => {
    setSyncMsg(msg);
    setTimeout(() => setSyncMsg(""), 3000);
    setSheetOk(ok);
  };

  // ── Load: try Google Sheets first, fall back to local ──
  useEffect(() => {
    // Show the built-in/local recipes immediately; sync the Sheet in the background.
    let initialRecipes = DEFAULT_RECIPES;
    try {
      const saved = window.localStorage.getItem("recipes-db");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          const savedIds = new Set(parsed.map(r => r.id));
          initialRecipes = [...parsed, ...DEFAULT_RECIPES.filter(r => !savedIds.has(r.id))];
        }
      }
    } catch {}
    setRecipes(initialRecipes);
    setLoaded(true);
    (async () => {
      setSyncing(true);
      try {
        const data = await apiGet();
        if (data.recipes && data.recipes.length > 0) {
          const sheetIds = new Set(data.recipes.map(r => r.id));
          const missing = DEFAULT_RECIPES.filter(r => !sheetIds.has(r.id));
          // Push any missing default recipes to Sheets
          for (const r of missing) {
            await apiPost({ action: "save", recipe: r });
          }
          const merged = [...data.recipes, ...missing];
          setRecipes(merged);
          setSheetOk(true);
          showMsg(missing.length > 0 ? `Restored ${missing.length} missing recipe(s) ✓` : "Loaded from Google Sheets ✓");
        } else {
          // Sheet empty — seed with defaults and push
          setRecipes(DEFAULT_RECIPES);
          await apiPost({ action: "syncAll", recipes: DEFAULT_RECIPES });
          setSheetOk(true);
          showMsg("Sheet initialised ✓");
        }
      } catch {
        // Sheets unavailable — fall back to local storage
        try {
          const res = window.storage?.get
            ? await window.storage.get("recipes-db")
            : { value: window.localStorage.getItem("recipes-db") };
          if (res?.value) {
            const saved = JSON.parse(res.value);
            const savedIds = new Set(saved.map(r => r.id));
            const missing = DEFAULT_RECIPES.filter(r => !savedIds.has(r.id));
            setRecipes([...saved, ...missing]);
          } else {
            setRecipes(DEFAULT_RECIPES);
          }
        } catch { setRecipes(DEFAULT_RECIPES); }
        setSheetOk(false);
        showMsg("Sheets unavailable — using local storage", false);
      }
      setSyncing(false);
    })();
  }, []);

  // ── Local backup whenever recipes change ──
  useEffect(() => {
    if (!loaded) return;
    try {
      const serialized = JSON.stringify(recipes);
      if (window.storage?.set) window.storage.set("recipes-db", serialized).catch(() => {});
      else window.localStorage.setItem("recipes-db", serialized);
    } catch {}
  }, [recipes, loaded]);

  // ── CRUD helpers ──
  const handleAdd = async (recipe) => {
    setSaving(true);
    const updated = [...recipes, recipe];
    setRecipes(updated);
    try { await apiPost({ action: "save", recipe }); showMsg("Saved to Sheets ✓"); }
    catch { showMsg("Saved locally (Sheets unavailable)", false); }
    setSaving(false);
    setView("list");
  };

  const handleEdit = async (recipe) => {
    setSaving(true);
    const updated = recipes.map(r => r.id === recipe.id ? recipe : r);
    setRecipes(updated);
    setSelected(recipe);
    try { await apiPost({ action: "update", recipe }); showMsg("Updated in Sheets ✓"); }
    catch { showMsg("Updated locally (Sheets unavailable)", false); }
    setSaving(false);
    setView("recipe");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this recipe?")) return;
    setRecipes(prev => prev.filter(r => r.id !== id));
    try { await apiPost({ action: "delete", id }); showMsg("Deleted from Sheets ✓"); }
    catch { showMsg("Deleted locally (Sheets unavailable)", false); }
    setView("list");
  };

  const handleFav = async (id) => {
    let newFav;
    const updated = recipes.map(r => {
      if (r.id === id) { newFav = !r.favourite; return { ...r, favourite: newFav }; }
      return r;
    });
    setRecipes(updated);
    if (selected?.id === id) setSelected(prev => ({ ...prev, favourite: newFav }));
    try { await apiPost({ action: "toggleFavourite", id }); }
    catch {}
  };

  const filtered = recipes
    .filter(r => filter === "fav" ? r.favourite : true)
    .filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.mainIngredient?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase())
    );

  const favCount = recipes.filter(r => r.favourite).length;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.cream, fontFamily: "'Trebuchet MS',sans-serif", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: 21, color: COLORS.cream }}>🍖 Recipe Book</h1>
              <div style={{ color: COLORS.accentLight, fontSize: 11, marginTop: 3 }}>UK measurements</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ color: COLORS.muted, fontSize: 12 }}>{recipes.length} recipe{recipes.length !== 1 ? "s" : ""}</span>
                {syncing && <span style={{ color: COLORS.yellow, fontSize: 11 }}>⟳ Syncing…</span>}
                {!syncing && syncMsg && (
                  <span style={{ color: sheetOk ? COLORS.green : COLORS.yellow, fontSize: 11 }}>{syncMsg}</span>
                )}
                {!syncing && !syncMsg && sheetOk !== null && (
                  <span style={{ fontSize: 11, color: sheetOk ? COLORS.green : COLORS.yellow }}>
                    {sheetOk ? "● Sheets" : "● Local"}
                  </span>
                )}
              </div>
            </div>
            {view === "list" && (
              <button onClick={() => setView("add")}
                style={{ background: COLORS.accent, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Add Recipe
              </button>
            )}
          </div>

          {view === "list" && (
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes, ingredients…"
                style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.cream, borderRadius: 10, padding: "9px 14px", fontSize: 14, outline: "none" }} />
              <button onClick={() => setFilter(f => f === "fav" ? "all" : "fav")}
                style={{ background: filter === "fav" ? COLORS.accent : COLORS.bg, border: `1px solid ${filter === "fav" ? COLORS.accent : COLORS.border}`, color: filter === "fav" ? "#fff" : COLORS.muted, borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>
                ❤️ {favCount}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "22px 16px" }}>
        {!loaded ? (
          <p style={{ color: COLORS.muted, textAlign: "center", marginTop: 60 }}>Loading…</p>
        ) : view === "list" ? (
          filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
              <p>{search || filter === "fav" ? "No recipes match." : "No recipes yet. Add your first one!"}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map(r => (
                <RecipeCard key={r.id} recipe={r}
                  onClick={r => { setSelected(r); setView("recipe"); }}
                  onFav={handleFav} />
              ))}
            </div>
          )
        ) : view === "recipe" && selected ? (
          <RecipeView
            recipe={selected}
            onClose={() => setView("list")}
            onDelete={handleDelete}
            onEdit={() => setView("edit")}
            onFav={handleFav}
            saving={saving}
          />
        ) : view === "add" ? (
          <RecipeForm title="Add New Recipe" onSave={handleAdd} onCancel={() => setView("list")} saving={saving} />
        ) : view === "edit" && selected ? (
          <RecipeForm title="Edit Recipe" initial={selected} onSave={handleEdit} onCancel={() => setView("recipe")} saving={saving} />
        ) : null}
      </div>
    </div>
  );
}
