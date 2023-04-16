import { Configuration, OpenAIApi } from 'openai';

const audioContext = new AudioContext();

const makePrompt = async () => {
  const length = '4';
  const mood = 'melancholic';

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: '<SECRET-KEY>',
    })
  );

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: 'user',
        content: `Generate a ${mood} chord progression with ${length} chords, with each chord represented as a note and length separated by a space in this format 'C 1, D 2, E 1, D 1'`
      }
    ],
    temperature: 1,
  });

  playNotes(
    parseNotes(completion.data.choices[0].message.content)
  );
}

const parseNotes = (string) => {
  // string ~ 'C 1, F 1.5, G 0.5'
  const notesArray = []

  for (const str of string.split(', ')) {
    const [note, length] = str.split(' ');
    notesArray.push(note, length);
  }

  return notesArray;
}

const playNotes = (chordProgression) => {
  let offset = 0;
  // Loop through the chord progression and play each chord
  chordProgression.forEach((chord) => {
    // Create a new OscillatorNode to generate the sound wave for the current chord
    const oscillator = audioContext.createOscillator();

    // Set the frequency of the oscillator based on the current chord
    oscillator.frequency.setValueAtTime(getFrequency(chord.note), audioContext.currentTime);

    // Connect the oscillator to the ConvolverNode
    oscillator.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start(audioContext.currentTime + offset);

    // Stop the oscillator after the duration of the current chord
    oscillator.stop(audioContext.currentTime + offset + Number(chord.length));

    // Add to the offset
    offset += Number(chord.length);
  });
}

// Function to get the frequency of a given note (in Hz)
const getFrequency = (note) => {
  const octave = 1;
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = noteNames.indexOf(note);
  const isMinor = note.endsWith('m');
  const interval = isMinor ? [0, 3, 7, 10] : [0, 4, 7, 10];

  const frequency = 220 * Math.pow(2, (noteIndex - 9 + (octave * 12) + interval[0]) / 12);
  return frequency;
}

makePrompt();
