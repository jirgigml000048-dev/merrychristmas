import { EnvelopeData, TreeCoordinate } from './types';

// ==========================================
// 🎨 COLOR PALETTE (Extracted from Reference)
// ==========================================
// Use these in App.tsx for consistent theming
export const COLORS = {
  sunsetOrange: '#FFAD66', // Top of sky
  deepPineGreen: '#2C5F68', // Trees
  scarfRed: '#D94C23',      // Character scarf (Accent)
  snowShadow: '#B8C8D9',    // Snow shadows
  nightBlue: '#1a262e',     // Solid background for Tree Assembly
  cream: '#FFF8E7',         // Envelope body
  wood: '#5C4033'           // Envelope borders
};

// ==========================================
// 🖼️ BACKGROUND IMAGES
// ==========================================

// 1. 封面图 (Cover Image)
// 请在这里替换您的封面图片链接
export const COVER_BG_IMAGE = "https://youke2.picui.cn/s1/2025/12/19/694573d6f2ca1.png"; 

// 2. 游戏主背景图 (Game Background)
// 标有 1-12 信封时的底图，请在这里替换链接
export const GAME_BG_IMAGE = "https://free.picui.cn/free/2025/12/20/69457a278fb51.png";


// ==========================================
// 💌 12 MEMORY LETTERS
// ==========================================
// Instructions:
// 1. Replace 'message' with your own text.
// 2. Replace 'imageUrl' with your own photo links.
//    (Supported: .jpg, .png, .gif)

export const ENVELOPES: EnvelopeData[] = [
  { 
    id: 1, 
    title: "Jan", 
    message: "Remember when we first met? The coffee was cold but your smile was warm.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/694577888e227.png", 
    scale: 0.9 
  },
  { 
    id: 2, 
    title: "Feb", 
    message: "Our first road trip. Getting lost never felt so right.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/6945778b6080a.png", 
    scale: 1.1 
  },
  { 
    id: 3, 
    title: "Mar", 
    message: "You make every boring Tuesday feel like a Saturday morning.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/6945778ad4e9b.png", 
    scale: 0.8 
  },
  { 
    id: 4, 
    title: "Apr", 
    message: "Even when it rains, you are my personal sunshine.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/6945778bb2a23.png", 
    scale: 1.2 
  },
  { 
    id: 5, 
    title: "May", 
    message: "I love how you laugh at your own jokes. It's contagious.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/6945778bb7393.png", 
    scale: 1.0 
  },
  { 
    id: 6, 
    title: "Jun", 
    message: "To the best Player 2 a guy could ask for. Ready for the next level?", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://free.picui.cn/free/2025/12/20/69457b416a7a2.png", 
    scale: 0.85 
  },
  { 
    id: 7, 
    title: "Jul", 
    message: "Summer nights and city lights, better with you.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://free.picui.cn/free/2025/12/20/69457b420dd44.png", 
    scale: 1.15 
  },
  { 
    id: 8, 
    title: "Aug", 
    message: "Thank you for being my anchor when the world gets crazy.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/694578ea85d9d.png", 
    scale: 0.95 
  },
  { 
    id: 9, 
    title: "Sep", 
    message: "Every day with you is a new high score.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/694578ea85d9d.png", 
    scale: 1.1 
  },
  { 
    id: 10, 
    title: "Oct", 
    message: "Pumpkin spice and everything nice? Nah, just you.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/694578ea85d9d.png", 
    scale: 0.9 
  },
  { 
    id: 11, 
    title: "Nov", 
    message: "Counting down the days to Christmas is easier when I count on you.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/694578eaa03f0.png", 
    scale: 1.2 
  },
  { 
    id: 12, 
    title: "Dec", 
    message: "Merry Birthday-Christmas! You are my greatest gift.", 
    // 👇 REPLACE IMAGE BELOW 👇
    imageUrl: "https://youke2.picui.cn/s1/2025/12/20/694578e931bc6.png", 
    scale: 1.0 
  },
];

// Scatter Coordinates for the "Collecting" Phase
// DESIGN: U-Shape layout to avoid covering the characters in the center-bottom
export const SCATTER_COORDINATES: TreeCoordinate[] = [
    // SKY AREA (Top)
    { id: 1, x: 18, y: 12 }, // Top Left
    { id: 2, x: 82, y: 12 }, // Top Right
    { id: 3, x: 50, y: 18 }, // Top Center (Above Sun)

    // TREE SIDES (Middle)
    { id: 4, x: 12, y: 32 }, // High Left Tree
    { id: 5, x: 88, y: 32 }, // High Right Tree
    { id: 6, x: 15, y: 52 }, // Low Left Tree
    { id: 7, x: 85, y: 52 }, // Low Right Tree

    // SNOW BANKS (Flanking Characters)
    { id: 8, x: 10, y: 72 }, // Left of Boy
    { id: 9, x: 90, y: 72 }, // Right of Girl

    // BOTTOM PATH (Below Characters)
    { id: 10, x: 25, y: 88 }, // Bottom Left Corner
    { id: 11, x: 75, y: 88 }, // Bottom Right Corner
    { id: 12, x: 50, y: 92 }, // Very Bottom Center
];

// Coordinates for the Christmas Tree shape (percentages relative to container)
export const TREE_COORDINATES: TreeCoordinate[] = [
  { id: 1, x: 50, y: 15 }, // Star/Top
  { id: 2, x: 40, y: 30 }, { id: 3, x: 60, y: 30 }, // Row 2
  { id: 4, x: 30, y: 45 }, { id: 5, x: 50, y: 45 }, { id: 6, x: 70, y: 45 }, // Row 3
  { id: 7, x: 20, y: 60 }, { id: 8, x: 40, y: 60 }, { id: 9, x: 60, y: 60 }, { id: 10, x: 80, y: 60 }, // Row 4 (Base)
  { id: 11, x: 50, y: 75 }, { id: 12, x: 50, y: 88 } // Trunk
];
