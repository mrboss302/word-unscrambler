/* =========================================================================
   Word Puzzle Solver — SHARED WORD TOOLS
   Plain JavaScript. No dependencies. Works offline after first load.

   This single file powers every tool page (Word Solver, Wordle Helper,
   Anagram Generator, 5 Letter Words). Each page loads this file first, then
   a small page-specific script wires the DOM to the functions exported here.

   WHAT LIVES HERE
   ---------------
   1.  WORD_LIST .......... the shared starter dictionary (replaceable)
   2.  LETTER_SCORES ...... Scrabble letter values
   3.  cleanLetters() ..... keep a–z only, lowercase
   4.  cleanPattern() ..... normalize a Wordle-style pattern ("A__E_")
   5.  countLetters() ..... frequency map of a string
   6.  canBuildWord() ..... can the rack build this word? (respects repeats)
   7.  scoreWord() ........ Scrabble-style score
   8.  wordContainsAll() .. include filter
   9.  wordExcludesAll() .. exclude filter (with "protected" letters)
   10. matchesLength() .... length filter ("any" | "2".."7" | "8plus")
   11. matchesPattern() ... fixed-position pattern filter
   12. searchWords() ...... the general query engine used by every page
   13. groupByLength() .... bucket words by length
   14. render helpers ..... createWordCard / renderGrouped / renderFlat / renderEmpty

   REPLACING THE STARTER DICTIONARY LATER
   --------------------------------------
   WORD_LIST is a plain array so it can be swapped wholesale, or replaced by a
   fetched JSON file:
       const res = await fetch('/assets/data/words.json');
       WordTools.setWordList(await res.json());
   Keep words lowercase. For very large lists, build a letter-count index once.
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. STARTER WORD LIST  (shared across all tool pages)
   ------------------------------------------------------------------------- */
