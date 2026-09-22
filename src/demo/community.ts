import type { AppReview, AppThread } from '../functions/firebase_backend';

// Fictional portfolio fixtures, not records recovered from the original database.
export const demoMembers = [
  { uid: 'sample-maya', name: 'Maya', joinedAt: '2024-01-08' },
  { uid: 'sample-jules', name: 'Jules', joinedAt: '2024-01-19' },
  { uid: 'sample-nina', name: 'Nina', joinedAt: '2024-02-03' },
  { uid: 'sample-eli', name: 'Eli', joinedAt: '2024-01-27' },
  { uid: 'sample-theo', name: 'Theo', joinedAt: '2024-02-14' },
  { uid: 'sample-avery', name: 'Avery', joinedAt: '2024-02-21' },
  { uid: 'sample-sam', name: 'Sam', joinedAt: '2024-01-31' },
  { uid: 'sample-leah', name: 'Leah', joinedAt: '2024-02-09' },
];

const author = (index: number) => `${demoMembers[index].name} · demo member`;

// Seeded pseudo-random dates: distributed through 2024–2025, stable on reload.
// All selected films were released before this range begins.
const reviewDate = (key: string) => {
  let hash = 2166136261;
  for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  const start = Date.parse('2024-03-10T12:00:00.000Z');
  const days = Math.floor((Date.parse('2025-12-28T12:00:00.000Z') - start) / 86400000);
  return new Date(start + (hash % (days + 1)) * 86400000).toISOString();
};

const takes: Array<[number, number, number, string]> = [
  [157336, 1, 5, 'The docking scene still makes me forget to breathe. Huge spectacle, but the family story is what stays with me.'],
  [157336, 4, 3, 'Beautiful images and a fantastic score. Some of the dialogue explains too much for me, but I am glad I finally watched it.'],
  [157336, 7, 4, 'Rewatched with headphones and caught so much in the sound mix. It earns its long runtime, especially in the second half.'],
  [27205, 2, 5, 'The hallway fight is such a clever piece of filmmaking. I love that the dream rules make the action feel different in every scene.'],
  [27205, 5, 4, 'I enjoyed it more on a second watch, when I stopped trying to solve the ending and followed Cobb instead.'],
  [27205, 6, 3, 'A great premise and some unforgettable set pieces. The exposition slows down the first act, though.'],
  [693134, 0, 5, 'The scale of the desert scenes is incredible. The quieter conversations are just as tense as the battles.'],
  [693134, 3, 4, 'Watching the first film again beforehand really helped. The final stretch is intense and leaves a lot to think about.'],
  [693134, 5, 3, 'The visuals absolutely deliver. I wanted a little more time with the supporting characters before the story moved on.'],
  [545611, 2, 5, 'I did not expect something this chaotic to make me cry over a conversation between two rocks. Weird in the best way.'],
  [545611, 4, 4, 'The editing is wild, but the small family moments keep it grounded. A film I immediately wanted to talk about afterward.'],
  [545611, 6, 2, 'I liked the performances and the central relationship. The constant shifts in tone wore me out before the ending.'],
  [569094, 1, 5, 'Every world has its own visual language. I kept wanting to pause and look at the backgrounds, then forgetting because the story pulled me along.'],
  [569094, 3, 4, 'Gwen’s opening is my favorite part. The cliffhanger is frustrating, but the animation and character work are excellent.'],
  [569094, 7, 4, 'The soundtrack and colors work so well together. There is a lot going on, yet the emotional stakes stay clear.'],
  [120467, 0, 4, 'The miniature-like settings and the precise comic timing are a perfect match. A surprisingly bittersweet story underneath.'],
  [120467, 5, 5, 'A comfort rewatch for me. The hotel feels like a whole world, and the supporting cast makes even tiny scenes memorable.'],
  [120467, 6, 3, 'I admired the design more than I connected with the characters. Still, several of the visual jokes really landed.'],
  [244786, 1, 4, 'The final performance is electric. I appreciate that the film leaves me arguing with its idea of success.'],
  [244786, 2, 5, 'So tense for a story that spends this much time in rehearsal rooms. The editing makes every missed beat feel enormous.'],
  [244786, 4, 4, 'Great performances, and a difficult watch in a good way. I needed a quiet evening after this one.'],
  [666277, 0, 5, 'The pauses say as much as the dialogue. I loved how gently it handles people who want different things without making anyone a villain.'],
  [666277, 3, 4, 'A small, thoughtful film that lingered for days. The final walk is beautifully restrained.'],
  [666277, 7, 3, 'I liked the natural performances. The pacing was a little too quiet for my mood, but the ending brought it together.'],
];

