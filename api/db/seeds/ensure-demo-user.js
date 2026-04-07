import { v4 as uuidv4 } from 'uuid';
import {
  sequelize,
  JourneyMission,
  JourneyTwistRule,
  Role,
  Tenant,
  TenantUser,
  User
} from '../models/index.js';
import { hashPassword } from '../../utils/password.js';
import { DEFAULT_MISSION_LIBRARY, PLOT_TWIST_LIBRARY } from '../../modules/journey-flow/journey-runtime.fixtures.js';

const DEMO = {
  tenantSlug: 'demo',
  tenantName: 'Tenant Demo',
  roleCode: 'admin',
  roleName: 'Administrador',
  userName: 'Administrador Demo',
  userEmail: 'admin@aprende.ai',
  userPassword: 'admin123'
};

const DEMO_MISSION_EXPANSION = [
  {
    id: 'mission-ops-001',
    title: 'Operacoes: Escalada de Incidente Multicanal',
    trackSlug: 'operacoes-criticas',
    targetArea: 'operacoes',
    audienceStyles: ['pratico', 'analitico'],
    context: 'Uma falha gerou fila em tres canais ao mesmo tempo e a pressao por SLA aumentou.',
    stakeholders: ['operacoes', 'suporte', 'cliente enterprise'],
    riskLevel: 'alto',
    objective: 'Conter impacto em 90 minutos com plano de comunicacao e acao tecnica coordenada.',
    choices: [
      { id: 'ops-1-a', label: 'Priorizar apenas tickets premium', consequence: 'Protege contas-chave, mas amplia desgaste da base.' },
      { id: 'ops-1-b', label: 'Criar celula de guerra por severidade', consequence: 'Melhora coordenacao e reduz tempo medio de resposta.' },
      { id: 'ops-1-c', label: 'Esperar estabilizacao automatica', consequence: 'Evita ruido, mas aumenta risco reputacional.' }
    ],
    competenciesImpacted: ['planejamento', 'comunicacao', 'analise de risco'],
    completionCriteria: ['definir severidade', 'nomear owner por frente', 'publicar checkpoint executivo'],
    optionalTwistTriggers: ['deadline_reduction', 'new_stakeholder']
  },
  {
    id: 'mission-prod-001',
    title: 'Produto: Replanejamento de Roadmap com Dependencias Criticas',
    trackSlug: 'estrategia-produto',
    targetArea: 'produto',
    audienceStyles: ['analitico', 'explorador'],
    context: 'Entrou uma dependencia externa que compromete o release principal da trilha.',
    stakeholders: ['produto', 'engenharia', 'comercial'],
    riskLevel: 'medio',
    objective: 'Repriorizar roadmap sem romper compromisso de valor para cliente.',
    choices: [
      { id: 'prod-1-a', label: 'Cortar escopo sem validar impacto comercial', consequence: 'Ganha prazo no curto prazo, mas pode reduzir valor percebido.' },
      { id: 'prod-1-b', label: 'Negociar release em ondas com trade-offs claros', consequence: 'Mantem previsibilidade e alinha expectativa dos stakeholders.' },
      { id: 'prod-1-c', label: 'Manter plano original e aumentar carga do time', consequence: 'Preserva narrativa externa, mas eleva risco de burnout e falha.' }
    ],
    competenciesImpacted: ['tomada de decisao', 'negociacao', 'consistencia'],
    completionCriteria: ['explicar criterio de corte', 'definir marco de entrega', 'registrar riscos residuais'],
    optionalTwistTriggers: ['competitor_move', 'new_information']
  },
  {
    id: 'mission-data-001',
    title: 'Dados: Conflito entre Indicadores de Performance',
    trackSlug: 'decisao-orientada-a-dados',
    targetArea: 'dados',
    audienceStyles: ['analitico'],
    context: 'Dois indicadores-chave apontam direcoes opostas para a decisao da fase.',
    stakeholders: ['dados', 'lideranca', 'produto'],
    riskLevel: 'alto',
    objective: 'Escolher metrica norteadora com justificativa transparente e auditavel.',
    choices: [
      { id: 'data-1-a', label: 'Escolher metrica com melhor historia para diretoria', consequence: 'Facilita aprovacao, mas fragiliza sustentacao tecnica.' },
      { id: 'data-1-b', label: 'Definir metrica primaria e secundaria por contexto', consequence: 'Aumenta robustez da decisao em cenarios dinamicos.' },
      { id: 'data-1-c', label: 'Adiar decisao ate novo ciclo de coleta', consequence: 'Reduz risco de erro imediato, mas atrasa acao necessaria.' }
    ],
    competenciesImpacted: ['analise critica', 'analise de risco', 'planejamento'],
    completionCriteria: ['documentar criterio de metrica', 'explicar limitacoes', 'definir revisao temporal'],
    optionalTwistTriggers: ['new_information', 'context_shift']
  },
  {
    id: 'mission-lead-001',
    title: 'Lideranca: Alinhamento de Time em Divergencia Estrategica',
    trackSlug: 'lideranca-adaptativa',
    targetArea: 'lideranca',
    audienceStyles: ['narrativo', 'explorador'],
    context: 'A squad esta dividida em duas estrategias e a decisao precisa sair hoje.',
    stakeholders: ['lideranca', 'time tecnico', 'stakeholder interno'],
    riskLevel: 'alto',
    objective: 'Convergir em plano executavel preservando confianca e ownership do time.',
    choices: [
      { id: 'lead-1-a', label: 'Impor direcao por autoridade', consequence: 'Acelera definicao, mas reduz aderencia e aprendizado coletivo.' },
      { id: 'lead-1-b', label: 'Conduzir debate por criterio e risco', consequence: 'Eleva qualidade da decisao e comprometimento de execucao.' },
      { id: 'lead-1-c', label: 'Dividir equipe para testar as duas vias', consequence: 'Aumenta exploracao, mas pode fragmentar foco operacional.' }
    ],
    competenciesImpacted: ['comunicacao', 'negociacao', 'tomada de decisao'],
    completionCriteria: ['explicitar criterio comum', 'definir dono da execucao', 'agendar retro de decisao'],
    optionalTwistTriggers: ['internal_conflict', 'new_stakeholder']
  }
];

