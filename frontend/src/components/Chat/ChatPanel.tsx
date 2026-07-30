import { useState } from 'react';
import styles from './ChatPanel.module.css';

const channels = [
  { id: 'global', label: 'Global', color: '#a78bfa' },
  { id: 'local', label: 'Local', color: '#60a5fa' },
  { id: 'guild', label: 'Guild', color: '#4ade80' },
  { id: 'party', label: 'Party', color: '#fbbf24' },
  { id: 'trade', label: 'Trade', color: '#fb923c' },
];

const mockMessages = [
  { id: 1, channel: 'global', user: 'ShadowMaster', content: 'Alguém quer farmar na Floresta Sombria?', time: '12:30' },
  { id: 2, channel: 'local', user: 'NoobPlayer', content: 'Como upo rápido?', time: '12:31' },
  { id: 3, channel: 'system', user: '', content: 'Evento de XP Dobrado ativo!', time: '12:32' },
  { id: 4, channel: 'trade', user: 'MerchantX', content: 'Vendo Espada Lendária - 500 gold', time: '12:33' },
];

export default function ChatPanel() {
  const [activeChannel, setActiveChannel] = useState('global');
  const [messageInput, setMessageInput] = useState('');

  return (
    <div className={styles.chatPanel}>
      <div className={styles.channelTabs}>
        {channels.map((ch) => (
          <button
            key={ch.id}
            className={`${styles.channelTab} ${activeChannel === ch.id ? styles.activeTab : ''}`}
            style={{ '--channel-color': ch.color } as React.CSSProperties}
            onClick={() => setActiveChannel(ch.id)}
          >
            {ch.label}
          </button>
        ))}
      </div>

      <div className={styles.messageList}>
        {mockMessages.map((msg) => (
          <div key={msg.id} className={styles.message}>
            {msg.channel === 'system' ? (
              <span className={styles.systemMsg}>{msg.content}</span>
            ) : (
              <>
                <span className={styles.messageUser}>{msg.user}:</span>
                <span className={styles.messageText}>{msg.content}</span>
                <span className={styles.messageTime}>{msg.time}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className={styles.input}
        />
        <button className={styles.sendBtn}>Enviar</button>
      </div>
    </div>
  );
}
