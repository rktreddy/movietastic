// Story Spark — creative prompts to help kids imagine what happens next
// Organized by story beat (opening, twist, resolution) to teach narrative arc

export const STORY_SPARKS = {
  opening: [
    { text: "One morning, something strange appeared in the sky...", emoji: "\uD83C\uDF05" },
    { text: "Nobody believed them, but they had actually found a...", emoji: "\uD83D\uDD0D" },
    { text: "It was the first day at a brand new school and...", emoji: "\uD83C\uDFEB" },
    { text: "Deep in the forest, a tiny door appeared on a tree...", emoji: "\uD83C\uDF33" },
    { text: "The map showed a path that didn't exist yesterday...", emoji: "\uD83D\uDDFA\uFE0F" },
    { text: "When the music box opened, the whole room changed...", emoji: "\uD83C\uDFB5" },
    { text: "They woke up and everything was upside down...", emoji: "\uD83D\uDE35" },
    { text: "A letter arrived with no name on it, just a drawing of...", emoji: "\u2709\uFE0F" },
  ],
  twist: [
    { text: "Suddenly, the ground started to shake!", emoji: "\uD83C\uDF0B" },
    { text: "But wait... that wasn't really their friend!", emoji: "\uD83D\uDE31" },
    { text: "Oh no! The bridge was broken!", emoji: "\uD83C\uDF09" },
    { text: "A storm rolled in and everything went dark...", emoji: "\u26C8\uFE0F" },
    { text: "They heard a sound coming from behind the wall...", emoji: "\uD83D\uDC42" },
    { text: "The treasure was there, but so was a dragon!", emoji: "\uD83D\uDC09" },
    { text: "Time started going backwards!", emoji: "\u23EA" },
    { text: "They shrunk down to the size of an ant!", emoji: "\uD83D\uDC1C" },
    { text: "A mysterious stranger offered to help, but...", emoji: "\uD83E\uDDD9" },
    { text: "The key broke right in the lock!", emoji: "\uD83D\uDD11" },
  ],
  resolution: [
    { text: "And that's when they finally understood the secret!", emoji: "\uD83D\uDCA1" },
    { text: "They worked together and built something amazing!", emoji: "\uD83E\uDD1D" },
    { text: "The spell was broken with a single kind word...", emoji: "\u2764\uFE0F" },
    { text: "Everyone cheered as the hero returned home!", emoji: "\uD83C\uDF89" },
    { text: "It turned out the monster was just scared too...", emoji: "\uD83E\uDD17" },
    { text: "And from that day on, nothing was ever the same...", emoji: "\uD83C\uDF08" },
    { text: "They planted a seed, and the whole world bloomed!", emoji: "\uD83C\uDF3B" },
    { text: "The friends promised to meet again next summer...", emoji: "\u2600\uFE0F" },
  ],
};

// Get a random spark from all categories, or from a specific one
export function getRandomSpark(category) {
  if (category && STORY_SPARKS[category]) {
    const sparks = STORY_SPARKS[category];
    return sparks[Math.floor(Math.random() * sparks.length)];
  }
  // Random from all
  const allSparks = [
    ...STORY_SPARKS.opening,
    ...STORY_SPARKS.twist,
    ...STORY_SPARKS.resolution,
  ];
  return allSparks[Math.floor(Math.random() * allSparks.length)];
}

// Get a spark appropriate for the scene number
export function getSparkForScene(sceneIndex, totalScenes) {
  if (sceneIndex === 0) return getRandomSpark("opening");
  if (totalScenes > 1 && sceneIndex >= totalScenes - 1) return getRandomSpark("resolution");
  return getRandomSpark("twist");
}