let WORD_LIST = [
  // 2-letter words
  "an","as","at","be","by","do","go","he","hi","if","in","is","it","me","my",
  "no","of","on","or","so","to","up","us","we","ax","ox","ye","ad","am","ah",
  // 3-letter words
  "act","add","age","ago","aid","aim","air","all","and","ant","any","arc","are",
  "arm","art","ash","ask","ate","bad","bag","ban","bar","bat","bed","bee","big",
  "bit","box","boy","bug","bus","but","buy","cab","can","cap","car","cat","cod",
  "cop","cow","cry","cub","cup","cut","dad","dam","day","den","dig","dim","dog",
  "dot","dry","due","dug","ear","eat","egg","ego","elf","elk","end","era","eye",
  "fan","far","fat","few","fig","fin","fit","fix","fly","fog","for","fox","fun",
  "fur","gap","gas","gem","get","got","gum","gun","gut","guy","ham","hat","hen",
  "her","hid","him","hip","his","hit","hop","hot","how","hub","hug","ice","ill",
  "ink","inn","ion","ivy","jam","jar","jaw","jet","job","jog","joy","key","kid",
  "kit","lab","lap","law","lay","leg","let","lid","lie","lip","lit","log","lot",
  "low","mad","man","map","mat","men","mix","mob","mom","mop","mud","mug","nap",
  "net","new","nod","nor","not","now","nut","oak","oar","oat","odd","off","oil",
  "old","one","our","out","owl","own","pad","pan","par","pat","paw","pay","pea",
  "pen","pet","pie","pig","pin","pit","pod","pot","pro","pub","pun","pup","put",
  "rag","ram","ran","rat","raw","red","rib","rid","rig","rim","rip","rob","rod",
  "rot","row","rub","rug","run","sad","sap","sat","saw","say","sea","see","set",
  "she","shy","sin","sip","sir","sit","six","ski","sky","sly","sob","son","sow",
  "soy","spy","sub","sum","sun","tab","tag","tan","tap","tar","tax","tea","ten",
  "the","tie","tin","tip","toe","ton","too","top","toy","try","tub","tug","two",
  "use","van","vet","vow","wag","war","was","wax","way","web","wed","wet","who",
  "why","wig","win","wit","won","yes","yet","zip","zoo",
  // 4-letter words
  "able","acid","aged","also","area","army","away","baby","back","ball","band",
  "bank","base","bath","bear","beat","been","beer","bell","belt","bend","best",
  "bird","blue","boat","body","bone","book","boot","born","both","bowl","bulk",
  "burn","busy","cage","cake","call","calm","came","camp","card","care","case",
  "cash","cast","cell","chat","chip","city","clay","club","coal","coat","code",
  "coin","cold","come","cook","cool","cope","copy","core","corn","cost","crew",
  "crop","dark","data","date","dawn","days","dead","deal","dear","debt","deck",
  "deep","deer","desk","dial","diet","dirt","dish","does","dome","done","door",
  "dose","down","draw","drop","drug","drum","dual","duck","dust","duty","each",
  "earn","ease","east","easy","edge","else","even","ever","evil","exit","face",
  "fact","fail","fair","fall","fame","farm","fast","fate","fear","feed","feel",
  "feet","fell","felt","file","fill","film","find","fine","fire","firm","fish",
  "five","flag","flat","flow","food","fool","foot","ford","form","fort","four",
  "free","frog","from","fuel","full","fund","gain","game","gate","gave","gear",
  "gift","girl","give","glad","goal","goat","goes","gold","golf","gone","good",
  "gray","grew","grid","grow","gulf","hair","half","hall","hand","hang","hard",
  "harm","hate","have","head","heal","heap","hear","heat","held","hell","help",
  "herd","hero","hide","high","hill","hint","hire","hold","hole","holy","home",
  "hope","horn","host","hour","huge","hung","hunt","hurt","icon","idea","inch",
  "into","iron","item","jazz","join","joke","jump","jury","just","keen","keep",
  "kick","kind","king","kiss","knee","knew","knot","know","lack","lady","laid",
  "lake","lamp","land","lane","last","late","lawn","lazy","lead","leaf","lean",
  "left","lend","lens","less","life","lift","like","line","link","lion","list",
  "live","load","loan","lock","logo","lone","long","look","loop","lord","lose",
  "loss","lost","loud","love","luck","lung","made","mail","main","make","male",
  "mall","many","maps","mark","mass","mate","math","meal","mean","meat","meet",
  "melt","menu","mere","mesh","mile","milk","mill","mind","mine","mint","miss",
  "mode","mood","moon","more","most","move","much","must","mute","name","navy",
  "near","neat","neck","need","nest","news","next","nice","node","none","noon",
  "nose","note","oath","obey","odds","once","only","onto","open","oral","oven",
  "over","pace","pack","page","paid","pain","pair","palm","park","part","pass",
  "past","path","peak","pear","peer","pile","pill","pine","pink","pipe","plan",
  "play","plot","plus","poem","poet","pole","poll","pond","pool","poor","port",
  "pose","post","pour","pray","prey","pull","pump","pure","push","quit","quiz",
  "race","rack","rail","rain","rank","rare","rate","read","real","rear","rely",
  "rent","rest","rice","rich","ride","ring","rise","risk","road","rock","role",
  "roll","roof","room","root","rope","rose","rule","rush","safe","sail","sake",
  "sale","salt","same","sand","save","scan","seal","seat","seed","seek","seem",
  "seen","self","sell","send","sent","ship","shoe","shop","shot","show","shut",
  "sick","side","sign","silk","sing","sink","site","size","skin","slip","slow",
  "snap","snow","soap","soft","soil","sold","sole","some","song","soon","sort",
  "soul","soup","sour","spin","spot","star","stay","stem","step","stop","such",
  "suit","sure","swim","tail","take","tale","talk","tall","tank","tape","task",
  "team","tear","tell","tend","tent","term","test","text","than","that","thee",
  "them","then","they","thin","this","thus","tide","tidy","tile","time","tiny",
  "toll","tone","tool","torn","tour","town","trap","tree","trim","trip","true",
  "tube","tune","turn","twin","type","unit","upon","used","user","vary","vast",
  "very","vice","view","vote","wage","wait","wake","walk","wall","want","ward",
  "ware","warm","wash","wave","ways","weak","wear","week","well","went","were",
  "west","what","when","whom","wide","wife","wild","will","wind","wine","wing",
  "wipe","wire","wise","wish","with","wolf","wood","wool","word","wore","work",
  "worm","wrap","yard","yarn","year","your","zero","zone","zoom",
  // 5-letter words (great for Wordle)
  "about","above","actor","acute","admit","adopt","adult","after","again","agent",
  "agree","ahead","alarm","album","alert","alike","alive","allow","alone","along",
  "alter","among","anger","angle","angry","apart","apple","apply","argue","arise",
  "armor","array","artel","aside","asset","audio","audit","await","awake","award","aware",
  "badly","baker","bases","basic","beach","began","begin","being","below","bench",
  "birth","black","blame","blank","blind","block","blood","board","boost","booth",
  "bound","brain","brand","brave","bread","break","breed","brick","brief","bring",
  "broad","broke","brown","brush","build","built","buyer","cable","caner","candy","cargo",
  "caret","carry","catch","cater","cause","chain","chair","chaos","charm","chart","chase","cheap",
  "check","chess","chest","chief","child","china","chose","civil","claim","class",
  "clean","clear","click","cliff","climb","clock","close","cloud","coach","coast",
  "could","count","court","cover","craft","crane","crash","crate","crazy","cream","crime","cross",
  "crowd","crown","crude","curve","cycle","daily","dance","dealt","death","debut",
  "delay","depth","doing","doubt","dozen","draft","drama","drank","drawn","dream",
  "dress","drill","drink","drive","drove","dying","eager","early","earth","eight",
  "elite","empty","enemy","enjoy","enter","entry","equal","error","event","every",
  "exact","exist","extra","faith","false","fault","favor","feast","fence","fewer",
  "field","fifth","fifty","fight","final","first","fixed","flame","flash","fleet",
  "float","flood","floor","flour","fluid","focus","force","forth","forty","forum",
  "found","frame","frank","fraud","fresh","front","fruit","fully","funny","ghost",
  "giant","given","glass","globe","glory","grace","grade","grain","grand","grant",
  "grass","grave","great","green","gross","group","grown","guard","guess","guest",
  "guide","happy","harsh","heart","heavy","hello","hence","hobby","honey","honor",
  "horse","hotel","house","human","ideal","image","index","inlet","inner","input","issue",
  "joint","judge","juice","known","label","labor","large","laser","later","laugh",
  "layer","learn","lease","least","leave","legal","lemon","level","light","limit",
  "linen","links","lived","liver","lobby","local","logic","loose","lower","loyal",
  "lucky","lunch","magic","major","maker","march","match","maybe","mayor","meant",
  "medal","media","metal","meter","might","minor","minus","mixed","model","money",
  "month","moral","motor","mount","mouse","mouth","movie","music","nacre","needs","nerve",
  "never","newly","night","noble","noise","north","notes","novel","nurse","ocean","offer",
  "often","onion","onset","order","other","ought","ounce","paint","panel","paper","parse","party",
  "peace","pears","phase","phone","photo","piano","piece","pilot","pitch","place","plain",
  "plane","plant","plate","point","pound","power","press","price","pride","prime",
  "print","prior","prize","proof","proud","prove","pupil","queen","quick","quiet",
  "quite","radio","raise","range","rapes","rapid","ratel","ratio","reach","react","ready","realm","rebel",
  "refer","relax","reply","rider","ridge","right","rigid","river","robot","rough",
  "round","route","royal","rural","scale","scare","scene","scope","score","sense",
  "serve","setup","seven","shade","shake","shall","shape","share","sharp","sheep",
  "sheet","shelf","shell","shift","shine","shirt","shock","shoot","shore","short",
  "shown","sight","silly","since","sixth","sixty","skill","sleep","slide","slope",
  "small","smart","smell","smile","smoke","snake","solid","solve","sorry","sound",
  "south","space","spare","speak","spear","speed","spell","spend","spent","spice","spine",
  "split","spoke","sport","squad","stack","staff","stage","stair","stake","stand",
  "stare","start","state","steam","steel","steep","steer","stick","still","stock",
  "stone","stood","store","storm","story","strip","study","stuff","style","sugar",
  "suite","sunny","super","sweet","swift","swing","sword","table","taken","taste",
  "taxes","teach","teeth","tempo","tenth","terms","thank","theft","their","theme",
  "there","these","thick","thing","think","third","those","three","threw","throw",
  "thumb","tiger","tight","timer","tired","title","today","token","tones","topic","total",
  "touch","tough","tower","trace","track","trade","trail","train","treat","trend",
  "trial","tribe","trick","tried","truck","truly","trunk","trust","truth","twice",
  "twist","ultra","uncle","under","undue","union","unite","unity","until","upper",
  "upset","urban","usage","usual","valid","value","video","virus","visit","vital",
  "vivid","vocal","voice","waste","watch","water","wheel","where","which","while",
  "white","whole","whose","woman","women","world","worry","worse","worst","worth",
  "would","wound","wrist","write","wrong","wrote","yield","young","youth",
  // 6-letter words
  "accept","access","across","action","active","actual","advice","affect","afford",
  "almost","always","amount","animal","annual","answer","anyone","appeal","around",
  "arrive","artist","aspect","assess","assist","assume","attack","attend","author",
  "autumn","backup","ballet","banana","banner","barely","basket","battle","beauty",
  "before","behalf","behave","behind","belief","belong","better","beyond","bishop",
  "border","bottle","bottom","branch","breath","bridge","bright","broken","budget",
  "burden","bureau","button","camera","cancel","cancer","candle","canvas","carbon",
  "career","castle","casual","caught","center","centre","chance","change","charge",
  "choice","choose","chosen","church","circle","client","closed","closer","coffee",
  "column","combat","coming","common","copper","corner","costly","cotton","county",
  "couple","course","cousin","covers","create","credit","crisis","critic","crowd",
  "custom","damage","danger","dealer","debate","decade","decide","defeat","defend",
  "define","degree","demand","depend","deploy","deputy","desert","design","desire",
  "detail","detect","device","differ","dinner","direct","doctor","dollar","domain",
  "double","driven","driver","during","easily","eating","editor","effect","effort",
  "either","eleven","emerge","empire","employ","enable","ending","energy","engage",
  "engine","enough","ensure","enlist","entire","entity","equity","escape","estate","ethics",
  "exceed","except","excess","expand","expect","expert","export","extend","extent",
  "fabric","facing","factor","failed","fairly","fallen","family","famous","father",
  "fellow","female","figure","finger","finish","fiscal","flight","flying","follow",
  "forest","forget","formal","format","former","foster","fought","fourth","frame",
  "freeze","french","friend","frozen","future","garden","gather","gender","genius",
  "gentle","german","global","golden","ground","growth","guilty","handle","happen",
  "hardly","headed","health","height","hidden","holder","honest","horror","hotels",
  "humans","hunter","hybrid","ignore","impact","import","income","indeed","injury",
  "inlets","inside","intend","intent","invest","island","itself","jacket","jersey","jungle",
  "junior","killed","killer","ladder","latest","latter","launch","lawyer","leader",
  "league","leaves","legacy","length","lesson","letter","lights","likely","linear",
  "liquid","listen","little","living","locate","lonely","longer","losing","luxury",
  "mainly","makeup","manage","manner","manual","margin","marine","marked","market",
  "master","matter","mature","medium","member","memory","mental","merely","method",
  "middle","mighty","minute","mirror","mobile","modern","modest","module","moment",
  "morale","mostly","mother","motion","murder","muscle","museum","mutual","myself",
  "narrow","nation","native","nature","nearby","nearly","needle","nephew","nicely",
  "nobody","noting","notice","notion","number","object","obtain","occupy","occur",
  "office","offset","online","option","orange","origin","output","oxford","oxygen",
  "packet","palace","parade","parent","partly","patent","patrol","people","period",
  "permit","person","phrase","picked","planet","player","please","plenty",
  "pocket","poetry","police","policy","prefer","pretty","prince","prison","profit",
  "proper","proven","public","purple","pursue","puzzle","queens","racing","random",
  "rarely","rather","rating","reader","really","reason","recall","recent","recipe",
  "record","reduce","reform","refuse","regard","regime","region","reject","relate",
  "relief","remain","remote","remove","repair","repeat","report","rescue","resort",
  "result","resume","retail","retain","retire","return","reveal","review","reward",
  "riding","ritual","robust","rocket","ruling","runner","sacred","safety","salary",
  "sample","saving","saying","scheme","school","screen","script","search","season",
  "second","secret","sector","secure","select","seller","senior","sensor","series",
  "server","settle","severe","shadow","shaped","shared","should","shower","signal",
  "silent","silver","simple","simply","single","sister","slight","smooth","social",
  "soccer","socket","solely","sooner","source","speech","spirit","spread","spring",
  "square","stable","stairs","starch","status","steady","stolen","stream","street",
  "stress","strict","strike","string","stripe","strong","struck","studio","stupid",
  "submit","subtle","suburb","sudden","suffer","summer","summit","sunset","supply",
  "surely","survey","switch","symbol","system","tablet","tackle","talent","target",
  "taught","temple","tenant","tender","tennis","theory","thirty","though","threat",
  "thrown","ticket","timber","timely","tinsel","tissue","toilet","tomato","tongue","toward",
  "travel","treaty","trying","tunnel","twelve","twenty","unable","unfair","unique",
  "united","unless","unlike","update","useful","valley","vendor","verbal","versus",
  "victim","viewer","virtue","vision","visual","volume","voting","walker","wander",
  "wealth","weekly","weight","wheels","wholly","window","winner","winter",
  "wisdom","within","wonder","wooden","worker","wright","writer","yellow",
  // 7-letter and longer words
  "ability","absence","academy","account","accused","achieve","acquire","address",
  "advance","adverse","advised","adviser","against","airline","airport","alcohol",
  "ancient","another","anxiety","anybody","applied","arrange","arrival","article",
  "assault","assumed","attempt","attract","auction","average","backing","balance",
  "banking","battery","bearing","beneath","benefit","besides","between","billion",
  "binding","brother","builder","cabinet","capable","capital","captain","caption",
  "capture","careful","carrier","ceiling","central","century","certain","chamber",
  "channel","chapter","charity","chicken","clarity","classic","climate","closing",
  "clothes","cluster","collect","college","combine","comfort","command","comment",
  "company","compare","compete","complex","concept","concern","concert","conduct",
  "confirm","connect","consent","consist","contact","contain","content","contest",
  "context","control","convert","cooking","correct","cottage","council","counter",
  "country","crucial","crystal","culture","curious","current","cutting","decline",
  "default","defence","deficit","deliver","density","deposit","desktop","despite",
  "destroy","develop","diamond","digital","dignity","discuss","disease","display",
  "dispute","distant","diverse","divided","dolphin","drawing","driving",
  "dynamic","eastern","economy","edition","elastic","elderly","element","embrace",
  "emotion","emperor","enhance","essence","evening","evident","examine","example",
  "exhibit","explain","explore","express","extreme","factory","faculty","failure",
  "fantasy","fashion","feature","federal","feeling","fiction","fifteen","finance",
  "finding","fitness","foreign","forever","formula","fortune","forward","founder",
  "freedom","gallery","gateway","general","genuine","gesture","grammar","grandma",
  "graphic","gravity","greater","grocery","habitat","harmony","heading","healthy",
  "hearing","heavily","helpful","herself","highway","history","holiday","housing",
  "however","hundred","husband","imagine","impress","improve","include","initial",
  "inquiry","insight","inspire","install","instant","instead","intense","interim",
  "involve","jewelry","journal","journey","justice","justify","kitchen","landing",
  "largely","leading","learned","leather","lecture","leisure","liberal","liberty",
  "library","license","limited","listing","logical","loyalty","machine","manager",
  "married","massive","maximum","meaning","measure","medical","meeting","mention",
  "message","midwest","mileage","mindset","minimal","minimum","mission","mistake",
  "mixture","monster","monthly","morning","musical","mystery","natural","neither",
  "nervous","network","neutral","nominal","nothing","nowhere","nuclear","nucleus",
  "obvious","offense","officer","onboard","operate","opinion","organic","outcome",
  "outdoor","outlook","overall","package","painted","painter","partial","partner",
  "passage","passion","patient","pattern","payment","penalty","pending","pension",
  "percent","perfect","perform","perhaps","picture","pioneer","plastic","pleased",
  "popular","portion","poverty","precise","predict","premier","premium","prepare",
  "present","prevent","primary","privacy","private","problem","proceed",
  "process","produce","product","profile","program","project","promise","promote",
  "propose","protect","protein","protest","provide","publish","purpose","pursuit",
  "quality","quarter","radical","railway","reading","reality","realize","receipt",
  "receive","recover","reflect","regular","related","release","remains","removal",
  "replace","request","require","reserve","resolve","respect","respond","restore",
  "revenue","reverse","routine","romance","running","satisfy","scatter","science",
  "section","segment","serious","service","session","setting","several","shallow",
  "sharing","shelter","shorter","showing","silence","similar","sitting","society",
  "soldier","someone","speaker","special","species","sponsor","stadium","station",
  "storage","strange","stretch","student","subject","succeed","success","suggest",
  "summary","support","suppose","supreme","surface","surgery","survive","suspect",
  "sustain","teacher","theater","therapy","thought","through","tonight",
  "tourist","towards","traffic","trouble","typical","uniform",
  "unknown","unusual","upgrade","utility","variety","various","vehicle","venture",
  "version","veteran","victory","village","violent","visible","visitor","wedding",
  "weekend","welcome","welfare","western","whereas","whisper","willing",
  "without","witness","working","writing","written","economic","engineer","exercise",
  "favorite","football","language","learning","marriage","mountain","mushroom",
  "remember","sentence","strength","struggle","surprise","tomorrow","universe",
  "vacation","weakness","birthday","building","calendar","champion","chemical",
  "children","computer","decision","describe","designer","discover","document",
  "elephant","entrance","everyone","exchange","exciting","graduate","grateful",
  "hospital","hundreds","identity","increase","industry","interest","internet",
  "kingdom","keyboard","practice","question","scramble","unscramble","dictionary",
  "wordplay","crossword","alphabet","syllable","spelling","vocabulary"
];

