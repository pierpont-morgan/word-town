# Word Town

A buildless, English-only visual vocabulary website. Pictures, close-ups, little action sequences and clock faces connect directly to English. There are no translated definitions or Chinese prompts in the shipped app.

## Use and maintain

- Open `dist/index.html` locally, or run `node scripts/serve.mjs` and visit its printed local URL.
- Regenerate the word collection with `node scripts/prepare-data.mjs`.
- Verify content and review behaviour with `node scripts/check.mjs`.
- The site is registered in `.openai/hosting.json`; preserve that project identity.
- Learning progress is browser-local. Audio uses the device's Web Speech API and available English voices.

## Scope

Shanghai Education Press, Grade 4 Book 1, five-four system, 2024-approved new edition. The 142 entries follow the Words to use list on pages 87–89, including recurring words and phrases. The public text did not preserve the original new/review colour coding. The matching new Book 2 has not been verified and is not included.

References: [public textbook text](https://www.scribd.com/document/1068243842/%E6%96%B0-4%E4%B8%8A), [edition listing](https://www.cozylingo.com/content/wxt_1576).

`data/source.md` preserves the research notes. `data/memories.txt` retains the editorial draft; the generator exports only its English example and symbol. `data/visuals.mjs` supplies 142 visual cues and the English scene text. The delivered `dist/` contains no Chinese text.

## Visual assets

`dist/assets/scenes.png` is an original ten-panel atlas generated with the built-in ImageGen tool. It is not copied from the textbook. `dist/pictures.js` supplies original HTML/CSS/SVG mini-scenes, calendars and accurate clock faces; close-ups use CSS positioning on the atlas. The visual sequences are learning associations, not definitions of every possible word sense.

### Final ImageGen prompt

Use case: illustration-story. Create a polished illustrated sprite atlas asset for a Chinese primary school fourth grade English vocabulary website, a single image containing EXACTLY TEN equal rectangular panels, in a strict 5 COLUMNS by 2 ROWS grid, with no gutters, no margins, no panel borders. Wide landscape overall aspect ratio 5:2 (ideally 2500x1000 or comparable). Each panel has identical 5:5 square proportions. Hand-painted gouache and textured colored-pencil children's picture-book editorial style, beautiful sophisticated mint, warm ivory, peach, terracotta, mustard and forest green. Warm friendly daylight, rounded tiny characters, charming miniature diorama objects, enough negative space towards top for UI labels (do NOT draw labels). Top row left to right: 1) a charming Shanghai primary school campus with cream and terracotta school buildings, green sports field, bamboo plants and children, 2) classmates helping each other in a sunny classroom, a child ducking under a skipping rope in foreground, 3) lush wildlife nature preserve with panda and bamboo, grey elephant and baby with long trunks, monkey, and a small polar bear icy area in far background, 4) joyful birthday table with inviting cake, envelopes, noodle soup bowl, egg and children sharing, 5) idyllic Shanghai canal neighborhood with arched stone bridge, bakery, cinema and shops, boat on blue water. Bottom row left to right: 6) autumn apple orchard farm, orange leaves, pine trees and geese flying south, boy and girl carrying harvest basket, 7) appetizing breakfast table still life with porridge bowl, milk jug, soya milk cup, banana and orange juice, 8) a child honestly returning a doll to a friend, a small terracotta plant pot and seeds on a table, warm reconciliation scene, 9) cozy home at evening with a very large analog clock on wall, family preparing for night, moon through window, 10) beautiful gentle weather landscape combining sunny sky at left, raincloud at right, child with umbrella, little lamb and tortoise. No text of any kind, no lettering, no numbers, no logos. Same visual style and scale all ten panels. Illustrations are original, not copies of textbook illustrations. Keep all main objects wholly inside their own square panel, absolutely regular grid so each panel can be displayed independently with CSS background positioning.

## Verification

JavaScript syntax and all 142 visual renderings checked. Controller tests exercise wrong answers, retries, duplicate submissions, same-day promotion prevention and the 1/3/7-day schedule. Browser checks cover picture-only reveal, English search, quiz feedback, phrase spelling with case/ellipsis tolerance, persistent progress and narrow/wide layouts. Speech depends on the device's voice service; audible playback is not guaranteed on every browser.
