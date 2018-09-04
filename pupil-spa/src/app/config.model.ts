export class Config {
  private _questionTime: number;
  private _loadingTime: number;
  private _speechSynthesis: boolean;
  private _audibleSounds: boolean;
  private _numpadRemoval: boolean;
  private _warmupLoadingTime: number;

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

  get numpadRemoval(): boolean {
    return this._numpadRemoval;
  }

  set numpadRemoval(value: boolean) {
    this._numpadRemoval = value;
  }

  get warmupLoadingTime() {
    return this._warmupLoadingTime;
  }
  set warmupLoadingTime(value: number) {
    this._warmupLoadingTime = value;
  }
}
