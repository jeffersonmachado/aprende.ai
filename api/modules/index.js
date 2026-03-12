import systemRoutes from './system/system.routes.js';
import authRoutes from './auth/auth.routes.js';
import learningRoutes from './learning/learning.routes.js';
import assessmentRoutes from './assessment/assessment.routes.js';
import competencyRoutes from './competency/competency.routes.js';
import aiRoutes from './ai/ai.routes.js';
import knowledgeRoutes from './knowledge/knowledge.routes.js';
import integrationRoutes from './integration/integration.routes.js';

export function registerModules(app) {
  app.use(systemRoutes);
  app.use('/auth', authRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api', learningRoutes);
  app.use('/api', assessmentRoutes);
  app.use('/api', competencyRoutes);
  app.use('/api', aiRoutes);
  app.use('/api', knowledgeRoutes);
  app.use('/api', integrationRoutes);
}
