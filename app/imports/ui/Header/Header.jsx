import React from 'react';
import { useIsMobile } from '../responsive';
import { HeaderDesktop } from './HeaderDesktop.jsx';
import { HeaderMobile } from './HeaderMobile.jsx';

export const Header = ({ onMenuClick }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <HeaderMobile onMenuClick={onMenuClick} />;
  }

  return <HeaderDesktop />;
};
