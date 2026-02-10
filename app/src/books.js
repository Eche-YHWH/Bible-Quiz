export const QUESTIONS_PER_LEVEL = 6;

const LEVELS = {
  1: { name: "New Fire (Acts 1-6)" },
  2: { name: "The Way Spreads (Acts 7-12)" },
  3: { name: "Across Cities (Acts 13-18)" },
  4: { name: "Truth on Trial (Acts 19-24)" },
  5: { name: "Rome at Last (Acts 25-28)" },
};

const QUESTIONS = [
  // Level 1
  { level: 1, question: "Before Jesus ascended, what did He tell the disciples to wait for in Jerusalem?", options: { A: "More teachings", B: "The Holy Spirit", C: "Bread and wine", D: "A new king" }, answer: "B", ref: "Acts 1:4-5" },
  { level: 1, question: "Who replaced Judas as the 12th apostle?", options: { A: "Matthias", B: "Barnabas", C: "Paul", D: "Silas" }, answer: "A", ref: "Acts 1:26" },
  { level: 1, question: "What happened on the day of Pentecost?", options: { A: "Earthquake", B: "The Holy Spirit came with tongues of fire", C: "A flood", D: "Angels appeared" }, answer: "B", ref: "Acts 2:1-4" },
  { level: 1, question: "Peterâ€™s first sermon led to how many people being added in one day?", options: { A: "70", B: "120", C: "3,000", D: "5,000" }, answer: "C", ref: "Acts 2:41" },
  { level: 1, question: "What miracle did Peter and John do at the Beautiful Gate?", options: { A: "Healed a blind man", B: "Healed a lame man", C: "Raised a dead man", D: "Cast out a legion" }, answer: "B", ref: "Acts 3:1-10" },
  { level: 1, question: "Why were deacons chosen in Acts 6?", options: { A: "To lead worship", B: "To care for widows fairly", C: "To write letters", D: "To arrest criminals" }, answer: "B", ref: "Acts 6:1-6" },

  // Level 2
  { level: 2, question: "Who was the first Christian martyr?", options: { A: "James", B: "Stephen", C: "Peter", D: "Philip" }, answer: "B", ref: "Acts 7:54-60" },
  { level: 2, question: "Who preached in Samaria and many believed?", options: { A: "Philip", B: "Thomas", C: "Andrew", D: "Matthew" }, answer: "A", ref: "Acts 8:5-8" },
  { level: 2, question: "Who was baptized after reading Isaiah with Philip?", options: { A: "A Roman soldier", B: "An Ethiopian eunuch", C: "A synagogue ruler", D: "A tax collector" }, answer: "B", ref: "Acts 8:26-39" },
  { level: 2, question: "Who met Jesus on the road to Damascus and became an apostle?", options: { A: "Saul", B: "Apollos", C: "Timothy", D: "Mark" }, answer: "A", ref: "Acts 9:1-6" },
  { level: 2, question: "Who was raised from the dead by Peter in Joppa?", options: { A: "Tabitha (Dorcas)", B: "Mary Magdalene", C: "Jezebel", D: "Martha" }, answer: "A", ref: "Acts 9:36-41" },
  { level: 2, question: "Who was the centurion whose household received the Holy Spirit?", options: { A: "Cornelius", B: "Julius", C: "Longinus", D: "Tertullus" }, answer: "A", ref: "Acts 10:1-2" },

  // Level 3
  { level: 3, question: "Who went with Paul on his first missionary journey?", options: { A: "Silas", B: "Barnabas", C: "Luke", D: "Peter" }, answer: "B", ref: "Acts 13:2-3" },
  { level: 3, question: "What was the main debate at the Jerusalem Council (Acts 15)?", options: { A: "Should believers keep the Sabbath?", B: "Should Gentiles be circumcised to be saved?", C: "Should Rome be resisted?", D: "Should the church build temples?" }, answer: "B", ref: "Acts 15:1-11" },
  { level: 3, question: "In Philippi, who was the first convert mentioned, a seller of purple?", options: { A: "Lydia", B: "Dorcas", C: "Priscilla", D: "Drusilla" }, answer: "A", ref: "Acts 16:14-15" },
  { level: 3, question: "In Philippi, Paul and Silas sang hymns in prison. What happened next?", options: { A: "Fire came down", B: "An earthquake opened the doors", C: "The guards ran away", D: "Paul fainted" }, answer: "B", ref: "Acts 16:25-26" },
  { level: 3, question: "At Athens, where did Paul preach about the 'Unknown God'?", options: { A: "The Temple", B: "The marketplace only", C: "The Areopagus", D: "A prison courtyard" }, answer: "C", ref: "Acts 17:22-23" },
  { level: 3, question: "In Acts 18, who explained the way of God more accurately to Apollos?", options: { A: "Aquila and Priscilla", B: "James and John", C: "Peter and Andrew", D: "Philip and Stephen" }, answer: "A", ref: "Acts 18:26" },

  // Level 4
  { level: 4, question: "In Ephesus, people burned what after turning from sin?", options: { A: "Their clothes", B: "Their magic books", C: "Their fishing nets", D: "Their scrolls of law" }, answer: "B", ref: "Acts 19:19" },
  { level: 4, question: "Who was the young man who fell from a window but was revived by Paul?", options: { A: "Titus", B: "Eutychus", C: "Onesimus", D: "Simeon" }, answer: "B", ref: "Acts 20:9-10" },
  { level: 4, question: "Why was Paul arrested in Jerusalem?", options: { A: "He stole money", B: "He was accused of defiling the temple", C: "He attacked a soldier", D: "He refused to pay taxes" }, answer: "B", ref: "Acts 21:27-36" },
  { level: 4, question: "What was Paulâ€™s citizenship that protected him from being beaten unlawfully?", options: { A: "Greek", B: "Roman", C: "Egyptian", D: "Syrian" }, answer: "B", ref: "Acts 22:25-28" },
  { level: 4, question: "Paul said he was on trial because of hope in what doctrine?", options: { A: "Prosperity", B: "Resurrection of the dead", C: "Angels", D: "The law of Moses" }, answer: "B", ref: "Acts 23:6" },
  { level: 4, question: "Who trembled when Paul spoke about righteousness and judgment to come?", options: { A: "Felix", B: "Cornelius", C: "Stephen", D: "Gamaliel" }, answer: "A", ref: "Acts 24:24-25" },

  // Level 5
  { level: 5, question: "To whom did Paul appeal, using his rights as a Roman citizen?", options: { A: "The Sanhedrin", B: "Caesar", C: "The high priest", D: "The centurion" }, answer: "B", ref: "Acts 25:10-12" },
  { level: 5, question: "Which king heard Paulâ€™s defense and said 'Almost you persuade me'?", options: { A: "Herod", B: "Agrippa", C: "Caesar", D: "Nero" }, answer: "B", ref: "Acts 26:28" },
  { level: 5, question: "During the storm at sea, what did Paul say God promised about everyone on the ship?", options: { A: "Many would die", B: "All would be saved", C: "Only Paul would live", D: "The ship would not break" }, answer: "B", ref: "Acts 27:22-24" },
  { level: 5, question: "After the shipwreck, which island did they land on?", options: { A: "Patmos", B: "Cyprus", C: "Malta", D: "Crete" }, answer: "C", ref: "Acts 28:1" },
  { level: 5, question: "On Malta, what happened to Paul when a viper bit him?", options: { A: "He died instantly", B: "His hand swelled badly", C: "Nothing happened", D: "He became blind" }, answer: "C", ref: "Acts 28:3-6" },
  { level: 5, question: "How does the book of Acts end (final setting)?", options: { A: "Paul in a palace", B: "Paul in prison in Jerusalem", C: "Paul preaching in Rome under house arrest", D: "Peter ruling the church" }, answer: "C", ref: "Acts 28:30-31" },
];

