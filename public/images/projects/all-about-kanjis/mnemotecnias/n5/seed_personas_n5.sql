-- ============================================================
-- SEED: personas famosas N5 (1 por kanji, 100 kanjis)
-- ============================================================
--
-- Persona o personaje conocido cuyo nombre contiene el kanji. Mezcla
-- figuras historicas, actores, mangakas y personajes de anime/manga/juegos.
-- Cada entrada tiene una descripcion corta en español para dar contexto.
--
-- Formato de cada fila (caracter, nombre, descripcion):
--   caracter    -> kanji origen para joinear con kanji.id
--   nombre      -> nombre completo (con kanji cuando corresponde)
--   descripcion -> breve resumen del rol o razon de fama
--
-- Idempotente: primero borra todas las personas existentes de los kanjis
-- cargados como n5, luego inserta el listado completo.
-- --------------------------------------------------------------

DELETE FROM personas_famosas
WHERE kanji_id IN (
  SELECT id FROM kanji WHERE nivel = 'n5'::nivel_jlpt
);

INSERT INTO personas_famosas (kanji_id, nombre, descripcion)
SELECT k.id, v.nombre, v.descripcion
FROM (VALUES
  ('一', '一青窈', 'cantante taiwanesa-japonesa, éxito Hanamizuki (2004)'),
  ('七', '七人の侍', 'film icónico de Akira Kurosawa (1954) con Toshirō Mifune'),
  ('九', '坂本九', 'cantante de Ue o Muite Arukō (Sukiyaki), fallecido en el vuelo JAL 123 (1985)'),
  ('二', '二宮金次郎', 'reformador agrario Edo tardío (1787-1856), estatua icónica del niño leyendo al cargar leña'),
  ('人', '松本人志', 'comediante del dúo Downtown y director de cine (Dai-Nihonjin, Symbol)'),
  ('入', '入江陵介', 'nadador olímpico japonés especialista en espalda, medallista'),
  ('八', '八代亜紀', 'cantante enka legendaria (1950-2023), éxito Ame no Bojō'),
  ('十', '十返舎一九', 'escritor Edo (1765-1831), autor del gesaku Tōkaidōchū Hizakurige'),
  ('万', '万田久子', 'actriz japonesa contemporánea, ex-Miss Universe Japan 1978'),
  ('三', '三島由紀夫', 'novelista y dramaturgo (1925-1970), autor de Kinkaku-ji, famoso por su seppuku ritual'),
  ('上', '上戸彩', 'actriz japonesa contemporánea (Attention Please, Hanzawa Naoki)'),
  ('下', '山下智久', 'actor y cantante, ex-miembro del grupo idol NEWS'),
  ('千', '千利休', 'maestro del té wabi-cha al servicio de Toyotomi Hideyoshi (1522-1591)'),
  ('口', '山口百恵', 'cantante y actriz idol icónica de los 70, retirada tras casarse en 1980'),
  ('土', '土方歳三', 'vicecomandante del Shinsengumi durante el Bakumatsu (1835-1869)'),
  ('大', '大谷翔平', 'beisbolista bidireccional de MLB (Angels, Dodgers), MVP múltiple'),
  ('女', '女神転生', 'franquicia de RPG de Atlus desde 1987, madre de la saga Persona'),
  ('子', '松田聖子', 'cantante idol icónica de los 80, referente del pop femenino japonés'),
  ('小', '小泉純一郎', 'primer ministro (2001-2006), impulsor de la privatización del correo'),
  ('山', '山田洋次', 'director de cine, saga Otoko wa Tsurai yo (Tora-san) y Tasogare Seibei'),
  ('川', '川端康成', 'novelista (1899-1972), primer japonés en ganar el Nobel de Literatura (1968)'),
  ('中', '中村勘三郎', 'actor de kabuki, XVIII generación (1955-2012), renovador del género'),
  ('五', '五木ひろし', 'cantante enka veterano, más de cincuenta apariciones en el Kōhaku'),
  ('今', '今田耕司', 'comediante y presentador de TV, referente del owarai en Kansai'),
  ('六', '六三四の剣', 'manga y anime clásico de kendō de Motoka Murakami (1981-1985)'),
  ('円', '円谷英二', 'director de efectos especiales (1901-1970), creador de Godzilla y fundador de Tsuburaya (Ultraman)'),
  ('分', '分福茶釜', 'cuento popular sobre un tanuki que se transforma en tetera para pagar un favor'),
  ('午', '午後の曳航', 'novela de Yukio Mishima (1963) sobre un marinero y un niño de Yokohama'),
  ('友', '友近', 'comediante japonesa reconocida por sus imitaciones y personajes'),
  ('天', '天海祐希', 'actriz japonesa, ex-top male role de la Takarazuka Revue'),
  ('少', '少年ジャンプ', 'revista semanal de manga de Shueisha (1968-), cuna de Dragon Ball, One Piece y Naruto'),
  ('手', '手塚治虫', 'padre del manga moderno (1928-1989), creador de Astroboy, Kimba y Buda'),
  ('日', '日高のり子', 'seiyū de Ranma-chan (Ranma 1/2), Minami (Touch) y Nadia'),
  ('月', '月岡芳年', 'último gran maestro del ukiyo-e (1839-1892), célebre por escenas violentas y sobrenaturales'),
  ('木', '鈴木一朗', 'Ichirō, beisbolista MLB (Mariners, Yankees, Marlins), más de 3000 hits'),
  ('水', '水木しげる', 'mangaka de GeGeGe no Kitarō (1922-2015), veterano de la Segunda Guerra Mundial'),
  ('火', '火の鳥', 'obra magna inconclusa de Osamu Tezuka sobre la inmortalidad y la reencarnación'),
  ('父', '父の暦', 'manga autobiográfico de Jirō Taniguchi (1994) sobre memoria familiar en Tottori'),
  ('出', '出川哲朗', 'comediante icónico por programas de reacción y aventura como Yabai yo Yabai yo'),
  ('北', '北野武', 'director de cine (Hana-bi, Sonatine), comediante y actor, León de Oro en Venecia 1997'),
  ('半', '半沢直樹', 'protagonista bancario de la dorama homónima (2013, 2020) basada en novelas de Jun Ikeido'),
  ('古', '古舘伊知郎', 'periodista y presentador, ex-conductor de News Station y comentarista de pro-wrestling'),
  ('右', '杉下右京', 'detective protagonista de la dorama Aibō (2000-), interpretado por Yutaka Mizutani'),
  ('四', '四月は君の嘘', 'manga y anime musical de Naoshi Arakawa (2011-2015) sobre piano y violín'),
  ('外', '外山滋比古', 'erudito de literatura inglesa (1923-2020), autor del ensayo Shikō no Seirigaku'),
  ('左', '左とん平', 'actor y comediante japonés (1937-2018) de doramas y películas'),
  ('未', '未来少年コナン', 'anime dirigido por Hayao Miyazaki para NHK (1978), primer trabajo suyo como director'),
  ('本', '本田翼', 'actriz, modelo y streamer de videojuegos japonesa contemporánea'),
  ('母', '母をたずねて三千里', 'anime del World Masterpiece Theater (1976) dirigido por Isao Takahata'),
  ('生', '生駒里奈', 'actriz y ex-idol, primera capitana de Nogizaka46'),
  ('白', '白洲次郎', 'empresario y aristócrata (1902-1985), asistente del PM Yoshida en la posguerra'),
  ('目', '目黒蓮', 'actor y miembro del grupo idol Snow Man'),
  ('立', '立川談志', 'rakugoka legendario (1936-2011), séptima generación Tatekawa Danshi'),
  ('休', '一休さん', 'monje zen Ikkyū Sōjun (1394-1481) y serie anime clásica basada en su vida'),
  ('会', '会津八一', 'poeta waka y erudito budista de la Universidad de Waseda (1881-1956)'),
  ('先', '先崎学', 'shogi profesional y ensayista, autor de Utsu-byō Kyūdan sobre su depresión'),
  ('名', '名探偵コナン', 'manga y anime de Gōshō Aoyama (1994-), franquicia longeva de detectives'),
  ('多', '多部未華子', 'actriz japonesa contemporánea (Nodame Cantabile, Watashi no Otokonoko)'),
  ('安', '安倍晋三', 'primer ministro (2006-2007, 2012-2020), asesinado en Nara en 2022'),
  ('年', '三年B組金八先生', 'dorama escolar de TBS (1979-2011) con Tetsuya Takeda como profesor'),
  ('毎', '毎日かあさん', 'manga autobiográfico de Rieko Saibara (2002-2017) sobre crianza y familia'),
  ('気', '気まぐれオレンジ☆ロード', 'manga romántico de Izumi Matsumoto (1984-1987) publicado en Shōnen Jump'),
  ('百', '百人一首', 'antología clásica de 100 poemas de 100 poetas compilada por Fujiwara no Teika (~1235)'),
  ('耳', '耳をすませば', 'film Ghibli (1995) dirigido por Yoshifumi Kondō, basado en el manga de Aoi Hiiragi'),
  ('行', '行け！稲中卓球部', 'manga cómico gross-out de Minoru Furuya (1993-1996) sobre un club escolar de ping-pong'),
  ('西', '西田敏行', 'actor icónico (Tsuribaka Nisshi, Amagi Goe), fallecido en 2024'),
  ('何', '何者', 'novela de Ryō Asai (2012), premio Naoki, adaptada al cine en 2016'),
  ('男', '男はつらいよ', 'saga de 50 películas de Yōji Yamada con Kiyoshi Atsumi como Tora-san (1969-2019)'),
  ('社', '社長 島耕作', 'entrega presidencial de la saga Shima Kōsaku de Kenshi Hirokane sobre un salaryman'),
  ('花', '花より男子', 'manga shōjo de Yōko Kamio (1992-2003), con múltiples adaptaciones en Asia'),
  ('見', '見取り図', 'dúo cómico de manzai formado por Morishige y Riri, de Yoshimoto Kōgyō'),
  ('言', '言の葉の庭', 'film corto de Makoto Shinkai (2013) ambientado en el jardín Shinjuku Gyoen'),
  ('足', '足利尊氏', 'primer shōgun del shogunato Ashikaga (1305-1358)'),
  ('車', '車田正美', 'mangaka creador de Saint Seiya (Los Caballeros del Zodiaco) y Ring ni Kakero'),
  ('国', '国木田独歩', 'novelista naturalista Meiji (1871-1908), autor de Musashino'),
  ('学', '学校の怪談', 'serie de películas y anime de terror escolar de los 90 basada en libros de Tōru Tsunemitsu'),
  ('店', '三越百貨店', 'grandes almacenes fundados en 1673 como Echigoya, primer department store de Japón'),
  ('東', '東京物語', 'film de Yasujirō Ozu (1953), considerado uno de los mejores de la historia del cine'),
  ('空', '空の境界', 'light novel de Kinoko Nasu (1998), primer trabajo del universo Type-Moon'),
  ('金', '金城武', 'actor y modelo taiwanés-japonés (Chungking Express, House of Flying Daggers)'),
  ('長', '織田信長', 'unificador del Japón Sengoku (1534-1582), murió en el Incidente de Honnō-ji'),
  ('雨', '雨月物語', 'colección de cuentos sobrenaturales de Ueda Akinari (1776), llevada al cine por Mizoguchi en 1953'),
  ('前', '前田敦子', 'ex-integrante y capitana de AKB48, ganadora de la primera sōsenkyo (2009)'),
  ('南', '南沙織', 'cantante icónica de los 70, primera aidoru moderna, esposa del fotógrafo Kishin Shinoyama'),
  ('後', '後藤新平', 'médico y político Meiji-Taishō (1857-1929), alcalde reconstructor de Tokio tras el terremoto de 1923'),
  ('食', '深夜食堂', 'manga de Yarō Abe (2006-) y dorama sobre una taberna de Shinjuku abierta de noche'),
  ('時', '時任三郎', 'actor japonés veterano, protagonista de doramas policiacos y familiares'),
  ('書', '書道ガールズ', 'film japonés (2010) sobre el concurso de performance de caligrafía escolar en Shikoku'),
  ('校', '桜蘭高校ホスト部', 'manga shōjo y anime de Bisco Hatori (2002-2010), rom-com en un club de anfitriones'),
  ('高', '高倉健', 'actor icónico del cine japonés (Poppoya, Yellow Handkerchief), 1931-2014'),
  ('週', '週刊文春', 'semanario de Bungeishunjū conocido por sus exclusivas de escándalos (bunshun-hō)'),
  ('魚', '金魚屋古書店', 'manga de Seimu Yoshizaki sobre una librería de segunda mano especializada en manga'),
  ('買', '買物ブギ', 'canción cómica de 1950 de Shizuko Kasagi, gran éxito de la posguerra japonesa'),
  ('道', '道元', 'monje zen (1200-1253), fundador de la escuela Sōtō en Japón, autor del Shōbōgenzō'),
  ('間', '間宮林蔵', 'explorador del Edo tardío (1780-1844), demostró que Sajalín es una isla'),
  ('飲', '飲茶', 'Yamcha, bandido del desierto y luego aliado de Goku en Dragon Ball'),
  ('新', '新世紀エヴァンゲリオン', 'anime de Hideaki Anno (1995-1996), obra icónica del estudio Gainax'),
  ('話', 'まんが日本昔話', 'serie anime de cuentos folclóricos (1975-1994) narrada por Ichirō Nagai y Etsuko Ichihara'),
  ('電', '電車男', 'novela basada en un hilo de 2ch (2004) sobre un otaku y una oficinista, múltiples adaptaciones'),
  ('聞', '新聞記者', 'film de Michihito Fujii (2019) sobre corrupción política, ganador del Japan Academy Prize'),
  ('語', '源氏物語', 'novela de Murasaki Shikibu (~1010), considerada la primera novela psicológica del mundo'),
  ('読', '読売新聞', 'periódico Yomiuri, el diario de mayor tirada del mundo'),
  ('駅', '駅前シリーズ', 'saga de comedias Ekimae (1958-1969) con Hisaya Morishige, Frankie Sakai y Keiju Kobayashi')
) AS v(caracter, nombre, descripcion)
JOIN kanji k ON k.caracter = v.caracter;
