import React from 'react';
import { Wrench } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="animate-fade-in glass-panel" style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', minHeight: '400px', textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{ padding: '20px', backgroundColor: 'var(--bg-main)', borderRadius: '50%', marginBottom: '24px' }}>
        <Wrench size={48} color="var(--primary-red)" />
      </div>
      <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>Under Construction</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px' }}>
        This page is currently being built. It will be wired up to the backend shortly!
      </p>
    </div>
  );
};

export default ComingSoon;
