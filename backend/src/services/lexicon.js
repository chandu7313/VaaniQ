// Small multilingual lexicon shared by retrieval query expansion, sentiment and NLU.
// Honest limitation: this is a keyword lexicon for the MVP, not a translation model.
// When a real LLM is configured it supplies an English retrieval query and sentiment instead.

/** Hindi/Telugu/Hinglish surface forms -> English retrieval keywords. */
export const retrievalSynonyms = {
  'sq ft size': ['big', 'size', 'square feet', 'sqft', 'carpet area', 'बड़ा', 'साइज', 'साइज़', 'సైజు', 'ఎంత పెద్ద'],
  price: ['cost', 'how much', 'rate', 'कीमत', 'दाम', 'रेट', 'ధర', 'రేటు', 'kimat', 'daam', 'dhara'],
  amenities: ['सुविधा', 'सुविधाएं', 'सुविधाएँ', 'సౌకర్యాలు', 'సదుపాయాలు', 'suvidha'],
  location: ['लोकेशन', 'स्थान', 'पता', 'లొకేషన్', 'ప్రదేశం'],
  possession: ['कब्जा', 'पजेशन', 'స్వాధీనం', 'పొజెషన్'],
  visit: ['विजिट', 'दौरा', 'देखने', 'సందర్శన', 'విజిట్'],
  loan: ['लोन', 'ऋण', 'లోన్', 'రుణం'],
  rera: ['रेरा', 'రెరా'],
  payment: ['भुगतान', 'చెల్లింపు'],
  parking: ['पार्किंग', 'పార్కింగ్'],
};

export const positiveWords = {
  en: ['great', 'good', 'nice', 'love', 'perfect', 'excellent', 'interested', 'happy', 'awesome', 'sounds good', 'thanks', 'thank you', 'amazing', 'excited', 'wonderful'],
  hi: ['अच्छा', 'बढ़िया', 'पसंद', 'धन्यवाद', 'शुक्रिया', 'बहुत अच्छा', 'खुश', 'उत्साहित', 'achha', 'badhiya', 'pasand'],
  te: ['బాగుంది', 'మంచిది', 'ఇష్టం', 'ధన్యవాదాలు', 'చాలా బాగుంది', 'సంతోషం', 'bagundi'],
};
export const negativeWords = {
  en: ['bad', 'expensive', 'too costly', 'costly', 'worst', 'angry', 'upset', 'disappointed', 'terrible', 'not happy', 'waste', 'useless', 'frustrated', 'annoyed', 'complaint', 'cheat', 'not interested', 'too high'],
  hi: ['बुरा', 'महंगा', 'नाराज़', 'गुस्सा', 'परेशान', 'बेकार', 'निराश', 'शिकायत', 'दिलचस्पी नहीं', 'mehenga', 'bekar'],
  te: ['చెడు', 'ఖరీదైన', 'ఖరీదు ఎక్కువ', 'కోపం', 'నిరాశ', 'ఫిర్యాదు', 'ఇష్టం లేదు', 'వృథా'],
};
export const negators = {
  en: ['not', "don't", 'dont', 'no', 'never', "isn't", "wasn't"],
  hi: ['नहीं', 'ना', 'nahi'],
  te: ['లేదు', 'కాదు', 'వద్దు'],
};

export const humanRequestPhrases = [
  'talk to a human', 'speak to a human', 'talk to a person', 'speak to someone', 'real person', 'human agent', 'sales executive call', 'manager', 'speak to an agent', 'talk to an agent',
  'इंसान से बात', 'किसी से बात', 'मैनेजर', 'మనిషితో మాట్లాడ', 'మేనేజర్',
];
