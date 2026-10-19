// Spiskovi karata iz kupljenih špilova (seed kolekcije pri prvom pokretanju)
/* ============ PODACI: špilovi koje Nikola ima ============ */
// [kolicina, kod ili null, ime]
const PRECONS = [
 {product:"Proving Grounds - Annie", legend:"OGS-017", bf:["OGN-296"], cards:[
  [1,"OGS-017","Annie, Dark Child"],[2,"OGS-010","Annie, Stubborn"],[1,"OGN-296","Void Gate"],[6,"OGN-007","Fury Rune"],[6,"OGN-166","Chaos Rune"],
  [2,"OGS-001","Annie, Fiery"],[3,"OGN-005","Disintegrate"],[3,"OGS-002","Firestorm"],[2,"OGS-011","Flash"],[3,"OGN-169","Gust"],[3,"OGS-003","Incinerate"],
  [3,"OGN-191","Maddened Marauder"],[3,"OGN-170","Morbid Return"],[3,"OGN-171","Mystic Poro"],[2,"OGN-013","Pouty Poro"],[3,"OGN-174","Sai Scout"],
  [3,"OGN-176","Sneaky Deckhand"],[2,"OGS-018","Tibbers"],[3,"OGN-185","Traveling Merchant"]]},
 {product:"Proving Grounds - Lux", legend:"OGS-021", bf:["OGN-288"], cards:[
  [1,"OGS-021","Lux, Lady of Luminosity"],[2,"OGS-014","Lux, Crownguard"],[1,"OGN-288","Startipped Peak"],[6,"OGN-089","Mind Rune"],[6,"OGN-214","Order Rune"],
  [3,"OGN-206","Back to Back"],[3,"OGS-012","Blast of Power"],[3,"OGN-210","Daring Poro"],[2,"OGN-084","Eager Apprentice"],[3,"OGN-085","Falling Comet"],
  [2,"OGS-022","Final Spark"],[3,"OGN-087","Lecturing Yordle"],[2,"OGS-006","Lux, Illuminated"],[2,"OGN-088","Mega-Mech"],[3,"OGN-103","Ravenbloom Student"],
  [3,"OGN-105","Singularity"],[3,"OGN-095","Stupefy"],[3,"OGS-016","Vanguard Attendant"],[3,"OGN-219","Vanguard Sergeant"]]},
 {product:"Proving Grounds - Garen", legend:"OGS-023", bf:["OGN-294"], cards:[
  [1,"OGS-023","Garen, Might of Demacia"],[2,"OGS-007","Garen, Rugged"],[1,"OGN-294","Trifarian War Camp"],[6,"OGN-126","Body Rune"],[6,"OGN-214","Order Rune"],
  [3,"OGN-206","Back to Back"],[3,"OGN-129","Confront"],[3,"OGN-130","Crackshot Corsair"],[3,"OGN-210","Daring Poro"],[2,"OGS-024","Decisive Strike"],
  [2,"OGN-131","Dune Drake"],[3,"OGN-211","Faithful Manufactor"],[3,"OGN-132","First Mate"],[2,"OGS-013","Garen, Commander"],[3,"OGN-222","Noxian Drummer"],
  [2,"OGN-215","Petty Officer"],[3,"OGS-015","Recruit the Vanguard"],[3,"OGS-016","Vanguard Attendant"],[3,"OGN-219","Vanguard Sergeant"]]},
 {product:"Proving Grounds - Master Yi", legend:"OGS-019", bf:["OGN-279"], cards:[
  [1,"OGS-019","Master Yi, Wuju Bladesman"],[2,"OGS-004","Master Yi, Meditative"],[1,"OGN-279","Fortified Position"],[6,"OGN-042","Calm Rune"],[6,"OGN-126","Body Rune"],
  [3,"OGN-127","Cannon Barrage"],[2,"OGN-129","Confront"],[3,"OGN-046","En Garde"],[3,"OGS-008","Gentlemen's Duel"],[2,"OGS-020","Highlander"],
  [2,"OGS-009","Master Yi, Honed"],[3,"OGN-048","Meditation"],[3,"OGN-134","Mobilize"],[2,"OGN-142","Mountain Drake"],[3,"OGN-049","Playful Phantom"],
  [3,"OGN-052","Stalwart Poro"],[3,"OGN-137","Stormclaw Ursine"],[3,"OGN-055","Wielder of Water"],[3,"OGS-005","Zephyr Sage"]]},
 {product:"Vendetta Showdown - Zed", legend:"VEN-143", bf:["OGN-298","VEN-166","VEN-165"], cards:[
  [1,"VEN-143","Zed, Master of Shadows"],[1,"VEN-023","Zed, From the Shadows"],[6,"OGN-007","Fury Rune"],[6,"OGN-166","Chaos Rune"],
  [1,"OGN-298","Zaun Warrens"],[1,"VEN-166","Threshold of the Gray"],[1,"VEN-165","Shadow Temple"],
  [2,"VEN-101","Gust Monk"],[3,"VEN-007","Punching Poro"],[2,"VEN-014","Shadow Fiend"],[3,"VEN-095","Shadow Order Disciple"],[2,"OGN-185","Traveling Merchant"],
  [1,"VEN-144","Death Mark"],[2,"VEN-105","Twilight Step"],[1,"VEN-102","Ravenbloom Prefect"],[3,"VEN-008","Ruthless Strike"],[1,"VEN-020","Twilight Reveler"],
  [2,"VEN-012","Perfect Execution"],[1,"VEN-106","Wind and Ghosts"],[3,"VEN-002","Blade Twirler"],[3,"VEN-093","Kinkou Lifeblade"],[1,"VEN-110","Mel, Defiant Soul"],
  [3,"VEN-013","Shadow Assassin"],[3,"VEN-096","Shadowblade Lurker"],[2,"VEN-112","Zed, Without a Sound"],[1,"VEN-017","Morgana, Vindictive"]]},
 {product:"Vendetta Showdown - Shen", legend:null, legendName:"Shen, Eye of Twilight", bfNames:["Grove of the God-Willow","Kinkou Temple","Threshold of the Gray"], cards:[
  [1,null,"Shen, Eye of Twilight"],[1,null,"Shen, Leader of the Kinkou Order"],[6,"OGN-042","Calm Rune"],[6,"OGN-214","Order Rune"],
  [1,null,"Grove of the God-Willow"],[1,null,"Kinkou Temple"],[1,"VEN-166","Threshold of the Gray"],
  [3,null,"Mournful Witness"],[3,null,"Disciple of Shen"],[2,null,"Charm"],[2,null,"Discipline"],[2,null,"Loyal Poro"],[2,null,"Field Musicians"],
  [2,null,"Hand Hammer"],[2,null,"Serene Ascetic"],[2,null,"Pakaa Protector"],[2,null,"Keeper of Law"],[2,null,"Soulspinner"],[2,null,"Noxian Emissary"],
  [2,null,"Sacred Protector"],[1,null,"Twilight Shroud"],[1,null,"Resonating Strike"],[1,null,"Steel Paws"],[1,null,"Dragon Form"],[1,null,"Ki Barrier"],
  [1,null,"Lacerate"],[1,null,"Shadow Dash"],[2,null,"Shen, Scourge of Shadows"],[1,null,"Shen, Kinkou"],[1,null,"Kennen, Keeper of Balance"]]},
 {product:"Unleashed Champion Deck - Vi", legend:"UNL-187", bf:["UNL-215","UNL-217","UNL-218"], cards:[
  [1,"UNL-187","Vi, Piltover Enforcer"],[1,"OGN-036","Vi, Destructive"],[6,"OGN-007","Fury Rune"],[6,"OGN-214","Order Rune"],
  [1,"UNL-215","Star Spring"],[1,"UNL-217","Trapping Grounds"],[1,"UNL-218","Valley of Idols"],
  [1,"UNL-030","Vi, Hotheaded"],[2,"UNL-176","Vi, Peacekeeper"],[2,"UNL-010","Vault Breaker"],[2,"SFD-009","Serrated Dirk"],[3,"UNL-002","Inferna"],
  [1,"UNL-175","Tactical Retreat"],[2,"UNL-161","Divining Shells"],[1,"UNL-009","Upstage Comedy"],[1,"UNL-159","Soul Harvest"],[2,"UNL-153","Carrion Dredger"],
  [2,"UNL-156","Loyal Poro"],[2,"UNL-154","Crimson Pigeons"],[2,"UNL-006","Sharkling"],[1,"UNL-188","Hextech Gauntlets"],[2,"UNL-015","Right of Conquest"],
  [2,"UNL-017","Square Up"],[1,"UNL-024","Rengar, Unseen"],[2,"UNL-163","Mageseeker Investigator"],[1,"UNL-001","Arena Kingpin"],[2,"UNL-012","Lord Broadmane"],
  [1,"UNL-026","Xerath, Freed"],[2,"UNL-008","Towering Pairofant"],[2,"UNL-018","Yeti Brawler"]]}
];
