export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  keywords: string[];
  sections: Section[];
}

export type Section =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "highlight"; text: string }
  | { type: "cta" };

export const posts: BlogPost[] = [
  {
    slug: "come-registrare-canzone-bari",
    title: "Come Registrare una Canzone Professionale a Bari: Guida Completa 2026",
    description:
      "Vuoi registrare una canzone a Bari? Scopri come funziona una sessione professionale al 19.98 Studio: dalla preparazione al mix finale.",
    date: "2026-01-15",
    readingTime: "6 min",
    keywords: [
      "registrare canzone Bari",
      "studio registrazione Bari",
      "recording professionale Bari",
      "come registrare musica",
      "sessione in studio",
    ],
    sections: [
      {
        type: "p",
        text: "Registrare una canzone professionale è un'esperienza che può cambiare la traiettoria di un artista. Che tu sia al tuo primo brano o alla decima traccia, capire come funziona una sessione in studio è essenziale per arrivare preparato e ottenere il massimo dal tempo in sala.",
      },
      {
        type: "h2",
        text: "Perché scegliere uno studio professionale invece dell'home recording",
      },
      {
        type: "p",
        text: "L'home recording può sembrare una soluzione conveniente, ma i risultati raramente raggiungono la qualità di uno studio professionale. La differenza non riguarda solo l'attrezzatura, ma l'acustica della sala, il monitoring calibrato e la presenza di un fonico esperto che guida ogni fase della sessione.",
      },
      {
        type: "p",
        text: "In uno studio come il 19.98 Recording Studio di Bari, ogni elemento è progettato per catturare il suono nella sua forma migliore: le pareti trattate acusticamente eliminano le riflessioni indesiderate, i monitor da studio restituiscono un'immagine sonora fedele e l'engineer del suono conosce ogni dettaglio della catena di registrazione.",
      },
      {
        type: "h2",
        text: "Come prepararsi prima della sessione",
      },
      {
        type: "p",
        text: "La preparazione è la fase più sottovalutata del processo. Arrivare in studio senza aver studiato i testi, senza aver praticato le parti vocali o senza una backing track di riferimento significa sprecare tempo prezioso e, di conseguenza, denaro.",
      },
      {
        type: "ul",
        items: [
          "Studia i testi a memoria o portali stampati con carattere leggibile",
          "Esegui un riscaldamento vocale di almeno 15 minuti prima di entrare in sala",
          "Prepara la base musicale in formato WAV o AIFF alla frequenza campionamento corretta (44.1 kHz o 48 kHz)",
          "Porta una lista delle parti che vuoi registrare, nell'ordine che preferisci",
          "Dormi bene la notte prima: la voce riflette direttamente lo stato fisico",
        ],
      },
      {
        type: "h2",
        text: "Il setup della sala di registrazione",
      },
      {
        type: "p",
        text: "Quando arrivi al 19.98 Studio, il fonico prepara la sala e la catena di segnale prima del tuo ingresso. Il microfono viene scelto in base al tipo di voce e al genere musicale, la preamp viene configurata per esaltare le frequenze più lusinghiere della tua voce, e il headphone mix viene personalizzato in modo che tu possa cantare a tuo agio.",
      },
      {
        type: "highlight",
        text: "Il monitoring in cuffia è fondamentale: se non ti senti bene nelle cuffie, la tua performance ne risente. Non esitare a chiedere al fonico di aggiustare il mix delle cuffie prima di iniziare il recording.",
      },
      {
        type: "h2",
        text: "Il processo di tracking vocale",
      },
      {
        type: "p",
        text: "Una volta sistemato il setup, si inizia con il tracking. Il fonico gestisce la DAW — il software professionale che registra e organizza le tracce audio — mentre tu ti concentri esclusivamente sulla performance. Di solito si registrano più take della stessa sezione, così da avere materiale sufficiente per il comping.",
      },
      {
        type: "h3",
        text: "Cos'è il comping e perché è importante",
      },
      {
        type: "p",
        text: "Il comping è il processo di selezione delle migliori parti da ogni take. Se nel take 1 hai cantato meglio il verso iniziale e nel take 3 il ritornello è perfetto, il fonico unisce le due performance creando una traccia composita impeccabile. Questa tecnica è standard in ogni studio professionale al mondo.",
      },
      {
        type: "h2",
        text: "Editing e pulizia della traccia",
      },
      {
        type: "p",
        text: "Dopo il comping, la traccia vocale viene editata: i respiri eccessivi vengono ridotti o rimossi, le sibilanti vengono controllate con un de-esser, e la pitch correction viene applicata in modo naturale se necessario. L'obiettivo è una performance che suoni umana e autentica, non robotica.",
      },
      {
        type: "h2",
        text: "Il mix del brano",
      },
      {
        type: "p",
        text: "Con le tracce registrate e editale, si passa alla fase di mix. Il mixing è l'arte di bilanciare tutti gli elementi sonori — voce, base, effetti — in un paesaggio coerente e piacevole all'ascolto. Il fonico lavora su EQ, compressori, reverb e delay per creare profondità e spazio nel brano.",
      },
      {
        type: "h2",
        text: "Il master del brano",
      },
      {
        type: "p",
        text: "Il mastering è l'ultima fase prima della distribuzione. Il master ottimizza il loudness della traccia per i diversi formati di distribuzione — Spotify, Apple Music, YouTube — assicurandosi che il brano suoni forte, bilanciato e coerente su qualsiasi sistema di riproduzione, dalle cuffie agli altoparlanti delle auto.",
      },
      {
        type: "h2",
        text: "Distribuzione sulle piattaforme streaming",
      },
      {
        type: "p",
        text: "Una volta completato il master, il file WAV finale è pronto per essere caricato su un distributore digitale come DistroKid, TuneCore o CD Baby. Il distributore si occupa di caricare il tuo brano su Spotify, Apple Music, Amazon Music e le altre piattaforme, rendendolo accessibile a milioni di ascoltatori in tutto il mondo.",
      },
      {
        type: "highlight",
        text: "Al 19.98 Recording Studio consegniamo il master in formato WAV 24-bit e MP3 320 kbps, pronti per la distribuzione. Puoi richiedere anche stem separati per future lavorazioni.",
      },
      {
        type: "h2",
        text: "Quanto tempo ci vuole per registrare una canzone",
      },
      {
        type: "p",
        text: "I tempi variano in base alla complessità del brano e alla preparazione dell'artista. Una traccia semplice con un solo vocalist ben preparato può essere registrata e editata in 2-3 ore. Il mix richiede in genere 2-4 ore aggiuntive, mentre il master si completa in 30-60 minuti. Pianifica la tua sessione con il fonico prima di prenotare per avere una stima precisa.",
      },
      { type: "cta" },
    ],
  },

  {
    slug: "costo-studio-registrazione-bari-2026",
    title: "Quanto Costa Uno Studio di Registrazione a Bari nel 2026: Prezzi e Servizi",
    description:
      "Scopri quanto costa registrare una canzone a Bari nel 2026. Prezzi per recording, mix e master, produzione e noleggio studio.",
    date: "2026-01-22",
    readingTime: "5 min",
    keywords: [
      "quanto costa studio registrazione Bari",
      "costo studio Bari",
      "prezzi mix master Bari",
      "studio economico Bari",
      "tariffe studio musicale Bari",
    ],
    sections: [
      {
        type: "p",
        text: "Uno dei dubbi più comuni per chi vuole registrare una canzone a Bari è capire quanto costi davvero uno studio di registrazione professionale. La risposta dipende da numerosi fattori, e conoscerli ti permette di pianificare il budget in modo intelligente senza rinunciare alla qualità.",
      },
      {
        type: "h2",
        text: "Fattori che influenzano il costo di una sessione in studio",
      },
      {
        type: "p",
        text: "Il prezzo di una sessione di registrazione non è mai uguale per tutti. Diversi elementi contribuiscono a determinare il costo finale, ed è importante capirli prima di fare confronti tra studi diversi.",
      },
      {
        type: "ul",
        items: [
          "L'esperienza e le credenziali del fonico: un engineer del suono con un portfolio di dischi d'oro certificati ha una tariffa diversa rispetto a chi inizia",
          "L'attrezzatura: microfoni di alta gamma, preamp professionali e monitor da studio di riferimento fanno una differenza enorme nel suono finale",
          "L'acustica della sala: studi costruiti o trattati professionalmente garantiscono registrazioni pulite senza artefatti sonori",
          "Il tipo di servizio richiesto: recording, mix, master o produzione completa hanno costi diversi",
          "La durata della sessione e la complessità del progetto",
        ],
      },
      {
        type: "h2",
        text: "Tariffa oraria vs pacchetto completo",
      },
      {
        type: "p",
        text: "Gli studi di registrazione solitamente offrono due modalità di tariffazione: a tariffa oraria o con pacchetti fissi. La tariffa oraria è ideale se hai un progetto semplice o vuoi testare lo studio senza impegni. I pacchetti completi convengono quando hai più brani da realizzare o quando vuoi includere recording, mix e master in un'unica soluzione.",
      },
      {
        type: "highlight",
        text: "Al 19.98 Recording Studio offriamo sia sessioni orarie che pacchetti su misura. Contattaci per un preventivo personalizzato in base alle tue esigenze: ogni progetto è diverso e meritiamo di conoscerlo prima di quotarti.",
      },
      {
        type: "h2",
        text: "Costo del recording al 19.98 Studio",
      },
      {
        type: "p",
        text: "Il servizio di recording al 19.98 include la sala di registrazione professionale, il microfono adeguato alla tua voce, il fonico che gestisce la sessione, il headphone mix personalizzato e l'editing della traccia vocale. Il tutto a partire da tariffe competitive rispetto agli standard del settore nel Sud Italia.",
      },
      {
        type: "h2",
        text: "Costo del mix e master",
      },
      {
        type: "p",
        text: "Il mix è il servizio che trasforma le tracce grezze in un brano finito. Include bilanciamento dei volumi, EQ, compressione, effetti e stereo image. Il master è la fase successiva che porta il brano agli standard delle piattaforme streaming. Entrambi i servizi sono disponibili a partire da tariffe orarie o come pacchetto combinato.",
      },
      {
        type: "h2",
        text: "Costo della produzione musicale",
      },
      {
        type: "p",
        text: "La produzione musicale è il servizio più completo e include la creazione della base musicale, il sound design, l'arrangiamento, la direzione artistica e il coordinamento di tutte le fasi produttive. È pensato per artisti che vogliono costruire il loro suono da zero con il supporto di un producer esperto.",
      },
      {
        type: "h2",
        text: "Quanto costa il noleggio della sala studio",
      },
      {
        type: "p",
        text: "Il noleggio studio è la soluzione ideale per producer, beatmaker e team creativi che vogliono utilizzare la sala senza il supporto tecnico del fonico. Il costo è più contenuto rispetto alle sessioni con engineer, ma richiede che il locatario abbia già le competenze tecniche per gestire in autonomia l'attrezzatura.",
      },
      {
        type: "h2",
        text: "Home recording vs studio professionale: il confronto economico reale",
      },
      {
        type: "p",
        text: "Molti artisti pensano che l'home recording sia la soluzione più economica, ma il calcolo è più complesso di quanto sembri. Attrezzare una home studio dignitosa richiede un investimento iniziale importante: un buon microfono a condensatore, una scheda audio professionale, un paio di monitor da studio, trattamento acustico della stanza e il software DAW. Sommando tutto, si arriva facilmente a cifre significative prima ancora di registrare la prima nota.",
      },
      {
        type: "highlight",
        text: "Un singolo professionale realizzato al 19.98 Studio, dalla registrazione al master, può costare meno di quanto pensi. E il risultato finale è paragonabile a quello di artisti con distribuzioni nazionali.",
      },
      {
        type: "h2",
        text: "Cosa è incluso nel prezzo al 19.98",
      },
      {
        type: "p",
        text: "Quando prenoti una sessione al 19.98 Recording Studio di Bari, il prezzo include sempre la sala trattata acusticamente, l'attrezzatura professionale, il fonico dedicato alla sessione, la consegna dei file finali in alta qualità e il supporto pre e post sessione. Non ci sono costi nascosti o supplementi imprevisti.",
      },
      {
        type: "ul",
        items: [
          "Sala di registrazione trattata acusticamente",
          "Microfoni e preamp di alta gamma",
          "Fonico dedicato per tutta la durata della sessione",
          "Editing e comping delle tracce",
          "Consegna file WAV e MP3 in alta qualità",
          "Supporto via messaggio per dubbi post-sessione",
        ],
      },
      {
        type: "h2",
        text: "Come richiedere un preventivo personalizzato",
      },
      {
        type: "p",
        text: "Il modo migliore per capire il costo esatto della tua sessione è contattarci direttamente. Descrivi il tuo progetto — quanti brani, che tipo di registrazione ti serve, se hai già una base o hai bisogno di produzione — e ti risponderemo con un preventivo chiaro entro 24 ore.",
      },
      { type: "cta" },
    ],
  },

  {
    slug: "differenza-mix-master-guida",
    title: "Differenza tra Mix e Master: Guida Completa per Artisti e Producer",
    description:
      "Confusi tra mixing e mastering? Questa guida spiega la differenza, perché entrambi sono essenziali e come ottenerli al meglio.",
    date: "2026-02-01",
    readingTime: "7 min",
    keywords: [
      "differenza mix master",
      "cos'è il mixing",
      "cos'è il mastering",
      "mix master professionale",
      "mastering per streaming",
    ],
    sections: [
      {
        type: "p",
        text: "Mixing e mastering sono due dei termini più usati nel mondo della produzione musicale, eppure moltissimi artisti li confondono o li trattano come sinonimi. Sono invece due fasi distinte e complementari, ognuna con obiettivi precisi. Capire la differenza ti aiuta a prendere decisioni migliori per il tuo progetto musicale.",
      },
      {
        type: "h2",
        text: "Cos'è il mixing",
      },
      {
        type: "p",
        text: "Il mixing è il processo di bilanciamento e lavorazione di tutte le tracce audio che compongono un brano. Il mix engineer prende le tracce grezze registrate in studio — voce, basso, batteria, chitarre, sintetizzatori, effetti — e le lavora fino a creare un insieme coerente e piacevole all'ascolto.",
      },
      {
        type: "h3",
        text: "Gli strumenti principali del mixing",
      },
      {
        type: "ul",
        items: [
          "EQ (equalizzatore): taglia o esalta le frequenze di ogni traccia per evitare conflitti e migliorare la chiarezza",
          "Compressore: controlla la dinamica della performance, rendendo il suono più coerente e presente",
          "Reverb: aggiunge profondità spaziale, simulando ambienti acustici reali o immaginari",
          "Delay: crea echi e ripetizioni che arricchiscono il tessuto sonoro",
          "Panning: distribuisce i suoni nel campo stereo, da sinistra a destra",
          "Stereo image: allarga o restringe la percezione dello spazio del brano",
        ],
      },
      {
        type: "p",
        text: "Un buon mix fa sì che ogni elemento del brano abbia il suo spazio sonoro, senza che nessuna traccia sovrasti le altre. La voce deve essere intelligibile, la cassa deve spingere, il basso deve essere incisivo ma non coprire le medie frequenze. Questo equilibrio richiede anni di esperienza per essere padroneggiato.",
      },
      {
        type: "h2",
        text: "Cos'è il mastering",
      },
      {
        type: "p",
        text: "Il mastering è la fase finale della post-produzione. Mentre il mix lavora sulle singole tracce all'interno di un brano, il mastering lavora sul mixdown finale — cioè il file stereo che risulta dal mix — e lo prepara per la distribuzione. Il master engineer ottimizza il suono per i diversi formati e piattaforme di distribuzione.",
      },
      {
        type: "h3",
        text: "Gli strumenti principali del mastering",
      },
      {
        type: "ul",
        items: [
          "Multiband compressor: lavora su specifiche bande di frequenza del mixdown finale",
          "Limiter: imposta il livello massimo del segnale, prevenendo il clipping",
          "LUFS meter: misura il loudness integrato secondo gli standard delle piattaforme streaming",
          "Mid/Side EQ: lavora separatamente sul centro e sui lati del campo stereo",
          "Dithering: processo tecnico che prepara il file per la riduzione di bit depth",
        ],
      },
      {
        type: "p",
        text: "Un brano masterizzato professionalmente raggiunge il livello di loudness richiesto da Spotify, Apple Music e le altre piattaforme (tipicamente -14 LUFS per lo streaming) senza perdere dinamica o qualità. Il master assicura anche che il brano suoni coerente con gli altri brani dell'artista o dell'album.",
      },
      {
        type: "highlight",
        text: "Il target LUFS per Spotify è -14 LUFS integrati. Se il tuo brano è più forte, la piattaforma lo abbasserà automaticamente. Se è più debole, sembrerà meno professionale rispetto agli altri brani in playlist. Il mastering risolve questo problema.",
      },
      {
        type: "h2",
        text: "Perché mixing e mastering sono fasi separate",
      },
      {
        type: "p",
        text: "Molti si chiedono perché non sia possibile fare tutto in un unico passaggio. La risposta è tecnica: durante il mix, le casse audio del mix engineer sono calibrate per sentire ogni minimo dettaglio delle singole tracce. Durante il master, la prospettiva cambia completamente: si lavora sull'insieme, con riferimento ad altri brani del genere e con attenzione alla coerenza tra tracce diverse.",
      },
      {
        type: "p",
        text: "Separare le due fasi garantisce anche una maggiore freschezza d'ascolto. Ascoltare il mixdown con orecchie fresche dopo un giorno o due permette di individuare problemi che dopo ore di mix sarebbero passati inosservati.",
      },
      {
        type: "h2",
        text: "Gli errori più comuni degli artisti",
      },
      {
        type: "ul",
        items: [
          "Portare in mix tracce con clipping o rumore di fondo: crea problemi insormontabili nel mixdown",
          "Credere che il master 'sistemi' un mix difettoso: il master migliora un buon mix, non salva uno cattivo",
          "Non fornire reference track al mix engineer: senza un riferimento sonoro, il risultato può divergere dall'idea dell'artista",
          "Mandare al master un mixdown con headroom insufficiente: il file WAV deve avere almeno -6 dBFS di headroom",
          "Saltare il mastering pensando che 'tanto poi si sente lo stesso': la differenza è sempre percepibile su impianti di qualità",
        ],
      },
      {
        type: "h2",
        text: "Quanto tempo richiedono mixing e mastering",
      },
      {
        type: "p",
        text: "Il tempo dipende dalla complessità del brano. Un brano pop o rap con una struttura semplice può essere mixato in 3-5 ore. Un brano con molti strati strumentali, cori multipli e effetti complessi può richiedere 8-12 ore di lavoro. Il mastering di un singolo richiede generalmente 30-60 minuti; un album intero può richiedere una giornata.",
      },
      {
        type: "h2",
        text: "Perché affidarsi a un professionista",
      },
      {
        type: "p",
        text: "Mixing e mastering 'in the box' con plugin gratuiti sono diventati accessibili a tutti, ma la differenza tra un mix fatto da un professionista con anni di esperienza e uno fatto in autonomia è spesso evidente al primo ascolto. L'esperienza di un mix engineer professionista non riguarda solo la conoscenza dei plugin, ma la capacità di ascoltare, interpretare e realizzare il sound che l'artista ha in testa.",
      },
      {
        type: "highlight",
        text: "Al 19.98 Recording Studio di Bari, il servizio di mix e master è curato da fonici con esperienza su dischi d'oro certificati. Il risultato finale è ottimizzato per le piattaforme streaming e pronto per la distribuzione.",
      },
      { type: "cta" },
    ],
  },

  {
    slug: "come-scegliere-producer-musicale",
    title: "Come Scegliere il Producer Giusto per il Tuo Progetto Musicale",
    description:
      "Trovare il producer musicale giusto a Bari è fondamentale. Scopri i criteri per sceglierlo e come lavorare al meglio in studio.",
    date: "2026-02-10",
    readingTime: "6 min",
    keywords: [
      "producer musicale Bari",
      "beatmaker Bari",
      "produzione musicale Bari",
      "come scegliere producer",
      "direzione artistica musica",
    ],
    sections: [
      {
        type: "p",
        text: "Scegliere il producer giusto è una delle decisioni più importanti che un artista possa fare. Il producer non è semplicemente chi crea il beat: è il co-autore sonoro del tuo progetto, il direttore artistico che trasforma le tue idee in musica concreta. Scegliere male può significare mesi di lavoro persi e un risultato che non ti rappresenta.",
      },
      {
        type: "h2",
        text: "Il vero ruolo del producer musicale",
      },
      {
        type: "p",
        text: "Il producer musicale moderno ha un ruolo che va ben oltre la creazione dei beat. Si occupa della direzione artistica del progetto, definisce la sound palette — cioè l'insieme dei suoni e degli strumenti che caratterizzeranno il tuo lavoro — cura l'arrangiamento dei brani e spesso guida l'artista nelle scelte melodiche, armoniche e testuali.",
      },
      {
        type: "ul",
        items: [
          "Creazione e adattamento dei beat al tuo stile e alla tua voce",
          "Direzione artistica: consigliare tono, mood e posizionamento del progetto",
          "Sound design: costruire suoni originali che diventino la tua firma sonora",
          "Arrangiamento: decidere quali elementi aggiungere, togliere o modificare",
          "Coaching in studio: aiutarti a dare il meglio nelle sessioni di registrazione",
        ],
      },
      {
        type: "h2",
        text: "Come valutare il portfolio di un producer",
      },
      {
        type: "p",
        text: "Prima di contattare un producer, ascolta attentamente il suo portfolio. Non limitarti a sentire se i beat 'suonano bene' in astratto: cerca di capire se il suo stile è compatibile con quello che vuoi comunicare tu. Un producer specializzato in trap potrebbe non essere la scelta giusta se il tuo progetto è pop romantico, e viceversa.",
      },
      {
        type: "h3",
        text: "Generi musicali e specializzazioni",
      },
      {
        type: "p",
        text: "Al 19.98 Recording Studio di Bari lavoriamo con producer specializzati in diversi generi: rap, trap, pop, RnB, afrobeat e musica italiana contemporanea. Ogni genere ha le sue regole sonore, le sue frequenze tipiche, i suoi arrangiamenti caratteristici. Scegliere un producer che conosce bene il tuo genere di riferimento è fondamentale per ottenere un risultato credibile.",
      },
      {
        type: "h2",
        text: "La compatibilità artistica",
      },
      {
        type: "p",
        text: "La compatibilità artistica è difficile da quantificare ma fondamentale per il successo del progetto. Quando parli con un producer per la prima volta, nota se capisce intuitivamente quello che stai cercando, se fa domande intelligenti sul tuo progetto, se propone reference track che senti vicine al tuo gusto. Un buon producer è prima di tutto un buon ascoltatore.",
      },
      {
        type: "highlight",
        text: "Porta sempre delle reference track alla prima riunione con il producer. Sono i brani che ami di più o che si avvicinano di più al suono che vuoi ottenere. Le reference sono il linguaggio comune più efficace tra artista e producer.",
      },
      {
        type: "h2",
        text: "Comunicazione durante le sessioni",
      },
      {
        type: "p",
        text: "Una sessione di produzione richiede comunicazione costante. Non aver paura di dire quando qualcosa non ti convince: il producer non si offende, è il suo lavoro trovare la soluzione giusta. Descrivere le sensazioni in modo onesto — 'questa strofa mi sembra troppo piena', 'il ritornello non mi spinge abbastanza' — è più utile di un generico 'non so, non mi convince'.",
      },
      {
        type: "h2",
        text: "Le domande giuste da fare prima di iniziare",
      },
      {
        type: "ul",
        items: [
          "Hai già lavorato con artisti del mio genere musicale? Puoi farmi ascoltare qualcosa?",
          "Come gestisci le revisioni se il risultato non mi soddisfa?",
          "Sei disponibile anche tra una sessione e l'altra per scambi di idee?",
          "Quali sono i tempi di consegna per la produzione di un singolo?",
          "Come gestiamo i diritti autorali sui brani prodotti insieme?",
        ],
      },
      {
        type: "h2",
        text: "Red flag da evitare",
      },
      {
        type: "p",
        text: "Non tutti i producer sono adatti a ogni artista. Ci sono segnali da non ignorare durante la prima fase di conoscenza: un producer che non ti ascolta e impone la sua visione senza confronto, chi promette risultati irrealistici in tempi impossibili, chi non è trasparente sui costi e sui diritti dei brani prodotti.",
      },
      {
        type: "ul",
        items: [
          "Non ascolta le reference track che porti o le ignora",
          "Non ha un portfolio chiaro o non vuole mostrare lavori precedenti",
          "Non chiarisce i termini economici prima di iniziare a lavorare",
          "Promette 'lo facciamo in un'ora' per brani complessi",
          "Non rispetta i tuoi tempi di risposta o di feedback",
        ],
      },
      {
        type: "h2",
        text: "Il processo di produzione al 19.98 Recording Studio",
      },
      {
        type: "p",
        text: "Al 19.98 Studio, ogni progetto di produzione inizia con una sessione conoscitiva dove ascoltiamo le tue idee, le tue reference track e capiamo il posizionamento artistico che vuoi raggiungere. Solo dopo questa fase iniziamo il lavoro sulle basi e sull'arrangiamento, così da essere certi di muoverci nella direzione giusta fin dal primo giorno.",
      },
      {
        type: "highlight",
        text: "Non sei sicuro di quale producer scegliere? Prenota una sessione conoscitiva al 19.98: ti aiutiamo a capire quale direzione musicale si adatta meglio al tuo progetto, senza impegni.",
      },
      { type: "cta" },
    ],
  },

  {
    slug: "studio-registrazione-1998-chi-siamo",
    title: "19.98 Recording Studio Bari: Chi Siamo, Storia e Servizi",
    description:
      "Scopri il 19.98 Recording Studio di Bari: la nostra storia, i servizi offerti, i risultati certificati e perché sceglierci per il tuo progetto.",
    date: "2026-02-18",
    readingTime: "5 min",
    keywords: [
      "19.98 recording studio Bari",
      "1998 studio Bari",
      "studio registrazione professionale Bari",
      "storia studio Bari",
      "dischi oro Bari",
    ],
    sections: [
      {
        type: "p",
        text: "Il 19.98 Recording Studio nasce a Bari con un obiettivo preciso: offrire agli artisti del territorio un punto di riferimento professionale per la produzione musicale, senza dover necessariamente spostarsi nelle grandi città. Uno studio dove la qualità del suono non è un optional ma il fondamento di ogni sessione.",
      },
      {
        type: "h2",
        text: "La nostra storia",
      },
      {
        type: "p",
        text: "Il nome 19.98 nasce come un omaggio simbolico alla passione per la musica e all'autenticità del suono. Abbiamo costruito lo studio partendo da una visione chiara: creare uno spazio dove gli artisti possano sentirsi a proprio agio, dove l'attrezzatura sia sempre all'altezza delle ambizioni del progetto e dove il team tecnico abbia la competenza per realizzare qualsiasi visione sonora.",
      },
      {
        type: "h2",
        text: "La nostra location a Bari",
      },
      {
        type: "p",
        text: "Siamo situati in Via Umberto Minervini 25, Bari. Lo studio è facilmente raggiungibile e dispone di uno spazio accogliente per artisti, team e collaboratori. La sala di registrazione è trattata acusticamente per garantire la massima qualità di cattura del suono, mentre la sala regia è equipaggiata con tutto il necessario per sessioni di mix e produzione ad alto livello.",
      },
      {
        type: "h2",
        text: "La nostra filosofia di lavoro",
      },
      {
        type: "p",
        text: "Crediamo che ogni sessione in studio debba essere un'esperienza positiva oltre che produttiva. Questo significa organizzazione impeccabile — nessun tempo sprecato per setup non preparati — massima cura del suono in ogni fase del processo, e un approccio collaborativo che mette l'artista al centro di ogni decisione creativa.",
      },
      {
        type: "ul",
        items: [
          "Setup già pronto quando l'artista arriva: nessun minuto perso",
          "Ascolto attivo: capire cosa l'artista vuole prima di iniziare a lavorare",
          "Feedback onesto: se qualcosa può essere migliorato, lo diciamo",
          "Rispetto dei tempi: consegna dei file entro le scadenze concordate",
        ],
      },
      {
        type: "h2",
        text: "I risultati certificati",
      },
      {
        type: "p",
        text: "Uno degli aspetti che distingue il 19.98 Recording Studio dagli altri studi di Bari sono i risultati concreti e certificati. Abbiamo contribuito alla realizzazione di brani che hanno ottenuto dischi d'oro ufficiali, riconoscimento delle major discografiche italiane per aver superato le soglie di streaming e vendite richieste dalla certificazione FIMI.",
      },
      {
        type: "highlight",
        text: "I dischi d'oro certificati sono il risultato di un lavoro di squadra tra artista, producer e fonico. Siamo orgogliosi di aver fatto parte di questi percorsi di successo e di continuare a supportare nuovi artisti nel raggiungimento dei loro obiettivi.",
      },
      {
        type: "h2",
        text: "Il nostro team",
      },
      {
        type: "p",
        text: "Il team del 19.98 è composto da fonici e producer con esperienza reale nel settore musicale italiano. Non siamo solo tecnici del suono: siamo appassionati di musica che capiscono le dinamiche dell'industria, conoscono le piattaforme di distribuzione e possono guidare gli artisti in ogni fase del loro percorso professionale.",
      },
      {
        type: "h2",
        text: "L'attrezzatura professionale",
      },
      {
        type: "p",
        text: "Lo studio è equipaggiato con hardware e software di riferimento nel settore: microfoni a condensatore di alta gamma per catturare ogni sfumatura vocale, preamp di qualità per preservare il calore del segnale analogico, monitor da studio calibrati per un ascolto di riferimento fedele e DAW professionale per la gestione di sessioni complesse.",
      },
      {
        type: "h2",
        text: "Chi lavora al 19.98",
      },
      {
        type: "p",
        text: "Nel corso degli anni abbiamo lavorato con artisti solisti, band, vocalist, rapper, cantanti pop, producer emergenti e team creativi di diversa provenienza. Ogni progetto porta con sé una storia unica, e noi ci impegniamo a capirla e valorizzarla con il massimo della cura tecnica e artistica.",
      },
      {
        type: "h2",
        text: "I nostri servizi completi",
      },
      {
        type: "ul",
        items: [
          "Recording professionale: voci, strumenti, overdub con fonico dedicato",
          "Produzione musicale: dalla direzione artistica al beat finito",
          "Mix e Master: ottimizzazione per streaming e distribuzione fisica",
          "Noleggio studio: sala disponibile per producer e team creativi autonomi",
        ],
      },
      {
        type: "h2",
        text: "Perché scegliere il 19.98 per il tuo progetto",
      },
      {
        type: "p",
        text: "Scegliere il 19.98 Recording Studio significa affidarsi a un team che ha dimostrato i propri risultati con certificazioni reali, che lavora con serietà e passione e che ha a cuore il successo del tuo progetto tanto quanto il tuo. Che tu sia un artista emergente alla prima registrazione o un professionista che cerca un nuovo punto di riferimento a Bari, siamo qui per supportarti.",
      },
      {
        type: "highlight",
        text: "Vuoi venire a visitare lo studio prima di prenotare? Scrivici o chiamaci: siamo disponibili per un sopralluogo e per rispondere a tutte le tue domande senza impegno.",
      },
      { type: "cta" },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
