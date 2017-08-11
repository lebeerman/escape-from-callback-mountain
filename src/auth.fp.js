// EXAMPLE: FUNCTIONAL PROMISES
const Promise           = require('bluebird')
const {hashStringAsync} = require('./lib/crypto')
const {logEventAsync}   = require('./lib/log')
const {getModelAsync}   = require('./lib/db')

module.exports = {auth}

function auth({username, password}) {
  return Promise.resolve({username, password})
    .then(_checkInput)
    .tap(logEventAsync({event: 'login', username}))
    .then(_loginUser)
    .then(_checkResults)
}

function _loginUser({username, password}) {
  return Promise.props({
    Users:      getModelAsync('users'), 
    hashedPass: hashStringAsync(password)
  })
  .then(({Users, hashedPass}) => Users
    .findOneAsync({username, password: hashedPass})) 
}

function _checkInput({username, password}) {
  if (!username || username.length < 1) throw new Error('Invalid username.')
  if (!password || password.length < 6) throw new Error('Invalid password.')
  return {username, password}
}

function _checkResults(user) {
  return user && user._id ? user : Promise.reject(new Error('User Not found!'))
}
