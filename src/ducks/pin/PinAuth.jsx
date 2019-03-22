import React from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'

import { connect } from 'react-redux'
import { queryConnect } from 'cozy-client'
import Alerter from 'cozy-ui/react/Alerter'
import { translate } from 'cozy-ui/react/I18n'

import PinKeyboard from 'ducks/pin/PinKeyboard'
import FingerprintButton from 'ducks/pin/FingerprintButton'
import { pinSetting } from 'ducks/pin/queries'
import PinButton from 'ducks/pin/PinButton'
import { PIN_MAX_LENGTH, MAX_ATTEMPT } from 'ducks/pin/constants'
import { onLogout } from 'ducks/mobile/utils'

const AttemptCount_ = ({ t, current, max }) => {
  return <div>{t('Pin.attempt-count', { current, max })}</div>
}

const AttemptCount = translate()(AttemptCount_)

/**
 * Show pin keyboard and fingerprint button.
 * Automatically checks if it is the right pin while it is entered.
 * After MAX_ATTEMPT bad attempts it logouts the user
 */
class PinAuth extends React.Component {
  constructor(props) {
    super(props)
    this.handleFingerprintSuccess = this.handleFingerprintSuccess.bind(this)
    this.handleFingerprintError = this.handleFingerprintError.bind(this)
    this.handleFingerprintCancel = this.handleFingerprintCancel.bind(this)
    this.handleEnteredPin = this.handleEnteredPin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.state = {
      attempt: 0,
      pinValue: ''
    }
  }

  handleFingerprintSuccess() {
    this.props.onSuccess()
  }

  handleFingerprintError() {
    const { t } = this.props.t
    Alerter.info(t('Pin.bad-pin'))
  }

  handleFingerprintCancel() {
    // this.props.onCancel()
  }

  handleLogout() {
    this.logout()
  }

  onMaxAttempt() {
    this.logout()
  }

  logout() {
    const { client, store } = this.context
    onLogout(store, client)
  }

  handleEnteredPin(pinValue) {
    const { pinSetting, t } = this.props
    const pinDoc = pinSetting.data
    if (!pinDoc) {
      Alerter.info(t('Pin.no-pin-configured'))
      return this.props.onSuccess()
    }

    if (pinValue === pinDoc.pin) {
      return this.props.onSuccess()
    }

    if (pinValue.length === PIN_MAX_LENGTH) {
      const newAttempt = this.state.attempt + 1
      if (newAttempt >= MAX_ATTEMPT) {
        return this.onMaxAttempt()
      }
      return this.setState({
        attempt: this.state.attempt + 1,
        pinValue: ''
      })
    }

    this.setState({ pinValue })
  }

  render() {
    const { t } = this.props
    const { attempt, pinValue } = this.state
    return (
      <div>
        {attempt ? <AttemptCount max={5} current={attempt} /> : null}
        <FingerprintButton
          onSuccess={this.handleFingerprintSuccess}
          onError={this.handleFingerprintError}
          onCancel={this.handleFingerprintCancel}
        />
        <PinKeyboard
          leftButton={
            <PinButton onClick={this.handleLogout}>{t('Pin.logout')}</PinButton>
          }
          value={pinValue}
          onChange={this.handleEnteredPin}
        />
      </div>
    )
  }

  static propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  }
}

export default compose(
  connect(),
  translate(),
  queryConnect({
    pinSetting
  })
)(PinAuth)
