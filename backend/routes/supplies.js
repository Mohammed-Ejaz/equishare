import express from 'express';
import { readDB, writeDB } from '../data/store.js';
import { authenticateToken, requireGroupMember } from '../middleware/auth.js';

const router = express.Router();

const GROCERY_FOOD_REGEX = /(kadala|parippu|payar|cherupayar|vanpayar|uzhunnu|thoor|toor|chanadal|chana|muthira|pattani|green peas|ari|pachari|puzhungalari|matta|biriyani ari|basmati|choru|kanji|atta|maida|rava|sooji|suji|puttupodi|appampodi|idiyappampodi|pathiri podi|aval|poha|semiya|vermicelli|oats|maggi|yippee|noodles|pasta|paal|milma|milk|thairu|thayir|curd|moru|sambharam|venna|butter|neyyu|ghee|paneer|cheese|mutta|koli mutta|kozhimutta|duck egg|thara mutta|bread|rusk|bun|velichenna|coconut oil|nallenna|sunflower oil|enna|ennay|oil|manjal|manjalpodi|turmeric|mulaku|mulakupodi|piriyan|kashmiri chilli|chilli powder|malli|mallipodi|coriander|jeerakam|perumjeerakam|kaduku|uluva|kariveppila|karivepila|veppila|curry leaves|pacha mulaku|green chilli|inji|ginger|veluthulli|garlic|savala|ulli|cheriya ulli|shallots|onion|thakkali|tomato|uppu|salt|kalluppu|panchasara|sugar|chakkara|vellam|sharkkara|jaggery|kurumulaku|pepper|elakka|cardamom|karukapatta|cinnamon|grambu|cloves|kashuvandi|cashew|kismis|raisins|puli|kudampuli|valanpuli|tamarind|kayam|hing|asafoetida|theenga|thenga|coconut|chammanthi|achar|pickle|sambar podi|rasam podi|chutney|garam masala|chicken masala|meat masala|fish masala|cheera|spinach|muringakka|drumstick|vazhakka|raw banana|chena|kachil|chembu|taro|urulikizhangu|kizhangu|potato|carrot|beetroot|beans|thattapayaru|vendakka|ladies finger|okra|vazhuthananga|brinjal|eggplant|padavalanga|snake gourd|pavakka|kaypakka|bitter gourd|kumbalanga|ash gourd|mathanga|pumpkin|kovakka|ivy gourd|vellari|vellarikka|cucumber|kudamilaku|capsicum|cabbage|cauliflower|mushrooms|koon|pudina|pazham|ethakka|nendran|njali poovan|robusta|manga|mango|pacha manga|chakka|jackfruit|kaithachakka|pineapple|pera|perakka|guava|athikka|orange|apple|munthiri|grapes|thannimathan|watermelon|karamooza|papaya|mathalam|pomegranate|avocado|mosambi|chikku|meen|fish|ayala|mackerel|mathi|chaala|sardine|choora|tuna|karimeen|chemmeen|prawns|koonthal|kanava|squid|kakka|kakkairachi|clams|kozhi|chicken|koli|broiler|irachi|erachi|meat|pothu|beef|pothirachi|aadu|mutton|aattirachi|kaada|tharavu|chaaya|chaya|tea|kannan devan|kaapi|kappi|coffee|bru|nescafe|boost|horlicks|kadi|pazhampori|ethakka appam|baji|bhajji|vada|uzhunnuvada|parippuvada|samosa|chips|upperi|banana chips|sharkkara upperi|sharkkaravaratti|mixture|halwa|biscuit|pappadam|ketchup|mayo|mayonnaise|grocery|groceries|food|pantry|provisions|palcharaque|pachakkari)/i;
const HOUSEHOLD_CLEANING_REGEX = /(soap|sabon|soappodi|washing powder|surf|surf excel|aerial|tide|rin|comfort|fabric conditioner|vim|vim bar|vim liquid|pril|dishwash|scrubber|thaali|shampoo|sunsilk|head and shoulders|clinic plus|thorthu|towel|mop|chool|broom|poochool|harpic|lizol|colin|domex|bleaching powder|kuppa cover|trash cover|garbage cover|waste cover|dustbin bag|paathram kazhukan|tissue|tissues|paper towel|sanitizer|dettol|savlon|goodknight|allout|hit|mosquito coil|mosquito bat|odonil|air freshener|bulb|led bulb|tube|wiper|cleaning brush|toilet brush|floor cleaner|colgate|closeup|pepsodent|brush|toothpaste|toothbrush|shaving cream|razor|gillette|foil|aluminum foil|veettil sadhanam|veetile sadhanangal|cleaning)/i;

