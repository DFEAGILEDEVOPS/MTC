export class AccessArrangements {
  fontSize: 'xsmall' | 'small' | 'regular' | 'large' | 'xlarge' | 'xxlarge';
  contrast: 'bow' | 'yob' | 'bob' | 'bop' | 'boc';
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
  static contrastSettings: Array<Object> = [
    { label: 'Black on white', val: 'bow', code: 'BOW' },
    { label: 'Yellow on black', val: 'yob', code: 'YOB' },
    { label: 'Black on blue', val: 'bob', code: 'BOB' },
    { label: 'Black on peach', val: 'bop', code: 'BOP' },
    { label: 'Blue on cream', val: 'boc', code: 'BOC' }
  ];
}
