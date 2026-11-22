// Subjects: { id, text, person (0..5), gender ('m'|'f'|null), number? ('s'|'p'|null), pronoun }
export const SUBJECTS = [
  // Pronouns
  { id: 'je',    text: 'je',    person: 0, gender: null, pronoun: true },
  { id: 'tu',    text: 'tu',    person: 1, gender: null, pronoun: true },
  { id: 'il',    text: 'il',    person: 2, gender: 'm',  pronoun: true },
  { id: 'elle',  text: 'elle',  person: 2, gender: 'f',  pronoun: true },
  { id: 'on',    text: 'on',    person: 2, gender: null, number: null, pronoun: true },
  { id: 'nous',  text: 'nous',  person: 3, gender: null, pronoun: true },
  { id: 'vous',  text: 'vous',  person: 4, gender: null, pronoun: true },
  { id: 'ils',   text: 'ils',   person: 5, gender: 'm',  pronoun: true },
  { id: 'elles', text: 'elles', person: 5, gender: 'f',  pronoun: true },

  // Noun subjects: singular
  { id: 'marie',        text: 'Marie',         person: 2, gender: 'f', pronoun: false },
  { id: 'paul',         text: 'Paul',          person: 2, gender: 'm', pronoun: false },
  { id: 'mon-frere',    text: 'mon frère',     person: 2, gender: 'm', pronoun: false },
  { id: 'ma-soeur',     text: 'ma sœur',       person: 2, gender: 'f', pronoun: false },
  { id: 'le-professeur', text: 'le professeur', person: 2, gender: 'm', pronoun: false },

  // Noun subjects: plural
  { id: 'les-enfants',  text: 'les enfants',   person: 5, gender: 'm', pronoun: false },
  { id: 'mes-parents',  text: 'mes parents',   person: 5, gender: 'm', pronoun: false },
  { id: 'tes-amies',    text: 'tes amies',     person: 5, gender: 'f', pronoun: false },

  // Coordinated subjects (nous / vous)
  { id: 'paul-et-moi',  text: 'Paul et moi',   person: 3, gender: 'm', pronoun: false },
  { id: 'marie-et-toi', text: 'Marie et toi',  person: 4, gender: null, number: 'p', pronoun: false },
];
