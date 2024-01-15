/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cors from 'cors'
import express from 'express'
import axios from 'axios'
import { env } from '../../env'
import { corsConfig } from '../../utils/corsConfig'
import { parseRSS, fetchFavicon } from '../../utils/parser'
import { getRepository } from '../../repository'
import { feedRepository } from '../../repository/feed'
import {
  SubscriptionType,
  SubscribeErrorCode,
  SubscriptionStatus,
  FeedEdge,
  FeedsErrorCode,
} from '../../generated/graphql'
import {
  DEFAULT_SUBSCRIPTION_FOLDER,
  Subscription,
} from '../../entity/subscription'
import { getSubscriptions } from '../../services/subscriptions'
import authMiddleware from '../../middleware/auth'
import { keysToCamelCase } from '../../utils/helpers'
import { rssHandler } from '@omnivore/rss-handler/src'

export function subscriptionRouter() {
  const router = express.Router()

  // 扫描rss订阅源
  router.post(
    '/scan',
    cors<express.Request>(corsConfig),
    authMiddleware,
    async (req, res) => {
      const { url } = req.body as { url: string }
      if (!url) {
        return res.status(400).send({ errorCode: 'BAD_DATA' })
      }
      let feed = await parseRSS(url)
      return res.status(200).send(feed)
    }
  )

  router.get(
    '/getSubscriptions',
    cors<express.Request>(corsConfig),
    authMiddleware,
    async (req, res) => {
      let subscriptions = await getSubscriptions()
      return res.status(200).send(subscriptions)
    }
  )

  // 订阅源
  router.post(
    '/subscribe',
    cors<express.Request>(corsConfig),
    authMiddleware,
    async (req, res) => {
      const { subscriptionType, url } = req.body as {
        url: string
        subscriptionType: SubscriptionType.Rss
      }
      const existingSubscription = await getRepository(Subscription).findOneBy({
        url,
        user: { id: req.uid },
        type: subscriptionType,
      })
      const favicon = await fetchFavicon(url)
      if (existingSubscription) {
        console.log(existingSubscription, 'existingSubscription')
        if (existingSubscription.status === SubscriptionStatus.Active) {
          return res
            .status(200)
            .send({ errorCode: SubscribeErrorCode.AlreadySubscribed })
        }
      }
      // create new rss subscription
      const MAX_RSS_SUBSCRIPTIONS = env.subscription.feed.max

      const feed = await parseRSS(url)
      console.log('feed', feed)
      // limit number of rss subscriptions to max
      const results = (await getRepository(Subscription).query(
        `insert into omnivore.subscriptions (name, url, description, type, user_id, icon, is_private, fetch_content, folder) 
      select $1, $2, $3, $4, $5, $6, $7, $8, $9 from omnivore.subscriptions 
      where user_id = $5 and type = 'RSS' and status = 'ACTIVE' 
      having count(*) < $10
      returning *;`,
        [
          feed.title,
          feed.feedUrl,
          feed.description,
          SubscriptionType.Rss,
          req.uid,
          favicon,
          undefined,
          true,
          'following',
          MAX_RSS_SUBSCRIPTIONS,
        ]
      )) as any[]

      if (results.length === 0) {
        return {
          errorCodes: [SubscribeErrorCode.ExceededMaxSubscriptions],
        }
      }
      const newSubscription = keysToCamelCase(results[0]) as Subscription

      return res.status(200).send({ subscriptions: [newSubscription] })
    }
  )

  // 获取订阅源详情
  router.get(
    '/detail',
    cors<express.Request>(corsConfig),
    authMiddleware,
    async (req, res) => {
      const token = (req.cookies?.auth || req.headers?.authorization) as string
      const { id } = req.query as { id: string }
      if (!id) {
        return res.status(400).send({ errorCode: 'BAD_DATA' })
      }

      const queryBuilder = getRepository(Subscription)
        .createQueryBuilder('subscription')
        .where({
          user: { id: req.uid },
          id,
        })
      const subscription = await queryBuilder.getOne()
      return res.status(200).send(subscription)
    }
  )

  router.post(
    '/fetchFeedContent',
    cors<express.Request>(corsConfig),
    authMiddleware,
    async (req, res) => {
      try {
        const { PUBSUB_VERIFICATION_TOKEN } = process.env
        const { id } = req.body as { id: string }
        if (!id) {
          return res.status(400).send({ errorCode: 'BAD_DATA' })
        }
        const queryBuilder = getRepository(Subscription)
          .createQueryBuilder('subscription')
          .where({
            user: { id: req.uid },
            id,
          })
        const subscription = await queryBuilder.getOne()
        if (subscription) {
          const payload = {
            subscriptionIds: [subscription.id],
            feedUrl: subscription.url,
            lastFetchedTimestamps: [subscription.lastFetchedAt].map(
              (timestamp: any) => timestamp?.getTime() || 0
            ), // unix timestamp in milliseconds
            lastFetchedChecksums: [subscription.lastFetchedChecksum],
            scheduledTimestamps: [new Date()].map((timestamp: any) =>
              timestamp.getTime()
            ), // unix timestamp in milliseconds
            userIds: [req.uid],
            fetchContents: [subscription.fetchContent],
            folders: [subscription.folder || DEFAULT_SUBSCRIPTION_FOLDER],
          }
          console.log('parse-page ', subscription)
          rssHandler(payload, res)
          // return res.status(200).send({ ok: true })
        }
      } catch (error) {
        console.log(error)
      }
    }
  )

  router.post(
    '/fetchFeeds',
    cors<express.Request>(corsConfig),
    authMiddleware,
    async (req, res) => {
      try {
        const params = req.body
        const startCursor = params.after || ''
        const start =
          startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
        const first = Math.min(params.first || 10, 100) // cap at 100

        const { feeds, count } = await feedRepository.searchFeeds(
          params.id,
          first + 1,
          start,
          params.sort?.by,
          params.sort?.order
        )
        const hasNextPage = feeds.length > first
        const endCursor = String(start + feeds.length - (hasNextPage ? 1 : 0))

        if (hasNextPage) {
          // remove an extra if exists
          feeds.pop()
        }

        const edges: any[] = feeds.map((feed) => ({
          node: feed,
          cursor: endCursor,
        }))

        res.status(200).send({
          data: edges,
          pageInfo: {
            hasPreviousPage: start > 0,
            hasNextPage,
            startCursor,
            endCursor,
            totalCount: count,
          },
        })
      } catch (error) {
        console.log('Error fetching feeds', error)
        return {
          errorCodes: [FeedsErrorCode.BadRequest],
        }
      }
    }
  )

  return router
}