/* -------------------------------------------------------------------------
   2. SCRABBLE LETTER VALUES
   ------------------------------------------------------------------------- */
const LETTER_SCORES = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8,
  k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1,
  u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
};

/* Allow a larger dictionary to be swapped in later (see header notes). */
function setWordList(list) {
  if (Array.isArray(list)) WORD_LIST = list;
}

/* Add words to the current list, de-duplicated. Returns the new total. */
function extendWordList(list) {
  if (!Array.isArray(list) || !list.length) return WORD_LIST.length;
  const seen = Object.create(null);
  const merged = [];
  const all = WORD_LIST.concat(list);
  for (let i = 0; i < all.length; i++) {
    const w = all[i];
    if (!seen[w]) { seen[w] = 1; merged.push(w); }
  }
  WORD_LIST = merged;
  return WORD_LIST.length;
}

/* -------------------------------------------------------------------------
   LAUNCH DICTIONARY MERGE
   The curated WORD_LIST above is the guaranteed baseline (it supplies common
   2-letter words and the worked examples each tool advertises). If the large
   launch dictionary (assets/js/dictionary.js) is available, merge it in so the
   tools cover a broad English vocabulary. The baseline always wins on
   presence, so examples keep resolving even if the big list is swapped out.
     - Browser: dictionary.js (loaded BEFORE this file) sets a global.
     - Node:    we require() the sibling file directly.
   ------------------------------------------------------------------------- */
