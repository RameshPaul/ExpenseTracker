import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Alert,
  Button,
  DatePickerIOS,
  Picker,
  Platform,
  TextInput,
  View
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'

import styles from './styles'
import currencyConfig from '../../../config/currency'
import { TYPES as expenseTypes, valueOfKey } from '../../models/expense'
import FormGroup from '../../components/FormGroup'
import Collapsible from '../../components/Collapsible'
import ImagePicker from '../../components/ImagePicker'
import AmountConverter from '../AmountConverter'
import { getAmountFrom } from '../AmountConverter/selectors'
import {
  updateType,
  updateRecipient,
  updateDescription,
  updateDate,
  addProof,
  removeProof,
  resetStatus,
  submit
} from './actions'
import {
  getType,
  getRecipient,
  getDescription,
  getDate,
  getProof,
  getIsPending,
  getIsSucceed,
  getError
} from './selectors'

// TODO: find a better way to manipulate dates
const getReadableDate = date => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
const dateToString = date => date.toISOString().split('T')[0]

class Form extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    recipient: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    proof: PropTypes.string,
    isPending: PropTypes.bool.isRequired,
    isSucceed: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    updateType: PropTypes.func.isRequired,
    updateRecipient: PropTypes.func.isRequired,
    updateDescription: PropTypes.func.isRequired,
    updateDate: PropTypes.func.isRequired,
    addProof: PropTypes.func.isRequired,
    removeProof: PropTypes.func.isRequired,
    resetStatus: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired
  }

  static defaultProps = {
    proof: null
  }

  send = () => {
    this.props.submit(
      this.props.type,
      this.props.recipient,
      this.props.description,
      this.props.amount,
      currencyConfig.from,
      dateToString(this.props.date),
      this.props.proof
    )
  }

  render () {
    // TOFIX
    setTimeout(() => {
      if (this.props.error) {
        Alert.alert('Oops 🙁', this.props.error, [
          { text: 'OK', onPress: () => this.props.resetStatus() }
        ])
      } else if (this.props.isSucceed) {
        Alert.alert(null, '👍 Dépense ajoutée', [
          { text: 'OK', onPress: () => this.props.resetStatus() }
        ])
      }
    }, 100)

    const isAndroid = Platform.OS === 'android'
    const picker = (
      <Picker
        selectedValue={this.props.type}
        onValueChange={(itemValue, itemIndex) => this.props.updateType(itemValue)}
      >
        <Picker.Item label={expenseTypes.TRANSPORT.label} value={expenseTypes.TRANSPORT.key} />
        <Picker.Item label={expenseTypes.ACCOMMODATION.label} value={expenseTypes.ACCOMMODATION.key} />
        <Picker.Item label={expenseTypes.EATING.label} value={expenseTypes.EATING.key} />
        <Picker.Item label={expenseTypes.OTHER.label} value={expenseTypes.OTHER.key} />
      </Picker>
    )
    const datePicker = !isAndroid && (
      <DatePickerIOS
        date={this.props.date}
        mode='date'
        onDateChange={(date) => this.props.updateDate(date)}
      />
    )

    return (
      <View style={styles.container}>
        <FormGroup title='Poste de dépense'>
          {
            !isAndroid ? (
              <Collapsible value={valueOfKey(this.props.type)}>
                {picker}
              </Collapsible>
            ) : picker
          }
        </FormGroup>
        <FormGroup title='Prestataire'>
          <TextInput
            value={this.props.recipient}
            placeholder='Fournisseur ou prestataire...'
            onChangeText={(recipient) => this.props.updateRecipient(recipient)}
            style={styles.textInput}
          />
        </FormGroup>
        <FormGroup title='Description'>
          <TextInput
            value={this.props.description}
            placeholder='Description...'
            onChangeText={(description) => this.props.updateDescription(description)}
            style={styles.textInput}
          />
        </FormGroup>
        <AmountConverter
          currencyFrom={currencyConfig.from}
          currencyTo={currencyConfig.to}
          exchangeRate={currencyConfig.exchangeRate}
        />
        <FormGroup title='Date'>
          <Collapsible value={getReadableDate(this.props.date)}>
            {datePicker}
          </Collapsible>
        </FormGroup>
        <FormGroup title='Justificatif'>
          <ImagePicker
            source={this.props.proof}
            onAddClick={() => this.props.addProof()}
            onRemoveClick={() => this.props.removeProof()}
          />
        </FormGroup>
        <FormGroup>
          {
            !this.props.isPending && (
              <Button
                onPress={this.send}
                title='Ajouter la dépense'
                color='#4a8bfc'
              />
            )
          }
        </FormGroup>
        {
          this.props.isPending && (
            <Spinner visible={this.props.isPending} />
          )
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  type: getType(state),
  recipient: getRecipient(state),
  description: getDescription(state),
  amount: getAmountFrom(state),
  date: getDate(state),
  proof: getProof(state),
  isPending: getIsPending(state),
  isSucceed: getIsSucceed(state),
  error: getError(state)
})

const mapDispatchToProps = {
  updateType,
  updateRecipient,
  updateDescription,
  updateDate,
  addProof,
  removeProof,
  resetStatus,
  submit
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form)
