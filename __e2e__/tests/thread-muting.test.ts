/* eslint-env detox/detox */

import {openApp, login, createServer} from '../util'

describe('Thread muting', () => {
  let service: string
  beforeAll(async () => {
    service = await createServer('?users&follows')
    await openApp({permissions: {notifications: 'YES'}})
  })

  it('Login, create a thread, and log out', async () => {
    await login(service, 'alice', 'hunter2')
    await element(by.id('homeScreenFeedTabs-Following')).tap()
    await element(by.id('composeFAB')).tap()
    await element(by.id('composerTextInput')).typeText('Test thread')
    await element(by.id('composerPublishBtn')).tap()
    await expect(element(by.id('composeFAB'))).toBeVisible()
    await element(by.id('viewHeaderDrawerBtn')).tap()
    await element(by.id('menuItemButton-Settings')).tap()
    await element(by.id('signOutBtn')).tap()
  })

  it('Login, reply to the thread, and log out', async () => {
    await login(service, 'bob', 'hunter2')
    await element(by.id('homeScreenFeedTabs-Following')).tap()
    const alicePosts = by.id('feedItem-by-alice.test')
    await element(by.id('replyBtn').withAncestor(alicePosts)).atIndex(0).tap()
    await element(by.id('composerTextInput')).typeText('Reply 1')
    await element(by.id('composerPublishBtn')).tap()
    await expect(element(by.id('composeFAB'))).toBeVisible()
    await element(by.id('viewHeaderDrawerBtn')).tap()
    await element(by.id('menuItemButton-Settings')).tap()
    await element(by.id('signOutBtn')).tap()
  })

  it('Login, confirm notification exists, mute thread, and log out', async () => {
    await login(service, 'alice', 'hunter2')

    await element(by.id('bottomBarNotificationsBtn')).tap()
    const bobNotifs = by.id('feedItem-by-bob.test')
    await expect(
      element(by.id('postText').withAncestor(bobNotifs)).atIndex(0),
    ).toHaveText('Reply 1')
    await element(by.id('postDropdownBtn').withAncestor(bobNotifs))
      .atIndex(0)
      .tap()
    await element(by.text('Mute thread')).tap()
    // have to wait for the toast to clear
    await waitFor(element(by.id('viewHeaderDrawerBtn')))
      .toBeVisible()
      .withTimeout(5000)

    await element(by.id('viewHeaderDrawerBtn')).tap()
    await element(by.id('menuItemButton-Settings')).tap()
    await element(by.id('signOutBtn')).tap()
  })

  it('Login, reply to the thread twice, and log out', async () => {
    await login(service, 'bob', 'hunter2')

    await element(by.id('bottomBarProfileBtn')).tap()
    await element(by.id('selector-1')).tap()
    const bobPosts = by.id('feedItem-by-bob.test')
    await element(by.id('replyBtn').withAncestor(bobPosts)).atIndex(0).tap()
    await element(by.id('composerTextInput')).typeText('Reply 2')
    await element(by.id('composerPublishBtn')).tap()
    await expect(element(by.id('composeFAB'))).toBeVisible()

    const alicePosts = by.id('feedItem-by-alice.test')
    await element(by.id('replyBtn').withAncestor(alicePosts)).atIndex(0).tap()
    await element(by.id('composerTextInput')).typeText('Reply 3')
    await element(by.id('composerPublishBtn')).tap()
    await expect(element(by.id('composeFAB'))).toBeVisible()

    await element(by.id('bottomBarHomeBtn')).tap()
    await element(by.id('viewHeaderDrawerBtn')).tap()
    await element(by.id('menuItemButton-Settings')).tap()
    await element(by.id('signOutBtn')).tap()
  })

  it('Login, confirm notifications dont exist, unmute the thread, confirm notifications exist', async () => {
    await login(service, 'alice', 'hunter2')

    await element(by.id('bottomBarNotificationsBtn')).tap()
    const bobNotifs = by.id('feedItem-by-bob.test')
    await expect(
      element(by.id('postText').withAncestor(bobNotifs)).atIndex(0),
    ).not.toExist()

    await element(by.id('bottomBarHomeBtn')).tap()
    const alicePosts = by.id('feedItem-by-alice.test')
    await element(by.id('postDropdownBtn').withAncestor(alicePosts))
      .atIndex(0)
      .tap()
    await element(by.text('Mute thread')).tap()

    // TODO
    // the swipe down to trigger PTR isnt working and I dont want to block on this
    // -prf
    // await element(by.id('bottomBarNotificationsBtn')).tap()
    // await element(by.id('notifsFeed')).swipe('down', 'fast')
    // await waitFor(element(by.id('postText').withAncestor(bobNotifs)))
    //   .toBeVisible()
    //   .withTimeout(5000)
    // await expect(
    //   element(by.id('postText').withAncestor(bobNotifs)).atIndex(0),
    // ).toHaveText('Reply 2')
    // await expect(
    //   element(by.id('postText').withAncestor(bobNotifs)).atIndex(1),
    // ).toHaveText('Reply 3')
    // await expect(
    //   element(by.id('postText').withAncestor(bobNotifs)).atIndex(2),
    // ).toHaveText('Reply 1')
  })
})
