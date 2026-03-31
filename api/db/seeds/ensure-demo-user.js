import { v4 as uuidv4 } from 'uuid';
import { sequelize, Role, Tenant, TenantUser, User } from '../models/index.js';
import { hashPassword } from '../../utils/password.js';

const DEMO = {
  tenantSlug: 'demo',
  tenantName: 'Tenant Demo',
  roleCode: 'admin',
  roleName: 'Administrador',
  userName: 'Administrador Demo',
  userEmail: 'admin@aprende.ai',
  userPassword: 'admin123'
};

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

    await transaction.commit();
    console.log('Demo user garantido: admin@aprende.ai / admin123 (tenant: demo)');
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
