import React, { Component } from 'react'
import PropTypes from 'prop-types'
import local from '../../localization/localizedStrings'
import {
  Box,
  Columns,
  Button,
  Table,
  TableHeader,
  TableRow,
  Timestamp
} from 'grommet'
import Web3, { utils } from 'web3'

import PermitDetailsModal from '../../components/PermitDetailsModal'
import PendingTxModal from '../../components/PendingTxModal'
import PermitsToolbar from '../../components/PermitsToolbar'
import * as ipfs from '../../util/ipfs'
import { trimHash, toUnixTimestamp } from '../../util/stringUtils'
import {
  parseRawPermit,
  parseRawSpecimen,
  mergePermitEvents,
  getPermitEvents,
  blockNumberToUnix,
  sortPermitEvents,
  PERMITS_TABLE_HEADER_LABELS
} from '../../util/permitUtils'

class Permits extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      // permit events
      events: [],
      filteredEvents: [],
      eventsUpdated: false,
      // selected permit for detailed information
      selectedPermit: '',
      // latest block for retrieved events
      latestBlock: 0,
      // country of user
      authCountry: '',
      // tx information modal
      modal: {
        show: false,
        text: ''
      },
      txStatus: '',
      // sort
      sort: {
        index: 3,
        ascending: false
      }
    }
    this.contracts = context.drizzle.contracts
    // NOTE: We have to iniate a new web3 instance for retrieving event via `getPastEvents`.
    //       MetaMask does not support websockets and Drizzle retrieves events via subscriptions.
    const web3 = new Web3(this.contracts.PermitFactory.givenProvider)
    const { abi, address } = this.contracts.PermitFactory
    this.PermitFactory = new web3.eth.Contract(abi, address)
    this.web3 = web3
  }

  async componentDidMount() {
    await Promise.all([this.getEvents(), this.setAuthCountry()])
    this.setState({ filteredEvents: this.state.events })
    // NOTE: Initiate our own event listener because we can not use reactive event data with
    //       MetaMask and Drizzle.
    this.intervalId = setInterval(async () => {
      const blockNumber = await this.web3.eth.getBlockNumber()
      if (blockNumber > this.state.latestBlock) {
        this.getEvents(blockNumber)
      }
    }, 1000)
  }

  componentDidUpdate(prevProps, prevState) {
    // check if accounts changed
    if (this.props.accounts[0] !== prevProps.accounts[0]) {
      this.setAuthCountry()
    }
    // check if tx for stack id exists
    if (this.props.transactionStack[this.stackId]) {
      const txHash = this.props.transactionStack[this.stackId]
      const { status } = this.props.transactions[txHash]
      // change tx related state is status changed
      if (prevState.txStatus !== status) {
        this.changeTxState(status)
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  async getEvents(from = 0) {
    const [createdPermits, confirmedPermits] = await Promise.all([
      getPermitEvents(this.PermitFactory, 'PermitCreated', from),
      getPermitEvents(this.PermitFactory, 'PermitConfirmed', from)
    ])
    const events = createdPermits.concat(confirmedPermits)
    if (events.length > 0) {
      const newEvents = await blockNumberToUnix(this.web3, events)
      const mergedEvents = mergePermitEvents(this.state.events, newEvents).sort(
        (a, b) => b.blockNumber - a.blockNumber
      )
      this.setState({
        latestBlock: events[0].blockNumber,
        events: mergedEvents,
        eventsUpdated: true
      })
    }
  }

  async handleSelect(event) {
    const rawPermit = await this.contracts.PermitFactory.methods
      .getPermit(event.permitHash)
      .call()
    const parsedPermit = parseRawPermit(rawPermit)
    const specimenPromises = parsedPermit.specimenHashes.map(s =>
      this.contracts.PermitFactory.methods.specimens(s).call()
    )
    const rawSpecimens = await Promise.all(specimenPromises)
    const parsedSpecimens = rawSpecimens.map(s => parseRawSpecimen(s))
    this.setState({
      selectedPermit: {
        ...parsedPermit,
        specimens: parsedSpecimens,
        imgUrl: await this.getImageLink(parsedPermit.nonce),
        status: event.status,
        timestamp: event.timestamp,
        permitHash: event.permitHash
      }
    })
  }

  async getImageLink(nonce, hasImg){
    const res = await this.contracts.PermitFactory.methods.ipfsMultiHashes(parseInt(nonce)).call()
      .then(res => {
        // cant return the hasImg tag when getting the permit, so if it doesnt exist in the ipfsMultiHashes mapping the following will be returned
        if (ipfs.decodeMultiHash(res['1'], res['0']) == 1111111111111111111111111111111111){
          return false;
        }
        return "http://127.0.0.1:8080/ipfs/" + ipfs.decodeMultiHash(res['1'], res['0']);
      })
    return res
  }

  async setAuthCountry() {
    const country = await this.PermitFactory.methods
      .authorityToCountry(this.props.accounts[0])
      .call()
    this.setState({
      authCountry: utils.hexToUtf8(country)
    })
  }

  processPermit(isAccepted) {
    // stack id used for monitoring transaction
    this.stackId = this.contracts.PermitFactory.methods.confirmPermit.cacheSend(
      this.state.selectedPermit.permitHash,
      this.state.selectedPermit.specimenHashes,
      isAccepted,
      { from: this.props.accounts[0] }
    )
  }

  onDeselect() {
    this.setState({
      selectedPermit: ''
    })
  }

  closeTxModal() {
    this.setState({
      txStatus: '',
      modal: {
        show: false,
        text: ''
      }
    })
  }

  changeTxState(newTxState) {
    this.onDeselect()
    if (newTxState === 'pending') {
      this.setState({
        txStatus: 'pending',
        modal: {
          show: true,
          text: local.permitProcess.pending
        }
      })
    } else if (newTxState === 'success') {
      this.stackId = ''
      this.setState({
        txStatus: 'success',
        modal: {
          show: true,
          text: local.permitProcess.successful
        }
      })
    } else {
      this.stackId = ''
      this.setState({
        txStatus: 'failed',
        modal: {
          show: true,
          text: local.permitProcess.failed
        }
      })
    }
  }

  handleSort(index) {
    const { filteredEvents, sort } = this.state
    const sortedEvents = sortPermitEvents(
      filteredEvents,
      PERMITS_TABLE_HEADER_LABELS[index],
      !sort.ascending
    )
    this.setState({
      filteredEvents: sortedEvents,
      sort: {
        index,
        ascending: !sort.ascending
      }
    })
  }

  handleFilter(filter) {
    const { events } = this.state
    const {
      exCountryFilter,
      imCountryFilter,
      statusFilter,
      startDateFilter,
      endDateFilter,
      searchInput
    } = filter
    // filter export / import country and status
    let filteredEvents = events.filter(e => {
      if (
        exCountryFilter.value !== 'all' &&
        exCountryFilter.value !== e.exportCountry
      ) {
        return false
      }
      if (
        imCountryFilter.value !== 'all' &&
        imCountryFilter.value !== e.importCountry
      ) {
        return false
      }
      if (statusFilter.value !== 'all' && statusFilter.value !== e.status) {
        return false
      }
      return true
    })
    // filter from / to date
    filteredEvents = this.dateFilter(
      startDateFilter,
      endDateFilter,
      filteredEvents
    )
    // search filter
    filteredEvents = this.searchFilter(searchInput, filteredEvents)
    this.setState({
      filteredEvents,
      eventsUpdated: false
    })
  }

  dateFilter(startDate, endDate, events) {
    if (startDate) {
      const [day, month, year] = startDate.split('/')
      startDate = toUnixTimestamp(new Date(year, month - 1, day))
    }
    if (endDate) {
      let [day, month, year] = endDate.split('/')
      day++
      endDate = toUnixTimestamp(new Date(year, month - 1, day))
    }
    return events.filter(e => {
      if (startDate && endDate) {
        return startDate <= e.timestamp && e.timestamp <= endDate
      }
      if (startDate && !endDate) {
        return startDate <= e.timestamp
      }
      if (!startDate && endDate) {
        return e.timestamp <= endDate
      }
      return true
    })
  }

  searchFilter(searchInput, events) {
    return events.filter(e => e.permitHash.includes(searchInput))
  }

  render() {
    const { selectedPermit, authCountry, eventsUpdated } = this.state
    return (
      <Box>
        {selectedPermit && (
          <PermitDetailsModal
            permit={selectedPermit}
            onClose={() => this.onDeselect()}
            detailsActions={
              selectedPermit.importCountry === authCountry &&
              selectedPermit.status === 'created' && (
                <Columns justify={'between'} size={'small'}>
                  <Button
                    secondary={true}
                    label={local.permits.decline}
                    onClick={() => this.processPermit(false)}
                  />
                  <Button
                    label={local.permits.confirm}
                    onClick={() => this.processPermit(true)}
                  />
                </Columns>
              )
            }
          />
        )}
        {this.state.modal.show && (
          <PendingTxModal
            txStatus={this.state.txStatus}
            text={this.state.modal.text}
            onClose={() => this.closeTxModal()}
          />
        )}
        <PermitsToolbar
          searchSuggestions={this.state.filteredEvents.map(e => e.permitHash)}
          onFilter={filter => this.handleFilter(filter)}
          eventsUpdated={eventsUpdated}
        />
        <Table>
          <TableHeader
            labels={[
              local.permits.permitNumber,
              local.permits.countryOfExport,
              local.permits.countryOfImport,
              local.permits.lastUpdate,
              local.permits.status
            ]}
            sortIndex={this.state.sort.index}
            sortAscending={this.state.sort.ascending}
            onSort={index => this.handleSort(index)}
          />
          <tbody>
            {this.state.filteredEvents.map((event, i) => (
              <TableRow key={i} onClick={() => this.handleSelect(event)}>
                <td>{trimHash(event.permitHash)}</td>
                <td>{event.exportCountry}</td>
                <td>{event.importCountry}</td>
                <td>
                  <Timestamp value={event.timestamp} />
                </td>
                <td>{local.permits[event.status]}</td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Box>
    )
  }
}

Permits.propTypes = {
  accounts: PropTypes.object,
  PermitFactory: PropTypes.object,
  transactionStack: PropTypes.array,
  transactions: PropTypes.object
}

Permits.contextTypes = {
  drizzle: PropTypes.object
}

export default Permits
