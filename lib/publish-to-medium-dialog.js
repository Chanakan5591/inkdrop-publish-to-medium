"use babel"

import React, { useEffect, useCallback } from "react"
import { useModal } from "inkdrop"

const PublishedDialog = props => {
  const modal = useModal()
  const { Dialog } = inkdrop.components.classes

  const show = useCallback(() => {
    modal.show()
  })

  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      'publish-to-medium:show-dialog': show
    })
    return () => sub.dispose()
  }, [show])

  return (
    <Dialog {...modal.state} onBackdropClick={modal.close}>
      <Dialog.Title>Post Published</Dialog.Title>
      <Dialog.Content>Your post have been published to Medium, Have a great day!</Dialog.Content>
      <Dialog.Actions>
        <button className="ui button" onClick={modal.close}>
          Close
        </button>
      </Dialog.Actions>
    </Dialog>
  )
}

export default PublishedDialog
