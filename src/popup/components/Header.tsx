import React from 'react';
import { View } from '../Popup';

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  selectedNetwork: string;
}

export const Header: React.FC<HeaderProps> = ({ view, onViewChange, selectedNetwork }) => {
  return (
    <>
  {/* DevNet warning banner */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white text-center py-2 px-4 font-semibold tracking-wide animate-pulse-red">
        ⚠️ DEVNET ONLY – TEST FUNDS, NOT MAINNET ⚠️
      </div>

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="devnet-hero px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">DevNet Wallet</h1>
              <p className="text-xs devnet-subtle-text mt-1">
                Network: <span className="font-semibold devnet-accent-text uppercase tracking-wide">{selectedNetwork}</span>
              </p>
            </div>

            <div className="flex gap-2">
              {view === 'wallet' && (
                <button
                  onClick={() => onViewChange('settings')}
                  className="devnet-button-secondary p-2"
                  title="Settings"
                >
                  <svg className="w-5 h-5 devnet-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              {view === 'settings' && (
                <button
                  onClick={() => onViewChange('wallet')}
                  className="devnet-button-secondary p-2"
                  title="Back to Wallet"
                >
                  <svg className="w-5 h-5 devnet-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
