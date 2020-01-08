import React from 'react'
import { DumbTriggerErrorCard as TriggerErrorCard } from './TriggerErrorCard'
import { shallow } from 'enzyme'
import { TestI18n } from 'test/AppLike'

jest.mock('components/effects', () => ({
  useRedirectionURL: () => 'http://redirection'
}))

describe('trigger error card', () => {
  const setup = () => {
    const wrapper = shallow(
      <TestI18n>
        <TriggerErrorCard
          breakpoints={{ isMobile: true }}
          count={1}
          index={0}
          trigger={{
            current_state: {
              last_error: 'LOGIN_FAILED'
            },
            message: {
              account: '1234',
              konnector: 'boursorama83'
            }
          }}
        />
      </TestI18n>
    )
      .dive()
      .dive()
    return {
      wrapper
    }
  }
  it('should render correctly', () => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
  })
})
