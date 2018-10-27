import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql'
import { isBetween } from '../../utils/functions'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  fromPosition: { type: new GraphQLNonNull(GraphQLInt) },
  toPosition: { type: new GraphQLNonNull(GraphQLInt) }
}

const resolve = (parent, { eventDesignator, fromPosition, toPosition }, context) => {
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId: context.userId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
      } else {
        const delta = fromPosition > toPosition ? 1 : -1
        event.rules.forEach((part) => {
          if (part.position === fromPosition) {
            part.position = toPosition
          } else if (isBetween(part.position, fromPosition, toPosition)) {
            part.position += delta
          }
        })

        event.save((err) => {
          if (err) reject(err)
          else {
            resolve(event)
          }
        })
      }
    })
  })
}

const mutation = {
  reorderRules: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
