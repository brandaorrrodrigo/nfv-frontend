// Client para os endpoints de Pose Analysis
// Base URL aponta para nfc-core (porta 3100) — adicionar ao .env.local:
// NEXT_PUBLIC_POSE_API_URL=http://localhost:3100
// O nfc-core usa app.setGlobalPrefix('api') no main.ts — todos os endpoints
// ficam sob /api/. Por isso o BASE inclui /api.

const POSE_API_HOST =
  process.env.NEXT_PUBLIC_POSE_API_URL || 'http://localhost:3100';
const POSE_API = `${POSE_API_HOST.replace(/\/$/, '')}/api`;

// NFV Backend (assessments + MediaPipe pipeline) — porta 3002
const NFV_BACKEND_HOST =
  process.env.NEXT_PUBLIC_NFV_BACKEND_URL || 'http://localhost:3002';
const NFV_BACKEND = `${NFV_BACKEND_HOST.replace(/\/$/, '')}/api/v1`;

export type CategoryType =
  | 'mens_physique'
  | 'bikini'
  | 'classic_physique'
  | 'wellness'
  | 'bodybuilding'
  | 'figure'
  | 'womens_physique'
  | 'bodybuilding_212'
  | 'womens_bodybuilding';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  mens_physique: 'Mens Physique',
  bikini: 'Bikini',
  classic_physique: 'Classic Physique',
  wellness: 'Wellness',
  bodybuilding: 'Bodybuilding Open',
  figure: 'Figure',
  womens_physique: "Women's Physique",
  bodybuilding_212: '212 Bodybuilding',
  womens_bodybuilding: "Women's Bodybuilding",
};

export const CATEGORY_POSES: Record<CategoryType, number> = {
  mens_physique: 6,
  bikini: 5,
  classic_physique: 6,
  wellness: 5,
  bodybuilding: 9,
  figure: 5,
  womens_physique: 8,
  bodybuilding_212: 9,
  womens_bodybuilding: 9,
};

export const VALID_CATEGORIES: CategoryType[] = [
  'mens_physique',
  'classic_physique',
  'bodybuilding',
  'bodybuilding_212',
  'bikini',
  'wellness',
  'figure',
  'womens_physique',
  'womens_bodybuilding',
];

export const CATEGORY_GENDER: Record<CategoryType, 'M' | 'F' | 'MF'> = {
  mens_physique: 'M',
  bikini: 'F',
  classic_physique: 'M',
  wellness: 'F',
  bodybuilding: 'M',
  figure: 'F',
  womens_physique: 'F',
  bodybuilding_212: 'M',
  womens_bodybuilding: 'F',
};

export interface PoseInfo {
  id: string;
  nome: string;
  nome_pt: string;
  plano: 'frontal' | 'posterior' | 'sagital' | 'diagonal';
  instrucao: string;
  dica: string;
  erros_comuns?: string[];
  angulos_chave?: {
    frontal?: string[];
    posterior?: string[];
    sagital?: string[];
    ignorar?: string[];
  };
  referencia_url?: string;
}

export const PLANE_LABELS: Record<string, string> = {
  frontal: '⬜ Frente para a câmera',
  posterior: '⬛ Costas para a câmera',
  sagital: '◧ Lateral para a câmera',
  diagonal: '◈ Diagonal para a câmera',
};

