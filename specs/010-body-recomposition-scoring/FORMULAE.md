# Scoring Formulae (Body Recomposition System)

Version: 1.0 (2025-09-19)
Heuristic Bundles: GI: gi-v1, Micronutrient: micro-v1
Determinism: All calculations pure + ordered; clamp after each major stage.

## 1. Shared Helpers
```
clamp(x, min, max) = min if x < min; max if x > max; else x
safe(value, fallback=0) = (value == null or NaN) ? fallback : value
percent(part, whole) = whole > 0 ? part / whole : 0
scale(x, inMin, inMax, outMin, outMax) = outMin + (clamp(x,inMin,inMax)-inMin)*(outMax-outMin)/(inMax-inMin)
```

## 2. Post-Workout Scoring
Objective: Reward optimal carb:protein ratio + high GI when appropriate + adequate protein presence.

Inputs:
- carbs_g_per100 (C), protein_g_per100 (P)
- GI multiplier m_GI from `glycemic-index-map.json` (1.05–1.40 typical)

2.1 Ratio Suitability
```
ratio = P <= 0 or C <= 0 ? 0 : C / P
// Ideal window 2.0–4.0 (strength ~2, endurance ~3–4) -> triangular scoring
if ratio == 0 -> ratioScore = 0
else if ratio < 2: ratioScore = scale(ratio, 0, 2, 0, 50)
else if ratio <= 4: ratioScore = scale(ratio, 2, 4, 50, 70)
else // diminishing returns
  ratioScore = max(0, 70 - (ratio - 4)*5) // falls linearly
```

2.2 Protein Adequacy Bonus
```
proteinBonus = scale(P, 0, 20, 0, 15) // cap at 20g/100g for scoring
```

2.3 GI Boost Component
```
// Only meaningful if carbs present (>5g/100g)
baseGIBonus = C >= 5 ? (m_GI - 1.0) / 0.40 * 15 : 0  // m_GI 1.0-1.40 -> 0-15
```

2.4 Raw Score & Recovery Window
```
raw = ratioScore + proteinBonus + baseGIBonus // theoretical max ≈ 70+15+15=100
postWorkoutScore = clamp(raw, 0, 100)
recoveryWindow =
  ratio >= 2 && ratio <= 4 && m_GI >= 1.15 ? 'immediate'
  : (ratio >= 1 && ratio < 2 ? 'delayed' : 'general')
confidence = confidenceMacro(carbs=C, protein=P)
```

## 3. Fat Loss Compatibility
Goal: Combine calorie density, satiety efficiency, and volume advantage.

Inputs:
- kcal_per100 (K), satietyScore S (existing), fiber F, water proxy via category (optional)

3.1 Calorie Density Class & Base
```
class = K <125 ? 'low' : (K <=225 ? 'moderate' : 'high')
classBase = {'low': 35, 'moderate': 22, 'high': 8}[class]
```

3.2 Satiety Efficiency (normalized)
```
// Reference anchor: S_ref = 100 satiety at 200 kcal/100g
satEffRaw = S / max(50, K) * 200  // scale relative to 200 kcal baseline; protect from division explosion
satEffScore = clamp(scale(satEffRaw, 0, 400, 0, 45), 0, 45)
```

3.3 Volume Advantage
```
volumeAdvantage = (K < 100) && (F >= 3 || S >= 120)
volumeBonus = volumeAdvantage ? 8 : 0
```

3.4 Composite
```
fatLossScore = clamp(classBase + satEffScore + volumeBonus, 0, 100)
confidence = confidenceBasic(kcal=K, satiety=S)
```

## 4. Calorie Efficiency Score
Multi-dimensional efficiency: protein, satiety, micronutrients, thermic effect, processing penalty.

Inputs:
- Protein density PD = protein_g_per100 / (K/100) (g per 100 kcal) -> derived
- Satiety per calorie SPC = S / K (protected)
- Micronutrient density M (0–100) from heuristic map
- Processing penalty NOVA penalty Pp (0–30 raw) or derived heuristic
- Thermic effect TE_raw (approx % energy cost) using macro fractions

