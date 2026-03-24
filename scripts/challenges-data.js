/**
 * Shared challenge definitions for ACEP (used by challenges + dashboard)
 */
(function () {
  const CHALLENGES = [
    {
      id: 'challenge_01',
      title: 'Litter Patrol',
      description: 'Clean up litter in your neighborhood or a nearby park.',
      points: 75,
      difficulty: 'easy',
      category: 'pollution',
      instructions:
        'Take a bag and gloves, pick up litter, and sort recyclables when you can. Take a before/after photo of your cleanup area.',
      imageRequired: true,
      requiresParent: false,
    },
    {
      id: 'challenge_02',
      title: 'Water Saver',
      description: 'Save water at home with simple everyday habits.',
      points: 90,
      difficulty: 'easy',
      category: 'water',
      instructions:
        'Try shorter showers, turning off taps while brushing teeth, or fixing a drip. Snap a photo of your family’s water-saving idea in action.',
      imageRequired: true,
      requiresParent: false,
    },
    {
      id: 'challenge_03',
      title: 'Battery Recycler',
      description: 'Collect used batteries and bring them to a proper recycling drop-off.',
      points: 100,
      difficulty: 'easy',
      category: 'waste',
      instructions:
        'Gather dead batteries in a safe container. Photo: batteries ready for drop-off or at the recycling bin (follow local rules).',
      imageRequired: true,
      requiresParent: false,
    },
    {
      id: 'challenge_04',
      title: 'Nature Explorer',
      description: 'Discover plants, birds, or bugs in a local green space.',
      points: 85,
      difficulty: 'easy',
      category: 'wildlife',
      instructions:
        'Visit a trail, park, or yard. Observe quietly and take a photo of something interesting you learned about (plant, animal, or habitat).',
      imageRequired: true,
      requiresParent: false,
    },
    {
      id: 'challenge_05',
      title: 'Pollution Detective',
      description: 'Spot and document pollution safely from a public place.',
      points: 150,
      difficulty: 'medium',
      category: 'pollution',
      instructions:
        'From a safe distance, photograph litter, debris, or discoloration in water or on land. Never trespass or touch anything unsafe.',
      imageRequired: true,
      requiresParent: true,
    },
    {
      id: 'challenge_06',
      title: 'Storm Drain Steward',
      description: 'Learn how storm drains connect to local waterways and keep drains clear.',
      points: 100,
      difficulty: 'easy',
      category: 'pollution',
      instructions:
        'Find a storm drain in your area. Clear leaves or litter from the grate if it is safe to do so. Photo: the cleared drain or your “no dumping” message.',
      imageRequired: true,
      requiresParent: false,
    },
    {
      id: 'challenge_07',
      title: 'Battery Bandit',
      description: 'Round up hidden batteries at home (toys, remotes, flashlights) for recycling.',
      points: 125,
      difficulty: 'medium',
      category: 'waste',
      instructions:
        'Search with a grown-up for loose batteries. Photo: your collection ready for recycling.',
      imageRequired: true,
      requiresParent: false,
    },
    {
      id: 'challenge_08',
      title: 'Water Quality Tester',
      description: 'Use a simple test (strips or a safe demo) to learn about local water.',
      points: 200,
      difficulty: 'hard',
      category: 'water',
      instructions:
        'With a parent, test tap or creek water using a kit if available—or photograph your family reading results from a safe test. Follow all safety instructions on the kit.',
      imageRequired: true,
      requiresParent: true,
    },
    {
      id: 'challenge_09',
      title: 'Hazardous Waste Hunter',
      description: 'Find items that should not go in the trash and plan safe disposal.',
      points: 175,
      difficulty: 'medium',
      category: 'waste',
      instructions:
        'With an adult, identify old paint, chemicals, or electronics that need special disposal. Photo: items grouped for drop-off (no spills, stay safe).',
      imageRequired: true,
      requiresParent: true,
    },
    {
      id: 'challenge_10',
      title: 'Industrial Runoff Reporter',
      description: 'Notice and report unusual water or soil discoloration near industrial areas — from a safe distance.',
      points: 150,
      difficulty: 'medium',
      category: 'industrial',
      instructions:
        'Only from public areas and with a parent, document anything that looks like pollution runoff. Photo: the observation point. If something looks dangerous, tell an adult instead of getting close.',
      imageRequired: true,
      requiresParent: true,
    },
  ];

  const categoryLabels = {
    all: 'All',
    pollution: 'Pollution',
    water: 'Water',
    waste: 'Waste & recycling',
    wildlife: 'Nature',
    industrial: 'Industrial',
  };

  window.acepChallenges = { CHALLENGES, categoryLabels };
})();
