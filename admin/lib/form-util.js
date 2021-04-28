const formUtilTypes = {
  int: 1,
  float: 2
}

const formUtil = {
  /**
   *
   * @param {string} val
   * @param {number} typeCode
   * @param {formUtilOptions} options
   * @return {null|number|string}
   */
  convertFromString: function convertFromString (val, typeCode) {
    if (val === '') {
      return null
    }
    if (val === undefined) {
      return null
    }
    if (typeCode === formUtilTypes.int) {
      const i = parseInt(val, 10)
      if (isNaN(i)) {
        return null
      }
      return i
    }
    if (typeCode === formUtilTypes.float) {
      const f = parseFloat(val)
      if (isNaN(f)) {
        return null
      }
      return f
    }
    return val
  }
}

export {
  formUtil,
  formUtilTypes
}
