import { createDialogQueue } from 'rmwc';

const { alert, confirm, prompt, dialogs } = createDialogQueue();

export {
  alert,
  confirm,
  prompt,
  dialogs as dialogQueue
}