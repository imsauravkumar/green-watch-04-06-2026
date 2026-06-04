import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const parseBase64Image = (dataUrl) => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
};

const extractJson = (str) => {
  let cleaned = str.trim();
  // Remove markdown code block markers if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  
  // Locate JSON object bounds to strip out any trailing/leading prose
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  return cleaned;
};

const callGemini = async (systemInstruction, promptText, base64Image) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set on the server.");
  }

  const parsed = parseBase64Image(base64Image);
  if (!parsed) {
    throw new Error("Invalid base64 image format");
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data
            }
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("No response text returned from Gemini API");
  }

  const cleanedJson = extractJson(textResponse);
  return JSON.parse(cleanedJson);
};

// Fallback Mock Reports for Crop Health
const mockCropReports = [
  {
    disease: "Tomato Early Blight (Alternaria solani)",
    severity: "Moderate (45%)",
    symptoms: "Dark, concentric spots (target-like) on older leaves. Surrounding tissue yellowing followed by leaf defoliation.",
    organic: "Apply copper-based organic fungicide sprays. Remove infected lower leaves immediately to prevent spore splash. Avoid overhead watering.",
    chemical: "Spray Chlorothalonil or Mancozeb-containing fungicides every 7-10 days until spread ceases."
  },
  {
    disease: "Potato Late Blight (Phytophthora infestans)",
    severity: "High (80%) - Urgent action needed",
    symptoms: "Water-soaked dark lesions on leaf tips. White fuzzy growth on leaf undersides in humid conditions. Stems turning black.",
    organic: "Remove and destroy all infected foliage. Spray copper carbonate or baking soda solutions. Ensure wide spacing for dry air circulation.",
    chemical: "Apply systemic fungicides containing Metalaxyl or Ridomil Gold to prevent tuber contamination."
  },
  {
    disease: "Powdery Mildew (Podosphaera pannosa)",
    severity: "Low (20%)",
    symptoms: "White, powdery flour-like fungal coatings covering leaf surfaces. Leaves curling upwards.",
    organic: "Spray a mixture of 1 tbsp baking soda + 1 tsp liquid soap in 4L water. Increase sun exposure. Spray neem oil solution.",
    chemical: "Apply sulphur or Myclobutanil-based systemic mildewcide sprays."
  },
  {
    disease: "Healthy Leaf - No Pathogens Detected",
    severity: "None (0%)",
    symptoms: "Foliage exhibits rich chlorophyll levels. Stomatal cells and veins show uniform structures.",
    organic: "Maintain regular nitrogen-rich compost dressings. Keep mulch moisture levels checked.",
    chemical: "No chemical fungicides or interventions needed."
  }
];