const DEMO_TWIST_EXPANSION = [
  {
    kind: 'resource_cut',
    title: 'Corte de Recursos',
    narrative: 'Parte da capacidade planejada foi realocada para outra frente critica.',
    impact: {
      mission: 'capacity_reduced',
      difficultyDelta: 1,
      mentorMode: 'pratico'
    },
    suggestedAction: 'Repriorizar escopo minimo viavel e renegociar expectativa agora.'
  },
  {
    kind: 'regulatory_change',
    title: 'Mudanca Regulatoria',
    narrative: 'Uma nova regra de compliance alterou os limites de execucao da missao.',
    impact: {
      mission: 'compliance_constraint',
      difficultyDelta: 1,
      mentorMode: 'analitico'
    },
    suggestedAction: 'Revalidar premissas legais e adaptar criterio de decisao.'
  },
  {
    kind: 'trust_break',
    title: 'Quebra de Confianca',
    narrative: 'Um erro de comunicacao reduziu a confianca de um stakeholder chave.',
    impact: {
      mission: 'trust_recovery',
      difficultyDelta: 0,
      mentorMode: 'narrativo'
    },
    suggestedAction: 'Reconstruir alinhamento com plano curto, transparente e verificavel.'
  }
];

function mapMissionToModel(item, tenantId, sortOrder) {
  return {
    code: item.id,
    title: item.title,
    context: item.context,
    objective: item.objective,
    riskLevel: item.riskLevel || 'medio',
    stakeholdersJson: item.stakeholders || [],
    choicesJson: item.choices || [],
    consequencesJson: item.consequences || {},
    evidenceTargetsJson: item.evidenceTargets || [],
    competenciesImpactedJson: item.competenciesImpacted || [],
    completionCriteriaJson: item.completionCriteria || [],
    optionalTwistTriggersJson: item.optionalTwistTriggers || [],
    trackSlug: item.trackSlug || null,
    targetArea: item.targetArea || null,
    audienceStylesJson: item.audienceStyles || [],
    sourceType: 'seed',
    sortOrder,
    active: true,
    tenantId
  };
}

