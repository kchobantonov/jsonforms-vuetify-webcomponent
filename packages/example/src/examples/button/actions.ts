import type { ActionEvent } from '@chobantonov/jsonforms-vuetify-renderers';

const changeLang = (event: ActionEvent) => {
  if (event.context.appStore) {
    // demo app
    event.context.appStore.jsonforms.locale = event.params.lang;
  } else if (event.$el.getRootNode() instanceof ShadowRoot) {
    // web component
    const form = (event.$el.getRootNode() as ShadowRoot).host;
    if (form) {
      form.setAttribute('locale', event.params.lang);
    }
  }
};

// Function to create and show the dialog with a custom message
function showDialog(message: string) {
  const dialog = document.createElement('dialog');

  // Style for the dialog (added via JavaScript)
  dialog.style.padding = '20px';
  dialog.style.border = 'none';
  dialog.style.borderRadius = '12px';
  dialog.style.width = '350px';
  dialog.style.maxWidth = '90%';
  dialog.style.minHeight = '150px';
  dialog.style.textAlign = 'center';
  dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  dialog.style.fontFamily = 'Arial, sans-serif';
  dialog.style.backgroundColor = '#fff';
  dialog.style.overflow = 'hidden';
  dialog.style.margin = '0 auto';

  const messageElement = document.createElement('p');
  messageElement.textContent = message; // Set custom message
  messageElement.style.fontSize = '16px';
  messageElement.style.fontWeight = 'normal';
  messageElement.style.color = '#333';
  messageElement.style.marginBottom = '20px';

  dialog.appendChild(messageElement);

  const confirmButton = document.createElement('button');
  confirmButton.textContent = 'OK';
  confirmButton.style.padding = '10px 20px';
  confirmButton.style.fontSize = '16px';
  confirmButton.style.backgroundColor = '#007bff';
  confirmButton.style.color = '#fff';
  confirmButton.style.border = 'none';
  confirmButton.style.borderRadius = '6px';
  confirmButton.style.cursor = 'pointer';
  confirmButton.style.display = 'none'; // Hidden initially
  confirmButton.style.marginTop = '20px';

  // Add hover effect for the button
  confirmButton.addEventListener('mouseover', () => {
    confirmButton.style.backgroundColor = '#0056b3';
  });
  confirmButton.addEventListener('mouseout', () => {
    confirmButton.style.backgroundColor = '#007bff';
  });

  dialog.appendChild(confirmButton);

  // Add button container for centering (just in case)
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.appendChild(confirmButton);
  dialog.appendChild(buttonContainer);

  // Append the dialog to the body and show it
  document.body.appendChild(dialog);
  dialog.showModal();

  // Add event listener to handle closing the dialog when the button is clicked
  confirmButton.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  return {
    messageElement,
    confirmButton,
  };
}
function completeDialog(
  dialogMessage: HTMLParagraphElement,
  confirmButton: HTMLButtonElement,
  message: string,
) {
  dialogMessage.textContent = message;
  confirmButton.style.display = 'block'; // Show the confirm button
}

const submit = async (event: ActionEvent) => {
  const { messageElement, confirmButton } = showDialog(
    event.params.submittingMessage,
  );

  // Simulate a delay (e.g., waiting for a response or processing time)
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(
    event.jsonforms.core?.data
      ? `${JSON.stringify(event.jsonforms.core.data)}`
      : 'Your form is blank. No JSON data.',
  );
  // Update the dialog to indicate that the action is complete
  completeDialog(messageElement, confirmButton, event.params.submittedMessage);
};

export const onHandleAction = (event: ActionEvent) => {
  if (event.action === 'changeLang') {
    event.callback = changeLang;
  }
  if (event.action === 'simulateHttpSubmit') {
    event.callback = submit;
  }
};