(function mergeLaunchDictionary() {
  let big = null;
  if (typeof window !== "undefined" && Array.isArray(window.WORD_PUZZLE_DICTIONARY)) {
    big = window.WORD_PUZZLE_DICTIONARY;
  } else if (typeof require !== "undefined") {
    try { big = require("./dictionary.js"); } catch (e) { /* optional — baseline only */ }
  }
  if (big) extendWordList(big);
})();

/* -------------------------------------------------------------------------
   CURATED WORD-GAME SUPPLEMENT
   Common short words that players expect in word games but that the broad
   English source list may omit (especially modern two-letter plays). These
   are added so everyday puzzle searches feel complete.

   NOTE: These are general puzzle-help additions. They are NOT claimed to be
   official Scrabble, Words With Friends, Wordle, or New York Times words.
   Always confirm a word against the official dictionary of the game you play.
   ------------------------------------------------------------------------- */
const WORD_GAME_SUPPLEMENT = [
  // Two-letter words players commonly reach for
  "aa","ab","ad","ae","ag","ah","ai","al","ar","aw","ax","ay","ba","bi","bo",
  "da","de","ed","ef","eh","el","em","en","er","es","et","ew","ex","fa","fe",
  "gi","hm","ho","id","jo","ka","ki","la","li","lo","ma","mi","mm","mo","mu",
  "na","ne","nu","od","oe","oi","om","op","os","ou","ow","ox","oy","pa","pe",
  "pi","po","qi","re","sh","si","ta","te","ti","ud","um","un","ut","wo","xi",
  "xu","ya","ye","yo","za","zo",
  // A few short higher-value plays often missing
  "qis","zas","jos","suq","qat","qua","zax","wiz","biz","fiz","coz","zek"
];
extendWordList(WORD_GAME_SUPPLEMENT);

