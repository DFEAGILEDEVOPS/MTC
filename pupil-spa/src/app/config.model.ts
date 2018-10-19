export class Config {
  private _questionTime: number;
  private _loadingTime: number;
  private _speechSynthesis: boolean;
  private _audibleSounds: boolean;
  private _inputAssistance: boolean;
  private _numpadRemoval: boolean;
  private _fontSize: boolean;
  private _colourContrast: boolean;
  private _practice: boolean;

  get questionTime(): number {
    return this._questionTime;
  }

  set questionTime(value: number) {
    this._questionTime = value;
  }

  get loadingTime(): number {
    return this._loadingTime;
  }

  set loadingTime(value: number) {
    this._loadingTime = value;
  }

  get speechSynthesis(): boolean {
    return this._speechSynthesis;
  }

  set speechSynthesis(value: boolean) {
    this._speechSynthesis = value;
  }

  get audibleSounds(): boolean {
    return this._audibleSounds;
  }

  set audibleSounds(value: boolean) {
    this._audibleSounds = value;
  }

  get inputAssistance(): boolean {
    return this._inputAssistance;
  }

  set inputAssistance(value: boolean) {
    this._inputAssistance = value;
  }

  get numpadRemoval(): boolean {
    return this._numpadRemoval;
  }

  set numpadRemoval(value: boolean) {
    this._numpadRemoval = value;
  }

  get fontSize(): boolean {
    return this._fontSize;
  }

  set fontSize(value: boolean) {
    this._fontSize = value;
  }

  get colourContrast(): boolean {
    return this._colourContrast;
  }

  set colourContrast(value: boolean) {
    this._colourContrast = value;
  }

  get practice(): boolean {
    return this._practice;
  }

  set practice(value: boolean) {
    this._practice = value;
  }
}
