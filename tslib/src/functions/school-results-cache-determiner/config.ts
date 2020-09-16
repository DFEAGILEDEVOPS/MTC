const cache = {
  // 0 - never cache
  // 1 - use dates - and cache between check end date and the following Monday
  // 2 - always cache
  neverCache: 0,
  cacheIfInDate: 1,
  alwaysCache: 2
}

export {
  cache
}