const mockCropReportsHi = [
  {
    disease: "टमाटर का अगेती झुलसा रोग (Alternaria solani)",
    severity: "मध्यम (45%)",
    symptoms: "पुरानी पत्तियों पर काले, संकेंद्रीय धब्बे (लक्ष्य जैसे)। आसपास के पत्तों का पीला होना और फिर पत्तियां गिरना।",
    organic: "तांबे आधारित जैविक कवकनाशी स्प्रे का प्रयोग करें। बीजाणु फैलने से रोकने के लिए संक्रमित निचली पत्तियों को तुरंत हटा दें। ऊपर से पानी देने से बचें।",
    chemical: "फैलाव रुकने तक हर 7-10 दिनों में क्लोरोथालोनिल या मैनकोज़ेब युक्त कवकनाशी का छिड़काव करें।"
  },
  {
    disease: "आलू का पछेती झुलसा रोग (Phytophthora infestans)",
    severity: "उच्च (80%) - तत्काल कार्रवाई की आवश्यकता",
    symptoms: "पत्ती के सिरों पर पानी से लथपथ गहरे रंग के धब्बे। नम परिस्थितियों में पत्ती के निचले हिस्से पर सफेद रोएंदार फफूंद। तने काले पड़ना।",
    organic: "सभी संक्रमित पत्तियों को हटाकर नष्ट कर दें। कॉपर कार्बोनेट या बेकिंग सोडा के घोल का छिड़काव करें। शुष्क हवा के संचार के लिए पर्याप्त दूरी सुनिश्चित करें।",
    chemical: "कंद संदूषण को रोकने के लिए मेटालैक्सिल या रिडोमिल गोल्ड युक्त प्रणालीगत कवकनाशी का प्रयोग करें।"
  },
  {
    disease: "चूर्णी फफूंद (Podosphaera pannosa)",
    severity: "कम (20%)",
    symptoms: "पत्तियों की सतह पर सफेद, आटे जैसी फफूंद की परत चढ़ना। पत्तियां ऊपर की ओर मुड़ना।",
    organic: "4 लीटर पानी में 1 बड़ा चम्मच बेकिंग सोडा + 1 छोटा चम्मच लिक्विड सोप का मिश्रण स्प्रे करें। धूप का प्रदर्शन बढ़ाएं। नीम के तेल के घोल का छिड़काव करें।",
    chemical: "सल्फर या मायक्लोबुटानिल आधारित प्रणालीगत कवकनाशी का छिड़काव करें।"
  },
  {
    disease: "स्वस्थ पत्ता - कोई रोगज़नक़ नहीं पाया गया",
    severity: "कोई नहीं (0%)",
    symptoms: "पत्तियों में प्रचुर मात्रा में क्लोरोफिल है। रंध्र कोशिकाएं और शिराएं समान संरचनाएं दिखाती हैं।",
    organic: "नियमित नाइट्रोजन युक्त खाद का प्रयोग जारी रखें। मल्च की नमी का स्तर जांचें।",
    chemical: "किसी रासायनिक कवकनाशी या हस्तक्षेप की आवश्यकता नहीं है।"
  }
];

