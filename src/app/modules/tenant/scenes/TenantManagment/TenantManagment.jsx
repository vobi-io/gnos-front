/* eslint import/no-extraneous-dependencies:0 */
/* eslint class-methods-use-this:0 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'
import SweetAlert from 'sweetalert-react'
import 'sweetalert/dist/sweetalert.css'
import { Input } from '../../../../components/Input/Input'
import './TenantManagment.scss'

import {
  leaseListRequest,
  updateFieldValue,
  deleteTenantRequest,
  tenantSearchSuccess,
  inProgressTenantRequest,
} from '../../actions/tenantActions'

import {
  propertyListRequest,
} from '../../../property/actions/propertyActions'

import { updateFieldValue as updateCurrentUserFieldValue }
from '../../../currentUser/actions/currentUserActions'

import { injectNOS } from '@nosplatform/api-functions/lib/react'

import deleteConfirmIcon from '../../../../resources/assets/images/icons/delete-confirm.svg'
import { showMessageBox } from '../../../../components/helpers/messageBox'

class TenantManagment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      isBodyVisible: false,
      cards: {},
      previousCard: null,
    }
  }

  componentDidMount() {
     // TODO: RUN QUERY TO GET properties with wallet address
     // this.runQuery(this.props)


    this.props.nos.getAddress()
      .then((walletAddress) => {
        // alert(e)
        // this.props.updateCurrentUserFieldValue('isLoggedIn', true)
        // this.props.updateCurrentUserFieldValue('walletAddress', walletAddress)
        // this.props.updateCurrentUserFieldValue('data.email', walletAddress)

        this.runQuery(this.props)
      })
    // console.log('window.NOS.ASSETS;', window.NOS.ASSETS)
    // this.props.nos.getBalance({ asset: window.NOS.ASSETS.NEO })
    //  .then((e) => {
    //    console.log('neo', e)
    //    this.props.updateCurrentUserFieldValue('data.neo', e)
    //  })
    // this.props.nos.getBalance({ asset: window.NOS.ASSETS.GAS })
    //  .then((e) => {
    //    console.log('gas', e)
    //    this.props.updateCurrentUserFieldValue('data.gas', e)
    //  })
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.location && nextProps.location !== this.props.location) ||
      (this.props.reloadData !== nextProps.reloadData && nextProps.reloadData)
    ) {
      this.runQuery(nextProps)
    }
  }

  filterQuery() {
    const where = {}
    this.props.updateFieldValue('query.where', where)
  }

  runQuery = (props) => {
    this.filterQuery(props)
    const { walletAddress } = this.props
    setTimeout(() => {
      const query = this.props.query.toJS()
      // query.where = {
      //   address: walletAddress,
      // }
      this.props.dispatch(propertyListRequest(query))
    }, 30)
  }

  deleteMessage(tenant) {
    showMessageBox({
      text: 'Are you sure you want to delete tenant?',
      icon: deleteConfirmIcon,
      confirmCallback: () => {
        this.props.deleteTenantRequest(tenant.get('id'), tenant.get('lease'))
      },
    })
  }

  handleSearch(e) {
    // console.log(e.target.value)
    this.props.searchTenantRequest(e.target.value)
  }

  invokeContract() {
    // alert('invoke')
    const nos = window.NOS.V1

    // const scriptHash = '2f228c37687d474d0a65d7d82d4ebf8a24a3fcbc'
    const scriptHash = '4c02e080d5c56f3946b5722c48ccb3907be34528'
    const operation = 'nika'
    const args = ['ef68bcda-2892-491a-a7e6-9c4cb1a11732']

    nos.invoke({ scriptHash, operation, args })
    .then((script) => {
      // alert(`Test invoke script: ${script} `)
      console.log('script', script)
    })
    .catch((err) => {
      alert(`Error: ${err.message}`)
      console.log('error', err)
    })

    // const credits = this.props.currentUser.get('credits')
    // console.log('CREDITS : ', credits)
    // if (credits < 1) {
    //   this.setState({ show: true })
    // } else {
    //   browserHistory.push('/tenants/new')
    // }
  }


  generateAddressForReport(tenant) {
    return `${tenant.getIn(['property', 'street'])}-${tenant.getIn(['property', 'city'])}-${tenant.getIn([
      'property',
      'state',
    ])}-${tenant.getIn(['property', 'zip'])}`
  }

  renderStatus = (tenant) => {
    if (tenant.get('status') && tenant.get('status').toLowerCase() === 'active') {
      return <button className="btn btn-sm btn-success">Active </button>
    }

    return <button className="btn btn-sm btn-primary">Under mortgage</button>
  }

  renderReportButtonStyle(submited) {
    return submited
      ? 'btn btn-icon btn-sm btn-primary report-btn'
      : 'btn btn-icon btn-sm btn-secondary disabled report-btn'
  }

  handleCheckBox(tenant) {
    const id = tenant.get('id')
    const lease = tenant.get('lease')
    //  const inviteCode = tenant.get('inviteCode')
    // console.log('Lease Id ', lease)
    // console.log('invite Code ', inviteCode)
    this.props.updateFieldValue('isAutoSubmited', !tenant.get('isAutoSubmited'))
    this.props.inProgressRequest(id, lease)
  }

  renderBody(item) {
    if (!this.state.cards[item.get('id')]) {
      return null
    }

    return (
      <div className="card-body">
        <ul className="list-group">
          <li className="list-group-item">
            <span className="data-label">Status:</span>
            {this.renderStatus(item)}
          </li>


          <li className="list-group-item">
            <span className="data-label">number:</span>
            {item.get('number')}
          </li>
          <li className="list-group-item">
            <span className="data-label">title:</span>
            {item.get('title')}
          </li>
          <li className="list-group-item">
            <span className="data-label">cadastral code:</span>
            {item.get('cadastral')}
          </li>
          <li className="list-group-item">
            <span className="data-label">MAP Address:</span>
            <a href={`https://www.google.com/maps/?q=${item.get('mapAddress')}`} target="_blank" >View on Google map</a>
          </li>
          <li className="list-group-item">
            <span className="data-label">Registration Date:</span>
            {moment(item.get('registrationDate')).format('DD-MMMM-YYYY')}
          </li>
          <li className="list-group-item">
            <span className="data-label">type:</span>
            {item.get('type')}
          </li>
          <li className="list-group-item">
            <span className="data-label">status:</span>
            {item.get('status')}
          </li>
          <li className="list-group-item">
            <span className="data-label">address:</span>
            {item.get('address')}
          </li>
          <li className="list-group-item">
            <span className="data-label">area:</span>
            {item.get('area')} m<sup>2</sup>
          </li>
          <li className="list-group-item">
            <span className="data-label">link:</span>
            {item.get('link')}
          </li>
          <li className="list-group-item">
            <span className="data-label">owner (Waller Address):</span>
            {item.get('owner')}
          </li>

          {/*
          <li className="list-group-item">
            <span className="data-label in-progress">For Sale:</span>
            <input
              type="checkbox"
              id="inProgress"
              onChange={() => this.handleCheckBox(item)}
              checked={item.get('status') === 'submited'}
            />
            <label className={`switch ${!item.get('isAutoSubmited')}`} htmlFor="inProgress">
              Toggle
            </label>
          </li>
          <li className="list-group-item">
            <span className="data-label">Price:</span>
            <input type="number" min="0" step={1000} /> $ (USD)
          </li>
          <li className="list-group-item">
            <span className="data-label">Address:</span>
            <input type="text" value={`${this.generateAddressForReport(item)}`} />
          </li>
          */}

        </ul>
      </div>
    )
  }

  render() {
    return (
      <div className="tenants-page">
        <SweetAlert
          show={this.state.show}
          title="No Remaining WalkThrus"
          html
          text="Please contact us to have more WalkThrus added to your account"
          onConfirm={() => this.setState({ show: false })}
        />
        <div className="row">
          <div className="col-md-12">
            <div className="float-left">
              <h3>Properties</h3>
            </div>

            <div className="float-right">
              <button className="btn btn-danger btn-icon" type="button" onClick={() => this.invokeContract()}>
                <i className="fa fa-plus" aria-hidden="true" /> Test Invoke
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <Input
              className="form-control"
              value={this.props.searchText}
              placeholder="Search..."
              onChange={(value) => {
                this.handleSearch(value)
              }}
              type="text"
            />
          </div>
          <br />
          <div className="col-md-12">
            <hr />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {this.props.items.valueSeq().map((tenant, key) => (
              <div key={key}>
                <div className="card">
                  <div
                    className="card-header"
                    onClick={() => {
                      const { cards } = this.state
                      cards[tenant.get('lease')] = !cards[tenant.get('lease')]
                      // cards[tenant.get('lease')] = true

                      if (Object.keys(cards).length > 1) {
                        cards[this.state.previousCard] = false // hide previous card
                      }

                      this.setState({ cards, previousCard: tenant.get('lease') })
                    }}
                  >
                    <div className="float-left">
                      <h4>
                        <i className="fa fa-home" /> &nbsp;
                        <span>{tenant.get('address')} </span>
                      </h4>
                    </div>
                    <div className="float-right">
                      <Link
                        to={`/activities/${tenant.get('id')}/${tenant.get('lease')}`}
                        className="btn btn-icon btn-sm btn-default report-btn"
                      >
                        <i className="fa fa-file-text" aria-hidden="true" />
                        Activities
                      </Link>
                      {/* {tenant.get('status') === 'submited' && */}
                      <Link
                        to={`${process.env.apiUrl}/api/v1/tenant/${tenant.get('id')}/pdf?lease=${tenant.get(
                          'lease'
                        )}&address=${this.generateAddressForReport(tenant)}`}
                        target="_blank"
                        className={this.renderReportButtonStyle(tenant.get('status') === 'submited')}
                      >
                        <i className="fa fa-file-text" aria-hidden="true" />
                        Report
                      </Link>
                      {/* } */}
                      <div className="btn-group" role="group">
                        <Link
                          to={`/tenants/edit/${tenant.get('id')}/${tenant.get('lease')}`}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="fa fa-pencil" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => this.deleteMessage(tenant)}
                        >
                          <i className="fa fa-trash-o" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {this.renderBody(tenant)}
                </div>
                <br />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUserRole: state.currentUser.getIn(['data', 'role']),
    currentUser: state.currentUser.get('data'),
    reloadData: state.tenant.get('reloadData'),
    isLoading: state.tenant.get('isLoading'),
    query: state.tenant.get('query'),
    pageSize: state.tenant.getIn(['query', 'pageSize']),
    currentPage: state.tenant.getIn(['query', 'page']),
    totalCount: state.tenant.get('totalCount'),
    items: state.property.get('items'),
    searchText: state.tenant.get('searchText'),
    defaultNumberOfDaysToComplete: state.currentUser.getIn(['data', 'defaultNumberOfDaysToComplete']),
    walletAddress: state.currentUser.get('walletAddress'),
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  leaseListRequest: query => dispatch(leaseListRequest(query)),
  deleteTenantRequest: (id, lease) => dispatch(deleteTenantRequest(id, lease)),
  searchTenantRequest: text => dispatch(tenantSearchSuccess(text)),
  updateFieldValue: (field, value, parent, isDelete) => dispatch(updateFieldValue(field, value, parent, isDelete)),
  inProgressRequest: (id, lease) => dispatch(inProgressTenantRequest(id, lease)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectNOS(TenantManagment))
