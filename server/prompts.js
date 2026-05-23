// prompts.js — 60 prompt pairs across diverse categories
const prompts = [
  // Food & Drink
  { id: 1, category: "Fruits", collective: "Name a tropical fruit", imposter: "Name something sweet and colourful" },
  { id: 2, category: "Drinks", collective: "Name a hot beverage", imposter: "Name something you drink in the morning" },
  { id: 3, category: "Desserts", collective: "Name a dessert with chocolate", imposter: "Name something sweet you eat after dinner" },
  { id: 4, category: "Fast Food", collective: "Name something you order at McDonald's", imposter: "Name a popular junk food item" },
  { id: 5, category: "Vegetables", collective: "Name a green vegetable", imposter: "Name something healthy you eat" },
  { id: 6, category: "Spices", collective: "Name a spice used in Indian cooking", imposter: "Name something that makes food flavourful" },
  { id: 7, category: "Snacks", collective: "Name a crunchy snack", imposter: "Name something you eat while watching movies" },
  { id: 8, category: "Ice Cream", collective: "Name an ice cream flavour", imposter: "Name a popular dessert flavour" },

  // Animals
  { id: 9, category: "Jungle Animals", collective: "Name a dangerous jungle animal", imposter: "Name a large wild animal" },
  { id: 10, category: "Ocean", collective: "Name a deep sea creature", imposter: "Name an animal that lives in water" },
  { id: 11, category: "Pets", collective: "Name a common house pet", imposter: "Name an animal kept at home" },
  { id: 12, category: "Birds", collective: "Name a bird that cannot fly", imposter: "Name a large exotic bird" },
  { id: 13, category: "Insects", collective: "Name an insect that stings", imposter: "Name a small flying creature" },

  // Sports
  { id: 14, category: "Cricket", collective: "Name a cricket fielding position", imposter: "Name a position in a team sport" },
  { id: 15, category: "Olympics", collective: "Name an Olympic track event", imposter: "Name a competitive athletic event" },
  { id: 16, category: "Football", collective: "Name a football skill move", imposter: "Name something a footballer does with the ball" },
  { id: 17, category: "Gym", collective: "Name a gym exercise for chest", imposter: "Name a popular workout exercise" },
  { id: 18, category: "Water Sports", collective: "Name a water sport", imposter: "Name a sport done in or near water" },

  // Technology
  { id: 19, category: "Programming", collective: "Name a programming language", imposter: "Name a technical computer term" },
  { id: 20, category: "Social Media", collective: "Name a social media platform", imposter: "Name a popular app on your phone" },
  { id: 21, category: "Gadgets", collective: "Name a modern tech gadget", imposter: "Name an expensive electronic item" },
  { id: 22, category: "AI Tools", collective: "Name an AI chatbot or tool", imposter: "Name a popular technology tool" },

  // Places
  { id: 23, category: "Countries", collective: "Name a country in Southeast Asia", imposter: "Name a country known for tourism" },
  { id: 24, category: "Cities", collective: "Name a city famous for nightlife", imposter: "Name a major international city" },
  { id: 25, category: "Monuments", collective: "Name a UNESCO World Heritage Site", imposter: "Name a famous tourist attraction" },
  { id: 26, category: "Beaches", collective: "Name a famous beach destination", imposter: "Name a place people visit on vacation" },

  // Pop Culture
  { id: 27, category: "Superheroes", collective: "Name a Marvel superhero", imposter: "Name a comic book character with powers" },
  { id: 28, category: "Disney", collective: "Name a Disney princess", imposter: "Name a famous animated character" },
  { id: 29, category: "Music", collective: "Name a music genre from the 80s", imposter: "Name a popular music style" },
  { id: 30, category: "Movies", collective: "Name a horror movie villain", imposter: "Name a scary movie character" },
  { id: 31, category: "Games", collective: "Name a popular video game character", imposter: "Name a well-known fictional character" },
  { id: 32, category: "TV Shows", collective: "Name a Netflix original series", imposter: "Name a popular TV show" },

  // Science
  { id: 33, category: "Space", collective: "Name a planet in our solar system", imposter: "Name something in outer space" },
  { id: 34, category: "Chemistry", collective: "Name a chemical element", imposter: "Name a scientific term" },
  { id: 35, category: "Biology", collective: "Name an organ in the human body", imposter: "Name something inside the human body" },
  { id: 36, category: "Weather", collective: "Name a type of storm", imposter: "Name a dangerous weather event" },

  // Everyday Life
  { id: 37, category: "Clothing", collective: "Name something you wear in winter", imposter: "Name a clothing item" },
  { id: 38, category: "School", collective: "Name a school subject", imposter: "Name something you study" },
  { id: 39, category: "Jobs", collective: "Name a job in a hospital", imposter: "Name a professional occupation" },
  { id: 40, category: "Transport", collective: "Name a mode of public transport", imposter: "Name a vehicle" },
  { id: 41, category: "Furniture", collective: "Name a piece of bedroom furniture", imposter: "Name something found in a house" },
  { id: 42, category: "Hobbies", collective: "Name a creative hobby", imposter: "Name something people do in free time" },

  // India Specific
  { id: 43, category: "Indian Food", collective: "Name a popular street food in India", imposter: "Name a cheap snack people love" },
  { id: 44, category: "Bollywood", collective: "Name a famous Bollywood actor", imposter: "Name a popular Indian celebrity" },
  { id: 45, category: "Indian Festivals", collective: "Name a Hindu festival", imposter: "Name a popular Indian celebration" },
  { id: 46, category: "Indian Cities", collective: "Name a city in Gujarat", imposter: "Name a city in western India" },
  { id: 47, category: "IPL", collective: "Name an IPL team", imposter: "Name a well-known cricket franchise" },

  // Abstract
  { id: 48, category: "Emotions", collective: "Name an emotion that makes you cry", imposter: "Name a strong human feeling" },
  { id: 49, category: "Colors", collective: "Name a shade of blue", imposter: "Name a colour you'd see in the ocean" },
  { id: 50, category: "Sounds", collective: "Name a sound heard in a forest", imposter: "Name a sound found in nature" },
  { id: 51, category: "Textures", collective: "Name something that feels rough", imposter: "Name a surface texture" },
  { id: 52, category: "Smells", collective: "Name a smell in a bakery", imposter: "Name a pleasant food smell" },

  // Random Fun
  { id: 53, category: "Superpowers", collective: "Name a superpower involving speed", imposter: "Name an ability a superhero might have" },
  { id: 54, category: "Magic", collective: "Name something a wizard uses", imposter: "Name a magical object" },
  { id: 55, category: "Pirates", collective: "Name something found on a pirate ship", imposter: "Name something associated with sailing" },
  { id: 56, category: "Space Travel", collective: "Name something an astronaut needs", imposter: "Name equipment for dangerous environments" },
  { id: 57, category: "Money", collective: "Name a world currency", imposter: "Name something used for payments" },
  { id: 58, category: "Languages", collective: "Name a language spoken in Europe", imposter: "Name a foreign language" },
  { id: 59, category: "Cars", collective: "Name a luxury car brand", imposter: "Name an expensive item people show off" },
  { id: 60, category: "Board Games", collective: "Name a popular board game", imposter: "Name a game played at a table" }
];

module.exports = prompts;