4.1 Protein Efficiency (0–100)
```
proteinPerCal = K > 0 ? (P / K) * 100 : 0 // g protein per 100 kcal
proteinEfficiency = clamp(scale(proteinPerCal, 0, 12, 0, 100), 0, 100) // 12g/100kcal ~= high-quality lean
```

4.2 Satiety Efficiency (0–100)
```
spc = K > 0 ? S / K : 0
satietyEfficiency = clamp(scale(spc, 0, 1.0, 0, 100), 0, 100) // 1 satiety unit per kcal is upper useful bound
```

4.3 Micronutrient Density
```
micronutrientDensity = clamp(M, 0, 100)
```

4.4 Thermic Effect (0–20)
Approximation using macro fractions (protein, carbs, fat) ignoring fiber energy.
```
proteinFrac = energyProtein / totalEnergy  // energyProtein = P*4
carbFrac = energyCarb / totalEnergy        // energyCarb = C*4
// fat grams not provided -> infer remainderEnergy = totalEnergy - (protein+carb) -> assume 9 kcal/g -> derive fatFrac
fatFrac = clamp(1 - proteinFrac - carbFrac, 0, 1)
// Typical TEF: protein 25%, carbs 7%, fat 3%
TE_percent = proteinFrac*25 + carbFrac*7 + fatFrac*3
thermicEffect = clamp(scale(TE_percent, 3, 25, 0, 20), 0, 20)
```

4.5 Processing Penalty Normalization (0–30)
```
processingPenalty = clamp(Pp, 0, 30)
```

4.6 Weighted Combination
Weights chosen for recomposition emphasis.
```
rawEfficiency = 0.40*proteinEfficiency + 0.25*satietyEfficiency + 0.20*micronutrientDensity + 0.10*(thermicEffect*5) + 0.05*(20 - (processingPenalty/30)*20)
// Explanation:
// term thermicEffect*5 scales 0–20 -> 0–100 before 0.10 weight -> contributes 0–10
// processing transformed to a preservation credit 0–20 -> scaled to 0–100 *0.05 weight -> 0–5
// Sum theoretical max ≈ 40 + 25 + 20 + 10 + 5 = 100

// Final clamp
efficiencyScore = clamp(rawEfficiency, 0, 100)
confidence = confidenceComposite(required=[P,K,S,M])
```

## 5. Body Composition Context Application (Non-destructive Layer)
Do NOT mutate base scores. Provide multipliers for recommendation stage.

Default multipliers (neutral = 1.0):
```
phaseMatrix = {
  cutting:       { protein:1.1, satiety:1.25, fatLoss:1.30, post:1.0, efficiency:1.20 },
  bulking:       { protein:1.25, satiety:0.9,  fatLoss:0.7,  post:1.20, efficiency:1.0  },
  maintenance:   { protein:1.0,  satiety:1.0,  fatLoss:1.0,  post:1.0,  efficiency:1.0  },
  recomposition: { protein:1.15, satiety:1.10, fatLoss:1.15, post:1.05, efficiency:1.10 }
}

mealTimingAdjust = {
  pre_workout:  { protein:1.05, post:0.9 },
  post_workout: { protein:1.10, post:1.15 },
  general:      { }
}
```
Application:
```
multiplier(field) = clamp( phaseMatrix[phase][field] * (mealTimingAdjust[timing][field] || 1), 0.5, 2.0 )
```

Recommended priority selection heuristic:
```
if phase == 'cutting' -> 'satiety'
else if phase == 'bulking' && timing == 'post_workout' -> 'recovery'
else if phase == 'recomposition' -> 'efficiency'
else -> 'protein'
```

Conflict Resolution Strategies:
```
prioritize_goal: choose score aligned to phase (e.g., fatLossScore in cutting) even if others higher
balanced: weighted average of normalized (z-scored) relevant scores
context_specific: choose different leading score depending on timing (post_workout -> postWorkoutScore; otherwise phase heuristic)
```

