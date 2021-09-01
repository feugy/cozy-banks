/* global __POUCH__ */
import fromPairs from 'lodash/fromPairs'

import { StackLink, Q } from 'cozy-client'
import { isMobileApp, isIOSApp } from 'cozy-device-helper'
import flag from 'cozy-flags'

import { offlineDoctypes, TRANSACTION_DOCTYPE } from 'doctypes'
import { APPLICATION_DATE } from 'ducks/transactions/constants'

const activatePouch = __POUCH__ && !flag('banks.pouch.disabled')
let links = null

const makeWarmupQueryOptions = (doctype, indexedFields) => {
  return {
    definition: () => {
      const qdef = Q(doctype)
        .where(
          fromPairs(indexedFields.map(fieldName => [fieldName, { $gt: null }]))
        )
        .indexFields(indexedFields)
      return qdef
    },
    options: {
      as: `${doctype}-by-${indexedFields.join('-')}`
    }
  }
}

export const getLinks = async (options = {}) => {
  if (links) {
    return links
  }

  const stackLink = new StackLink()

  links = [stackLink]

  if (activatePouch) {
    const pouchLinkOptions = {
      doctypes: offlineDoctypes,
      doctypesReplicationOptions: {
        [TRANSACTION_DOCTYPE]: {
          warmupQueries: [
            makeWarmupQueryOptions(TRANSACTION_DOCTYPE, ['date']),
            makeWarmupQueryOptions(TRANSACTION_DOCTYPE, [APPLICATION_DATE]),
            makeWarmupQueryOptions(TRANSACTION_DOCTYPE, ['account']),
            makeWarmupQueryOptions(TRANSACTION_DOCTYPE, ['date', 'account']),
            makeWarmupQueryOptions(TRANSACTION_DOCTYPE, [
              APPLICATION_DATE,
              'account'
            ])
          ]
        }
      },
      initialSync: true
    }

    if (isMobileApp() && isIOSApp()) {
      pouchLinkOptions.pouch = {
        plugins: [require('pouchdb-adapter-cordova-sqlite')],
        options: {
          adapter: 'cordova-sqlite',
          location: 'default'
        }
      }
    }

    const PouchLink = require('cozy-pouch-link').default

    const pouchLink = new PouchLink({
      ...pouchLinkOptions,
      ...options.pouchLink
    })

    links = [pouchLink, ...links]
  }

  return links
}
