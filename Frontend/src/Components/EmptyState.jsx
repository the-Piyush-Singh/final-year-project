import React from 'react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ 
  icon, 
  title = 'Nothing here yet', 
  text = '', 
  action 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || <FiInbox />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {text && <p className="empty-state-text">{text}</p>}
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
}
