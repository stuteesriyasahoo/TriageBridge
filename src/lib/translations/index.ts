import { en } from './en';
import { as } from './as';
import { bn } from './bn';
import { brx } from './brx';
import { doi } from './doi';
import { gu } from './gu';
import { hi } from './hi';
import { kn } from './kn';
import { ks } from './ks';
import { kok } from './kok';
import { mai } from './mai';
import { ml } from './ml';
import { mni } from './mni';
import { mr } from './mr';
import { ne } from './ne';
import { or } from './or';
import { pa } from './pa';
import { sa } from './sa';
import { sat } from './sat';
import { sd } from './sd';
import { ta } from './ta';
import { te } from './te';
import { ur } from './ur';
import { SupportedLocale } from '../types';

export const translations: Record<SupportedLocale, typeof en> = {
  en,
  as: as as unknown as typeof en,
  bn: bn as unknown as typeof en,
  brx: brx as unknown as typeof en,
  doi: doi as unknown as typeof en,
  gu: gu as unknown as typeof en,
  hi: hi as unknown as typeof en,
  kn: kn as unknown as typeof en,
  ks: ks as unknown as typeof en,
  kok: kok as unknown as typeof en,
  mai: mai as unknown as typeof en,
  ml: ml as unknown as typeof en,
  mni: mni as unknown as typeof en,
  mr: mr as unknown as typeof en,
  ne: ne as unknown as typeof en,
  or: or as unknown as typeof en,
  pa: pa as unknown as typeof en,
  sa: sa as unknown as typeof en,
  sat: sat as unknown as typeof en,
  sd: sd as unknown as typeof en,
  ta: ta as unknown as typeof en,
  te: te as unknown as typeof en,
  ur: ur as unknown as typeof en,
};

function createFallbackProxy<T extends object>(target: any, fallback: any): T {
  return new Proxy(target || {}, {
    get(obj, prop) {
      const val = obj[prop];
      const fallbackVal = fallback ? fallback[prop] : undefined;
      if (val === undefined || val === null || val === '') {
        return fallbackVal;
      }
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return createFallbackProxy(val, fallbackVal);
      }
      return val;
    },
  });
}

export function getTranslations(locale: SupportedLocale): typeof en {
  const selected = translations[locale];
  if (!selected || locale === 'en') {
    return en;
  }
  return createFallbackProxy<typeof en>(selected, en);
}
