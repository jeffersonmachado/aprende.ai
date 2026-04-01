import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { cn } from '../lib/cn';
import Button from '../components/ui/Button';
import { modalPresets, motionTransitions } from '../lib/motion/index.js';

/**
 * AppLayout - Layout principal com sidebar colapsável
 * Inclui header com tenant info, usuário e notificações
 */
export const AppLayout = React.forwardRef(
  (
    {
      className,
      children,
      sidebarContent,
      headerContent,
      tenantName = 'Aprende IA',
      onLogout,
      notifications = 0,
      ...props
    },
    ref
  ) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const sidebarVariants = {
      open: { x: 0, opacity: 1 },
      closed: { x: -300, opacity: 0 },
    };

    return (
      <div
        ref={ref}
        className={cn('flex h-screen bg-muted-50 dark:bg-dark-950', className)}
        {...props}
      >
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={sidebarOpen ? 'open' : 'closed'}
          variants={sidebarVariants}
          transition={motionTransitions.scene}
          className={cn(
            'hidden md:flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-muted-200 dark:border-dark-700', 
            sidebarOpen && 'fixed md:relative z-40 h-full left-0 top-0'
          )}
        >
          {/* Tenant branding */}
          <div className="px-4 py-6 border-b border-muted-200 dark:border-dark-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              {tenantName}
            </h1>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
            {sidebarContent}
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-muted-200 dark:border-dark-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-dark-900 border-b border-muted-200 dark:border-dark-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            {/* Left side - Menu toggle and breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-dark-800 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              {headerContent}
            </div>

            {/* Right side - Notifications and user menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-dark-800 transition-colors">
                <Bell className="w-5 h-5 text-muted-700 dark:text-muted-300" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-destructive-500 text-white text-xs flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <button className="p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-dark-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </button>
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Sidebar overlay on mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
              initial={modalPresets.backdrop.initial}
              animate={modalPresets.backdrop.animate}
              exit={modalPresets.backdrop.exit}
              transition={modalPresets.backdrop.transition}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AppLayout.displayName = 'AppLayout';

export default AppLayout;
