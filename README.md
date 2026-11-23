# Sand Jars

ASMR sand-sorting puzzle, built 2026-11-22 as the top pick of our hit forecast:
AppMagic lists ASMR sand sorting on its 2027 watch list,
sort revenue tripled year on year, and physics-feel sorts (Marble Sort, Sand Loop) are pulling ahead of flat ones.

## Repository
- `src/`, `tools/`, `assets/`: the game and its build and test tools (see Build and test).
- `index.html`: the built single-file game. Open it in a browser to play.
- `android-app/`: the Android and iPhone apps (Capacitor 8). `README.md` there covers signing, AdMob ids and products; `README-ios.md` the iPhone build.
- `.github/workflows/`: `android.yml` builds the APK and AAB on every push to `main`; `ios.yml` builds the iPhone app and uploads it to TestFlight once the App Store Connect secrets are added.
- `store/`: icon, feature graphic, screenshots and listing text.
- `privacy.html`, `terms.html`: policy pages.

## Rules
- Jars hold four scoops. Tap a jar to pick it up, tap another to pour.
- Sand only lands on the same colour or in an empty jar. The whole top run pours, as much as fits.
- Finish when every jar is empty or full of one colour. A finished jar gets its lid.
- Narrow-neck jars (from level 25) pour one scoop at a time, so a stack can be split.
- Wet sand (from level 35, then every 3rd level): dark, shiny colours that move as one clump, all or nothing, even from narrow necks.
- Covered scoops (from level 47) show "?" until they reach the top.
- Every tenth level from 20 is HARD: one more colour, the hardest checked layout, double coins.

## What makes it ours
- Real grain simulation: every scoop is 384 grains in a 32-column heap model with a 45 degree slump,
  so jars fill with wavy strata like a sand-art bottle. Grains stream out of the tilted jar and pile up.
- Souvenir bottles (the meta): every level pours one layer into a sand-art bottle; 10 layers finish it and it
  goes on the shelf. 20 designs (Desert Dawn, Coral Coast, Northern Lights...), then they repeat as "II".
  The win screen is the TikTok money shot: the layer pours into the bottle.
- Crunchy grain sound made in WebAudio (sparse clicks + hiss, band-passed), cork pop, plucked win arpeggio.

## Economy (data says: coins + boosters from day one)
- Coins: start 100, +10 per level, +25 hard, +50 daily; "Collect x3" rewarded ad on the win screen.
- Boosters: Undo (3 free per level, then +5 for ad or 40 coins), Add a jar (once per level, ad or 100),
  Hint (solver finds the next pour, ad or 60; never charged if the jar is stuck).
- Jar styles on the shelf: Cork (free), Mason 400, Spice 900, Wax seal 1500, Crystal + Gold rim (jar_pack).
- Shop: remove_ads £2.99, coins_600 £0.99, coins_2500 £2.99, jar_pack £1.99, free 40 coins by ad.
- Interstitials: from level 12, every 3rd level, at least 100 s apart, never after Remove ads.
- Ads consent form only after the first level (retention lesson from SU/MM). PG max ad rating in init.
- AdMob + cordova-plugin-purchase in the apps (Apple store on iOS, iPhone product ids carry an `sj_` prefix). Test ad units until the real ones exist.

## Levels
- Level 1 is hand made (two guided pours). Levels 2-200 use seeds picked by `tools/seeds.js`: for each level it
  generates candidates, keeps only ones the solver finishes, and picks the one whose "ease" (share of 40 semi-random
  players who finish) is nearest the target curve; hard levels take the hardest. Past 200, levels are generated in
  the game and solver-checked at load.
- Ramp: 2-3 colours (L2-3), 4 (L4-5), 5 (6-9), 6 (10-14), 7 (15-19), 8 (20-29), 9 (30-44), 10 (45-69), 11 (70-119), 12 after.
- Daily jar: one solver-checked level per date (10-11 colours), streak screen, 50 coins.

## Build and test
- Edit `src/sand-jars.src.html` (game) and `src/core.js` (rules, generator, solver).
- `node tools/seeds.js 200` re-picks the level seeds (writes tools/seeds.json + seeds.txt).
- `node tools/build.js` inlines core, seeds, sounds (`assets/sfx/`) and the backdrop (`assets/`) and adds the studio splash -> `index.html`.
- `python3 build-web.py` runs that and builds the installable web version into `web/` (what the apps ship).
- `python3 tools/make-icon.py` redraws the icon and feature graphic; then `python3 android-app/tools/make-icons.py` for launcher icons.
- `node tools/test.js <outDir> [levels]` plays levels by real taps following the solver at 6x speed.
- `node tools/smoke.js <outDir>` takes menu, tutorial, pour, win and level screenshots.

## Later ideas
- Wet sand (clumps, pours as one block), sieve jars, sand-art bottle sharing card, seasonal bottle designs.
- Colour-blind symbols option.
