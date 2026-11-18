// Textos guardados para practicar reading. Cada uno lleva el nombre de su
// archivo original y la furigana tal como viene en el PDF, en el formato
// "[漢字|かな]". Una linea = una fila del editor.
// Es temporal: cuando exista la tabla `reading`, esto pasa a ser un seed.

export type TextoAlmacen = {
  titulo: string;
  archivo: string;
  texto: string;
  // Traduccion de referencia: una entrada por fila del texto, en orden
  traduccion: string[];
};

export const ALMACEN: TextoAlmacen[] = [
  {
    titulo: "JLPT N3 - Reading 1",
    archivo: "JLPT N3 - Reading 1.pdf",
    texto: `[新入会員|しんにゅうかいいん] [歓迎会|かんげいかい]のご[案内|あんない]
[拝啓|はいけい]　[時下|じか]ますますご[清栄|せいえい]のこととお[慶|よろこ]び[申|もう]し[上|あ]げます。
さて、この[度|たび]、[新|あたら]しい[会員|かいいん]の[皆様|みなさま]をお[迎|むか]えするため、[下記|かき]のとおり[新入会員|しんにゅうかいいん] [歓迎会|かんげいかい]を[開催|かいさい]することになりました。
[皆様|みなさま]のご[参加|さんか]を[心|こころ]よりお[待|ま]ちしております。
[敬具|けいぐ]
[記|き]
1. [日時|にちじ]：[令和|れいわ]6[年|ねん]7[月|がつ][20日|はつか]（[土|ど]）　[午後|ごご]18[時|じ]～[午後|ごご]21[時|じ]
2. [場所|ばしょ]：さくらカフェ
[横浜市|よこはまし][中区|なかく] [山下町|やましたちょう] 4-5-6
3. [会費|かいひ]：お[一人様|ひとりさま]　3500[円|えん]
4. [担当者|たんとうしゃ]：[佐藤|さとう][美咲|みさき]
5. [連絡先|れんらくさき]：090-9876-5432
※[参加|さんか]をご[希望|きぼう]の[方|かた]は7[月|がつ][10日|とおか]までに、[担当|たんとう]の[佐藤|さとう]までご[連絡|れんらく]くださいますようお[願|ねが]いいたします。
[以上|いじょう]`,
    traduccion: [
      "Aviso de la fiesta de bienvenida para nuevos miembros",
      "Estimados señores: nos alegra saber que gozan de buena salud y prosperidad en esta época del año.",
      "Pues bien, con el fin de dar la bienvenida a los nuevos miembros, hemos decidido celebrar una fiesta de bienvenida para nuevos miembros, según se indica a continuación.",
      "Esperamos de todo corazón contar con su participación.",
      "Atentamente,",
      "Detalles",
      "1. Fecha y hora: sábado 20 de julio del año 6 de Reiwa (2024), de 18:00 a 21:00",
      "2. Lugar: Sakura Café",
      "Yamashita-chō 4-5-6, distrito de Naka, ciudad de Yokohama",
      "3. Cuota: 3500 yenes por persona",
      "4. Encargada: Misaki Satō",
      "5. Contacto: 090-9876-5432",
      "※ Quienes deseen participar, por favor comuníquense con la encargada, Satō, a más tardar el 10 de julio.",
      "Fin",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 2",
    archivo: "JLPT N3 - Reading 2.pdf",
    texto: `[会議|かいぎ]で[自分|じぶん]の[意見|いけん]を[効果的|こうかてき]に[伝|つた]えるのなら、[避|さ]けるべき（注1）[表現|ひょうげん]があります。
それは「できません」や「[無理|むり]です」といった[言葉|ことば]です。
[例|たと]えば、「この[新|あたら]しいプロジェクト、[期日|きじつ]までに[完成|かんせい]させられますか？」という[問|と]いに[対|たい]し、「できません」とだけ[答|こた]えてしまうと、そこで[会話|かいわ]が[途切|とぎ]れてしまいます。
[決|けっ]して、どんな[課題|かだい]でも[無条件|むじょうけん]に[引|ひ]き[受|う]けろ、と[言|い]っているわけではありません。
「できません」という[言葉|ことば]を[使|つか]わず、[別|べつ]の[表現|ひょうげん]に[言|い]い[換|か]えてみましょう。
「この[新|あたら]しいプロジェクト、[期日|きじつ]までに[完成|かんせい]させられますか？」という[問|と]いに「[現状|げんじょう]では[困難|こんなん]ですが、もし[人員|じんいん]を[増|ふ]やすことができれば、あるいはスケジュールの[見直|みなお]しができれば、[可能性|かのうせい]はあります。
まずは、[具体的|ぐたいてき]な[課題|かだい]について[話|はな]し[合|あ]うべきでしょう」と[答|こた]えると、[相手|あいて]は[前向|まえむ]きな[姿勢|しせい]を[感|かん]じ、さらなる[解決策|かいけつさく]が[見|み]つかることでしょう。
（注1）[避|さ]けるべき（さけるべき）：[使|つか]うのを[控|ひか]えるべき`,
    traduccion: [
      "Si quieres transmitir tu opinión de forma eficaz en una reunión, hay expresiones que deberías evitar (nota 1).",
      "Se trata de palabras como “no puedo” o “es imposible”.",
      "Por ejemplo, si ante la pregunta “¿Puedes terminar este nuevo proyecto para la fecha límite?” respondes solamente “no puedo”, la conversación se corta ahí.",
      "De ninguna manera estoy diciendo que debas aceptar cualquier tarea sin condiciones.",
      "Intenta no usar la expresión “no puedo” y reemplázala por otra.",
      "Si ante la pregunta “¿Puedes terminar este nuevo proyecto para la fecha límite?” respondes: “En la situación actual es difícil, pero si se pudiera aumentar el personal, o si se pudiera revisar el calendario, existe la posibilidad.",
      "Primero, deberíamos conversar sobre los problemas concretos”, la otra persona percibirá una actitud positiva y seguramente se encontrarán más soluciones.",
      "(Nota 1) 避けるべき (sakeru beki): que se debería evitar usar.",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 3",
    archivo: "JLPT N3 - Reading 3.pdf",
    texto: `[第|だい]10[回|かい]　みどり[市|し]「[私|わたし]のまち」[写真|しゃしん]コンテスト
あなたの[視点|してん]で、みどり[市|し]の[魅力|みりょく]を[再発見|さいはっけん]しませんか？
みどり[市内|しない]で[撮影|さつえい]された、まちの[風景|ふうけい]、[人々|ひとびと]の[暮|く]らし、イベントなどをテーマにした[写真|しゃしん][作品|さくひん]を[募集|ぼしゅう]します。
[応募|おうぼ][規定|きてい]：カラー[写真|しゃしん]（A4サイズ[以上|いじょう]A3サイズ[以下|いか]）。
[一人|ひとり]につき3[点|てん]まで[応募|おうぼ][可能|かのう]。
[未発表|みはっぴょう]の[作品|さくひん]に[限|かぎ]ります。
[優秀賞|ゆうしゅうしょう]　3[名|めい]　[市役所|しやくしょ]ロビーでの[展示|てんじ]と[地域|ちいき][特産品|とくさんひん]セットを[贈呈|ぞうてい]。
[最終|さいしゅう] [締|し]め[切|き]り　2024[年|ねん]7[月|がつ]15[日|にち]
＊[氏名|しめい]・[年齢|ねんれい]・[郵便|ゆうびん][番号|ばんごう]・[住所|じゅうしょ]・[電話|でんわ][番号|ばんごう]・[連絡先|れんらくさき]メールアドレスを[記入|きにゅう]した（[注|ちゅう]1）[応募票|おうぼひょう]を[作品|さくひん]の[裏|うら]に[必|かなら]ず[貼|は]ってください。
＊[応募|おうぼ][作品|さくひん]の（[注|ちゅう]2）[返却|へんきゃく]はいたしません。
[大切|たいせつ]な[作品|さくひん]は[必|かなら]ずコピーをとってからご[応募|おうぼ]ください。
[詳細|しょうさい]はみどり[市役所|しやくしょ][文化課|ぶんかか]のホームページ（http://www.midori-city.jp/bunka）をご[覧|らん]ください。
ご[不明|ふめい]な[点|てん]があれば、お[気軽|きがる]にお[問|と]い[合|あ]わせください（042-999-XXXX・[平日|へいじつ]9:00～17:00）。
（[注|ちゅう]1）[応募票|おうぼひょう]（おうぼひょう）：[応募|おうぼ]するために[必要|ひつよう]な[情報|じょうほう]を[書|か]く[紙|かみ]
（[注|ちゅう]2）[返却|へんきゃく]（へんきゃく）：[返|かえ]すこと`,
    traduccion: [
      "10.º Concurso de fotografía “Mi ciudad” de la ciudad de Midori",
      "¿Por qué no redescubres el encanto de la ciudad de Midori desde tu propio punto de vista?",
      "Buscamos obras fotográficas tomadas dentro de la ciudad de Midori, con temas como los paisajes de la ciudad, la vida cotidiana de su gente o sus eventos.",
      "Requisitos de participación: fotografías a color (de tamaño A4 como mínimo y A3 como máximo).",
      "Se pueden presentar hasta 3 obras por persona.",
      "Solo se aceptan obras inéditas.",
      "Premio a la excelencia: 3 personas. Sus obras se expondrán en el vestíbulo del ayuntamiento y recibirán un set de productos típicos de la región.",
      "Fecha límite final: 15 de julio de 2024",
      "* Pegue sin falta en el reverso de la obra el formulario de inscripción (nota 1) con su nombre, edad, código postal, dirección, número de teléfono y correo electrónico de contacto.",
      "* Las obras presentadas no serán devueltas (nota 2).",
      "Si una obra es importante para usted, asegúrese de sacarle una copia antes de enviarla.",
      "Para más detalles, consulte la página web de la Sección de Cultura del Ayuntamiento de Midori (http://www.midori-city.jp/bunka).",
      "Si tiene alguna duda, no dude en consultarnos (042-999-XXXX, días hábiles de 9:00 a 17:00).",
      "(Nota 1) 応募票 (ōbohyō): hoja en la que se escribe la información necesaria para participar.",
      "(Nota 2) 返却 (henkyaku): devolver.",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 4",
    archivo: "JLPT N3 - Reading 4.pdf",
    texto: `[件名|けんめい]：さくらシステム[新|しん]サービスのご[提案|ていあん]について
[青葉|あおば][企画|きかく][株式会社|かぶしきがいしゃ]
[佐藤|さとう]　[翼|つばさ]　[様|さま]
メールを[拝読|はいどく]いたしました。
[弊社|へいしゃ]の[新|しん]サービスにご[関心|かんしん]をお[寄|よ]せいただき、[誠|まこと]にありがとうございます。
つきましては、[詳|くわ]しいサービス[内容|ないよう]をご[説明|せつめい]に、[貴社|きしゃ]へ[伺|うかが]わせていただきたく[存|ぞん]じます。
[来週|らいしゅう]、[下記|かき]の[日時|にちじ]のどちらかで、ご[都合|つごう]はいかがでしょうか。
[日時|にちじ]：4[月|がつ]17[日|にち]（[水|すい]）　14:00～15:00
4[月|がつ]18[日|にち]（[木|もく]）　10:00～11:00
お[忙|いそが]しいところ[恐縮|きょうしゅく]ですが、ご[返信|へんしん]をお[待|ま]ちしております。
さくらシステム[株式会社|かぶしきがいしゃ]
[田中|たなか]　[健太|けんた]`,
    traduccion: [
      "Asunto: Sobre nuestra propuesta del nuevo servicio de Sakura System",
      "Aoba Kikaku S.A.",
      "Estimado/a Tsubasa Satō:",
      "He leído su correo.",
      "Le agradecemos sinceramente el interés que ha mostrado en el nuevo servicio de nuestra empresa.",
      "Por ello, nos gustaría visitar su empresa para explicarle en detalle el contenido del servicio.",
      "¿Le vendría bien alguna de las siguientes fechas de la próxima semana?",
      "Fecha y hora: miércoles 17 de abril, de 14:00 a 15:00",
      "jueves 18 de abril, de 10:00 a 11:00",
      "Lamentamos molestarle estando tan ocupado/a, pero quedamos a la espera de su respuesta.",
      "Sakura System S.A.",
      "Kenta Tanaka",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 5",
    archivo: "JLPT N3 - Reading 5.pdf",
    texto: `[職場|しょくば]では、[難|むずか]しい[顔|かお]をしていると[一生懸命|いっしょうけんめい]に[作業|さぎょう]していると[見|み]られる。
[真剣|しんけん]な[顔|かお]つきをして、[額|ひたい]に[汗|あせ]を[流|なが]してプログラミングをしていると「[偉|えら]いね」と[言|い]われる。
しかし、これは、[本当|ほんとう]によい[開発|かいはつ][方法|ほうほう]ではない。
[難|むずか]しくて[面白|おもしろ]くないと[感|かん]じる[仕事|しごと]は、[良|よ]い[成果|せいか]に[繋|つな]がらないことが[目|め]に[見|み]えている。
[仕事|しごと]は、[楽|たの]しいと[感|かん]じる[人|ひと]ほど、[質|しつ]も[高|たか]く、[結果|けっか]もよくなるのだ。
[新入社員|しんにゅうしゃいん]のころ、[佐々木|ささき]さんという[先輩|せんぱい]がいた。
[彼|かれ]はアプリ[開発|かいはつ]が[誰|だれ]にも[負|ま]けないくらい、いつも[質|しつ]の[高|たか]いものを[生|う]み[出|だ]していた。
そんな[佐々木|ささき]さんは、いつも[楽|たの]しそうな[表情|ひょうじょう]をして[開発|かいはつ][作業|さぎょう]をしているのだ。
[難|むずか]しい[顔|かお]をして[作業|さぎょう]することがよいことだと[思|おも]っていた[私|わたし]は、いつも[納得|なっとく]できなかった。
プログラミングの[話|はなし]をすると、[笑顔|えがお]でコツを[教|おし]えてくれる。
ある[日|ひ]、[佐々木|ささき]さんに「なぜそんなに[良|よ]いものが[作|つく]れるのですか」と[聞|き]いてみたことがある。
すると「　[1]　」というあっさりした[返事|へんじ]が[返|かえ]ってきた。
[若|わか]いころに[聞|き]いた[言葉|ことば]は、そのとき[軽|かる]く[聞|き]き[流|なが]していた。
しかし、[実際|じっさい]に[様々|さまざま]なプロジェクトを[経験|けいけん]して、[質|しつ]の[高|たか]い[仕事|しごと]ができる[人|ひと]やアイデアの[豊富|ほうふ]な[人|ひと]は、[決|き]まって「[楽|たの]しんで[仕事|しごと]をしている[人|ひと]」だ。
[難|むずか]しく[真剣|しんけん]な[表情|ひょうじょう]をしている[人|ひと]は、[作業|さぎょう]が[遅|おそ]くて、バグも[多|おお]い。
[嫌|きら]いだという[感情|かんじょう]があると、スピードが[落|お]ちて、[熱心|ねっしん]さ、[集中力|しゅうちゅうりょく]、[粘|ねば]り[強|づよ]さが[欠|か]けてしまう。
[私|わたし]は[昔|むかし]、[難|むずか]しい[顔|かお]をしている[人|ひと]が[頑張|がんば]っている[人|ひと]だと[思|おも]っていたが、[大|おお]きな[間違|まちが]いだったのだ。
[本当|ほんとう]に[頑張|がんば]って[素晴|すば]らしい[成果|せいか]を[出|だ]せる[人|ひと]は、[楽|たの]しんでいる[人|ひと]なのだ。`,
    traduccion: [
      "En el trabajo, si pones cara seria, la gente piensa que estás trabajando con mucho empeño.",
      "Si programas con expresión seria y sudando la frente, te dicen “¡qué admirable!”.",
      "Sin embargo, esta no es realmente una buena forma de desarrollar.",
      "Es evidente que un trabajo que uno siente difícil y aburrido no lleva a buenos resultados.",
      "En el trabajo, cuanto más lo disfruta una persona, mayor es la calidad y mejores son los resultados.",
      "Cuando era empleado nuevo, tenía un compañero con más experiencia llamado Sasaki.",
      "Él siempre creaba productos de alta calidad, a tal punto que nadie lo superaba en el desarrollo de aplicaciones.",
      "Ese Sasaki siempre trabajaba en el desarrollo con una expresión de estar disfrutándolo.",
      "Yo, que creía que trabajar con cara seria era lo correcto, nunca terminaba de entenderlo.",
      "Cuando le hablaba de programación, me enseñaba trucos con una sonrisa.",
      "Un día le pregunté a Sasaki: “¿Por qué puedes crear cosas tan buenas?”.",
      "Entonces me respondió con total sencillez: “[1]”.",
      "Las palabras que escuché de joven, en ese momento las dejé pasar sin darles importancia.",
      "Sin embargo, después de participar en diversos proyectos, veo que las personas que hacen un trabajo de calidad o que tienen muchas ideas son, sin excepción, “personas que disfrutan su trabajo”.",
      "Las personas que trabajan con una expresión seria y tensa son lentas y cometen muchos errores (bugs).",
      "Cuando hay un sentimiento de rechazo, baja la velocidad y se pierden el entusiasmo, la concentración y la perseverancia.",
      "Antes yo creía que quienes ponían cara seria eran los que se esforzaban, pero era un gran error.",
      "Las personas que de verdad se esfuerzan y logran resultados excelentes son las que disfrutan lo que hacen.",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 6",
    archivo: "JLPT N3 - Reading 6.pdf",
    texto: `この[夏|なつ]の３ヶ[月間|げつかん]、[私|わたし]は[海外|かいがい]の[小|ちい]さな[村|むら]で[教育|きょういく]ボランティアに[参加|さんか]していました。
[私|わたし]は[現地|げんち]の[人々|ひとびと]と[交流|こうりゅう]し、その[国|くに]の[生活|せいかつ][様式|ようしき]や[食事|しょくじ]に[慣|な]れることを[第一|だいいち]に[考|かんが]えていました。
ところが、２ヶ[月|げつ]が[経|た]った[頃|ころ]、[急|きゅう]に[日本|にほん]の[食|た]べもの、[特|とく]に[懐|なつ]かしいお[菓子|かし]が[無性|むしょう]に[食|た]べたくなってきました。
[一緒|いっしょ]に[活動|かつどう]している[日本人|にほんじん]の[先輩|せんぱい]に、どこで[手|て]に[入|はい]るのか[尋|たず]ねてみました。
[1]そういう、[日本|にほん]の[輸入|ゆにゅう][食品|しょくひん]を[扱|あつか]っている[店|みせ]が、[少|すこ]し[離|はな]れた[町|まち]にあるから、[事前|じぜん]に[注文|ちゅうもん]しておくと[良|よ]いと[教|おし]えてくれました。
これには[本当|ほんとう]に[驚|おどろ]きました。
１０[年前|ねんまえ]、まだ[学生|がくせい]として[短期|たんき][留学|りゅうがく]していた[時|とき]、この[地域|ちいき]では[日本|にほん]の[品物|しなもの]など[全|まった]く[見|み]かけませんでした。
もし[欲|ほ]しければ、はるか[遠|とお]い[都市|とし]まで[行|い]かなければ[手|て]に[入|はい]らなかったのです。
それが[今|いま]、[手頃|てごろ]な[値段|ねだん]で[簡単|かんたん]に[注文|ちゅうもん]できるのですから、これは[大|おお]きな[変化|へんか]です。
[2]この１０[年|ねん]の[間|あいだ]に[何|なに]があったのでしょうか。
[海外|かいがい]で[活動|かつどう]する[日本人|にほんじん]が[増|ふ]えたのでしょうか。
それとも、[日本|にほん]の[文化|ぶんか]がさらに[世界|せかい]に[広|ひろ]まったのでしょうか。
どちらも[理由|りゆう]として[考|かんが]えられるし、どちらも[決|き]めつけられないような[気|き]もします。
とにかく、[無事|ぶじ]に[日本|にほん]のお[菓子|かし]が[手|て]に[入|はい]り、[少|すこ]し[故郷|こきょう]を[思|おも]い[出|だ]せたのは、とても[嬉|うれ]しいことでした。`,
    traduccion: [
      "Durante tres meses este verano, participé en un voluntariado educativo en un pequeño pueblo del extranjero.",
      "Mi prioridad era relacionarme con la gente local y acostumbrarme al estilo de vida y a la comida de ese país.",
      "Sin embargo, cuando pasaron dos meses, de repente me dieron unas ganas enormes de comer comida japonesa, sobre todo los dulces que extrañaba.",
      "Le pregunté a un compañero japonés con más experiencia, que participaba conmigo en las actividades, dónde podía conseguirlos.",
      "[1] Me explicó que en un pueblo un poco alejado había una tienda que vendía ese tipo de alimentos importados de Japón, y que convenía hacer el pedido con anticipación.",
      "Esto realmente me sorprendió.",
      "Hace 10 años, cuando estuve de intercambio corto como estudiante, en esta zona no se veían productos japoneses en absoluto.",
      "Si querías alguno, no podías conseguirlo sin ir hasta una ciudad muy lejana.",
      "Que ahora se puedan pedir fácilmente y a un precio razonable es un gran cambio.",
      "[2] ¿Qué habrá pasado en estos 10 años?",
      "¿Habrá aumentado el número de japoneses que trabajan en el extranjero?",
      "¿O será que la cultura japonesa se ha extendido aún más por el mundo?",
      "Ambas cosas podrían ser la razón, y a la vez siento que no se puede afirmar ninguna con certeza.",
      "En todo caso, poder conseguir dulces japoneses sin problemas y recordar un poco mi tierra me hizo muy feliz.",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 7",
    archivo: "JLPT N3 - Reading 7.pdf",
    texto: `[人間|にんげん]には、[目標|もくひょう][達成|たっせい]に[向|む]けて[行動|こうどう]する[力|ちから]がある。
[消極的|しょうきょくてき]な[考|かんが]え[方|かた]を[心|こころ]から[排除|はいじょ]すれば、どのような[困難|こんなん]にも[立|た]ち[向|む]かい、[成長|せいちょう]を[経験|けいけん]することができる。
まず、[排除|はいじょ]してもらいたいのは「[自分|じぶん]にはできない」という[固定観念|こていかんねん]だ。
そのような[考|かんが]え[方|かた]を[持|も]てば[持|も]つほど、[新|あたら]しい[挑戦|ちょうせん]の[機会|きかい]は[減|へ]り、[可能性|かのうせい]がどんどん[小|ちい]さくなってしまう。
どうしてもできないと[感|かん]じる[場合|ばあい]は、「[少|すこ]し[難|むずか]しい」と[考|かんが]えてみよう。
「[難|むずか]しい」という[言葉|ことば]は、[工夫|くふう]や[努力|どりょく][次第|しだい]で[解決|かいけつ]できる[可能性|かのうせい]が[残|のこ]っていることを[示|しめ]す。
だから、[完全|かんぜん]に[諦|あきら]めてしまう[必要|ひつよう]はないのだ。
（[注|ちゅう]1）[排除|はいじょ]（はいじょ）する：なくすこと
（[注|ちゅう]2）[固定観念|こていかんねん]（こていかんねん）：いつも[同|おな]じように[考|かんが]えてしまうこと、[思|おも]い[込|こ]み`,
    traduccion: [
      "Los seres humanos tienen la capacidad de actuar para alcanzar sus metas.",
      "Si eliminas (nota 1) de tu mente las formas de pensar negativas, podrás enfrentar cualquier dificultad y experimentar crecimiento.",
      "Lo primero que quiero que elimines es la idea preconcebida (nota 2) de “yo no puedo”.",
      "Cuanto más mantengas esa forma de pensar, menos oportunidades tendrás de enfrentar nuevos retos y tus posibilidades se irán reduciendo cada vez más.",
      "Si sientes que de ninguna manera puedes, intenta pensar “es un poco difícil”.",
      "La palabra “difícil” indica que aún queda la posibilidad de resolverlo, dependiendo de tu ingenio y esfuerzo.",
      "Por eso, no es necesario rendirse por completo.",
      "(Nota 1) 排除する (haijo suru): eliminar.",
      "(Nota 2) 固定観念 (kotei kannen): pensar siempre de la misma manera; idea preconcebida.",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 8",
    archivo: "JLPT N3 - Reading 8.pdf",
    texto: `[桜町|さくらまち]スポーツセンター　[利用|りよう][案内|あんない]
■ [利用|りよう][料金|りょうきん]のご[案内|あんない]
スポーツジム[利用料|りようりょう]：[一般|いっぱん] 800（700）[円|えん]、[大学生|だいがくせい] 600（500）[円|えん]
プール[利用料|りようりょう]：[一般|いっぱん] 500（400）[円|えん]、[大学生|だいがくせい] 400（300）[円|えん]
（[注|ちゅう]）（）[内|ない]は10[名|めい][以上|いじょう]の[団体|だんたい][利用|りよう][料金|りょうきん]です。
（[注|ちゅう]）[特別|とくべつ]イベントや[教室|きょうしつ]の[場合|ばあい]は、[別途|べっと][料金|りょうきん]がかかります。[各|かく]イベントの[案内|あんない]ページをご[確認|かくにん]ください。
（[注|ちゅう]）[高校生|こうこうせい][以下|いか]、または[満|まん]18[歳|さい][未満|みまん]、および[満|まん]65[歳|さい][以上|いじょう]の[方|かた]は、スポーツジムの[個人|こじん][利用|りよう]は[無料|むりょう]です。
■ [親子|おやこ][割引|わりびき]
[子|こ]ども（[高校生|こうこうせい][以下|いか]、または[満|まん]18[歳|さい][未満|みまん]）といっしょに[来|き]た[保護者|ほごしゃ]（[子|こ]ども1[名|めい]につき[同伴者|どうはんしゃ]2[名|めい]まで）は、プール[利用|りよう]を[団体|だんたい][料金|りょうきん]で[利用|りよう]できます。
■ シニア[会員|かいいん]パス
シニア[会員|かいいん]パス（[満|まん]60～64[歳|さい][限定|げんてい]）は、3000[円|えん]（[有効|ゆうこう][期限|きげん]：[発行|はっこう]から1[年間|ねんかん]）でスポーツジムを[何度|なんど]でも[利用|りよう]できます。
（[注|ちゅう]）シニア[会員|かいいん]パスは、2023[年|ねん]6[月|がつ]30[日|にち]（[金|きん]）で[販売|はんばい][終了|しゅうりょう]となります。[発行日|はっこうび]から1[年間|ねんかん]はご[利用|りよう]いただけます。
＊トレーニングルーム　[利用|りよう][無料|むりょう]
■ [開館|かいかん][時間|じかん]のご[案内|あんない]
[通常|つうじょう][開館|かいかん][時間|じかん]：9:00～18:00（[最終|さいしゅう][入館|にゅうかん]は17:30まで）
＊2023[年|ねん]4[月|がつ]から9[月|がつ]までの[間|あいだ]、[毎週|まいしゅう][火曜日|かようび]は[夜間|やかん]プログラムのため21:00まで[開館|かいかん]します。
＊2023[年|ねん]7[月|がつ]から8[月|がつ]までの[土曜|どよう]、[日曜|にちよう]、[祝日|しゅくじつ]、[休日|きゅうじつ]は、[夏季|かき][特別|とくべつ][期間|きかん]として20:00まで[開館|かいかん]します。
（[注|ちゅう]）[最終|さいしゅう][入館|にゅうかん]は[閉館|へいかん]の30[分前|ぷんまえ]までです。
＊トレーニングルーム　[利用|りよう][時間|じかん]：9:00～17:00（[月曜日|げつようび]から[金曜日|きんようび]）
■ [桜町|さくらまち]スポーツセンターへのお[問|と]い[合|あ]わせ
[利用|りよう][内容|ないよう]やイベントに[関|かん]するお[問|と]い[合|あ]わせ
[電話|でんわ][番号|ばんごう]：03-1234-5678（スポーツ[相談|そうだん]ダイヤル）
その[他|た]のお[問|と]い[合|あ]わせ
[住所|じゅうしょ]：〒150-0042　[東京都|とうきょうと][渋谷区|しぶやく][宇田川町|うだがわちょう]1-2-3　[桜町|さくらまち]スポーツセンター
[電話|でんわ][番号|ばんごう]：03-9876-5432（[代表|だいひょう]）`,
    traduccion: [
      "Centro Deportivo Sakuramachi — Guía de uso",
      "■ Información sobre tarifas",
      "Uso del gimnasio: público general 800 (700) yenes; universitarios 600 (500) yenes",
      "Uso de la piscina: público general 500 (400) yenes; universitarios 400 (300) yenes",
      "(Nota) El precio entre paréntesis es la tarifa para grupos de 10 personas o más.",
      "(Nota) Los eventos especiales y las clases tienen un costo adicional. Consulte la página informativa de cada evento.",
      "(Nota) Para estudiantes de bachillerato o menores, o menores de 18 años, y para personas de 65 años o más, el uso individual del gimnasio es gratuito.",
      "■ Descuento para padres e hijos",
      "Los tutores que vengan acompañando a un niño (estudiante de bachillerato o menor, o menor de 18 años) (hasta 2 acompañantes por niño) pueden usar la piscina con la tarifa de grupo.",
      "■ Pase de socio sénior",
      "Con el pase de socio sénior (solo para personas de 60 a 64 años), que cuesta 3000 yenes (válido por 1 año desde su emisión), se puede usar el gimnasio todas las veces que se quiera.",
      "(Nota) La venta del pase de socio sénior termina el viernes 30 de junio de 2023. Se puede usar durante 1 año desde la fecha de emisión.",
      "* Sala de entrenamiento: uso gratuito",
      "■ Horario de apertura",
      "Horario normal: de 9:00 a 18:00 (última entrada a las 17:30)",
      "* De abril a septiembre de 2023, todos los martes abrimos hasta las 21:00 por el programa nocturno.",
      "* De julio a agosto de 2023, los sábados, domingos, feriados y días de descanso abrimos hasta las 20:00 por el periodo especial de verano.",
      "(Nota) La última entrada es hasta 30 minutos antes del cierre.",
      "* Sala de entrenamiento: horario de uso de 9:00 a 17:00 (de lunes a viernes)",
      "■ Consultas al Centro Deportivo Sakuramachi",
      "Consultas sobre el uso de las instalaciones y los eventos",
      "Teléfono: 03-1234-5678 (línea de consultas deportivas)",
      "Otras consultas",
      "Dirección: 〒150-0042, Udagawa-chō 1-2-3, distrito de Shibuya, Tokio, Centro Deportivo Sakuramachi",
      "Teléfono: 03-9876-5432 (línea principal)",
    ],
  },
  {
    titulo: "JLPT N3 - Reading 9",
    archivo: "JLPT N3 - Reading 9.pdf",
    texto: `[日本|にほん]では、「[健康|けんこう][習慣|しゅうかん]」という[言葉|ことば]がよく[使|つか]われる。
[健康|けんこう][習慣|しゅうかん]とは、[日々|ひび]の[生活|せいかつ]で[体調|たいちょう]を[整|ととの]え、[病気|びょうき]を[予防|よぼう]するための[行動|こうどう]のことである。
[少|すこ]し[前|まえ]の[時代|じだい]から、バランスの[取|と]れた[食事|しょくじ]や[適度|てきど]な[運動|うんどう]は、[子供|こども]でも[一|ひと]つや[二|ふた]つは[必|かなら]ず[言|い]えるような[常識|じょうしき]だった。
[健康的|けんこうてき]な[体|からだ]を[手|て]に[入|い]れるために、[多|おお]くの[人|ひと]が[様々|さまざま]な[情報|じょうほう]を[集|あつ]めている。
しかし、[表面的|ひょうめんてき]なことだけを[重視|じゅうし]しすぎて、かえってストレスを[感|かん]じてしまう[人|ひと]もいる。
[最|もっと]も[有名|ゆうめい]な[例|れい]として、[朝|あさ]のランニングや[栄養|えいよう][豊富|ほうふ]な[食事|しょくじ]が[挙|あ]げられる。
これらは[確|たし]かに[体力|たいりょく]を[向上|こうじょう]させる[効果|こうか]があるし、[十分|じゅうぶん]な[睡眠|すいみん]は[疲労|ひろう][回復|かいふく]に[繋|つな]がる。
ただ、これらの[身体的|しんたいてき]な[健康|けんこう][習慣|しゅうかん]だけでは、[解決|かいけつ]できない[問題|もんだい]も[存在|そんざい]するのだそうだ。
その[一方|いっぽう]で、[心理学者|しんりがくしゃ]の[友人|ゆうじん]は、[体|からだ]の[健康|けんこう]よりもっと[気|き]をつけなければならないのは[心|こころ]の[健康|けんこう]だと[言|い]っていた。
ちゃんと[自分|じぶん]の[感情|かんじょう]に[向|む]き[合|あ]わずに、[無理|むり]に[明|あか]るく[振|ふ]る[舞|ま]っていると、[予想|よそう]しない[精神的|せいしんてき]な[不調|ふちょう]が[現|あらわ]れてしまうこともあるという。
[実際|じっさい]に、それが[原因|げんいん]でうつ[病|びょう]などの[別|べつ]の[病気|びょうき]になってしまった[人|ひと]もいるという。
[最近|さいきん]では、[専門|せんもん]のカウンセリングを[受|う]ける[機会|きかい]も[増|ふ]え、ネットには[心|こころ]のケアについての[専門|せんもん]サイトも[多|おお]い。`,
    traduccion: [
      "En Japón se usa mucho la expresión “hábitos saludables”.",
      "Los hábitos saludables son las acciones que se realizan en la vida diaria para mantener una buena condición física y prevenir enfermedades.",
      "Desde hace algún tiempo, una alimentación equilibrada y el ejercicio moderado son conocimientos tan comunes que hasta un niño puede mencionar sin falta uno o dos.",
      "Para lograr un cuerpo saludable, muchas personas reúnen todo tipo de información.",
      "Sin embargo, hay quienes le dan demasiada importancia solo a lo superficial y, al contrario, terminan sintiendo estrés.",
      "Los ejemplos más conocidos son salir a correr por la mañana y llevar una alimentación rica en nutrientes.",
      "Es cierto que estas prácticas mejoran la condición física, y dormir lo suficiente ayuda a recuperarse del cansancio.",
      "Sin embargo, se dice que hay problemas que no se pueden resolver solo con estos hábitos saludables físicos.",
      "Por otro lado, un amigo psicólogo me decía que, más que la salud del cuerpo, a lo que hay que prestarle atención es a la salud mental.",
      "Según él, si uno no enfrenta de verdad sus propias emociones y se fuerza a comportarse con alegría, pueden aparecer problemas mentales inesperados.",
      "De hecho, dice que hay personas que, por esa causa, han terminado con otras enfermedades como la depresión.",
      "Hoy en día hay más oportunidades de recibir orientación psicológica profesional, y en internet hay muchos sitios especializados en el cuidado de la salud mental.",
    ],
  },
];
