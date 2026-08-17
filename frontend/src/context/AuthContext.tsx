import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthContextType, UserRole } from '../types';
import { api } from '../services/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chaves estritamente em sessionStorage (temporárias por aba, destruídas automaticamente ao fechar o navegador/aba)
const SESSION_USER_KEY = 'adminic_session_user';
const SESSION_TOKEN_KEY = 'adminic_session_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Limpeza de segurança defensiva: remove qualquer token ou dado pessoal que possa ter ficado em localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('adminic_auth_user');
        localStorage.removeItem('adminic_auth_token');
      } catch {
        // Ignora caso restrito
      }
    }
  }, []);

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem(SESSION_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [targetRoleForLogin, setTargetRoleForLogin] = useState<UserRole | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>('564423794141-eum30ivtuprbv8ikk8qi6b7gapgm6a2v.apps.googleusercontent.com');

  // Busca configurações públicas de integração do backend dinamicamente (sem expor em bundle estático)
  useEffect(() => {
    let isMounted = true;
    api.getPublicConfig().then(cfg => {
      if (isMounted && cfg && cfg.google_client_id) {
        setGoogleClientId(cfg.google_client_id);
      }
    }).catch(() => {
      // fallback já inicializado
    });
    return () => { isMounted = false; };
  }, []);

  const handleLoginSuccess = useCallback((authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    try {
      // Salva estritamente em sessionStorage (destruído automaticamente ao fechar a aba)
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(authUser));
      sessionStorage.setItem(SESSION_TOKEN_KEY, authToken);
    } catch (e) {
      console.warn('Sessão temporária mantida apenas em memória:', e);
    }
    setIsLoginModalOpen(false);
  }, []);

  const loginWithGoogle = useCallback(async (
    credential: string,
    targetRole?: string,
    targetTenantSlug?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(credential, targetRole, targetTenantSlug);
      handleLoginSuccess(res.user, res.access_token);
      return true;
    } catch (err) {
      console.error('Erro no login com Google:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const loginDemo = useCallback(async (
    email: string,
    role: string,
    name?: string,
    tenantSlug?: string,
    staffId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.loginDemo({
        email,
        role,
        name,
        tenant_slug: tenantSlug,
        staff_id: staffId,
      });
      handleLoginSuccess(res.user, res.access_token);
      return true;
    } catch (err) {
      console.error('Erro no login de demonstração:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      sessionStorage.removeItem(SESSION_USER_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.clear();
    } catch {
      // Ignora erro
    }
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.cancel();
      } catch {
        // Ignora
      }
    }
  }, []);

  // Limpeza de segurança ao fechar a aba ou descarregar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUnload = () => {
      // Garante sanitização de memória
      if (!sessionStorage.getItem(SESSION_TOKEN_KEY)) {
        sessionStorage.clear();
      }
    };
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  const openLoginModal = useCallback((targetRole?: UserRole) => {
    setTargetRoleForLogin(targetRole || null);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  // Inicializa Google Identity Services script dinamicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleOneTap();
      };
      document.head.appendChild(script);
    } else {
      initGoogleOneTap();
    }

    function initGoogleOneTap() {
      if (window.google?.accounts?.id && googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response && response.credential) {
                loginWithGoogle(response.credential, targetRoleForLogin || undefined);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (e) {
          console.warn('Google One Tap não pode ser inicializado neste contexto:', e);
        }
      }
    }
  }, [googleClientId, loginWithGoogle, targetRoleForLogin]);

  const triggerGoogleOneTap = useCallback(() => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap não exibido:', notification.getNotDisplayedReason());
          }
        });
      } catch (e) {
        console.warn('Erro ao disparar Google One Tap:', e);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isLoginModalOpen,
        targetRoleForLogin,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        loginDemo,
        logout,
        triggerGoogleOneTap,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
