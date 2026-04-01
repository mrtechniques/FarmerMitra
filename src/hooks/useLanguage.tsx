import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'kn' | 'ml';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

export const translations: Translations = {
  // Navbar
  home: { en: 'Home', hi: 'होम', kn: 'ಮನೆ', ml: 'ഹോം' },
  scan: { en: 'Scan', hi: 'स्कैन', kn: 'ಸ್ಕ್ಯಾನ್', ml: 'സ്കാൻ' },
  history: { en: 'History', hi: 'इतिहास', kn: 'ಇತಿಹಾಸ', ml: 'ചരിത്രം' },
  agent: { en: 'Agent', hi: 'एजेंट', kn: 'ಏಜೆಂಟ್', ml: 'ഏജന്റ്' },
  
  // Home Page
  tagline: { en: 'Smart Farming Assistant', hi: 'स्मार्ट खेती सहायक', kn: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ', ml: 'സ്മാർട്ട് ഫാമിംഗ് അസിസ്റ്റന്റ്' },
  heroTitle: { en: 'Keep Your Crops Healthy & Strong', hi: 'अपनी फसलों को स्वस्थ और मजबूत रखें', kn: 'ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಆರೋಗ್ಯಕರವಾಗಿ ಮತ್ತು ಬಲವಾಗಿಡಿ', ml: 'നിങ്ങളുടെ വിളകളെ ആരോഗ്യകരവും ശക്തവുമായി നിലനിർത്തുക' },
  heroSub: { en: 'Identify plant diseases instantly with Farmer Mitra. Just snap a photo and get expert recovery insights.', hi: 'Farmer Mitra के साथ तुरंत पौधों की बीमारियों की पहचान करें। बस एक फोटो लें और विशेषज्ञ रिकवरी अंतर्दृष्टि प्राप्त करें।', kn: 'Farmer Mitra ನೊಂದಿಗೆ ಸಸ್ಯ ರೋಗಗಳನ್ನು ತಕ್ಷಣವೇ ಗುರುತಿಸಿ. ಕೇವಲ ಫೋಟೋ ತೆಗೆಯಿರಿ ಮತ್ತು ತಜ್ಞರ ಚೇತರಿಕೆಯ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ.', ml: 'Farmer Mitra ഉപയോഗിച്ച് സസ്യരോഗങ്ങൾ തൽക്ഷണം തിരിച്ചറിയുക. ഒരു ഫോട്ടോ എടുത്ത് വിദഗ്ദ്ധ വീണ്ടെടുക്കൽ സ്ഥിതിവിവരക്കണക്കുകൾ നേടുക.' },
  startScan: { en: 'Start Leaf Scan', hi: 'लीफ स्कैन शुरू करें', kn: 'ಎಲೆ ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ', ml: 'ലീഫ് സ്കാൻ ആരംഭിക്കുക' },
  whyTitle: { en: 'Why Farmer Mitra?', hi: 'Farmer Mitra क्यों?', kn: 'Farmer Mitra ಏಕೆ?', ml: 'എന്തുകൊണ്ട് Farmer Mitra?' },
  whySub: { en: 'We combine agricultural expertise with cutting-edge technology to help you grow better.', hi: 'हम आपको बेहतर विकसित करने में मदद करने के लिए अत्याधुनिक तकनीक के साथ कृषि विशेषज्ञता को जोड़ते हैं।', kn: 'ನಿಮಗೆ ಉತ್ತಮವಾಗಿ ಬೆಳೆಯಲು ಸಹಾಯ ಮಾಡಲು ನಾವು ಕೃಷಿ ಪರಿಣತಿಯನ್ನು ಅತ್ಯಾಧುನಿಕ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತೇವೆ.', ml: 'മികച്ച രീതിയിൽ വളരാൻ നിങ്ങളെ സഹായിക്കുന്നതിന് ഞങ്ങൾ കാർഷിക വൈദഗ്ധ്യവും അത്യാധുനിക സാങ്കേതികവിദ്യയും സംയോജിപ്പിക്കുന്നു.' },
  feat1Title: { en: 'Instant Detection', hi: 'त्वरित पहचान', kn: 'ತತ್ಕ್ಷಣ ಪತ್ತೆ', ml: 'തൽക്ഷണ കണ്ടെത്തൽ' },
  feat1Sub: { en: 'Upload a photo and get results in seconds using advanced AI.', hi: 'उन्नत AI का उपयोग करके फोटो अपलोड करें और सेकंड में परिणाम प्राप्त करें।', kn: 'ಸುಧಾರಿತ AI ಬಳಸಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಫಲಿತಾಂಶಗಳನ್ನು ಪಡೆಯಿರಿ.', ml: 'നൂതന AI ഉപയോഗിച്ച് ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് നിമിഷങ്ങൾക്കുള്ളിൽ ഫലങ്ങൾ നേടുക.' },
  feat2Title: { en: 'Expert Remedies', hi: 'विशेषज्ञ उपचार', kn: 'ತಜ್ಞರ ಪರಿಹಾರಗಳು', ml: 'വിദഗ്ദ്ധ പരിഹാരങ്ങൾ' },
  feat2Sub: { en: 'Get verified recovery steps and organic/chemical solutions.', hi: 'सत्यापित रिकवरी चरण और जैविक/रासायनिक समाधान प्राप्त करें।', kn: 'ಪರಿಶೀಲಿಸಿದ ಚೇತರಿಕೆಯ ಹಂತಗಳು ಮತ್ತು ಸಾವಯವ/ರಾಸಾಯನಿಕ ಪರಿಹಾರಗಳನ್ನು ಪಡೆಯಿರಿ.', ml: 'പരിശോധിച്ച വീണ്ടെടുക്കൽ ഘട്ടങ്ങളും ജൈവ/രാസ പരിഹാരങ്ങളും നേടുക.' },
  feat3Title: { en: 'Track Progress', hi: 'प्रगति ट्रैक करें', kn: 'ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', ml: 'പുരോഗതി ട്രാക്ക് ചെയ്യുക' },
  feat3Sub: { en: 'Keep a history of your crop health and monitor recovery over time.', hi: 'अपने फसल स्वास्थ्य का इतिहास रखें और समय के साथ रिकवरी की निगरानी करें।', kn: 'ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯದ ಇತಿಹಾಸವನ್ನು ಇರಿಸಿ ಮತ್ತು ಕಾಲಾನಂತರದಲ್ಲಿ ಚೇತರಿಕೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.', ml: 'നിങ്ങളുടെ വിള ആരോഗ്യത്തിന്റെ ചരിത്രം സൂക്ഷിക്കുകയും കാലക്രമേണ വീണ്ടെടുക്കൽ നിരീക്ഷിക്കുകയും ചെയ്യുക.' },
  needAdvice: { en: 'Need expert advice?', hi: 'विशेषज्ञ की सलाह चाहिए?', kn: 'ತಜ್ಞರ ಸಲಹೆ ಬೇಕೇ?', ml: 'വിദഗ്ദ്ധോപദേശം വേണോ?' },
  adviceSub: { en: 'Our AI Agent is available 24/7 to answer your farming queries and provide detailed crop care tips.', hi: 'हमारा AI एजेंट आपके खेती के सवालों के जवाब देने और विस्तृत फसल देखभाल सुझाव प्रदान करने के लिए 24/7 उपलब्ध है।', kn: 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲು ಮತ್ತು ವಿವರವಾದ ಬೆಳೆ ಆರೈಕೆ ಸಲಹೆಗಳನ್ನು ನೀಡಲು ನಮ್ಮ AI ಏಜೆಂಟ್ 24/7 ಲಭ್ಯವಿದೆ.', ml: 'നിങ്ങളുടെ കൃഷി സംബന്ധമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാനും വിശദമായ വിള സംരക്ഷണ നുറുങ്ങുകൾ നൽകാനും ഞങ്ങളുടെ AI ഏജന്റ് 24/7 ലഭ്യമാണ്.' },
  chatAgent: { en: 'Chat with Agent', hi: 'एजेंट के साथ चैट करें', kn: 'ಏಜೆಂಟ್ ಜೊತೆ ಚಾಟ್ ಮಾಡಿ', ml: 'ഏജന്റുമായി ചാറ്റ് ചെയ്യുക' },

  // Scan Page
  scanTitle: { en: 'Scan Your Crop', hi: 'अपनी फसल को स्कैन करें', kn: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', ml: 'നിങ്ങളുടെ വിള സ്കാൻ ചെയ്യുക' },
  scanSub: { en: 'Upload a clear photo of the affected leaf for accurate detection.', hi: 'सटीक पहचान के लिए प्रभावित पत्ती का स्पष्ट फोटो अपलोड करें।', kn: 'ನಿಖರವಾದ ಪತ್ತೆಗಾಗಿ ಪೀಡಿತ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.', ml: 'കൃത്യമായ കണ്ടെത്തലിനായി ബാധിച്ച ഇലയുടെ വ്യക്തമായ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.' },
  dropImage: { en: 'Drop your image here', hi: 'अपनी छवि यहाँ छोड़ें', kn: 'ನಿಮ್ಮ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಬಿಡಿ', ml: 'നിങ്ങളുടെ ചിത്രം ഇവിടെ ഇടുക' },
  chooseFile: { en: 'Choose File', hi: 'फ़ाइल चुनें', kn: 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ', ml: 'ഫയൽ തിരഞ്ഞെടുക്കുക' },
  useCamera: { en: 'Use Camera', hi: 'कैमरे का उपयोग करें', kn: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ', ml: 'ക്യാമറ ഉപയോഗിക്കുക' },
  analyzing: { en: 'Analyzing Crop Health...', hi: 'फसल स्वास्थ्य का विश्लेषण किया जा रहा है...', kn: 'ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', ml: 'വിളയുടെ ആരോഗ്യം വിശകലനം ചെയ്യുന്നു...' },
  analyzeBtn: { en: 'Analyze Leaf Health', hi: 'पत्ती के स्वास्थ्य का विश्लेषण करें', kn: 'ಎಲೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಿ', ml: 'ഇലയുടെ ആരോഗ്യം വിശകലനം ചെയ്യുക' },
  tipsTitle: { en: 'Tips for better results:', hi: 'बेहतर परिणामों के लिए सुझाव:', kn: 'ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ ಸಲಹೆಗಳು:', ml: 'മികച്ച ഫലങ്ങൾക്കായുള്ള നുറുങ്ങുകൾ:' },
  tip1: { en: 'Ensure good lighting (natural sunlight is best)', hi: 'अच्छी रोशनी सुनिश्चित करें (प्राकृतिक धूप सबसे अच्छी है)', kn: 'ಉತ್ತಮ ಬೆಳಕನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ (ನೈಸರ್ಗಿಕ ಸೂರ್ಯನ ಬೆಳಕು ಉತ್ತಮವಾಗಿದೆ)', ml: 'നല്ല വെളിച്ചം ഉറപ്പാക്കുക (സ്വാഭാവിക സൂര്യപ്രകാശമാണ് നല്ലത്)' },
  tip2: { en: 'Focus on the affected part of the leaf', hi: 'पत्ती के प्रभावित हिस्से पर ध्यान दें', kn: 'ಎಲೆಯ ಪೀಡಿತ ಭಾಗದ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ', ml: 'ഇലയുടെ ബാധിച്ച ഭാഗത്ത് ശ്രദ്ധ കേന്ദ്രീകരിക്കുക' },
  tip3: { en: 'Avoid blurry or dark images', hi: 'धुंधली या अंधेरी छवियों से बचें', kn: 'ಮಸುಕಾದ ಅಥವಾ ಗಾಢವಾದ ಚಿತ್ರಗಳನ್ನು ತಪ್ಪಿಸಿ', ml: 'മങ്ങിയതോ ഇരുണ്ടതോ ആയ ചിത്രങ്ങൾ ഒഴിവാക്കുക' },
  tip4: { en: 'Place the leaf on a plain background if possible', hi: 'यदि संभव हो तो पत्ती को सादे पृष्ठभूमि पर रखें', kn: 'ಸಾಧ್ಯವಾದರೆ ಎಲೆಯನ್ನು ಸರಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಇರಿಸಿ', ml: 'സാധ്യമാണെങ്കിൽ ഇല ഒരു പ്ലെയിൻ പശ്ചാത്തലത്തിൽ വയ്ക്കുക' },
  supportsFormat: { en: 'Supports JPG, PNG up to 10MB', hi: '10MB तक JPG, PNG का समर्थन करता है', kn: '10MB ವರೆಗಿನ JPG, PNG ಬೆಂಬಲಿಸುತ್ತದೆ', ml: '10MB വരെയുള്ള JPG, PNG പിന്തുണയ്ക്കുന്നു' },
  capturingLocation: { en: 'Capturing location...', hi: 'स्थान कैप्चर किया जा रहा है...', kn: 'ಸ್ಥಳವನ್ನು ಸೆರೆಹಿಡಿಯಲಾಗುತ್ತಿದೆ...', ml: 'സ്ഥലം പിടിച്ചെടുക്കുന്നു...' },
  locationNotAvailable: { en: 'Location not available', hi: 'स्थान उपलब्ध नहीं है', kn: 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ', ml: 'സ്ഥലം ലഭ്യമല്ല' },

  // Results Page
  backToScan: { en: 'Back to Scan', hi: 'स्कैन पर वापस जाएं', kn: 'ಸ್ಕ್ಯಾನ್‌ಗೆ ಹಿಂತಿರುಗಿ', ml: 'തിരികെ സ്കാനിലേക്ക്' },
  confidence: { en: 'Confidence Score', hi: 'आत्मविश्वास स्कोर', kn: 'ಆತ್ಮವಿಶ್ವಾಸದ ಸ್ಕೋರ್', ml: 'കോൺഫിഡൻസ് സ്കോർ' },
  confSub: { en: 'Our AI is highly confident in this diagnosis.', hi: 'हमारा AI इस निदान में अत्यधिक आश्वस्त है।', kn: 'ನಮ್ಮ AI ಈ ರೋಗನಿರ್ಣಯದಲ್ಲಿ ಹೆಚ್ಚಿನ ವಿಶ್ವಾಸವನ್ನು ಹೊಂದಿದೆ.', ml: 'ഈ രോഗനിർണ്ണയത്തിൽ ഞങ്ങളുടെ AI-ക്ക് വലിയ ആത്മവിശ്വാസമുണ്ട്.' },
  diseaseDetected: { en: 'Disease Detected', hi: 'बीमारी का पता चला', kn: 'ರೋಗ ಪತ್ತೆಯಾಗಿದೆ', ml: 'രോഗം കണ്ടെത്തി' },
  diagDetails: { en: 'Diagnosis Details', hi: 'निदान विवरण', kn: 'ರೋಗನಿರ್ಣಯದ ವಿವರಗಳು', ml: 'രോഗനിർണ്ണയ വിവരങ്ങൾ' },
  expRecovery: { en: 'Expected Recovery', hi: 'अपेक्षित रिकवरी', kn: 'ನಿರೀಕ್ಷಿತ ಚೇತರಿಕೆ', ml: 'പ്രതീക്ഷിക്കുന്ന വീണ്ടെടുക്കൽ' },
  recoveryIn: { en: 'With proper care, your crop should recover in', hi: 'उचित देखभाल के साथ, आपकी फसल इतने समय में ठीक हो जानी चाहिए', kn: 'ಸರಿಯಾದ ಕಾಳಜಿಯೊಂದಿಗೆ, ನಿಮ್ಮ ಬೆಳೆಯು ಇಷ್ಟು ಸಮಯದಲ್ಲಿ ಚೇತರಿಸಿಕೊಳ್ಳಬೇಕು', ml: 'ശരിയായ പരിചരണത്തോടെ, നിങ്ങളുടെ വിള ഇത്രയും സമയത്തിനുള്ളിൽ വീണ്ടെടുക്കും' },
  recRemedies: { en: 'Recommended Remedies', hi: 'अनुशंसित उपचार', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಪರಿಹಾರಗಳು', ml: 'ശുപാർശ ചെയ്യുന്ന പരിഹാരങ്ങൾ' },
  saveHistory: { en: 'Save to History', hi: 'इतिहास में सहेजें', kn: 'ಇತಿಹಾಸಕ್ಕೆ ಉಳಿಸಿ', ml: 'ചരിത്രത്തിലേക്ക് സേവ് ചെയ്യുക' },
  askHelp: { en: 'Ask Agent for Help', hi: 'मदद के लिए एजेंट से पूछें', kn: 'ಸಹಾಯಕ್ಕಾಗಿ ಏಜೆಂಟ್ ಅನ್ನು ಕೇಳಿ', ml: 'സഹായത്തിനായി ഏജന്റിനോട് ചോദിക്കുക' },

  // History Page
  historyTitle: { en: 'Scan History', hi: 'स्कैन इतिहास', kn: 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ', ml: 'സ്കാൻ ചരിത്രം' },
  historySub: { en: 'Monitor your crop health over time.', hi: 'समय के साथ अपनी फसल के स्वास्थ्य की निगरानी करें।', kn: 'ಕಾಲಾನಂತರದಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.', ml: 'കാലക്രമേണ നിങ്ങളുടെ വിളയുടെ ആരോഗ്യം നിരീക്ഷിക്കുക.' },
  searchCrops: { en: 'Search crops...', hi: 'फसलें खोजें...', kn: 'ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...', ml: 'വിളകൾ തിരയുക...' },
  noScans: { en: 'No scans yet', hi: 'अभी तक कोई स्कैन नहीं', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ', ml: 'സ്കാനുകളൊന്നുമില്ല' },
  noScansSub: { en: 'Your crop health history will appear here once you start scanning.', hi: 'एक बार जब आप स्कैन करना शुरू कर देंगे तो आपकी फसल स्वास्थ्य इतिहास यहाँ दिखाई देगा।', kn: 'ಒಮ್ಮೆ ನೀವು ಸ್ಕ್ಯಾನಿಂಗ್ ಪ್ರಾರಂಭಿಸಿದರೆ ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯ ಇತಿಹಾಸ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.', ml: 'നിങ്ങൾ സ്കാനിംഗ് ആരംഭിച്ചുകഴിഞ്ഞാൽ നിങ്ങളുടെ വിള ആരോഗ്യ ചരിത്രം ഇവിടെ ദൃശ്യമാകും.' },
  firstScan: { en: 'Perform First Scan', hi: 'पहला स्कैन करें', kn: 'ಮೊದಲ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', ml: 'ആദ്യ സ്കാൻ ചെയ്യുക' },
  healthy: { en: 'Healthy', hi: 'स्वस्थ', kn: 'ಆರೋಗ್ಯಕರ', ml: 'ആരോഗ്യമുള്ളത്' },
  diseased: { en: 'Diseased', hi: 'बीमार', kn: 'ರೋಗಗ್ರಸ್ತ', ml: 'രോഗം ബാധിച്ചത്' },

  // Agent Page
  agentTitle: { en: 'Farmer Mitra AI', hi: 'Farmer Mitra AI', kn: 'Farmer Mitra AI', ml: 'Farmer Mitra AI' },
  online: { en: 'Online', hi: 'ऑनलाइन', kn: 'ಆನ್‌ಲೈನ್', ml: 'ഓൺലൈൻ' },
  askAnything: { en: 'Ask anything about your crops...', hi: 'अपनी फसलों के बारे में कुछ भी पूछें...', kn: 'ನಿಮ್ಮ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...', ml: 'നിങ്ങളുടെ വിളകളെക്കുറിച്ച് എന്തും ചോദിക്കുക...' },
  botWelcome: { en: "Hello! I'm Farmer Mitra AI. How can I help you with your crops today?", hi: "नमस्ते! मैं Farmer Mitra AI हूँ। आज मैं आपकी फसलों में आपकी कैसे मदद कर सकता हूँ?", kn: "ನಮಸ್ಕಾರ! ನಾನು Farmer Mitra AI. ಇಂದು ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?", ml: "ഹലോ! ഞാൻ Farmer Mitra AI ആണ്. ഇന്ന് നിങ്ങളുടെ വിളകളുടെ കാര്യത്തിൽ എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?" },

  // Shop
  shop: { en: 'Shop', hi: 'दुकान', kn: 'ಅಂಗಡಿ', ml: 'ഷോപ്പ്' },
  cart: { en: 'Cart', hi: 'कार्ट', kn: 'ಕಾರ್ಟ್', ml: 'കാർട്ട്' },
  featured: { en: 'Featured Plants', hi: 'विशेष पौधे', kn: 'ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಸಸ್ಯಗಳು', ml: 'തിരഞ്ഞെടുത്ത ചെടികൾ' },
  addToCart: { en: 'Add to Cart', hi: 'कार्ट में जोड़ें', kn: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ', ml: 'കാർട്ടിലേക്ക് ചേർക്കുക' },
  price: { en: 'Price', hi: 'कीमत', kn: 'ಬೆಲೆ', ml: 'വില' },
  categories: { en: 'Categories', hi: 'श्रेणियां', kn: 'ವರ್ಗಗಳು', ml: 'വിഭാഗങ്ങൾ' },
  all: { en: 'All', hi: 'सभी', kn: 'ಎಲ್ಲಾ', ml: 'എല്ലാം' },
  indoor: { en: 'Indoor', hi: 'इनडोर', kn: 'ಒಳಾಂಗಣ', ml: 'ഇൻഡോർ' },
  outdoor: { en: 'Outdoor', hi: 'आउटडोर', kn: 'ಹೊರಾಂಗಣ', ml: 'ഔട്ട്ഡോർ' },
  succulents: { en: 'Succulents', hi: 'सकुलेंट्स', kn: 'ಸಕ್ಯುಲೆಂಟ್ಸ್', ml: 'സക്കുലന്റുകൾ' },
  ecoLifestyle: { en: 'Eco-Lifestyle', hi: 'इको-लाइफस्टाइल', kn: 'ಇಕೋ-ಲೈಫ್‌ಸ್ಟೈಲ್', ml: 'ഇക്കോ-ലൈഫ്സ്റ്റൈൽ' },
  premiumQuality: { en: 'Premium Quality', hi: 'प्रीमियम गुणवत्ता', kn: 'ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟ', ml: 'പ്രീമിയം ക്വാളിറ്റി' },
  shopNow: { en: 'Shop Now', hi: 'अभी खरीदें', kn: 'ಈಗ ಖರೀದಿಸಿ', ml: 'ഇപ്പോൾ വാങ്ങുക' },
  checkout: { en: 'Checkout', hi: 'चेकआउट', kn: 'ಚೆಕ್ಔಟ್', ml: 'ചെക്ക്ഔട്ട്' },
  total: { en: 'Total', hi: 'कुल', kn: 'ಒಟ್ಟು', ml: 'ആകെ' },
  emptyCart: { en: 'Your cart is empty', hi: 'आपकी कार्ट खाली है', kn: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಿದೆ', ml: 'നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്' },
  
  // Footer
  footerDesc: { en: 'Empowering farmers with smart technology for healthier crops and better yields.', hi: 'स्वस्थ फसलों और बेहतर पैदावार के लिए स्मार्ट तकनीक के साथ किसानों को सशक्त बनाना।', kn: 'ಆರೋಗ್ಯಕರ ಬೆಳೆಗಳು ಮತ್ತು ಉತ್ತಮ ಇಳುವರಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ರೈತರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.', ml: 'ആരോഗ്യകരമായ വിളകൾക്കും മികച്ച വിളവിനും വേണ്ടി സ്മാർട്ട് സാങ്കേതികവിദ്യ ഉപയോഗിച്ച് കർഷകരെ ശാക്തീകരിക്കുന്നു.' },
  quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक', kn: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು', ml: 'ദ്രുത ലിങ്കുകൾ' },
  aboutUs: { en: 'About Us', hi: 'हमारे बारे में', kn: 'ನಮ್ಮ ಬಗ್ಗೆ', ml: 'ഞങ്ങളെക്കുറിച്ച്' },
  howItWorks: { en: 'How it Works', hi: 'यह कैसे काम करता है', kn: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', ml: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു' },
  privacy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', kn: 'ಗೌಪ್ಯತಾ ನೀತಿ', ml: 'സ്വകാര്യതാ നയം' },
  contact: { en: 'Contact Support', hi: 'संपर्क सहायता', kn: 'ಸಂಪರ್ಕ ಬೆಂಬಲ', ml: 'ബന്ധപ്പെടുക' },
  rights: { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।', kn: 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.', ml: 'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.' },
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