## 6. Confidence Rubric
```
function confidenceMacro({carbs, protein}) {
  if (protein != null && protein > 0 && carbs != null && carbs > 0) return 'high'
  if ((protein != null && protein > 0) || (carbs != null && carbs > 0)) return 'medium'
  return 'low'
}
function confidenceBasic({kcal, satiety}) {
  if (kcal && satiety) return 'high'
  if (kcal || satiety) return 'medium'
  return 'low'
}
function confidenceComposite(requiredArr) {
  const missing = requiredArr.filter(x => x == null || Number.isNaN(x))
  if (missing.length === 0) return 'high'
  if (missing.length <= 2) return 'medium'
  return 'low'
}
```

## 7. Normalization & Determinism Safeguards
- Clamp after each major stage to avoid cascading inflation.
- Use fixed ordering of ingredients before counting unique items.
- Strip accents & lowercase tokens before heuristic lookup.
- Fallback GI & micronutrient values versioned; bump versions on any table change.

## 8. Derived Fields Order (Pipeline)
1. Collect raw nutrition + satiety + proteinOptimization
2. Compute GI multiplier (needs ingredients/categories)
3. PostWorkoutScore
4. FatLossScore
5. Micronutrient density heuristic
6. CalorieEfficiencyScore
7. Context multipliers (non-destructive)

## 9. Example Walkthrough
Product: 20g protein, 60g carbs, 350 kcal per 100g, GI multiplier 1.30, satietyScore 140.
```
ratio = 60/20 = 3 -> ratioScore scale 2–4 => 60 (approx interpolation 50->70)
proteinBonus = scale(20,0,20,0,15)=15
baseGIBonus = (1.30-1.0)/0.40*15 = 11.25
postWorkoutScore raw ≈ 86.25 -> clamp 86
Fat loss: K=350 -> class 'high' base 8
satEffRaw = 140 / 350 * 200 = 80 -> satEffScore scale(80,0,400,0,45)=9
volumeAdvantage false -> 0
fatLossScore = 17
Protein efficiency: proteinPerCal = 20 / 350 *100 = 5.71 -> scale(5.71,0,12,0,100)=47.6
Satiety efficiency: spc=140/350=0.4 -> scale(0.4,0,1,0,100)=40
Micronutrient baseline say 55
TE: protein energy=80, carb=240, total=350 -> fractions p=0.2286 c=0.6857 f=0.0857
TE_percent = 0.2286*25 + 0.6857*7 + 0.0857*3 ≈ 5.7 + 4.8 + 0.26 = 10.76 -> thermicEffect scale(10.76,3,25,0,20)=7.0
Processing penalty NOVA3=12
processing credit term = (20 - (12/30)*20)=20 - 8 = 12 -> scaled *0.05 => 0.6 contribution
rawEfficiency = 0.40*47.6 + 0.25*40 + 0.20*55 + 0.10*(7*5=35) + 0.05*(12)
= 19.04 + 10 + 11 + 3.5 + 0.6 = 44.14 -> efficiencyScore 44
Context (recomposition + post_workout): protein 1.15*1.10=1.265 => clamp to 1.265
```

## 10. Validation Checklist (Implementers)
- [ ] All divisions guarded
- [ ] All outputs integer or fixed precision? (Decide rounding policy – recommend round to 1 decimal where shown, keep raw internally)
- [ ] Confidence computed AFTER each score
- [ ] No mutation of previous score objects when adding context
- [ ] Versions (`gi-v1`, `micro-v1`) exported in stats

## 11. Rounding Policy
Internal: retain floating numbers
Output: round primary scores to nearest integer; keep ratios & multipliers to 2 decimals.

## 12. Future Upgrade Hooks
- Replace micronutrient heuristic with actual nutrient density database
- GI personalization (microbiome / individual variability) -> override hook
- Adaptive weighting via reinforcement learning (keep deterministic fallback)

---
End of FORMULAE.md v1.0
