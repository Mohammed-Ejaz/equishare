import { CATEGORIES } from '../data/mockData';

// 1. Groceries & Food (Pachakkari, Palcharaque, Grains, Dairy, Spices, Meat, Fish, Snacks in English & Manglish)
const GROCERY_FOOD_REGEX = /(kadala|parippu|payar|cherupayar|vanpayar|uzhunnu|thoor|toor|chanadal|chana|muthira|pattani|green peas|ari|pachari|puzhungalari|matta|biriyani ari|basmati|choru|kanji|atta|maida|rava|sooji|suji|puttupodi|puttu podi|appampodi|appam podi|idiyappampodi|pathiri podi|aval|poha|semiya|vermicelli|oats|cornflakes|maggi|yippee|noodles|pasta|paal|milma|milk|thairu|thayir|curd|moru|sambharam|venna|butter|neyyu|ghee|paneer|cheese|mutta|koli mutta|kozhimutta|duck egg|thara mutta|bread|rusk|bun|velichenna|coconut oil|nallenna|sunflower oil|enna|ennay|oil|manjal|manjalpodi|turmeric|mulaku|mulakupodi|piriyan|kashmiri chilli|chilli powder|malli|mallipodi|coriander|jeerakam|perumjeerakam|kaduku|uluva|kariveppila|karivepila|veppila|curry leaves|pacha mulaku|green chilli|inji|ginger|veluthulli|garlic|savala|ulli|cheriya ulli|shallots|onion|thakkali|tomato|uppu|salt|kalluppu|panchasara|sugar|chakkara|vellam|sharkkara|jaggery|kurumulaku|pepper|elakka|cardamom|karukapatta|cinnamon|grambu|cloves|kashuvandi|cashew|kismis|raisins|puli|kudampuli|valanpuli|tamarind|kayam|hing|asafoetida|theenga|thenga|coconut|chammanthi|achar|pickle|sambar podi|rasam podi|chutney|garam masala|chicken masala|meat masala|fish masala|cheera|spinach|muringakka|drumstick|vazhakka|raw banana|chena|kachil|chembu|taro|urulikizhangu|kizhangu|potato|carrot|beetroot|beans|thattapayaru|vendakka|ladies finger|okra|vazhuthananga|brinjal|eggplant|padavalanga|snake gourd|pavakka|kaypakka|bitter gourd|kumbalanga|ash gourd|mathanga|pumpkin|kovakka|ivy gourd|vellari|vellarikka|cucumber|kudamilaku|capsicum|cabbage|cauliflower|mushrooms|koon|pudina|pazham|ethakka|nendran|njali poovan|robusta|manga|mango|pacha manga|chakka|jackfruit|kaithachakka|pineapple|pera|perakka|guava|athikka|orange|apple|munthiri|grapes|thannimathan|watermelon|karamooza|papaya|mathalam|pomegranate|avocado|mosambi|chikku|meen|fish|ayala|mackerel|mathi|chaala|sardine|choora|tuna|karimeen|chemmeen|prawns|koonthal|kanava|squid|kakka|kakkairachi|clams|kozhi|chicken|koli|broiler|irachi|erachi|meat|pothu|beef|pothirachi|aadu|mutton|aattirachi|kaada|tharavu|chaaya|chaya|tea|kannan devan|kaapi|kappi|coffee|bru|nescafe|boost|horlicks|kadi|pazhampori|ethakka appam|baji|bhajji|vada|uzhunnuvada|parippuvada|samosa|chips|upperi|banana chips|sharkkara upperi|sharkkaravaratti|mixture|halwa|biscuit|pappadam|ketchup|mayo|mayonnaise|grocery|groceries|food|pantry|provisions|palcharaque|pachakkari)/i;

