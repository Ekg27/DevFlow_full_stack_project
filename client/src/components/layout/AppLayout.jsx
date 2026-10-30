import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ title, actions, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar title={title} actions={actions} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
