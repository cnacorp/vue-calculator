const state = () => ({
  userInput: [],
  calculationHistory: []
})

// getters
const getters = {
  inputString: (state, getters, rootState) => {
    let calculationString = ''
    state.userInput.forEach((item) => {
      calculationString += ' ' + item.value
    })
    return calculationString
  },
  calculationHistoryString: (state, getters, rootState) => {
    let calculationHistory = []
    state.calculationHistory.forEach((ch) => {
      let chItem = ''
      ch.forEach((c) => {
        chItem += ' ' + c.value
      })
      calculationHistory.push(chItem)
    })
    return calculationHistory
  }
}

// actions
const actions = {
  setUserInputAction ({ state, commit }, userInputs) {
    commit('setUserInput', userInputs)
  },
  setCalculationHistoryAction ({ state, commit }, calculationHistory) {
    commit('setCalculationHistory', calculationHistory)
  }
}

// mutations
const mutations = {
  setUserInput (state, userInputs) {
    state.userInput = userInputs
  },
  setCalculationHistory (state, calculationHistory) {
    if (calculationHistory.index === null) {
      state.calculationHistory = calculationHistory.values
    } else if (calculationHistory.index === -1) {
      state.calculationHistory.push(calculationHistory.values)
    } else {
      state.calculationHistory[calculationHistory.index] = calculationHistory.values
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}