// 2. Dining Out, Food Orders & Street Food (Thattukada, Mess, Swiggy, Zomato)
const DINING_REGEX = /(thattukada|chayakada|hotel|restaurant|mess|biriyani|biryani|dum biriyani|manthi|mandi|kuzhimanthi|alfaham|al faham|shawarma|shavarma|porotta|parotta|parotta beef|beef fry|beef roast|chicken fry|chilli chicken|butter chicken|fried rice|meals|oonu|sadya|dosa|masala dosa|idli|poori|chappathi|chapati|naan|kulcha|broast|kfc|mcdonald|dominos|pizza|burger|shakes|sharjah shake|kulukki|sarbath|juice|falooda|ice cream|cafe|tea stall|bakery|starbucks|swiggy|zomato|takeout|delivery|food order|dinner|lunch|breakfast)/i;

// 3. Household, Cleaning & Toiletries (Veettile Sadhanangal, Cleaning, Soaps)
const HOUSEHOLD_CLEANING_REGEX = /(soap|sabon|soappodi|washing powder|surf|surf excel|aerial|tide|rin|comfort|fabric conditioner|vim|vim bar|vim liquid|pril|dishwash|scrubber|thaali|shampoo|sunsilk|head and shoulders|clinic plus|thorthu|towel|mop|chool|broom|poochool|harpic|lizol|colin|domex|bleaching powder|kuppa cover|trash cover|garbage cover|waste cover|dustbin bag|paathram kazhukan|tissue|tissues|paper towel|sanitizer|dettol|savlon|goodknight|allout|hit|mosquito coil|mosquito bat|odonil|air freshener|bulb|led bulb|tube|wiper|cleaning brush|toilet brush|floor cleaner|colgate|closeup|pepsodent|brush|toothpaste|toothbrush|shaving cream|razor|gillette|foil|aluminum foil|veettil sadhanam|veetile sadhanangal|cleaning)/i;

// 4. Utilities, WiFi & Bills (Current, Vellam, Net, Gas)
const UTILITIES_REGEX = /(current bill|current|kseb|electricity bill|vellam bill|water bill|kwa|water tanker|tanker vellam|gas cylinder|cylinder|indane|bharat gas|hp gas|cylinder refill|wifi|wifi bill|broadband|asianet|asianet broadband|jio fiber|airtel fiber|kfon|railwire|cable bill|dth|tata sky|sun direct|recharge|mobile recharge|jio recharge|airtel recharge|vi recharge|flat maintenance|society maintenance|waste collection|haritha karma sena|plastic collection|cleaning charge|utility|utilities|bill)/i;

// 5. Rent & Housing (Vaadaka, Deposit)
const RENT_REGEX = /(vaadaka|vadaka|veettu vadaka|flat vadaka|room vadaka|advance|deposit|security deposit|brokerage|broker commission|building rent|room rent|rent|housing|flat rent)/i;

// 6. Transport & Travel (Yathra, Vandi, Fuel)
const TRANSPORT_REGEX = /(petrol|diesel|fuel|vandi petrol|scooter petrol|bike petrol|car petrol|vandi service|oil change|auto|auto charge|auto kooli|auto fare|taxi|cab|uber|ola|rapido|bus ticket|ksrtc|swift|super fast|minnal|bus kooli|metro|kochi metro|train ticket|tatkal|irctc|season ticket|fastag|toll|parking|puncture|air adikkan|transport|transportation|travel)/i;

// 7. Entertainment, Trips & Turfs (Tour, Kali, Cinema)
const ENTERTAINMENT_REGEX = /(cinema|movie|theatre|pvr|inox|bookmyshow|tour|trip|wayanad trip|munnar trip|varkala|vagamon|goa trip|outing|turf|football turf|cricket turf|badminton turf|turf booking|playstation|ps5|steam|netflix|prime video|hotstar|spotify|zee5|sonyliv|entertainment|games|gaming|party|club)/i;

/**
 * Normalizes any category string or item name into a standard category ID.
 * Comprehensive support for English and Malayalam / Manglish vocabulary.
 * 
 * @param {string} category 
 * @param {string} [itemName=''] 
 * @returns {string} One of: 'groceries' | 'household' | 'utilities' | 'rent' | 'dining' | 'transport' | 'entertainment' | 'other'
 */
