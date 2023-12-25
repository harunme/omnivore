import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Subscription } from '../queries/useGetSubscriptionsQuery'

type UnsubscribeResult = {
  unsubscribe: Unsubscribe
}

type Unsubscribe = {
  subscription: Subscription
  errorCodes?: unknown[]
}

export async function unsubscribeMutation(
  subscribeName: string,
  id = ''
): Promise<any | undefined> {
  const mutation = gql`
    mutation {
      unsubscribe(name: "${subscribeName}", subscriptionId: "${id}") {
        ... on UnsubscribeSuccess {
          subscription {
            id
          }
        }
        ... on UnsubscribeError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation)) as UnsubscribeResult
    return data.unsubscribe.errorCodes
      ? undefined
      : data.unsubscribe.subscription.id
  } catch (error) {
    console.log('unsubscribeMutation error', error)
    return undefined
  }
}
