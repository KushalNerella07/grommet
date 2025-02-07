import * as React from 'react';
import { BoxProps } from '../Box/index';

export interface DataFiltersProps {
  drop?: boolean;
  heading?: string | React.ReactNode;
  layer?: boolean;
  clearFilters?: boolean;
  // when view changes should be delivered
  updateOn?: 'change' | 'submit';
}

type divProps = Omit<JSX.IntrinsicElements['div'], 'onClick'>;

export interface DataFiltersExtendedProps
  extends BoxProps,
    DataFiltersProps,
    divProps {}

declare const DataFilters: React.FC<DataFiltersExtendedProps>;

export { DataFilters };