const mockCropReportsPb = [
  {
    disease: "ਟਮਾਟਰ ਦਾ ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ (Alternaria solani)",
    severity: "ਦਰਮਿਆਨਾ (45%)",
    symptoms: "ਪੁਰਾਣੇ ਪੱਤਿਆਂ 'ਤੇ ਕਾਲੇ, ਕੇਂਦਰਿਤ ਧੱਬੇ। ਆਲੇ-ਦੁਆਲੇ ਦੇ ਪੱਤਿਆਂ ਦਾ ਪੀਲਾ ਹੋਣਾ ਅਤੇ ਫਿਰ ਪੱਤੇ ਡਿੱਗਣਾ।",
    organic: "ਤਾਂਬੇ ਅਧਾਰਤ ਜੈਵਿਕ ਉੱਲੀਨਾਸ਼ਕ ਸਪਰੇਅ ਦੀ ਵਰਤੋਂ ਕਰੋ। ਬੀਜਾਣੂ ਫੈਲਣ ਤੋਂ ਰੋਕਣ ਲਈ ਸੰਕਰਮਿਤ ਹੇਠਲੇ ਪੱਤਿਆਂ ਨੂੰ ਤੁਰੰਤ ਹਟਾਓ।",
    chemical: "ਫੈਲਾਅ ਰੁਕਣ ਤੱਕ ਹਰ 7-10 ਦਿਨਾਂ ਵਿੱਚ ਕਲੋਰੋਥਾਲੋਨਿਲ ਜਾਂ ਮੈਨਕੋਜ਼ੇਬ ਵਾਲੇ ਉੱਲੀਨਾਸ਼ਕ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
  },
  {
    disease: "ਆਲੂ ਦਾ ਪਿਛੇਤਾ ਝੁਲਸ ਰੋਗ (Phytophthora infestans)",
    severity: "ਉੱਚ (80%) - ਤੁਰੰਤ ਕਾਰਵਾਈ ਦੀ ਲੋੜ",
    symptoms: "ਪੱਤੇ ਦੇ ਸਿਰਿਆਂ 'ਤੇ ਪਾਣੀ ਨਾਲ ਭਰੇ ਗੂੜ੍ਹੇ ਧੱਬੇ। ਨਮ ਹਾਲਤਾਂ ਵਿੱਚ ਪੱਤੇ ਦੇ ਹੇਠਲੇ ਪਾਸੇ ਚਿੱਟੀ ਉੱਲੀ। ਟਹਿਣੀਆਂ ਦਾ ਕਾਲਾ ਹੋਣਾ।",
    organic: "ਸਾਰੇ ਸੰਕਰਮਿਤ ਪੱਤਿਆਂ ਨੂੰ ਹਟਾ ਕੇ ਨਸ਼ਟ ਕਰੋ। ਕਾਪਰ ਕਾਰਬੋਨੇਟ ਜਾਂ ਬੇਕਿੰਗ ਸੋਡਾ ਘੋਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।",
    chemical: "ਮੈਟਾਲੈਕਸਿਲ ਜਾਂ ਰਿਡੋਮਿਲ ਗੋਲਡ ਵਾਲੇ ਸਿਸਟਮਿਕ ਉੱਲੀਨਾਸ਼ਕ ਦੀ ਵਰਤੋਂ ਕਰੋ।"
  },
  {
    disease: "ਚਿੱਟਾ ਰੋਗ (Podosphaera pannosa)",
    severity: "ਘੱਟ (20%)",
    symptoms: "ਪੱਤਿਆਂ ਦੀ ਸਤ੍ਹਾ 'ਤੇ ਚਿੱਟੀ, ਆਟੇ ਵਰਗੀ ਉੱਲੀ ਦੀ ਪਰਤ। ਪੱਤਿਆਂ ਦਾ ਉੱਪਰ ਵੱਲ ਮੁੜਨਾ।",
    organic: "4 ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ 1 ਚੱਮਚ ਬੇਕਿੰਗ ਸੋਡਾ + 1 ਚੱਮਚ ਤਰਲ ਸਾਬਣ ਦਾ ਮਿਸ਼ਰਣ ਸਪਰੇਅ ਕਰੋ। ਨਿੰਮ ਦੇ ਤੇਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।",
    chemical: "ਸਲਫਰ ਜਾਂ ਮਾਈਕਲੋਬੂਟਾਨਿਲ ਅਧਾਰਤ ਸਿਸਟਮਿਕ ਉੱਲੀਨਾਸ਼ਕ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
  },
  {
    disease: "ਸਿਹਤਮੰਦ ਪੱਤਾ - ਕੋਈ ਰੋਗਾਣੂ ਨਹੀਂ ਮਿਲਿਆ",
    severity: "ਕੋਈ ਨਹੀਂ (0%)",
    symptoms: "ਪੱਤਿਆਂ ਵਿੱਚ ਭਰਪੂਰ ਮਾਤਰਾ ਵਿੱਚ ਕਲੋਰੋਫਿਲ ਹੈ। ਪੱਤੇ ਤੰਦਰੁਸਤ ਹਨ।",
    organic: "ਨਿਯਮਤ ਨਾਈਟ੍ਰੋਜਨ ਯੁਕਤ ਖਾਦ ਦੀ ਵਰਤੋਂ ਜਾਰੀ ਰੱਖੋ।",
    chemical: "ਕਿਸੇ ਰਸਾਇਣਕ ਉੱਲੀਨਾਸ਼ਕ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।"
  }
];

