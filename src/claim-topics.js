export const claimTopics = [
  {
    id: 'food', label: ['Food & budget', 'Alimentos y presupuesto'], available: true,
    prompts: [
      ['What foods provide magnesium?', '¿Qué alimentos son fuente de magnesio?'],
      ['What foods provide vitamin D?', '¿Qué alimentos contienen vitamina D?'],
    ],
  },
  {
    id: 'fitness', label: ['Fitness', 'Ejercicio'], available: false,
    prompts: [
      ['Does pre-workout improve performance?', '¿El preentreno mejora el rendimiento?'],
      ['Does ashwagandha boost testosterone?', '¿La ashwagandha aumenta la testosterona?'],
    ],
  },
  {
    id: 'weight', label: ['Weight loss', 'Pérdida de peso'], available: false,
    prompts: [['Do weight-loss supplements work?', '¿Funcionan los suplementos para bajar de peso?']],
  },
  {
    id: 'immunity', label: ['Immunity', 'Inmunidad'], available: false,
    prompts: [['Does vitamin C prevent colds?', '¿La vitamina C previene los resfriados?']],
  },
];
