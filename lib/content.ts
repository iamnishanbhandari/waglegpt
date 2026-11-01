export type WordEntry = {
  word: string;
  meaning: string;
  nepali: string;
  attribution: string;
  sourceUrl: string | null;
  example: string;
};

export const vocabulary: WordEntry[] = [
  {
    word: "Grand larceny",
    meaning: "A serious theft of property above a legally defined value threshold.",
    nepali: "कानुनले तोकेको ठूलो मूल्यको सम्पत्ति चोरी",
    attribution: "Discussed by Swarnim Wagle in the NDTV vocabulary exchange.",
    sourceUrl: "https://www.ndtv.com/india-news/video-bring-out-dictionaries-shashi-tharoor-just-met-his-match-in-nepal-11969618",
    example: "मसँगको मोटरसाइकल गएछ—यस्तो हो भने grand larceny होलान्।",
  },
  {
    word: "Schadenfreude",
    meaning: "Pleasure experienced at another person's misfortune.",
    nepali: "अरूलाई नराम्रो हुँदा आफैं खुसी हुनु",
    attribution: "Discussed by Swarnim Wagle and Shashi Tharoor in the exchange.",
    sourceUrl: "https://www.ndtv.com/india-news/video-bring-out-dictionaries-shashi-tharoor-just-met-his-match-in-nepal-11969618",
    example: "हजुरको हिसाब मिलेको साथीको exam फेल हुँदा smile आएछ भने—शब्दको नाम छ।",
  },
  {
    word: "Defenestrate",
    meaning: "To throw someone or something out of a window.",
    nepali: "झ्यालबाट बाहिर फाल्नु",
    attribution: "Introduced by Shashi Tharoor, not by Swarnim Wagle.",
    sourceUrl: "https://www.ndtv.com/india-news/video-bring-out-dictionaries-shashi-tharoor-just-met-his-match-in-nepal-11969618",
    example: "झगडा पनि sophisticated बनाउने शब्द—ध्यान राख्नुहोस्, literal पनि हुन्छ।",
  },
  {
    word: "Epicaricacy",
    meaning: "Pleasure at someone else's misfortune; equivalent in sense to schadenfreude.",
    nepali: "अरूको दुःखमा खुसी हुनु",
    attribution: "Introduced by Shashi Tharoor, not by Swarnim Wagle.",
    sourceUrl: "https://www.ndtv.com/india-news/video-bring-out-dictionaries-shashi-tharoor-just-met-his-match-in-nepal-11969618",
    example: "तिमीलाई जान्नैपर्नोस् भनेर ल्याइएको शब्द, वाग्लेको coinage होइन।",
  },
];

export const demoExamples = {
  simplify: [
    {
      input: "We must address structural impediments to economic growth.",
      output: "अर्थतन्त्र बढ्न नदिने समस्याहरू हटाउनुपर्छ।",
    },
    {
      input: "The acute pecuniary predicament requires immediate remedial action.",
      output: "पैसा नभएको गम्भीर समस्या छ, तुरुन्तै समाधान गर्नुपर्छ।",
    },
  ],
  parody: [
    {
      input: "मसँग पैसा छैन।",
      output: "My current pecuniary circumstances are characterized by an acute liquidity deficit, rendering discretionary expenditure economically untenable.",
    },
    {
      input: "मलाई भोक लाग्यो।",
      output: "An unprecedented gastronomical exigency has emerged, necessitating immediate caloric intervention to restore my physiological equilibrium.",
    },
  ],
};