export const communityReviews: AppReview[] = takes.map(([movieId, memberIndex, rating, content]) => {
  const id = `sample-review-${movieId}-${demoMembers[memberIndex].uid}`;
  return { id, movieId, uid: demoMembers[memberIndex].uid, Author: author(memberIndex), rating, content, date: reviewDate(id) };
});

const topics: Array<[string, number, string, string, string, number, string, number, string]> = [
  ['quiet-favorites', 2, '2024-04-18', 'What is a quiet film that stayed with you?', 'Past Lives has been on my mind all week. I would love more films where the small moments do most of the work.', 7, 'Perfect Days was that kind of watch for me. Give it an evening when you are not in a rush.', 0, 'Seconding Perfect Days. I also come back to Before Sunrise for the conversations.'],
  ['big-screen', 3, '2024-08-07', 'Which movie really needs a big screen?', 'Dune: Part Two made me appreciate how much sound and scale can change a viewing. What is your must-see theater pick?', 1, 'Interstellar, especially with a good sound system. The quiet moments hit just as hard.', 5, 'Across the Spider-Verse. There is always something new hiding in the frame.'],
  ['rewatch-weekend', 5, '2024-11-23', 'A weekend of comfort rewatches', 'My pick is The Grand Budapest Hotel. What do you put on when you already know you will enjoy the evening?', 6, 'Fantastic Mr. Fox. Short enough for a weeknight and full of little details.', 2, 'I keep returning to Spirited Away. The train scene never gets old.'],
  ['soundtrack', 4, '2025-02-16', 'Film scores you listen to outside the movie', 'Interstellar has become my study soundtrack. Looking for more scores that hold up on their own.', 7, 'The Social Network is great for focused work. A very different mood, though.', 3, 'Whiplash sent me down a jazz rabbit hole rather than back to the score.'],
  ['second-watch', 6, '2025-06-09', 'A film that changed for you on a second watch', 'I liked Inception much more once I knew the plot. What became a favorite after giving it another chance?', 0, 'Everything Everywhere All at Once. I could focus on the family instead of trying to follow every switch.', 1, 'Arrival. Knowing where it goes makes the early scenes feel completely different.'],
  ['year-picks', 7, '2025-12-12', 'Favorite discoveries from this year?', 'Not necessarily new releases: what did you finally watch in 2025 that you wish you had found sooner?', 4, 'Whiplash. I went in almost blind and was completely hooked.', 5, 'Past Lives. It is the one I have recommended most often this year.'],
];

export const communityDiscussions: AppThread[] = topics.map(([id, member, day, Title, Description, replyMember, reply, secondMember, secondReply]) => {
  const timestamp = `${day}T16:00:00.000Z`;
  const replyDate = (offset: number) => new Date(Date.parse(timestamp) + offset * 3600000).toISOString();
  return {
    id: `sample-thread-${id}`, uid: demoMembers[member].uid, Author: author(member), Date: timestamp, Title, Description,
    Comments: [
      { commentId: `sample-${id}-1`, uid: demoMembers[replyMember].uid, author: author(replyMember), content: reply, date: replyDate(5) },
      { commentId: `sample-${id}-2`, uid: demoMembers[secondMember].uid, author: author(secondMember), content: secondReply, date: replyDate(27) },
    ],
  };
});
