/**
 * Official Administrative Divisions of Nepal (नेपालको प्रशासनिक विभाजन)
 * Source: Ministry of Federal Affairs and General Administration (MoFAGA) & Survey Department of Nepal
 * Structure: Province -> District -> Local Level (Metropolitan / Sub-Metropolitan / Municipality / Rural Municipality) -> Wards
 */

export interface LocalLevel {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  type: 'महानगरपालिका' | 'उपमहानगरपालिका' | 'नगरपालिका' | 'गाउँपालिका';
  totalWards: number;
}

export interface District {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  localLevels: LocalLevel[];
}

export interface Province {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  districts: District[];
}

export const NEPAL_ADMINISTRATIVE_DATA: Province[] = [
  {
    id: "province-1",
    nameNepali: "कोशी प्रदेश (Koshi)",
    nameEnglish: "Koshi Province",
    districts: [
      {
        id: "morang",
        nameNepali: "मोरङ",
        nameEnglish: "Morang",
        localLevels: [
          { id: "biratnagar-metro", nameNepali: "विराटनगर महानगरपालिका", nameEnglish: "Biratnagar Metropolitan", type: "महानगरपालिका", totalWards: 19 },
          { id: "urlabari-mun", nameNepali: "उर्लाबारी नगरपालिका", nameEnglish: "Urlabari Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "belbari-mun", nameNepali: "बेलबारी नगरपालिका", nameEnglish: "Belbari Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "sundarharaicha-mun", nameNepali: "सुन्दरहरैंचा नगरपालिका", nameEnglish: "Sundarharaicha Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "patharishanishchare-mun", nameNepali: "पथरीशनिश्चरे नगरपालिका", nameEnglish: "Patharishanishchare Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "rangeli-mun", nameNepali: "रंगेली नगरपालिका", nameEnglish: "Rangeli Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "ratuwamai-mun", nameNepali: "रतुवामाई नगरपालिका", nameEnglish: "Ratuwamai Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "sunwarshahi-mun", nameNepali: "सुनवर्षि नगरपालिका", nameEnglish: "Sunwarshahi Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "letang-mun", nameNepali: "लेटाङ नगरपालिका", nameEnglish: "Letang Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "katahari-rural", nameNepali: "कटहरी गाउँपालिका", nameEnglish: "Katahari Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "kerabari-rural", nameNepali: "केराबारी गाउँपालिका", nameEnglish: "Kerabari Rural Municipality", type: "गाउँपालिका", totalWards: 10 },
          { id: "jahada-rural", nameNepali: "जहदा गाउँपालिका", nameEnglish: "Jahada Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "gramthan-rural", nameNepali: "ग्रामथान गाउँपालिका", nameEnglish: "Gramthan Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "dhanpalthan-rural", nameNepali: "धनपालथान गाउँपालिका", nameEnglish: "Dhanpalthan Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "budhiganga-rural", nameNepali: "बूढीगङ्गा गाउँपालिका", nameEnglish: "Budhiganga Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "mikanlajung-rural", nameNepali: "मिक्लाजुङ गाउँपालिका", nameEnglish: "Miklajung Rural Municipality", type: "गाउँपालिका", totalWards: 9 },
          { id: "kanepokhari-rural", nameNepali: "कानेपोखरी गाउँपालिका", nameEnglish: "Kanepokhari Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
        ]
      },
      {
        id: "jhapa",
        nameNepali: "झापा",
        nameEnglish: "Jhapa",
        localLevels: [
          { id: "damak-mun", nameNepali: "दशक नगरपालिका", nameEnglish: "Damak Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "birtamod-mun", nameNepali: "बिर्तामोड नगरपालिका", nameEnglish: "Birtamod Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "bhadrapur-mun", nameNepali: "भद्रपुर नगरपालिका", nameEnglish: "Bhadrapur Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "mechinagar-mun", nameNepali: "मेचीनगर नगरपालिका", nameEnglish: "Mechinagar Municipality", type: "नगरपालिका", totalWards: 15 },
          { id: "arjundhara-mun", nameNepali: "अर्जुनधारा नगरपालिका", nameEnglish: "Arjundhara Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "kanakai-mun", nameNepali: "कन्काई नगरपालिका", nameEnglish: "Kankai Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "shivasatakshi-mun", nameNepali: "शिवसताक्षी नगरपालिका", nameEnglish: "Shivasatakshi Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "gauradaha-mun", nameNepali: "गौरादह नगरपालिका", nameEnglish: "Gauradaha Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "kamal-rural", nameNepali: "कमल गाउँपालिका", nameEnglish: "Kamal Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "jhapa-rural", nameNepali: "झापा गाउँपालिका", nameEnglish: "Jhapa Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "barhadashi-rural", nameNepali: "बाह्रदशी गाउँपालिका", nameEnglish: "Barhadashi Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "kachankawal-rural", nameNepali: "कचनकवल गाउँपालिका", nameEnglish: "Kachankawal Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "haldibari-rural", nameNepali: "हल्दीबारी गाउँपालिका", nameEnglish: "Haldibari Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "buddhashanti-rural", nameNepali: "बुद्धशान्ति गाउँपालिका", nameEnglish: "Buddhashanti Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "gauriganj-rural", nameNepali: "गौरीगञ्ज गाउँपालिका", nameEnglish: "Gauriganj Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
        ]
      },
      {
        id: "sunsari",
        nameNepali: "सुनसरी",
        nameEnglish: "Sunsari",
        localLevels: [
          { id: "dharan-submetro", nameNepali: "धरान उपमहानगरपालिका", nameEnglish: "Dharan Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 20 },
          { id: "itahari-submetro", nameNepali: "इटहरी उपमहानगरपालिका", nameEnglish: "Itahari Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 20 },
          { id: "inaruwa-mun", nameNepali: "इनरुवा नगरपालिका", nameEnglish: "Inaruwa Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "duhabi-mun", nameNepali: "दुहबी नगरपालिका", nameEnglish: "Duhabi Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "ramdhuni-mun", nameNepali: "रामधुनी नगरपालिका", nameEnglish: "Ramdhuni Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "barahakshetra-mun", nameNepali: "बराहक्षेत्र नगरपालिका", nameEnglish: "Barahakshetra Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "dewanganj-rural", nameNepali: "देवानगञ्ज गाउँपालिका", nameEnglish: "Dewanganj Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "koshi-rural", nameNepali: "कोशी गाउँपालिका", nameEnglish: "Koshi Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "gadhi-rural", nameNepali: "गढी गाउँपालिका", nameEnglish: "Gadhi Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "barju-rural", nameNepali: "बर्जु गाउँपालिका", nameEnglish: "Barju Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "bhokrahanarsingh-rural", nameNepali: "भोक्राहा नरसिंह गाउँपालिका", nameEnglish: "Bhokraha Narsingh Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "harinagar-rural", nameNepali: "हरिनगर गाउँपालिका", nameEnglish: "Harinagar Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
        ]
      },
      {
        id: "dhankuta",
        nameNepali: "धनकुटा",
        nameEnglish: "Dhankuta",
        localLevels: [
          { id: "dhankuta-mun", nameNepali: "धनकुटा नगरपालिका", nameEnglish: "Dhankuta Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "pakhribas-mun", nameNepali: "पाख्रीबास नगरपालिका", nameEnglish: "Pakhribas Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "mahalaxmi-mun", nameNepali: "महालक्ष्मी नगरपालिका", nameEnglish: "Mahalaxmi Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "sangurigadhi-rural", nameNepali: "साँगुरीगढी गाउँपालिका", nameEnglish: "Sangurigadhi Rural Municipality", type: "गाउँपालिका", totalWards: 10 },
          { id: "khalsa-rural", nameNepali: "सहिदभूमि गाउँपालिका", nameEnglish: "Shahidbhumi Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "chhathar-jorpati-rural", nameNepali: "छथर जोरपाटी गाउँपालिका", nameEnglish: "Chhathar Jorpati Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "chaubise-rural", nameNepali: "चौबिसे गाउँपालिका", nameEnglish: "Chaubise Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
        ]
      },
      {
        id: "udayapur",
        nameNepali: "उदयपुर",
        nameEnglish: "Udayapur",
        localLevels: [
          { id: "triyuga-mun", nameNepali: "त्रियुगा नगरपालिका", nameEnglish: "Triyuga Municipality", type: "नगरपालिका", totalWards: 16 },
          { id: "katari-mun", nameNepali: "कटारी नगरपालिका", nameEnglish: "Katari Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "chaudandigadhi-mun", nameNepali: "चौदण्डीगढी नगरपालिका", nameEnglish: "Chaudandigadhi Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "belaka-mun", nameNepali: "बेलका नगरपालिका", nameEnglish: "Belaka Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "udayapurgadhi-rural", nameNepali: "उदयपुरगढी गाउँपालिका", nameEnglish: "Udayapurgadhi Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "tapli-rural", nameNepali: "ताप्ली गाउँपालिका", nameEnglish: "Tapli Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "rautamai-rural", nameNepali: "रौतामाई गाउँपालिका", nameEnglish: "Rautamai Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "limchungbung-rural", nameNepali: "लिम्चुङबुङ गाउँपालिका", nameEnglish: "Limchungbung Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
        ]
      },
      {
        id: "okhaldhunga",
        nameNepali: "ओखलढुङ्गा",
        nameEnglish: "Okhaldhunga",
        localLevels: [
          { id: "siddhicharan-mun", nameNepali: "सिद्धिचरण नगरपालिका", nameEnglish: "Siddhicharan Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "khijidemba-rural", nameNepali: "खिजिदेम्बा गाउँपालिका", nameEnglish: "Khijidemba Rural Municipality", type: "गाउँपालिका", totalWards: 9 },
          { id: "champadevi-rural", nameNepali: "चम्पादेवी गाउँपालिका", nameEnglish: "Champadevi Rural Municipality", type: "गाउँपालिका", totalWards: 10 },
          { id: "chisankhugadhi-rural", nameNepali: "चिशंखुगढी गाउँपालिका", nameEnglish: "Chisankhugadhi Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "manebhanjyang-rural", nameNepali: "मानेभञ्ज्याङ गाउँपालिका", nameEnglish: "Manebhanjyang Rural Municipality", type: "गाउँपालिका", totalWards: 9 },
          { id: "molung-rural", nameNepali: "मोलुङ गाउँपालिका", nameEnglish: "Molung Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "likhu-rural", nameNepali: "लिखु गाउँपालिका", nameEnglish: "Likhu Rural Municipality", type: "गाउँपालिका", totalWards: 9 },
          { id: "sunkoshi-rural", nameNepali: "सुनकोशी गाउँपालिका", nameEnglish: "Sunkoshi Rural Municipality", type: "गाउँपालिका", totalWards: 10 },
        ]
      },
      {
        id: "ilam",
        nameNepali: "इलाम",
        nameEnglish: "Ilam",
        localLevels: [
          { id: "ilam-mun", nameNepali: "इलाम नगरपालिका", nameEnglish: "Ilam Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "suryodaya-mun", nameNepali: "सूर्योदय नगरपालिका", nameEnglish: "Suryodaya Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "deumai-mun", nameNepali: "देउमाई नगरपालिका", nameEnglish: "Deumai Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "mai-mun", nameNepali: "माई नगरपालिका", nameEnglish: "Mai Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "fakphokthum-rural", nameNepali: "फाकफोकथुम गाउँपालिका", nameEnglish: "Phakphokthum Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "mai-jogmai-rural", nameNepali: "माईजोगमाई गाउँपालिका", nameEnglish: "Maijogmai Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "chulachuli-rural", nameNepali: "चुलाचुली गाउँपालिका", nameEnglish: "Chulachuli Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "rong-rural", nameNepali: "रोङ गाउँपालिका", nameEnglish: "Rong Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "mangsebung-rural", nameNepali: "माङसेबुङ गाउँपालिका", nameEnglish: "Mangsebung Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "sandakpur-rural", nameNepali: "सन्दकपुर गाउँपालिका", nameEnglish: "Sandakpur Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
        ]
      },
      {
        id: "panchthar",
        nameNepali: "पाँचथर",
        nameEnglish: "Panchthar",
        localLevels: [
          { id: "phidim-mun", nameNepali: "फिदिम नगरपालिका", nameEnglish: "Phidim Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "phalelung-rural", nameNepali: "फालेलुङ गाउँपालिका", nameEnglish: "Phalelung Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "phalgunanda-rural", nameNepali: "फाल्गुनन्द गाउँपालिका", nameEnglish: "Phalgunanda Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "hilihang-rural", nameNepali: "हिलिहाङ गाउँपालिका", nameEnglish: "Hilihang Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
          { id: "kummayak-rural", nameNepali: "कुम्मायक गाउँपालिका", nameEnglish: "Kummayak Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "tumbewa-rural", nameNepali: "तुम्बेवा गाउँपालिका", nameEnglish: "Tumbewa Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "yangwarak-rural", nameNepali: "याङवरक गाउँपालिका", nameEnglish: "Yangwarak Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "miklajung-p-rural", nameNepali: "मिक्लाजुङ गाउँपालिका", nameEnglish: "Miklajung Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
        ]
      },
      {
        id: "taplejung",
        nameNepali: "ताप्लेजुङ",
        nameEnglish: "Taplejung",
        localLevels: [
          { id: "fungling-mun", nameNepali: "फुङलिङ नगरपालिका", nameEnglish: "Phungling Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "sirijangha-rural", nameNepali: "सिरीजङ्घा गाउँपालिका", nameEnglish: "Sirijangha Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
          { id: "pathibhara-rural", nameNepali: "पाथिभरा याङवरक गाउँपालिका", nameEnglish: "Pathibhara Yangwarak Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
          { id: "meringden-rural", nameNepali: "मेरिङदेन गाउँपालिका", nameEnglish: "Meringden Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
        ]
      },
      {
        id: "bhojpur",
        nameNepali: "भोजपुर",
        nameEnglish: "Bhojpur",
        localLevels: [
          { id: "bhojpur-mun", nameNepali: "भोजपुर नगरपालिका", nameEnglish: "Bhojpur Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "shadananda-mun", nameNepali: "षडानन्द नगरपालिका", nameEnglish: "Shadananda Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "hutuwa-rural", nameNepali: "हतुवागढी गाउँपालिका", nameEnglish: "Hatuwagadhi Rural Municipality", type: "गाउँपालिका", totalWards: 9 },
        ]
      },
      {
        id: "tehrathum",
        nameNepali: "तेह्रथुम",
        nameEnglish: "Tehrathum",
        localLevels: [
          { id: "myanglung-mun", nameNepali: "म्याङलुङ नगरपालिका", nameEnglish: "Myanglung Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "laligurans-mun", nameNepali: "लालीगुराँस नगरपालिका", nameEnglish: "Laligurans Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "aathrai-rural", nameNepali: "आठराई गाउँपालिका", nameEnglish: "Aathrai Rural Municipality", type: "गाउँपालिका", totalWards: 7 },
        ]
      },
      {
        id: "sankhuwasabha",
        nameNepali: "सङ्खुवासभा",
        nameEnglish: "Sankhuwasabha",
        localLevels: [
          { id: "khandbari-mun", nameNepali: "खाँदबारी नगरपालिका", nameEnglish: "Khandbari Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "chainpur-mun", nameNepali: "चैनपुर नगरपालिका", nameEnglish: "Chainpur Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "dharmadevi-mun", nameNepali: "धर्मदेवी नगरपालिका", nameEnglish: "Dharmadevi Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "khotang",
        nameNepali: "खोटाङ",
        nameEnglish: "Khotang",
        localLevels: [
          { id: "diktel-mun", nameNepali: "दिक्तेल रुपाकोट मझुवागढी नगरपालिका", nameEnglish: "Diktel Rupakot Majhuwagadhi", type: "नगरपालिका", totalWards: 15 },
          { id: "halesi-mun", nameNepali: "हलेसी तुवाचुङ नगरपालिका", nameEnglish: "Halesi Tuwachung Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "solukhumbu",
        nameNepali: "सोलुखुम्बु",
        nameEnglish: "Solukhumbu",
        localLevels: [
          { id: "solududhkunda-mun", nameNepali: "सोलुदुधकुण्ड नगरपालिका", nameEnglish: "Solududhkunda Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "khumbupasang-rural", nameNepali: "खुम्बु पासाङल्हामु गाउँपालिका", nameEnglish: "Khumbu Pasanglhamu Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
        ]
      }
    ]
  },
  {
    id: "madhesh",
    nameNepali: "मधेश प्रदेश (Madhesh)",
    nameEnglish: "Madhesh Province",
    districts: [
      {
        id: "dhanusha",
        nameNepali: "धनुषा",
        nameEnglish: "Dhanusha",
        localLevels: [
          { id: "janakpur-submetro", nameNepali: "जनकपुरधाम उपमहानगरपालिका", nameEnglish: "Janakpurdham Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 25 },
          { id: "mithila-mun", nameNepali: "मिथिला नगरपालिका", nameEnglish: "Mithila Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "dhanusadham-mun", nameNepali: "धनुषाधाम नगरपालिका", nameEnglish: "Dhanusadham Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "parsa",
        nameNepali: "पर्सा",
        nameEnglish: "Parsa",
        localLevels: [
          { id: "birgunj-metro", nameNepali: "वीरगञ्ज महानगरपालिका", nameEnglish: "Birgunj Metropolitan", type: "महानगरपालिका", totalWards: 32 },
          { id: "pokhariya-mun", nameNepali: "पोखरिया नगरपालिका", nameEnglish: "Pokhariya Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "saptari",
        nameNepali: "सप्तरी",
        nameEnglish: "Saptari",
        localLevels: [
          { id: "rajbiraj-mun", nameNepali: "राजविराज नगरपालिका", nameEnglish: "Rajbiraj Municipality", type: "नगरपालिका", totalWards: 16 },
          { id: "kanchanrup-mun", nameNepali: "कञ्चनरुप नगरपालिका", nameEnglish: "Kanchanrup Municipality", type: "नगरपालिका", totalWards: 12 },
        ]
      },
      {
        id: "siraha",
        nameNepali: "सिराहा",
        nameEnglish: "Siraha",
        localLevels: [
          { id: "lahan-mun", nameNepali: "लहान नगरपालिका", nameEnglish: "Lahan Municipality", type: "नगरपालिका", totalWards: 24 },
          { id: "siraha-mun", nameNepali: "सिराहा नगरपालिका", nameEnglish: "Siraha Municipality", type: "नगरपालिका", totalWards: 22 },
        ]
      },
      {
        id: "mahottari",
        nameNepali: "महोत्तरी",
        nameEnglish: "Mahottari",
        localLevels: [
          { id: "jaleshwar-mun", nameNepali: "जलेश्वर नगरपालिका", nameEnglish: "Jaleshwar Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "bardibas-mun", nameNepali: "बर्दिबास नगरपालिका", nameEnglish: "Bardibas Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      },
      {
        id: "sarlahi",
        nameNepali: "सर्लाही",
        nameEnglish: "Sarlahi",
        localLevels: [
          { id: "malangwa-mun", nameNepali: "मलङ्गवा नगरपालिका", nameEnglish: "Malangwa Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "harion-mun", nameNepali: "हरि Bleach नगरपालिका", nameEnglish: "Harion Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "rautahat",
        nameNepali: "रौतहट",
        nameEnglish: "Rautahat",
        localLevels: [
          { id: "gaur-mun", nameNepali: "गौर नगरपालिका", nameEnglish: "Gaur Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "chandrapur-mun", nameNepali: "चन्द्रपुर नगरपालिका", nameEnglish: "Chandrapur Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "bara",
        nameNepali: "बारा",
        nameEnglish: "Bara",
        localLevels: [
          { id: "kalaiya-submetro", nameNepali: "कलैया उपमहानगरपालिका", nameEnglish: "Kalaiya Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 27 },
          { id: "jitpursimara-submetro", nameNepali: "जितपुरसिमरा उपमहानगरपालिका", nameEnglish: "Jitpursimara Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 24 },
        ]
      }
    ]
  },
  {
    id: "bagmati",
    nameNepali: "बागमती प्रदेश (Bagmati)",
    nameEnglish: "Bagmati Province",
    districts: [
      {
        id: "kathmandu",
        nameNepali: "काठमाडौँ",
        nameEnglish: "Kathmandu",
        localLevels: [
          { id: "kathmandu-metro", nameNepali: "काठमाडौँ महानगरपालिका", nameEnglish: "Kathmandu Metropolitan", type: "महानगरपालिका", totalWards: 32 },
          { id: "kirtipur-mun", nameNepali: "कीर्तिपुर नगरपालिका", nameEnglish: "Kirtipur Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "budhanilkantha-mun", nameNepali: "बूढानीलकण्ठ नगरपालिका", nameEnglish: "Budhanilkantha Municipality", type: "नगरपालिका", totalWards: 13 },
          { id: "chandragiri-mun", nameNepali: "चन्द्रागिरी नगरपालिका", nameEnglish: "Chandragiri Municipality", type: "नगरपालिका", totalWards: 15 },
          { id: "tokha-mun", nameNepali: "टोखा नगरपालिका", nameEnglish: "Tokha Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "lalitpur",
        nameNepali: "ललितपुर",
        nameEnglish: "Lalitpur",
        localLevels: [
          { id: "lalitpur-metro", nameNepali: "ललितपुर महानगरपालिका", nameEnglish: "Lalitpur Metropolitan", type: "महानगरपालिका", totalWards: 29 },
          { id: "mahalaxmi-lalitpur-mun", nameNepali: "महालक्ष्मी नगरपालिका", nameEnglish: "Mahalaxmi Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "godawari-mun", nameNepali: "गोदावरी नगरपालिका", nameEnglish: "Godawari Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      },
      {
        id: "bhaktapur",
        nameNepali: "भक्तपुर",
        nameEnglish: "Bhaktapur",
        localLevels: [
          { id: "bhaktapur-mun", nameNepali: "भक्तपुर नगरपालिका", nameEnglish: "Bhaktapur Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "madhyapur-mun", nameNepali: "मध्यपुर थिमी नगरपालिका", nameEnglish: "Madhyapur Thimi Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "suryabinayak-mun", nameNepali: "सूर्यविनायक नगरपालिका", nameEnglish: "Suryabinayak Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "changunarayan-mun", nameNepali: "चाँगुनारायण नगरपालिका", nameEnglish: "Changunarayan Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "makwanpur",
        nameNepali: "मकवानपुर",
        nameEnglish: "Makwanpur",
        localLevels: [
          { id: "hetauda-submetro", nameNepali: "हेटौँडा उपमहानगरपालिका", nameEnglish: "Hetauda Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 19 },
          { id: "thaha-mun", nameNepali: "थाहा नगरपालिका", nameEnglish: "Thaha Municipality", type: "नगरपालिका", totalWards: 12 },
        ]
      },
      {
        id: "chitwan",
        nameNepali: "चितवन",
        nameEnglish: "Chitwan",
        localLevels: [
          { id: "bharatpur-metro", nameNepali: "भरतपुर महानगरपालिका", nameEnglish: "Bharatpur Metropolitan", type: "महानगरपालिका", totalWards: 29 },
          { id: "ratnanagar-mun", nameNepali: "रत्ननगर नगरपालिका", nameEnglish: "Ratnanagar Municipality", type: "नगरपालिका", totalWards: 16 },
        ]
      },
      {
        id: "kavrepalanchok",
        nameNepali: "काभ्रेपलाञ्चोक",
        nameEnglish: "Kavrepalanchok",
        localLevels: [
          { id: "dhulikhel-mun", nameNepali: "धुलिखेल नगरपालिका", nameEnglish: "Dhulikhel Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "banepa-mun", nameNepali: "बनेपा नगरपालिका", nameEnglish: "Banepa Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "panauti-mun", nameNepali: "पनौती नगरपालिका", nameEnglish: "Panauti Municipality", type: "नगरपालिका", totalWards: 12 },
        ]
      },
      {
        id: "sindhupalchok",
        nameNepali: "सिन्धुपाल्चोक",
        nameEnglish: "Sindhupalchok",
        localLevels: [
          { id: "chautara-mun", nameNepali: "चौतारा साँगाचोकगढी नगरपालिका", nameEnglish: "Chautara Sangachokgadhi", type: "नगरपालिका", totalWards: 14 },
          { id: "melamchi-mun", nameNepali: "मेलम्ची नगरपालिका", nameEnglish: "Melamchi Municipality", type: "नगरपालिका", totalWards: 13 },
        ]
      },
      {
        id: "nuwakot",
        nameNepali: "नुवाकोट",
        nameEnglish: "Nuwakot",
        localLevels: [
          { id: "bidur-mun", nameNepali: "विदुर नगरपालिका", nameEnglish: "Bidur Municipality", type: "नगरपालिका", totalWards: 13 },
          { id: "belkotgadhi-mun", nameNepali: "बेलकोटगढी नगरपालिका", nameEnglish: "Belkotgadhi Municipality", type: "नगरपालिका", totalWards: 13 },
        ]
      },
      {
        id: "dhading",
        nameNepali: "धादिङ",
        nameEnglish: "Dhading",
        localLevels: [
          { id: "nilkantha-mun", nameNepali: "नीलकण्ठ नगरपालिका", nameEnglish: "Nilkantha Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "dhunibesi-mun", nameNepali: "धुनीबेंसी नगरपालिका", nameEnglish: "Dhunibesi Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "sindhuli",
        nameNepali: "सिन्धुली",
        nameEnglish: "Sindhuli",
        localLevels: [
          { id: "kamalamai-mun", nameNepali: "कमलामाई नगरपालिका", nameEnglish: "Kamalamai Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "dudhauli-mun", nameNepali: "दुधौली नगरपालिका", nameEnglish: "Dudhauli Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      },
      {
        id: "ramechhap",
        nameNepali: "रामेछाप",
        nameEnglish: "Ramechhap",
        localLevels: [
          { id: "manthali-mun", nameNepali: "मन्थली नगरपालिका", nameEnglish: "Manthali Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "ramechhap-mun", nameNepali: "रामेछाप नगरपालिका", nameEnglish: "Ramechhap Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "dolakha",
        nameNepali: "दोलखा",
        nameEnglish: "Dolakha",
        localLevels: [
          { id: "bhimkeshwar-mun", nameNepali: "भीमेश्वर नगरपालिका", nameEnglish: "Bhimeshwar Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "jiri-mun", nameNepali: "जिरी नगरपालिका", nameEnglish: "Jiri Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "rasuwa",
        nameNepali: "रसुवा",
        nameEnglish: "Rasuwa",
        localLevels: [
          { id: "uttargaya-rural", nameNepali: "उत्तरगया गाउँपालिका", nameEnglish: "Uttargaya Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "kalika-rural", nameNepali: "कालिका गाउँपालिका", nameEnglish: "Kalika Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "gosaikunda-rural", nameNepali: "गोसाइँकुण्ड गाउँपालिका", nameEnglish: "Gosaikunda Rural Municipality", type: "गाउँपालिका", totalWards: 6 },
        ]
      }
    ]
  },
  {
    id: "gandaki",
    nameNepali: "गण्डकी प्रदेश (Gandaki)",
    nameEnglish: "Gandaki Province",
    districts: [
      {
        id: "kaski",
        nameNepali: "कास्की",
        nameEnglish: "Kaski",
        localLevels: [
          { id: "pokhara-metro", nameNepali: "पोखरा महानगरपालिका", nameEnglish: "Pokhara Metropolitan", type: "महानगरपालिका", totalWards: 33 },
          { id: "annapurna-rural", nameNepali: "अन्नपूर्ण गाउँपालिका", nameEnglish: "Annapurna Rural Municipality", type: "गाउँपालिका", totalWards: 11 },
        ]
      },
      {
        id: "tanahun",
        nameNepali: "तनहुँ",
        nameEnglish: "Tanahun",
        localLevels: [
          { id: "byas-mun", nameNepali: "व्यास नगरपालिका", nameEnglish: "Byas Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "shuklagandaki-mun", nameNepali: "शुक्लागण्डकी नगरपालिका", nameEnglish: "Shuklagandaki Municipality", type: "नगरपालिका", totalWards: 12 },
        ]
      },
      {
        id: "syangja",
        nameNepali: "स्याङ्जा",
        nameEnglish: "Syangja",
        localLevels: [
          { id: "putalibazar-mun", nameNepali: "पुतलीबजार नगरपालिका", nameEnglish: "Putalibazar Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "waling-mun", nameNepali: "वालिङ नगरपालिका", nameEnglish: "Waling Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      },
      {
        id: "baglung",
        nameNepali: "बागलुङ",
        nameEnglish: "Baglung",
        localLevels: [
          { id: "baglung-mun", nameNepali: "बागलुङ नगरपालिका", nameEnglish: "Baglung Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "dhorpatan-mun", nameNepali: "ढोरपाटन नगरपालिका", nameEnglish: "Dhorpatan Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "gorkha",
        nameNepali: "गोरखा",
        nameEnglish: "Gorkha",
        localLevels: [
          { id: "gorkha-mun", nameNepali: "गोरखा नगरपालिका", nameEnglish: "Gorkha Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "palungtar-mun", nameNepali: "पालुङटार नगरपालिका", nameEnglish: "Palungtar Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "lamjung",
        nameNepali: "लमजुङ",
        nameEnglish: "Lamjung",
        localLevels: [
          { id: "besisahar-mun", nameNepali: "बेसीशहर नगरपालिका", nameEnglish: "Besisahar Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "sundarbazar-mun", nameNepali: "सुन्दरबजार नगरपालिका", nameEnglish: "Sundarbazar Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "parbat",
        nameNepali: "पर्वत",
        nameEnglish: "Parbat",
        localLevels: [
          { id: "kushma-mun", nameNepali: "कुश्मा नगरपालिका", nameEnglish: "Kushma Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "falebas-mun", nameNepali: "फलेवास नगरपालिका", nameEnglish: "Phalebas Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "myagdi",
        nameNepali: "म्याग्दी",
        nameEnglish: "Myagdi",
        localLevels: [
          { id: "beni-mun", nameNepali: "बेनी नगरपालिका", nameEnglish: "Beni Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "nawalpur",
        nameNepali: "नवलपरासी (बर्दघाट सुस्ता पूर्व)",
        nameEnglish: "Nawalpur",
        localLevels: [
          { id: "kawasoti-mun", nameNepali: "कावासोती नगरपालिका", nameEnglish: "Kawasoti Municipality", type: "नगरपालिका", totalWards: 17 },
          { id: "gaidakot-mun", nameNepali: "गैंडाकोट नगरपालिका", nameEnglish: "Gaidakot Municipality", type: "नगरपालिका", totalWards: 18 },
        ]
      },
      {
        id: "mustang",
        nameNepali: "मुस्ताङ",
        nameEnglish: "Mustang",
        localLevels: [
          { id: "gharapjhong-rural", nameNepali: "घरपझोङ गाउँपालिका", nameEnglish: "Gharapjhong Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "baragung-rural", nameNepali: "वारागुङ मुक्तिक्षेत्र गाउँपालिका", nameEnglish: "Baragung Muktichhetra", type: "गाउँपालिका", totalWards: 5 },
        ]
      },
      {
        id: "manang",
        nameNepali: "मनाङ",
        nameEnglish: "Manang",
        localLevels: [
          { id: "chame-rural", nameNepali: "चामे गाउँपालिका", nameEnglish: "Chame Rural Municipality", type: "गाउँपालिका", totalWards: 5 },
          { id: "manang-rural", nameNepali: "मनाङ ङिस्याङ गाउँपालिका", nameEnglish: "Manang Ngisyang", type: "गाउँपालिका", totalWards: 9 },
        ]
      }
    ]
  },
  {
    id: "lumbini",
    nameNepali: "लुम्बिनी प्रदेश (Lumbini)",
    nameEnglish: "Lumbini Province",
    districts: [
      {
        id: "rupandehi",
        nameNepali: "रुपन्देही",
        nameEnglish: "Rupandehi",
        localLevels: [
          { id: "butwal-submetro", nameNepali: "बुटवल उपमहानगरपालिका", nameEnglish: "Butwal Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 19 },
          { id: "siddharthanagar-mun", nameNepali: "सिद्धार्थनगर नगरपालिका", nameEnglish: "Siddharthanagar Municipality", type: "नगरपालिका", totalWards: 13 },
          { id: "tilottama-mun", nameNepali: "तिलोत्तमा नगरपालिका", nameEnglish: "Tilottama Municipality", type: "नगरपालिका", totalWards: 17 },
          { id: "sainamaina-mun", nameNepali: "सैनामैना नगरपालिका", nameEnglish: "Sainamaina Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "banke",
        nameNepali: "बाँके",
        nameEnglish: "Banke",
        localLevels: [
          { id: "nepalgunj-submetro", nameNepali: "नेपालगञ्ज उपमहानगरपालिका", nameEnglish: "Nepalgunj Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 23 },
          { id: "kohalpur-mun", nameNepali: "कोहलपुर नगरपालिका", nameEnglish: "Kohalpur Municipality", type: "नगरपालिका", totalWards: 15 },
        ]
      },
      {
        id: "dang",
        nameNepali: "दाङ",
        nameEnglish: "Dang",
        localLevels: [
          { id: "ghorahi-submetro", nameNepali: "घोराही उपमहानगरपालिका", nameEnglish: "Ghorahi Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 19 },
          { id: "tulsipur-submetro", nameNepali: "तुलसीपुर उपमहानगरपालिका", nameEnglish: "Tulsipur Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 19 },
          { id: "lamahi-mun", nameNepali: "लम्ही नगरपालिका", nameEnglish: "Lamahi Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "kapilvastu",
        nameNepali: "कपिलवस्तु",
        nameEnglish: "Kapilvastu",
        localLevels: [
          { id: "kapilvastu-mun", nameNepali: "कपिलवस्तु नगरपालिका", nameEnglish: "Kapilvastu Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "banganga-mun", nameNepali: "बाणगङ्गा नगरपालिका", nameEnglish: "Banganga Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "palpa",
        nameNepali: "पाल्पा",
        nameEnglish: "Palpa",
        localLevels: [
          { id: "tansen-mun", nameNepali: "तानसेन नगरपालिका", nameEnglish: "Tansen Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "rampur-mun", nameNepali: "रामपुर नगरपालिका", nameEnglish: "Rampur Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "bardiya",
        nameNepali: "बर्दिया",
        nameEnglish: "Bardiya",
        localLevels: [
          { id: "gulariya-mun", nameNepali: "गुलरिया नगरपालिका", nameEnglish: "Gulariya Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "bansgadhi-mun", nameNepali: "बाँसगढी नगरपालिका", nameEnglish: "Bansgadhi Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "gulmi",
        nameNepali: "गुल्मी",
        nameEnglish: "Gulmi",
        localLevels: [
          { id: "resunga-mun", nameNepali: "रेसुङ्गा नगरपालिका", nameEnglish: "Resunga Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "musikot-mun", nameNepali: "मुसिकोट नगरपालिका", nameEnglish: "Musikot Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "arghakhanchi",
        nameNepali: "अर्घाखाँची",
        nameEnglish: "Arghakhanchi",
        localLevels: [
          { id: "sandhikharka-mun", nameNepali: "सन्धिखर्क नगरपालिका", nameEnglish: "Sandhikharka Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "shitganga-mun", nameNepali: "शीतगङ्गा नगरपालिका", nameEnglish: "Shitganga Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      },
      {
        id: "pyuthan",
        nameNepali: "प्युठान",
        nameEnglish: "Pyuthan",
        localLevels: [
          { id: "pyuthan-mun", nameNepali: "प्युठान नगरपालिका", nameEnglish: "Pyuthan Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "swargadwari-mun", nameNepali: "स्वर्गद्वारी नगरपालिका", nameEnglish: "Swargadwari Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "rolpa",
        nameNepali: "रोल्पा",
        nameEnglish: "Rolpa",
        localLevels: [
          { id: "rolpa-mun", nameNepali: "रोल्पा नगरपालिका", nameEnglish: "Rolpa Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "eastern-rukum",
        nameNepali: "रुकुम (पूर्व)",
        nameEnglish: "Eastern Rukum",
        localLevels: [
          { id: "sisne-rural", nameNepali: "सिस्ने गाउँपालिका", nameEnglish: "Sisne Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
        ]
      },
      {
        id: "parasi",
        nameNepali: "नवलपरासी (बर्दघाट सुस्ता पश्चिम)",
        nameEnglish: "Parasi",
        localLevels: [
          { id: "ramgram-mun", nameNepali: "रामग्राम नगरपालिका", nameEnglish: "Ramgram Municipality", type: "नगरपालिका", totalWards: 18 },
          { id: "bardaghat-mun", nameNepali: "बर्दघाट नगरपालिका", nameEnglish: "Bardaghat Municipality", type: "नगरपालिका", totalWards: 16 },
        ]
      }
    ]
  },
  {
    id: "karnali",
    nameNepali: "कर्णाली प्रदेश (Karnali)",
    nameEnglish: "Karnali Province",
    districts: [
      {
        id: "surkhet",
        nameNepali: "सुर्खेत",
        nameEnglish: "Surkhet",
        localLevels: [
          { id: "birendranagar-mun", nameNepali: "वीरेन्द्रनगर नगरपालिका", nameEnglish: "Birendranagar Municipality", type: "नगरपालिका", totalWards: 16 },
          { id: "bheriganga-mun", nameNepali: "भेरीगङ्गा नगरपालिका", nameEnglish: "Bheriganga Municipality", type: "नगरपालिका", totalWards: 13 },
        ]
      },
      {
        id: "dailekh",
        nameNepali: "दैलेख",
        nameEnglish: "Dailekh",
        localLevels: [
          { id: "narayan-mun", nameNepali: "नारायण नगरपालिका", nameEnglish: "Narayan Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "dullu-mun", nameNepali: "दुल्लु नगरपालिका", nameEnglish: "Dullu Municipality", type: "नगरपालिका", totalWards: 13 },
        ]
      },
      {
        id: "jumla",
        nameNepali: "जुम्ला",
        nameEnglish: "Jumla",
        localLevels: [
          { id: "chandannath-mun", nameNepali: "चन्दननाथ नगरपालिका", nameEnglish: "Chandannath Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "salyan",
        nameNepali: "सल्यान",
        nameEnglish: "Salyan",
        localLevels: [
          { id: "sharada-mun", nameNepali: "शारदा नगरपालिका", nameEnglish: "Sharada Municipality", type: "नगरपालिका", totalWards: 15 },
          { id: "bagchaur-mun", nameNepali: "बागचौर नगरपालिका", nameEnglish: "Bagchaur Municipality", type: "नगरपालिका", totalWards: 12 },
        ]
      },
      {
        id: "jajarkot",
        nameNepali: "जाजरकोट",
        nameEnglish: "Jajarkot",
        localLevels: [
          { id: "bheri-mun", nameNepali: "भेरी नगरपालिका", nameEnglish: "Bheri Municipality", type: "नगरपालिका", totalWards: 13 },
          { id: "chhedagad-mun", nameNepali: "छेडागाड नगरपालिका", nameEnglish: "Chhedagad Municipality", type: "नगरपालिका", totalWards: 13 },
        ]
      },
      {
        id: "kalikot",
        nameNepali: "कालिकोट",
        nameEnglish: "Kalikot",
        localLevels: [
          { id: "khandachakra-mun", nameNepali: "खाँडाचक्र नगरपालिका", nameEnglish: "Khandachakra Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "mugu",
        nameNepali: "मुगु",
        nameEnglish: "Mugu",
        localLevels: [
          { id: "chhayanathrara-mun", nameNepali: "छायाँनाथ रारा नगरपालिका", nameEnglish: "Chhayanath Rara Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      },
      {
        id: "humla",
        nameNepali: "हुम्ला",
        nameEnglish: "Humla",
        localLevels: [
          { id: "simkot-rural", nameNepali: "सिमकोट गाउँपालिका", nameEnglish: "Simkot Rural Municipality", type: "गाउँपालिका", totalWards: 8 },
        ]
      },
      {
        id: "dolpa",
        nameNepali: "डोल्पा",
        nameEnglish: "Dolpa",
        localLevels: [
          { id: "thulibheri-mun", nameNepali: "ठूलीभेरी नगरपालिका", nameEnglish: "Thulibheri Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "tripurasundari-mun", nameNepali: "त्रिपुरासुन्दरी नगरपालिका", nameEnglish: "Tripurasundari Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "western-rukum",
        nameNepali: "रुकुम (पश्चिम)",
        nameEnglish: "Western Rukum",
        localLevels: [
          { id: "musikot-rukum-mun", nameNepali: "मुसिकोट नगरपालिका", nameEnglish: "Musikot Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "chaurjahari-mun", nameNepali: "चौरजहारी नगरपालिका", nameEnglish: "Chaurjahari Municipality", type: "नगरपालिका", totalWards: 14 },
        ]
      }
    ]
  },
  {
    id: "sudurpashchim",
    nameNepali: "सुदूरपश्चिम प्रदेश (Sudurpashchim)",
    nameEnglish: "Sudurpashchim Province",
    districts: [
      {
        id: "kailali",
        nameNepali: "कैलाली",
        nameEnglish: "Kailali",
        localLevels: [
          { id: "dhangadhi-submetro", nameNepali: "धनगढी उपमहानगरपालिका", nameEnglish: "Dhangadhi Sub-Metropolitan", type: "उपमहानगरपालिका", totalWards: 19 },
          { id: "tikapur-mun", nameNepali: "टीकापुर नगरपालिका", nameEnglish: "Tikapur Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "godawari-kailali-mun", nameNepali: "गोदावरी नगरपालिका", nameEnglish: "Godawari Municipality", type: "नगरपालिका", totalWards: 12 },
          { id: "lamkichuha-mun", nameNepali: "लम्कीचुहा नगरपालिका", nameEnglish: "Lamkichuha Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "kanchanpur",
        nameNepali: "कञ्चनपुर",
        nameEnglish: "Kanchanpur",
        localLevels: [
          { id: "bhimdatta-mun", nameNepali: "भीमदत्त नगरपालिका", nameEnglish: "Bhimdatta Municipality", type: "नगरपालिका", totalWards: 19 },
          { id: "bedkot-mun", nameNepali: "वेदकोट नगरपालिका", nameEnglish: "Bedkot Municipality", type: "नगरपालिका", totalWards: 10 },
          { id: "punarbas-mun", nameNepali: "पुनर्वास नगरपालिका", nameEnglish: "Punarbas Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "doti",
        nameNepali: "डोटी",
        nameEnglish: "Doti",
        localLevels: [
          { id: "dipayal-mun", nameNepali: "दिपायल सिलगढी नगरपालिका", nameEnglish: "Dipayal Silgadhi Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "shikhar-mun", nameNepali: "शिखर नगरपालिका", nameEnglish: "Shikhar Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "achham",
        nameNepali: "अछाम",
        nameEnglish: "Achham",
        localLevels: [
          { id: "mangalsen-mun", nameNepali: "मङ्गलसेन नगरपालिका", nameEnglish: "Mangalsen Municipality", type: "नगरपालिका", totalWards: 14 },
          { id: "kamalbazar-mun", nameNepali: "कमलबजार नगरपालिका", nameEnglish: "Kamalbazar Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "dadeldhura",
        nameNepali: "डडेल्धुरा",
        nameEnglish: "Dadeldhura",
        localLevels: [
          { id: "amargadhi-mun", nameNepali: "अमरगढी नगरपालिका", nameEnglish: "Amargadhi Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "parshuram-mun", nameNepali: "परशुराम नगरपालिका", nameEnglish: "Parshuram Municipality", type: "नगरपालिका", totalWards: 12 },
        ]
      },
      {
        id: "baitadi",
        nameNepali: "बैतडी",
        nameEnglish: "Baitadi",
        localLevels: [
          { id: "dasharathchand-mun", nameNepali: "दशरथचन्द नगरपालिका", nameEnglish: "Dasharathchand Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "patan-mun", nameNepali: "पाटन नगरपालिका", nameEnglish: "Patan Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      },
      {
        id: "darchula",
        nameNepali: "दार्चुला",
        nameEnglish: "Darchula",
        localLevels: [
          { id: "mahakali-mun", nameNepali: "महाकाली नगरपालिका", nameEnglish: "Mahakali Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "shailyashikhar-mun", nameNepali: "शैल्यशिखर नगरपालिका", nameEnglish: "Shailyashikhar Municipality", type: "नगरपालिका", totalWards: 9 },
        ]
      },
      {
        id: "bajhang",
        nameNepali: "बझाङ",
        nameEnglish: "Bajhang",
        localLevels: [
          { id: "jayaprithvi-mun", nameNepali: "जयपृथ्वी नगरपालिका", nameEnglish: "Jayaprithvi Municipality", type: "नगरपालिका", totalWards: 11 },
          { id: "bungal-mun", nameNepali: "बुङ्गल नगरपालिका", nameEnglish: "Bungal Municipality", type: "नगरपालिका", totalWards: 11 },
        ]
      },
      {
        id: "bajura",
        nameNepali: "बाजुरा",
        nameEnglish: "Bajura",
        localLevels: [
          { id: "badimalika-mun", nameNepali: "बडिमालिका नगरपालिका", nameEnglish: "Badimalika Municipality", type: "नगरपालिका", totalWards: 9 },
          { id: "budhinanda-mun", nameNepali: "बूढीनन्दा नगरपालिका", nameEnglish: "Budhinanda Municipality", type: "नगरपालिका", totalWards: 10 },
        ]
      }
    ]
  }
];

export function getDistrictsByProvince(provinceNameOrId: string): District[] {
  const prov = NEPAL_ADMINISTRATIVE_DATA.find(
    p => p.id === provinceNameOrId || p.nameNepali.includes(provinceNameOrId) || p.nameEnglish.toLowerCase() === provinceNameOrId.toLowerCase()
  );
  return prov ? prov.districts : [];
}

export function getLocalLevelsByDistrict(provinceNameOrId: string, districtNameOrId: string): LocalLevel[] {
  const districts = getDistrictsByProvince(provinceNameOrId);
  const dist = districts.find(
    d => d.id === districtNameOrId || d.nameNepali === districtNameOrId || d.nameEnglish.toLowerCase() === districtNameOrId.toLowerCase()
  );
  return dist ? dist.localLevels : [];
}

export function getWardsForLocalLevel(provinceNameOrId: string, districtNameOrId: string, localLevelNameOrId: string): number[] {
  const localLevels = getLocalLevelsByDistrict(provinceNameOrId, districtNameOrId);
  const loc = localLevels.find(
    l => l.id === localLevelNameOrId || l.nameNepali === localLevelNameOrId || l.nameEnglish.toLowerCase() === localLevelNameOrId.toLowerCase()
  );
  if (!loc) return Array.from({ length: 9 }, (_, i) => i + 1);
  return Array.from({ length: loc.totalWards }, (_, i) => i + 1);
}
