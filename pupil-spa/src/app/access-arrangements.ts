export const accessArrangementsDataKey = 'access_arrangements';

export class AccessArrangements {
  fontSize: 'xsmall' | 'small' | 'regular' | 'large' | 'xlarge' | 'xxlarge';
  contrast: 'bow' | 'yob' | 'bob' | 'bop' | 'boc';
}

export class AccessArrangementsConfig {
  static fontSettings: Array<Object> = [
    { label: 'Very small', val: 'xsmall' },
    { label: 'Small', val: 'small' },
    { label: 'Regular', val: 'regular' },
    { label: 'Large', val: 'large' },
    { label: 'Very large', val: 'xlarge' },
    { label: 'Largest', val: 'xxlarge' }
  ];
  static contrastSettings: Array<Object> = [
    { label: 'Black on White', val: 'bow' },
    { label: 'Yellow on Black', val: 'yob' },
    { label: 'Black on Blue', val: 'bob' },
    { label: 'Black on Peach', val: 'bop' },
    { label: 'Blue on Cream', val: 'boc' }
  ];
}
