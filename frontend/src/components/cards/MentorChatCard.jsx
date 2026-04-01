import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { entryPresets, microInteraction, staggerPresets } from '../../lib/motion/index.js';

/**
 * MentorChatCard - Card de chat com IA mentor
 * Suporta mensagens e loading animado
 */
export const MentorChatCard = React.forwardRef(
  (
    {
      className,
      messages = [],
      isLoading = false,
      onSendMessage,
      placeholder = 'Faça uma pergunta...',
      ...props
    },
    ref
  ) => {
    const [input, setInput] = React.useState('');

    const handleSend = () => {
      if (input.trim() && onSendMessage) {
        onSendMessage(input);
        setInput('');
      }
    };

    const lastMentorIdx = [...messages].map((msg, idx) => ({ ...msg, idx })).filter((msg) => msg.role !== 'user').pop()?.idx;

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: staggerPresets.fast,
      },
    };

    const messageVariants = {
      hidden: { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: entryPresets.fadeUp.transition,
      },
      exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full rounded-xl border border-muted-200 bg-white dark:bg-dark-800 dark:border-dark-700 overflow-hidden',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-muted-200 dark:border-dark-700 flex items-center gap-2">
          <motion.div className="w-2 h-2 rounded-full bg-success-500" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.8, repeat: Infinity }} />
          <h3 className="font-semibold text-muted-900 dark:text-muted-50">
            Mentor IA
          </h3>
        </div>

        {/* Messages area */}
        <motion.div
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin"
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-4xl mb-2">💡</div>
                <p className="text-sm text-muted-600 dark:text-muted-400">
                  Olá! Sou seu mentor IA. Como posso ajudar você hoje?
                </p>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={`${msg.role}-${idx}-${msg.content?.slice(0, 12)}`}
                layout
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  'flex gap-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <motion.div
                  className={cn(
                    'max-w-xs lg:max-w-md rounded-lg p-3 text-sm transition-colors',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-muted-100 text-muted-900 dark:bg-dark-700 dark:text-muted-50 rounded-bl-none',
                    idx === lastMentorIdx && msg.role !== 'user' && 'ring-1 ring-primary-300/70 dark:ring-primary-700/70'
                  )}
                  animate={idx === lastMentorIdx && msg.role !== 'user' ? microInteraction.rewardPop : undefined}
                  transition={{ duration: 0.45 }}
                >
                  {msg.content}
                </motion.div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                key="mentor-loading"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex gap-2"
              >
                <div className="bg-muted-100 text-muted-900 dark:bg-dark-700 dark:text-muted-50 rounded-lg p-3 rounded-bl-none">
                  <div className="flex gap-1">
                    <motion.div className="w-2 h-2 rounded-full bg-current" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-current" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.11 }} />
                    <motion.div className="w-2 h-2 rounded-full bg-current" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.22 }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-muted-200 dark:border-dark-700 flex gap-2">
          <Input
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="md"
            variant="primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            isLoading={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
);

MentorChatCard.displayName = 'MentorChatCard';

export default MentorChatCard;
