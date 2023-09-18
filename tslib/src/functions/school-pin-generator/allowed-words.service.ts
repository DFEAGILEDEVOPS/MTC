export class AllowedWordsService {
  parse (wordset: string, bannedWords: string): Set<string> {
    const allowedWordsArray: string[] = wordset.split(',')
    const bannedWordsArray: string[] = bannedWords.split(',')
    const allowedWords = new Set<string>(allowedWordsArray)
    if (allowedWordsArray.length < 5) throw new Error('set of allowed words must be a minimum of 5')
    bannedWordsArray.forEach(word => {
      if (allowedWords.has(word)) {
        allowedWords.delete(word)
      }
    })
    return allowedWords
  }
}
