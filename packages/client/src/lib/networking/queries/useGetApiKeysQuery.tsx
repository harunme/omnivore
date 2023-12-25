import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'

export interface ApiKey {
  id: string
  name: string
  key?: string
  scopes: string[]
  createdAt: string
  expiresAt: string
  usedAt?: string
}

interface ApiKeysQueryResponse {
  isValidating: boolean
  apiKeys: ApiKey[]
  revalidate: () => void
}

interface ApiKeysQueryResponseData {
  apiKeys: ApiKeysData
}

interface ApiKeysData {
  apiKeys: unknown
}

export function useGetApiKeysQuery(): ApiKeysQueryResponse {
  const query = gql`
    query GetApiKeys {
      apiKeys {
        ... on ApiKeysSuccess {
          apiKeys {
            id
            name
            key
            scopes
            createdAt
            expiresAt
            usedAt
          }
        }
        ... on ApiKeysError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (data) {
      const result = data as ApiKeysQueryResponseData
      const apiKeys = result.apiKeys.apiKeys as ApiKey[]
      return {
        isValidating,
        apiKeys,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    isValidating: true,
    apiKeys: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
