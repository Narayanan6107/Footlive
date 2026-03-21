import Team from '../models/Team.js';
import Player from '../models/Player.js';

const SQUADS_DATA = [
  { name: "Real Madrid", league: "La Liga", color: "#ffffff", p: "T. Courtois|GK|1; A. Lunin|GK|13; F. Gonzalez|GK|30; D. Carvajal|RB|2; E. Militao|CB|3; D. Alaba|CB|4; A. Rudiger|CB|22; F. Mendy|LB|23; F. Garcia|LB|20; L. Vazquez|RB|17; J. Vallejo|CB|5; J. Bellingham|CAM|5; E. Camavinga|CDM|12; F. Valverde|CM|8; A. Tchouameni|CDM|14; D. Ceballos|CM|19; A. Guler|CAM|15; N. Paz|CM|32; V. Junior|LW|7; K. Mbappe|ST|9; Rodrygo|RW|11; B. Diaz|RW|21; Endrick|ST|16; Alvaro|ST|39; L. Modric|CM|10" },
  { name: "Barcelona", league: "La Liga", color: "#004d98", p: "M. ter Stegen|GK|1; I. Pena|GK|13; A. Astralaga|GK|26; J. Cancelo|RB|2; R. Araujo|CB|4; J. Kounde|CB|23; A. Christensen|CB|15; I. Martinez|CB|5; A. Balde|LB|3; M. Alonso|LB|17; H. Fort|RB|39; P. Cubarsi|CB|33; F. de Jong|CM|21; Pedri|CM|8; Gavi|CM|6; I. Gundogan|CM|22; O. Romeu|CDM|18; F. Lopez|CAM|16; R. Lewandowski|ST|9; R. Raphinha|RW|11; L. Yamal|RW|27; J. Felix|LW|14; F. Torres|LW|7; V. Roque|ST|19; M. Guiu|ST|38" },
  { name: "Atletico Madrid", league: "La Liga", color: "#cb3524", p: "J. Oblak|GK|13; H. Moldovan|GK|1; A. Gomis|GK|31; N. Molina|RB|16; J. Gimenez|CB|2; M. Hermoso|CB|22; S. Savic|CB|15; A. Witsel|CB|20; C. Azpilicueta|CB|3; Reinildo|LB|23; R. De Paul|CM|5; Koke|CDM|6; S. Lino|LM|12; M. Llorente|RM|14; P. Barrios|CM|24; A. Vermeeren|CM|18; T. Lemar|CM|11; S. Niguez|CM|8; A. Griezmann|ST|7; A. Morata|ST|19; M. Depay|ST|9; A. Correa|ST|10; S. Omorodion|ST|34; R. Riquelme|LW|17; J. Felix|LW|21" },
  { name: "Manchester City", league: "Premier League", color: "#6caddf", p: "Ederson|GK|31; S. Ortega|GK|18; S. Carson|GK|33; K. Walker|RB|2; R. Dias|CB|3; J. Stones|CB|5; N. Ake|CB|6; M. Akanji|CB|25; J. Gvardiol|LB|24; R. Lewis|RB|82; S. Gomez|LB|21; Rodri|CDM|16; K. De Bruyne|CAM|17; M. Kovacic|CM|8; M. Nunes|CM|27; J. McAtee|CM|87; B. Silva|RW|20; P. Foden|LW|47; J. Grealish|LW|10; J. Doku|LW|11; E. Haaland|ST|9; J. Alvarez|ST|19; O. Bobb|RW|52; S. Savio|RW|37; L. Delap|ST|48" },
  { name: "Arsenal", league: "Premier League", color: "#ef0107", p: "D. Raya|GK|22; A. Ramsdale|GK|1; K. Hein|GK|31; B. White|RB|4; W. Saliba|CB|2; G. Magalhaes|CB|6; J. Timber|CB|12; T. Tomiyasu|RB|18; O. Zinchenko|LB|35; J. Kiwior|LB|15; D. Rice|CDM|41; M. Odegaard|CAM|8; T. Partey|CDM|5; Jorginho|CDM|20; F. Vieira|CAM|21; E. Smith Rowe|CAM|10; B. Saka|RW|7; G. Martinelli|LW|11; L. Trossard|LW|19; K. Havertz|ST|29; G. Jesus|ST|9; E. Nketiah|ST|14; R. Nelson|RW|24; M. Marquinhos|RW|27; E. Nwaneri|CM|63" },
  { name: "Liverpool", league: "Premier League", color: "#c8102E", p: "Alisson|GK|1; C. Kelleher|GK|62; V. Jaros|GK|56; T. Alexander-Arnold|RB|66; V. van Dijk|CB|4; I. Konate|CB|5; J. Gomez|CB|2; J. Quansah|CB|78; A. Robertson|LB|26; K. Tsimikas|LB|21; C. Bradley|RB|84; A. Mac Allister|CM|10; D. Szoboszlai|CM|8; W. Endo|CDM|3; R. Gravenberch|CM|38; C. Jones|CM|17; H. Elliott|CAM|19; S. Bajcetic|CDM|43; M. Salah|RW|11; L. Diaz|LW|7; D. Jota|ST|20; D. Nunez|ST|9; C. Gakpo|LW|18; B. Doak|RW|50; J. Danns|ST|76" },
  { name: "Chelsea", league: "Premier League", color: "#034694", p: "R. Sanchez|GK|1; D. Petrovic|GK|28; M. Bettinelli|GK|13; R. James|RB|24; M. Gusto|RB|27; L. Colwill|CB|26; A. Disasi|CB|2; B. Badiashile|CB|5; W. Fofana|CB|33; T. Chalobah|CB|14; B. Chilwell|LB|21; M. Cucurella|LB|3; E. Fernandez|CM|8; M. Caicedo|CDM|25; C. Gallagher|CM|23; R. Lavia|CDM|45; L. Ugochukwu|CDM|16; C. Palmer|RM|20; R. Sterling|LW|7; M. Mudryk|LW|10; N. Madueke|RW|11; N. Jackson|ST|15; C. Nkunku|ST|18; A. Broja|ST|19; D. Washington|ST|36" },
  { name: "Manchester United", league: "Premier League", color: "#da291c", p: "A. Onana|GK|24; A. Bayindir|GK|1; T. Heaton|GK|22; D. Dalot|RB|20; A. Wan-Bissaka|RB|29; L. Martinez|CB|6; R. Varane|CB|19; H. Maguire|CB|5; V. Lindelof|CB|2; W. Kambwala|CB|53; L. Shaw|LB|23; T. Malacia|LB|12; Casemiro|CDM|18; K. Mainoo|CM|37; B. Fernandes|CAM|8; S. McTominay|CM|39; M. Mount|CM|7; C. Eriksen|CM|14; A. Garnacho|LW|17; M. Rashford|LW|10; Antony|RW|21; A. Diallo|RW|16; R. Hojlund|ST|11; J. Zirkzee|ST|9; E. Wheatley|ST|84" },
  { name: "Tottenham Hotspur", league: "Premier League", color: "#132257", p: "G. Vicario|GK|13; F. Forster|GK|20; B. Austin|GK|40; P. Porro|RB|23; Emerson|RB|12; C. Romero|CB|17; M. van de Ven|CB|37; R. Dragusin|CB|6; B. Davies|CB|33; D. Udogie|LB|38; Y. Bissouma|CDM|8; P. Sarr|CM|29; R. Bentancur|CM|30; P. Hojbjerg|CDM|5; J. Maddison|CAM|10; G. Lo Celso|CAM|18; O. Skipp|CM|4; H. Son|LW|7; D. Kulusevski|RW|21; B. Johnson|RW|22; T. Werner|LW|16; Richarlison|ST|9; M. Solomon|LW|27; A. Veliz|ST|36; M. Moore|LW|59" },
  { name: "Newcastle United", league: "Premier League", color: "#241F20", p: "N. Pope|GK|22; M. Dubravka|GK|1; L. Karius|GK|18; K. Trippier|RB|2; V. Livramento|RB|21; F. Schar|CB|5; S. Botman|CB|4; J. Lascelles|CB|6; E. Krafth|CB|17; D. Burn|LB|33; L. Hall|LB|20; M. Targett|LB|13; B. Guimaraes|CDM|39; S. Tonali|CM|8; Joelinton|CM|7; J. Willock|CM|28; S. Longstaff|CM|36; E. Anderson|CM|32; M. Almiron|RW|24; A. Gordon|LW|10; H. Barnes|LW|15; J. Murphy|RW|23; A. Isak|ST|14; C. Wilson|ST|9; L. Miley|CM|67" },
  { name: "Bayern Munich", league: "Bundesliga", color: "#dc052d", p: "M. Neuer|GK|1; S. Ulreich|GK|26; D. Peretz|GK|18; N. Mazraoui|RB|40; S. Boey|RB|23; M. de Ligt|CB|4; D. Upamecano|CB|2; K. Min-jae|CB|3; E. Dier|CB|15; A. Davies|LB|19; R. Guerreiro|LB|22; J. Kimmich|CDM|6; L. Goretzka|CM|8; A. Pavlovic|CDM|45; K. Laimer|CM|27; J. Musiala|CAM|42; T. Muller|CAM|25; L. Sane|RW|10; K. Coman|LW|11; S. Gnabry|RW|7; M. Tel|LW|39; B. Zaragoza|LW|17; H. Kane|ST|9; E. Choupo-Moting|ST|13; A. Ibrahimovic|CAM|46" },
  { name: "Borussia Dortmund", league: "Bundesliga", color: "#fde100", p: "G. Kobel|GK|1; A. Meyer|GK|33; M. Lotka|GK|35; J. Ryerson|RB|26; M. Wolf|RB|17; N. Schlotterbeck|CB|4; M. Hummels|CB|15; N. Sule|CB|25; R. Bensebaini|LB|5; I. Maatsen|LB|22; E. Can|CDM|23; M. Sabitzer|CM|20; S. Ozcan|CDM|6; F. Nmecha|CM|8; J. Brandt|CAM|19; M. Reus|CAM|11; D. Malen|RW|21; J. Sancho|RW|10; K. Adeyemi|LW|27; J. Bynoe-Gittens|LW|43; J. Duranville|RW|16; N. Fullkrug|ST|14; S. Haller|ST|9; Y. Moukoko|ST|18; K. Watjen|CM|38" },
  { name: "Bayer Leverkusen", league: "Bundesliga", color: "#e32221", p: "L. Hradecky|GK|1; M. Kovar|GK|17; N. Lomb|GK|36; J. Frimpong|RWB|30; Arthur|RB|13; J. Tah|CB|4; E. Tapsoba|CB|12; O. Kossounou|CB|6; P. Hincapie|CB|3; J. Stanisic|CB|2; A. Grimaldo|LWB|20; G. Xhaka|CDM|34; R. Andrich|CDM|8; E. Palacios|CM|25; G. Puerta|CM|32; F. Wirtz|CAM|10; J. Hofmann|CAM|7; A. Adli|LW|21; N. Tella|RW|19; V. Boniface|ST|22; P. Schick|ST|14; B. Iglesias|ST|9; A. Hlozek|ST|23; I. Mamba|ST|38; N. Mbamba|CDM|18" },
  { name: "Paris Saint-Germain", league: "Ligue 1", color: "#004170", p: "G. Donnarumma|GK|99; K. Navas|GK|1; A. Tenas|GK|80; A. Hakimi|RB|2; N. Mukiele|RB|26; Marquinhos|CB|5; M. Skriniar|CB|37; L. Hernandez|CB|21; L. Beraldo|CB|35; D. Pereira|CB|15; N. Mendes|LB|25; F. Ruiz|CM|8; Vitinha|CM|17; W. Zaire-Emery|CM|33; M. Ugarte|CDM|4; K. Lee|CM|19; C. Soler|CM|28; O. Dembele|RW|10; B. Barcola|LW|29; M. Asensio|RW|11; R. Kolo Muani|ST|23; G. Ramos|ST|9; S. Mayulu|CAM|41; E. Mbappe|CM|38; Y. Zague|RB|42" },
  { name: "Inter Milan", league: "Serie A", color: "#0B5394", p: "Y. Sommer|GK|1; E. Audero|GK|77; R. Di Gennaro|GK|12; D. Dumfries|RWB|2; M. Darmian|RWB|36; A. Bastoni|CB|95; F. Acerbi|CB|15; B. Pavard|CB|28; S. de Vrij|CB|6; Y. Bisseck|CB|31; F. Dimarco|LWB|32; C. Augusto|LWB|30; N. Barella|CM|23; H. Calhanoglu|CDM|20; H. Mkhitaryan|CM|22; D. Frattesi|CM|16; K. Asllani|CDM|21; D. Klaassen|CM|14; L. Martinez|ST|10; M. Thuram|ST|9; M. Arnautovic|ST|8; A. Sanchez|ST|70; T. Buchanan|RM|17; E. Akinsanmiro|CM|41; A. Sarr|ST|49" },
  { name: "AC Milan", league: "Serie A", color: "#fb090b", p: "M. Maignan|GK|16; M. Sportiello|GK|57; A. Mirante|GK|83; D. Calabria|RB|2; A. Florenzi|RB|42; F. Tomori|CB|23; M. Thiaw|CB|28; P. Kalulu|CB|20; M. Gabbia|CB|46; T. Hernandez|LB|19; F. Terracciano|LB|38; I. Bennacer|CDM|4; T. Reijnders|CM|14; R. Loftus-Cheek|CAM|8; Y. Adli|CM|7; T. Pobega|CM|32; Y. Musah|CM|80; R. Leao|LW|10; C. Pulisic|RW|11; N. Okafor|LW|17; S. Chukwueze|RW|21; O. Giroud|ST|9; L. Jovic|ST|15; F. Camarda|ST|73; K. Zeroli|CM|85" },
  { name: "Juventus", league: "Serie A", color: "#000000", p: "W. Szczesny|GK|1; M. Perin|GK|36; C. Pinsoglio|GK|23; Danilo|RB|6; G. Bremer|CB|3; F. Gatti|CB|4; D. Rugani|CB|24; T. Djalo|CB|33; A. Cambiaso|LWB|27; F. Kostic|LWB|11; M. De Sciglio|RB|2; M. Locatelli|CDM|5; A. Rabiot|CM|25; W. McKennie|CM|16; F. Miretti|CM|20; C. Alcaraz|CM|26; H. Nicolussi|CM|41; F. Chiesa|LW|7; D. Vlahovic|ST|9; A. Milik|ST|14; M. Kean|ST|18; K. Yildiz|ST|15; S. Iling-Junior|LW|17; T. Weah|RM|22; J. Nonge|CM|47" },
  { name: "Napoli", league: "Serie A", color: "#0484d4", p: "A. Meret|GK|1; P. Gollini|GK|95; N. Contini|GK|14; G. Di Lorenzo|RB|22; P. Mazzocchi|RB|30; A. Rrahmani|CB|13; Juan Jesus|CB|5; Natan|CB|3; L. Ostigard|CB|55; M. Olivera|LB|17; Mario Rui|LB|6; S. Lobotka|CDM|68; F. Anguissa|CM|99; P. Zielinski|CM|20; H. Traore|CM|8; J. Cajuste|CM|24; L. Dendoncker|CDM|32; K. Kvaratskhelia|LW|77; V. Osimhen|ST|9; M. Politano|RW|21; G. Raspadori|ST|81; J. Lindstrom|RW|29; C. Ngonge|RW|26; G. Simeone|ST|18; F. Russo|LW|70" },
  { name: "AS Roma", league: "Serie A", color: "#8e001c", p: "M. Svilar|GK|99; R. Patricio|GK|1; P. Boer|GK|63; R. Karsdorp|RB|2; Z. Celik|RB|19; G. Mancini|CB|23; E. Ndicka|CB|5; D. Llorente|CB|14; C. Smalling|CB|6; D. Huijsen|CB|3; L. Spinazzola|LB|37; Angelino|LB|69; L. Paredes|CDM|16; B. Cristante|CM|4; L. Pellegrini|CAM|7; E. Bove|CM|52; H. Aouar|CM|22; R. Sanches|CM|20; P. Dybala|CF|21; R. Lukaku|ST|90; S. El Shaarawy|LW|92; S. Azmoun|ST|17; T. Baldanzi|CAM|35; N. Zalewski|LM|59; J. Costa|RW|67" },
  { name: "RB Leipzig", league: "Bundesliga", color: "#DD0238", p: "P. Gulacsi|GK|1; J. Blaswich|GK|21; L. Zingerle|GK|25; B. Henrichs|RB|39; M. Simakan|RB|2; W. Orban|CB|4; C. Lukeba|CB|23; E. Bitshiabu|CB|5; D. Raum|LB|22; X. Schlager|CDM|24; A. Haidara|CM|8; K. Kampl|CM|44; N. Seiwald|CDM|13; E. Elmas|CAM|6; C. Baumgartner|CAM|14; X. Simons|CAM|20; D. Olmo|CAM|7; L. Openda|ST|17; B. Sesko|ST|30; Y. Poulsen|ST|9; F. Carvalho|RW|18; C. Lenz|LB|3; L. Klostermann|CB|16; N. Jatta|RW|38; K. Meyer|GK|36" }
];