export const BOOKS = {
  acts: { title: "Acts", short: "Acts", pos: { x: 40, y: 78 }, levels: LEVELS, questions: QUESTIONS },
  genesis: {
    title: "Genesis",
    short: "Gen",
    pos: { x: 12, y: 18 },
    questions: [
      { question: "On which day did God create the sun, moon, and stars?", options: { A: "Day 1", B: "Day 2", C: "Day 3", D: "Day 4" }, answer: "D", ref: "Genesis 1:14-19" },
      { question: "Who was the first man created by God?", options: { A: "Noah", B: "Adam", C: "Abraham", D: "Jacob" }, answer: "B", ref: "Genesis 2:7" },
      { question: "What was the name of Abraham's wife?", options: { A: "Rebekah", B: "Rachel", C: "Sarah", D: "Leah" }, answer: "C", ref: "Genesis 17:15" },
      { question: "What sign did God give Noah that He would never again destroy the earth by flood?", options: { A: "Rainbow", B: "Dove", C: "Olive branch", D: "Ark" }, answer: "A", ref: "Genesis 9:13" },
      { question: "Jacob dreamed of a ladder reaching to heaven. What place did he name?", options: { A: "Beersheba", B: "Bethel", C: "Hebron", D: "Shechem" }, answer: "B", ref: "Genesis 28:12-19" },
      { question: "Who was sold into slavery by his brothers?", options: { A: "Joseph", B: "Benjamin", C: "Esau", D: "Isaac" }, answer: "A", ref: "Genesis 37:28" },
    ],
  },
  exodus: {
    title: "Exodus",
    short: "Exo",
    pos: { x: 70, y: 22 },
    questions: [
      { question: "What did Moses see that burned but was not consumed?", options: { A: "Burning bush", B: "Pillar of cloud", C: "Golden calf", D: "Mount Sinai" }, answer: "A", ref: "Exodus 3:2" },
      { question: "What was the first plague on Egypt?", options: { A: "Frogs", B: "Water turned to blood", C: "Darkness", D: "Locusts" }, answer: "B", ref: "Exodus 7:20" },
      { question: "Who was Moses' brother and spokesman?", options: { A: "Aaron", B: "Joshua", C: "Caleb", D: "Miriam" }, answer: "A", ref: "Exodus 4:14-16" },
      { question: "What did God give Moses on Mount Sinai?", options: { A: "Ark plans", B: "Ten Commandments", C: "Manna", D: "A new staff" }, answer: "B", ref: "Exodus 20:1-17" },
      { question: "What was the bread-like food God provided in the wilderness?", options: { A: "Quail", B: "Manna", C: "Figs", D: "Barley" }, answer: "B", ref: "Exodus 16:15" },
      { question: "What sea did the Israelites cross when leaving Egypt?", options: { A: "Sea of Galilee", B: "Red Sea", C: "Dead Sea", D: "Mediterranean Sea" }, answer: "B", ref: "Exodus 14:21-22" },
    ],
  },
  psalms: {
    title: "Psalms",
    short: "Psa",
    pos: { x: 30, y: 46 },
    questions: [
      { question: "\"The Lord is my shepherd; I shall not want\" is from which Psalm?", options: { A: "Psalm 1", B: "Psalm 19", C: "Psalm 23", D: "Psalm 100" }, answer: "C", ref: "Psalm 23:1" },
      { question: "Psalm 19 says the heavens declare the ___ of God.", options: { A: "power", B: "mercy", C: "glory", D: "law" }, answer: "C", ref: "Psalm 19:1" },
      { question: "Psalm 46 says, \"Be still, and know that I am ___.\"", options: { A: "king", B: "God", C: "holy", D: "love" }, answer: "B", ref: "Psalm 46:10" },
      { question: "Psalm 100 says, \"Enter his gates with ___.\"", options: { A: "fear", B: "thanksgiving", C: "silence", D: "offerings" }, answer: "B", ref: "Psalm 100:4" },
      { question: "Psalm 119 says God's word is a lamp to my ___.", options: { A: "hands", B: "feet", C: "ears", D: "eyes" }, answer: "B", ref: "Psalm 119:105" },
      { question: "Psalm 150 says to praise God with the sound of the ___.", options: { A: "trumpet", B: "harp", C: "tambourine", D: "cymbals" }, answer: "A", ref: "Psalm 150:3" },
    ],
  },
  john: {
    title: "John",
    short: "John",
    pos: { x: 72, y: 56 },
    questions: [
      { question: "John 1:1 says the Word was with God, and the Word was ___.", options: { A: "Light", B: "God", C: "Spirit", D: "Life" }, answer: "B", ref: "John 1:1" },
      { question: "What was Jesus' first miracle in John?", options: { A: "Healing a leper", B: "Feeding the 5,000", C: "Water into wine", D: "Walking on water" }, answer: "C", ref: "John 2:1-11" },
      { question: "Who came to Jesus at night to ask about being born again?", options: { A: "Nicodemus", B: "Zacchaeus", C: "Jairus", D: "Thomas" }, answer: "A", ref: "John 3:1-3" },
      { question: "John 3:16 says God so loved the world that He gave His only ___.", options: { A: "servant", B: "Son", C: "prophet", D: "king" }, answer: "B", ref: "John 3:16" },
      { question: "Who did Jesus meet at the well in John 4?", options: { A: "A Samaritan woman", B: "Martha", C: "Mary Magdalene", D: "An Ethiopian eunuch" }, answer: "A", ref: "John 4:7-9" },
      { question: "In John 10, Jesus says, \"I am the ___ shepherd\".", options: { A: "great", B: "good", C: "faithful", D: "chosen" }, answer: "B", ref: "John 10:11" },
    ],
  },
  romans: {
    title: "Romans",
    short: "Rom",
    pos: { x: 74, y: 88 },
    questions: [
      { question: "Romans 1:16 says Paul is not ashamed of the ___.", options: { A: "law", B: "gospel", C: "temple", D: "cross" }, answer: "B", ref: "Romans 1:16" },
      { question: "Romans 3:23 says all have sinned and fall short of the ___ of God.", options: { A: "love", B: "glory", C: "mercy", D: "peace" }, answer: "B", ref: "Romans 3:23" },
      { question: "Romans 5:8 says while we were still sinners, Christ ___ for us.", options: { A: "prayed", B: "died", C: "rose", D: "ruled" }, answer: "B", ref: "Romans 5:8" },
      { question: "Romans 6:23 says the wages of sin is death, but the gift of God is ___.", options: { A: "wisdom", B: "eternal life", C: "prosperity", D: "forgiveness" }, answer: "B", ref: "Romans 6:23" },
      { question: "Romans 8:1 says there is now no ___ for those in Christ Jesus.", options: { A: "fear", B: "condemnation", C: "weakness", D: "death" }, answer: "B", ref: "Romans 8:1" },
      { question: "Romans 12:2 says be transformed by the renewing of your ___.", options: { A: "heart", B: "mind", C: "strength", D: "spirit" }, answer: "B", ref: "Romans 12:2" },
    ],
  },
};

export const BOOK_ORDER = ["genesis", "exodus", "psalms", "john", "acts", "romans"];

export function resolveBookId(bookId) {
  return BOOKS[bookId] ? bookId : "acts";
}

export function buildAutoLevels(title, total) {
  const levels = {};
  const count = Math.max(1, Math.ceil(total / QUESTIONS_PER_LEVEL));
  for (let i = 1; i <= count; i++) {
    levels[i] = { name: `${title} - Level ${i}` };
  }
  return levels;
}

export function getBookData(bookId) {
  const id = resolveBookId(bookId);
  const book = BOOKS[id];
  const questions = (book.questions || []).map((q, i) => ({
    ...q,
    level: q.level ?? Math.floor(i / QUESTIONS_PER_LEVEL) + 1,
  }));
  const levels = book.levels || buildAutoLevels(book.title, questions.length);
  return { ...book, id, questions, levels };
}
