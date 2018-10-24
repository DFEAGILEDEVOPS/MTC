export const accessArrangementsDataKey = 'access_arrangements';

export class AccessArrangements {
  fontSize: 'xsmall' | 'small' | 'regular' | 'large' | 'xlarge' | 'xxlarge';
}

export class AccessArrangementsConfig {
  static fontSettings: Array<Object> = [
    { label: 'Very small', val: 'xsmall', code: 'VSM' },
    { label: 'Small', val: 'small', code: 'SML' },
    { label: 'Regular', val: 'regular', code: 'RGL' },
    { label: 'Large', val: 'large', code: 'LRG' },
    { label: 'Very large', val: 'xlarge', code: 'XLG' },
    { label: 'Largest', val: 'xxlarge', code: 'XXL' }
  ];
}
