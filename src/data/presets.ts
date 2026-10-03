import { UserPreferences } from '../types';

export interface PresetDemo {
  id: string;
  name: string;
  category: string;
  brand: string;
  sampleImage: string;
  specsSnippet: string;
  mockPreferences: UserPreferences;
  description: string;
}

export const PRESET_DEMOS: PresetDemo[] = [
  {
    id: 'sony-xm5',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    category: 'Audio & Headphones',
    brand: 'Sony',
    sampleImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    specsSnippet: 'Industry-leading noise cancellation with two processors and 8 microphones. 30-hour battery life with quick charging (3 min for 3 hours). Non-folding hinge design. LDAC, AAC, SBC codec support. Multipoint Bluetooth connection.',
    description: 'Flagship ANC headphones with premium sound, but does the non-folding headband fit your commute bag?',
    mockPreferences: {
      budgetMin: 250,
      budgetMax: 400,
      currency: '$',
      primaryUsage: 'Daily subway commute, open office calls, and occasional long flights',
      priorityFactors: ['Active Noise Cancellation', 'Call Microphone Quality', 'Comfort for glasses wearers'],
      dealbreakers: ['Bulky non-compact case', 'Poor sweat resistance'],
      experienceLevel: 'intermediate',
      usageFrequency: 'heavy_daily',
      longevityExpectation: '3-4 years',
      extraNotes: 'I wear glasses all day and carry a slim messenger bag.'
    }
  },
  {
    id: 'macbook-air-m3',
    name: 'Apple MacBook Air 13-inch (M3 chip, 8GB Unified Memory, 256GB SSD)',
    category: 'Laptops & Computers',
    brand: 'Apple',
    sampleImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    specsSnippet: 'Apple M3 chip with 8-core CPU and 8-core GPU. 8GB Unified Memory, 256GB SSD storage. 13.6-inch Liquid Retina display with True Tone. Fanless silent design. Up to 18 hours battery life. MagSafe 3 charging + 2 Thunderbolt ports.',
    description: 'Sleek ultraportable, but is 8GB unified memory adequate for your workflow in 2026?',
    mockPreferences: {
      budgetMin: 800,
      budgetMax: 1100,
      currency: '$',
      primaryUsage: 'Web development (Docker, Node.js), 4K video clips editing, 30+ browser tabs',
      priorityFactors: ['Battery Life', 'Silent Operation', 'Trackpad & Screen Quality'],
      dealbreakers: ['Memory swapping / stutter with heavy multitask', 'Non-expandable storage'],
      experienceLevel: 'enthusiast',
      usageFrequency: 'heavy_daily',
      longevityExpectation: '5+ years',
      extraNotes: 'Need it to last 5 years without slowing down under multi-task dev work.'
    }
  },
  {
    id: 'ninja-coffee',
    name: 'Ninja Specialty 10-Cup Coffee Maker (CM401)',
    category: 'Kitchen Appliances',
    brand: 'Ninja',
    sampleImage: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    specsSnippet: '6 brew styles: Classic, Rich, Over Ice, Specialty Concentrate, etc. Built-in fold-away frother. Pod-free single cup to 10-cup glass carafe. Thermal flavor extraction technology.',
    description: 'Versatile coffee station with cold brew & lattes, but does it fit under standard low kitchen cabinets?',
    mockPreferences: {
      budgetMin: 100,
      budgetMax: 180,
      currency: '$',
      primaryUsage: 'Quick morning iced lattes before work, and full carafes on weekend family brunches',
      priorityFactors: ['Easy cleaning', 'No expensive plastic pods', 'Rich iced coffee taste'],
      dealbreakers: ['Complicated daily descaling', 'Takes up too much counter height'],
      experienceLevel: 'beginner',
      usageFrequency: 'heavy_daily',
      longevityExpectation: '3-4 years',
      extraNotes: 'Small kitchen with 17-inch height clearance under cabinets.'
    }
  }
];
