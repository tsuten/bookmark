import React from 'react';
import { useIsDesktop, useIsMobile } from './hooks';

export const MobileOnly = ({ children }) => {
  const isMobile = useIsMobile();
  return isMobile ? children : null;
};

export const DesktopOnly = ({ children }) => {
  const isDesktop = useIsDesktop();
  return isDesktop ? children : null;
};
