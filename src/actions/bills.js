import { fetchDocument } from 'old-cozy-client'
import { BILLS_DOCTYPE } from 'doctypes'

export const fetchBill = id => fetchDocument(BILLS_DOCTYPE, id)
