// eslint-disable-next-line @typescript-eslint/semi
// @ts-ignore: Unreachable code error
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function (): string {
  return this.toString()
}
