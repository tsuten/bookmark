import { BREAKPOINTS, MOBILE_MAX } from './breakpoints';

export const queries = {
  mobile: `(max-width: ${MOBILE_MAX}px)`,
  desktop: `(min-width: ${BREAKPOINTS.md}px)`,
  smUp: `(min-width: ${BREAKPOINTS.sm}px)`,
  mdUp: `(min-width: ${BREAKPOINTS.md}px)`,
  lgUp: `(min-width: ${BREAKPOINTS.lg}px)`,
};
