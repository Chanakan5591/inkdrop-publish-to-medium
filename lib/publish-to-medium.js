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

  async generateHTML(note) {
    const exportUtils = require('inkdrop-export-utils')
    const markdown = note.body
    const outputHtml = await exportUtils.createHTML(
      {
        ...note,
        body: markdown
      },
      { addTitle: false }
    )

    return outputHtml
  }

  publishCurrent() {
    return async () => {
      const { replaceHTMLImagesWithDataURI } = require('inkdrop-export-utils')
      const { editingNote } = inkdrop.store.getState()
      let html = await this.generateHTML(editingNote)
      html = await replaceHTMLImagesWithDataURI(html)

      const url = `https://api.medium.com/v1/users/${userId}/posts`
      const data = {
        title: editingNote.body.split('\n')[0],
        contentFormat: 'html',
        content: html
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
