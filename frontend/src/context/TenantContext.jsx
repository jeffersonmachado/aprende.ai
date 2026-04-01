import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * TenantContext - Gerencia informações do tenant atual
 * Suporta multi-tenant SaaS
 */

const TenantContext = createContext();

// Configurações padrão por tenant
const TENANT_CONFIGS = {
  'default': {
    id: 'default',
    name: 'Aprende IA',
    logo: '/logo.png',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#f97316',
    },
    features: ['trilhas', 'mentor', 'simulacao', 'assessment'],
    maxUsers: 1000,
  },
};

export const TenantProvider = ({ children, defaultTenantId = 'default' }) => {
  const [tenantId, setTenantId] = useState(defaultTenantId);
  const [tenantConfig, setTenantConfig] = useState(
    TENANT_CONFIGS[defaultTenantId] || TENANT_CONFIGS['default']
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar configuração do tenant quando mudar
  useEffect(() => {
    const loadTenant = async () => {
      setLoading(true);
      setError(null);

      try {
        // Se temos config local, usar
        if (TENANT_CONFIGS[tenantId]) {
          setTenantConfig(TENANT_CONFIGS[tenantId]);
          // Em produção, aqui seria um fetch da API
          // const res = await fetch(`/api/tenants/${tenantId}`);
          // const data = await res.json();
          // setTenantConfig(data);
        } else {
          throw new Error(`Tenant ${tenantId} não encontrado`);
        }
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar tenant:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [tenantId]);

  const switchTenant = (newTenantId) => {
    setTenantId(newTenantId);
  };

  const hasFeature = (feature) => {
    return tenantConfig?.features?.includes(feature) || false;
  };

  const value = {
    tenantId,
    tenantConfig,
    loading,
    error,
    switchTenant,
    hasFeature,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  return context;
};

export default TenantContext;