/* -------------------------------------------------------------------------
   3. INPUT CLEANING — keep only a–z, lowercase.
   ------------------------------------------------------------------------- */
function cleanLetters(raw) {
  return (raw || "").toLowerCase().replace(/[^a-z]/g, "");
}

/* -------------------------------------------------------------------------
   4. PATTERN CLEANING — for Wordle-style fixed-position patterns ("A__E_").
   Any character that is not a–z becomes a blank ("_"). Length is preserved.
   ------------------------------------------------------------------------- */
function cleanPattern(raw) {
  return (raw || "").toLowerCase().replace(/[^a-z]/g, "_");
}

/* -------------------------------------------------------------------------
   5. LETTER COUNTING — "free" -> { f:1, r:1, e:2 }
   ------------------------------------------------------------------------- */
function countLetters(letters) {
  const counts = {};
  for (const ch of letters) counts[ch] = (counts[ch] || 0) + 1;
  return counts;
}

/* -------------------------------------------------------------------------
   6. WORD VALIDATION — can this word be built from the available pool?
   Repeated letters are only allowed if the rack holds enough copies.
   ------------------------------------------------------------------------- */
function canBuildWord(word, availableCounts) {
  const need = {};
  for (const ch of word) {
    need[ch] = (need[ch] || 0) + 1;
    if (need[ch] > (availableCounts[ch] || 0)) return false;
  }
  return true;
}

/* -------------------------------------------------------------------------
   7. SCRABBLE-STYLE SCORE
   ------------------------------------------------------------------------- */
function scoreWord(word) {
  let total = 0;
  for (const ch of word) total += LETTER_SCORES[ch] || 0;
  return total;
}

/* -------------------------------------------------------------------------
   8. INCLUDE FILTER — word must contain every required letter at least once.
   ------------------------------------------------------------------------- */
function wordContainsAll(word, required) {
  for (const ch of required) if (!word.includes(ch)) return false;
  return true;
}

/* -------------------------------------------------------------------------
   9. EXCLUDE FILTER — word must NOT contain any excluded letter.
   EXCEPTION: a letter listed in `protectedStr` is allowed even if excluded.
   This matters for Wordle/5-letter searches where a letter can be both
   "in the word" (green/yellow) AND grayed elsewhere on a duplicate tile.
   ------------------------------------------------------------------------- */
function wordExcludesAll(word, excluded, protectedStr) {
  const keep = new Set(cleanLetters(protectedStr || ""));
  for (const ch of excluded) {
    if (keep.has(ch)) continue;
    if (word.includes(ch)) return false;
  }
  return true;
}

/* -------------------------------------------------------------------------
   10. LENGTH FILTER — "any" | "2".."7" | "8plus"
   ------------------------------------------------------------------------- */
function matchesLength(word, mode) {
  if (!mode || mode === "any") return true;
  if (mode === "8plus") return word.length >= 8;
  return word.length === Number(mode);
}

/* -------------------------------------------------------------------------
   11. PATTERN FILTER — fixed positions; blanks ("_") match anything.
   The pattern and word must be the same length.
   ------------------------------------------------------------------------- */
function matchesPattern(word, pattern) {
  if (!pattern) return true;
  if (word.length !== pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    if (p === "_") continue;
    if (word[i] !== p) return false;
  }
  return true;
}

/* -------------------------------------------------------------------------
   12. SEARCH ENGINE — the single query function every page uses.
   All criteria are optional. Returns a de-duplicated, sorted array.

   criteria = {
     letters:      available letters (rack); if set, words must be buildable
     include:      letters that must appear somewhere
     exclude:      letters that must NOT appear (see wordExcludesAll)
     startsWith:   prefix
     endsWith:     suffix
     contains:     substring
     lengthMode:   "any" | "2".."7" | "8plus"
     fixedLength:  number — force an exact length (e.g. 5 for Wordle pages)
     pattern:      Wordle-style "A__E_" (auto-sized to fixedLength when given)
     posExcludes:  array of strings; posExcludes[i] = letters banned at index i
     sort:         "alpha" | "lengthDesc" (default "lengthDesc")
   }
   ------------------------------------------------------------------------- */