export function normalizeCategory(category = '', itemName = '') {
  const cat = String(category || '').trim().toLowerCase();
  const name = String(itemName || '').trim().toLowerCase();

  // 1. High-priority heuristic: If item name is clearly a grocery/food item in English or Manglish,
  // it MUST be classified as 'groceries', even if previously mislabeled.
  if (name && GROCERY_FOOD_REGEX.test(name)) {
    return 'groceries';
  }

  // 2. High-priority heuristic: If item name is clearly dining out / restaurant / cooked food order
  if (name && DINING_REGEX.test(name)) {
    return 'dining';
  }

  // 3. High-priority heuristic: If item name is household/cleaning/soap/toiletries
  if (name && HOUSEHOLD_CLEANING_REGEX.test(name)) {
    return 'household';
  }

  // 4. High-priority heuristic: If item name is utilities/bills
  if (name && UTILITIES_REGEX.test(name)) {
    return 'utilities';
  }

  // 5. High-priority heuristic: If item name is transport/travel/petrol
  if (name && TRANSPORT_REGEX.test(name)) {
    return 'transport';
  }

  // 6. High-priority heuristic: If item name is rent/vadaka
  if (name && RENT_REGEX.test(name)) {
    return 'rent';
  }

  // 7. High-priority heuristic: If item name is entertainment/tour/turf
  if (name && ENTERTAINMENT_REGEX.test(name)) {
    return 'entertainment';
  }

  // 8. Exact or keyword match on category string
  if (['groceries', 'grocery', 'food', 'kitchen', 'pantry', 'supermarket', 'provisions', 'vegetables', 'fruits', 'dairy', 'snacks', 'pachakkari', 'palcharaque'].includes(cat)) {
    return 'groceries';
  }
  if (['household', 'house', 'cleaning', 'bathroom', 'toiletries', 'supplies', 'detergent', 'sanitary', 'veettil sadhanam'].includes(cat)) {
    return 'household';
  }
  if (['dining', 'restaurant', 'drinks', 'cafe', 'swiggy', 'zomato', 'takeout', 'dinner', 'lunch', 'breakfast', 'food delivery', 'hotel', 'thattukada'].includes(cat)) {
    return 'dining';
  }
  if (['rent', 'housing', 'flat', 'apartment', 'deposit', 'room', 'vaadaka', 'vadaka'].includes(cat)) {
    return 'rent';
  }
  if (['utilities', 'utility', 'wifi', 'internet', 'electricity', 'power', 'water', 'gas', 'maintenance', 'bill', 'dth', 'kseb'].includes(cat)) {
    return 'utilities';
  }
  if (['transport', 'transportation', 'travel', 'gas', 'petrol', 'diesel', 'fuel', 'cab', 'uber', 'ola', 'auto', 'metro', 'bus', 'yathra'].includes(cat)) {
    return 'transport';
  }
  if (['entertainment', 'trips', 'movie', 'cinema', 'games', 'gaming', 'netflix', 'party', 'outing', 'vacation', 'tour', 'turf'].includes(cat)) {
    return 'entertainment';
  }

  // 9. Match category against predefined category list labels
  if (cat && !['other', 'general', 'misc', 'miscellaneous'].includes(cat)) {
    for (const c of CATEGORIES) {
      if (c.id === cat || c.label.toLowerCase().includes(cat) || cat.includes(c.id)) {
        return c.id;
      }
    }
  }

  return 'other';
}

/**
 * Returns the rich Category object from CATEGORIES for any given category string.
 */
export function getCategoryDetails(category = '', itemName = '') {
  const normId = normalizeCategory(category, itemName);
  return CATEGORIES.find((c) => c.id === normId) || CATEGORIES.find((c) => c.id === 'other') || {
    id: 'other',
    label: 'General / Other',
    color: '#94A3B8',
    bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
  };
}
