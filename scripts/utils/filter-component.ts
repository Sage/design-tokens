/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import type { DesignToken } from 'style-dictionary/types';

export const FilterComponent = (token: DesignToken, componentName: string, isJSON: boolean): boolean => {
  if (token['path'].indexOf('origin') !== -1) return false;
  if (isJSON && componentName === 'global') {
    return token['path'][0] === 'global';
  }
  return componentName ? token['path'][0] === componentName : false;
}
