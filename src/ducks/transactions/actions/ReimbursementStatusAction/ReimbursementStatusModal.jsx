import React from 'react'
import { flowRight as compose } from 'lodash'
import { translate, withBreakpoints } from 'cozy-ui/react'
import Modal from 'cozy-ui/react/Modal'
import Icon from 'cozy-ui/react/Icon'
import { Title, Text } from 'cozy-ui/react/Text'
import cx from 'classnames'
import { List, Row, Radio } from 'components/List'
import iconReimbursement from 'assets/icons/icon-reimbursement-detailed.svg'
import styles from 'ducks/transactions/actions/ReimbursementStatusAction/ReimbursementStatusModal.styl'
import { getReimbursementStatus, getLabel } from 'ducks/transactions/helpers'
import { isHealthExpense } from 'ducks/categories/helpers'
import flag from 'cozy-flags'
import ContactItem from 'ducks/transactions/actions/ReimbursementStatusAction/ContactItem'

class _ReimbursementStatusModal extends React.PureComponent {
  render() {
    const {
      transaction,
      onChange,
      t,
      className,
      breakpoints: { isMobile },
      brands,
      ...rest
    } = this.props
    const choices = ['pending', 'reimbursed', 'no-reimbursement']
    const status = getReimbursementStatus(transaction)

    const showContacts =
      flag('reimbursements-contacts') && isHealthExpense(transaction)

    return (
      <Modal
        mobileFullscreen
        className={cx('u-flex', 'u-flex-column', className)}
        {...rest}
      >
        <header className="u-ta-center u-pt-2">
          <Icon icon={iconReimbursement} size={56} color="var(--slateGrey)" />
          <Title className="u-mt-1">
            {t('Transactions.actions.reimbursementStatus.modal.title')}
          </Title>
          <Text className={styles.ReimbursementStatusModal__transactionLabel}>
            {getLabel(transaction)}
          </Text>
        </header>
        <form className="u-mt-1">
          <List border="vertical">
            {choices.map(choice => (
              <Row key={choice}>
                <Radio
                  key={choice}
                  name="reimbursementStatus"
                  value={choice}
                  label={t(`Transactions.reimbursementStatus.${choice}`)}
                  checked={status === choice}
                  onChange={onChange}
                  className={cx('u-mb-0', styles.Radio)}
                />
              </Row>
            ))}
          </List>
        </form>
        {showContacts ? (
          <div
            className={cx(styles.ReimbursementStatusModal__contact, 'u-pt-2', {
              'u-mt-auto': isMobile
            })}
          >
            {brands
              .filter(
                brand => brand.health && brand.hasTrigger && brand.contact
              )
              .map((brand, index) => (
                <ContactItem
                  brand={brand}
                  key={brand.name}
                  className={cx({
                    'u-mb-1-half': index !== brands.length - 1
                  })}
                />
              ))}
          </div>
        ) : null}
      </Modal>
    )
  }
}

const ReimbursementStatusModal = compose(
  translate(),
  withBreakpoints()
)(_ReimbursementStatusModal)

export default ReimbursementStatusModal