// Fallback Mock Reports for Pest Control
const mockPestReports = [
  {
    name: "Fall Armyworm (Spodoptera frugiperda)",
    crop: "Corn / Maize",
    impact: "Chews large ragged holes in leaves. Can completely defoliate whorls and burrow into corn ears, destroying yield potential.",
    organic: "Release Trichogramma wasps (egg parasites). Spray Neem seed kernel extract (NSKE 5%) or Bacillus thuringiensis (Bt) formulations.",
    chemical: "Apply Spinetoram 11.7% SC or Emamectin benzoate 5% SG at whorl stage."
  },
  {
    name: "Aphids (Aphis gossypii)",
    crop: "Cotton / Vegetables",
    impact: "Suck sap from leaves, causing curling and stunting. Excrete honey-dew leading to sooty mold. Transmit viral diseases.",
    organic: "Introduce ladybug beetles or hoverfly larvae. Spray strong water jets or insecticidal potassium soaps. Apply neem oil.",
    chemical: "Spray Imidacloprid 17.8% SL or Acetamiprid 20% SP under leaf surfaces."
  },
  {
    name: "Rice Stem Borer (Scirpophaga incertulas)",
    crop: "Rice",
    impact: "Larvae bore into stem center, causing 'dead hearts' in vegetative stage and 'white heads' (empty panicles) in reproductive stage.",
    organic: "Install pheromone traps (5-8 traps/acre) to monitor moths. Encourage predatory spiders. Keep field water levels balanced.",
    chemical: "Broadcast Cartap hydrochloride 4G or Fipronil 0.3G granules in standing water."
  },
  {
    name: "Brown Plant Hopper (Nilaparvata lugens)",
    crop: "Rice",
    impact: "Sucks plant sap, causing leaves to turn yellow and dry. Produces 'hopper burn' patches where crops completely collapse.",
    organic: "Avoid high nitrogen fertilization. Drain water from fields for 3-4 days. Conserve mirid bugs (natural predators).",
    chemical: "Apply Pymetrozine 50% WG or Dinotefuran 20% SG near plant bases."
  }
];

const mockPestReportsHi = [
  {
    name: "फॉल आर्मीवॉर्म (Spodoptera frugiperda)",
    crop: "मक्का",
    impact: "पत्तियों में बड़े टेढ़े-मेढ़े छेद करता है। पूरी फसल को नष्ट कर सकता है और भुट्टों में छेद कर पैदावार को ख़त्म कर देता है।",
    organic: "ट्राइकोग्राममा ततैया (अंडे के परजीवी) छोड़ें। नीम के बीज के अर्क (NSKE 5%) या बैसिलस थुरिंगिएंसिस (Bt) का छिड़काव करें।",
    chemical: "मक्के के पत्तों के चक्र चरण पर स्पिनटोरम 11.7% SC या एमामेक्टिन बेंजोएट 5% SG लगाएं।"
  },
  {
    name: "माहू / एफिड्स (Aphis gossypii)",
    crop: "कपास / सब्जियां",
    impact: "पत्तियों से रस चूसते हैं, जिससे पत्तियां मुड़ जाती हैं और विकास रुक जाता है। चिपचिपा पदार्थ छोड़ते हैं जिससे काली फफूंद लगती है।",
    organic: "लेडीबग बीटल या होवरफ्लाई लार्वा छोड़ें। पानी की तेज धार या कीटनाशक पोटेशियम साबुन का छिड़काव करें। नीम का तेल लगाएं।",
    chemical: "पत्तियों की निचली सतह पर इमिडाक्लोप्रिड 17.8% SL या एसिटामिप्रिड 20% SP का छिड़काव करें।"
  },
  {
    name: "धान का तना छेदक (Scirpophaga incertulas)",
    crop: "धान / चावल",
    impact: "लार्वा तने के केंद्र में छेद करता है, जिससे वानस्पतिक अवस्था में 'डेड हार्ट' और प्रजनन अवस्था में 'व्हाइट हेड' (खाली बालियां) बनते हैं।",
    organic: "पतंगों की निगरानी के लिए फेरोमोन जाल (5-8 जाल/एकड़) लगाएं। शिकारी मकड़ियों को बढ़ावा दें।",
    chemical: "खड़े पानी में कारटाप हाइड्रोक्लोराइड 4G या फिप्रोनिल 0.3G दानेदार का छिड़काव करें।"
  },
  {
    name: "भूरा पौध फुदका / ब्राउन प्लांट हॉपर (Nilaparvata lugens)",
    crop: "धान / चावल",
    impact: "पौधे का रस चूसता है, जिससे पत्तियां पीली और सूखी हो जाती हैं। 'हॉपर बर्न' का निर्माण करता है जहां फसलें पूरी तरह से ढह जाती हैं।",
    organic: "अधिक नाइट्रोजन उर्वरक से बचें। खेत से 3-4 दिनों के लिए पानी निकाल दें। मिरिड बग (प्राकृतिक शिकारी) को बचाएं।",
    chemical: "पौधे के आधार के पास पाइमेट्रोज़िन 50% WG या डिनोटेफुरन 20% SG लगाएं।"
  }
];

