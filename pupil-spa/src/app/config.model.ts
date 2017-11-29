export class Config {
  private _questionTime: number;
  private _loadingTime: number;
  private _speechSynthesis: boolean;

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
}
