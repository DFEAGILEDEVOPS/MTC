export const accessArrangementsDataKey = 'access_arrangements';

export class AccessArrangements {
  fontSize: 'xsmall' | 'small' | 'regular' | 'large' | 'xlarge' | 'xxlarge';
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
}