const mockPestReportsPb = [
  {
    name: "ਫਾਲ ਆਰਮੀਵਰਮ (Spodoptera frugiperda)",
    crop: "ਮੱਕੀ",
    impact: "ਪੱਤਿਆਂ ਵਿੱਚ ਵੱਡੇ ਟੇਢੇ-ਮੇਢੇ ਛੇਕ ਕਰਦਾ ਹੈ। ਪੂਰੀ ਫਸਲ ਨੂੰ ਨਸ਼ਟ ਕਰ ਸਕਦਾ ਹੈ ਅਤੇ ਝਾੜ ਨੂੰ ਖ਼ਤਮ ਕਰ ਦਿੰਦਾ ਹੈ।",
    organic: "ਟ੍ਰਾਈਕੋਗ੍ਰਾਮਾ ਭਿੰਡੀਆਂ ਛੱਡੋ। ਨਿੰਮ ਦੇ ਬੀਜ ਦੇ ਅਰਕ (NSKE 5%) ਜਾਂ ਬੈਸੀਲਸ ਥੁਰਿੰਗੀਐਂਸਿਸ (Bt) ਦਾ ਛਿੜਕਾਅ ਕਰੋ।",
    chemical: "ਸਪਿਨਟੋਰਮ 11.7% SC ਜਾਂ ਐਮਾਮੈਕਟਿਨ ਬੈਂਜੋਏਟ 5% SG ਦੀ ਵਰਤੋਂ ਕਰੋ।"
  },
  {
    name: "ਚੇਪਾ / ਐਫਿਡਜ਼ (Aphis gossypii)",
    crop: "ਨਰਮਾ / ਸਬਜ਼ੀਆਂ",
    impact: "ਪੱਤਿਆਂ ਤੋਂ ਰਸ ਚੂਸਦੇ ਹਨ, ਜਿਸ ਨਾਲ ਪੱਤੇ ਸੁੰਗੜ ਜਾਂਦੇ ਹਨ। ਚਿਪਚਿਪਾ ਪਦਾਰਥ ਛੱਡਦੇ ਹਨ ਜਿਸ ਨਾਲ ਕਾਲੀ ਉੱਲੀ ਲੱਗਦੀ ਹੈ।",
    organic: "ਲੇਡੀਬੀਟਲ ਛੱਡੋ। ਤੇਜ਼ ਪਾਣੀ ਦੀਆਂ ਧਾਰਾਂ ਜਾਂ ਕੀਟਨਾਸ਼ਕ ਪੋਟਾਸ਼ੀਅਮ ਸਾਬਣ ਦੀ ਵਰਤੋਂ ਕਰੋ। ਨਿੰਮ ਦਾ ਤੇਲ ਲਗਾਓ।",
    chemical: "ਪੱਤਿਆਂ ਦੇ ਹੇਠਲੇ ਹਿੱਸੇ 'ਤੇ ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ 17.8% SL ਜਾਂ ਐਸੀਟਾਮੀਪ੍ਰਿਡ 20% SP ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
  },
  {
    name: "ਝੋਨੇ ਦਾ ਤਣਾ ਛੇਦਕ (Scirpophaga incertulas)",
    crop: "ਝੋਨਾ / ਚਾਵਲ",
    impact: "ਸੁੰਡੀ ਤਣੇ ਦੇ ਅੰਦਰ ਵੜ ਕੇ ਨੁਕਸਾਨ ਕਰਦੀ ਹੈ, ਜਿਸ ਨਾਲ ਫਸਲ ਸੁੱਕ ਜਾਂਦੀ ਹੈ ਅਤੇ ਖਾਲੀ ਮੁੰਜਰਾਂ ਬਣਦੀਆਂ ਹਨ।",
    organic: "ਫੇਰੋਮੋਨ ਟਰੈਪ ਲਗਾਓ। ਸ਼ਿਕਾਰੀ ਮੱਕੜੀਆਂ ਦੀ ਮਦਦ ਲਓ।",
    chemical: "ਕਾਰਟਾਪ ਹਾਈਡ੍ਰੋਕਲੋਰਾਈਡ 4G ਜਾਂ ਫਿਪਰੋਨਿਲ 0.3G ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
  },
  {
    name: "ਭੂਰਾ ਟਿੱਡਾ (Nilaparvata lugens)",
    crop: "ਝੋਨਾ / ਚਾਵਲ",
    impact: "ਪੌਦੇ ਦਾ ਰਸ ਚੂਸਦਾ ਹੈ, ਜਿਸ ਨਾਲ ਪੱਤੇ ਪੀਲੇ ਅਤੇ ਸੁੱਕੇ ਹੋ ਜਾਂਦੇ ਹਨ। ਫਸਲ ਪੂਰੀ ਤਰ੍ਹਾਂ ਡਿੱਗ ਜਾਂਦੀ ਹੈ।",
    organic: "ਵੱਧ ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਤੋਂ ਬਚੋ। ਖੇਤ ਵਿੱਚੋਂ 3-4 ਦਿਨਾਂ ਲਈ ਪਾਣੀ ਕੱਢ ਦਿਓ।",
    chemical: "ਪਾਈਮੇਟ੍ਰੋਜ਼ਿਨ 50% WG ਜਾਂ ਡਾਇਨੋਟੇਫੁਰਾਨ 20% SG ਦੀ ਵਰਤੋਂ ਕਰੋ।"
  }
];

