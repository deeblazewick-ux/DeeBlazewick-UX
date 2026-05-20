/**
 * Shared pool: valid guesses and possible solutions.
 * Curated for everyday English (expand freely).
 */
const RAW = `
about above abuse actor adapt adult after again agent agree ahead alarm album alert
alien align alike alive allow alone along alter amble ample angel anger angle angry
apart apple apply arena argue arise armor aroma array arrow aside asset audio audit
avoid awake award aware badly baker bases basic beach began begin being below bench
berry birth black blade blame blank blast blaze bless blind block blood bloom board
boast bonus boost bound brain brake brand brave bread break brick brief bring broad
broke brown brush build built burst cabin cable camel canal candy carry carve catch
cause chain chair chalk chaos chart chase cheap cheek chest chief child china choir
chunk civic civil claim class clean clear clerk climb clock close cloth cloud coach
coast color comic coral couch cover crack craft crash cream crime crisp cross crowd
crown crude curve dance dealt death debut delay delta demon dense depot depth diary
diner dirty disco dodge donor doubt dozen draft drama drank dream dress drill drink
drive droop drown dwarf eagle early earth eater elbow elite email embed empty enemy
enjoy enter entry epoch equal equip erase error erupt essay ether event every evict
exact exert exile exist extra faint fairy false fancy fatal fault favor feast fence
ferry field fifth fifty fight final first fixed flash fleet flesh float flood floor
flour fluid flush focus force forge forth found frame frank fraud fresh front frost
fruit funny giant given glass glide globe glory grace grade grain grand grant grape
grass grave great green greet grief grill grind group grove guard guess guest guide
habit happy harsh haven heady heart heavy hedge hello hitch hobby hoist honey honor
horror horse hotel house human humor hurry ideal image imply index inner input irony
issue ivory japan joint judge juice jumpy junta joust knife knock label labor large
laser later laugh layer learn lease least leave legal lemon level light limit linen
liver local logic loose lover lower loyal lucky lunar lunch lyric magic major maker
march marry match maybe mayor medal media melody menu mercy merge merit merry metal
meter metro micro might minor minty model money month moral motor mount mouse mouth
movie music naked navel needy nerve never night ninja noble noise north noted novel
nurse ocean offer often olive onion opera orbit order organ other ought ounce outer
owner paint panel paper party patch pause peace peach pearl pedal penny phase phone
photo piano piece pilot pinch pitch place plain plane plant plate plaza point polar
porch pound power press price pride prime print prior prize probe proof proud prove
public pulse punch pupil queen query quiet quite radio raise rally ranch range rapid
ratio reach react ready realm rebel refer relax relay renew repay repel reply reset
resin rhythm rider ridge rifle right rigid risky river roach robot rocky rogue roman
rough round route royal rural rusty sadly safer saint salad salon salsa sandy satin
sauce scale scalp scare scarf scene scent scoop scope score scour scout scrap scrub
seize sense serve setup seven shade shaft shake shall shape share sharp shave sheet
shelf shell shift shine shirt shock shoot shore short shout shown shred shrug sight
sigma silly since sixth skate skill skull slack slate sleep slide slope smash smell
smile smoke snack snake snare sneak snowy sober solar solid solve sorry sound south
space spare spark speak speed spell spend spice spicy spike spine spiral splash split
spoil spoon sport squad stack staff stage stain stair stake stale stamp stand stare
start state steam steel steep steer stick still stock stomp stone stood stool store
storm story stout strap straw stray strip stuck study stuff stump style sugar suite
sunny super surge sushi swear sweat sweep sweet swell swift swing swirl sword table
taken taste tasty teach teeth tempo tenor thank theft their thick thief thigh thing
think third those three threw thrown thumb tiger tight timer title toast today token
tooth topic torch total touch tough tower toxic trace track trade trail train trait
trash treat trend trial tribe trick tried tripe trout truck truer truly trunk trust
truth twist ultra uncle under unify union unity until upper upset urban usage usual
vague valid value valve vapor vault venue verse video villa vinyl viola viral virus
visit vital vivid vocal vodka voice vomit voter vouch wacky waist waste watch water
weary weave wedge weigh weird wharf wheat wheel where which while whine white whole
whose width windy witch woman world worry worse worst worth would wound woven write
wrong youth zebra zesty zonal
`;

export const WORDS = RAW.trim()
  .split(/\s+/)
  .filter((w) => w.length === 5 && /^[a-z]+$/.test(w));

/** @type {ReadonlySet<string>} */
export const WORD_SET = new Set(WORDS);
