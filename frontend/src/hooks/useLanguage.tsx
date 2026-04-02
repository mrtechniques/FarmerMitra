import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'kn' | 'ml' | 'ta' | 'mr' | 'te' | 'bn';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

export const translations: Translations = {
  // Navbar
  home: { en: 'Home', hi: 'होम', kn: 'ಮನೆ', ml: 'ഹോം', ta: 'முகப்பு', mr: 'होम', te: 'హోమ్', bn: 'হোম' },
  scan: { en: 'Scan', hi: 'स्कैन', kn: 'ಸ್ಕ್ಯಾನ್', ml: 'സ്കാൻ', ta: 'ஸ்கேன்', mr: 'स्कॅन', te: 'స్కాన్', bn: 'স্ক্যান' },
  history: { en: 'History', hi: 'इतिहास', kn: 'ಇತಿಹಾಸ', ml: 'ചരിത്രം', ta: 'வரலாறு', mr: 'इतिहास', te: 'చరిత్ర', bn: 'ইতিহাস' },
  agent: { en: 'Agent', hi: 'एजेंट', kn: 'ಏಜೆಂಟ್', ml: 'ഏജന്റ്', ta: 'ஏஜென்ட்', mr: 'एजंट', te: 'ఏజెంట్', bn: 'এজেন্ট' },
  
  // Home Page
  tagline: { en: 'Smart Farming Assistant', hi: 'स्मार्ट खेती सहायक', kn: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ', ml: 'സ്മാർട്ട് ഫാമിംഗ് അസിസ്റ്റന്റ്', ta: 'ஸ்மார்ட் விவசாய உதவியாளர்', mr: 'स्मार्ट शेती सहाय्यक', te: 'స్మార్ట్ ఫార్మింగ్ అసిస్టెంట్', bn: 'স্মার্ট কৃষি সহকারী' },
  heroTitle: { en: 'Keep Your Crops Healthy & Strong', hi: 'अपनी फसलों को स्वस्थ और मजबूत रखें', kn: 'ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಆರೋಗ್ಯಕರವಾಗಿ ಮತ್ತು ಬಲವಾಗಿಡಿ', ml: 'നിങ്ങളുടെ വിളകളെ ആരോഗ്യകരവും ശക്തവുമായി നിലനിർത്തുക', ta: 'உங்கள் பயிர்களை ஆரோக்கியமாகவும் வலுவாகவும் வைத்திருங்கள்', mr: 'तुमची पिके निरोगी आणि मजबूत ठेवा', te: 'మీ పంటలను ఆరోగ్యంగా మరియు బలంగా ఉంచండి', bn: 'আপনার ফসলকে স্বাস্থ্যকর এবং শক্তিশালী রাখুন' },
  heroSub: { en: 'Identify plant diseases instantly with Farmer Mitra. Just snap a photo and get expert recovery insights.', hi: 'Farmer Mitra के साथ तुरंत पौधों की बीमारियों की पहचान करें। बस एक फोटो लें और विशेषज्ञ रिकवरी अंतर्दृष्टि प्राप्त करें।', kn: 'Farmer Mitra ನೊಂದಿಗೆ ಸಸ್ಯ ರೋಗಗಳನ್ನು ತಕ್ಷಣವೇ ಗುರುತಿಸಿ. ಕೇವಲ ಫೋಟೋ ತೆಗೆಯಿರಿ ಮತ್ತು ತಜ್ಞರ ಚೇತರಿಕೆಯ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ.', ml: 'Farmer Mitra ഉപയോഗിച്ച് സസ്യരോഗങ്ങൾ തൽക്ഷണം തിരിച്ചറിയുക. ഒരു ഫോട്ടോ എടുത്ത് വിദഗ്ദ്ധ വീണ്ടെടുക്കൽ സ്ഥിതിവിവരക്കണക്കുകൾ നേടുക.', ta: 'Identify plant diseases instantly with Farmer Mitra. Just snap a photo and get expert recovery insights.', mr: 'Identify plant diseases instantly with Farmer Mitra. Just snap a photo and get expert recovery insights.', te: 'Identify plant diseases instantly with Farmer Mitra. Just snap a photo and get expert recovery insights.', bn: 'Identify plant diseases instantly with Farmer Mitra. Just snap a photo and get expert recovery insights.' },
  startScan: { en: 'Start Leaf Scan', hi: 'लीफ स्कैन शुरू करें', kn: 'ಎಲೆ ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ', ml: 'ലീഫ് സ്കാൻ ആരംഭിക്കുക', ta: 'இலை ஸ்கேன் தொடங்கவும்', mr: 'लीफ स्कॅन सुरू करा', te: 'లీఫ్ స్కాన్ ప్రారంభించండి', bn: 'লিফ স্ক্যান শুরু করুন' },
  whyTitle: { en: 'Why Farmer Mitra?', hi: 'Farmer Mitra क्यों?', kn: 'Farmer Mitra ಏಕೆ?', ml: 'എന്തുകൊണ്ട് Farmer Mitra?', ta: 'Why Farmer Mitra?', mr: 'Why Farmer Mitra?', te: 'Why Farmer Mitra?', bn: 'Why Farmer Mitra?' },
  whySub: { en: 'We combine agricultural expertise with cutting-edge technology to help you grow better.', hi: 'हम आपको बेहतर विकसित करने में मदद करने के लिए अत्याधुनिक तकनीक के साथ कृषि विशेषज्ञता को जोड़ते हैं।', kn: 'ನಿಮಗೆ ಉತ್ತಮವಾಗಿ ಬೆಳೆಯಲು ಸಹಾಯ ಮಾಡಲು ನಾವು ಕೃಷಿ ಪರಿಣತಿಯನ್ನು ಅತ್ಯಾಧುನಿಕ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತೇವೆ.', ml: 'മികച്ച രീതിയിൽ വളരാൻ നിങ്ങളെ സഹായിക്കുന്നതിന് ഞങ്ങൾ കാർഷിക വൈദഗ്ധ്യവും അത്യാധുനിക സാങ്കേതികവിദ്യയും സംയോജിപ്പിക്കുന്നു.', ta: 'We combine agricultural expertise with cutting-edge technology to help you grow better.', mr: 'We combine agricultural expertise with cutting-edge technology to help you grow better.', te: 'We combine agricultural expertise with cutting-edge technology to help you grow better.', bn: 'We combine agricultural expertise with cutting-edge technology to help you grow better.' },
  feat1Title: { en: 'Instant Detection', hi: 'त्वरित पहचान', kn: 'ತತ್ಕ್ಷಣ ಪತ್ತೆ', ml: 'തൽക്ഷണ കണ്ടെത്തൽ', ta: 'Instant Detection', mr: 'Instant Detection', te: 'Instant Detection', bn: 'Instant Detection' },
  feat1Sub: { en: 'Upload a photo and get results in seconds using advanced AI.', hi: 'उन्नत AI का उपयोग करके फोटो अपलोड करें और सेकंड में परिणाम प्राप्त करें।', kn: 'ಸುಧಾರಿತ AI ಬಳಸಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಫಲಿತಾಂಶಗಳನ್ನು ಪಡೆಯಿರಿ.', ml: 'നൂതന AI ഉപയോഗിച്ച് ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് നിമിഷങ്ങൾക്കുള്ളിൽ ഫലങ്ങൾ നേടുക.', ta: 'Upload a photo and get results in seconds using advanced AI.', mr: 'Upload a photo and get results in seconds using advanced AI.', te: 'Upload a photo and get results in seconds using advanced AI.', bn: 'Upload a photo and get results in seconds using advanced AI.' },
  feat2Title: { en: 'Expert Remedies', hi: 'विशेषज्ञ उपचार', kn: 'ತಜ್ಞರ ಪರಿಹಾರಗಳು', ml: 'വിദഗ്ദ്ധ പരിഹാരങ്ങൾ', ta: 'Expert Remedies', mr: 'Expert Remedies', te: 'Expert Remedies', bn: 'Expert Remedies' },
  feat2Sub: { en: 'Get verified recovery steps and organic/chemical solutions.', hi: 'सत्यापित रिकवरी चरण और जैविक/रासायनिक समाधान प्राप्त करें।', kn: 'ಪರಿಶೀಲಿಸಿದ ಚೇತರಿಕೆಯ ಹಂತಗಳು ಮತ್ತು ಸಾವಯವ/ರಾಸಾಯನಿಕ ಪರಿಹಾರಗಳನ್ನು ಪಡೆಯಿರಿ.', ml: 'പരിശോധിച്ച വീണ്ടെടുക്കൽ ഘട്ടങ്ങളും ജൈവ/രാസ പരിഹാരങ്ങളും നേടുക.', ta: 'Get verified recovery steps and organic/chemical solutions.', mr: 'Get verified recovery steps and organic/chemical solutions.', te: 'Get verified recovery steps and organic/chemical solutions.', bn: 'Get verified recovery steps and organic/chemical solutions.' },
  feat3Title: { en: 'Track Progress', hi: 'प्रगति ट्रैक करें', kn: 'ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', ml: 'പുരോഗതി ട്രാക്ക് ചെയ്യുക', ta: 'Track Progress', mr: 'Track Progress', te: 'Track Progress', bn: 'Track Progress' },
  feat3Sub: { en: 'Keep a history of your crop health and monitor recovery over time.', hi: 'अपने फसल स्वास्थ्य का इतिहास रखें और समय के साथ रिकवरी की निगरानी करें।', kn: 'ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯದ ಇತಿಹಾಸವನ್ನು ಇರಿಸಿ ಮತ್ತು ಕಾಲಾನಂತರದಲ್ಲಿ ಚೇತರಿಕೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.', ml: 'നിങ്ങളുടെ വിള ആരോഗ്യത്തിന്റെ ചരിത്രം സൂക്ഷിക്കുകയും കാലക്രമേണ വീണ്ടെടുക്കൽ നിരീക്ഷിക്കുകയും ചെയ്യുക.', ta: 'Keep a history of your crop health and monitor recovery over time.', mr: 'Keep a history of your crop health and monitor recovery over time.', te: 'Keep a history of your crop health and monitor recovery over time.', bn: 'Keep a history of your crop health and monitor recovery over time.' },
  needAdvice: { en: 'Need expert advice?', hi: 'विशेषज्ञ की सलाह चाहिए?', kn: 'ತಜ್ಞರ ಸಲಹೆ ಬೇಕೇ?', ml: 'വിദഗ്ദ്ധോപദേശം വേണോ?', ta: 'Need expert advice?', mr: 'Need expert advice?', te: 'Need expert advice?', bn: 'Need expert advice?' },
  adviceSub: { en: 'Our AI Agent is available 24/7 to answer your farming queries and provide detailed crop care tips.', hi: 'हमारा AI एजेंट आपके खेती के सवालों के जवाब देने और विस्तृत फसल देखभाल सुझाव प्रदान करने के लिए 24/7 उपलब्ध है।', kn: 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲು ಮತ್ತು ವಿವರವಾದ ಬೆಳೆ ಆರೈಕೆ ಸಲಹೆಗಳನ್ನು ನೀಡಲು ನಮ್ಮ AI ಏಜೆಂಟ್ 24/7 ಲಭ್ಯವಿದೆ.', ml: 'നിങ്ങളുടെ കൃഷി സംബന്ധമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാനും വിശദമായ വിള സംരക്ഷണ നുറുങ്ങുകൾ നൽകാനും ഞങ്ങളുടെ AI ഏജന്റ് 24/7 ലഭ്യമാണ്.', ta: 'Our AI Agent is available 24/7 to answer your farming queries and provide detailed crop care tips.', mr: 'Our AI Agent is available 24/7 to answer your farming queries and provide detailed crop care tips.', te: 'Our AI Agent is available 24/7 to answer your farming queries and provide detailed crop care tips.', bn: 'Our AI Agent is available 24/7 to answer your farming queries and provide detailed crop care tips.' },
  chatAgent: { en: 'Chat with Agent', hi: 'एजेंट के साथ चैट करें', kn: 'ಏಜೆಂಟ್ ಜೊತೆ ಚಾಟ್ ಮಾಡಿ', ml: 'ഏജന്റുമായി ചാറ്റ് ചെയ്യുക', ta: 'Chat with Agent', mr: 'Chat with Agent', te: 'Chat with Agent', bn: 'Chat with Agent' },

  // Scan Page
  scanTitle: { en: 'Scan Your Crop', hi: 'अपनी फसल को स्कैन करें', kn: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', ml: 'നിങ്ങളുടെ വിള സ്കാൻ ചെയ്യുക', ta: 'Scan Your Crop', mr: 'Scan Your Crop', te: 'Scan Your Crop', bn: 'Scan Your Crop' },
  scanSub: { en: 'Upload a clear photo of the affected leaf for accurate detection.', hi: 'सटीक पहचान के लिए प्रभावित पत्ती का स्पष्ट फोटो अपलोड करें।', kn: 'ನಿಖರವಾದ ಪತ್ತೆಗಾಗಿ ಪೀಡಿತ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.', ml: 'കൃത്യമായ കണ്ടെത്തലിനായി ബാധിച്ച ഇലയുടെ വ്യക്തമായ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.', ta: 'Upload a clear photo of the affected leaf for accurate detection.', mr: 'Upload a clear photo of the affected leaf for accurate detection.', te: 'Upload a clear photo of the affected leaf for accurate detection.', bn: 'Upload a clear photo of the affected leaf for accurate detection.' },
  dropImage: { en: 'Drop your image here', hi: 'अपनी छवि यहाँ छोड़ें', kn: 'ನಿಮ್ಮ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಬಿಡಿ', ml: 'നിങ്ങളുടെ ചിത്രം ഇവിടെ ഇടുക', ta: 'Drop your image here', mr: 'Drop your image here', te: 'Drop your image here', bn: 'Drop your image here' },
  chooseFile: { en: 'Choose File', hi: 'फ़ाइल चुनें', kn: 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ', ml: 'ഫയൽ തിരഞ്ഞെടുക്കുക', ta: 'Choose File', mr: 'Choose File', te: 'Choose File', bn: 'Choose File' },
  useCamera: { en: 'Use Camera', hi: 'कैमरे का उपयोग करें', kn: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ', ml: 'ക്യാമറ ഉപയോഗിക്കുക', ta: 'Use Camera', mr: 'Use Camera', te: 'Use Camera', bn: 'Use Camera' },
  analyzing: { en: 'Analyzing Crop Health...', hi: 'फसल स्वास्थ्य का विश्लेषण किया जा रहा है...', kn: 'ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', ml: 'വിളയുടെ ആരോഗ്യം വിശകലനം ചെയ്യുന്നു...', ta: 'Analyzing Crop Health...', mr: 'Analyzing Crop Health...', te: 'Analyzing Crop Health...', bn: 'Analyzing Crop Health...' },
  analyzeBtn: { en: 'Analyze Leaf Health', hi: 'पत्ती के स्वास्थ्य का विश्लेषण करें', kn: 'ಎಲೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಿ', ml: 'ഇലയുടെ ആരോഗ്യം വിശകലനം ചെയ്യുക', ta: 'Analyze Leaf Health', mr: 'Analyze Leaf Health', te: 'Analyze Leaf Health', bn: 'Analyze Leaf Health' },
  tipsTitle: { en: 'Tips for better results:', hi: 'बेहतर परिणामों के लिए सुझाव:', kn: 'ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ ಸಲಹೆಗಳು:', ml: 'മികച്ച ഫലങ്ങൾക്കായുള്ള നുറുങ്ങുകൾ:', ta: 'Tips for better results:', mr: 'Tips for better results:', te: 'Tips for better results:', bn: 'Tips for better results:' },
  tip1: { en: 'Ensure good lighting (natural sunlight is best)', hi: 'अच्छी रोशनी सुनिश्चित करें (प्राकृतिक धूप सबसे अच्छी है)', kn: 'ಉತ್ತಮ ಬೆಳಕನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ (ನೈಸರ್ಗಿಕ ಸೂರ್ಯನ ಬೆಳಕು ಉತ್ತಮವಾಗಿದೆ)', ml: 'നല്ല വെളിച്ചം ഉറപ്പാക്കുക (സ്വാഭാവിക സൂര്യപ്രകാശമാണ് നല്ലത്)', ta: 'Ensure good lighting (natural sunlight is best)', mr: 'Ensure good lighting (natural sunlight is best)', te: 'Ensure good lighting (natural sunlight is best)', bn: 'Ensure good lighting (natural sunlight is best)' },
  tip2: { en: 'Focus on the affected part of the leaf', hi: 'पत्ती के प्रभावित हिस्से पर ध्यान दें', kn: 'ಎಲೆಯ ಪೀಡಿತ ಭಾಗದ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ', ml: 'ഇലയുടെ ബാധിച്ച ഭാഗത്ത് ശ്രദ്ധ കേന്ദ്രീകരിക്കുക', ta: 'Focus on the affected part of the leaf', mr: 'Focus on the affected part of the leaf', te: 'Focus on the affected part of the leaf', bn: 'Focus on the affected part of the leaf' },
  tip3: { en: 'Avoid blurry or dark images', hi: 'धुंधली या अंधेरी छवियों से बचें', kn: 'ಮಸುಕಾದ ಅಥವಾ ಗಾಢವಾದ ಚಿತ್ರಗಳನ್ನು ತಪ್ಪಿಸಿ', ml: 'മങ്ങിയതോ ഇരുണ്ടതോ ആയ ചിത്രങ്ങൾ ഒഴിവാക്കുക', ta: 'Avoid blurry or dark images', mr: 'Avoid blurry or dark images', te: 'Avoid blurry or dark images', bn: 'Avoid blurry or dark images' },
  tip4: { en: 'Place the leaf on a plain background if possible', hi: 'यदि संभव हो तो पत्ती को सादे पृष्ठभूमि पर रखें', kn: 'ಸಾಧ್ಯವಾದರೆ ಎಲೆಯನ್ನು ಸರಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಇರಿಸಿ', ml: 'സാധ്യമാണെങ്കിൽ ഇല ഒരു പ്ലെയിൻ പശ്ചാത്തലത്തിൽ വയ്ക്കുക', ta: 'Place the leaf on a plain background if possible', mr: 'Place the leaf on a plain background if possible', te: 'Place the leaf on a plain background if possible', bn: 'Place the leaf on a plain background if possible' },
  supportsFormat: { en: 'Supports JPG, PNG up to 10MB', hi: '10MB तक JPG, PNG का समर्थन करता है', kn: '10MB ವರೆಗಿನ JPG, PNG ಬೆಂಬಲಿಸುತ್ತದೆ', ml: '10MB വരെയുള്ള JPG, PNG പിന്തുണയ്ക്കുന്നു', ta: 'Supports JPG, PNG up to 10MB', mr: 'Supports JPG, PNG up to 10MB', te: 'Supports JPG, PNG up to 10MB', bn: 'Supports JPG, PNG up to 10MB' },
  capturingLocation: { en: 'Capturing location...', hi: 'स्थान कैप्चर किया जा रहा है...', kn: 'ಸ್ಥಳವನ್ನು ಸೆರೆಹಿಡಿಯಲಾಗುತ್ತಿದೆ...', ml: 'സ്ഥലം പിടിച്ചെടുക്കുന്നു...', ta: 'Capturing location...', mr: 'Capturing location...', te: 'Capturing location...', bn: 'Capturing location...' },
  locationNotAvailable: { en: 'Location not available', hi: 'स्थान उपलब्ध नहीं है', kn: 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ', ml: 'സ്ഥലം ലഭ്യമല്ല', ta: 'Location not available', mr: 'Location not available', te: 'Location not available', bn: 'Location not available' },

  // Results Page
  backToScan: { en: 'Back to Scan', hi: 'स्कैन पर वापस जाएं', kn: 'ಸ್ಕ್ಯಾನ್‌ಗೆ ಹಿಂತಿರುಗಿ', ml: 'തിരികെ സ്കാനിലേക്ക്', ta: 'Back to Scan', mr: 'Back to Scan', te: 'Back to Scan', bn: 'Back to Scan' },
  confidence: { en: 'Confidence Score', hi: 'आत्मविश्वास स्कोर', kn: 'ಆತ್ಮವಿಶ್ವಾಸದ ಸ್ಕೋರ್', ml: 'കോൺഫിഡൻസ് സ്കോർ', ta: 'Confidence Score', mr: 'Confidence Score', te: 'Confidence Score', bn: 'Confidence Score' },
  confSub: { en: 'Our AI is highly confident in this diagnosis.', hi: 'हमारा AI इस निदान में अत्यधिक आश्वस्त है।', kn: 'ನಮ್ಮ AI ಈ ರೋಗನಿರ್ಣಯದಲ್ಲಿ ಹೆಚ್ಚಿನ ವಿಶ್ವಾಸವನ್ನು ಹೊಂದಿದೆ.', ml: 'ഈ രോഗനിർണ്ണയത്തിൽ ഞങ്ങളുടെ AI-ക്ക് വലിയ ആത്മവിശ്വാസമുണ്ട്.', ta: 'Our AI is highly confident in this diagnosis.', mr: 'Our AI is highly confident in this diagnosis.', te: 'Our AI is highly confident in this diagnosis.', bn: 'Our AI is highly confident in this diagnosis.' },
  diseaseDetected: { en: 'Disease Detected', hi: 'बीमारी का पता चला', kn: 'ರೋಗ ಪತ್ತೆಯಾಗಿದೆ', ml: 'രോഗം കണ്ടെത്തി', ta: 'Disease Detected', mr: 'Disease Detected', te: 'Disease Detected', bn: 'Disease Detected' },
  diagDetails: { en: 'Diagnosis Details', hi: 'निदान विवरण', kn: 'ರೋಗನಿರ್ಣಯದ ವಿವರಗಳು', ml: 'രോഗനിർണ്ണയ വിവരങ്ങൾ', ta: 'Diagnosis Details', mr: 'Diagnosis Details', te: 'Diagnosis Details', bn: 'Diagnosis Details' },
  expRecovery: { en: 'Expected Recovery', hi: 'अपेक्षित रिकवरी', kn: 'ನಿರೀಕ್ಷಿತ ಚೇತರಿಕೆ', ml: 'പ്രതീക്ഷിക്കുന്ന വീണ്ടെടുക്കൽ', ta: 'Expected Recovery', mr: 'Expected Recovery', te: 'Expected Recovery', bn: 'Expected Recovery' },
  recoveryIn: { en: 'With proper care, your crop should recover in', hi: 'उचित देखभाल के साथ, आपकी फसल इतने समय में ठीक हो जानी चाहिए', kn: 'ಸರಿಯಾದ ಕಾಳಜಿಯೊಂದಿಗೆ, ನಿಮ್ಮ ಬೆಳೆಯು ಇಷ್ಟು ಸಮಯದಲ್ಲಿ ಚೇತರಿಸಿಕೊಳ್ಳಬೇಕು', ml: 'ശരിയായ പരിചരണത്തോടെ, നിങ്ങളുടെ വിള ഇത്രയും സമയത്തിനുള്ളിൽ വീണ്ടെടുക്കും', ta: 'With proper care, your crop should recover in', mr: 'With proper care, your crop should recover in', te: 'With proper care, your crop should recover in', bn: 'With proper care, your crop should recover in' },
  recRemedies: { en: 'Remedies & Prevention', hi: 'उपचार और बचाव', kn: 'ಪರಿಹಾರ ಮತ್ತು ತಡೆಗಟ್ಟುವಿಕೆ', ml: 'പരിഹാരങ്ങളും പ്രതിരോധവും', ta: 'Remedies & Prevention', mr: 'Remedies & Prevention', te: 'Remedies & Prevention', bn: 'Remedies & Prevention' },
  saveHistory: { en: 'Save to History', hi: 'इतिहास में सहेजें', kn: 'ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಿ', ml: 'ചരിത്രത്തിലേക്ക് സേവ് ചെയ്യുക', ta: 'Save to History', mr: 'Save to History', te: 'Save to History', bn: 'Save to History' },
  scanAnother: { en: 'Scan Another Plant', hi: 'एक और पौधा स्कैन करें', kn: 'ಮತ್ತೊಂದು ಸಸ್ಯವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', ml: 'മറ്റൊരു ചെടി സ്കാൻ ചെയ്യുക', ta: 'Scan Another Plant', mr: 'Scan Another Plant', te: 'Scan Another Plant', bn: 'Scan Another Plant' },
  askHelp: { en: 'Ask Agent for Help', hi: 'मदद के लिए एजेंट से पूछें', kn: 'सहायता के लिए एजेंट को बुलाएँ', ml: 'സഹായത്തിന് ഏജന്റിനോട് ചോദിക്കുക', ta: 'Ask Agent for Help', mr: 'Ask Agent for Help', te: 'Ask Agent for Help', bn: 'Ask Agent for Help' },

  // History Page
  historyTitle: { en: 'Scan History', hi: 'स्कैन इतिहास', kn: 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ', ml: 'സ്കാൻ ചരിത്രം', ta: 'Scan History', mr: 'Scan History', te: 'Scan History', bn: 'Scan History' },
  historySub: { en: 'Monitor your crop health over time.', hi: 'समय के साथ अपनी फसल के स्वास्थ्य की निगरानी करें।', kn: 'ಕಾಲಾನಂತರದಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.', ml: 'കാലക്രമേണ നിങ്ങളുടെ വിളയുടെ ആരോഗ്യം നിരീക്ഷിക്കുക.', ta: 'Monitor your crop health over time.', mr: 'Monitor your crop health over time.', te: 'Monitor your crop health over time.', bn: 'Monitor your crop health over time.' },
  searchCrops: { en: 'Search crops...', hi: 'फसलें खोजें...', kn: 'ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...', ml: 'വിളകൾ തിരയുക...', ta: 'Search crops...', mr: 'Search crops...', te: 'Search crops...', bn: 'Search crops...' },
  noScans: { en: 'No scans yet', hi: 'अभी तक कोई स्कैन नहीं', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ', ml: 'സ്കാനുകളൊന്നുമില്ല', ta: 'No scans yet', mr: 'No scans yet', te: 'No scans yet', bn: 'No scans yet' },
  noScansSub: { en: 'Your crop health history will appear here once you start scanning.', hi: 'एक बार जब आप स्कैन करना शुरू कर देंगे तो आपकी फसल स्वास्थ्य इतिहास यहाँ दिखाई देगा।', kn: 'ಒಮ್ಮೆ ನೀವು ಸ್ಕ್ಯಾನಿಂಗ್ ಪ್ರಾರಂಭಿಸಿದರೆ ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯ ಇತಿಹಾಸ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.', ml: 'നിങ്ങൾ സ്കാനിംഗ് ആരംഭിച്ചുകഴിഞ്ഞാൽ നിങ്ങളുടെ വിള ആരോഗ്യ ചരിത്രം ഇവിടെ ദൃശ്യമാകും.', ta: 'Your crop health history will appear here once you start scanning.', mr: 'Your crop health history will appear here once you start scanning.', te: 'Your crop health history will appear here once you start scanning.', bn: 'Your crop health history will appear here once you start scanning.' },
  firstScan: { en: 'Perform First Scan', hi: 'पहला स्कैन करें', kn: 'ಮೊದಲ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', ml: 'ആദ്യ സ്കാൻ ചെയ്യുക', ta: 'Perform First Scan', mr: 'Perform First Scan', te: 'Perform First Scan', bn: 'Perform First Scan' },
  healthy: { en: 'Healthy', hi: 'स्वस्थ', kn: 'ಆರೋಗ್ಯಕರ', ml: 'ആരോഗ്യമുള്ളത്', ta: 'Healthy', mr: 'Healthy', te: 'Healthy', bn: 'Healthy' },
  diseased: { en: 'Diseased', hi: 'बीमार', kn: 'ರೋಗಗ್ರಸ್ತ', ml: 'രോഗം ബാധിച്ചത്', ta: 'Diseased', mr: 'Diseased', te: 'Diseased', bn: 'Diseased' },

  // Agent Page
  agentTitle: { en: 'Farmer Mitra AI', hi: 'Farmer Mitra AI', kn: 'Farmer Mitra AI', ml: 'Farmer Mitra AI', ta: 'Farmer Mitra AI', mr: 'Farmer Mitra AI', te: 'Farmer Mitra AI', bn: 'Farmer Mitra AI' },
  online: { en: 'Online', hi: 'ऑनलाइन', kn: 'ಆನ್‌ಲೈನ್', ml: 'ഓൺലൈൻ', ta: 'Online', mr: 'Online', te: 'Online', bn: 'Online' },
  askAnything: { en: 'Ask anything about your crops...', hi: 'अपनी फसलों के बारे में कुछ भी पूछें...', kn: 'ನಿಮ್ಮ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...', ml: 'നിങ്ങളുടെ വിളകളെക്കുറിച്ച് എന്തും ചോദിക്കുക...', ta: 'Ask anything about your crops...', mr: 'Ask anything about your crops...', te: 'Ask anything about your crops...', bn: 'Ask anything about your crops...' },
  botWelcome: { en: "Hello! I'm Farmer Mitra AI. How can I help you with your crops today?", hi: "नमस्ते! मैं Farmer Mitra AI हूँ। आज मैं आपकी फसलों में आपकी कैसे मदद कर सकता हूँ?", kn: "ನಮಸ್ಕಾರ! ನಾನು Farmer Mitra AI. ಇಂದು ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?", ml: "ഹലോ! ഞാൻ Farmer Mitra AI ആണ്. ഇന്ന് നിങ്ങളുടെ വിളകളുടെ കാര്യത്തിൽ എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?", ta: "Hello! I'm Farmer Mitra AI. How can I help you with your crops today?", mr: "Hello! I'm Farmer Mitra AI. How can I help you with your crops today?", te: "Hello! I'm Farmer Mitra AI. How can I help you with your crops today?", bn: "Hello! I'm Farmer Mitra AI. How can I help you with your crops today?" },

  // Shop
  shop: { en: 'Shop', hi: 'दुकान', kn: 'ಅಂಗಡಿ', ml: 'ഷോപ്പ്', ta: 'Shop', mr: 'Shop', te: 'Shop', bn: 'Shop' },
  cart: { en: 'Cart', hi: 'कार्ट', kn: 'ಕಾರ್ಟ್', ml: 'കാർട്ട്', ta: 'Cart', mr: 'Cart', te: 'Cart', bn: 'Cart' },
  featured: { en: 'Featured Plants', hi: 'विशेष पौधे', kn: 'ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಸಸ್ಯಗಳು', ml: 'തിരഞ്ഞെടുത്ത ചെടികൾ', ta: 'Featured Plants', mr: 'Featured Plants', te: 'Featured Plants', bn: 'Featured Plants' },
  addToCart: { en: 'Add to Cart', hi: 'कार्ट में जोड़ें', kn: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ', ml: 'കാർട്ടിലേക്ക് ചേർക്കുക', ta: 'Add to Cart', mr: 'Add to Cart', te: 'Add to Cart', bn: 'Add to Cart' },
  price: { en: 'Price', hi: 'कीमत', kn: 'ಬೆಲೆ', ml: 'വില', ta: 'Price', mr: 'Price', te: 'Price', bn: 'Price' },
  categories: { en: 'Categories', hi: 'श्रेणियां', kn: 'ವರ್ಗಗಳು', ml: 'വിഭാഗങ്ങൾ', ta: 'Categories', mr: 'Categories', te: 'Categories', bn: 'Categories' },
  all: { en: 'All', hi: 'सभी', kn: 'ಎಲ್ಲಾ', ml: 'എല്ലാം', ta: 'All', mr: 'All', te: 'All', bn: 'All' },
  indoor: { en: 'Indoor', hi: 'इनडोर', kn: 'ಒಳಾಂಗಣ', ml: 'ഇൻഡോർ', ta: 'Indoor', mr: 'Indoor', te: 'Indoor', bn: 'Indoor' },
  outdoor: { en: 'Outdoor', hi: 'आउटडोर', kn: 'ಹೊರಾಂಗಣ', ml: 'ഔട്ട്ഡോർ', ta: 'Outdoor', mr: 'Outdoor', te: 'Outdoor', bn: 'Outdoor' },
  succulents: { en: 'Succulents', hi: 'सकुलेंट्स', kn: 'ಸಕ್ಯುಲೆಂಟ್ಸ್', ml: 'സക്കുലന്റുകൾ', ta: 'Succulents', mr: 'Succulents', te: 'Succulents', bn: 'Succulents' },
  ecoLifestyle: { en: 'Eco-Lifestyle', hi: 'इको-लाइफस्टाइल', kn: 'ಇಕೋ-ಲೈಫ್‌ಸ್ಟೈಲ್', ml: 'ഇക്കോ-ലൈഫ്സ്റ്റൈൽ', ta: 'Eco-Lifestyle', mr: 'Eco-Lifestyle', te: 'Eco-Lifestyle', bn: 'Eco-Lifestyle' },
  premiumQuality: { en: 'Premium Quality', hi: 'प्रीमियम गुणवत्ता', kn: 'ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟ', ml: 'പ്രീമിയം ക്വാളിറ്റി', ta: 'Premium Quality', mr: 'Premium Quality', te: 'Premium Quality', bn: 'Premium Quality' },
  shopNow: { en: 'Shop Now', hi: 'अभी खरीदें', kn: 'ಈಗ ಖರೀದಿಸಿ', ml: 'ഇപ്പോൾ വാങ്ങുക', ta: 'Shop Now', mr: 'Shop Now', te: 'Shop Now', bn: 'Shop Now' },
  checkout: { en: 'Checkout', hi: 'चेकआउट', kn: 'ಚೆಕ್ಔಟ್', ml: 'ചെക്ക്ഔട്ട്', ta: 'Checkout', mr: 'Checkout', te: 'Checkout', bn: 'Checkout' },
  total: { en: 'Total', hi: 'कुल', kn: 'ಒಟ್ಟು', ml: 'ആകെ', ta: 'Total', mr: 'Total', te: 'Total', bn: 'Total' },
  emptyCart: { en: 'Your cart is empty', hi: 'आपकी कार्ट खाली है', kn: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಿದೆ', ml: 'നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്', ta: 'Your cart is empty', mr: 'Your cart is empty', te: 'Your cart is empty', bn: 'Your cart is empty' },
  
  // Footer
  footerDesc: { en: 'Empowering farmers with smart technology for healthier crops and better yields.', hi: 'स्वस्थ फसलों और बेहतर पैदावार के लिए स्मार्ट तकनीक के साथ किसानों को सशक्त बनाना।', kn: 'ಆರೋಗ್ಯಕರ ಬೆಳೆಗಳು ಮತ್ತು ಉತ್ತಮ ಇಳುವರಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ರೈತರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.', ml: 'ആരോഗ്യകരമായ വിളകൾക്കും മികച്ച വിളവിനും വേണ്ടി സ്മാർട്ട് സാങ്കേതികവിദ്യ ഉപയോഗിച്ച് കർഷകരെ ശാക്തീകരിക്കുന്നു.', ta: 'Empowering farmers with smart technology for healthier crops and better yields.', mr: 'Empowering farmers with smart technology for healthier crops and better yields.', te: 'Empowering farmers with smart technology for healthier crops and better yields.', bn: 'Empowering farmers with smart technology for healthier crops and better yields.' },
  quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक', kn: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು', ml: 'ദ്രുത ലിങ്കുകൾ', ta: 'Quick Links', mr: 'Quick Links', te: 'Quick Links', bn: 'Quick Links' },
  aboutUs: { en: 'About Us', hi: 'हमारे बारे में', kn: 'ನಮ್ಮ ಬಗ್ಗೆ', ml: 'ഞങ്ങളെക്കുറിച്ച്', ta: 'About Us', mr: 'About Us', te: 'About Us', bn: 'About Us' },
  howItWorks: { en: 'How it Works', hi: 'यह कैसे काम करता है', kn: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', ml: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു', ta: 'How it Works', mr: 'How it Works', te: 'How it Works', bn: 'How it Works' },
  privacy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', kn: 'ಗೌಪ್ಯತಾ ನೀತಿ', ml: 'സ്വകാര്യതാ നയം', ta: 'Privacy Policy', mr: 'Privacy Policy', te: 'Privacy Policy', bn: 'Privacy Policy' },
  contact: { en: 'Contact Support', hi: 'संपर्क सहायता', kn: 'ಸಂಪರ್ಕ ಬೆಂಬಲ', ml: 'ബന്ധപ്പെടുക', ta: 'Contact Support', mr: 'Contact Support', te: 'Contact Support', bn: 'Contact Support' },
  rights: { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।', kn: 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.', ml: 'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.', ta: 'All rights reserved.', mr: 'All rights reserved.', te: 'All rights reserved.', bn: 'All rights reserved.' },
  
  // New Status & Misc
  healthyPlant: { en: 'Healthy Plant', hi: 'स्वस्थ पौधा', kn: 'ಆರೋಗ್ಯಕರ ಸಸ್ಯ', ml: 'ആരോഗ്യമുള്ള ചെടി', ta: 'Healthy Plant', mr: 'Healthy Plant', te: 'Healthy Plant', bn: 'Healthy Plant' },
  recoveryVaries: { en: 'Varies', hi: 'परिवर्तित होता है', kn: 'ಬದಲಾಗುತ್ತದೆ', ml: 'വ്യത്യാസപ്പെടുന്നു', ta: 'Varies', mr: 'Varies', te: 'Varies', bn: 'Varies' },
  
  // Agent Quick Prompts
  diagPlant: { en: 'Diagnose my plant', hi: 'मेरे पौधे का निदान करें', kn: 'ನನ್ನ ಸಸ್ಯವನ್ನು ಪತ್ತೆ ಮಾಡಿ', ml: 'എന്റെ ചെടി രോഗനിർണ്ണയം ചെയ്യുക', ta: 'Diagnose my plant', mr: 'Diagnose my plant', te: 'Diagnose my plant', bn: 'Diagnose my plant' },
  waterTips: { en: 'Watering tips', hi: 'सिंचाई के सुझाव', kn: 'ನೀರುಹಾಕುವ ಸಲಹೆಗಳು', ml: 'നനയ്ക്കാനുള്ള നുറുങ്ങുകൾ', ta: 'Watering tips', mr: 'Watering tips', te: 'Watering tips', bn: 'Watering tips' },
  soilHealth: { en: 'Soil health', hi: 'मिट्टी का स्वास्थ्य', kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', ml: 'മണ്ണിലെ ആരോഗ്യം', ta: 'Soil health', mr: 'Soil health', te: 'Soil health', bn: 'Soil health' },
  bestPractices: { en: 'Best practices', hi: 'सर्वोत्तम प्रथाएं', kn: 'ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು', ml: 'മികച്ച രീതികൾ', ta: 'Best practices', mr: 'Best practices', te: 'Best practices', bn: 'Best practices' },
  
  diagPlantQuery: { en: 'How do I identify what disease my plant has?', hi: 'मैं कैसे पहचानूँ कि मेरे पौधे को कौन सी बीमारी है?', kn: 'ನನ್ನ ಸಸ್ಯಕ್ಕೆ ಯಾವ ರೋಗವಿದೆ ಎಂದು ನಾನು ಹೇಗೆ ಗುರುತಿಸುವುದು?', ml: 'എന്റെ ചെടിക്ക് ഏത് രോഗമാണെന്ന് ഞാൻ എങ്ങനെ തിരിച്ചറിയും?', ta: 'How do I identify what disease my plant has?', mr: 'How do I identify what disease my plant has?', te: 'How do I identify what disease my plant has?', bn: 'How do I identify what disease my plant has?' },
  waterTipsQuery: { en: 'How often should I water my crop?', hi: 'मुझे अपनी फसल को कितनी बार पानी देना चाहिए?', kn: 'ನಾನು ನನ್ನ ಬೆಳೆಗೆ ಎಷ್ಟು ಬಾರಿ ನೀರು ಹಾಕಬೇಕು?', ml: 'എന്റെ വിളയ്ക്ക് എത്ര തവണ നനയ്ക്കണം?', ta: 'How often should I water my crop?', mr: 'How often should I water my crop?', te: 'How often should I water my crop?', bn: 'How often should I water my crop?' },
  soilHealthQuery: { en: 'How do I improve my soil health?', hi: 'मैं अपनी मिट्टी के स्वास्थ्य में कैसे सुधार करूँ?', kn: 'ನನ್ನ ಮಣ್ಣಿನ ಆರೋಗ್ಯವನ್ನು ನಾನು ಹೇಗೆ ಸುಧಾರಿಸುವುದು?', ml: 'എന്റെ മണ്ണിലെ ആരോഗ്യം എങ്ങനെ മെച്ചപ്പെടുത്താം?', ta: 'How do I improve my soil health?', mr: 'How do I improve my soil health?', te: 'How do I improve my soil health?', bn: 'How do I improve my soil health?' },
  bestPracticesQuery: { en: 'What are the best practices for preventing plant diseases?', hi: 'पौधों की बीमारियों को रोकने के लिए सर्वोत्तम प्रथाएं क्या हैं?', kn: 'ಸಸ್ಯ ರೋಗಗಳನ್ನು ತಡೆಗಟ್ಟಲು ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು ಯಾವುವು?', ml: 'സസ്യരോഗങ്ങൾ തടയുന്നതിനുള്ള മികച്ച രീതികൾ ഏതാണ്?', ta: 'What are the best practices for preventing plant diseases?', mr: 'What are the best practices for preventing plant diseases?', te: 'What are the best practices for preventing plant diseases?', bn: 'What are the best practices for preventing plant diseases?' },
  
  // Scan Validation
  checkingQuality: { en: 'Checking image quality...', hi: 'छवि की गुणवत्ता की जाँच की जा रही है...', kn: 'ಚಿತ್ರದ ಗುಣಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...', ml: 'ചിത്രത്തിന്റെ ഗുണനിലവാരം പരിശോധിക്കുന്നു...', ta: 'Checking image quality...', mr: 'Checking image quality...', te: 'Checking image quality...', bn: 'Checking image quality...' },
  detectingLeaf: { en: 'Detecting leaf and measuring sharpness', hi: 'पत्ती का पता लगाना और तीक्ष्णता मापना', kn: 'ಎಲೆಯನ್ನು ಪತ್ತೆಹಚ್ಚುವುದು ಮತ್ತು ತೀಕ್ಷ್ಣತೆಯನ್ನು ಅಳೆಯುವುದು', ml: 'ഇല കണ്ടെത്തുകയും മൂർച്ച അളക്കുകയും ചെയ്യുന്നു', ta: 'Detecting leaf and measuring sharpness', mr: 'Detecting leaf and measuring sharpness', te: 'Detecting leaf and measuring sharpness', bn: 'Detecting leaf and measuring sharpness' },
  noLeafTitle: { en: 'No Leaf Detected', hi: 'कोई पत्ती नहीं मिली', kn: 'ಯಾವುದೇ ಎಲೆ ಪತ್ತೆಯಾಗಿಲ್ಲ', ml: 'ഇലയൊന്നും കണ്ടെത്തിയില്ല', ta: 'No Leaf Detected', mr: 'No Leaf Detected', te: 'No Leaf Detected', bn: 'No Leaf Detected' },
  noLeafSub: { en: 'The uploaded image does not show a clear, up-close leaf. Please upload a macro photo where leaf veins and textures are visible.', hi: 'अपलोड की गई छवि में पत्ती स्पष्ट और पास से नहीं दिख रही है। कृपया एक मैक्रो फोटो अपलोड करें जहां पत्ती की नसें और बनावट दिखाई दें।', kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರವು ಸ್ಪಷ್ಟವಾದ, ಹತ್ತಿರದ ಎಲೆಯನ್ನು ತೋರಿಸುತ್ತಿಲ್ಲ. ಎಲೆಯ ನರಗಳು ಮತ್ತು ವಿನ್ಯಾಸಗಳು ಗೋಚರಿಸುವ ಮ್ಯಾಕ್ರೋ ಫೋಟೋವನ್ನು ದಯವಿಟ್ಟು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.', ml: 'അപ്‌ലോഡ് ചെയ്ത ചിത്രത്തിൽ വ്യക്തമായ, അടുത്തുള്ള ഇല കാണുന്നില്ല. ഇലയുടെ ഞരമ്പുകളും ഘടനയും കാണുന്ന ഒരു മാക്രോ ഫോട്ടോ ദയവായി അപ്‌ലോഡ് ചെയ്യുക.', ta: 'The uploaded image does not show a clear, up-close leaf. Please upload a macro photo where leaf veins and textures are visible.', mr: 'The uploaded image does not show a clear, up-close leaf. Please upload a macro photo where leaf veins and textures are visible.', te: 'The uploaded image does not show a clear, up-close leaf. Please upload a macro photo where leaf veins and textures are visible.', bn: 'The uploaded image does not show a clear, up-close leaf. Please upload a macro photo where leaf veins and textures are visible.' },
  blurryTitle: { en: 'Image Too Blurry', hi: 'छवि बहुत धुंधली है', kn: 'ಚಿತ್ರವು ತುಂಬಾ ಮಸುಕಾಗಿದೆ', ml: 'ചിത്രം വളരെ മങ്ങിയതാണ്', ta: 'Image Too Blurry', mr: 'Image Too Blurry', te: 'Image Too Blurry', bn: 'Image Too Blurry' },
  blurrySub: { en: 'Your image is too blurry for a reliable diagnosis.', hi: 'आपकी छवि विश्वसनीय निदान के लिए बहुत धुंधली है।', kn: 'ವಿಶ್ವಾಸಾರ್ಹ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಚಿತ್ರವು ತುಂಬಾ ಮಸುಕಾಗಿದೆ.', ml: 'വിശ്വസനീയമായ രോഗനിർണ്ണയത്തിന് നിങ്ങളുടെ ചിത്രം വളരെ മങ്ങിയതാണ്.', ta: 'Your image is too blurry for a reliable diagnosis.', mr: 'Your image is too blurry for a reliable diagnosis.', te: 'Your image is too blurry for a reliable diagnosis.', bn: 'Your image is too blurry for a reliable diagnosis.' },
  sharpnessScore: { en: 'Sharpness Score', hi: 'तीक्ष्णता स्कोर', kn: 'ತೀಕ್ಷ್ಣತೆಯ ಸ್ಕೋರ್', ml: 'ഷാർപ്നസ് സ്കോർ', ta: 'Sharpness Score', mr: 'Sharpness Score', te: 'Sharpness Score', bn: 'Sharpness Score' },
  minRequired: { en: 'Minimum required', hi: 'न्यूनतम आवश्यक', kn: 'ಕನಿಷ್ಠ ಅಗತ್ಯವಿದೆ', ml: 'കുറഞ്ഞത് ആവശ്യമാണ്', ta: 'Minimum required', mr: 'Minimum required', te: 'Minimum required', bn: 'Minimum required' },
  noLeafTips: { en: 'Tips: Avoid plain green backgrounds or distant fields. Place the leaf 4-6 inches from the camera and ensure veins are in focus.', hi: 'सुझाव: सादे हरे रंग की पृष्ठभूमि या दूर के खेतों से बचें। पत्ती को कैमरे से 4-6 इंच की दूरी पर रखें और सुनिश्चित करें कि नसें फोकस में हों।', kn: 'ಸಲಹೆಗಳು: ಸರಳ ಹಸಿರು ಹಿನ್ನೆಲೆ ಅಥವಾ ದೂರದ ಹೊಲಗಳನ್ನು ತಪ್ಪಿಸಿ. ಎಲೆಯನ್ನು ಕ್ಯಾಮೆರಾದಿಂದ 4-6 ಇಂಚು ದೂರದಲ್ಲಿರಿಸಿ ಮತ್ತು ನರಗಳು ಫೋಕಸ್‌ನಲ್ಲಿವೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.', ml: 'നുറുങ്ങുകൾ: പ്ലെയിൻ പച്ച പശ്ചാത്തലമോ വിദൂര ഫീൽഡുകളോ ഒഴിവാക്കുക. ഇല ക്യാമറയിൽ നിന്ന് 4-6 ഇഞ്ച് അകലെ വയ്ക്കുക, ഞരമ്പുകൾ ഫോക്കസ് ആണെന്ന് ഉറപ്പാക്കുക.', ta: 'Tips: Avoid plain green backgrounds or distant fields. Place the leaf 4-6 inches from the camera and ensure veins are in focus.', mr: 'Tips: Avoid plain green backgrounds or distant fields. Place the leaf 4-6 inches from the camera and ensure veins are in focus.', te: 'Tips: Avoid plain green backgrounds or distant fields. Place the leaf 4-6 inches from the camera and ensure veins are in focus.', bn: 'Tips: Avoid plain green backgrounds or distant fields. Place the leaf 4-6 inches from the camera and ensure veins are in focus.' },
  blurryTips: { en: 'Tips: Hold your camera steady, ensure good lighting, and tap the leaf to focus before capturing.', hi: 'सुझाव: कैमरा स्थिर रखें, अच्छी रोशनी सुनिश्चित करें, और कैप्चर करने से पहले फोकस करने के लिए पत्ती पर टैप करें।', kn: 'ಸಲಹೆಗಳು: ಕ್ಯಾಮೆರಾವನ್ನು ಸ್ಥಿರವಾಗಿ ಹಿಡಿದುಕೊಳ್ಳಿ, ಉತ್ತಮ ಬೆಳಕನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಸೆರೆಹಿಡಿಯುವ ಮೊದಲು ಫೋಕಸ್ ಮಾಡಲು ಎಲೆಯ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ.', ml: 'നുറുങ്ങുകൾ: ക്യാമറ നിശ്ചലമായി പിടിക്കുക, നല്ല വെളിച്ചം ഉറപ്പാക്കുക, പകർത്തുന്നതിന് മുമ്പ് ഫോക്കസ് ചെയ്യുന്നതിനായി ഇലയിൽ ടാപ്പുചെയ്യുക.', ta: 'Tips: Hold your camera steady, ensure good lighting, and tap the leaf to focus before capturing.', mr: 'Tips: Hold your camera steady, ensure good lighting, and tap the leaf to focus before capturing.', te: 'Tips: Hold your camera steady, ensure good lighting, and tap the leaf to focus before capturing.', bn: 'Tips: Hold your camera steady, ensure good lighting, and tap the leaf to focus before capturing.' },
  uploadAnother: { en: 'Upload Another Image', hi: 'दूसरी छवि अपलोड करें', kn: 'ಮತ್ತೊಂದು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', ml: 'മറ്റൊരു ചിത്രം അപ്‌ലോഡ് ചെയ്യുക', ta: 'Upload Another Image', mr: 'Upload Another Image', te: 'Upload Another Image', bn: 'Upload Another Image' },
  tryAgain: { en: 'Try Again', hi: 'फिर से प्रयास करें', kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ', ml: 'വീണ്ടും ശ്രമിക്കുക', ta: 'Try Again', mr: 'Try Again', te: 'Try Again', bn: 'Try Again' },
  analysisFailed: { en: 'Analysis Failed', hi: 'विश्लेषण विफल रहा', kn: 'ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ', ml: 'വിശകലനം പരാജയപ്പെട്ടു', ta: 'Analysis Failed', mr: 'Analysis Failed', te: 'Analysis Failed', bn: 'Analysis Failed' },
  ensureBackend: { en: 'Make sure the Python backend server is running.', hi: 'सुनिश्चित करें कि पायथन बैकएंड सर्वर चल रहा है।', kn: 'ಪೈಥಾನ್ ಬ್ಯಾಕೆಂಡ್ ಸರ್ವರ್ ಚಾಲನೆಯಲ್ಲಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.', ml: 'പൈത്തൺ ബാക്കെൻഡ് സെർവർ പ്രവർത്തിക്കുന്നുണ്ടെന്ന് ഉറപ്പാക്കുക.', ta: 'Make sure the Python backend server is running.', mr: 'Make sure the Python backend server is running.', te: 'Make sure the Python backend server is running.', bn: 'Make sure the Python backend server is running.' },
  plant: { en: 'Plant', hi: 'पौधा', kn: 'ಸಸ್ಯ', ml: 'ചെടി', ta: 'தாவரம்', mr: 'रोप', te: 'మొక్క', bn: 'গাছ' },
  aiConfidence: { en: 'AI Confidence', hi: 'AI आत्मविश्वास', kn: 'AI ಆತ್ಮವಿಶ್ವಾಸ', ml: 'AI കോൺഫിഡൻസ്', ta: 'AI நம்பிக்கை', mr: 'AI विश्वास', te: 'AI విశ్వాసం', bn: 'AI আত্মবিশ্বাস' },
  metricsTitle: { en: 'Training Metrics', hi: 'प्रशिक्षण मेट्रिक्स', kn: 'ತರಬೇತಿ ಮೆಟ್ರಿಕ್ಸ್', ml: 'ട്രെയിനിംഗ് മെട്രിക്സ്', ta: 'பயிற்சி அளவீடுகள்', mr: 'प्रशिक्षण मेट्रिक्स', te: 'శిక్షణ కొలతలు', bn: 'প্রশিক্ষণ মেট্রিক্স' },
  performanceStats: { en: 'Validated performance across 10 distinct epochs', hi: '10 अलग-अलग युगों में प्रमाणित प्रदर्शन', kn: '10 ವಿಭಿನ್ನ ಯುಗಗಳಲ್ಲಿ ಪ್ರಮಾಣೀಕೃತ ಕಾರ್ಯಕ್ಷಮತೆ', ml: '10 വ്യത്യസ്ത യുഗങ്ങളിൽ സാക്ഷ്യപ്പെടുത്തിയ പ്രകടനം', ta: '10 வெவ்வேறு காலகட்டங்களில் சரிபார்க்கப்பட்ட செயல்திறன்', mr: '10 भिन्न युगांमध्ये प्रमाणित कामगिरी', te: '10 విభిన్న యుగాలలో ధృవీకరించబడిన పనితీరు', bn: '১০টি ভিন্ন যুগের মধ্যে প্রমাণিত কর্মক্ষমতা' },
  maxF1: { en: 'Max F1', hi: 'अधिकतम F1', kn: 'ಗರಿಷ್ಠ F1', ml: 'മാക്സ് F1', ta: 'அதிகபட்ச F1', mr: 'कमाल F1', te: 'గరిష్ట F1', bn: 'সর্বোচ্চ F1' },
  precisionLabel: { en: 'Precision', hi: 'परिशुद्धता', kn: 'ನಿಖರತೆ', ml: 'പ്രിസിഷൻ', ta: 'துல்லியம்', mr: 'अचूकता', te: 'సున్నితత్వం', bn: 'নির্ভুলতা' },
  recallLabel: { en: 'Recall', hi: 'रिकॉल', kn: 'ರಿಕಾಲ', ml: 'റീകോൾ', ta: 'மீட்டெடுப்பு', mr: 'रिकॉल', te: 'రీకాల్', bn: 'রিকল' },
  f1ScoreLabel: { en: 'F1 Score', hi: 'F1 स्कोर', kn: 'F1 ಸ್ಕೋರ್', ml: 'F1 ಸ್കോർ', ta: 'F1 மதிப்பெண்', mr: 'F1 स्कोअर', te: 'F1 స్కోరు', bn: 'F1 স্কোর' },
  steps: { en: 'steps', hi: 'चरण', kn: 'ಹಂತಗಳು', ml: 'ഘട്ടങ്ങൾ', ta: 'படிகள்', mr: 'टप्पे', te: 'దశలు', bn: 'ধাপ' },
  dashboard: { en: 'Intelligence Dashboard', hi: 'इंटेलिजेंस डैशबोर्ड', kn: 'ಇಂಟೆಲಿಜೆನ್ಸ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ml: 'ഇന്റലിജൻസ് ഡാഷ്ബോർഡ്', ta: 'புலனாய்வு டாஷ்போர்டு', mr: 'इंटेलिजेंस डॅशबोर्ड', te: 'ఇంటెలిజెన్స్ డాష్‌బోర్డ్', bn: 'ইন্টেলিজেন্স ড্যাশবোর্ড' },
  dataPrecision: { en: 'Data precision', hi: 'डेटा परिशुद्धता', kn: 'ಡೇಟಾ ನಿಖರತೆ', ml: 'ഡാറ്റ പ്രസിഷൻ', ta: 'தரவு துல்லியம்', mr: 'डेटा अचूकता', te: 'డేటా సున్నితత్వం', bn: 'ডেটা নির্ভুলতা' },
  noDetails: { en: 'No details available', hi: 'कोई विवरण उपलब्ध नहीं है', kn: 'ಯಾವುದೇ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ', ml: 'വിവരങ്ങൾ ലഭ്യമല്ല', ta: 'விவரங்கள் எதுவும் கிடைக்கவில்லை', mr: 'तपशील उपलब्ध नाहीत', te: 'వివరాలు అందుబాటులో లేవు', bn: 'কোন বিবরণ উপলব্ধ নেই' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('farmerMitraLang');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('farmerMitraLang', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
