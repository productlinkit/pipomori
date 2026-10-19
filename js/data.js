// added: higher = newer
const GAMES = [
  { id: "momo", img: "assets/momo-hop.jpg", cat: "adventure", players: 1840, added: 1, tag: "hot",
    name: { id: "Lompatan Momo", en: "Momo's Leap" },
    desc: { id: "Bantu Momo melompati tebing melayang dan kumpulkan daun ajaib sebelum angin berubah arah.", en: "Help Momo leap across floating cliffs and grab magic leaves before the wind changes." } },
  { id: "kart", img: "assets/kiko-kart.jpg", cat: "racing", players: 1325, added: 2, tag: "hot",
    name: { id: "Kiko Kart Rally", en: "Kiko Kart Rally" },
    desc: { id: "Pacu kart kayu Kiko di jalur tanah, ambil tikungan tajam, dan sentuh bendera finis duluan.", en: "Race Kiko's wooden kart down dirt tracks, drift the sharp turns and hit the finish flag first." } },
  { id: "coin", img: "assets/kiko-coin.jpg", cat: "arcade", players: 1510, added: 3, tag: "hot",
    name: { id: "Kejar Koin Kiko", en: "Kiko's Coin Dash" },
    desc: { id: "Berlari di jembatan kayu, lompat setinggi mungkin, dan raih koin bintang sebanyak-banyaknya.", en: "Dash across wooden bridges, jump high and grab as many star coins as you can." } },
  { id: "puru", img: "assets/puru-push.jpg", cat: "puzzle", players: 972, added: 4,
    name: { id: "Dorong Balok Puru", en: "Puru's Block Push" },
    desc: { id: "Dorong balok es ke petak dengan bentuk yang sama. Setiap langkah dihitung, jadi pikirkan dulu.", en: "Push ice blocks onto the matching shape tiles. Every move counts, so plan ahead." } },
  { id: "gogo", img: "assets/gogo-memory.jpg", cat: "brain", players: 640, added: 5,
    name: { id: "Kartu Ingat Gogo", en: "Gogo's Memory Tiles" },
    desc: { id: "Balik kartu kayu dan temukan pasangan tunas bersama Gogo si batu berlumut.", en: "Flip the wooden tiles and find matching sprouts with Gogo the mossy stone." } },
  { id: "maze", img: "assets/sprout-maze.jpg", cat: "maze", players: 488, added: 6,
    name: { id: "Labirin Tunas", en: "Sprout Maze" },
    desc: { id: "Tuntun Tunas yang bercahaya keluar dari labirin batu sambil membawa bintang terakhir.", en: "Guide the glowing Sprout out of the stone maze while carrying the last star." } },
  { id: "bakery", img: "assets/kiko-bakery.jpg", cat: "brain", players: 1120, added: 7, tag: "new",
    name: { id: "Toko Kue Kiko", en: "Kiko's Bakery" },
    desc: { id: "Ingat pesanan pelanggan hutan, lalu hias cupcake-nya dengan krim, stroberi, dan taburan yang tepat.", en: "Remember each forest customer's order, then top their cupcake with the right cream, berries and sprinkles." } },
  { id: "surf", img: "assets/puru-surf.jpg", cat: "arcade", players: 1390, added: 8, tag: "new",
    name: { id: "Selancar Puru", en: "Puru Surf" },
    desc: { id: "Meluncur di arus sungai bersama Puru, lewati cincin emas, dan hindari batu di tepian.", en: "Ride the river rapids with Puru, glide through golden rings and dodge the rocks." } },
  { id: "stack", img: "assets/gogo-stack.jpg", cat: "puzzle", players: 860, added: 9, tag: "new",
    name: { id: "Menara Gogo", en: "Gogo's Tower" },
    desc: { id: "Susun balok lumut dan batu setinggi mungkin. Cocokkan simbolnya supaya menara tidak goyah.", en: "Stack moss and stone blocks as high as you can. Match the symbols so the tower stays steady." } },
  { id: "rhythm", img: "assets/tunas-rhythm.jpg", cat: "music", players: 1010, added: 10, tag: "new",
    name: { id: "Irama Tunas", en: "Sprout Rhythm" },
    desc: { id: "Ketuk not yang bercahaya tepat di ketukannya dan bantu Tunas menyalakan reruntuhan saat senja.", en: "Tap the glowing notes on the beat and help Sprout light up the ruins at dusk." } }
];

const CATS = ["all", "adventure", "puzzle", "racing", "arcade", "maze", "brain", "music"].map(id => ({ id, img: `assets/cat-${id}.jpg?v=3` }));

const AVATARS = [
  { name: "Momo", img: "assets/momo-hop.jpg", pos: "58% 30%" },
  { name: "Kiko", img: "assets/kiko-coin.jpg", pos: "42% 28%" },
  { name: "Puru", img: "assets/puru-surf.jpg", pos: "55% 42%" },
  { name: "Gogo", img: "assets/gogo-stack.jpg", pos: "28% 40%" },
  { name: "Tunas", img: "assets/tunas-rhythm.jpg", pos: "38% 36%" }
];

const SPROUT = `<svg class="sprout" viewBox="0 0 32 32" aria-hidden="true">
  <path d="M16 30V17" stroke="#3d7a22" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M16 18C16 10 10 6 3 7c0 7 5 11 13 11Z" fill="#6cb33c" stroke="#3d7a22" stroke-width="1.6"/>
  <path d="M16 16c0-7 5-11 13-10 0 7-5 10-13 10Z" fill="#8fd05a" stroke="#3d7a22" stroke-width="1.6"/></svg>`;
const WORDMARK = `PIP<span class="o">O<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22v-8" stroke="#3d7a22" stroke-width="3" stroke-linecap="round"/><path d="M12 14C12 8 8 5 3 6c0 5 4 8 9 8Z" fill="#6cb33c"/><path d="M12 13c0-5 3.5-8 9-7 0 5-3.5 7-9 7Z" fill="#8fd05a"/></svg></span>MORI`;