function searchWords(criteria) {
  const c = criteria || {};
  const letters = cleanLetters(c.letters || "");
  const counts = letters ? countLetters(letters) : null;
  const include = cleanLetters(c.include || "");
  const exclude = cleanLetters(c.exclude || "");
  const starts = cleanLetters(c.startsWith || "");
  const ends = cleanLetters(c.endsWith || "");
  const contains = cleanLetters(c.contains || "");
  const lengthMode = c.lengthMode || "any";
  const fixedLength = c.fixedLength || null;
  const posExcludes = c.posExcludes || null;

  // Excluded letters that are "protected" (in pattern or include list).
  let pattern = c.pattern ? cleanPattern(c.pattern) : "";
  if (pattern && fixedLength) {
    // Size the pattern to the fixed length: pad short patterns with blanks.
    pattern = pattern.slice(0, fixedLength).padEnd(fixedLength, "_");
    if (/^_+$/.test(pattern)) pattern = ""; // all-blank = no constraint
  }
  const patternLetters = pattern.replace(/_/g, "");
  const protectedStr = include + patternLetters;

  const out = [];
  for (const word of WORD_LIST) {
    if (fixedLength && word.length !== fixedLength) continue;
    if (!matchesLength(word, lengthMode)) continue;
    if (counts && !canBuildWord(word, counts)) continue;
    if (include && !wordContainsAll(word, include)) continue;
    if (exclude && !wordExcludesAll(word, exclude, protectedStr)) continue;
    if (starts && !word.startsWith(starts)) continue;
    if (ends && !word.endsWith(ends)) continue;
    if (contains && !word.includes(contains)) continue;
    if (pattern && !matchesPattern(word, pattern)) continue;
    if (posExcludes) {
      let banned = false;
      for (let i = 0; i < word.length; i++) {
        const set = posExcludes[i];
        if (set && set.indexOf(word[i]) !== -1) { banned = true; break; }
      }
      if (banned) continue;
    }
    out.push(word);
  }

  const unique = Array.from(new Set(out));
  return sortWords(unique, c.sort);
}

/* -------------------------------------------------------------------------
   SORTING — "alpha" | "scoreDesc" | "lengthDesc" (default).
   Returns the same array, sorted in place.
   ------------------------------------------------------------------------- */
function sortWords(words, mode) {
  if (mode === "alpha") {
    words.sort((a, b) => a.localeCompare(b));
  } else if (mode === "scoreDesc") {
    words.sort((a, b) => (scoreWord(b) - scoreWord(a)) || a.localeCompare(b));
  } else {
    words.sort((a, b) => (b.length - a.length) || a.localeCompare(b));
  }
  return words;
}

/* -------------------------------------------------------------------------
   13. GROUP BY LENGTH — { 5: [...], 4: [...] }
   ------------------------------------------------------------------------- */
function groupByLength(words) {
  const groups = {};
  for (const word of words) {
    (groups[word.length] = groups[word.length] || []).push(word);
  }
  return groups;
}

/* =========================================================================
   14. RENDER HELPERS  (no-ops under Node — they need a DOM)
   ========================================================================= */
function createWordCard(word) {
  const li = document.createElement("li");
  li.className = "word";
  const text = document.createElement("span");
  text.className = "word__text";
  text.textContent = word;
  const score = document.createElement("span");
  score.className = "word__score";
  score.title = "Scrabble score";
  score.textContent = scoreWord(word);
  li.appendChild(text);
  li.appendChild(score);
  return li;
}

function renderEmpty(resultsEl, message) {
  resultsEl.innerHTML = "";
  const empty = document.createElement("p");
  empty.className = "results__empty";
  empty.textContent = message;
  resultsEl.appendChild(empty);
}

/* Grouped, longest-first view (Word Solver, Anagram Generator). */
function renderGrouped(resultsEl, words) {
  resultsEl.innerHTML = "";
  const groups = groupByLength(words);
  const lengths = Object.keys(groups).map(Number).sort((a, b) => b - a);

  for (const len of lengths) {
    const group = document.createElement("section");
    group.className = "wordgroup";

    const heading = document.createElement("h3");
    heading.className = "wordgroup__title";
    heading.textContent = `${len}-letter words`;
    const count = document.createElement("span");
    count.className = "wordgroup__count";
    count.textContent = groups[len].length;
    heading.appendChild(count);
    group.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "wordgroup__list";
    for (const word of groups[len]) list.appendChild(createWordCard(word));
    group.appendChild(list);
    resultsEl.appendChild(group);
  }
}

/* Flat, single-list view (Wordle Helper, 5 Letter Words). */
function renderFlat(resultsEl, words, label) {
  resultsEl.innerHTML = "";
  const group = document.createElement("section");
  group.className = "wordgroup";

  const heading = document.createElement("h3");
  heading.className = "wordgroup__title";
  heading.textContent = label || "Matches";
  const count = document.createElement("span");
  count.className = "wordgroup__count";
  count.textContent = words.length;
  heading.appendChild(count);
  group.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "wordgroup__list";
  for (const word of words) list.appendChild(createWordCard(word));
  group.appendChild(list);
  resultsEl.appendChild(group);
}

/* =========================================================================
   15. RESULTS VIEW CONTROLLER  (browser only — needs a DOM)
   -------------------------------------------------------------------------
   Renders results in batches of 100 with a keyboard-accessible
   "Show more results" button, so a query returning thousands of words never
   floods the DOM. Tracks its own paging state.

   refs = { resultsEl, summaryEl, liveEl }
   view.render(words, {
     mode: "grouped" | "flat",   // grouped = sections by length
     flatLabel: "5-letter words",
     leadSpans: "<span>…</span>",// summary HTML shown before the count line
     emptyMessage: "…"
   })
   view.clear()
   ------------------------------------------------------------------------- */
const RESULTS_PAGE_SIZE = 100;

