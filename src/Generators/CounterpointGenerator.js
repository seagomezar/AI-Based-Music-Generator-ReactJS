/**
 * CounterpointGenerator.js
 * Generador de contrapunto a dos voces basado en las reglas del clasicismo del siglo XVIII
 * y el tratado "Counterpoint: Based on Eighteenth-Century Practice" de Kent Kennan.
 *
 * Principios de Kennan implementados:
 * 1. Movimiento predominante: Preferencia estricta por el movimiento contrario (contrary motion).
 * 2. Intervalos verticales consonantes: Predominio de consonancias imperfectas (3ªs y 6ªs, y sus compuestas 10ªs y 13ªs).
 * 3. Prohibición de quintas, octavas y unísonos paralelos (Parallel 5ths & 8ves strictly forbidden).
 * 4. Control de quintas y octavas directas u ocultas por salto en la voz superior.
 * 5. Limitación de 3ªs o 6ªs paralelas consecutivas (máximo 2 a 3 consecutivas).
 * 6. Conducción melódica vocal y suave en el bajo (predominio de grados conjuntos y balance de saltos).
 * 7. Armonía tonal clásica clara (I - IV/ii - V - I) con cadencia auténtica final concluyendo en la tónica.
 */

import { MAJOR_SCALES, CURRENT_SOUNDS } from '../Constants.js';

const NOTE_SEMITONES = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7,
  'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

/**
 * Convierte un nombre de nota (ej. 'C#4', 'Bb2') a su número MIDI correspondiente.
 */