// @desc    Diagnose crop leaf health
// @route   POST /api/analysis/diagnose
// @access  Private
router.post('/diagnose', protect, async (req, res) => {
  const { image, locale } = req.body;
  if (!image) {
    return res.status(400).json({ message: "Please provide a leaf image for diagnosis" });
  }

  try {
    console.log(`[diagnose] Request received. Locale: "${locale}"`);
    if (process.env.GEMINI_API_KEY) {
      let targetLanguage = "English";
      if (locale === 'hi') {
        targetLanguage = "Hindi (using the Devanagari script)";
      } else if (locale === 'pb') {
        targetLanguage = "Punjabi (using the Gurmukhi script)";
      }

      const systemInstruction = `You are a professional agricultural scientist and plant pathologist.
Analyze the provided image of a crop leaf.
Determine:
1. The disease or condition name (with scientific name in parentheses). If healthy, return "Healthy Leaf - No Pathogens Detected" (translated to ${targetLanguage}).
2. Severity percentage and text description (e.g. "Low (20%)", "Moderate (45%)", "High (80%) - Urgent action needed" - translate the text part to ${targetLanguage}).
3. Observed symptoms described clearly in 2-3 sentences.
4. Organic/biological treatment recommendations in 2-3 sentences.
5. Chemical treatment recommendations in 2-3 sentences.

You must return a JSON object with this exact structure and key names (lowercase):
{
  "disease": "string",
  "severity": "string",
  "symptoms": "string",
  "organic": "string",
  "chemical": "string"
}
CRITICAL REQUIRED LANGUAGE RULE:
- The JSON keys ("disease", "severity", "symptoms", "organic", "chemical") MUST remain in English and lowercase.
- All JSON object values (the text for disease, severity, symptoms, organic, chemical) MUST be written entirely and exclusively in the ${targetLanguage} language.
Do not return any markdown formatting, backticks, or comments outside of the JSON object.`;

      const promptText = `Analyze this crop leaf and identify any symptoms of disease, blight, deficiency, or pest damage. Provide treatment options. The JSON response values must be written entirely in ${targetLanguage}.`;

      const diagnosis = await callGemini(systemInstruction, promptText, image);
      return res.json(diagnosis);
    } else {
      // Mock Fallback
      console.log(`No GEMINI_API_KEY found, falling back to mock diagnosis (locale: ${locale})`);
      setTimeout(() => {
        let reports = mockCropReports;
        if (locale === 'hi') {
          reports = mockCropReportsHi;
        } else if (locale === 'pb') {
          reports = mockCropReportsPb;
        }
        const randomReport = reports[Math.floor(Math.random() * reports.length)];
        return res.json(randomReport);
      }, 1500);
    }
  } catch (error) {
    console.error("Gemini Diagnosis Error:", error);
    res.status(500).json({ message: "AI Diagnosis failed: " + error.message });
  }
});