function createResultsView(refs) {
  let full = [];
  let visible = 0;
  let mode = "grouped";
  let flatLabel = "Matches";
  let leadSpans = "";

  const fmt = (n) => n.toLocaleString("en-US");

  function buildGroups(slice) {
    const frag = document.createDocumentFragment();
    const groups = groupByLength(slice);
    const lengths = Object.keys(groups).map(Number).sort((a, b) => b - a);
    for (const len of lengths) {
      const section = document.createElement("section");
      section.className = "wordgroup";
      const h = document.createElement("h3");
      h.className = "wordgroup__title";
      h.textContent = len + "-letter words";
      const c = document.createElement("span");
      c.className = "wordgroup__count";
      c.textContent = groups[len].length;
      h.appendChild(c);
      section.appendChild(h);
      const ul = document.createElement("ul");
      ul.className = "wordgroup__list";
      for (const w of groups[len]) ul.appendChild(createWordCard(w));
      section.appendChild(ul);
      frag.appendChild(section);
    }
    return frag;
  }

  function buildFlat(slice) {
    const frag = document.createDocumentFragment();
    const section = document.createElement("section");
    section.className = "wordgroup";
    const h = document.createElement("h3");
    h.className = "wordgroup__title";
    h.textContent = flatLabel;
    const c = document.createElement("span");
    c.className = "wordgroup__count";
    c.textContent = full.length;
    h.appendChild(c);
    section.appendChild(h);
    const ul = document.createElement("ul");
    ul.className = "wordgroup__list";
    for (const w of slice) ul.appendChild(createWordCard(w));
    section.appendChild(ul);
    frag.appendChild(section);
    return frag;
  }

  function paint() {
    refs.resultsEl.innerHTML = "";
    const slice = full.slice(0, visible);
    refs.resultsEl.appendChild(mode === "flat" ? buildFlat(slice) : buildGroups(slice));

    if (visible < full.length) {
      const wrap = document.createElement("div");
      wrap.className = "results__more";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--ghost results__more-btn";
      const next = Math.min(RESULTS_PAGE_SIZE, full.length - visible);
      btn.textContent = "Show " + next + " more result" + (next === 1 ? "" : "s");
      btn.addEventListener("click", () => {
        visible = Math.min(visible + RESULTS_PAGE_SIZE, full.length);
        paint();
        updateSummary();
        const again = refs.resultsEl.querySelector(".results__more-btn");
        if (again) again.focus();
      });
      wrap.appendChild(btn);
      refs.resultsEl.appendChild(wrap);
    }
  }

  function updateSummary() {
    const showing = Math.min(visible, full.length);
    let html = leadSpans;
    if (full.length > RESULTS_PAGE_SIZE) {
      html += `<span>Showing <strong>${fmt(showing)}</strong> of <strong>${fmt(full.length)}</strong> words</span>`;
    }
    refs.summaryEl.innerHTML = html;
    if (refs.liveEl) {
      refs.liveEl.textContent =
        `${fmt(full.length)} word${full.length === 1 ? "" : "s"} found. Showing ${fmt(showing)}.`;
    }
  }

  return {
    render(words, opts) {
      opts = opts || {};
      full = words || [];
      mode = opts.mode || "grouped";
      flatLabel = opts.flatLabel || "Matches";
      leadSpans = opts.leadSpans || "";
      visible = Math.min(RESULTS_PAGE_SIZE, full.length);

      if (full.length === 0) {
        renderEmpty(refs.resultsEl, opts.emptyMessage || "No words matched.");
        refs.summaryEl.innerHTML = leadSpans;
        if (refs.liveEl) refs.liveEl.textContent = "No words found.";
        return;
      }
      paint();
      updateSummary();
    },
    clear() {
      full = []; visible = 0;
      refs.resultsEl.innerHTML = "";
      refs.summaryEl.innerHTML = "";
      if (refs.liveEl) refs.liveEl.textContent = "Cleared.";
    }
  };
}

/* =========================================================================
   EXPORTS — browser global + Node module
   ========================================================================= */
const WordTools = {
  get WORD_LIST() { return WORD_LIST; },
  setWordList, extendWordList,
  LETTER_SCORES,
  cleanLetters, cleanPattern, countLetters, canBuildWord, scoreWord,
  wordContainsAll, wordExcludesAll, matchesLength, matchesPattern,
  searchWords, sortWords, groupByLength,
  createWordCard, renderEmpty, renderGrouped, renderFlat, createResultsView,
  RESULTS_PAGE_SIZE
};

if (typeof window !== "undefined") {
  window.WordTools = WordTools;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = WordTools;
}

/* =========================================================================
   INTERNAL LOGIC TESTS  (Node only — never runs in the browser)
   -------------------------------------------------------------------------
   Run with:   node assets/js/word-tools.js
   ========================================================================= */
