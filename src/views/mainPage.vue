<template>
  <div style="height: 100%">
    <div class="container" v-if="!showCalculator">
      <button class="btn btn-navigation" type="button" @click="changePage()">Calculation History</button>
      <div class="simple-card card-container" >
        <div class="row">
          <div class="col-12">
            <p class="full-user-input text-right">{{ $store.getters['main/inputString'] }}</p>
          </div>
          <div class="col-3">
            <p class="user-input text-center">{{ prefix }}</p>
          </div>
          <div class="col-9">
            <p class="user-input">{{ userInput }}</p>
          </div>
          <div class="col-12">
            <hr>
          </div>
          <div :class="`col-${btn.lengthButton}`" v-for="(btn, i) in inputButton" :key="i" style="">
            <button 
              type="button"
              :class="`btn btn-${(btn.type === 'NUMBER' ? 'number' : (btn.title === '=' ? 'equal' : 'operator'))}`"
              @click="runInput(btn, false)">{{btn.title}}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="container" v-else>
      <button class="btn btn-navigation" style="align-self: center" type="button" @click="changePage()">Back To Calculator</button>
      <div class="col-12 text-center" v-for="(calculation, i) in $store.getters['main/calculationHistoryString']" :key="i">
        <button class="btn btn-item-history" type="button" @click="useCalculation(i)">{{ calculation }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: "mainPage",
  computed: {
  },
  components: {
  },
  computed: {
  },
  methods: {
    useCalculation (i) {
      this.indexHistory = i
      this.userInputs = this.$store.state.main.calculationHistory[i]
      this.$store.dispatch('main/setUserInputAction', this.userInputs)
      this.prefix = ''
      this.userInput = ''
      this.changePage()
    },
    changePage () {
      this.showCalculator = !this.showCalculator
    },
    // checkInput: function (e) {
    //   let index = 0
    //   if (e.key === 'Enter') {
    //     index = 18
    //   } else if (e.keyCode === 8) {
    //     index = 1
    //   } else {
    //     index = this.inputButton.findIndex(x => x.title.toLowerCase() === e.key.toLowerCase())
    //   }
    //   if (index === -1) {
    //     let restrictedKeyCode = [192, 219, 220, 221, 222, 188]
    //     if ((e.keyCode >= 65 && e.keyCode <= 90) || restrictedKeyCode.includes(e.keyCode)) {
    //       this.userInput = this.userInput.slice(0, -1)
    //     }
    //     return
    //   } else {
    //     this.runInput(this.inputButton[index], true)
    //   }
    // },
    runInput (input, fromHardware) {
      switch (input.type) {
        case 'CLEAR':
          this.userInput = ''
          this.calculationString = ''
          this.userInputs = []
          this.doneCalculating = false
          this.indexHistory = -1
          break
        case 'BACKSPACE':
          if (this.doneCalculating) {
            this.userInput = ''
            this.prefix = ''
            this.userInputs = []
            this.doneCalculating = false
          }
          if (this.userInputs.length > 0) {
            if (this.userInputs[this.userInputs.length - 1].value.length > 1) {
              let lastValue = this.userInputs[this.userInputs.length - 1].value
              lastValue = lastValue.slice(0, -1)
              if (lastValue === '-') {
                this.userInputs.pop()
                this.userInput = ''
              } else {
                this.userInputs[this.userInputs.length - 1].value = lastValue
              }
            } else {
              this.userInputs.pop()
            }
          }
          if (!fromHardware && this.userInput !== '') {
            this.userInput = this.userInput.slice(0, -1)
          }
          break
        case 'OPERATOR':
          this.executeOperation(input)
          break
        case 'NUMBER':
          if (this.doneCalculating) {
            this.userInput = input.title
            this.userInputs = []
            this.doneCalculating = false
            this.prefix = ''
          }
          if (!fromHardware) {
            this.userInput += input.title
          }
          if (this.userInputs.length > 0) {
            let lastInput = this.userInputs[this.userInputs.length - 1]
            if (lastInput.type === 'NUMBER') {
              let value = input.title
              if (lastInput.value !== '0') {
                value = lastInput.value + input.title
              }
              this.userInputs[this.userInputs.length - 1].value = value
              this.userInput = value
            } else {
              this.userInputs.push({
                value: input.title,
                type: input.type
              })
            }
          } else {
            this.userInputs.push({
              value: input.title,
              type: input.type
            })
          }
          break
        default:
          break
      }
      this.$store.dispatch('main/setUserInputAction', this.userInputs)
      // let calculationString = ''
      // this.userInputs.forEach((item) => {
      //   calculationString += ' ' + item.value
      // })
      // this.calculationString = calculationString
    },
    executeOperation (input) {
      if (input.title === 'x' || input.title === 'X' || input.title === '+' || input.title === '-' || input.title === '/') {
        this.doneCalculating = false
        let prefix = input.title
        if (this.userInputs.length > 0) {
          let lastInput = this.userInputs[this.userInputs.length - 1]
          if (lastInput.type === 'NUMBER') {
            if (lastInput.value.slice(lastInput.value.length - 1) === '.') {
              this.userInputs[this.userInputs.length - 1].value = lastInput.value.slice(0, -1)
            }
            this.userInputs.push({
              value: input.title,
              type: input.type
            })
          } else {
            this.userInputs[this.userInputs.length - 1].value = input.title
          }
          this.userInput = ''
        } else if (input.title === '-') {
          this.userInputs.push({
            value: '-',
            type: 'NUMBER'
          })
          prefix = this.prefix
        } else {
          this.userInput = ''
        }
        this.prefix = prefix
      } else if (input.title === '.') {
        if (this.userInputs.length > 0) {
          let lastInput = this.userInputs[this.userInputs.length - 1]
          if (lastInput.type === 'NUMBER' && !lastInput.value.includes('.')) {
            if (lastInput.value === '-') {
              this.userInputs[this.userInputs.length - 1].value = '-0.'
              this.userInput = '-0.'
            } else {
              this.userInputs[this.userInputs.length - 1].value = lastInput.value + '.'
            }
          } else {
            this.userInputs.push({
              value: '0.',
              type: 'NUMBER'
            })
            this.userInput = '0.'
          }
        } else {
          this.userInputs.push({
            value: '0.',
            type: 'NUMBER'
          })
          this.userInput = '0.'
        }
      } else if (input.title === '+/-') {
        if (this.userInputs.length > 0) {
          let lastInput = this.userInputs[this.userInputs.length - 1]
          if (lastInput.type === 'NUMBER') {
            if (lastInput.value === '-') {
              this.userInputs.pop()
              this.userInput = ''
            } else if (lastInput.value.includes('-')) {
              this.userInputs[this.userInputs.length - 1].value = lastInput.value.replace('-', '')
              this.userInput = lastInput.value
            } else {
              this.userInput = '-' + lastInput.value
              this.userInputs[this.userInputs.length - 1].value = '-' + lastInput.value
            }
          } else {
            this.userInputs.push({
              value: '-',
              type: 'NUMBER'
            })
            this.userInput = '-'
          }
        } else {
          this.userInputs.push({
            value: '-',
            type: 'NUMBER'
          })
          this.userInput = '-'
        }
      } else if (input.title === '=') {
        this.prefix = input.title
        this.$store.dispatch('main/setCalculationHistoryAction', {
          index: this.indexHistory,
          values: this.userInputs
        })
        localStorage.setItem('calculationHistory', JSON.stringify(this.$store.state.main.calculationHistory))
        this.recountTotal()
        this.indexHistory = -1
      }
    },
    recountTotal () {
      let newValues = []
      let operator = ''
      this.userInputs.forEach((item) => {
        if (item.type === 'NUMBER') {
          if (operator === '-') {
            newValues.push(parseFloat(item.value) * -1)
          } else if (operator === 'X' || operator === 'x') {
            newValues[newValues.length - 1] = newValues[newValues.length - 1] * item.value
          } else if (operator === '/') {
            newValues[newValues.length - 1] = newValues[newValues.length - 1] / item.value
          } else {
            newValues.push(parseFloat(item.value))
          }
          operator = ''
        } else {
          operator = item.value
        }
      })
      let total = 0
      newValues.forEach((item) => {
        total += parseFloat(item)
      })
      total = parseFloat(total.toPrecision(9))
      this.userInputs = []
      this.userInputs.push({
        value: total + '',
        type: 'NUMBER'
      })
      this.userInput = total
      this.doneCalculating = true
    }
  },
  mounted () {
    let calculationHistory = localStorage.getItem('calculationHistory')
    if (calculationHistory) {
      this.$store.dispatch('main/setCalculationHistoryAction', {
        index: null,
        values: JSON.parse(calculationHistory)
      })
    }
  },
  data () {
    return {
      indexHistory: -1,
      showCalculator: true,
      // history
      calculationHistory: [],
      calculationHistoryString: [],
      // calculator
      calculationString: '',
      userInput: '',
      userInputs: [],
      inputButton: [
        {
          title: 'CLEAR',
          type: 'CLEAR',
          lengthButton: 9,
        }, {
          title: '<',
          type: 'BACKSPACE',
          lengthButton: 3,
        }, {
          title: '1',
          type: 'NUMBER',
          lengthButton: 3,
        }, {
          title: '2',
          type: 'NUMBER',
          lengthButton: 3,
        }, {
          title: '3',
          type: 'NUMBER',
          lengthButton: 3,
        }, {
          title: 'x',
          type: 'OPERATOR',
          lengthButton: 3,
        }, {
          title: '4',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '5',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '6',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '+',
          type: 'OPERATOR',
          lengthButton: 3
        }, {
          title: '7',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '8',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '9',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '-',
          type: 'OPERATOR',
          lengthButton: 3
        }, {
          title: '+/-',
          type: 'OPERATOR',
          lengthButton: 3
        }, {
          title: '0',
          type: 'NUMBER',
          lengthButton: 3
        }, {
          title: '.',
          type: 'OPERATOR',
          lengthButton: 3
        }, {
          title: '/',
          type: 'OPERATOR',
          lengthButton: 3
        }, {
          title: '=',
          type: 'OPERATOR',
          lengthButton: 12
        },
      ],
      totalValue: 0,
      prefix: '',
      doneCalculating: false
    }
  },
};
</script>
<style>
  body {
    justify-content: center;
    align-content: center;
    font-family: 'Open Sans';
  }
  .container {
    height: 100%;
    padding-top: 24px;
    justify-content: center;
    flex-flow: column wrap;
    align-content: center;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -moz-flex;
    display: -webkit-flex;
    display: flex;
  }
  .btn {
    border: none;
    padding: 12px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px;
    cursor: pointer;
    letter-spacing: 2px;
  }
  .btn-navigation {
    background-color: #CDB4DB;
    border-radius: 24px;
    margin-bottom: 24px;
    width: 40%;
    color: white;
  }
  .simple-card {
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.4);
    transition: 0.3s;
    width: 40%;
    border-radius:  12px;
    background-color: white;
  }
  @media (max-width: 800px) {
    .simple-card {
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.4);
      transition: 0.3s;
      width: 60%;
      border-radius:  12px;
      background-color: white;
    }
    .btn-navigation {
      background-color: #CDB4DB;
      border-radius: 24px;
      margin-bottom: 24px;
      width: 60%;
      color: white;
    }
  }
  @media (max-width: 600px) {
    .simple-card {
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.4);
      transition: 0.3s;
      width: 80%;
      border-radius:  12px;
      background-color: white;
    }
    .btn-navigation {
      background-color: #CDB4DB;
      border-radius: 24px;
      margin-bottom: 24px;
      width: 80%;
      color: white;
    }
  }
  .card-container {
    padding: 2px 16px;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    margin-bottom: 12px;
  }
  .col-12 {
    width: 100%;
  }
  .col-9 {
    width: 75%;
  }
  .col-3 {
    width: 25%;
  }
  .full-user-input {
    text-align: right;
    font-size: 16px;
    margin-bottom: 12px;
    letter-spacing: 2px;
    height: 20px;
  }
  .user-input {
    text-align: right;
    font-size: 36px;
    margin-bottom: 12px;
    letter-spacing: 2px;
    height: 40px;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  .btn-number {
    background-color: #FAEDCD;
    border-radius: 24px;
    width: 98%;
    color: black;
  }
  .btn-operator {
    background-color: #A2D2FF;
    border-radius: 24px;
    width: 98%;
    color: black;
  }
  .btn-equal {
    background-color: #A2D2FF;
    border-radius: 24px;
    width: 100%;
    color: black;
  }
  .btn-item-history {
    background-color: #FFC8DD;
    border-radius: 24px;
    margin-bottom: 24px;
    color: grey;
  }
</style>