export const seedLineups = async () => {
    try {
        console.log('🌱 Wiping old data and seeding 20 Teams and 500+ Players with realistic Jersey Numbers...');
        await Team.deleteMany({});
        await Player.deleteMany({});

        for (const data of SQUADS_DATA) {
            const newTeam = new Team({
                name: data.name,
                league: data.league,
                color: data.color
            });
            const savedTeam = await newTeam.save();

            const pStrArray = data.p.split('; ');
            const playersToInsert = pStrArray.map(playerStr => {
                const [n, s, num] = playerStr.split('|');
                
                let pCat = 'MID';
                if (['GK'].includes(s)) pCat = 'GK';
                if (['RB', 'LB', 'CB', 'RWB', 'LWB'].includes(s)) pCat = 'DEF';
                if (['ST', 'LW', 'RW', 'CF'].includes(s)) pCat = 'FWD';

                return {
                    name: n,
                    position: pCat,
                    specificPosition: s,
                    number: parseInt(num, 10),
                    team: savedTeam._id
                };
            });

            await Player.insertMany(playersToInsert);
            console.log(`Finished inserting squad accurately for ${data.name}...`);
        }

        console.log('✅ All Lineup data explicitly seeded with fresh Jersey Numbers!');
    } catch (e) {
        console.error('❌ Lineup Seed Error:', e);
    }
};