if (typeof require !== "undefined" && require.main === module) {
  let passed = 0, failed = 0;
  function assert(label, cond) {
    if (cond) { passed++; console.log("  ✓ " + label); }
    else { failed++; console.error("  ✗ " + label); }
  }
  function has(list, expected) { return expected.every((w) => list.includes(w)); }

  console.log("Shared word tools — logic tests\n");

  // cleanLetters
  assert("cleanLetters strips digits/punct, lowercases", cleanLetters("Tr4ce!! @#") === "trce");
  assert("cleanPattern turns non-letters into blanks", cleanPattern("A__E_") === "a__e_");

  // countLetters
  const fc = countLetters("free");
  assert("countLetters counts repeats (free -> e:2)", fc.e === 2 && fc.f === 1 && fc.r === 1);

  // canBuildWord + repeated letters
  assert("canBuildWord allows repeat when enough copies", canBuildWord("free", countLetters("free")) === true);
  assert("canBuildWord rejects when too few copies", canBuildWord("free", countLetters("fre")) === false);
  assert("single B cannot build double-B word", canBuildWord("ebb", countLetters("eb")) === false);

  // length filtering
  assert("matchesLength exact 3", matchesLength("cat", "3") === true);
  assert("matchesLength fails wrong length", matchesLength("cat", "4") === false);
  assert("matchesLength 8plus", matchesLength("computer", "8plus") === true);

  // starts / ends / contains via searchWords
  assert("startsWith filter", searchWords({ startsWith: "st", fixedLength: 5 }).every((w) => w.startsWith("st")));
  assert("endsWith filter", searchWords({ endsWith: "e", fixedLength: 5 }).every((w) => w.endsWith("e")));
  assert("contains filter", searchWords({ contains: "oo" }).every((w) => w.includes("oo")));

  // include / exclude
  assert("include filter keeps only words with required letters",
    searchWords({ letters: "trace", include: "c" }).every((w) => w.includes("c")));
  assert("exclude filter removes words containing excluded letter",
    searchWords({ fixedLength: 5, exclude: "aeiou" }).every((w) => !/[aeiou]/.test(w)));
  assert("exclude respects protected (include) letters",
    searchWords({ fixedLength: 5, include: "a", exclude: "a" }).every((w) => w.includes("a")));

  // 5-letter-only
  assert("fixedLength 5 returns only 5-letter words",
    searchWords({ contains: "a", fixedLength: 5 }).every((w) => w.length === 5));

  // pattern matching A__E_
  assert("matchesPattern A__E_ matches 'agree'", matchesPattern("agree", "a__e_") === true);
  assert("matchesPattern A__E_ rejects 'apple'", matchesPattern("apple", "a__e_") === false);
  assert("searchWords pattern A__E_ all conform",
    searchWords({ fixedLength: 5, pattern: "A__E_" }).every((w) => w[0] === "a" && w[3] === "e"));

  // Wordle fixed-position + position exclusions
  const wordle = searchWords({
    fixedLength: 5,
    pattern: "_____",
    include: "a",
    exclude: "iou",
    posExcludes: ["", "", "a", "", ""], // 'a' cannot be in position 3
    sort: "alpha"
  });
  assert("Wordle search: every word has 'a'", wordle.every((w) => w.includes("a")));
  assert("Wordle search: no banned 'a' in position 3", wordle.every((w) => w[2] !== "a"));
  assert("Wordle search: excludes i/o/u (unless protected)", wordle.every((w) => !/[iou]/.test(w)));

  // anagram examples
  assert("listen -> silent, enlist, tinsel, inlets",
    has(searchWords({ letters: "listen" }), ["silent", "enlist", "tinsel", "inlets"]));
  assert("trace -> cater, crate, react, caret, trace",
    has(searchWords({ letters: "trace" }), ["cater", "crate", "react", "caret", "trace"]));
  assert("spare -> spear, pears, parse, rapes",
    has(searchWords({ letters: "spare" }), ["spear", "pears", "parse", "rapes"]));
  assert("stone -> notes, tones, onset",
    has(searchWords({ letters: "stone" }), ["notes", "tones", "onset"]));
  assert("alert -> later, alter, ratel, artel",
    has(searchWords({ letters: "alert" }), ["later", "alter", "ratel", "artel"]));
  assert("crane -> caner, nacre, crane",
    has(searchWords({ letters: "crane" }), ["caner", "nacre", "crane"]));

  // word solver example: letters + starts-with
  assert("word solver: letters 'trace' + startsWith 'c' all valid",
    searchWords({ letters: "trace", startsWith: "c" }).every((w) => w.startsWith("c")));

  // --- Curated word-game supplement ---
  assert("supplement adds 'qi'", WORD_LIST.includes("qi"));
  assert("supplement adds 'za'", WORD_LIST.includes("za"));
  assert("supplement adds 'jo' and 'xu'", WORD_LIST.includes("jo") && WORD_LIST.includes("xu"));
  assert("supplement words are searchable (rack 'qist' finds 'qi')",
    searchWords({ letters: "qist" }).includes("qi"));

  // --- No duplicates after merging dictionary + supplement ---
  assert("WORD_LIST has no duplicate entries",
    WORD_LIST.length === new Set(WORD_LIST).size);

  // --- Sorting ---
  const sa = sortWords(["bb", "aaaa", "cc", "aa"], "alpha");
  assert("sortWords alpha", sa.join(",") === "aa,aaaa,bb,cc");
  const sl = sortWords(["aa", "bbbb", "cc", "ddd"], "lengthDesc");
  assert("sortWords lengthDesc then alpha", sl.join(",") === "bbbb,ddd,aa,cc");
  // 'quiz' (q10+u1+i1+z10=22) should outrank 'aero' (1+1+1+1=4) by score.
  const ss = sortWords(["aero", "quiz"], "scoreDesc");
  assert("sortWords scoreDesc puts higher score first", ss[0] === "quiz");
  assert("searchWords sort:scoreDesc is non-increasing by score",
    (function () {
      const r = searchWords({ fixedLength: 5, startsWith: "qu", sort: "scoreDesc" });
      for (let i = 1; i < r.length; i++) {
        if (scoreWord(r[i - 1]) < scoreWord(r[i])) return false;
      }
      return r.length > 0;
    })());

  // --- Result limiting / batch math (the view shows RESULTS_PAGE_SIZE at a time) ---
  assert("RESULTS_PAGE_SIZE is 100", RESULTS_PAGE_SIZE === 100);
  (function testBatching() {
    // Simulate the view's paging math without a DOM.
    const big = searchWords({ fixedLength: 5 }); // thousands of words
    assert("a broad query returns more than one page", big.length > RESULTS_PAGE_SIZE);
    let visible = Math.min(RESULTS_PAGE_SIZE, big.length);
    assert("first batch shows exactly 100", visible === 100);
    visible = Math.min(visible + RESULTS_PAGE_SIZE, big.length); // one "show more"
    assert("second batch reveals the next 100", visible === 200);
    // Show-more eventually reaches the full count without overshooting.
    while (visible < big.length) visible = Math.min(visible + RESULTS_PAGE_SIZE, big.length);
    assert("show-more converges to the full count", visible === big.length);
  })();

  console.log("\n" + passed + " passed, " + failed + " failed.");
  if (failed > 0) process.exit(1);
}