export function noteToMidi(noteStr) {
  if (!noteStr) return 60;
  const match = noteStr.match(/^([A-Ga-g][#b]?)([0-9])$/);
  if (!match) return 60;
  const letter = match[1];
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + (NOTE_SEMITONES[letter] || 0);
}

/**
 * Convierte un string de nota a la nomenclatura estándar de VexFlow (ej. 'C#5' -> 'c#/5').
 */
export function soundToVexKey(sound) {
  if (!sound) return 'c/4';
  const match = sound.match(/^([A-Ga-g][#b]?)([0-9])$/);
  if (!match) return sound.toLowerCase();
  return `${match[1].toLowerCase()}/${match[2]}`;
}

/**
 * Obtiene los 7 grados diatónicos únicos de la tonalidad especificada.
 */
export function getScaleDegrees(scaleKey) {
  const scale = MAJOR_SCALES[scaleKey] || MAJOR_SCALES['C'];
  return scale.slice(0, 7).map(n => n.replace(/[0-9]/g, ''));
}

/**
 * Genera la reserva de notas diatónicas para la segunda voz en clave de Fa (octavas 2 y 3).
 */
export function getBassPool(scaleKey) {
  const degrees = getScaleDegrees(scaleKey);
  const pool = [];
  [2, 3].forEach(oct => {
    degrees.forEach(deg => {
      pool.push(`${deg}${oct}`);
    });
  });
  // Tónica superior en octava 4 como límite superior opcional
  pool.push(`${degrees[0]}4`);
  pool.sort((a, b) => noteToMidi(a) - noteToMidi(b));
  return pool;
}

// Grados armónicos clásicos (1-indexados)
const TONIC_CHORD = [1, 3, 5];        // I
const DOMINANT_CHORD = [5, 7, 2];     // V
const SUBDOM_CHORD = [4, 6, 1];       // IV
const SUPERTONIC_CHORD = [2, 4, 6];   // ii
const SUBMED_CHORD = [6, 1, 3];       // vi

/**
 * Obtiene el grado de la escala (1 a 7) para una nota dada.
 */
export function getDegreeOfNote(noteStr, scaleKey) {
  const degrees = getScaleDegrees(scaleKey);
  const letter = noteStr.replace(/[0-9]/g, '');
  const idx = degrees.indexOf(letter);
  return idx === -1 ? 1 : idx + 1;
}

/**
 * Evalúa una nota candidata para el bajo según las reglas de contrapunto de Kennan.
 */
function evaluateKennanScore({
  candBass,
  sopranoNote,
  prevBass,
  prevSoprano,
  scaleKey,
  isFirstNote,
  isFinalNote,
  isPenultimate,
  consecutiveParallels,
  consecutiveBassNotes
}) {
  const mS = noteToMidi(sopranoNote);
  const mB = noteToMidi(candBass);
  const diff = mS - mB;

  // 1. La segunda voz debe permanecer por debajo de la melodía (sin cruce de voces)
  if (diff <= 2) return -10000;

  let score = 0;
  const mod12 = diff % 12;
  const sDeg = getDegreeOfNote(sopranoNote, scaleKey);
  const bDeg = getDegreeOfNote(candBass, scaleKey);

  // 2. Primera nota y Cadencia Final
  if (isFirstNote) {
    if (bDeg === 1) {
      score += 350; // La primera nota debe ser la tónica fundamental
      if (mod12 === 0) score += 60; // Octava con la tónica
      if (mod12 === 3 || mod12 === 4) score += 40; // Décima
    } else {
      score -= 300;
    }
  }

  if (isFinalNote) {
    if (bDeg !== 1) return -10000; // La resolución final DEBE ser en la tónica fundamental
    score += 500;
    if (mod12 === 0) score += 120; // Octava pura sobre la tónica
  }

  if (isPenultimate) {
    // Preparación de cadencia sobre la dominante (grado 5 o grado 2)
    if (bDeg === 5 || bDeg === 2 || bDeg === 7) score += 180;
  }

  // 3. Intervalos verticales consonantes vs disonantes (Kennan, Cap. 2)
  if (mod12 === 3 || mod12 === 4) {
    score += 70; // 3ª o 10ª: Consonancia imperfecta ideal
  } else if (mod12 === 8 || mod12 === 9) {
    score += 65; // 6ª o 13ª: Consonancia imperfecta ideal
  } else if (mod12 === 7) {
    score += 35; // 5ª o 12ª: Consonancia perfecta
  } else if (mod12 === 0) {
    score += (isFirstNote || isFinalNote) ? 70 : 20; // Octava en inicio/fin, moderada en el centro
  } else if (mod12 === 5) {
    // En contrapunto a 2 voces, la 4ª con el bajo es considerada DISONANCIA
    score -= 90;
  } else {
    // 2ª, 7ª, tritono en tiempo fuerte
    score -= 100;
  }

  // Rango cómodo y separación equilibrada (7 a 20 semitonos)
  if (diff >= 7 && diff <= 20) {
    score += 30;
  } else if (diff > 24) {
    score -= (diff - 24) * 6;
  }

  // 4. Armonía clara (Acordes clásicos diatonicos I, ii, IV, V, vi)
  const isHarmonic =
    (TONIC_CHORD.includes(sDeg) && TONIC_CHORD.includes(bDeg)) ||
    (DOMINANT_CHORD.includes(sDeg) && DOMINANT_CHORD.includes(bDeg)) ||
    (SUBDOM_CHORD.includes(sDeg) && SUBDOM_CHORD.includes(bDeg)) ||
    (SUPERTONIC_CHORD.includes(sDeg) && SUPERTONIC_CHORD.includes(bDeg)) ||
    (SUBMED_CHORD.includes(sDeg) && SUBMED_CHORD.includes(bDeg));
  if (isHarmonic) score += 45;

  // 5. Conducción de voces frente a la nota previa
  if (prevBass && prevSoprano) {
    const prevMs = noteToMidi(prevSoprano);
    const prevMb = noteToMidi(prevBass);
    const prevDiff = prevMs - prevMb;
    const prevMod12 = prevDiff % 12;

    const ds = Math.sign(mS - prevMs);
    const db = Math.sign(mB - prevMb);

    // REGLA DE ORO DE KENNAN: Prohibición estricta de 5ªs y 8ªs paralelas
    if (mod12 === 7 && prevMod12 === 7 && ds === db && ds !== 0) {
      return -5000;
    }
    if (mod12 === 0 && prevMod12 === 0 && ds === db && ds !== 0) {
      return -5000;
    }

    // Quintas u octavas directas/ocultas por salto en voz superior
    if ((mod12 === 7 || mod12 === 0) && ds === db && ds !== 0 && Math.abs(mS - prevMs) > 2) {
      score -= 220;
    }

    // Movimiento contrario (Contrary motion) - Regla fundamental
    if (ds * db < 0) {
      score += 50;
    } else if (ds === 0 || db === 0) {
      score += 25; // Movimiento oblicuo
    }

    // Control de 3ªs y 6ªs paralelas consecutivas
    const isParallelThirdOrSixth =
      ((mod12 === 3 || mod12 === 4) && (prevMod12 === 3 || prevMod12 === 4)) ||
      ((mod12 === 8 || mod12 === 9) && (prevMod12 === 8 || prevMod12 === 9));

    if (isParallelThirdOrSixth && ds === db && ds !== 0) {
      if (consecutiveParallels >= 2) {
        score -= 45; // Evitar monotonía de más de 2 paralelas seguidas
      } else {
        score += 15;
      }
    }

    // Conducción melódica del bajo (Vocal y Cantabile)
    const bassStep = Math.abs(mB - prevMb);
    if (bassStep <= 2 && bassStep > 0) {
      score += 40; // Grado conjunto (máxima fluidez)
    } else if (bassStep <= 5) {
      score += 20; // Salto consonante pequeño (3ª, 4ª)
    } else if (bassStep === 7 || bassStep === 12) {
      score += 15; // Salto de 5ª o de 8ª (muy característico del bajo armónico)
    } else if (bassStep > 12) {
      score -= 90; // Salto desmesurado
    } else if (bassStep === 6) {
      score -= 120; // Salto melódico de tritono prohibido
    }

    // Evitar repetición estática excesiva de la misma nota en el bajo
    if (candBass === prevBass) {
      if (consecutiveBassNotes >= 2) {
        score -= 80;
      } else {
        score -= 20;
      }
    }
  }

  return score;
}

/**
 * Resuelve el nombre real de una nota del soprano para cualquier tonalidad.
 */
export function resolveSopranoSound(note, scaleKey = 'C') {
  if (!note) return 'C4';
  if (note.soundName) return note.soundName;
  if (typeof note.sound === 'string') return note.sound;
  const scale = MAJOR_SCALES[scaleKey] || MAJOR_SCALES['C'];
  if (typeof note.sound === 'number') {
    const clampedIdx = Math.max(0, Math.min(note.sound, scale.length - 1));
    const base = scale[clampedIdx];
    return base.replace(/(\d+)$/, (match) => (match === '2' ? '5' : '4'));
  }
  return CURRENT_SOUNDS[note.sound] || 'C4';
}

/**
 * Genera una segunda voz completa para la canción dada siguiendo el tratado de Kennan.
 *
 * @param {Array} song - Lista de compases de la voz principal.
 * @param {string} scaleKey - Tonalidad (ej. 'C', 'B', 'D', 'G', etc.)
 * @returns {Array} Lista de compases para la segunda voz en clave de Fa.
 */
export function generateSecondVoice(song, scaleKey = 'C') {
  if (!song || song.length === 0) return [];
  const bassPool = getBassPool(scaleKey);

  let prevBass = null;
  let prevSoprano = null;
  let consecutiveParallels = 0;
  let consecutiveBassNotes = 0;
  const secondVoiceMeasures = [];

  for (let mIdx = 0; mIdx < song.length; mIdx++) {
    const measure = song[mIdx];
    const sNotes = measure.notes;
    const isFirstMeasure = mIdx === 0;
    const isLastMeasure = mIdx === song.length - 1;
    const isPenultMeasure = mIdx === song.length - 2;

    // Ritmo complementario clásico en 4/4:
    // Alternancia entre blancas [2, 2] y negras con blanca [1, 1, 2] para dar viveza polifónica
    let bassDurations;
    if (isLastMeasure) {
      bassDurations = [2, 2]; // O [4] en cadencia final
    } else if (mIdx % 2 === 0) {
      bassDurations = [2, 2]; // Sustento armónico estable
    } else {
      bassDurations = [1, 1, 2]; // Contrapunto rítmico dinámico
    }

    const measureBassNotes = [];
    let currentBeat = 0;

    for (let bIdx = 0; bIdx < bassDurations.length; bIdx++) {
      const bDur = bassDurations[bIdx];

      // Determinar qué nota del soprano está sonando exactamente en este pulso
      let sAcc = 0;
      let soundingSoprano = 'C4';
      for (let sI = 0; sI < sNotes.length; sI++) {
        const sDuration = sNotes[sI].duration;
        const sSound = resolveSopranoSound(sNotes[sI], scaleKey);
        if (currentBeat >= sAcc && currentBeat < sAcc + sDuration) {
          soundingSoprano = sSound;
          break;
        }
        sAcc += sDuration;
      }

      const isFirst = isFirstMeasure && bIdx === 0;
      const isFinal = isLastMeasure && bIdx === bassDurations.length - 1;
      const isPenult = isPenultMeasure || (isLastMeasure && bIdx === 0);

      // Evaluación de candidatos según las reglas de Kennan
      const scoredCandidates = [];
      for (const cand of bassPool) {
        const sc = evaluateKennanScore({
          candBass: cand,
          sopranoNote: soundingSoprano,
          prevBass,
          prevSoprano,
          scaleKey,
          isFirstNote: isFirst,
          isFinalNote: isFinal,
          isPenultimate: isPenult,
          consecutiveParallels,
          consecutiveBassNotes
        });
        scoredCandidates.push({ cand, sc });
      }

      // Filtrar violaciones estrictas (score < -500: quintas/octavas paralelas o cruce de voces)
      let viable = scoredCandidates.filter(c => c.sc > -500);
      if (viable.length === 0) {
        viable = scoredCandidates;
      }

      // Selección óptima con leve jitter orgánico
      let bestItem = viable[0];
      let bestVal = -Infinity;
      for (const item of viable) {
        const jitter = Math.random() * 3.5;
        const total = item.sc + jitter;
        if (total > bestVal) {
          bestVal = total;
          bestItem = item;
        }
      }
      const bestNote = bestItem.cand;

      // Actualizar métricas de seguimiento de reglas
      const prevMs = prevSoprano ? noteToMidi(prevSoprano) : 0;
      const prevMb = prevBass ? noteToMidi(prevBass) : 0;
      const curMs = noteToMidi(soundingSoprano);
      const curMb = noteToMidi(bestNote);

      const mod12 = (curMs - curMb) % 12;
      const prevMod12 = (prevMs - prevMb) % 12;
      const ds = Math.sign(curMs - prevMs);
      const db = Math.sign(curMb - prevMb);

      if (
        ((mod12 === 3 || mod12 === 4) && (prevMod12 === 3 || prevMod12 === 4)) ||
        ((mod12 === 8 || mod12 === 9) && (prevMod12 === 8 || prevMod12 === 9))
      ) {
        if (ds === db && ds !== 0) consecutiveParallels++;
        else consecutiveParallels = 0;
      } else {
        consecutiveParallels = 0;
      }

      if (bestNote === prevBass) {
        consecutiveBassNotes++;
      } else {
        consecutiveBassNotes = 0;
      }

      prevBass = bestNote;
      prevSoprano = soundingSoprano;

      measureBassNotes.push({
        sound: bestNote,
        soundName: bestNote,
        duration: bDur,
        clef: 'bass',
        accidental: Boolean(~bestNote.indexOf('#') || ~bestNote.indexOf('b'))
      });

      currentBeat += bDur;
    }

    secondVoiceMeasures.push({
      position: mIdx + 1,
      notes: measureBassNotes
    });
  }

  return secondVoiceMeasures;
}
