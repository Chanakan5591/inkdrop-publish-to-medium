'use babel';

import axios from 'axios'
import PublishedDialog from './publish-to-medium-dialog'

let userId = null

const config = {
  headers: {
    Authorization: `Bearer ${inkdrop.config.get('publish-to-medium.accessToken')}`
  }
}

class PublishToMedium {
  callback(uid) {
    userId = uid
  }
  publishCurrent() {
    return () => {
      const { editingNote } = inkdrop.store.getState()
      const body = editingNote ? editingNote.body : ''

      const url = `https://api.medium.com/v1/users/${userId}/posts`
      const data = {
        title: body.split('\n')[0],
        contentFormat: 'markdown',
        content: body
      }
      axios.post(url, data, config)
        .then((res) => {
          inkdrop.commands.dispatch(document.body, 'publish-to-medium:show-dialog')
        })
    }
  }

  subscribe() {
    axios.get('https://api.medium.com/v1/me', config)
      .then(res => this.callback(res.data.data.id))
    this.subscription = inkdrop.commands.add(document.body, {
      'publish-to-medium:publish': this.publishCurrent()
    })
  }

  unsubscribe() {
    if (this.subscription)
      this.subscription.dispose()
  }

}

const ptm = new PublishToMedium()

module.exports = {
  config: {
    accessToken: {
      title: 'Access Token',
      type: 'string',
      description: 'Access Token generated from Medium'
    }
  },
  activate() {
    ptm.subscribe()
    inkdrop.components.registerClass(PublishedDialog)
    inkdrop.layouts.addComponentToLayout('modal', 'PublishedDialog')
  },

  deactivate() {
    ptm.unsubscribe()
    inkdrop.layouts.removeComponentFromLayout('modal', 'PublishedDialog')
    inkdrop.components.deleteClass(PublishedDialog)
  }
};
