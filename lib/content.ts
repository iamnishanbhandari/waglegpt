export type Mode = "simplify" | "parody";
export type Translation = {
  mode: Mode;
  original: string;
  translation: string;
  shortExplanation: string;
  isVerifiedQuote: false;
  sourceUrl: null;
  demo: boolean;
};
export const exchangeSource = "https://www.ndtv.com/india-news/video-bring-out-dictionaries-shashi-tharoor-just-met-his-match-in-nepal-11969618";
export const budgetSource = "https://giwmscdnone.gov.np/media/pdf_upload/Budget%20Speech%202026_27%20English%20Translation_ysmw9xe.pdf";
export type WordEntry = {
  word: string; nepali: string; meaning: string; attribution: string;
  sourceUrl: string; example: string; sourceLabel: string;
  evidence: "reported" | "document"; page?: number;
};
export const vocabulary: WordEntry[] = [
  { word: "Grand larceny", nepali: "कानुनले तोकेको ठूलो मूल्यको सम्पत्ति चोरी।", meaning: "Theft above a statutory value threshold; the threshold depends on jurisdiction.", attribution: "Swarnim Wagle · introduced in the exchange", sourceUrl: exchangeSource, sourceLabel: "NDTV · 28 Aug 2026", evidence: "reported", example: "‘मेरो बिस्कुट चोरेछ!’ — त्यो चाहिँ grand larceny नहोला।" },
  { word: "Schadenfreude", nepali: "अरूको दुःखमा आफू खुसी हुनु।", meaning: "Pleasure at another person’s misfortune.", attribution: "Wagle & Shashi Tharoor · discussed together", sourceUrl: exchangeSource, sourceLabel: "NDTV · 28 Aug 2026", evidence: "reported", example: "आफ्नो होइन, साथीको Wi-Fi बिग्रिँदा हाँसो उठ्यो? त्यही हो।" },
  { word: "Defenestrate", nepali: "झ्यालबाट बाहिर फाल्नु।", meaning: "To throw someone or something out of a window.", attribution: "Shashi Tharoor · introduced, not Wagle", sourceUrl: exchangeSource, sourceLabel: "NDTV · 28 Aug 2026", evidence: "reported", example: "फोन hang भयो भन्दैमा defenestrate चाहिँ नगरौं।" },
  { word: "Epicaricacy", nepali: "अरूलाई नराम्रो हुँदा आनन्द मान्नु।", meaning: "An English word with a similar meaning to schadenfreude.", attribution: "Shashi Tharoor · introduced, not Wagle", sourceUrl: exchangeSource, sourceLabel: "NDTV · 28 Aug 2026", evidence: "reported", example: "साथीको चिया पोखियो, आफ्नो हाँसो रोकिएन। नामचाहिँ ठूलो रहेछ!" },
];
// Exact document vocabulary, NOT verified English speech quotations.
// PDF page numbers are one-based, including the cover and blank first page.
const documentWords = [
  ["August session", "सम्मानित सभा।", "‘भान्साको august session मा आज दालको निर्णय भयो।’", 3],
  ["Institutional capture", "संस्थालाई सीमित समूहको स्वार्थमा चलाउनु।", "‘रिमोट सधैं दाइको हातमा — घरको institutional capture!’", 3],
  ["Structural reforms", "व्यवस्था चल्ने तरिकामा आधारभूत सुधार।", "‘टेबल पुछेर पुग्दैन, खुट्टा नै फेर्नुपर्छ।’", 3],
  ["Virtuous cycle", "एउटा राम्रो कामले अर्को राम्रो नतिजा ल्याउने चक्र।", "‘चिया पिएँ, काम गरें, फेरि चिया कमाएँ।’", 4],
  ["Demographic dividend", "काम गर्ने उमेरको जनशक्ति धेरै हुँदा मिल्न सक्ने लाभ।", "‘घरभरि युवा छन्, अब भाँडा माझ्ने पालो मिलाऔं।’", 4],
  ["Allocative efficiency", "स्रोतलाई बढी उपयोग हुने ठाउँमा लगाउनु।", "‘अन्तिम सय रुपैयाँ: चिया कि बसभाडा?’", 6],
  ["Virement", "स्वीकृत नियमभित्र बजेट एक शीर्षकबाट अर्कोमा सार्नु।", "‘खाजाको बजेट बसभाडामा सर्‍यो।’", 8],
  ["Sunset law", "तोकिएको समय वा सर्तपछि सकिने कानुनी व्यवस्था।", "‘आजको उधारो सुविधा बेलुका नै समाप्त!’", 8],
  ["Hedging", "मूल्य वा विनिमय दर बदलिँदाको जोखिम घटाउने उपाय।", "‘पानी पर्ला भनेर झोलामा छाता राखेजस्तै।’", 9],
  ["Import substitution", "विदेशबाट ल्याउने सामानको सट्टा देशमै उत्पादन गर्नु।", "‘बाहिरको अचार होइन, आज आमाकै अचार।’", 14],
] as const;
export const documentVocabulary: WordEntry[] = documentWords.map(([word, nepali, example, page]) => ({
  word, nepali, example, page, meaning: "Vocabulary in the Ministry-hosted English budget translation.",
  attribution: "Budget presented by Dr. Swarnim Wagle · English translator unspecified",
  sourceUrl: `${budgetSource}#page=${page}`, sourceLabel: `MoF budget · PDF p. ${page}`,
  evidence: "document",
}));
export const demoExamples = {
  simplify: [
    { input: "Schadenfreude", output: "अरूको दुःखमा खुसी हुनु।" },
    { input: "Grand larceny", output: "कानुनले तोकेको ठूलो मूल्यको सम्पत्ति चोरी।" },
    { input: "We must address structural impediments to economic growth.", output: "अर्थतन्त्र बढ्न नदिने समस्याहरू हटाउनुपर्छ।" },
    { input: "The acute pecuniary predicament requires immediate remedial action.", output: "पैसा नभएको गम्भीर समस्या छ, तुरुन्तै समाधान गर्नुपर्छ।" },
    { input: "Defenestrate", output: "झ्यालबाट बाहिर फाल्नु।" },
    { input: "Epicaricacy", output: "अरूको दुःखमा खुसी हुनु।" },
  ],
  parody: [
    { input: "मसँग पैसा छैन।", output: "My current pecuniary circumstances are characterized by an acute liquidity deficit, rendering discretionary expenditure economically untenable.", variants: ["My personal treasury is experiencing a conspicuous absence of monetary resources; all prospective expenditures must therefore remain in the realm of theoretical aspiration.", "A comprehensive audit of my financial ecosystem has established, with regrettable statistical certainty, that my available pecuniary reserves are indistinguishable from zero."] },
    { input: "मलाई भोक लाग्यो।", output: "An unprecedented gastronomical exigency has emerged, necessitating immediate caloric intervention to restore my physiological equilibrium.", variants: ["My gastrointestinal apparatus has submitted an urgent requisition for nutritional resources, the postponement of which would be physiologically inadvisable.", "An acute disequilibrium between caloric supply and metabolic demand has precipitated a corporeal crisis requiring the expeditious procurement and ingestion of edible matter."] },
    { input: "मलाई चिया पिउन मन लाग्यो।", output: "I find myself experiencing a pronounced inclination toward the immediate consumption of a thermally elevated infusion of Camellia sinensis.", variants: ["My present refreshment preferences exhibit an unequivocal predisposition toward a steaming infusion of tea leaves.", "A persistent desideratum for a heated aqueous extraction of Camellia sinensis has emerged within my otherwise unremarkable afternoon consciousness."] },
    { input: "मलाई निद्रा लाग्यो।", output: "My cognitive faculties are requesting an immediate suspension of conscious operations in favour of restorative nocturnal inactivity.", variants: ["A compelling physiological propensity toward somnolence has rendered continued wakefulness increasingly unappealing.", "My neurological apparatus has formally petitioned for a temporary cessation of conscious engagement, citing an overwhelming predisposition toward restorative slumber."] },
    { input: "आज धेरै गर्मी छ।", output: "The prevailing atmospheric conditions demonstrate an exceptionally enthusiastic commitment to thermal excess.", variants: ["Today's ambient temperature has ascended to a level warranting considerable thermoregulatory concern.", "The contemporary meteorological milieu is characterized by an inordinately elevated thermal intensity, the experiential consequences of which are decidedly perspiration-inducing."] },
  ],
};
export function normalizeInput(text: string) { return text.trim().toLowerCase().replace(/[।.!?]+$/u, "").trim(); }
