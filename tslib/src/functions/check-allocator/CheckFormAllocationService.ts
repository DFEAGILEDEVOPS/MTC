import * as rng from 'random-number-csprng'

export interface ICheckFormAllocationService {
  allocate (pupilId: number): Promise<any>
}

export class CheckFormAllocationService implements ICheckFormAllocationService {
  allocate (pupilId: number): Promise<any> {
    const allocation = this.allocateInternal([1, 2, 3, 4], [])
    return Promise.resolve(allocation)
    // TODO...
    // 1. get all forms
    // 2. get used forms
    // 3. pass ids from both to internal...
  }

  /**
   * @description Randomly allocate a form to a pupil, discarding all previously used forms.  Taken verbatim from admin app
   * @param availableFormIds {Array.<Object>} -  the set of all forms (as objects) allocated to the check window
   * @param {Array.<number>} usedFormIds - the set of all form ids already used by the pupil
   * @return {Promise<object>} - one of the available forms
   */
  private async allocateInternal (availableFormIds: Array<number>, usedFormIds: Array<number>) {
    if (!Array.isArray(availableFormIds)) {
      throw new Error('availableForms is not an array')
    }

    if (!Array.isArray(usedFormIds)) {
      throw new Error('usedFormIds is not an array')
    }

    if (availableFormIds.length < 1) {
      throw new Error('There must be at least one form to select')
    }

    /**
     * Construct an array of unseen forms
     * @type Array
     */
    const unseenForms = availableFormIds.filter(f => !usedFormIds.includes(f))

    try {
      if (unseenForms.length === 0) {
        // The pupil has seen every form available
        if (availableFormIds.length === 1) {
          // Edge case when there is only 1 available form to choose from
          return availableFormIds[0]
        }
        // randomly pick a seen form as the pupil has seen all the forms
        const idx = await rng(0, availableFormIds.length - 1)
        return availableFormIds[idx]
      } else if (unseenForms.length === 1) {
        // If there is only 1 unseen form left, it is not random and behaves predictably
        return unseenForms[0]
      }

      // We have multiple forms to choose from so we randomly select an unseen form
      const idx = await rng(0, unseenForms.length - 1)
      return unseenForms[idx]
    } catch (error) {
      throw new Error('Error allocating checkForm: ' + error.message)
    }
  }
}
