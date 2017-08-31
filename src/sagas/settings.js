import { takeLatest, call, put, select } from 'redux-saga/effects'
import union from 'lodash/union'
import {
  loadSettingsSuccess,
  changeSettingsCurrency,
  updateExchangeRateSuccess,
  completeSetup,
  toggleSectionCollapse
} from '../actions/settings'
import { getCollapsedSections } from '../selectors/settings'
import {
  getBaseCurrency,
  getSecondaryCurrency,
  getUsedCurrency
} from '../selectors/currency.js'
import SettingsStorage from '../util/storage/settings'
import { fetchExchangeRates } from '../util/currency'

export function* loadSetting() {
  const settings = yield call(SettingsStorage.load)
  yield put(loadSettingsSuccess(settings))
}

export function* changeCurrencySaga() {
  const base = yield select(getBaseCurrency)
  const secondary = yield select(getSecondaryCurrency)
  const used = yield select(getUsedCurrency)
  const exchangeRate = yield call(
    fetchExchangeRates,
    base,
    union(secondary, used)
  )
  yield put(updateExchangeRateSuccess(exchangeRate))
  yield call(SettingsStorage.save, {
    currency: { base, secondary },
    exchangeRate
  })
}

export function* completeSetupSaga() {
  yield call(SettingsStorage.save, { isSetupComplete: true })
}

export function* saveCollapsedSectionsSaga() {
  const collapsedSections = yield select(getCollapsedSections)
  yield call(SettingsStorage.saveLocal, { collapsedSections })
}

export default [
  takeLatest(changeSettingsCurrency, changeCurrencySaga),
  takeLatest(completeSetup, completeSetupSaga),
  takeLatest(toggleSectionCollapse, saveCollapsedSectionsSaga)
]
