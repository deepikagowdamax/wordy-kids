import { StickerItem } from '../types.ts';

export const STICKERS_DATA: StickerItem[] = [
  // Animals
  { id: 'stk-lion', name: 'Brave Lion', emoji: '🦁', requiredStars: 2, category: 'animals' },
  { id: 'stk-puppy', name: 'Happy Pup', emoji: '🐶', requiredStars: 4, category: 'animals' },
  { id: 'stk-kitty', name: 'Sweet Kitty', emoji: '🐱', requiredStars: 6, category: 'animals' },
  { id: 'stk-panda', name: 'Sleepy Panda', emoji: '🐼', requiredStars: 8, category: 'animals' },
  { id: 'stk-koala', name: 'Cozy Koala', emoji: '🐨', requiredStars: 10, category: 'animals' },
  { id: 'stk-dino', name: 'Friendly Dino', emoji: '🦖', requiredStars: 12, category: 'animals' },
  { id: 'stk-dolphin', name: 'Ocean Dolphin', emoji: '🐬', requiredStars: 15, category: 'animals' },
  { id: 'stk-bunny', name: 'Bouncing Bunny', emoji: '🐰', requiredStars: 18, category: 'animals' },

  // Magic & Fantasy
  { id: 'stk-unicorn', name: 'Rainbow Unicorn', emoji: '🦄', requiredStars: 5, category: 'magic' },
  { id: 'stk-wand', name: 'Magic Star Wand', emoji: '🪄', requiredStars: 9, category: 'magic' },
  { id: 'stk-sparkle', name: 'Wonder Sparkle', emoji: '✨', requiredStars: 11, category: 'magic' },
  { id: 'stk-rainbow', name: 'Sky Rainbow', emoji: '🌈', requiredStars: 14, category: 'magic' },
  { id: 'stk-crystal', name: 'Gem Crystal', emoji: '💎', requiredStars: 20, category: 'magic' },

  // Space
  { id: 'stk-rocket', name: 'Super Rocket', emoji: '🚀', requiredStars: 7, category: 'space' },
  { id: 'stk-planet', name: 'Ringed Saturn', emoji: '🪐', requiredStars: 13, category: 'space' },
  { id: 'stk-alien', name: 'Kind Alien', emoji: '👾', requiredStars: 16, category: 'space' },
  { id: 'stk-sun', name: 'Warm Sun', emoji: '☀️', requiredStars: 22, category: 'space' },

  // Badges & Trophies
  { id: 'stk-star', name: 'Gold Star Champion', emoji: '⭐', requiredStars: 3, category: 'badges' },
  { id: 'stk-trophy', name: 'Master Reader Cup', emoji: '🏆', requiredStars: 15, category: 'badges' },
  { id: 'stk-crown', name: 'Word King / Queen', emoji: '👑', requiredStars: 25, category: 'badges' },
  { id: 'stk-medal', name: 'Phonics Medal', emoji: '🥇', requiredStars: 30, category: 'badges' },
  { id: 'stk-balloon', name: 'Party Balloon', emoji: '🎈', requiredStars: 35, category: 'badges' },
  { id: 'stk-palette', name: 'Artist Badge', emoji: '🎨', requiredStars: 40, category: 'badges' },
  { id: 'stk-heart', name: 'Super Kind Heart', emoji: '💖', requiredStars: 50, category: 'badges' },
];