async function ensureMissionCatalog(tenantId, transaction) {
  const missionLibrary = [...DEFAULT_MISSION_LIBRARY, ...DEMO_MISSION_EXPANSION];

  for (let index = 0; index < missionLibrary.length; index += 1) {
    const mission = missionLibrary[index];
    const current = await JourneyMission.findOne({
      where: { tenantId, code: mission.id },
      transaction
    });

    const payload = mapMissionToModel(mission, tenantId, index);
    if (current) {
      await current.update(payload, { transaction });
    } else {
      await JourneyMission.create({ id: uuidv4(), ...payload }, { transaction });
    }
  }
}

function mapTwistToModel(item, tenantId, priority) {
  return {
    tenantId,
    kind: item.kind,
    title: item.title,
    narrative: item.narrative,
    impactJson: item.impact || {},
    suggestedAction: item.suggestedAction || null,
    triggerConditionJson: {},
    rarity: priority === 0 ? 'rare' : 'common',
    cooldownMinutes: 0,
    priority,
    active: true
  };
}

async function ensureTwistCatalog(tenantId, transaction) {
  const twistLibrary = [...PLOT_TWIST_LIBRARY, ...DEMO_TWIST_EXPANSION];

  for (let index = 0; index < twistLibrary.length; index += 1) {
    const twist = twistLibrary[index];
    const current = await JourneyTwistRule.findOne({
      where: { tenantId, kind: twist.kind },
      transaction
    });

    const payload = mapTwistToModel(twist, tenantId, index);
    if (current) {
      await current.update(payload, { transaction });
    } else {
      await JourneyTwistRule.create({ id: uuidv4(), ...payload }, { transaction });
    }
  }
}

async function ensureDemoUser() {
  const transaction = await sequelize.transaction();
  try {
    let tenant = await Tenant.findOne({ where: { slug: DEMO.tenantSlug }, transaction });
    if (!tenant) {
      tenant = await Tenant.create({
        id: uuidv4(),
        name: DEMO.tenantName,
        slug: DEMO.tenantSlug,
        status: 'active',
        plan: 'starter',
        settings: { brandName: 'aprende.AI Demo' }
      }, { transaction });
    }

    let role = await Role.findOne({ where: { tenantId: tenant.id, code: DEMO.roleCode }, transaction });
    if (!role) {
      role = await Role.create({
        id: uuidv4(),
        tenantId: tenant.id,
        code: DEMO.roleCode,
        name: DEMO.roleName,
        description: 'Acesso administrativo completo',
        isSystem: true
      }, { transaction });
    }

    const passwordHash = await hashPassword(DEMO.userPassword);
    let user = await User.findOne({ where: { email: DEMO.userEmail }, transaction });
    if (!user) {
      user = await User.create({
        id: uuidv4(),
        name: DEMO.userName,
        email: DEMO.userEmail,
        passwordHash,
        status: 'active',
        profileMetadata: { source: 'ensure-demo-user' }
      }, { transaction });
    } else {
      await user.update({
        name: DEMO.userName,
        passwordHash,
        status: 'active'
      }, { transaction });
    }

    let membership = await TenantUser.findOne({
      where: { tenantId: tenant.id, userId: user.id },
      transaction
    });

    if (!membership) {
      membership = await TenantUser.create({
        id: uuidv4(),
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        status: 'active'
      }, { transaction });
    } else {
      await membership.update({
        roleId: role.id,
        status: 'active'
      }, { transaction });
    }

    await ensureMissionCatalog(tenant.id, transaction);
    await ensureTwistCatalog(tenant.id, transaction);

    const totalMissions = await JourneyMission.count({ where: { tenantId: tenant.id, active: true }, transaction });
    const totalTwists = await JourneyTwistRule.count({ where: { tenantId: tenant.id, active: true }, transaction });

    await transaction.commit();
    console.log('Demo user garantido: admin@aprende.ai / admin123 (tenant: demo)');
    console.log(`Catalogo de campanha garantido: ${totalMissions} missoes e ${totalTwists} twist rules ativas no tenant demo.`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

ensureDemoUser()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Falha ao garantir demo user', error);
    await sequelize.close();
    process.exit(1);
  });
