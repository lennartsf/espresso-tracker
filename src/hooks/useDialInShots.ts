import { useMemo } from 'react'
import { useShots } from './useShots'
import type { DialInShot } from '../utils/dialIn'

/**
 * Die Shots, mit denen der Dial-in-Algorithmus rechnet — EINE Quelle für alle
 * Aufrufer.
 *
 * **Warum eigens ein Hook.** NewShot und der Analyse-Tab haben denselben
 * Vorschlag aus verschiedenen Datenmengen gerechnet und deshalb verschiedene
 * Zahlen ausgegeben: NewShot nahm alle Shots, die Analyse filterte auf
 * `drink_type in ('espresso','caffe_crema')`. Bei gleicher Bohne, gleichem
 * Rezept und gleichem Sieb kamen zwei Antworten heraus. Solange die
 * Entscheidung „was füttert den Algorithmus" an zwei Stellen getroffen wird,
 * driftet sie wieder auseinander.
 *
 * **Warum Milchgetränke dazugehören.** Ein Cappuccino ist ein Espresso mit
 * Milch obendrauf. Mahlgrad, Dosis und Durchlaufzeit entstehen beim Bezug,
 * also genau da, wo der Algorithmus hinsieht; `drink_type` beschreibt nur, was
 * DANACH passiert. Diese Shots auszuschließen wirft gültige Messwerte weg —
 * bei jemandem, der überwiegend Milchgetränke protokolliert, sogar die meisten.
 *
 * Gefiltert wird erst in `suggestGrind`/`learnGrinder`, nach Mühle und Sieb.
 * Was hier herausfiele, wäre für immer weg.
 */
export function useDialInShots(): DialInShot[] {
  const { data: shots = [] } = useShots()
  return useMemo(
    () =>
      shots.map(s => ({
        grind_setting: s.grind_setting,
        brew_time_s: s.brew_time_s,
        coffee_id: s.coffee_id,
        grinder_id: s.grinder_id,
        basket_id: s.basket_id,
      })),
    [shots],
  )
}
