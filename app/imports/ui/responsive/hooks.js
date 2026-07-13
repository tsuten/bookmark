import { useMediaQuery } from 'react-responsive';
import { BREAKPOINTS, MOBILE_MAX } from './breakpoints';
import { queries } from './queries';

export const useIsMobile = () => useMediaQuery({ maxWidth: MOBILE_MAX });

export const useIsDesktop = () => useMediaQuery({ minWidth: BREAKPOINTS.md });

export const useMinWidth = (px) => useMediaQuery({ minWidth: px });

export const useMaxWidth = (px) => useMediaQuery({ maxWidth: px });

export const useBreakpoint = () => {
  const is2xl = useMediaQuery({ minWidth: BREAKPOINTS['2xl'] });
  const isXl = useMediaQuery({ minWidth: BREAKPOINTS.xl });
  const isLg = useMediaQuery({ minWidth: BREAKPOINTS.lg });
  const isMd = useMediaQuery({ minWidth: BREAKPOINTS.md });
  const isSm = useMediaQuery({ minWidth: BREAKPOINTS.sm });

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
};

export { queries };
