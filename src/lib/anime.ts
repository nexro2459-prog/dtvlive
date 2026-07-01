// Curated catalog from watchanimeworld.net (series + movies).
// Streaming is served via the source site inside an iframe on /anime/$slug.

export interface AnimeItem {
  id: string;
  title: string;
  poster: string; // absolute URL
  slug: string;
  type: "series" | "movie";
  categories: string[]; // simplified genre-ish tags
}

const IMG = (p: string) => `https://image.tmdb.org/t/p/w500/${p}`;
const s = (
  slug: string,
  title: string,
  poster: string,
  cats: string[],
  type: "series" | "movie" = "series",
): AnimeItem => ({ id: `${type}-${slug}`, slug, title, poster: IMG(poster), type, categories: cats });

export const animeCatalog: AnimeItem[] = [
  // ---- Series page 1 ----
  s("tamons-b-side", "Tamon's B-Side", "1iTCxEIK1xlmIXjHcLjt0UyOU8w.jpg", ["anime","comedy","romance","ongoing"]),
  s("yowayowa-sensei", "Yowayowa Sensei", "1WDp9RjN7odYw490WLNw79iceLa.jpg", ["anime","comedy","school","ongoing"]),
  s("farming-life-in-another-world", "Farming Life in Another World", "pT4OoVQE8zGJ0Z0GZpJotK5Vzsj.jpg", ["anime","fantasy","slice-of-life","ongoing"]),
  s("skeleton-knight-in-another-world", "Skeleton Knight in Another World", "jMhzjbRI1iL2ENtMnS3Zm3DBAJw.jpg", ["anime","action","fantasy","isekai","ongoing"]),
  s("scum-of-the-brave", "Scum of the Brave", "kSJv65fW98dUqRD5f0ahLLYoZQN.jpg", ["anime","action","fantasy","ongoing"]),
  s("witch-hat-atelier", "Witch Hat Atelier", "wraCsl632li139bKAdyqAp6MX8q.jpg", ["anime","adventure","fantasy","ongoing"]),
  s("the-ramparts-of-ice", "The Ramparts of Ice", "rke9UC2QrogvxiQD9TGpbvqDosi.jpg", ["anime","drama","romance","school","ongoing"]),
  s("an-observation-log-of-my-fiancee-who-calls-herself-a-villainess", "An Observation Log of My Fiancée Who Calls Herself a Villainess", "xlpYhXiyX52t6Dtg1fFN0CqLbK4.jpg", ["anime","comedy","fantasy","romance","ongoing"]),
  s("snowball-earth", "SNOWBALL EARTH", "rLin4VCC1QK7MDmeaSBZqw7SWRu.jpg", ["anime","action","mecha","sci-fi","ongoing"]),
  s("agents-of-the-four-seasons-dance-of-spring", "Agents of the Four Seasons Dance of Spring", "zbzbUDLO3iTAuXDmoqtpOsrtLPi.jpg", ["anime","fantasy","romance","urban","ongoing"]),
  // ---- Series page 2 ----
  s("marriage-toxin", "Marriage Toxin", "2b1akkaoutSo3xbykjAKnEb92Rs.jpg", ["anime","action","comedy","romance","ongoing"]),
  s("eren-the-southpaw", "Eren the Southpaw", "AkhxnKGDcNKikr1xDP4mi1wpfEr.jpg", ["anime","drama","ongoing"]),
  s("liar-game", "LIAR GAME", "w8yyntTxZlDlZ2TR8kb4C92pmcO.jpg", ["anime","psychological","suspense","ongoing"]),
  s("the-warrior-princess-and-the-barbaric-king", "The Warrior Princess and the Barbaric King", "fv0Mr6ahZfmwksgDpVO46iMteA6.jpg", ["anime","comedy","fantasy","romance","ongoing"]),
  s("daemons-of-the-shadow-realm", "Daemons of the Shadow Realm", "nEdHDUhaC80lIFh1WWvi1KYtcfL.jpg", ["anime","action","adventure","fantasy","ongoing"]),
  s("release-that-witch", "Release that Witch", "ygXvdkB7Ue9ELUUlQe7wFh5fdJa.jpg", ["anime","action","fantasy","isekai","completed"]),
  s("to-be-hero-x", "TO BE HERO X", "7ynNG9lYS9HIR8cYMgawO19VPkg.jpg", ["anime","action","mystery","super-power","completed"]),
  s("easygoing-territory-defense-by-the-optimistic-lord", "Easygoing Territory Defense by the Optimistic Lord", "2ctXv1LyyVad5VLToS1t2ZqSCQa.jpg", ["anime","adventure","fantasy","completed"]),
  s("bofuri-i-dont-want-to-get-hurt-so-ill-max-out-my-defense-2", "BOFURI: I Don't Want to Get Hurt, so I'll Max Out My Defense.", "fdcMiknnRcmVgWb9wGS9TxE06cG.jpg", ["anime","comedy","fantasy","completed"]),
  s("yuri-on-ice", "Yuri!!! on Ice", "oxenakJNCj06JrWHENjvwaWGcSz.jpg", ["anime","sports","drama","completed"]),
  // ---- Series page 3 ----
  s("trigun-stampede", "TRIGUN STAMPEDE", "h1AvI9Mt6v15q5ynb3t9Dp4czBm.jpg", ["anime","action","sci-fi","shounen","ongoing"]),
  s("a-misanthrope-teaches-a-class-for-demi-humans", "A Misanthrope Teaches a Class for Demi-Humans", "yOM6DxJblSheZwOeGwAzfIHxnCc.jpg", ["anime","comedy","romance","school","completed"]),
  s("roll-over-and-die-i-will-fight-for-an-ordinary-life-with-my-love-and-cursed-sword", "ROLL OVER AND DIE", "uzRpWknriZnd8fxkse5sfVaQwJn.jpg", ["anime","action","fantasy","ongoing"]),
  s("an-adventurers-daily-grind-at-age-29", "An Adventurer's Daily Grind at Age 29", "tx6XZPOJ5UgVzvo8BXb2cNhFBq5.jpg", ["anime","action","fantasy","ongoing"]),
  s("kunon-the-sorcerer-can-see", "Kunon the Sorcerer Can See", "kGGdMa1fEwMiyyFB1AnUox5cshy.jpg", ["anime","action","fantasy","completed"]),
  s("there-was-a-cute-girl-in-the-heros-party-so-i-tried-confessing-to-her", "There Was a Cute Girl in the Hero's Party…", "lUIuuvxthqaK4euFHTNIsRmdf3s.jpg", ["anime","comedy","fantasy","romance","ongoing"]),
  s("sentenced-to-be-a-hero", "Sentenced to Be a Hero", "k8bh5mvHDx3czHSF56v9lRyulLC.jpg", ["anime","action","fantasy","ongoing"]),
  s("tokyo-ghoul", "Tokyo Ghoul", "1m4RlC9BTCbyY549TOdVQ5NRPcR.jpg", ["anime","action","horror","psychological","ongoing"]),
  s("the-mighty-nein", "The Mighty Nein", "qJTZanXDiJKABLNGRM9LmSg8YT7.jpg", ["cartoon","adventure","fantasy","completed"]),
  s("you-and-i-are-polar-opposites", "You and I Are Polar Opposites", "9hRuMU33DBz4z1vaYBRqLLuFFbQ.jpg", ["anime","comedy","romance","school","completed"]),
  // ---- Series page 4 ----
  s("hana-kimi", "Hana-Kimi", "wCZn0Is62Tx4HC9WuFGYysjeHCx.jpg", ["anime","comedy","romance","school","completed"]),
  s("dark-moon-the-blood-altar", "Dark Moon: The Blood Altar", "68HcRvCpiajsPhKn1MnV4hqeCAN.jpg", ["anime","fantasy","supernatural","school","completed"]),
  s("if-my-favorite-pop-idol-made-it-to-the-budokan-i-would-die", "If My Favorite Pop Idol…", "n8tBDlRzWOA8ywyQNv3t9EokHVx.jpg", ["anime","comedy","musical","completed"]),
  s("cells-at-work", "Cells at Work!", "sgwwEGvNy7vCJN8IVnl44tuVlMZ.jpg", ["anime","action","comedy","medical","completed"]),
  s("suicide-squad-isekai", "Suicide Squad Isekai", "AbVwsBJnLoqJzPJn8dlGFSGfygy.jpg", ["anime","action","fantasy","completed"]),
  s("reborn-to-master-the-blade-from-hero-king-to-extraordinary-squire-%e2%99%80", "Reborn to Master the Blade", "zrnUnV0PFWnJ1G6wDvzkQL2HL9d.jpg", ["anime","action","fantasy","completed"]),
  s("my-clueless-first-friend", "My Clueless First Friend", "vgUQaunqSLmTtU38VmRntz8aVsN.jpg", ["anime","romance","school","completed"]),
  s("a-gatherers-adventure-in-isekai", "A Gatherer's Adventure in Isekai", "AtpIf9wnT6IaHoG31XsdqZEEf80.jpg", ["anime","adventure","fantasy","completed"]),
  s("spy-x-family", "Spy x Family", "3r4LYFuXrg3G8fepysr4xSLWnQL.jpg", ["anime","action","comedy","shounen","completed"]),
  s("tatsuki-fujimoto-17-26", "Tatsuki Fujimoto 17-26", "rVBxMx1IrBdxbxbBuOWK8kiurMB.jpg", ["anime","drama","supernatural","completed"]),
  // ---- Series page 5 ----
  s("my-hero-academia-vigilantes", "My Hero Academia: Vigilantes", "iv0cXt6uJGlTryWZNQMGyum4Pme.jpg", ["anime","action","adventure","super-power","completed"]),
  s("ragna-crimson", "Ragna Crimson", "oGmNWwV3wgp1DZXTOLSAYZZgh3X.jpg", ["anime","action","fantasy","shounen","completed"]),
  s("the-bad-guys-breaking-in", "The Bad Guys: Breaking In", "12ybD4BvgSpmhSjknFPvf1Nu7CC.jpg", ["cartoon","comedy","crime","completed"]),
  s("with-you-our-love-will-make-it-through", "With You, Our Love Will Make It Through", "hqx5GLLcv1SuW3AAmv2ZFa7l7bF.jpg", ["anime","drama","romance","school","completed"]),
  s("remonster", "Re:Monster", "AmFrA0jX0p9twH1IKfxcGWVz2X3.jpg", ["anime","action","adventure","isekai","completed"]),
  s("the-summer-hikaru-died-2", "The Summer Hikaru Died", "x0wiTO87UMiVCUe24nKaHlp7AIc.jpg", ["anime","horror","mystery","supernatural","completed"]),
  s("mechanical-marie", "Mechanical Marie", "1uBvmTta9mVjHpO7K5mQm9B09ng.jpg", ["anime","comedy","romance","sci-fi","completed"]),
  s("tojima-wants-to-be-a-kamen-rider", "Tojima Wants to Be a Kamen Rider", "bD80ugDX7krshLcWxnqRYCOQPoo.jpg", ["anime","action","comedy","super-power","completed"]),
  s("lets-play", "Let's Play", "aLzTaEle2w6W4rKKbIrF6WYWw9w.jpg", ["anime","comedy","romance","slice-of-life","completed"]),
  s("a-wild-last-boss-appeared", "A Wild Last Boss Appeared!", "9dhoMwDpkJm5dsSIiHMPl7or76t.jpg", ["anime","action","adventure","fantasy","completed"]),
  // ---- Movies ----
  s("shinchan-movie-the-spicy-kasukabe-dancers", "Shinchan Movie: The Spicy Kasukabe Dancers", "1TfdgQbZXuEswjqLYlsVvhHw0Py.jpg", ["anime","comedy","adventure","completed"], "movie"),
  s("your-name", "Your Name.", "q719jXXEzOoYaps6babgKnONONX.jpg", ["anime","drama","romance","completed"], "movie"),
  s("weathering-with-you", "Weathering with You", "qgrk7r1fV4IjuoeiGS5HOhXNdLJ.jpg", ["anime","drama","fantasy","romance","completed"], "movie"),
  s("suzume", "Suzume", "yStW1TXF5s7Tbtu9KjIZEaWl6HL.jpg", ["anime","adventure","drama","fantasy","completed"], "movie"),
  s("doraemon-the-movie-nobitas-earth-symphony", "Doraemon: Nobita's Earth Symphony", "1W5Kg4K27U3dx9Kxb8DaE6WFLHI.jpg", ["anime","adventure","family","musical","completed"], "movie"),
  s("jujutsu-kaisen-0", "Jujutsu Kaisen 0", "23oJaeBh0FDk2mQ2P240PU9Xxfh.jpg", ["anime","action","supernatural","completed"], "movie"),
  s("chainsaw-man-the-movie-reze-arc", "Chainsaw Man the Movie: Reze Arc", "xdzLBZjCVSEsic7m7nJc4jNJZVW.jpg", ["anime","action","supernatural","shounen","completed"], "movie"),
  s("haikyu-the-dumpster-battle", "HAIKYU!! The Dumpster Battle", "ntRU0OA4etGGiMMmH1Yw0bnaMdW.jpg", ["anime","sports","comedy","completed"], "movie"),
  s("demon-slayer-kimetsu-no-yaiba-infinity-castle", "Demon Slayer: Infinity Castle", "aFRDH3P7TX61FVGpaLhKr6QiOC1.jpg", ["anime","action","supernatural","shounen","completed"], "movie"),
  s("mononoke-the-movie-chapter-ii-the-ashes-of-rage", "Mononoke: The Ashes of Rage", "tPExtAM958Gx07itJ7nWqSddBQ9.jpg", ["anime","mystery","historical","psychological","completed"], "movie"),
];

// Simplified genre list for the tab bar.
export const animeGenres = [
  "All",
  "action",
  "adventure",
  "comedy",
  "romance",
  "fantasy",
  "sci-fi",
  "school",
  "shounen",
  "sports",
  "horror",
  "isekai",
  "cartoon",
];

export function sourceUrlFor(item: AnimeItem): string {
  return item.type === "movie"
    ? `https://watchanimeworld.net/movies/${item.slug}/`
    : `https://watchanimeworld.net/series/${item.slug}/`;
}

export function findAnime(id: string): AnimeItem | undefined {
  return animeCatalog.find((a) => a.id === id);
}
