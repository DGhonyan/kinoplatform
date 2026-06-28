/**
 * Hierarchical source data for the gear ChipPicker (software tools + physical
 * equipment). A group has a `label` (an i18n key for categories, or a literal
 * brand name — both are rendered through `t()`, and literals pass through
 * unchanged) and EITHER nested `groups` (e.g. camera brands) OR leaf `items`
 * (the chip values). Depth is variable: software is one level deep, equipment
 * cameras are two (category → brand → chips).
 *
 * The user model stores a flat `string[]` of selected values — the hierarchy is
 * only for the picker UI.
 */
export type ChipGroup = {
  label: string;
  groups?: ChipGroup[];
  items?: string[];
};

export const SOFTWARE_TOOL_GROUPS: ChipGroup[] = [
  {
    label: 'gear_cat_editing',
    items: [
      'Adobe Premiere Pro',
      'DaVinci Resolve',
      'Final Cut Pro',
      'Avid Media Composer',
      'VEGAS Pro',
      'CapCut',
      'Edius',
    ],
  },
  {
    label: 'gear_cat_vfx',
    items: [
      'Adobe After Effects',
      'Nuke',
      'Fusion',
      'Blackmagic Fusion Studio',
      'Houdini',
      'Autodesk Flame',
      'Mocha Pro',
    ],
  },
  {
    label: 'gear_cat_3d_animation',
    items: [
      'Blender',
      'Autodesk Maya',
      'Cinema 4D',
      '3ds Max',
      'ZBrush',
      'Unreal Engine',
      'Unity',
      'Toon Boom Harmony',
      'TVPaint',
      'Adobe Animate',
      'Moho',
      'OpenToonz',
      'Dragonframe',
      'Stop Motion Studio',
    ],
  },
  {
    label: 'gear_cat_design',
    items: [
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe InDesign',
      'Affinity Photo',
      'Affinity Designer',
      'CorelDRAW',
      'Canva',
    ],
  },
  {
    label: 'gear_cat_audio',
    items: [
      'Pro Tools',
      'Adobe Audition',
      'Reaper',
      'Logic Pro',
      'Cubase',
      'Ableton Live',
      'FL Studio',
      'Audacity',
    ],
  },
  {
    label: 'gear_cat_color',
    items: ['Baselight', 'Scratch'],
  },
  {
    label: 'gear_cat_scriptwriting',
    items: ['Final Draft', 'Celtx', 'Fade In', 'WriterDuet', 'Arc Studio'],
  },
  {
    label: 'gear_cat_scheduling',
    items: [
      'Movie Magic Scheduling',
      'Movie Magic Budgeting',
      'StudioBinder',
      'Celtx Production',
      'Yamdu',
      'ShotGrid',
      'SetHero',
    ],
  },
  {
    label: 'gear_cat_productivity',
    items: [
      'Microsoft Excel',
      'Microsoft Word',
      'Microsoft PowerPoint',
      'Google Sheets',
      'Google Docs',
      'Google Slides',
      'Notion',
      'Airtable',
      'Trello',
      'Asana',
      'ClickUp',
      'Monday.com',
      'Slack',
      'Discord',
      'Zoom',
      'Miro',
    ],
  },
  {
    label: 'gear_cat_photo',
    items: ['Adobe Lightroom', 'Capture One', 'Photo Mechanic'],
  },
  {
    label: 'gear_cat_cad',
    items: ['AutoCAD', 'SketchUp', 'Rhino', 'Vectorworks'],
  },
];

export const EQUIPMENT_GROUPS: ChipGroup[] = [
  {
    label: 'gear_cat_cameras',
    groups: [
      {
        label: 'ARRI',
        items: ['ARRI Alexa Mini', 'ARRI Alexa Mini LF', 'ARRI Alexa 35', 'ARRI Amira'],
      },
      {
        label: 'RED',
        items: ['RED Komodo', 'RED Komodo-X', 'RED V-Raptor', 'RED Gemini'],
      },
      {
        label: 'Sony',
        items: [
          'Sony FX3',
          'Sony FX6',
          'Sony FX9',
          'Sony Burano',
          'Sony Venice',
          'Sony A7S III',
          'Sony A7 IV',
          'Sony A6400',
        ],
      },
      {
        label: 'Canon',
        items: ['Canon C70', 'Canon C80', 'Canon C300', 'Canon C500', 'Canon R5 C'],
      },
      {
        label: 'Blackmagic',
        items: ['BMPCC 4K', 'BMPCC 6K', 'Blackmagic Cinema Camera 6K', 'URSA Mini Pro'],
      },
      {
        label: 'Panasonic',
        items: ['Panasonic GH5', 'Panasonic GH6', 'Panasonic S5II', 'Panasonic EVA1'],
      },
      {
        label: 'DJI',
        items: ['DJI Ronin 4D'],
      },
    ],
  },
  {
    label: 'gear_cat_lenses',
    items: [
      'Signature Prime',
      'Master Prime',
      'Ultra Prime',
      'Supreme Prime',
      'CP.3',
      'Compact Prime',
      'S4/i',
      'Panchro',
      'CN-E',
      'Cine Prime',
      'G Master',
      'Helios',
      'LOMO',
      'Canon FD',
    ],
  },
  {
    label: 'gear_cat_support',
    items: [
      'DJI Ronin S',
      'DJI RS 2',
      'DJI RS 3',
      'DJI RS 4',
      'Zhiyun Crane',
      'Steadicam',
      'EasyRig',
      'Glidecam',
      'Dana Dolly',
      'Slider',
      'Jib',
      'Crane',
      'Sachtler',
      'Manfrotto',
      'Miller',
      'Cartoni',
    ],
  },
  {
    label: 'gear_cat_lighting',
    items: [
      '120D',
      '300D',
      '600D',
      '600X',
      'Forza Series',
      'Pavotube',
      'SkyPanel',
      'Orbiter',
      'SL60',
      'VL Series',
      'Diva Lite',
      'Celeb',
      'Titan Tube',
      'Helios Tube',
    ],
  },
  {
    label: 'gear_cat_audio_gear',
    items: [
      'Zoom H4n',
      'Zoom F6',
      'Zoom F8n',
      'Sound Devices MixPre',
      'Sound Devices 833',
      'Sennheiser MKH416',
      'Rode NTG3',
      'Rode NTG5',
      'Schoeps CMC6',
      'DPA 4017',
      'Sennheiser G4',
      'Sony UWP',
      'Deity Theos',
    ],
  },
  {
    label: 'gear_cat_drones',
    items: ['DJI Mini', 'DJI Air', 'DJI Mavic', 'DJI Inspire', 'DJI Avata'],
  },
];

/** Flatten a ChipGroup tree to all its leaf values (depth-first). */
export const flattenChipGroups = (groups: ChipGroup[]): string[] =>
  groups.flatMap(g => [
    ...(g.items ?? []),
    ...(g.groups ? flattenChipGroups(g.groups) : []),
  ]);
