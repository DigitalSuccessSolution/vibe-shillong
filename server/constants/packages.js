/**
 * Default Festival Ticket Packages & Inclusions
 * Initial seed for MongoDB & shared constants
 */
export const DEFAULT_PACKAGES = [
  {
    key: 'kids',
    badge: 'Family Day Pass',
    title: 'Kids Neon Carnival',
    timing: '12:00 PM – 7:30 PM • All Ages Welcome',
    price: 1000,
    subtitle: 'Valid for 1 Child + 1 Accompanying Parent',
    features: [
      'Full access to all festival game arenas',
      'Unlimited UV blacklight face painting',
      'Soft play area & DIY craft workshop kit',
      'Kids glow dance party & award entry',
    ],
    color: 'cyan',
    popular: false,
    soldOut: false,
  },
  {
    key: 'adult',
    badge: 'Night Pass • Headliner',
    title: 'Adult Neon Nights',
    timing: '8:00 PM Onwards • Strictly 18+',
    price: 1499,
    subtitle: 'Single adult pass • Includes DJ Tina Live headliner set',
    features: [
      'Full entry to Adult Neon Nights main stage',
      'Live set by celebrity DJ Tina',
      'Complimentary neon glow band + UV drink token',
      'Access to interactive blacklight photo installations',
      'Midnight neon laser blast & confetti countdown',
    ],
    color: 'pink',
    popular: true,
    soldOut: false,
  },
  {
    key: 'vip',
    badge: 'Premium VIP Access',
    title: 'VIP Neon Table & Bottle Service',
    timing: '8:00 PM Onwards • Strictly 18+',
    price: 3500,
    subtitle: 'Reserved lounge zone for groups & high-rollers',
    features: [
      'Dedicated VIP elevated table with premium view',
      'Dedicated butler & bottle service package',
      'Backstage artist lounge pass for 2 guests',
      'Exclusive express VIP gate entry with zero queue',
      'Premium glowing merchandise kit included',
    ],
    color: 'lime',
    popular: false,
    soldOut: false,
  },
]
