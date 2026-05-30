export interface GlossaryTerm {
  term: string
  definition: string
  category: 'espresso' | 'brew' | 'equipment' | 'milch'
}

const GLOSSARY_RAW: GlossaryTerm[] = [
  // Espresso
  { term: 'Bloom', category: 'brew', definition: 'Kurzes Vorbrühen mit wenig Wasser (ca. 2× Kaffeemenge), damit CO₂ entweichen kann. Verbessert die Extraktion bei Pour-Over-Methoden.' },
  { term: 'Body', category: 'espresso', definition: 'Das Mundgefühl des Espressos — wie cremig, dick und vollmundig er sich anfühlt. Wird von Ölen und Kolloiden im Extrakt bestimmt.' },
  { term: 'Brew Ratio', category: 'espresso', definition: 'Verhältnis von Kaffeemenge (Dose) zu Extraktgewicht (Yield). Ein typischer Espresso hat 1:2 — z.B. 18 g Kaffee → 36 g Extrakt.' },
  { term: 'Brühgruppe', category: 'equipment', definition: 'Das Bauteil der Espressomaschine, an dem der Siebträger eingehängt wird. Leitet Wasser mit konstantem Druck durch das Kaffeemehl.' },
  { term: 'Brühtemperatur', category: 'espresso', definition: 'Temperatur des Wassers beim Durchlaufen des Kaffeemehls. Typisch 88–96°C für Espresso. Zu heiß = Überextraktion, zu kalt = Unterextraktion.' },
  { term: 'Brühzeit', category: 'espresso', definition: 'Zeit vom Start bis zum Ende des Espresso-Bezugs. Typisch 25–35 Sekunden. Stark beeinflusst durch Mahlgrad und Tampdruck.' },
  { term: 'Burr', category: 'equipment', definition: 'Die Mahlscheibe in einer Mühle. Flat Burrs (flach, ringförmig) oder Conical Burrs (konisch) mahlen das Kaffeemehl zwischen zwei Scheiben.' },
  { term: 'Channeling', category: 'espresso', definition: 'Wasser bricht durch einen Kanal im Kaffeepuck statt gleichmäßig durchzufließen. Führt zu ungleichmäßiger Extraktion, saurem oder bitterem Ergebnis.' },
  { term: 'Crema', category: 'espresso', definition: 'Die goldbraune Schaumschicht auf dem Espresso. Entsteht durch CO₂-Bläschen, die sich in Fett und Emulgatoren lösen. Zeigt Frische und Druck.' },
  { term: 'Dampflanze', category: 'equipment', definition: 'Metallrohr an der Espressomaschine zum Aufschäumen von Milch. Injiziert Dampf, der Luft einarbeitet und die Milch erhitzt.' },
  { term: 'Dose', category: 'espresso', definition: 'Die abgewogene Menge Kaffeemehl in Gramm, die in den Siebträger gegeben wird. Typisch 16–20 g für Espresso.' },
  { term: 'Druck', category: 'espresso', definition: 'Wasserdruck beim Espresso-Bezug, gemessen in Bar. Standard sind 9 Bar. Einige Maschinen erlauben Profilierung (variables Druckprofil).' },
  { term: 'Dualboiler', category: 'equipment', definition: 'Maschinentyp mit zwei getrennten Boilern — einer für Brühwasser, einer für Dampf. Ermöglicht simultanes Brühen und Aufschäumen bei optimaler Temperatur.' },
  { term: 'Einkreiser', category: 'equipment', definition: 'Einfachster Maschinentyp mit einem Boiler für alles. Kann nicht gleichzeitig brühen und dampfen — man muss warten bis die Temperatur wechselt.' },
  { term: 'Espresso', category: 'espresso', definition: 'Konzentriertes Kaffeegetränk, hergestellt durch Pressen von heißem Wasser mit ~9 Bar Druck durch fein gemahlenen Kaffee. Basis vieler Milchgetränke.' },
  { term: 'Extraktion', category: 'espresso', definition: 'Prozess, bei dem Aromen, Öle und lösliche Stoffe aus dem Kaffeemehl ins Wasser übergehen. Ziel ist eine ausgewogene Extraktion (18–22% EY).' },
  { term: 'Extraktionsausbeute (EY)', category: 'espresso', definition: 'Prozentsatz der löslichen Stoffe, die aus dem Kaffeemehl extrahiert wurden. Ideal: 18–22%. Gemessen mit einem Refraktometer.' },
  { term: 'Filterkaffee', category: 'brew', definition: 'Brühmethode, bei der Wasser durch gemahlenen Kaffee und einen Filter läuft. Ergibt einen klaren, leichteren Kaffee ohne Sediment.' },
  { term: 'Flachscheibe (Flat Burr)', category: 'equipment', definition: 'Mahlscheibenform mit zwei parallelen ringförmigen Scheiben. Mahlt gleichmäßig und produziert eine einheitliche Partikelgröße. Typisch für High-End-Mühlen.' },
  { term: 'French Press', category: 'brew', definition: 'Brühmethode, bei der grob gemahlener Kaffee in heißem Wasser zieht und anschließend mit einem Stempel (Plunger) getrennt wird.' },
  { term: 'Inverted (AeroPress)', category: 'brew', definition: 'Umgekehrte AeroPress-Methode: Gerät steht auf dem Kolben, Kaffee zieht länger bevor gefiltert wird. Gibt mehr Kontrolle über Ziehzeit.' },
  { term: 'Kegelscheibe (Conical Burr)', category: 'equipment', definition: 'Mahlscheibenform mit kegelförmigem Innen- und ringförmigem Außenburr. Mahlt etwas bimodal — produziert Fein- und Grobpartikel. Häufig in günstigen Mühlen.' },
  { term: 'Leveler', category: 'equipment', definition: 'Werkzeug zum gleichmäßigen Verteilen und Nivellieren des Kaffeemehls im Sieb nach dem Einschleifen. Reduziert Channeling.' },
  { term: 'Latte Art', category: 'milch', definition: 'Technik zum Erzeugen von Mustern (Herz, Blatt, Tulpe) auf Milchgetränken durch gezieltes Eingießen von aufgeschäumter Milch.' },
  { term: 'Mahlgrad', category: 'espresso', definition: 'Einstellung an der Mühle, die bestimmt wie fein oder grob der Kaffee gemahlen wird. Feiner = langsamer Bezug, gröber = schnellerer Bezug.' },
  { term: 'Mikroschaum', category: 'milch', definition: 'Feinporiger, samtiger Milchschaum ohne sichtbare Blasen. Entsteht durch korrektes Stretching. Ideal für Latte Art und samtige Milchgetränke.' },
  { term: 'Moka Pot', category: 'brew', definition: 'Herdkanne, die durch Dampfdruck heißes Wasser durch Kaffeemehl drückt. Produziert kräftigen, espressoähnlichen Kaffee ohne Pumpe.' },
  { term: 'Overextraction', category: 'espresso', definition: 'Überextraktion — zu viele Bitterstoffe wurden aus dem Kaffee gelöst. Ergebnis: bitter, adstringierend, verbrannt. Ursache: zu fein, zu heiß, zu lang.' },
  { term: 'Puck', category: 'espresso', definition: 'Das gepresste Kaffeemehl im Siebträger nach dem Tampen. Ein guter Puck ist gleichmäßig, fest und wasserabweisend.' },
  { term: 'Pour Over', category: 'brew', definition: 'Handgebrühter Filterkaffee (V60, Chemex), bei dem Wasser manuell in kreisenden Bewegungen über den Kaffee gegossen wird.' },
  { term: 'Preinfusion', category: 'espresso', definition: 'Kurzes Vorwässern des Kaffeemehls mit niedrigem Druck (2–4 Bar) vor dem eigentlichen Bezug. Quillt den Puck gleichmäßig auf, reduziert Channeling.' },
  { term: 'Refraktometer', category: 'equipment', definition: 'Optisches Messgerät für die Konzentration gelöster Stoffe im Kaffee (TDS). Ermöglicht genaue Berechnung der Extraktionsausbeute.' },
  { term: 'RDT (Ross Droplet Technique)', category: 'equipment', definition: 'Methode: einen Tropfen Wasser auf die Bohnen geben vor dem Mahlen. Reduziert statische Aufladung und verhindert Ankleben des Mehls an der Mühle.' },
  { term: 'Röstgrad', category: 'espresso', definition: 'Dunkle Skala der Kaffeeröstung von hell (fruchtig, säurebetont) bis dunkel (schokoladig, bitter). Beeinflusst Mahlgrad und optimale Brühtemperatur.' },
  { term: 'Sieb', category: 'equipment', definition: 'Metallkorb im Siebträger mit Löchern, der das Kaffeemehl hält und das Wasser gleichmäßig verteilt. Verschiedene Größen (14–22 g) und Präzisionssiebe (VST, IMS).' },
  { term: 'Siebträger', category: 'equipment', definition: 'Der in die Brühgruppe eingespannte Griff mit Metallkorb (Sieb). Hält das Kaffeemehl während des Bezugs.' },
  { term: 'Stretching', category: 'milch', definition: 'Erste Phase des Milchaufschäumens: Dampflanze knapp unter der Oberfläche hält, Luft einarbeiten bis Volumen um ~50% zunimmt.' },
  { term: 'Stufenlose Mühle', category: 'equipment', definition: 'Mühle ohne eingerastete Stufen — Mahlgrad kann stufenlos (beliebig fein) eingestellt werden. Gibt mehr Präzision als Stufen-Mühlen.' },
  { term: 'Tampen', category: 'espresso', definition: 'Gleichmäßiges Pressen des Kaffeemehls im Sieb mit einem Tamper (ca. 15 kg Druck). Schafft eine gleichmäßige, dichte Oberfläche für den Wasserdurchfluss.' },
  { term: 'TDS (Total Dissolved Solids)', category: 'espresso', definition: 'Gesamtgehalt gelöster Feststoffe im Kaffee in Prozent. Espresso: 8–12%, Filterkaffee: 1–1,5%. Gemessen mit Refraktometer.' },
  { term: 'Texturing', category: 'milch', definition: 'Zweite Phase des Milchaufschäumens: Dampflanze tiefer setzen, Milch kreisen lassen und auf 60–65°C erhitzen. Integriert Schaum zu samtiger Konsistenz.' },
  { term: 'Thermoblock', category: 'equipment', definition: 'Einfaches Heizsystem, bei dem Wasser durch einen Metallblock erhitzt wird statt durch einen Boiler. Schnelles Aufheizen, aber weniger stabile Temperatur.' },
  { term: 'Underextraction', category: 'espresso', definition: 'Unterextraktion — zu wenig Aromen wurden gelöst. Ergebnis: sauer, wässrig, adstringierend. Ursache: zu grob, zu kalt, zu kurz.' },
  { term: 'V60', category: 'brew', definition: 'Pour-Over-Filter von Hario mit 60°-Winkel und Spiralrippen. Wasser wird in kreisenden Bewegungen gegossen. Ergibt klaren, aromatischen Kaffee.' },
  { term: 'WDT (Weiss Distribution Technique)', category: 'equipment', definition: 'Methode: mit einer dünnen Nadel oder speziellem Werkzeug das Kaffeemehl im Sieb aufwühlen und verteilen. Löst Klumpen auf, reduziert Channeling.' },
  { term: 'Yield', category: 'espresso', definition: 'Das Gewicht des extrahierten Espressos in der Tasse in Gramm. Zusammen mit der Dose ergibt es den Brew Ratio (z.B. 18 g Dose → 36 g Yield = 1:2).' },
  { term: 'Zweikreiser', category: 'equipment', definition: 'Maschinentyp mit einem Hauptboiler für Dampf und einem separaten Wärmetauscher für Brühwasser. Ermöglicht simultanes Brühen und Dampfen.' },
]

export const GLOSSARY: GlossaryTerm[] = GLOSSARY_RAW.sort((a, b) => a.term.localeCompare(b.term, 'de'))