export const CATEGORY_POSE_LIST: Record<CategoryType, PoseInfo[]> = {
  // ═══ MENS PHYSIQUE — Regra oficial IFBB 2024 ═══
  mens_physique: [
    { id: 'front_double_biceps_open', nome: 'Front Double Biceps (Open Hands)', nome_pt: 'Duplo Bíceps Frontal — Mãos Abertas', plano: 'frontal', instrucao: 'De frente. Levante os dois braços até a altura dos ombros com cotovelos dobrados. Palmas abertas para baixo, dedos juntos e esticados. Uma perna levemente avançada. Gire levemente o tronco.', dica: 'ATENÇÃO: No Mens Physique as mãos são ABERTAS — punho fechado é penalizado! O foco é proporção atlética, não tamanho muscular.', erros_comuns: ['Fechar o punho — desconto automático', 'Cotovelos acima dos ombros — parece forçado', 'Ficar completamente de frente — um leve twist valoriza'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: ['joelho_esq', 'joelho_dir'] } },
    { id: 'back_pose', nome: 'Back Pose', nome_pt: 'Pose de Costas', plano: 'posterior', instrucao: 'De costas. Postura ereta, ombros abertos. Braços levemente afastados do corpo mostrando o V-taper. Um pé levemente recuado. Olhe para frente.', dica: 'Mens Physique NÃO faz back double biceps com braços levantados. O foco é no V-taper (razão ombro/cintura).', erros_comuns: ['Levantar os braços como no Bodybuilding', 'Curvar a coluna', 'Quadril muito projetado'], angulos_chave: { posterior: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: ['cotovelo_esq', 'cotovelo_dir'] } },
    { id: 'quarter_turn_front', nome: 'Quarter Turn — Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente. Postura atlética natural. Pés paralelos na largura dos ombros. Olhar fixo à frente. Abdômen contraído. Mãos naturais ao lado do corpo. Expressão confiante.', dica: 'Pose mais importante do Mens Physique — os juízes avaliam "stage presence" e proporção atlética geral.', erros_comuns: ['Relaxar o abdômen', 'Olhar para baixo', 'Ficar rígido demais — pareça natural'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir'] } },
    { id: 'quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Corpo levemente girado em direção aos juízes — não completamente lateral. Mão na cintura, braço oposto relaxado. Perna mais próxima levemente dobrada no joelho.', dica: 'Regra IFBB 2024: "upper body slightly turned toward the judges". Não é completamente lateral — é um twist elegante.', erros_comuns: ['Ficar completamente de lado', 'Cotovelo para fora', 'Perna da frente travada'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Espelho do quarter turn direito. Mão oposta na cintura. Mesmo twist para os juízes.', dica: 'Mantenha consistência entre os dois lados — espelho perfeito.', erros_comuns: ['Mudar postura de um lado pro outro', 'Esconder o lado fraco'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva. Pés paralelos. Joelhos levemente flexionados. Ombros abertos e para baixo. Abdômen contraído. Mãos naturais ao lado do corpo.', dica: 'Os juízes observam o atleta o tempo TODO. "Stage presence" e personalidade são critérios de julgamento no Mens Physique.', erros_comuns: ['Relaxar entre poses', 'Cruzar braços ou mãos nos bolsos', 'Joelhos travados em hiperextensão'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ CLASSIC PHYSIQUE — 6 poses mandatórias IFBB 2024 ═══
  classic_physique: [
    { id: 'front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente. Uma perna avançada. Braços na altura dos ombros, cotovelos dobrados. Punhos FECHADOS virados para baixo. Contraia o máximo de músculos possível.', dica: 'No Classic os punhos são FECHADOS (diferente do Mens Physique). A cintura estreita é o grande diferencial — CBum e Ramon Dino são as referências.', erros_comuns: ['Abrir as mãos — deve ser punho fechado', 'Cotovelos acima dos ombros', 'Não mostrar a cintura estreita — critério principal'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco'], ignorar: [] } },
    { id: 'side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Completamente lateral. Braço da frente dobrado 90° com punho fechado, mão de trás segura o pulso. Perna da frente dobrada no joelho na ponta do pé. Expanda o peitoral.', dica: 'Regra: "bend the arm nearest the judges to a right-angle position, fist clenched, grasp the wrist with the other hand." Joelho na ponta ativa panturrilha.', erros_comuns: ['Não ficar completamente lateral', 'Perna traseira dobrada — deve estar estendida', 'Não expandir o peitoral'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas. Mesma posição dos braços do Front Double Biceps — punhos fechados. Um pé atrás na ponta dos dedos. Contraia braços, ombros, costas, coxas e panturrilhas.', dica: 'Pose mais reveladora do Classic — CINTURA ESTREITA de costas é o diferencial. Juízes avaliam: pescoço, deltóides, bíceps, trapézio, dorsais, glúteos, isquiotibiais.', erros_comuns: ['Não colocar pé na ponta — perde ativação da panturrilha', 'Cintura larga — V-taper de costas é decisivo'], angulos_chave: { posterior: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'joelho_dir'], ignorar: [] } },
    { id: 'side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Lateral. Ambos os braços atrás das costas — entrelace dedos ou segure o pulso. Empurre contra o braço da frente para contrair o tríceps. Perna da frente dobrada, traseira na ponta.', dica: 'Regra: "place both arms behind back, linking fingers or grasping front arm by wrist. Exert pressure against front arm." Eleve o peito.', erros_comuns: ['Não empurrar os braços — tríceps não aparece', 'Perna da frente estendida — deve dobrar', 'Não elevar o peito'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'abdominals_thighs', nome: 'Abdominals & Thighs (Vacuum)', nome_pt: 'Abdômen, Coxas e Vacuum', plano: 'frontal', instrucao: 'De frente. Mãos atrás da nuca, cotovelos para os lados. Avance uma perna com joelho dobrado ~25°. VACUUM OBRIGATÓRIO — puxe o abdômen para dentro ao máximo.', dica: 'REGRA CRÍTICA: No Classic Physique quem não faz vacuum é DESQUALIFICADO! Diferente do Open onde abdômen é empurrado para fora. Cintura o mais estreita possível.', erros_comuns: ['Empurrar abdômen para fora — DESQUALIFICAÇÃO', 'Não fazer vacuum — obrigatório nesta categoria', 'Cotovelos fechados — devem apontar para os lados'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros', 'joelho_esq', 'joelho_dir', 'alinhamento_tronco'], ignorar: ['abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra do Classic Physique. Pés paralelos. Joelhos levemente flexionados. Ombros abertos e para trás. Postura digna da era dourada.', dica: 'O Classic celebra a era dourada — pense em Arnold, Frank Zane. Presença imponente mesmo em descanso.', erros_comuns: ['Postura relaxada', 'Ombros curvados'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ BIKINI — Quarter turns + feminilidade ═══
  bikini: [
    { id: 'quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente. Postura elegante e feminina. Um pé levemente à frente. Uma mão levemente na cintura ou natural ao lado. Sorriso natural. Ombros para trás, peito levantado.', dica: 'O Bikini julga "total package" feminino: simetria, tônus SEM excessos, beleza e confiança. Musculatura excessiva é PENALIZADA.', erros_comuns: ['Musculatura muito desenvolvida — desconto', 'Expressão séria/tensa — deve ser natural', 'Glúteos muito planos — o Bikini exige glúteos firmes'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Lado direito com leve twist para os juízes. Mão na cintura, braço oposto natural. Glúteo contraído e firme. Coluna ereta. Sorriso natural.', dica: 'Regra NPC/IFBB: "right hand on hip, left arm straight down, right leg bent at knee. More like a twisting side pose."', erros_comuns: ['Sem twist — juízes querem ver proporção', 'Glúteo relaxado', 'Cotovelo para fora'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas. Postura ereta, lombar levemente arqueada, glúteos empurrados para trás. Mãos naturais ao lado. Glúteos firmes e contraídos.', dica: 'Pose MAIS IMPORTANTE do Bikini. Regra: "lower back arched with glutes pushed back." Glúteos firmes sem "tie-in" visível.', erros_comuns: ['Glúteos relaxados', 'Coluna curvada para frente', 'Tie-in visível entre glúteo e isquiotibial'], angulos_chave: { posterior: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Espelho do quarter turn direito. Mão esquerda na cintura, braço direito natural. Mesmo twist elegante.', dica: 'Consistência entre os dois lados. Os juízes comparam os profiles.', erros_comuns: ['Perder consistência entre lados', 'Relaxar expressão'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra feminina. Pés levemente afastados, um à frente. Ombros abertos. Glúteos contraídos. Expressão natural e confiante.', dica: 'Em competição usa salto alto — treine com salto! Expressão e personalidade contam muito no Bikini.', erros_comuns: ['Postura relaxada entre poses', 'Não acostumada com salto alto — pratique!'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ WELLNESS — Lower body > Upper body ═══
  wellness: [
    { id: 'quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente. Uma mão na cintura, outra braço reto para baixo. Uma perna levemente estendida para o lado. Expressão confiante e feminina.', dica: 'Regra IFBB: "face front with one hand on hip, one arm straight down." NÃO coloque braço com cotovelo dobrado — é desconto. Glúteos e coxas desenvolvidos são o foco.', erros_comuns: ['Braço com cotovelo dobrado — desconto oficial', 'Upper body muito desenvolvido — deve ser MENOR que lower body'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Lado direito com twist para os juízes. Mão direita no quadril, braço esquerdo reto. Perna direita levemente dobrada. Glúteos contraídos e projetados.', dica: 'Regra: "right hand on hip, left arm straight down, right leg bent at knee. More like a twisting side pose." O perfil mostra o grande diferencial do Wellness.', erros_comuns: ['Braço oposto dobrado — deve estar reto', 'Glúteo relaxado — deve estar projetado'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas. Lombar arqueada, glúteos empurrados para trás e para cima. Pose MAIS IMPORTANTE do Wellness — glúteos e isquiotibiais são o critério principal.', dica: 'Regra: "face rear with lower back arched with glutes pushed back." Wellness exige glúteos muito mais que Bikini. Curvas, volume e separação.', erros_comuns: ['Glúteos sem volume — essência da categoria', 'Lombar não arqueada — perde forma'], angulos_chave: { posterior: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Espelho do quarter turn direito. Mão esquerda no quadril, braço direito reto. Glúteos contraídos.', dica: 'Consistência entre lados é fundamental. O Wellness é crescente no Brasil — juízes são exigentes com proporção lower/upper body.', erros_comuns: ['Perder proporção entre perfis', 'Upper body assumindo protagonismo'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra do Wellness. Pés valorizando proporção do corpo inferior. Postura ereta, expressão confiante e feminina. Glúteos contraídos.', dica: 'Wellness valoriza físico atlético e curvilíneo. Confiança e feminilidade ao mesmo tempo.', erros_comuns: ['Relaxar postura', 'Parecer rígida'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ BODYBUILDING OPEN — 8 poses mandatórias + stage presence ═══
  bodybuilding: [
    { id: 'bb_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente. Uma perna avançada. Braços à altura dos ombros, punhos fechados virados para baixo. Contraia TUDO: bíceps, deltoides, peitoral, abdômen, quadríceps.', dica: 'Survey da cabeça aos pés — cada grupo deve estar em contração máxima. Referências: Samson Dauda, Derek Lunsford.', erros_comuns: ['Relaxar algum grupo — tudo deve estar contraído', 'Cotovelos acima dos ombros', 'Abdômen distendido', 'Quadríceps não separado'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: [] } },
    { id: 'bb_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente. Mãos nos quadris, cotovelos para baixo e para fora. Empurre cotovelos para frente enquanto abre dorsais ao máximo. Pernas ativas.', dica: 'V-taper máximo — razão ombro/cintura é o critério principal. Separe cotovelos e empurre para baixo e frente.', erros_comuns: ['Cotovelos muito acima', 'Não abrir dorsais lateralmente', 'Cintura larga', 'Pernas relaxadas'], angulos_chave: { frontal: ['abducao_ombro_esq', 'abducao_ombro_dir', 'cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros'], ignorar: ['joelho_esq', 'joelho_dir'] } },
    { id: 'bb_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Completamente lateral. Braço da frente em 90° com punho fechado, mão de trás segurando o pulso. Perna da frente na ponta. Expanda o peitoral e contraia bíceps.', dica: 'Espessura impressionante do peitoral. Empurre braço da frente para maximizar o arco. Isquiotibial e panturrilha da perna traseira avaliados.', erros_comuns: ['Não expandir peitoral', 'Perna traseira sem tensão', 'Não ficar completamente lateral', 'Braço traseiro solto'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'bb_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas. Punhos fechados, braços na altura dos ombros. Um pé atrás na ponta. Contraia: braços, deltoides, trapézio, dorsais, eretores, glúteos, isquiotibiais, panturrilhas.', dica: 'Pose mais reveladora — survey mais completo. Os juízes avaliam do pescoço às panturrilhas.', erros_comuns: ['Cintura larga', 'Pé atrás sem ponta', 'Glúteos relaxados', 'Coluna não ereta'], angulos_chave: { posterior: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'joelho_dir'], ignorar: [] } },
    { id: 'bb_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas. Mãos nos quadris, cotovelos para baixo e para fora. Abra dorsais ao máximo. Glúteos e isquiotibiais contraídos. Coluna ereta.', dica: 'V-taper máximo de costas. Largura vs cintura. Espessura, separação e estriamento das costas totalmente visíveis.', erros_comuns: ['Cotovelos para cima', 'Sem tensão nos dorsais', 'Glúteos relaxados', 'Coluna curvada'], angulos_chave: { posterior: ['abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'nivelamento_quadril'], ignorar: [] } },
    { id: 'bb_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Completamente lateral. Braços atrás das costas — entrelace dedos ou segure pulso. Perna da frente dobrada, traseira na ponta. Empurre braços para contrair tríceps.', dica: 'Três cabeças do tríceps visíveis com separação clara. Eleve peito e contraia abdômen simultaneamente.', erros_comuns: ['Sem pressão entre braços', 'Cotovelo da frente dobrado', 'Perna da frente muito dobrada', 'Não elevar peito'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'bb_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente. Mãos atrás da nuca, cotovelos para os lados. Uma perna avançada ~25°. Abdômen PARA FORA mostrando definição. Quadríceps contraído.', dica: 'No Open o abdômen vai PARA FORA (não vacuum). 6-pack visível, oblíquos separados. Quadríceps com separação e estriamento.', erros_comuns: ['Fazer vacuum — no Open vai PARA FORA', 'Cotovelos fechados', 'Quadríceps não contraído', 'Joelho travado'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros', 'joelho_esq', 'joelho_dir', 'alinhamento_tronco'], ignorar: ['abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'bb_most_muscular', nome: 'Most Muscular', nome_pt: 'Pose Mais Muscular', plano: 'frontal', instrucao: 'De frente. Crab (tronco inclinado, braços para baixo e fora, punhos fechados) ou mãos no quadril. Contraia TUDO. Cada músculo visível.', dica: 'Pose de marca registrada — Samson Dauda crab clássico, Hadi Choopan crab agressivo. Densidade muscular total avaliada.', erros_comuns: ['Inclinar demais para frente', 'Não contrair pescoço/trapézio', 'Pernas relaxadas', 'Sem intensidade'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva. Pés paralelos. Joelhos levemente flexionados. Ombros abertos. Postura imponente — NUNCA relaxe completamente.', dica: 'O "relaxed round" ainda é competitivo. Hadi Choopan mantém o físico apresentado mesmo em descanso.', erros_comuns: ['Relaxar completamente', 'Ombros curvados', 'Barriga estufada'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ FIGURE — 4 quarter turns (sem poses de musculação) ═══
  figure: [
    { id: 'fig_quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente. Postura atlética feminina. Uma perna avançada. Ombros desenvolvidos, cintura estreita em evidência. Expressão confiante e elegante.', dica: 'Figure julga "total package": ombros e costas desenvolvidos, cintura estreita, pernas tonificadas e feminilidade. Mais musculosa que Bikini mas NÃO faz poses de musculação.', erros_comuns: ['Postura de musculação — Figure não é bodybuilding', 'Expressão agressiva — deve ser feminina', 'Ombros sem cintura estreita — proporção é critério', 'Condicionamento excessivo — desconto'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'fig_quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Lado direito com leve twist para os juízes. Uma mão na cintura, braço oposto natural. Perna da frente avançada. Perfil atlético e feminino.', dica: 'Perfil revela proporção ombros/cintura/quadril. Glúteo e coxa mais desenvolvidos que Bikini mas sem extremo do Wellness.', erros_comuns: ['Completamente de lado — twist para juízes', 'Cotovelo para fora', 'Quadril projetado artificialmente'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'fig_quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas. Ombros abertos mostrando desenvolvimento dorsal. Cintura estreita. Glúteos firmes. Mãos naturais ao lado.', dica: 'Costas desenvolvidas são o diferencial vs Bikini. Ombros redondos, dorsais visíveis, V-taper, glúteos firmes.', erros_comuns: ['Ombros curvados — costas são protagonista', 'Glúteos relaxados', 'Postura de bodybuilding'], angulos_chave: { posterior: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'fig_quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Espelho do quarter turn direito. Mão esquerda na cintura, braço direito natural. Mesmo twist elegante.', dica: 'Consistência entre os dois perfis. Simetria é critério central no Figure.', erros_comuns: ['Postura diferente entre lados', 'Relaxar expressão'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva. Pés levemente afastados. Ombros abertos. Postura atlética e feminina. Expressão elegante e confiante.', dica: 'Figure usa salto alto em competição. Treine com salto. Elegância e porte são avaliados o tempo todo.', erros_comuns: ['Postura relaxada', 'Perder elegância', 'Não acostumada com salto'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ WOMEN'S PHYSIQUE — 5 mandatórias + quarter turns + stage ═══
  womens_physique: [
    { id: 'wp_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente. Uma perna avançada. Braços à altura dos ombros, punhos fechados virados para baixo. Contraia bíceps, deltoides, peitoral, quadríceps.', dica: 'Musculatura desenvolvida mas NÃO excessivamente seca/estriada — isso é penalizado. Sarah Villegas (3x Olympia) é a referência.', erros_comuns: ['Condicionamento excessivo — desconto', 'Perder feminilidade', 'Quadríceps não contraído', 'Assimetria'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: [] } },
    { id: 'wp_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Completamente lateral. Braço da frente 90° com punho fechado, mão de trás segurando pulso. Perna da frente na ponta. Expanda peitoral.', dica: 'Mesma execução técnica do masculino. Peitoral feminino desenvolvido e proporção ombro/cintura/quadril avaliados.', erros_comuns: ['Não expandir peitoral', 'Não ficar completamente lateral', 'Perna traseira sem tensão'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'wp_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas. Punhos fechados. Um pé atrás na ponta. Contraia braços, costas, glúteos e isquiotibiais.', dica: 'Qualidade muscular posterior — trapézio, dorsais, eretores, glúteos. Cintura estreita muito valorizada. Referência: Natalia Abraham Coelho.', erros_comuns: ['Cintura larga', 'Pé atrás sem ponta', 'Glúteos relaxados'], angulos_chave: { posterior: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'joelho_dir'], ignorar: [] } },
    { id: 'wp_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Lateral. Regra IFBB: "braço da frente estendido e travado, mão aberta, palma para baixo. Perna traseira dobrada, frente estendida na ponta." Empurre para contrair tríceps.', dica: 'No WP a regra é específica: braço da frente ESTENDIDO e TRAVADO (diferente do masculino). Mão ABERTA (não punho fechado) nesta variação feminina.', erros_comuns: ['Dobrar cotovelo — deve estar travado', 'Fechar punho — no WP mão é aberta', 'Perna da frente dobrada — deve estar estendida', 'Sem tensão'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'wp_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente. Mãos atrás da nuca, cotovelos para os lados. Uma perna avançada com joelho dobrado. Contraia abdômen mostrando definição e quadríceps.', dica: 'Definição abdominal feminina desenvolvida — reto abdominal visível com oblíquos. Condicionamento impressionante mas não excessivo.', erros_comuns: ['Condicionamento excessivo — penalizado', 'Cotovelos fechados', 'Quadríceps não contraído'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros', 'joelho_esq', 'joelho_dir', 'alinhamento_tronco'], ignorar: ['abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'wp_quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente. Postura atlética feminina. Uma perna avançada. Expressão confiante. Musculatura com feminilidade.', dica: 'Musculatura desenvolvida + apresentação feminina e elegante.', erros_comuns: ['Perder feminilidade na postura de descanso', 'Expressão agressiva'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: ['cotovelo_esq', 'cotovelo_dir'] } },
    { id: 'wp_quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas. Ombros abertos mostrando desenvolvimento dorsal. Glúteos firmes. Apresentação atlética e feminina.', dica: 'V-taper feminino de costas. Dorsais visíveis, cintura estreita, glúteos desenvolvidos.', erros_comuns: ['Ombros curvados', 'Glúteos relaxados'], angulos_chave: { posterior: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: ['cotovelo_esq', 'cotovelo_dir'] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva. Pés paralelos, postura atlética ereta. Expressão confiante e feminina.', dica: 'Celebra a atleta forte e feminina. Poder e elegância simultaneamente.', erros_comuns: ['Relaxar postura', 'Perder feminilidade'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ 212 BODYBUILDING — mesmas 8 poses, simetria > tamanho ═══
  bodybuilding_212: [
    { id: 'b212_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente. Uma perna avançada. Braços à altura dos ombros, punhos fechados virados para baixo. Contraia bíceps, deltoides, peitoral, abdômen, quadríceps.', dica: 'No 212, SIMETRIA supera TAMANHO. Flex Lewis (7x Olympia) e Keone Pearson são referências de proporção impecável. Qualidade supera quantidade.', erros_comuns: ['Tentar parecer maior — o 212 pune falta de simetria', 'Assimetria — mais perceptível que no Open', 'Condicionamento insuficiente'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: [] } },
    { id: 'b212_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente. Mãos nos quadris, cotovelos para baixo e para fora. Abra dorsais ao máximo. Pernas ativas.', dica: 'V-taper proporcional pode ser mais impressionante que no Open por atletas menores com melhores proporções. Flex Lewis é a referência.', erros_comuns: ['Não criar V-taper real', 'Cotovelos para cima', 'Pernas relaxadas'], angulos_chave: { frontal: ['abducao_ombro_esq', 'abducao_ombro_dir', 'cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros'], ignorar: ['joelho_esq', 'joelho_dir'] } },
    { id: 'b212_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Completamente lateral. Braço da frente 90° com punho fechado, mão de trás segurando pulso. Perna da frente na ponta. Expanda peitoral.', dica: 'Espessura proporcional pode superar atletas maiores em qualidade. Flex Lewis tinha espessura extraordinária para seu tamanho.', erros_comuns: ['Não expandir peitoral', 'Não ficar completamente lateral', 'Perna traseira sem tensão'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'b212_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas. Punhos fechados. Um pé atrás na ponta. Contraia tudo: braços, costas, glúteos, isquiotibiais, panturrilhas.', dica: 'Cintura estreita ainda mais valorizada no 212. Keone Pearson tem cintura extraordinariamente estreita de costas.', erros_comuns: ['Cintura larga — V-taper decisivo no 212', 'Pé atrás sem ponta', 'Glúteos relaxados'], angulos_chave: { posterior: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'joelho_dir'], ignorar: [] } },
    { id: 'b212_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas. Mãos nos quadris, cotovelos para baixo e para fora. Abra dorsais ao máximo. Glúteos e isquiotibiais contraídos.', dica: 'Largura de costas proporcional. Qualidade — espessura, separação, estriamento — totalmente visível aqui.', erros_comuns: ['Dorsais não abertos', 'Glúteos relaxados', 'Coluna curvada'], angulos_chave: { posterior: ['abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'nivelamento_quadril'], ignorar: [] } },
    { id: 'b212_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Lateral. Braços atrás das costas, entrelace dedos ou segure pulso. Perna da frente dobrada, traseira na ponta. Empurre para contrair tríceps.', dica: 'Separação das três cabeças muito avaliada no 212. Atletas menores frequentemente têm melhor separação. Qualidade supera tamanho.', erros_comuns: ['Sem pressão entre braços', 'Cotovelo dobrado', 'Perna da frente muito dobrada'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'b212_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente. Mãos atrás da nuca, cotovelos para os lados. Perna avançada com joelho dobrado. Abdômen PARA FORA. Quadríceps contraído.', dica: 'Definição abdominal pode superar atletas do Open em condicionamento. Shaun Clarida é famoso pela definição extraordinária.', erros_comuns: ['Fazer vacuum — no 212 vai PARA FORA', 'Quadríceps não separado', 'Cotovelos fechados'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros', 'joelho_esq', 'joelho_dir', 'alinhamento_tronco'], ignorar: ['abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'b212_most_muscular', nome: 'Most Muscular', nome_pt: 'Pose Mais Muscular', plano: 'frontal', instrucao: 'De frente. Crab ou mãos no quadril. Contraia TUDO. Cada músculo visível.', dica: 'Densidade concentrada em físico menor pode ser mais impressionante. Keone Pearson tem crab devastador para seu tamanho.', erros_comuns: ['Tentar parecer grande — enfatize densidade', 'Pescoço/trapézio não contraído', 'Pernas relaxadas'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva do 212. Pés paralelos, postura imponente e simétrica. Presença que transmite confiança e domínio.', dica: 'Flex Lewis era famoso pela presença de palco — dominava sem ser o maior. Personalidade compensa tamanho no 212.', erros_comuns: ['Relaxar completamente', 'Perder simetria em descanso'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
  // ═══ WOMEN'S BODYBUILDING — 7 mandatórias + most muscular + stage ═══
  womens_bodybuilding: [
    { id: 'wb_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente. Uma perna avançada. Braços à altura dos ombros, punhos fechados virados para baixo. Contraia bíceps ao máximo junto com deltoides, peitoral, abdômen, quadríceps.', dica: 'ÚNICA categoria feminina onde musculatura extrema é valorizada. Andrea Shaw (5x Olympia) é a referência. Pico, separação e densidade como no masculino.', erros_comuns: ['Não contrair ao máximo', 'Assimetria — simetria é central', 'Não mostrar pico do bíceps', 'Perder feminilidade — apresentação feminina conta'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'nivelamento_quadril'], ignorar: [] } },
    { id: 'wb_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente. Mãos nos quadris, cotovelos para baixo e para fora. Abra dorsais ao máximo. Pernas ativas.', dica: 'V-taper feminino extremo é critério principal. Andrea Shaw tem dorsais extraordinários. Relação ombro/cintura dramática.', erros_comuns: ['Dorsais não abertos', 'Cintura larga', 'Pernas relaxadas'], angulos_chave: { frontal: ['abducao_ombro_esq', 'abducao_ombro_dir', 'cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros'], ignorar: ['joelho_esq', 'joelho_dir'] } },
    { id: 'wb_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Completamente lateral. Braço da frente 90°, mão de trás segurando pulso. Perna da frente na ponta. Expanda peitoral.', dica: 'Peitoral feminino extremo avaliado. Espessura e arco do peitoral junto com perfil geral.', erros_comuns: ['Não expandir peitoral', 'Não ficar completamente lateral'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'wb_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas. Punhos fechados. Um pé atrás na ponta. Contraia tudo: braços, costas, glúteos, pernas.', dica: 'Musculatura posterior feminina ao extremo. Andrea Shaw tem dorsais, trapézio e eretores que rivalizam com atletas masculinos menores.', erros_comuns: ['Não mostrar espessura das costas', 'Glúteos relaxados', 'Pé atrás sem ponta'], angulos_chave: { posterior: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco', 'joelho_dir'], ignorar: [] } },
    { id: 'wb_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas. Mãos nos quadris, cotovelos para baixo e para fora. Dorsais ao máximo. Glúteos contraídos.', dica: 'Largura máxima de costas. Andrea Shaw cria V-taper comparável a atletas masculinos.', erros_comuns: ['Dorsais não abertos', 'Glúteos relaxados'], angulos_chave: { posterior: ['abducao_ombro_esq', 'abducao_ombro_dir', 'nivelamento_ombros', 'alinhamento_tronco'], ignorar: [] } },
    { id: 'wb_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Escolha o melhor lado. Lateral. Braços atrás das costas. Empurre para contrair tríceps. Perna da frente dobrada, traseira recuada.', dica: 'Três cabeças do tríceps feminino desenvolvido ao extremo avaliadas. Separação clara exigida.', erros_comuns: ['Sem pressão — tríceps não aparece', 'Postura lateral comprometida'], angulos_chave: { sagital: ['alinhamento_tronco', 'joelho_esq', 'joelho_dir', 'cotovelo_esq'], ignorar: ['nivelamento_ombros', 'nivelamento_quadril'] } },
    { id: 'wb_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente. Mãos atrás da nuca, cotovelos para os lados. Perna avançada com joelho dobrado. Abdômen PARA FORA. Quadríceps contraído.', dica: 'Condicionamento abdominal extremo — estriamento e separação total valorizados. Única categoria feminina onde isso é positivo.', erros_comuns: ['Vacuum — abdômen vai PARA FORA', 'Condicionamento insuficiente', 'Quadríceps sem separação'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'nivelamento_ombros', 'joelho_esq', 'joelho_dir', 'alinhamento_tronco'], ignorar: ['abducao_ombro_esq', 'abducao_ombro_dir'] } },
    { id: 'wb_most_muscular', nome: 'Most Muscular (opcional)', nome_pt: 'Pose Mais Muscular', plano: 'frontal', instrucao: 'De frente. Crab ou mãos no quadril. Contraia toda a musculatura. Pose de "assinatura".', dica: 'ÚNICA categoria feminina com Most Muscular. Andrea Shaw tem crab devastador que rivaliza com atletas masculinos em intensidade.', erros_comuns: ['Não contrair com intensidade máxima', 'Pernas relaxadas', 'Exagerar inclinação'], angulos_chave: { frontal: ['cotovelo_esq', 'cotovelo_dir', 'abducao_ombro_esq', 'abducao_ombro_dir', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva. Pés paralelos, postura imponente. Físico apresentado o tempo todo. Expressão confiante e feminina.', dica: 'Mesmo nesta categoria extrema, feminilidade e presença contam. Andrea Shaw combina musculatura com elegância.', erros_comuns: ['Relaxar completamente', 'Perder expressão feminina'], angulos_chave: { frontal: ['alinhamento_tronco', 'nivelamento_ombros', 'nivelamento_quadril', 'joelho_esq', 'joelho_dir'], ignorar: [] } },
  ],
};

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseAnalysisResult {
  pose_id: string;
  nome_pose: string;
  categoria: CategoryType;
  score_angulos: number;
  score_simetria: number;
  score_final: number;
  pontos_fortes: string[];
  correcoes_prioritarias: string[];
  dica_coach: string;
  comparacao_campeoes: { atleta: string; similaridade: number }[];
}

export interface PersonalizedPose {
  pose_id: string;
  nome_pose: string;
  score_estimado_sem_ajuste: number;
  score_estimado_com_ajuste: number;
  delta_melhoria: number;
  instrucoes_resumidas: string[];
  estrategias_aplicadas: {
    assimetria_alvo: string;
    instrucao_completa_pt: string;
    score_delta_estimado: number;
  }[];
}

export interface AthletePosingProtocol {
  atleta_id: string;
  categoria: CategoryType;
  gerado_em: string;
  poses: PersonalizedPose[];
  resumo_coach_pt: string;
  prioridades_treino_posing: string[];
  poses_mais_criticas: string[];
  poses_mais_fortes: string[];
  ganho_total_estimado: number;
}

export interface DetectedAsymmetry {
  tipo: string;
  regiao: string;
  magnitude: number;
  lado_afetado: string;
  mascarabilidade: 'total' | 'partial' | 'impossible';
  descricao_pt: string;
  impacto_competitivo: 'alto' | 'medio' | 'baixo';
}

export interface AsymmetryProfile {
  atletaId: string;
  categoria: CategoryType;
  score_simetria_geral: number;
  assimetrias: DetectedAsymmetry[];
  pontos_fortes: { regiao: string; score: number; descricao: string }[];
  resumo: string;
  total_assimetrias: number;
  mascaraveis: number;
}

// Mock de landmarks para demonstração (substitui MediaPipe temporariamente)
export const MOCK_SYMMETRIC_LANDMARKS: Record<string, LandmarkPoint> = {
  left_shoulder: { x: 0.35, y: 0.35, z: 0.0, visibility: 0.99 },
  right_shoulder: { x: 0.65, y: 0.35, z: 0.0, visibility: 0.99 },
  left_elbow: { x: 0.2, y: 0.35, z: 0.05, visibility: 0.99 },
  right_elbow: { x: 0.8, y: 0.35, z: 0.05, visibility: 0.99 },
  left_wrist: { x: 0.2, y: 0.55, z: 0.05, visibility: 0.99 },
  right_wrist: { x: 0.8, y: 0.55, z: 0.05, visibility: 0.99 },
  left_hip: { x: 0.4, y: 0.6, z: 0.0, visibility: 0.99 },
  right_hip: { x: 0.6, y: 0.6, z: 0.0, visibility: 0.99 },
  left_knee: { x: 0.4, y: 0.78, z: 0.0, visibility: 0.99 },
  right_knee: { x: 0.6, y: 0.78, z: 0.0, visibility: 0.99 },
  left_ankle: { x: 0.4, y: 0.95, z: 0.0, visibility: 0.99 },
  right_ankle: { x: 0.6, y: 0.95, z: 0.0, visibility: 0.99 },
  nose: { x: 0.5, y: 0.15, z: -0.1, visibility: 0.99 },
  left_ear: { x: 0.43, y: 0.15, z: 0.0, visibility: 0.9 },
  right_ear: { x: 0.57, y: 0.15, z: 0.0, visibility: 0.9 },
};

export const poseAnalysisApi = {
  async generateProtocol(
    atletaId: string,
    categoria: CategoryType,
    landmarks = MOCK_SYMMETRIC_LANDMARKS,
    salvar = true,
  ): Promise<AthletePosingProtocol> {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/protocol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atletaId, categoria, landmarks, salvar }),
    });
    if (!res.ok) throw new Error(`Protocol error: ${res.status}`);
    return res.json();
  },

  async detectAsymmetries(
    atletaId: string,
    categoria: CategoryType,
    landmarks = MOCK_SYMMETRIC_LANDMARKS,
  ): Promise<AsymmetryProfile> {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/asymmetries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atletaId, categoria, landmarks }),
    });
    if (!res.ok) throw new Error(`Asymmetry error: ${res.status}`);
    return res.json();
  },

  async getHistory(atletaId: string, categoria?: CategoryType) {
    const url = `${POSE_API}/nfv/pose-analysis/history/${atletaId}${categoria ? `?categoria=${categoria}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`History error: ${res.status}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/categories`);
    if (!res.ok) throw new Error(`Categories error: ${res.status}`);
    return res.json();
  },

  async compareWithChampions(
    atletaId: string,
    categoria: CategoryType,
    landmarks: Record<string, LandmarkPoint>,
    poseId?: string,
  ): Promise<{
    pose: string;
    score_atleta: number;
    comparacoes: Array<{
      atleta: string;
      similaridade: number;
      angulos_campeao: Record<string, number>;
    }>;
    melhor_match: {
      atleta: string;
      similaridade: number;
      angulos_campeao: Record<string, number>;
    } | null;
    gap_para_elite: number | null;
  } | null> {
    try {
      const res = await fetch(
        `${POSE_API}/nfv/pose-analysis/compare-champions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ atletaId, categoria, landmarks, poseId }),
        },
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  async analyzeSession(
    atletaId: string,
    categoria: CategoryType,
    poses: { poseId: string; landmarks: Record<string, LandmarkPoint> }[],
    salvar = true,
  ) {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atletaId, categoria, poses, salvar }),
    });
    if (!res.ok) throw new Error(`Session error: ${res.status}`);
    return res.json();
  },

  // ─── Upload de foto real → MediaPipe → nfc-core protocolo ────────────────
  // Cria assessment do tipo POSE_ANALYSIS no nfv-backend, faz polling até
  // o BullMQ rodar pose_analysis.py que extrai landmarks via MediaPipe e
  // chama o nfc-core para gerar o protocolo IFBB completo.
  async uploadAndAnalyze(
    file: File,
    categoria: CategoryType,
    atletaId: string,
    patientId: string,
    poseId?: string,
  ): Promise<{
    assessmentId: string;
    status: string;
    landmarks: Record<string, LandmarkPoint>;
    protocol: AthletePosingProtocol;
    asymmetries: AsymmetryProfile | null;
    scores: Record<string, number>;
    avg_confidence?: number;
  }> {
    // 1. Foto → base64 data URI
    const base64 = await fileToBase64(file);

    // 2. Token do cookie nfv_token (se houver)
    const token = readCookie('nfv_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // 3. POST /assessments
    const createRes = await fetch(`${NFV_BACKEND}/assessments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId,
        type: 'POSE_ANALYSIS',
        mediaUrl: base64,
        mediaType: 'PHOTO',
        rawResults: { categoria, atletaId, ...(poseId ? { poseId } : {}) },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => '');
      throw new Error(
        `Falha ao criar assessment (${createRes.status}): ${errText.slice(0, 200)}`,
      );
    }

    const created = await createRes.json();
    const assessmentId: string = created.id ?? created.assessmentId;
    if (!assessmentId) {
      throw new Error('Resposta do backend sem assessmentId');
    }

    // 4. Polling — 60 tentativas × 2s = 120s máx
    const MAX_POLLS = 60;
    const POLL_INTERVAL_MS = 2000;

    for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `${NFV_BACKEND}/assessments/${assessmentId}`,
        { headers },
      );
      if (!statusRes.ok) continue;

      const data = await statusRes.json();
      const status: string = data.status;

      if (status === 'COMPLETED') {
        // O processor salva o resultado completo do pose_analysis.py em rawResults
        const raw = data.rawResults ?? {};
        return {
          assessmentId,
          status,
          landmarks: raw.landmarks ?? data.landmarks ?? {},
          protocol: raw.protocol ?? null,
          asymmetries: raw.asymmetries ?? null,
          scores: raw.scores ?? data.scores ?? {},
          avg_confidence: raw.avg_confidence,
        };
      }

      if (status === 'FAILED') {
        throw new Error(
          data.errorMessage ||
            'Análise falhou. Verifique se a foto tem corpo inteiro visível.',
        );
      }
      // status === PENDING / QUEUED / PROCESSING → continua polling
    }

    throw new Error(
      'Timeout: a análise demorou mais de 2 minutos. Tente novamente com uma foto menor.',
    );
  },

  // ─── Upload de vídeo → MediaPipe → múltiplas poses → protocolo ───────────
  // Cria assessment do tipo POSE_ANALYSIS_VIDEO. O nfv-backend roda
  // pose_analysis_video.py que extrai frames a 2fps, detecta segmentos
  // estáticos, identifica cada pose IFBB e gera protocolo via nfc-core.
  async uploadVideoAndAnalyze(
    file: File,
    categoria: CategoryType,
    atletaId: string,
    patientId: string,
    onProgress?: (step: string) => void,
  ): Promise<{
    assessmentId: string;
    status: string;
    poses_detected?: Array<{
      segmento_idx: number;
      pose_id: string;
      avg_confidence: number;
      frames_no_segmento: number;
      landmarks: Record<string, LandmarkPoint>;
    }>;
    session?: unknown;
    protocol?: AthletePosingProtocol;
    video_duration_s?: number;
    total_poses_found?: number;
    avg_confidence?: number;
  }> {
    onProgress?.('Convertendo vídeo...');

    const base64 = await fileToBase64(file);
    const token = readCookie('nfv_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    onProgress?.('Enviando para o servidor...');

    const createRes = await fetch(`${NFV_BACKEND}/assessments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId,
        type: 'POSE_ANALYSIS_VIDEO',
        mediaUrl: base64,
        mediaType: 'VIDEO',
        rawResults: { categoria, atletaId },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => '');
      throw new Error(
        `Falha ao criar assessment (${createRes.status}): ${errText.slice(0, 200)}`,
      );
    }

    const created = await createRes.json();
    const assessmentId: string = created.id ?? created.assessmentId;
    if (!assessmentId) {
      throw new Error('Resposta do backend sem assessmentId');
    }

    onProgress?.('Processando vídeo com MediaPipe...');

    // Vídeos demoram mais — máximo 10 minutos (300 polls × 2s)
    const MAX_POLLS = 300;
    const POLL_INTERVAL_MS = 2000;

    for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `${NFV_BACKEND}/assessments/${assessmentId}`,
        { headers },
      );
      if (!statusRes.ok) continue;

      const data = await statusRes.json();
      const status: string = data.status;

      if (status === 'COMPLETED') {
        const raw = data.rawResults ?? {};
        return {
          assessmentId,
          status,
          poses_detected: raw.poses_detected,
          session: raw.session,
          protocol: raw.protocol,
          video_duration_s: raw.video_duration_s,
          total_poses_found: raw.total_poses_found,
          avg_confidence: raw.avg_confidence,
        };
      }

      if (status === 'FAILED') {
        throw new Error(
          data.errorMessage || 'Processamento do vídeo falhou.',
        );
      }

      // Mensagens de progresso baseadas no tempo decorrido
      const elapsed = (attempt * POLL_INTERVAL_MS) / 1000;
      if (elapsed < 30) onProgress?.('Extraindo frames do vídeo...');
      else if (elapsed < 60) onProgress?.('Detectando landmarks com MediaPipe...');
      else if (elapsed < 120) onProgress?.('Identificando poses IFBB...');
      else if (elapsed < 240) onProgress?.('Filtrando segmentos estáticos...');
      else onProgress?.('Gerando protocolo personalizado...');
    }

    throw new Error(
      'Timeout: processamento do vídeo demorou mais de 10 minutos.',
    );
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}