// @desc    Identify crop pests and suggest controls
// @route   POST /api/analysis/pest-detect
// @access  Private
router.post('/pest-detect', protect, async (req, res) => {
  const { image, locale } = req.body;
  if (!image) {
    return res.status(400).json({ message: "Please provide a pest image for detection" });
  }

  try {
    console.log(`[pest-detect] Request received. Locale: "${locale}"`);
    if (process.env.GEMINI_API_KEY) {
      let targetLanguage = "English";
      if (locale === 'hi') {
        targetLanguage = "Hindi (using the Devanagari script)";
      } else if (locale === 'pb') {
        targetLanguage = "Punjabi (using the Gurmukhi script)";
      }

      const systemInstruction = `You are a professional agricultural entomologist and pest control expert.
Analyze the provided image of a crop pest, insect, worm, bug, or plant damage caused by pests.
Determine:
1. The pest name (with scientific name in parentheses). If no pest or pest damage is found, name the visible object.
2. The primary affected crop or crops (translated to ${targetLanguage}).
3. Detailed crop impact of this pest in 2-3 sentences.
4. Organic/biological control measures in 2-3 sentences.
5. Chemical control measures in 2-3 sentences.

You must return a JSON object with this exact structure and key names (lowercase):
{
  "name": "string",
  "crop": "string",
  "impact": "string",
  "organic": "string",
  "chemical": "string"
}
CRITICAL REQUIRED LANGUAGE RULE:
- The JSON keys ("name", "crop", "impact", "organic", "chemical") MUST remain in English and lowercase.
- All JSON object values (the text for name, crop, impact, organic, chemical) MUST be written entirely and exclusively in the ${targetLanguage} language.
Do not return any markdown formatting, backticks, or comments outside of the JSON object.`;

      const promptText = `Identify the pest or pest damage shown in this image, specify the crop, describe its impact, and list controls. The JSON response values must be written entirely in ${targetLanguage}.`;

      const detection = await callGemini(systemInstruction, promptText, image);
      return res.json(detection);
    } else {
      // Mock Fallback
      console.log(`No GEMINI_API_KEY found, falling back to mock pest detection (locale: ${locale})`);
      setTimeout(() => {
        let reports = mockPestReports;
        if (locale === 'hi') {
          reports = mockPestReportsHi;
        } else if (locale === 'pb') {
          reports = mockPestReportsPb;
        }
        const randomPest = reports[Math.floor(Math.random() * reports.length)];
        return res.json(randomPest);
      }, 1500);
    }
  } catch (error) {
    console.error("Gemini Pest Detection Error:", error);
    res.status(500).json({ message: "AI Pest Detection failed: " + error.message });
  }
});

export default router;