function normalizeCategory(category, itemName = '') {
  const cat = String(category || '').trim().toLowerCase();
  const name = String(itemName || '').trim().toLowerCase();

  if (name && GROCERY_FOOD_REGEX.test(name)) return 'groceries';
  if (name && HOUSEHOLD_CLEANING_REGEX.test(name)) return 'household';
  if (['groceries', 'grocery', 'food', 'kitchen', 'pantry', 'supermarket', 'provisions', 'vegetables', 'fruits', 'dairy', 'snacks', 'pachakkari', 'palcharaque'].includes(cat)) return 'groceries';
  if (['household', 'house', 'cleaning', 'bathroom', 'toiletries', 'supplies', 'detergent', 'sanitary', 'veettil sadhanam'].includes(cat)) return 'household';
  if (['dining', 'restaurant', 'drinks', 'cafe', 'swiggy', 'zomato', 'takeout', 'dinner', 'lunch', 'hotel', 'thattukada'].includes(cat)) return 'dining';
  if (['rent', 'housing', 'flat', 'apartment', 'deposit', 'vaadaka', 'vadaka'].includes(cat)) return 'rent';
  if (['utilities', 'utility', 'wifi', 'internet', 'electricity', 'power', 'water', 'gas', 'maintenance', 'bill', 'kseb'].includes(cat)) return 'utilities';
  if (['transport', 'transportation', 'travel', 'gas', 'petrol', 'diesel', 'fuel', 'cab', 'uber', 'ola', 'auto'].includes(cat)) return 'transport';
  if (['entertainment', 'trips', 'movie', 'cinema', 'games', 'gaming', 'netflix', 'party', 'tour', 'turf'].includes(cat)) return 'entertainment';
  return 'other';
}

// GET /api/supplies?groupId=xxx (IDOR protected)
router.get('/', authenticateToken, requireGroupMember, (req, res) => {
  const group = req.group;
  res.json({ supplies: group.supplies || [] });
});

// POST /api/supplies (IDOR protected)
router.post('/', authenticateToken, requireGroupMember, (req, res) => {
  const { name, category, estimatedPrice } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Valid item name is required.' });
  }

  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const price = Math.max(0, Number(estimatedPrice) || 0);

  const newSupply = {
    id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    category: typeof category === 'string' && category.trim() ? category.trim() : 'Groceries',
    estimatedPrice: Math.round(price * 100) / 100,
    addedBy: req.user.id,
    addedByName: req.user.name,
    status: 'needed',
    createdAt: new Date().toISOString()
  };

  if (!db.groups[groupIndex].supplies) {
    db.groups[groupIndex].supplies = [];
  }
  db.groups[groupIndex].supplies.unshift(newSupply);
  
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to save supply item.' });
  }

  res.status(201).json({ supply: newSupply, group: db.groups[groupIndex] });
});

// PATCH /api/supplies/:id/status (IDOR protected)
router.patch('/:id/status', authenticateToken, requireGroupMember, (req, res) => {
  const { status } = req.body;
  if (!status || !['needed', 'purchased'].includes(status)) {
    return res.status(400).json({ error: "Status must be either 'needed' or 'purchased'." });
  }

  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const targetGroup = db.groups[groupIndex];
  const supply = (targetGroup.supplies || []).find((s) => s.id === req.params.id);
  if (!supply) {
    return res.status(404).json({ error: 'Supply item not found.' });
  }

  const supplyId = req.params.id;
  const expenseId = `exp-supply-${supplyId}`;
  supply.status = status;

  if (status === 'needed') {
    // Remove linked restocked expense
    targetGroup.expenses = (targetGroup.expenses || []).filter(
      (e) => e.supplyId !== supplyId && e.id !== expenseId && e.id !== supply.expenseId
    );
    supply.expenseId = null;
  } else if (status === 'purchased') {
    // Add restocked expense if amount > 0 and active members exist
    const amount = Number(supply.estimatedPrice) || 0;
    const activeMembers = (targetGroup.members || []).filter((m) => !m.isInactive);

    if (amount > 0 && activeMembers.length > 0) {
      const n = activeMembers.length;
      const totalPaise = Math.round(amount * 100);
      const baseShare = Math.floor(totalPaise / n);
      let remainder = totalPaise % n;

      const splits = {};
      activeMembers.forEach((m) => {
        let memberPaise = baseShare;
        if (remainder > 0) {
          memberPaise += 1;
          remainder -= 1;
        }
        splits[m.id] = memberPaise / 100;
      });

      const newExpense = {
        id: expenseId,
        supplyId: supplyId,
        title: `${supply.name} (Restocked)`,
        amount,
        category: normalizeCategory(supply.category, supply.name),
        paidBy: req.user.id,
        date: new Date().toISOString().split('T')[0],
        splitType: 'equal',
        participants: activeMembers.map((m) => m.id),
        splits,
        notes: `Communal item restocked by ${req.user.name}`
      };

      targetGroup.expenses = [
        newExpense,
        ...(targetGroup.expenses || []).filter(
          (e) => e.supplyId !== supplyId && e.id !== expenseId && e.id !== supply.expenseId
        )
      ];
      supply.expenseId = expenseId;
    }
  }

  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to update supply status.' });
  }

  res.json({ supply, group: targetGroup });
});

// DELETE /api/supplies/:id?groupId=xxx (IDOR protected)
router.delete('/:id', authenticateToken, requireGroupMember, (req, res) => {
  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);

  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const targetGroup = db.groups[groupIndex];
  const supplyId = req.params.id;
  const supplyItem = (targetGroup.supplies || []).find((s) => s.id === supplyId);

  targetGroup.supplies = (targetGroup.supplies || []).filter((s) => s.id !== supplyId);
  
  // Clean up linked restocked expense only if it was a direct un-settled supply placeholder
  targetGroup.expenses = (targetGroup.expenses || []).filter(
    (e) => e.supplyId !== supplyId && e.id !== `exp-supply-${supplyId}` && e.id !== supplyItem?.expenseId
  );

  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to delete supply item.' });
  }

  res.json({ message: 'Supply item deleted successfully', group: targetGroup });
});

export default router;
