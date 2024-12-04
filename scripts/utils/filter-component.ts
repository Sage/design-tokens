/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import type { DesignToken } from 'style-dictionary/types';

export const FilterComponent = (token: DesignToken, componentName: string): boolean => token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : false)
